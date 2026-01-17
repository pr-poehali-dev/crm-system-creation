import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VehicleHandoverHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any;
}

export const VehicleHandoverHistory = ({ 
  open, 
  onOpenChange, 
  vehicle 
}: VehicleHandoverHistoryProps) => {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && vehicle?.id) {
      loadHistory();
    }
  }, [open, vehicle?.id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f?action=handover_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicle.id })
      });

      if (response.ok) {
        const data = await response.json();
        setHandovers(data.handovers || []);
      }
    } catch (error) {
      console.error('Failed to load handover history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Наличные',
      transfer: 'Перевод',
      bank: 'Безнал (р/с)',
      qr: 'QR-код'
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="History" size={24} className="text-primary" />
            История выдач и приёмов • {vehicle?.model} {vehicle?.license_plate}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Загрузка истории...</p>
          </div>
        ) : handovers.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileX" size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">История выдач и приёмов пуста</p>
          </div>
        ) : (
          <div className="space-y-4">
            {handovers.map((handover, idx) => (
              <Card 
                key={handover.id} 
                className={`border-l-4 ${handover.type === 'pickup' ? 'border-l-green-500' : 'border-l-blue-500'}`}
              >
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant={handover.type === 'pickup' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          <Icon 
                            name={handover.type === 'pickup' ? 'ArrowUp' : 'ArrowDown'} 
                            size={14} 
                            className="mr-1"
                          />
                          {handover.type === 'pickup' ? 'Выдача' : 'Приём'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {handover.handover_date} в {handover.handover_time}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="Gauge" size={14} className="text-muted-foreground" />
                          <span className="font-medium">Пробег:</span>
                          <span>{handover.odometer}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon name="Fuel" size={14} className="text-muted-foreground" />
                          <span className="font-medium">Топливо:</span>
                          <span>{handover.fuel_level}</span>
                        </div>

                        {handover.transponder_number && (
                          <div className="flex items-center gap-2">
                            <Icon name="CreditCard" size={14} className="text-muted-foreground" />
                            <span className="font-medium">Транспондер:</span>
                            <span>{handover.transponder_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {handover.type === 'pickup' && (
                        <div className="space-y-3">
                          {handover.deposit_amount > 0 && (
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                              <div className="text-xs text-muted-foreground mb-1">Залог</div>
                              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                                ₽{handover.deposit_amount.toLocaleString()}
                              </div>
                            </div>
                          )}

                          {handover.rental_amount > 0 && (
                            <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                              <div className="text-xs text-muted-foreground mb-1">Оплата аренды</div>
                              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                                ₽{handover.rental_amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {getPaymentMethodLabel(handover.rental_payment_method)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {handover.notes && (
                        <div className="mt-3 p-2 bg-sidebar/20 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">Заметки</div>
                          <div className="text-sm">{handover.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex items-center gap-2">
                    <Icon name="Clock" size={12} />
                    <span>ID: {handover.handover_id} • Создано: {new Date(handover.created_at).toLocaleString('ru-RU')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleHandoverHistory;