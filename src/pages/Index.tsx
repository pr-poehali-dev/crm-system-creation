import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCRMStore } from '@/lib/store';
import { useCRMBookings, useCRMVehicles } from '@/hooks/use-crm-data';
import { API_ENDPOINTS } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ServicesSection from '@/components/ServicesSection';
import FinanceSection from '@/components/FinanceSection';
import SettingsSection from '@/components/SettingsSection';
import CalendarSection from '@/components/CalendarSection';
import IntegrationsPage from '@/components/IntegrationsPage';
import LeadsSection from '@/components/LeadsSection';
import ClientsSection from '@/components/ClientsSection';
import LoginPage from '@/components/LoginPage';
import PartnersSection from '@/components/PartnersSection';
import LeadDetailForm from '@/components/LeadDetailForm';
import AddVehicleDialog from '@/components/AddVehicleDialog';
import VehicleChecklistDialog from '@/components/VehicleChecklistDialog';
import VehicleDetailDialog from '@/components/VehicleDetailDialog';
import MaintenanceStatusDialog from '@/components/MaintenanceStatusDialog';
import BookingDetailDialog from '@/components/BookingDetailDialog';
import VehicleHandoverDialog from '@/components/VehicleHandoverDialog';
import VehicleHandoverHistory from '@/components/VehicleHandoverHistory';
import BookingWizard from '@/components/BookingWizard';
import MobileNav from '@/components/MobileNav';
import DateClickCalendar from '@/components/DateClickCalendar';
import { Sidebar } from '@/components/index/Sidebar';
import { Header } from '@/components/index/Header';
import { DashboardCards } from '@/components/index/DashboardCards';
import { NewRequestDialog } from '@/components/index/NewRequestDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const USERS = {
  nikita: { name: 'Никита', role: 'Технический директор' },
  marina: { name: 'Марина', role: 'Коммерческий директор' },
}; 

