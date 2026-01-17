import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ServicesSection from '@/components/ServicesSection';
import FinanceSection from '@/components/FinanceSection';
import SettingsSection from '@/components/SettingsSection';
import CalendarSection from '@/components/CalendarSection';
import IntegrationsPage from '@/components/IntegrationsPage';
import LeadsSection from '@/components/LeadsSection';
import AddVehicleDialog from '@/components/AddVehicleDialog';
import VehicleChecklistDialog from '@/components/VehicleChecklistDialog';
import VehicleDetailDialog from '@/components/VehicleDetailDialog';
import MaintenanceStatusDialog from '@/components/MaintenanceStatusDialog';
import BookingDetailDialog from '@/components/BookingDetailDialog';
import VehicleHandoverDialog from '@/components/VehicleHandoverDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const Index = () => {
  const { toast } = useToast();
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

  const requests = [
    { id: 1, client: 'Алексей Петров', phone: '+7 (999) 123-45-67', service: 'Выездная мойка', car: 'BMW X5', status: 'В работе', price: '₽5,500', time: '14:30', created: '17.01.2026', address: 'ул. Ленина, 25', notes: 'Полировка кузова', history: [{date: '17.01.2026 14:00', action: 'Заявка создана', user: 'Система'}, {date: '17.01.2026 14:30', action: 'Взята в работу', user: 'Иванов И.'}] },
    { id: 2, client: 'Мария Иванова', phone: '+7 (999) 234-56-78', service: 'Аренда авто', car: 'Mercedes S-Class', status: 'Новая', price: '₽18,000', time: '15:00', created: '17.01.2026', address: '', notes: '3 дня, 150км', history: [{date: '17.01.2026 15:00', action: 'Заявка создана', user: 'Система'}] },
    { id: 3, client: 'ООО "ТехноСтрой"', phone: '+7 (999) 345-67-89', service: 'Абонемент консьерж', car: '—', status: 'Ожидает оплаты', price: '₽45,000', time: '15:30', created: '17.01.2026', address: '', notes: 'Корпоративный пакет', history: [{date: '17.01.2026 15:30', action: 'Заявка создана', user: 'Петрова А.'}, {date: '17.01.2026 16:00', action: 'Выставлен счёт', user: 'Система'}] },
    { id: 4, client: 'Дмитрий Соколов', phone: '+7 (999) 456-78-90', service: 'Детейлинг', car: 'Audi A8', status: 'Завершена', price: '₽12,000', time: '13:00', created: '17.01.2026', address: 'СТО №3', notes: 'Химчистка + полировка', history: [{date: '17.01.2026 10:00', action: 'Заявка создана', user: 'Система'}, {date: '17.01.2026 10:30', action: 'Взята в работу', user: 'Сидоров П.'}, {date: '17.01.2026 13:00', action: 'Завершена', user: 'Сидоров П.'}] },
  ];

  const calculatePrice = () => {
    const service = services.find(s => s.id === newRequest.service);
    if (!service) return 0;
    
    if (service.id === 'rent') {
      return service.price * newRequest.days + (service.kmPrice || 0) * newRequest.km;
    }
    return service.price;
  };

  const [fleet, setFleet] = useState<any[]>([]);
  const [isLoadingFleet, setIsLoadingFleet] = useState(true);

  useEffect(() => {
    const loadFleet = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f');
        const data = await response.json();
        setFleet(data.vehicles || []);
      } catch (error) {
        console.error('Error loading fleet:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить автопарк",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFleet(false);
      }
    };

    loadFleet();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sidebar/30">
      <aside className="fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 space-y-8 z-50">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          РФ
        </div>
        
        {[
          { id: 'dashboard', icon: 'LayoutDashboard', label: 'Дашборд' },
          { id: 'leads', icon: 'Zap', label: 'Лиды' },
          { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
          { id: 'requests', icon: 'ClipboardList', label: 'Заявки' },
          { id: 'clients', icon: 'Users', label: 'Клиенты' },
          { id: 'fleet', icon: 'Car', label: 'Автопарк' },
          { id: 'services', icon: 'Wrench', label: 'Услуги' },
          { id: 'finance', icon: 'Wallet', label: 'Финансы' },
          { id: 'integrations', icon: 'Plug', label: 'Интеграции' },
          { id: 'settings', icon: 'Settings', label: 'Настройки' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative',
              activeSection === item.id
                ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/50'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
            )}
          >
            <Icon name={item.icon as any} size={22} />
            <span className="absolute left-20 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-border">
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      <main className="ml-20 p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CRM Русская Фантазия
              </h1>
              <p className="text-muted-foreground mt-1">Управление заявками и автопарком</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <Icon name="Calendar" size={16} className="mr-2" />
                17 января 2026
              </Badge>
              <Button variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
              <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Новая заявка
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Создание новой заявки</DialogTitle>
                    <DialogDescription>Заполните данные для формирования заявки с автоматическим расчётом стоимости</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client">Клиент</Label>
                        <Input 
                          id="client" 
                          placeholder="ФИО или название компании"
                          value={newRequest.client}
                          onChange={(e) => setNewRequest({...newRequest, client: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input 
                          id="phone" 
                          placeholder="+7 (999) 123-45-67"
                          value={newRequest.phone}
                          onChange={(e) => setNewRequest({...newRequest, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Услуга</Label>
                      <Select value={newRequest.service} onValueChange={(val) => setNewRequest({...newRequest, service: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите услугу" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — ₽{s.price.toLocaleString()} / {s.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newRequest.service === 'rent' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="car">Автомобиль</Label>
                          <Select value={newRequest.car} onValueChange={(val) => setNewRequest({...newRequest, car: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите авто" />
                            </SelectTrigger>
                            <SelectContent>
                              {fleet.filter(c => c.status === 'Свободен').map(c => (
                                <SelectItem key={c.id} value={c.model}>
                                  {c.model} ({c.number})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="days">Количество суток</Label>
                            <Input 
                              id="days" 
                              type="number" 
                              min="1"
                              value={newRequest.days}
                              onChange={(e) => setNewRequest({...newRequest, days: parseInt(e.target.value) || 1})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="km">Километраж</Label>
                            <Input 
                              id="km" 
                              type="number" 
                              min="0"
                              placeholder="км"
                              value={newRequest.km}
                              onChange={(e) => setNewRequest({...newRequest, km: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Примечания</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Дополнительная информация..."
                        value={newRequest.notes}
                        onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                        rows={3}
                      />
                    </div>

                    {newRequest.service && (
                      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Расчёт стоимости</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {newRequest.service === 'rent' && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Аренда ({newRequest.days} сут × ₽5,000)</span>
                                  <span className="font-medium">₽{(5000 * newRequest.days).toLocaleString()}</span>
                                </div>
                                {newRequest.km > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span>Пробег ({newRequest.km} км × ₽15)</span>
                                    <span className="font-medium">₽{(15 * newRequest.km).toLocaleString()}</span>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                              <span>Итого:</span>
                              <span className="text-primary">₽{calculatePrice().toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>Отмена</Button>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary" 
                      onClick={() => {
                        setIsNewRequestOpen(false);
                        toast({
                          title: "Заявка создана",
                          description: `Новая заявка на сумму ₽${calculatePrice().toLocaleString()} успешно создана`,
                        });
                      }}
                    >
                      Создать заявку
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 animate-scale-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="Edit" size={20} className="text-purple-500" />
                        <CardTitle className="text-lg">Вишлист</CardTitle>
                      </div>
                      <Icon name="ChevronLeft" size={20} className="text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">На сумму 9 000 руб (1)</div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-600 text-white">7 000</Badge>
                          <span className="text-xs text-muted-foreground">300 км</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">Клиент</div>
                          <div className="text-xs text-muted-foreground">+79084431152 → Краснодар</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 animate-scale-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={20} className="text-orange-500" />
                        <CardTitle className="text-lg">Заявки</CardTitle>
                      </div>
                      <Icon name="ChevronLeft" size={20} className="text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">На сумму 152 000 руб (3)</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-red-600 text-white">40 000</Badge>
                          <Badge variant="secondary" className="text-xs">М464КУ193</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Клецов Иван → Краснодар</div>
                          <div className="text-xs text-muted-foreground">06.02.2026 13:00 — Офис</div>
                          <div className="text-xs text-muted-foreground">10.02.2026 20:00 — Офис</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-red-600 text-white">34 000</Badge>
                          <Badge variant="secondary" className="text-xs">М464КУ193</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Сартсев Кадикис → Краснодар</div>
                          <div className="text-xs text-muted-foreground">06.02.2026 20:00 — Офис</div>
                          <div className="text-xs text-muted-foreground">10.02.2026 20:00 — Офис</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-orange-600 text-white">108 000</Badge>
                          <Badge variant="secondary" className="text-xs">О008ВХ323</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Пылкиков Дмитрий → Санкт-Петербург</div>
                          <div className="text-xs text-muted-foreground">22.02.2026 10:00 — Офис</div>
                          <div className="text-xs text-muted-foreground">08.03.2026 10:00 — Офис</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 animate-scale-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={20} className="text-blue-500" />
                        <CardTitle className="text-lg">Брони</CardTitle>
                      </div>
                      <Icon name="ChevronLeft" size={20} className="text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">На сумму 792 000 руб (13)</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-blue-600 text-white">53 200</Badge>
                          <Badge variant="secondary" className="text-xs">О008ВХ323</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Быков Александр → Санкт-Петербург</div>
                          <div className="text-xs text-muted-foreground">22.01.2026 12:00 — Доставка</div>
                        </div>
                      </div>
                      <div 
                        className="p-3 rounded-lg bg-background/80 border border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => {
                          setSelectedBooking({
                            id: '38ac8899',
                            client: 'Шлейгер Дмитрий',
                            phone: '+7 (913) 531 12 12',
                            car: 'О304СВ193',
                            startDate: '19.01.2026 15:00',
                            endDate: '21.01.2026 15:00',
                            notes: 'Переезд семьи из Москвы в Краснодар'
                          });
                          setIsBookingDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-blue-600 text-white">42 000</Badge>
                          <Badge variant="secondary" className="text-xs">О304СВ193</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Шлейгер Дмитрий → Москва</div>
                          <div className="text-xs text-muted-foreground">19.01.2026 15:00 — Офис</div>
                          <div className="text-xs text-muted-foreground">21.01.2026 15:00 — Офис</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 animate-scale-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="Car" size={20} className="text-green-500" />
                        <CardTitle className="text-lg">В аренде</CardTitle>
                      </div>
                      <Icon name="ChevronLeft" size={20} className="text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">На сумму -60 500 руб (6)</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-green-600 text-white">88 000</Badge>
                          <Badge variant="secondary" className="text-xs">А218ЕТ550</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Трушкин Илья → Москва</div>
                          <div className="text-xs text-muted-foreground">07.01.2026 20:00 — Офис</div>
                          <div className="text-xs text-muted-foreground">18.01.2026 20:00 — Офис</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/80 border border-border/50 relative">
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs">Просрочка!</Badge>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-green-600 text-white">48 000</Badge>
                          <Badge variant="secondary" className="text-xs">Р828ТУ193</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Замятин Дмитрий → Москва</div>
                          <div className="text-xs text-muted-foreground">13.01.2026 20:00 — Доставка</div>
                          <div className="text-xs text-muted-foreground">18.01.2026 20:00 — Доставка</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-orange-100/30 border-orange-500/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertCircle" size={20} className="text-orange-600" />
                      <CardTitle className="text-lg text-orange-900">Истекает страховка</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Н692АН126', 'В118ВС777', 'А194ЕЕ193', 'В118ВС777', 'А218ЕТ550', 'Н692АН126'].map((num, idx) => (
                        <Badge key={idx} variant="destructive" className="mr-2">{num}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-100/30 border-red-500/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertTriangle" size={20} className="text-red-600" />
                      <CardTitle className="text-lg text-red-900">Необходимо обслуживание</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Н692АН126', 'Н692АН126', 'Х776ТС193', 'Р828ТУ193', 'В118ВС777', 'А194ЕЕ193', 'В118ВС777', 'А218ЕТ550', 'Н692АН126', 'Р828ТУ193', 'В118ВС777'].map((num, idx) => (
                        <Badge key={idx} className="mr-2 bg-red-600 text-white">{num}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                    <Tabs defaultValue="all" className="w-auto">
                      <TabsList>
                        <TabsTrigger value="all">Все</TabsTrigger>
                        <TabsTrigger value="new">Новые</TabsTrigger>
                        <TabsTrigger value="progress">В работе</TabsTrigger>
                        <TabsTrigger value="completed">Завершённые</TabsTrigger>
                      </TabsList>
                    </Tabs>
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
                  {requests.map((req) => (
                    <div 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req.id)}
                      className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Клиент</div>
                            <div className="font-medium">{req.client}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Услуга</div>
                            <div className="font-medium">{req.service}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Авто</div>
                            <div className="font-medium">{req.car}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Время</div>
                            <div className="font-medium">{req.time}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={cn('border', getStatusColor(req.status))}>
                              {req.status}
                            </Badge>
                            <span className="text-lg font-bold text-primary">{req.price}</span>
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
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Users" size={24} className="text-primary" />
                    База клиентов
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Поиск по имени или телефону..." className="w-80" />
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить клиента
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Алексей Петров', phone: '+7 (999) 123-45-67', email: 'petrov@mail.ru', balance: 0, orders: 3 },
                    { id: 2, name: 'Мария Иванова', phone: '+7 (999) 234-56-78', email: 'ivanova@mail.ru', balance: -2250, orders: 1 },
                    { id: 3, name: 'ООО "ТехноСтрой"', phone: '+7 (999) 345-67-89', email: 'info@tehnostroy.ru', balance: 45000, orders: 5 },
                    { id: 4, name: 'Дмитрий Соколов', phone: '+7 (999) 456-78-90', email: 'sokolov@mail.ru', balance: 0, orders: 2 },
                    { id: 5, name: 'Анна Сидорова', phone: '+7 (999) 567-89-01', email: 'sidorova@mail.ru', balance: 5000, orders: 4 },
                  ].map((client) => (
                    <div key={client.id} className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Клиент</div>
                              <div className="font-medium">{client.name}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Телефон / Email</div>
                              <div className="font-medium text-sm">{client.phone}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Заказов</div>
                              <div className="font-medium">{client.orders}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Баланс</div>
                              <div className={cn('font-bold text-lg', client.balance >= 0 ? 'text-success' : 'text-destructive')}>
                                {client.balance >= 0 ? '+' : ''}₽{client.balance.toLocaleString()}
                              </div>
                            </div>
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

          {activeSection === 'fleet' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Car" size={24} className="text-primary" />
                    Автопарк
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Icon name="Filter" size={18} className="mr-2" />
                      Фильтр
                    </Button>
                    <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => setIsAddVehicleOpen(true)}>
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить авто
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="p-5 rounded-lg bg-gradient-to-br from-sidebar/40 to-sidebar/20 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => {
                        setSelectedVehicle(car);
                        setIsVehicleDetailOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{car.model}</h3>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'leads' && <LeadsSection />}

          {activeSection === 'calendar' && <CalendarSection />}

          {activeSection === 'services' && <ServicesSection />}

          {activeSection === 'finance' && <FinanceSection />}

          {activeSection === 'settings' && <SettingsSection />}
          
          {activeSection === 'integrations' && <IntegrationsPage />}
        </div>
      </main>

      <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (() => {
            const req = requests.find(r => r.id === selectedRequest);
            if (!req) return null;
            
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl">Заявка #{req.id}</DialogTitle>
                      <DialogDescription>Создана {req.created}</DialogDescription>
                    </div>
                    <Badge className={cn('border text-sm px-3 py-1', getStatusColor(req.status))}>
                      {req.status}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon name="User" size={20} />
                        Информация о клиенте
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Клиент</div>
                        <div className="font-medium">{req.client}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Телефон</div>
                        <div className="font-medium">{req.phone}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon name="Briefcase" size={20} />
                        Детали заявки
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Услуга</div>
                          <div className="font-medium">{req.service}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Автомобиль</div>
                          <div className="font-medium">{req.car}</div>
                        </div>
                      </div>
                      {req.address && (
                        <div>
                          <div className="text-sm text-muted-foreground">Адрес</div>
                          <div className="font-medium">{req.address}</div>
                        </div>
                      )}
                      {req.notes && (
                        <div>
                          <div className="text-sm text-muted-foreground">Примечания</div>
                          <div className="font-medium text-muted-foreground">{req.notes}</div>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium">Стоимость</span>
                          <span className="text-2xl font-bold text-primary">{req.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon name="History" size={20} />
                        История изменений
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {req.history.map((h, idx) => (
                          <div key={idx} className="flex gap-3 pb-3 border-b last:border-0">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1">
                              <div className="font-medium">{h.action}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Icon name="Clock" size={14} />
                                {h.date}
                                <span>•</span>
                                <Icon name="User" size={14} />
                                {h.user}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {req.status === 'Новая' && (
                        <Button 
                          className="w-full bg-gradient-to-r from-warning to-warning/80" 
                          size="lg"
                          onClick={() => {
                            toast({
                              title: "Заявка взята в работу",
                              description: `Заявка #${req.id} переведена в статус "В работе"`,
                            });
                          }}
                        >
                          <Icon name="Play" size={18} className="mr-2" />
                          Взять в работу
                        </Button>
                      )}
                      {req.status === 'В работе' && (
                        <>
                          <Button 
                            className="w-full bg-gradient-to-r from-success to-success/80" 
                            size="lg"
                            onClick={() => {
                              toast({
                                title: "Заявка завершена",
                                description: `Заявка #${req.id} успешно завершена`,
                              });
                            }}
                          >
                            <Icon name="CheckCircle" size={18} className="mr-2" />
                            Завершить заявку
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              toast({
                                title: "Оплата принята",
                                description: `Платёж по заявке #${req.id} зарегистрирован`,
                              });
                            }}
                          >
                            <Icon name="DollarSign" size={18} className="mr-2" />
                            Принять оплату
                          </Button>
                        </>
                      )}
                      {req.status === 'Ожидает оплаты' && (
                        <Button 
                          className="w-full bg-gradient-to-r from-info to-info/80" 
                          size="lg"
                          onClick={() => {
                            toast({
                              title: "Оплата подтверждена",
                              description: `Оплата по заявке #${req.id} подтверждена`,
                            });
                          }}
                        >
                          <Icon name="Wallet" size={18} className="mr-2" />
                          Подтвердить оплату
                        </Button>
                      )}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <Icon name="Printer" size={16} className="mr-1" />
                          Печать
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Править
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Send" size={16} className="mr-1" />
                          Отправить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default Index;