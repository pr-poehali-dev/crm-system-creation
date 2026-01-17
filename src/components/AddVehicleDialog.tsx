import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVehicleDialog = ({ open, onOpenChange }: AddVehicleDialogProps) => {
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState({
    model: '',
    license_plate: '',
    vin: '',
    year: new Date().getFullYear(),
    color: '',
    seats: 7,
    category: 'Микроавтобус',
    
    branch_id: 1,
    status: 'Свободен',
    current_location: 'Гараж',
    
    insurance_expires: '',
    tech_inspection_expires: '',
    osago_number: '',
    kasko_number: '',
    
    last_service_date: '',
    next_service_date: '',
    last_service_km: 0,
    next_service_km: 0,
    current_km: 0,
    
    purchase_price: 0,
    rental_price_per_day: 5000,
    rental_price_per_km: 15,
    
    notes: '',
  });

  const handleSave = async () => {
    // Проверка обязательных полей
    if (!vehicle.model || !vehicle.license_plate) {
      toast({
        title: "Заполните обязательные поля",
        description: "Марка/модель и гос. номер обязательны для заполнения",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      });

      if (!response.ok) {
        throw new Error('Failed to create vehicle');
      }

      const result = await response.json();
      
      toast({
        title: "✅ Автомобиль добавлен!",
        description: `${vehicle.model} (${vehicle.license_plate}) успешно добавлен в автопарк`,
      });
      
      // Сбрасываем форму
      setVehicle({
        model: '',
        license_plate: '',
        vin: '',
        year: new Date().getFullYear(),
        color: '',
        seats: 5,
        category: 'Бизнес',
        branch_id: 1,
        status: 'Свободен',
        current_location: 'Офис на Ленина 45',
        insurance_expires: '',
        tech_inspection_expires: '',
        osago_number: '',
        kasko_number: '',
        last_service_date: '',
        next_service_date: '',
        last_service_km: 0,
        next_service_km: 0,
        current_km: 0,
        purchase_price: 0,
        rental_price_per_day: 5000,
        rental_price_per_km: 15,
        notes: '',
      });
      
      onOpenChange(false);
      window.location.reload(); // Обновляем страницу чтобы показать новый автомобиль
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить автомобиль. Проверьте заполнение полей.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Car" size={24} className="text-primary" />
            Добавление автомобиля в автопарк
          </DialogTitle>
          <DialogDescription>
            Заполните обязательные поля (*). Остальные можно заполнить позже
          </DialogDescription>
          <div className="mt-4 p-4 bg-info/10 rounded-lg border border-info/30">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} className="text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Пример заполнения:</p>
                <p className="text-muted-foreground">
                  <strong>Модель:</strong> Toyota Camry XV70 • <strong>Номер:</strong> А123БВ777 • <strong>Год:</strong> 2022 • <strong>Мест:</strong> 5
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Основные</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="service">ТО</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Марка и модель * <span className="text-muted-foreground font-normal text-xs">(напр: Toyota Camry XV70)</span></Label>
                <Input
                  id="model"
                  placeholder="Введите марку и модель"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_plate">Гос. номер * <span className="text-muted-foreground font-normal text-xs">(напр: А123БВ777)</span></Label>
                <Input
                  id="license_plate"
                  placeholder="А000АА777"
                  value={vehicle.license_plate}
                  onChange={(e) => setVehicle({...vehicle, license_plate: e.target.value.toUpperCase()})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vin">VIN-номер</Label>
                <Input
                  id="vin"
                  placeholder="12345678901234567"
                  maxLength={17}
                  value={vehicle.vin}
                  onChange={(e) => setVehicle({...vehicle, vin: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Год выпуска *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={vehicle.year}
                  onChange={(e) => setVehicle({...vehicle, year: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Цвет</Label>
                <Input
                  id="color"
                  placeholder="Чёрный"
                  value={vehicle.color}
                  onChange={(e) => setVehicle({...vehicle, color: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Мест *</Label>
                <Input
                  id="seats"
                  type="number"
                  min="2"
                  max="20"
                  value={vehicle.seats}
                  onChange={(e) => setVehicle({...vehicle, seats: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select value={vehicle.category} onValueChange={(val) => setVehicle({...vehicle, category: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Легковой">Легковой</SelectItem>
                    <SelectItem value="Кроссовер">Кроссовер</SelectItem>
                    <SelectItem value="Минивэн">Минивэн</SelectItem>
                    <SelectItem value="Микроавтобус">Микроавтобус</SelectItem>
                    <SelectItem value="Грузовой">Грузовой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Филиал *</Label>
                <Select value={vehicle.branch_id.toString()} onValueChange={(val) => setVehicle({...vehicle, branch_id: parseInt(val)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Москва</SelectItem>
                    <SelectItem value="2">Краснодар</SelectItem>
                    <SelectItem value="3">Санкт-Петербург</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={vehicle.status} onValueChange={(val) => setVehicle({...vehicle, status: val})}>
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
                <Label htmlFor="location">Местоположение</Label>
                <Input
                  id="location"
                  placeholder="Гараж №1"
                  value={vehicle.current_location}
                  onChange={(e) => setVehicle({...vehicle, current_location: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_km">Текущий пробег (км)</Label>
              <Input
                id="current_km"
                type="number"
                min="0"
                value={vehicle.current_km}
                onChange={(e) => setVehicle({...vehicle, current_km: parseInt(e.target.value)})}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_expires">Срок ОСАГО</Label>
                <Input
                  id="insurance_expires"
                  type="date"
                  value={vehicle.insurance_expires}
                  onChange={(e) => setVehicle({...vehicle, insurance_expires: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="osago_number">Номер полиса ОСАГО</Label>
                <Input
                  id="osago_number"
                  placeholder="ХХХ 1234567890"
                  value={vehicle.osago_number}
                  onChange={(e) => setVehicle({...vehicle, osago_number: e.target.value.toUpperCase()})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tech_inspection_expires">Срок техосмотра</Label>
                <Input
                  id="tech_inspection_expires"
                  type="date"
                  value={vehicle.tech_inspection_expires}
                  onChange={(e) => setVehicle({...vehicle, tech_inspection_expires: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kasko_number">Номер полиса КАСКО</Label>
                <Input
                  id="kasko_number"
                  placeholder="Опционально"
                  value={vehicle.kasko_number}
                  onChange={(e) => setVehicle({...vehicle, kasko_number: e.target.value.toUpperCase()})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="service" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_service_date">Дата последнего ТО</Label>
                <Input
                  id="last_service_date"
                  type="date"
                  value={vehicle.last_service_date}
                  onChange={(e) => setVehicle({...vehicle, last_service_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_service_date">Дата следующего ТО</Label>
                <Input
                  id="next_service_date"
                  type="date"
                  value={vehicle.next_service_date}
                  onChange={(e) => setVehicle({...vehicle, next_service_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_service_km">Пробег последнего ТО (км)</Label>
                <Input
                  id="last_service_km"
                  type="number"
                  min="0"
                  value={vehicle.last_service_km}
                  onChange={(e) => setVehicle({...vehicle, last_service_km: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_service_km">Пробег следующего ТО (км)</Label>
                <Input
                  id="next_service_km"
                  type="number"
                  min="0"
                  value={vehicle.next_service_km}
                  onChange={(e) => setVehicle({...vehicle, next_service_km: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Стоимость покупки (₽)</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                value={vehicle.purchase_price}
                onChange={(e) => setVehicle({...vehicle, purchase_price: parseFloat(e.target.value)})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rental_price_per_day">Цена аренды (₽/сутки) *</Label>
                <Input
                  id="rental_price_per_day"
                  type="number"
                  min="0"
                  value={vehicle.rental_price_per_day}
                  onChange={(e) => setVehicle({...vehicle, rental_price_per_day: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rental_price_per_km">Цена за км (₽/км) *</Label>
                <Input
                  id="rental_price_per_km"
                  type="number"
                  min="0"
                  value={vehicle.rental_price_per_km}
                  onChange={(e) => setVehicle({...vehicle, rental_price_per_km: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация об автомобиле..."
                value={vehicle.notes}
                onChange={(e) => setVehicle({...vehicle, notes: e.target.value})}
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={handleSave}
            disabled={!vehicle.model || !vehicle.license_plate}
          >
            <Icon name="Save" size={18} className="mr-2" />
            Добавить автомобиль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;