import { useState, useEffect, useCallback } from 'react';

interface CRMDataOptions {
  type: 'leads' | 'partners' | 'vehicle_handovers' | 'finances' | 'bookings' | 'vehicles' | 'clients' | 'requests';
  autoLoad?: boolean;
  vehicleId?: number;
  category?: string;
}

export const useCRMData = <T = any>(options: CRMDataOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = useCallback(() => {
    const VEHICLES_API = 'https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f';
    const BOOKINGS_API = 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142';
    
    const API_MAP: Record<string, string> = {
      leads: `${VEHICLES_API}?type=leads`,
      partners: `${VEHICLES_API}?type=partners`,
      vehicle_handovers: `${VEHICLES_API}?type=vehicle_handovers`,
      finances: `${VEHICLES_API}?type=finances`,
      bookings: BOOKINGS_API,
      vehicles: VEHICLES_API,
      clients: `${VEHICLES_API}?type=clients`,
      requests: `${VEHICLES_API}?type=requests`
    };

    let url = API_MAP[options.type] || '';
    
    if (options.vehicleId) {
      url += `&vehicle_id=${options.vehicleId}`;
    }
    
    if (options.category) {
      url += `&category=${options.category}`;
    }
    
    return url;
  }, [options.type, options.vehicleId, options.category]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const create = useCallback(async (item: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const newItem = await response.json();
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to create');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const update = useCallback(async (id: number | string, updates: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiUrl()}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, id })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const updated = await response.json();
      setData(prev => prev.map((item: any) => 
        item.id === id ? updated : item
      ));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getApiUrl()}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      setData(prev => prev.filter((item: any) => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [options.autoLoad, load]);

  return {
    data,
    loading,
    error,
    load,
    create,
    update,
    remove,
    refresh: load
  };
};