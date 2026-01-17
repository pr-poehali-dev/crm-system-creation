import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
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

  const fleet = [
    { id: 1, model: 'Mercedes S-Class', number: 'А001АА777', status: 'Свободен', location: 'Гараж №1', nextService: '23.02.2026' },
    { id: 2, model: 'BMW X5', number: 'В123ВВ777', status: 'В аренде', location: 'Клиент: Петров', nextService: '15.02.2026' },
    { id: 3, model: 'Audi A8', number: 'С456СС777', status: 'Обслуживание', location: 'СТО "АвтоЭксперт"', nextService: '20.01.2026' },
    { id: 4, model: 'Tesla Model S', number: 'Е789ЕЕ777', status: 'Забронирован', location: 'Гараж №2', nextService: '10.03.2026' },
  ];

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
          { id: 'requests', icon: 'ClipboardList', label: 'Заявки' },
          { id: 'fleet', icon: 'Car', label: 'Автопарк' },
          { id: 'services', icon: 'Wrench', label: 'Услуги' },
          { id: 'finance', icon: 'Wallet', label: 'Финансы' },
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
                    <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => setIsNewRequestOpen(false)}>
                      Создать заявку
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {activeSection === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <Card key={idx} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardDescription>{stat.label}</CardDescription>
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          stat.trend === 'up' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        )}>
                          <Icon name={stat.icon as any} size={20} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <Badge variant="outline" className={stat.trend === 'up' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}>
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="TrendingUp" size={24} className="text-primary" />
                      Выручка по услугам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { service: 'Аренда транспорта', revenue: '₽680K', percentage: 65 },
                        { service: 'Выездные услуги', revenue: '₽320K', percentage: 30 },
                        { service: 'Абонементы', revenue: '₽150K', percentage: 15 },
                        { service: 'Пакеты', revenue: '₽50K', percentage: 5 },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.service}</span>
                            <span className="text-muted-foreground">{item.revenue}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Target" size={24} className="text-secondary" />
                      Каналы заявок
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { channel: 'Сайт', count: 18, color: 'from-primary to-secondary' },
                        { channel: 'WhatsApp', count: 15, color: 'from-success to-info' },
                        { channel: 'Telegram', count: 8, color: 'from-info to-primary' },
                        { channel: 'Avito', count: 6, color: 'from-accent to-warning' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', item.color)} />
                            <span className="font-medium">{item.channel}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'requests' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
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
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить авто
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fleet.map((car) => (
                    <div key={car.id} className="p-5 rounded-lg bg-gradient-to-br from-sidebar/40 to-sidebar/20 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:scale-[1.02]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{car.model}</h3>
                          <p className="text-sm text-muted-foreground">{car.number}</p>
                        </div>
                        <Badge className={cn('border', getStatusColor(car.status))}>
                          {car.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="MapPin" size={16} />
                          <span>{car.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Wrench" size={16} />
                          <span>ТО: {car.nextService}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wrench" size={24} className="text-primary" />
                  Каталог услуг
                </CardTitle>
                <CardDescription>Управление услугами и ценообразованием</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Construction" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Раздел в разработке</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'finance' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wallet" size={24} className="text-primary" />
                  Финансовый учёт
                </CardTitle>
                <CardDescription>Оплаты, предоплаты, доплаты, гарантии</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Construction" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Раздел в разработке</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'settings' && (
            <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={24} className="text-primary" />
                  Настройки системы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Construction" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Раздел в разработке</p>
                </div>
              </CardContent>
            </Card>
          )}
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

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Icon name="Printer" size={18} className="mr-2" />
                      Печать
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Icon name="Edit" size={18} className="mr-2" />
                      Редактировать
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Check" size={18} className="mr-2" />
                      Изменить статус
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;