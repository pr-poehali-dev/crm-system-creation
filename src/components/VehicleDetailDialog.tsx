import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Car" size={24} className="text-primary" />
              <span>Авто {vehicle.license_plate}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onShowInsurance}>
                <Icon name="Shield" size={16} className="mr-2" />
                Страховка
              </Button>
              <Button variant="outline" size="sm" onClick={onShowMaintenance}>
                <Icon name="Wrench" size={16} className="mr-2" />
                Статус ТО
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Общая информация</TabsTrigger>
            <TabsTrigger value="bookings">Брони</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
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
