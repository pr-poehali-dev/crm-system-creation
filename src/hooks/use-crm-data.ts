import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';

export function useCRMClients(autoRefresh = true) {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.loadClients();
      setClients(data.clients || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (client: any, isUpdate: boolean = false) => {
    const result = await api.saveClient(client, isUpdate);
    await load();
    return result;
  }, [load]);

  const remove = useCallback(async (id: number) => {
    const result = await api.deleteClient(id);
    await load();
    return result;
  }, [load]);

  useEffect(() => {
    load();
    if (autoRefresh) {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [load, autoRefresh]);

  return { clients, isLoading, error, load, save, remove };
}

export function useCRMBookings(autoRefresh = true) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.loadBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (booking: any, isUpdate: boolean = false) => {
    const result = await api.saveBooking(booking, isUpdate);
    await load();
    return result;
  }, [load]);

  const remove = useCallback(async (id: number) => {
    const result = await api.deleteBooking(id);
    await load();
    return result;
  }, [load]);

  useEffect(() => {
    load();
    if (autoRefresh) {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [load, autoRefresh]);

  return { bookings, isLoading, error, load, save, remove };
}

export function useCRMVehicles(autoRefresh = true) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.loadVehicles();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (vehicle: any, isUpdate: boolean = false) => {
    const result = await api.saveVehicle(vehicle, isUpdate);
    await load();
    return result;
  }, [load]);

  const remove = useCallback(async (id: number) => {
    const result = await api.deleteVehicle(id);
    await load();
    return result;
  }, [load]);

  useEffect(() => {
    load();
    if (autoRefresh) {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [load, autoRefresh]);

  return { vehicles, isLoading, error, load, save, remove };
}

export function useCRMPartners(autoRefresh = true) {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.loadPartners();
      setPartners(data.partners || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading partners:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (partner: any, isUpdate: boolean = false) => {
    const result = await api.savePartner(partner, isUpdate);
    await load();
    return result;
  }, [load]);

  const remove = useCallback(async (id: number) => {
    const result = await api.deletePartner(id);
    await load();
    return result;
  }, [load]);

  useEffect(() => {
    load();
    if (autoRefresh) {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [load, autoRefresh]);

  return { partners, isLoading, error, load, save, remove };
}