const Index = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [checklistType, setChecklistType] = useState<'pickup' | 'return'>('pickup');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isVehicleDetailOpen, setIsVehicleDetailOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isHandoverHistoryOpen, setIsHandoverHistoryOpen] = useState(false);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeadDetailFormOpen, setIsLeadDetailFormOpen] = useState(false);
  const [clientDataFromLead, setClientDataFromLead] = useState<{ name: string; phone: string } | null>(null);
  const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newRequest, setNewRequest] = useState({
    client: '',
    phone: '',
    service: '',
    car: '',
    startDate: new Date(),
    endDate: new Date(),
    notes: '',
    days: 1,
    km: 0,
  });

  const [selectedServices, setSelectedServices] = useState<Array<{id: string; name: string; price: number; adjustedPrice: number}>>([]);

  const [requestCustomFields, setRequestCustomFields] = useState<Array<{id: string; name: string; type: string; value: any}>>([]);

  const addRequestCustomField = () => {
    setRequestCustomFields([...requestCustomFields, {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      value: ''
    }]);
  };

  const updateRequestCustomField = (id: string, key: string, value: any) => {
    setRequestCustomFields(requestCustomFields.map(f => f.id === id ? {...f, [key]: value} : f));
  };

  const removeRequestCustomField = (id: string) => {
    setRequestCustomFields(requestCustomFields.filter(f => f.id !== id));
  };

  const stats = [
    { label: 'Выручка за месяц', value: '₽1.2M', change: '+12%', trend: 'up', icon: 'TrendingUp' },
    { label: 'Активных заявок', value: '47', change: '+8', trend: 'up', icon: 'ClipboardList' },
    { label: 'Загрузка автопарка', value: '78%', change: '+5%', trend: 'up', icon: 'Car' },
    { label: 'Новых клиентов', value: '23', change: '-3', trend: 'down', icon: 'Users' },
  ];

  const services = [
    { id: 'wash', name: 'Выездная мойка', price: 2500, unit: 'услуга' },
    { id: 'rent', name: 'Аренда авто', price: 5000, unit: 'сутки', kmPrice: 15 },
    { id: 'detailing', name: 'Детейлинг', price: 12000, unit: 'услуга' },
    { id: 'concierge', name: 'Абонемент консьерж', price: 45000, unit: 'месяц' },
    { id: 'driver', name: 'Водитель с авто', price: 3000, unit: 'час' },
  ];

  const [requests, setRequests] = useState<any[]>([]);
  
  const { bookings, isLoading: isLoadingBookings, load: loadBookings } = useCRMBookings();

  const calculatePrice = () => {
    let total = 0;
    
    // Считаем стоимость выбранных услуг
    selectedServices.forEach(service => {
      total += service.adjustedPrice;
    });
    
    // Если выбрана аренда, добавляем расчёт по дням и км
    const rentService = selectedServices.find(s => s.id === 'rent');
    if (rentService && newRequest.service === 'rent') {
      const baseRentPrice = services.find(s => s.id === 'rent');
      if (baseRentPrice) {
        total += baseRentPrice.price * (newRequest.days - 1) + (baseRentPrice.kmPrice || 0) * newRequest.km;
      }
    }
    
    return total;
  };

  const { vehicles: fleet, isLoading: isLoadingFleet } = useCRMVehicles();
  const setFleet = useCRMStore((state) => state.setVehicles);

  useEffect(() => {
    if (fleet.length > 0) {
      setFleet(fleet);
    }
  }, [fleet, setFleet]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Новая': 'bg-info/20 text-info border-info/30',
      'В работе': 'bg-warning/20 text-warning border-warning/30',
      'Завершена': 'bg-success/20 text-success border-success/30',
      'Ожидает оплаты': 'bg-secondary/20 text-secondary border-secondary/30',
      'Свободен': 'bg-success/20 text-success border-success/30',
      'В аренде': 'bg-info/20 text-info border-info/30',
      'Забронирован': 'bg-warning/20 text-warning border-warning/30',
      'Обслуживание': 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('crm_user', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crm_user');
    toast({
      title: "Выход выполнен",
      description: "До встречи!",
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser && (savedUser === 'nikita' || savedUser === 'marina')) {
      setCurrentUser(savedUser);
    }
  }, []);

  const handleCreateBooking = async () => {
    const rentServiceData = selectedServices.find(s => s.id === 'rent');
    const bookingData = {
      client_name: newRequest.client,
      client_phone: newRequest.phone,
      vehicle_model: newRequest.car,
      start_date: newRequest.startDate.toISOString(),
      end_date: newRequest.endDate.toISOString(),
      status: 'Бронь',
      total_price: calculatePrice(),
      paid_amount: 0,
      deposit_amount: 0,
      services: selectedServices,
      rental_days: rentServiceData ? newRequest.days : null,
      rental_km: rentServiceData ? newRequest.km : null,
      rental_price_per_day: rentServiceData ? (rentServiceData.adjustedPrice / newRequest.days) : null,
      rental_price_per_km: rentServiceData ? (services.find(s => s.id === 'rent')?.kmPrice || 0) : null,
      notes: newRequest.notes,
      custom_fields: requestCustomFields.filter(f => f.name && f.value),
      payments: [],
      created_by: currentUser || 'unknown'
    };
    
    try {
      const response = await fetch(API_ENDPOINTS.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      await loadBookings();
      setIsDialogOpen(false);
      toast({
        title: "Бронь создана",
        description: `Новая бронь на сумму ₽${calculatePrice().toLocaleString()} успешно создана`,
      });
      setRequestCustomFields([]);
      setSelectedServices([]);
      setNewRequest({
        client: '',
        phone: '',
        service: '',
        car: '',
        startDate: new Date(),
        endDate: new Date(),
        notes: '',
        days: 1,
        km: 0,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать бронь",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const userData = USERS[currentUser as keyof typeof USERS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sidebar/30 mobile-container">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <MobileNav 
        activeSection={activeSection}
        onNavigate={setActiveSection}
        userName={userData.name}
        userRole={userData.role}
      />

      <main className="md:ml-20 mobile-main-content p-3 sm:p-4 md:p-8 pb-24">
        <div className="max-w-[1600px] mx-auto space-y-3 sm:space-y-4 md:space-y-8 animate-fade-in">
          <Header
            userName={userData.name}
            userRole={userData.role}
            onLogout={handleLogout}
            onNewBooking={() => setIsBookingWizardOpen(true)}
            onDateClick={() => {
              setSelectedDate(new Date());
              setIsDateCalendarOpen(true);
            }}
          />

          <NewRequestDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            newRequest={newRequest}
            setNewRequest={setNewRequest}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            requestCustomFields={requestCustomFields}
            addRequestCustomField={addRequestCustomField}
            updateRequestCustomField={updateRequestCustomField}
            removeRequestCustomField={removeRequestCustomField}
            services={services}
            fleet={fleet}
            calculatePrice={calculatePrice}
            onSubmit={handleCreateBooking}
          />

          {activeSection === 'dashboard' && (
            <div className="space-y-4 md:space-y-6">
              <DashboardCards bookings={bookings} onNavigate={setActiveSection} />
            </div>
          )}

          {activeSection === 'requests' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="ClipboardList" size={24} className="text-primary" />
                      Управление заявками
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => loadBookings()}
                        disabled={isLoadingBookings}
                      >
                        <Icon name={isLoadingBookings ? "Loader2" : "RefreshCw"} size={16} className={cn("mr-2", isLoadingBookings && "animate-spin")} />
                        Обновить
                      </Button>
                      <Tabs defaultValue="all" className="w-auto">
                        <TabsList>
                          <TabsTrigger value="all">Все</TabsTrigger>
                          <TabsTrigger value="new">Новые</TabsTrigger>
                          <TabsTrigger value="progress">В работе</TabsTrigger>
                          <TabsTrigger value="completed">Завершённые</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Поиск по клиенту, услуге или авто..." className="flex-1" />
                    <Button variant="outline">
                      <Icon name="SlidersHorizontal" size={18} className="mr-2" />
                      Фильтры
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Заявок пока нет</p>
                      <p className="text-xs mt-1">Создайте первую заявку через кнопку "Новая заявка"</p>
                    </div>
                  ) : bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsBookingDetailOpen(true);
                      }}
                      className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Клиент</div>
                            <div className="font-medium">{booking.client_name}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Тип</div>
                            <div className="font-medium">{booking.request_type === 'rent' ? 'Аренда' : 'Услуга'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Авто</div>
                            <div className="font-medium">{booking.vehicle_model || 'Не указано'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Даты</div>
                            <div className="font-medium text-xs">{new Date(booking.start_date).toLocaleDateString('ru-RU')}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={cn('border', getStatusColor(booking.status))}>
                              {booking.status}
                            </Badge>
                            <span className="text-lg font-bold text-primary">₽{booking.total_price?.toLocaleString('ru-RU') || 0}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="ChevronRight" size={20} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'clients' && (
            <ClientsSection 
              initialClientData={clientDataFromLead || undefined}
              autoOpenAdd={!!clientDataFromLead}
            />
          )}

          {activeSection === 'fleet' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Car" size={24} className="text-primary" />
                    Автопарк
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={async () => {
                        if (confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ автомобили из базы. Продолжить?')) {
                          try {
                            const response = await fetch('https://functions.poehali.dev/c1620ea4-c9a8-4c0e-bb5b-5820d4042dfa?action=clear', {
                              method: 'DELETE'
                            });
                            const data = await response.json();
                            if (data.success) {
                              toast({
                                title: "Автопарк очищен",
                                description: data.message
                              });
                              setFleet([]);
                            }
                          } catch (error) {
                            toast({
                              title: "Ошибка",
                              description: "Не удалось очистить автопарк",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    >
                      <Icon name="Trash2" size={18} className="mr-2" />
                      Очистить все
                    </Button>
                    <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => setIsAddVehicleOpen(true)}>
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить авто
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {isLoadingFleet ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      Загрузка автопарка...
                    </div>
                  ) : fleet.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      Нет автомобилей в автопарке
                    </div>
                  ) : fleet.map((car) => (
                    <div 
                      key={car.id} 
                      className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-sidebar/40 to-sidebar/20 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => {
                        setSelectedVehicle(car);
                        setIsVehicleDetailOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold">{car.model}</h3>
                          <p className="text-sm text-muted-foreground">{car.license_plate}</p>
                        </div>
                        <Badge className={cn('border', getStatusColor(car.status))}>
                          {car.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="MapPin" size={16} />
                          <span>{car.current_location || 'Не указано'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Wrench" size={16} />
                          <span>ТО: {car.next_service_date || 'Не указано'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChecklistType('pickup');
                            setIsChecklistOpen(true);
                          }}
                        >
                          <Icon name="ClipboardCheck" size={14} className="mr-1" />
                          Выдача
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChecklistType('return');
                            setIsChecklistOpen(true);
                          }}
                        >
                          <Icon name="ClipboardList" size={14} className="mr-1" />
                          Приёмка
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(car);
                            setIsHandoverHistoryOpen(true);
                          }}
                        >
                          <Icon name="History" size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Удалить ${car.model} (${car.license_plate})?`)) {
                              try {
                                const response = await fetch(`https://functions.poehali.dev/c1620ea4-c9a8-4c0e-bb5b-5820d4042dfa?action=delete&id=${car.id}`, {
                                  method: 'DELETE'
                                });
                                const data = await response.json();
                                if (data.success) {
                                  toast({
                                    title: "Автомобиль удалён",
                                    description: data.message
                                  });
                                  setFleet(fleet.filter(v => v.id !== car.id));
                                } else {
                                  toast({
                                    title: "Ошибка",
                                    description: data.error || "Не удалось удалить автомобиль",
                                    variant: "destructive"
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Ошибка",
                                  description: "Не удалось удалить автомобиль",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'leads' && (
            <LeadsSection 
              onConvertToClient={(leadData) => {
                setClientDataFromLead(leadData);
                setActiveSection('clients');
              }}
              onOpenDetailForm={() => setIsLeadDetailFormOpen(true)}
            />
          )}

          {activeSection === 'calendar' && (
            <CalendarSection 
              onOpenBookingWizard={() => setIsBookingWizardOpen(true)}
            />
          )}

          {activeSection === 'services' && <ServicesSection />}

          {activeSection === 'finance' && <FinanceSection />}

          {activeSection === 'settings' && <SettingsSection />}
          
          {activeSection === 'integrations' && <IntegrationsPage />}
        </div>
      </main>

      <AddVehicleDialog 
        open={isAddVehicleOpen} 
        onOpenChange={(open) => {
          setIsAddVehicleOpen(open);
          if (!open) {
            const loadFleet = async () => {
              try {
                const response = await fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f');
                const data = await response.json();
                setFleet(data.vehicles || []);
              } catch (error) {
                console.error('Error reloading fleet:', error);
              }
            };
            loadFleet();
          }
        }} 
      />
      
      <VehicleChecklistDialog 
        open={isChecklistOpen} 
        onOpenChange={setIsChecklistOpen}
        checklistType={checklistType}
      />
      
      <VehicleDetailDialog
        open={isVehicleDetailOpen}
        onOpenChange={setIsVehicleDetailOpen}
        vehicle={selectedVehicle}
        onShowMaintenance={() => {
          setIsVehicleDetailOpen(false);
          setIsMaintenanceOpen(true);
        }}
        onShowInsurance={() => {
          toast({ title: "Страховка", description: "Раздел в разработке" });
        }}
      />
      
      <MaintenanceStatusDialog
        open={isMaintenanceOpen}
        onOpenChange={setIsMaintenanceOpen}
        vehicle={selectedVehicle}
      />
      
      <BookingDetailDialog
        open={isBookingDetailOpen}
        onOpenChange={setIsBookingDetailOpen}
        booking={selectedBooking}
        onHandover={() => {
          setIsBookingDetailOpen(false);
          setIsHandoverOpen(true);
        }}
      />
      
      <VehicleHandoverDialog
        open={isHandoverOpen}
        onOpenChange={setIsHandoverOpen}
        vehicle={selectedVehicle}
        booking={selectedBooking}
      />

      <BookingWizard
        open={isBookingWizardOpen}
        onOpenChange={setIsBookingWizardOpen}
        vehicle={selectedVehicle}
        startDate={newRequest.startDate}
        endDate={newRequest.endDate}
        onBookingCreated={loadBookings}
      />

      <LeadDetailForm
        open={isLeadDetailFormOpen}
        onOpenChange={setIsLeadDetailFormOpen}
        onSave={(leadData) => {
          console.log('Lead saved:', leadData);
          toast({
            title: 'Лид сохранён',
            description: 'Данные успешно добавлены в систему',
          });
        }}
      />

      {activeSection === 'partners' && <PartnersSection />}

      <DateClickCalendar
        open={isDateCalendarOpen}
        onOpenChange={setIsDateCalendarOpen}
        date={selectedDate}
        bookings={bookings}
        onNavigateToCalendar={() => {
          setIsDateCalendarOpen(false);
          setActiveSection('calendar');
        }}
      />

      <VehicleHandoverHistory
        open={isHandoverHistoryOpen}
        onOpenChange={setIsHandoverHistoryOpen}
        vehicle={selectedVehicle}
      />
    </div>
  );
};

export default Index;