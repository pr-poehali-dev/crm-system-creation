export const API_ENDPOINTS = {
  clients: 'https://functions.poehali.dev/c3ce619a-2f5c-4408-845b-21d43e357f57',
  bookings: 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142',
  vehicles: 'https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f',
  partners: 'https://functions.poehali.dev/8e44dc53-fa19-4c90-ba93-e0c6f2d72d08',
  integrations: 'https://functions.poehali.dev/d6ed6f95-4807-4fc5-bd93-5e841b317394',
};

export async function apiFetch(url: string, options: RequestInit = {}) {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  const urlWithCache = `${url}${separator}t=${timestamp}`;
  
  const defaultHeaders = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  const mergedOptions: RequestInit = {
    ...options,
    cache: 'no-store',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(urlWithCache, mergedOptions);
}

export async function loadClients() {
  const response = await apiFetch(API_ENDPOINTS.clients);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadBookings() {
  const response = await apiFetch(API_ENDPOINTS.bookings);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadVehicles() {
  const response = await apiFetch(API_ENDPOINTS.vehicles);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadPartners() {
  const response = await apiFetch(API_ENDPOINTS.partners);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function saveClient(client: any, isUpdate: boolean = false) {
  const response = await apiFetch(API_ENDPOINTS.clients, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save client');
  }
  
  return response.json();
}

export async function deleteClient(id: number) {
  const response = await apiFetch(`${API_ENDPOINTS.clients}?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete client');
  }
  
  return response.json();
}

export async function saveBooking(booking: any, isUpdate: boolean = false) {
  const response = await apiFetch(API_ENDPOINTS.bookings, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save booking');
  }
  
  return response.json();
}

export async function deleteBooking(id: number) {
  const response = await apiFetch(`${API_ENDPOINTS.bookings}?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete booking');
  }
  
  return response.json();
}

export async function saveVehicle(vehicle: any, isUpdate: boolean = false) {
  const response = await apiFetch(API_ENDPOINTS.vehicles, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save vehicle');
  }
  
  return response.json();
}

export async function deleteVehicle(id: number) {
  const response = await apiFetch(`${API_ENDPOINTS.vehicles}?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete vehicle');
  }
  
  return response.json();
}

export async function savePartner(partner: any, isUpdate: boolean = false) {
  const response = await apiFetch(API_ENDPOINTS.partners, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(partner),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save partner');
  }
  
  return response.json();
}

export async function deletePartner(id: number) {
  const response = await apiFetch(`${API_ENDPOINTS.partners}?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete partner');
  }
  
  return response.json();
}
