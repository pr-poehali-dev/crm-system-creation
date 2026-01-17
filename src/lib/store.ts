import { create } from 'zustand';

interface Vehicle {
  id: number;
  model: string;
  license_plate: string;
  status: string;
  [key: string]: any;
}

interface Lead {
  id: number;
  lead_id: string;
  client_name: string;
  phone: string;
  status: string;
  [key: string]: any;
}

interface Partner {
  id: number;
  partner_id: string;
  company_name: string;
  type: string;
  [key: string]: any;
}

interface Payment {
  id: number;
  operation_id: string;
  amount: number;
  client_name: string;
  [key: string]: any;
}

interface Booking {
  id: number;
  booking_id: string;
  client_name: string;
  [key: string]: any;
}

interface CRMStore {
  vehicles: Vehicle[];
  leads: Lead[];
  partners: Partner[];
  payments: Payment[];
  bookings: Booking[];
  
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: number, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: number) => void;
  
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: number, updates: Partial<Lead>) => void;
  removeLead: (id: number) => void;
  
  setPartners: (partners: Partner[]) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (id: number, updates: Partial<Partner>) => void;
  removePartner: (id: number) => void;
  
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: number, updates: Partial<Payment>) => void;
  removePayment: (id: number) => void;
  
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: number, updates: Partial<Booking>) => void;
  removeBooking: (id: number) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  vehicles: [],
  leads: [],
  partners: [],
  payments: [],
  bookings: [],
  
  setVehicles: (vehicles) => set({ vehicles }),
  addVehicle: (vehicle) => set((state) => ({ 
    vehicles: [vehicle, ...state.vehicles] 
  })),
  updateVehicle: (id, updates) => set((state) => ({ 
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  removeVehicle: (id) => set((state) => ({ 
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),
  
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ 
    leads: [lead, ...state.leads] 
  })),
  updateLead: (id, updates) => set((state) => ({ 
    leads: state.leads.map(l => l.id === id ? { ...l, ...updates } : l)
  })),
  removeLead: (id) => set((state) => ({ 
    leads: state.leads.filter(l => l.id !== id)
  })),
  
  setPartners: (partners) => set({ partners }),
  addPartner: (partner) => set((state) => ({ 
    partners: [partner, ...state.partners] 
  })),
  updatePartner: (id, updates) => set((state) => ({ 
    partners: state.partners.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removePartner: (id) => set((state) => ({ 
    partners: state.partners.filter(p => p.id !== id)
  })),
  
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ 
    payments: [payment, ...state.payments] 
  })),
  updatePayment: (id, updates) => set((state) => ({ 
    payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removePayment: (id) => set((state) => ({ 
    payments: state.payments.filter(p => p.id !== id)
  })),
  
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ 
    bookings: [booking, ...state.bookings] 
  })),
  updateBooking: (id, updates) => set((state) => ({ 
    bookings: state.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  removeBooking: (id) => set((state) => ({ 
    bookings: state.bookings.filter(b => b.id !== id)
  })),
}));
