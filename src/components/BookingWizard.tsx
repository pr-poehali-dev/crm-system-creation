import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BookingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any;
  startDate?: Date;
  endDate?: Date;
}

const BOOKINGS_API = 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142';

export const BookingWizard = ({ open, onOpenChange, vehicle, startDate, endDate }: BookingWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({
    booking_type: 'rent',
    route_type: 'russia',
    client_is_foreign: false,
    fuel_policy: 'full-to-full',
    has_child_seat: false,
    has_gps: false,
    has_winter_tires: false,
    has_roof_rack: false,
    has_additional_driver: false,
    child_seat_count: 0,
    planned_km_total: 0,
    services: [],
    payments: [],
    deposit_amount: 10000,
  });

  const additionalServices = [
    { id: 'transponder', name: 'Транспондер', price: 500 },
    { id: 'child_seat', name: 'Детское кресло', price: 300, perDay: true },
    { id: 'gps', name: 'Автобокс на крышу', price: 1000, perDay: true },
    { id: 'fridge', name: 'Холодильник', price: 800, perDay: true },
    { id: 'additional_driver', name: 'Дополнительный водитель', price: 0 },
  ];

  const updateData = (key: string, value: any) => {
    setBookingData({ ...bookingData, [key]: value });
  };

  const calculateTotal = () => {
    let total = 0;
    
    if (bookingData.rental_price_per_day && bookingData.rental_days) {
      total += bookingData.rental_price_per_day * bookingData.rental_days;
    }
    
    if (bookingData.rental_price_per_km && bookingData.planned_km_total) {
      total += bookingData.rental_price_per_km * bookingData.planned_km_total;
    }
    
    bookingData.services?.forEach((service: any) => {
      total += service.adjustedPrice || service.price || 0;
    });
    
    return total;
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(BOOKINGS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          vehicle_id: vehicle?.id,
          vehicle_model: vehicle?.model,
          vehicle_license_plate: vehicle?.license_plate,
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          total_price: calculateTotal(),
          status: 'Бронь',
        })
      });

      if (!response.ok) throw new Error('Failed to create booking');

      toast({
        title: 'Бронь создана',
        description: 'Заявка успешно оформлена',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать бронь',
        variant: 'destructive',
      });
    }
  };

  const steps = [
    { number: 1, title: 'Маршрут и оборудование' },
    { number: 2, title: 'Арендатор' },
    { number: 3, title: 'Документы' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-xl">
                Заявка на бронь {vehicle ? `${vehicle.model} #${vehicle.license_plate.slice(-3)}` : ''}
              </div>
              {startDate && endDate && (
                <div className="text-sm text-muted-foreground mt-1">
                  Период аренды: {startDate.toLocaleDateString()} ~ {endDate.toLocaleDateString()}
                </div>
              )}
            </div>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={24} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm font-medium">
            Информация для службы безопасности.
          </p>
          <p className="text-red-600 text-sm mt-1">
            Укажите данные ОДНОГО ЧЕЛОВЕКА, который будет подписывать договор и принимать-возвращать автомобиль.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-bold",
                step === s.number ? "bg-purple-600 text-white" : 
                step > s.number ? "bg-purple-600 text-white" : 
                "bg-gray-300 text-gray-600"
              )}>
                {step > s.number ? <Icon name="Check" size={20} /> : s.number}
              </div>
              <span className={cn(
                "text-sm font-medium",
                step >= s.number ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-right mb-4">
                  <div className="text-3xl font-bold">
                    {calculateTotal().toLocaleString()} + {bookingData.deposit_amount?.toLocaleString()}* 
                    <span className="text-muted-foreground text-lg ml-2">(залог)</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    * залог возвращается в день сдачи авто
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="font-medium">Включено в стоимость:</div>
                  <div className="text-sm space-y-2">
                    {bookingData.rental_days && (
                      <div className="flex justify-between">
                        <span>{bookingData.rental_days} суток аренды</span>
                        <span className="font-medium">
                          {(bookingData.rental_price_per_day * bookingData.rental_days).toLocaleString()} руб
                        </span>
                      </div>
                    )}
                    {bookingData.planned_km_total > 0 && (
                      <div className="flex justify-between">
                        <span>пробег {bookingData.planned_km_total} км</span>
                        <span className="font-medium">
                          {(bookingData.planned_km_total * (bookingData.rental_price_per_km || 0)).toLocaleString()} руб
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={bookingData.route_type === 'russia'}
                    onChange={() => updateData('route_type', 'russia')}
                    className="w-5 h-5"
                  />
                  <span>По России</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={bookingData.route_type === 'international'}
                    onChange={() => updateData('route_type', 'international')}
                    className="w-5 h-5"
                  />
                  <span>За границу</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <Icon name="MapPin" size={16} className="inline mr-2" />
                    Место выдачи *
                  </Label>
                  <Select 
                    value={bookingData.pickup_location_type || ''} 
                    onValueChange={(value) => updateData('pickup_location_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите место" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Офис</SelectItem>
                      <SelectItem value="hotel">Отель</SelectItem>
                      <SelectItem value="airport">Аэропорт</SelectItem>
                      <SelectItem value="custom">Свой адрес</SelectItem>
                    </SelectContent>
                  </Select>
                  {(bookingData.pickup_location_type === 'hotel' || 
                    bookingData.pickup_location_type === 'airport' || 
                    bookingData.pickup_location_type === 'custom') && (
                    <Input
                      placeholder={
                        bookingData.pickup_location_type === 'hotel' ? 'Название отеля' :
                        bookingData.pickup_location_type === 'airport' ? 'Название аэропорта' :
                        'Адрес'
                      }
                      value={bookingData.pickup_location || ''}
                      onChange={(e) => updateData('pickup_location', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <Icon name="MapPinOff" size={16} className="inline mr-2" />
                    Место возврата *
                  </Label>
                  <Select 
                    value={bookingData.dropoff_location_type || ''} 
                    onValueChange={(value) => updateData('dropoff_location_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите место" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Офис</SelectItem>
                      <SelectItem value="hotel">Отель</SelectItem>
                      <SelectItem value="airport">Аэропорт</SelectItem>
                      <SelectItem value="custom">Свой адрес</SelectItem>
                    </SelectContent>
                  </Select>
                  {(bookingData.dropoff_location_type === 'hotel' || 
                    bookingData.dropoff_location_type === 'airport' || 
                    bookingData.dropoff_location_type === 'custom') && (
                    <Input
                      placeholder={
                        bookingData.dropoff_location_type === 'hotel' ? 'Название отеля' :
                        bookingData.dropoff_location_type === 'airport' ? 'Название аэропорта' :
                        'Адрес'
                      }
                      value={bookingData.dropoff_location || ''}
                      onChange={(e) => updateData('dropoff_location', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planned_km">
                    <Icon name="Gauge" size={16} className="inline mr-2" />
                    Пробег поездки, км *
                  </Label>
                  <Input
                    id="planned_km"
                    type="number"
                    value={bookingData.planned_km_total}
                    onChange={(e) => updateData('planned_km_total', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Коротко опишите маршрут *</Label>
                  <Textarea
                    value={bookingData.notes}
                    onChange={(e) => updateData('notes', e.target.value)}
                    placeholder="Москва - Сочи - Москва"
                    rows={1}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Дополнительные опции</Label>
                
                <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <span>Транспондер</span>
                  <input
                    type="checkbox"
                    checked={bookingData.services?.some((s: any) => s.id === 'transponder')}
                    onChange={(e) => {
                      const service = additionalServices.find(s => s.id === 'transponder');
                      if (e.target.checked) {
                        updateData('services', [...(bookingData.services || []), service]);
                      } else {
                        updateData('services', bookingData.services?.filter((s: any) => s.id !== 'transponder'));
                      }
                    }}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <span>Автобокс на крышу</span>
                  <input
                    type="checkbox"
                    checked={bookingData.has_roof_rack}
                    onChange={(e) => updateData('has_roof_rack', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <span>Холодильник</span>
                  <input
                    type="checkbox"
                    checked={bookingData.services?.some((s: any) => s.id === 'fridge')}
                    onChange={(e) => {
                      const service = additionalServices.find(s => s.id === 'fridge');
                      if (e.target.checked) {
                        updateData('services', [...(bookingData.services || []), service]);
                      } else {
                        updateData('services', bookingData.services?.filter((s: any) => s.id !== 'fridge'));
                      }
                    }}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Label>Детское кресло</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((count) => (
                    <Button
                      key={count}
                      variant={bookingData.child_seat_count === count ? "default" : "outline"}
                      onClick={() => {
                        updateData('child_seat_count', count);
                        updateData('has_child_seat', count > 0);
                      }}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Место выдачи *</Label>
                  <Select 
                    value={bookingData.pickup_location}
                    onValueChange={(val) => updateData('pickup_location', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите место" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Наш офис (бесплатно)</SelectItem>
                      <SelectItem value="airport">Аэропорт</SelectItem>
                      <SelectItem value="hotel">Отель</SelectItem>
                      <SelectItem value="address">По адресу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Место возврата *</Label>
                  <Select
                    value={bookingData.dropoff_location}
                    onValueChange={(val) => updateData('dropoff_location', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите место" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Наш офис (бесплатно)</SelectItem>
                      <SelectItem value="airport">Аэропорт</SelectItem>
                      <SelectItem value="hotel">Отель</SelectItem>
                      <SelectItem value="address">По адресу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Фамилия *</Label>
                <Input
                  value={bookingData.client_name?.split(' ')[0] || ''}
                  onChange={(e) => {
                    const parts = bookingData.client_name?.split(' ') || ['', '', ''];
                    parts[0] = e.target.value;
                    updateData('client_name', parts.join(' ').trim());
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Дата рождения (ДД.ММ.ГГГГ) *</Label>
                <Input
                  type="date"
                  value={bookingData.client_birth_date}
                  onChange={(e) => updateData('client_birth_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Имя *</Label>
                <Input
                  value={bookingData.client_name?.split(' ')[1] || ''}
                  onChange={(e) => {
                    const parts = bookingData.client_name?.split(' ') || ['', '', ''];
                    parts[1] = e.target.value;
                    updateData('client_name', parts.join(' ').trim());
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={bookingData.client_email}
                  onChange={(e) => updateData('client_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Отчество *</Label>
                <Input
                  value={bookingData.client_name?.split(' ')[2] || ''}
                  onChange={(e) => {
                    const parts = bookingData.client_name?.split(' ') || ['', '', ''];
                    parts[2] = e.target.value;
                    updateData('client_name', parts.join(' ').trim());
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input
                  type="tel"
                  value={bookingData.client_phone}
                  onChange={(e) => updateData('client_phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Куда прислать договор? *</Label>
              <Select
                value={bookingData.communication_channel}
                onValueChange={(val) => updateData('communication_channel', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-5 h-5" />
              <span className="text-sm">Оплата от юрлица</span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!bookingData.client_is_foreign}
                  onChange={() => updateData('client_is_foreign', false)}
                  className="w-5 h-5"
                />
                <span>Документы РФ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={bookingData.client_is_foreign}
                  onChange={() => updateData('client_is_foreign', true)}
                  className="w-5 h-5"
                />
                <span>Иностранец</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Водительское удостоверение</h3>
                <div className="space-y-2">
                  <Label>Серия в/у *</Label>
                  <Input
                    value={bookingData.client_driver_license_series}
                    onChange={(e) => updateData('client_driver_license_series', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Номер в/у *</Label>
                  <Input
                    value={bookingData.client_driver_license_number}
                    onChange={(e) => updateData('client_driver_license_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата выдачи (ДД.ММ.ГГГГ)</Label>
                  <Input
                    type="date"
                    value={bookingData.client_driver_license_issued_date}
                    onChange={(e) => updateData('client_driver_license_issued_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Кем выдано *</Label>
                  <Input
                    value={bookingData.client_driver_license_issued_by}
                    onChange={(e) => updateData('client_driver_license_issued_by', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Паспортные данные</h3>
                <div className="space-y-2">
                  <Label>Серия паспорта *</Label>
                  <Input
                    value={bookingData.client_passport_series}
                    onChange={(e) => updateData('client_passport_series', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Номер паспорта *</Label>
                  <Input
                    value={bookingData.client_passport_number}
                    onChange={(e) => updateData('client_passport_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата выдачи (ДД.ММ.ГГГГ)</Label>
                  <Input
                    type="date"
                    value={bookingData.client_passport_issued_date}
                    onChange={(e) => updateData('client_passport_issued_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Кем выдан *</Label>
                  <Textarea
                    value={bookingData.client_passport_issued_by}
                    onChange={(e) => updateData('client_passport_issued_by', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Регистрация</h3>
                <div className="space-y-2">
                  <Label>Адрес регистрации *</Label>
                  <Textarea
                    value={bookingData.client_passport_registration}
                    onChange={(e) => updateData('client_passport_registration', e.target.value)}
                    rows={6}
                    placeholder="г. Москва, ул. ..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ОТМЕНА
            </Button>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <Icon name="ChevronLeft" size={16} className="mr-2" />
                НАЗАД
              </Button>
            )}
          </div>
          
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-purple-600 to-purple-700">
              ДАЛЕЕ
              <Icon name="ChevronRight" size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-purple-700">
              ЗАБРОНИРОВАТЬ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingWizard;