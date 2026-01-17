import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCRMStore } from '@/lib/store';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface VehicleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onShowMaintenance?: () => void;
  onShowInsurance?: () => void;
}

export const VehicleDetailDialog = ({ 
  open, 
  onOpenChange, 
  vehicle,
  onShowMaintenance,
  onShowInsurance
}: VehicleDetailDialogProps) => {
  const { toast } = useToast();
  const updateVehicle = useCRMStore((state) => state.updateVehicle);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState(vehicle || {});

  useEffect(() => {
    if (vehicle) {
      setEditedVehicle(vehicle);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const bookings = [
    { id: 1, client: 'Амелюшко Артур', from: 'Москва', to: 'Краснодар', startDate: '20.08.2026 10:00', endDate: '31.08.2026 10:00', status: '-86 300', badge: 'green' },
    { id: 2, client: 'Братунов Сергей', from: 'Москва', to: 'Краснодар', startDate: '11.03.2026 16:00', endDate: '23.03.2026 16:00', status: '-79 200', badge: 'blue' },
    { id: 3, client: 'Кузнецова Анастасия', from: 'Москва', to: 'Краснодар', startDate: '30.01.2026 20:00', endDate: '05.02.2026 10:00', status: '-82 000', badge: 'blue' },
  ];

  const maintenanceHistory = [
    { item: 'Антифриз', lastOdometer: 322199, lastDate: '01.09.2025', nextOdometer: 27373, nextDate: null },
    { item: 'Генератор, обслуживание', lastOdometer: 1, lastDate: null, nextOdometer: -254825, nextDate: null },
    { item: 'Жидкость тормозная', lastOdometer: 332633, lastDate: '05.10.2025', nextOdometer: 37807, nextDate: null },
    { item: 'Колодки тормозные задние', lastOdometer: 303550, lastDate: '30.06.2025', nextOdometer: 8724, nextDate: null },
    { item: 'Колодки тормозные передние', lastOdometer: 312677, lastDate: '31.07.2025', nextOdometer: 17851, nextDate: null },
    { item: 'Масло в АКПП', lastOdometer: 322199, lastDate: '01.09.2025', nextOdometer: 27373, nextDate: null },
    { item: 'Масло в заднем дифференциале', lastOdometer: 312677, lastDate: '31.07.2025', nextOdometer: 57851, nextDate: null },
    { item: 'Масло моторное', lastOdometer: 353426, lastDate: '10.01.2026', nextOdometer: 8600, nextDate: null },
    { item: 'Ремень/Цепь ГРМ', lastOdometer: 1, lastDate: '31.05.2024', nextOdometer: -154825, nextDate: null },
    { item: 'Фильтр воздушный', lastOdometer: 353426, lastDate: '10.01.2026', nextOdometer: 8600, nextDate: null },
    { item: 'Фильтр масляный', lastOdometer: 353426, lastDate: '10.01.2026', nextOdometer: 8600, nextDate: null },
    { item: 'Фильтр салона', lastOdometer: 353426, lastDate: '10.01.2026', nextOdometer: 8600, nextDate: null },
    { item: 'Фильтр топливный', lastOdometer: 342181, lastDate: '23.11.2025', nextOdometer: 7355, nextDate: null },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'Зелёный') return 'bg-green-500 text-white';
    if (status === 'Антифриз') return 'bg-green-500 text-white';
    return 'bg-gray-400 text-white';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon name="Car" size={20} className="text-primary sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg">Авто {vehicle.license_plate}</span>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => {
                    setIsEditing(false);
                    setEditedVehicle(vehicle);
                  }}>
                    <Icon name="X" size={14} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Отмена</span>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary" onClick={async () => {
                    try {
                      const response = await fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editedVehicle)
                      });
                      if (response.ok) {
                        updateVehicle(editedVehicle.id, editedVehicle);
                        toast({ title: "✅ Сохранено", description: "Данные автомобиля обновлены мгновенно!" });
                        setIsEditing(false);
                        onOpenChange(false);
                      } else {
                        throw new Error('Failed to update vehicle');
                      }
                    } catch (error) {
                      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
                    }
                  }}>
                    <Icon name="Save" size={14} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Сохранить</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Icon name="Edit" size={14} className="sm:mr-2" />
                    <span className="hidden sm:inline ml-2">Редактировать</span>
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onShowInsurance}>
                    <Icon name="Shield" size={16} className="mr-2" />
                    Страховка
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onShowMaintenance}>
                    <Icon name="Wrench" size={16} className="mr-2" />
                    Статус ТО
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Общая информация</TabsTrigger>
            <TabsTrigger value="bookings">Брони</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Редактирование данных автомобиля</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label>Марка и модель</Label>
                      <Input value={editedVehicle.model} onChange={(e) => setEditedVehicle({...editedVehicle, model: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Гос. номер</Label>
                      <Input value={editedVehicle.license_plate} onChange={(e) => setEditedVehicle({...editedVehicle, license_plate: e.target.value.toUpperCase()})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">VIN</Label>
                      <Input value={editedVehicle.vin || ''} onChange={(e) => setEditedVehicle({...editedVehicle, vin: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Год</Label>
                      <Input type="number" value={editedVehicle.year || ''} onChange={(e) => setEditedVehicle({...editedVehicle, year: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Цвет</Label>
                      <Input value={editedVehicle.color || ''} onChange={(e) => setEditedVehicle({...editedVehicle, color: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Статус</Label>
                      <Select value={editedVehicle.status} onValueChange={(val) => setEditedVehicle({...editedVehicle, status: val})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Свободен">Свободен</SelectItem>
                          <SelectItem value="В аренде">В аренде</SelectItem>
                          <SelectItem value="Обслуживание">Обслуживание</SelectItem>
                          <SelectItem value="Неисправен">Неисправен</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Местоположение</Label>
                      <Input value={editedVehicle.current_location} onChange={(e) => setEditedVehicle({...editedVehicle, current_location: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Текущий пробег (км)</Label>
                      <Input type="number" value={editedVehicle.current_km} onChange={(e) => setEditedVehicle({...editedVehicle, current_km: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Последнее ТО (дата)</Label>
                      <Input type="date" value={editedVehicle.last_service_date} onChange={(e) => setEditedVehicle({...editedVehicle, last_service_date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Последнее ТО (км)</Label>
                      <Input type="number" value={editedVehicle.last_service_km} onChange={(e) => setEditedVehicle({...editedVehicle, last_service_km: parseInt(e.target.value)})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Следующее ТО (дата)</Label>
                      <Input type="date" value={editedVehicle.next_service_date} onChange={(e) => setEditedVehicle({...editedVehicle, next_service_date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Следующее ТО (км)</Label>
                      <Input type="number" value={editedVehicle.next_service_km} onChange={(e) => setEditedVehicle({...editedVehicle, next_service_km: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Мест</Label>
                      <Input type="number" value={editedVehicle.seats} onChange={(e) => setEditedVehicle({...editedVehicle, seats: parseInt(e.target.value)})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ОСАГО (срок)</Label>
                      <Input type="date" value={editedVehicle.insurance_expires} onChange={(e) => setEditedVehicle({...editedVehicle, insurance_expires: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Номер ОСАГО</Label>
                      <Input value={editedVehicle.osago_number} onChange={(e) => setEditedVehicle({...editedVehicle, osago_number: e.target.value.toUpperCase()})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Техосмотр (срок)</Label>
                      <Input type="date" value={editedVehicle.tech_inspection_expires} onChange={(e) => setEditedVehicle({...editedVehicle, tech_inspection_expires: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Номер КАСКО</Label>
                      <Input value={editedVehicle.kasko_number} onChange={(e) => setEditedVehicle({...editedVehicle, kasko_number: e.target.value.toUpperCase()})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Цена аренды (₽/сутки)</Label>
                      <Input type="number" value={editedVehicle.rental_price_per_day} onChange={(e) => setEditedVehicle({...editedVehicle, rental_price_per_day: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Цена за км (₽/км)</Label>
                      <Input type="number" value={editedVehicle.rental_price_per_km} onChange={(e) => setEditedVehicle({...editedVehicle, rental_price_per_km: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Стоимость субаренды (₽/сутки)</Label>
                      <Input type="number" value={editedVehicle.sublease_cost || 0} onChange={(e) => setEditedVehicle({...editedVehicle, sublease_cost: parseFloat(e.target.value)})} placeholder="Если берём в аренду" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Примечания</Label>
                    <Textarea value={editedVehicle.notes} onChange={(e) => setEditedVehicle({...editedVehicle, notes: e.target.value})} rows={3} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge className={getStatusColor('Зелёный')}>Зелёный</Badge>
                    <span className="text-muted-foreground text-sm font-normal">
                      {vehicle.model || 'Hyundai Grand Starex #304'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Текущий пробег</div>
                      <div className="text-xl font-bold">{vehicle.current_km?.toLocaleString() || '354 826'} км</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">До следующего ТО</div>
                      <div className="text-xl font-bold text-warning">
                        {vehicle.next_service_km 
                          ? `${(vehicle.next_service_km - (vehicle.current_km || 0)).toLocaleString()} км`
                          : '7 355 км'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Последнее ТО</div>
                      <div className="font-medium">
                        {vehicle.last_service_date || '10.01.2026'} — {vehicle.last_service_km?.toLocaleString() || '353 426'} км
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Цвет антифриза</div>
                      <Badge className="bg-green-500 text-white">Зелёный</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Детали</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">VIN: </span>
                        <span className="font-medium">{vehicle.vin || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Год: </span>
                        <span className="font-medium">{vehicle.year || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Цвет: </span>
                        <span className="font-medium">{vehicle.color || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ОСАГО: </span>
                        <span className="font-medium">{vehicle.insurance_expires || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Техосмотр: </span>
                        <span className="font-medium">{vehicle.tech_inspection_expires || '—'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="cursor-pointer hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Icon 
                          name={booking.badge === 'blue' ? 'Clock' : 'CheckCircle'} 
                          size={20} 
                          className={booking.badge === 'blue' ? 'text-blue-500' : 'text-green-500'} 
                        />
                        <div>
                          <div className="font-medium">{booking.client}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.from} → {booking.to}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground pl-8">
                        <div>{booking.startDate} — Офис</div>
                        <div>{booking.endDate} — Офис</div>
                      </div>
                    </div>
                    <Badge className={cn('text-white', booking.badge === 'blue' ? 'bg-blue-600' : 'bg-green-600')}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailDialog;