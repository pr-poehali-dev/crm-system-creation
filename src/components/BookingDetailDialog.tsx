import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onHandover?: () => void;
}

const BOOKINGS_API = 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142';
const INTEGRATIONS_API = 'https://functions.poehali.dev/d6ed6f95-4807-4fc5-bd93-5e841b317394';

export const BookingDetailDialog = ({ 
  open, 
  onOpenChange, 
  booking,
  onHandover
}: BookingDetailDialogProps) => {
  const [fullBooking, setFullBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    if (!open || !booking?.id) {
      setFullBooking(null);
      return;
    }

    const loadBookingDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BOOKINGS_API}?id=${booking.id}`);
        const data = await response.json();
        setFullBooking(data.booking);
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingDetails();
  }, [open, booking?.id]);

  const handleCreatePayment = async () => {
    if (!fullBooking) return;
    
    const remaining = parseFloat(fullBooking.total_price || 0) - parseFloat(fullBooking.paid_amount || 0);
    if (remaining <= 0) {
      alert('Бронь уже полностью оплачена');
      return;
    }

    setIsCreatingPayment(true);
    try {
      const response = await fetch(`${INTEGRATIONS_API}?action=payment_create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: fullBooking.id,
          amount: remaining,
          return_url: window.location.origin + '/payment-success'
        })
      });

      const data = await response.json();
      
      if (data.confirmation_url) {
        window.open(data.confirmation_url, '_blank');
        alert('Ссылка на оплату открыта в новой вкладке');
      } else {
        alert(`Ошибка: ${data.error || 'Не удалось создать платёж'}`);
      }
    } catch (error) {
      alert('Не удалось создать ссылку на оплату');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  if (!booking) return null;

  const displayBooking = fullBooking || booking;
  const payments = displayBooking.payments || [];
  const services = displayBooking.services || [];
  const customFields = displayBooking.custom_fields || [];

  const totalPaid = payments
    .filter((p: any) => p.type === '+')
    .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

  const totalExpenses = payments
    .filter((p: any) => p.type === '-')
    .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

  const balance = totalPaid - totalExpenses;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600 text-white">
                {displayBooking.total_price ? `₽${parseFloat(displayBooking.total_price).toLocaleString()}` : '₽0'}
              </Badge>
              <span>Бронь #{displayBooking.id}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  displayBooking.status === 'Бронь' && 'bg-green-100 text-green-700 border-green-200',
                  displayBooking.status === 'В аренде' && 'bg-blue-100 text-blue-700 border-blue-200',
                  displayBooking.status === 'Завершено' && 'bg-gray-100 text-gray-700 border-gray-200',
                  displayBooking.status === 'Отменено' && 'bg-red-100 text-red-700 border-red-200'
                )}
              >
                {displayBooking.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="FileText" size={16} className="mr-2" />
                DOCX
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Клиент</div>
                        <div className="font-medium text-lg">{displayBooking.client_name || 'Не указан'}</div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Phone" size={16} />
                        <span>{displayBooking.client_phone || 'Не указан'}</span>
                      </div>
                      {(displayBooking.pickup_location || displayBooking.dropoff_location) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="MapPin" size={16} />
                          <span>
                            {displayBooking.pickup_location || '—'} → {displayBooking.dropoff_location || '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-sm text-muted-foreground">Автомобиль</div>
                      <div className="space-y-1">
                        {displayBooking.vehicle_model && (
                          <div className="font-medium">{displayBooking.vehicle_model}</div>
                        )}
                        {displayBooking.vehicle_license_plate && (
                          <Badge variant="outline" className="text-sm">
                            {displayBooking.vehicle_license_plate}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Выдача</div>
                      <div className="font-medium">
                        {formatDate(displayBooking.start_date)}
                        {displayBooking.pickup_location && ` — ${displayBooking.pickup_location}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Возврат</div>
                      <div className="font-medium">
                        {formatDate(displayBooking.end_date)}
                        {displayBooking.dropoff_location && ` — ${displayBooking.dropoff_location}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {displayBooking.created_at && (
                      <div>Создано: {formatDate(displayBooking.created_at)}</div>
                    )}
                    {displayBooking.updated_at && (
                      <div>Обновлено: {formatDate(displayBooking.updated_at)}</div>
                    )}
                    {displayBooking.created_by && (
                      <div>Менеджер: {displayBooking.created_by}</div>
                    )}
                  </div>

                  {displayBooking.notes && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Примечания</div>
                      <div className="text-sm">{displayBooking.notes}</div>
                    </div>
                  )}

                  {customFields.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Дополнительные поля</div>
                      <div className="space-y-2">
                        {customFields.map((field: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{field.name}:</span>
                            <span className="font-medium">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Расчёт стоимости</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-center py-4">
                  ₽{parseFloat(displayBooking.total_price || 0).toLocaleString()}
                  {displayBooking.deposit_amount > 0 && (
                    <span className="text-muted-foreground text-lg ml-2">
                      + ₽{parseFloat(displayBooking.deposit_amount).toLocaleString()} (залог)
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Оплачено</span>
                    <span className="font-medium text-green-600">
                      → ₽{parseFloat(displayBooking.paid_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Остаток к оплате</span>
                    <span className="font-medium text-red-600">
                      → ₽{(parseFloat(displayBooking.total_price || 0) - parseFloat(displayBooking.paid_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="font-medium mb-3">Включено в стоимость:</div>
                    <div className="space-y-2 text-sm">
                      {services.map((service: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{service.name}</span>
                          <span className="font-medium">₽{parseFloat(service.adjustedPrice || service.price || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      {displayBooking.rental_days && displayBooking.rental_km && (
                        <>
                          <div className="flex justify-between">
                            <span>Дополнительные дни аренды: {displayBooking.rental_days - 1}</span>
                            <span className="font-medium">
                              ₽{((displayBooking.rental_days - 1) * parseFloat(displayBooking.rental_price_per_day || 0)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Километраж: {displayBooking.rental_km} км</span>
                            <span className="font-medium">
                              ₽{(displayBooking.rental_km * parseFloat(displayBooking.rental_price_per_km || 0)).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Баланс платежей: <span className="font-medium text-foreground">₽{balance.toLocaleString()}</span>
                  </div>
                  
                  {balance < 0 && (
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700"
                      onClick={handleCreatePayment}
                      disabled={isCreatingPayment}
                    >
                      <Icon name={isCreatingPayment ? "Loader2" : "CreditCard"} size={18} className={`mr-2 ${isCreatingPayment && 'animate-spin'}`} />
                      {isCreatingPayment ? 'Создание ссылки...' : `Создать ссылку на оплату ₽${Math.abs(balance).toLocaleString()}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {payments.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Платежи</CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.map((payment: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <Icon 
                            name={payment.type === '+' ? 'TrendingUp' : 'TrendingDown'}
                            size={20} 
                            className={payment.type === '+' ? 'text-green-600' : 'text-red-600'} 
                          />
                          <div>
                            <div className="text-sm text-muted-foreground">{payment.date}</div>
                            <div className="font-medium text-sm">
                              {payment.method || 'Наличные'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            'font-bold',
                            payment.type === '+' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {payment.type}{parseFloat(payment.amount || 0).toLocaleString()} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                onClick={onHandover}
              >
                <Icon name="Car" size={18} className="mr-2" />
                Выдать автомобиль
              </Button>
              <Button variant="outline" className="flex-1">
                <Icon name="Edit" size={18} className="mr-2" />
                Редактировать
              </Button>
              <Button variant="destructive" className="flex-1">
                <Icon name="Trash2" size={18} className="mr-2" />
                Отменить бронь
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;