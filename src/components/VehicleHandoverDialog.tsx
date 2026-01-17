import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface VehicleHandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any;
  booking?: any;
}

export const VehicleHandoverDialog = ({ 
  open, 
  onOpenChange, 
  vehicle,
  booking
}: VehicleHandoverDialogProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'pickup' | 'return'>('pickup');
  const [handoverData, setHandoverData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    odometer: '',
    fuel_level: '',
    transponder_needed: false,
    transponder_number: '',
    notes: '',
    damages: '',
    deposit_amount: 0,
    rental_amount: 0,
    rental_payment_method: 'cash',
    rental_receipt: null as File | null,
  });

  const [customFields, setCustomFields] = useState<Array<{id: string; name: string; type: string; value: any}>>([]);

  const addCustomField = () => {
    setCustomFields([...customFields, {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      value: ''
    }]);
  };

  const updateCustomField = (id: string, key: string, value: any) => {
    setCustomFields(customFields.map(f => f.id === id ? {...f, [key]: value} : f));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleHandover = () => {
    if (!handoverData.odometer) {
      toast({
        title: "Заполните показания спидометра",
        description: "Пробег обязателен для заполнения",
        variant: "destructive",
      });
      return;
    }
    if (!handoverData.fuel_level) {
      toast({
        title: "Заполните уровень топлива",
        description: "Уровень топлива обязателен для заполнения",
        variant: "destructive",
      });
      return;
    }

    console.log('Handover data:', {
      mode,
      vehicle: vehicle?.license_plate || booking?.vehicle?.license_plate,
      ...handoverData,
      custom_fields: customFields.filter(f => f.name && f.value)
    });

    toast({
      title: mode === 'pickup' ? "Автомобиль выдан" : "Автомобиль принят",
      description: `${vehicle?.model || booking?.vehicle?.model || 'Автомобиль'} • Пробег: ${handoverData.odometer} км • Топливо: ${handoverData.fuel_level}`,
    });
    onOpenChange(false);
    setHandoverData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
      odometer: '',
      fuel_level: '',
      transponder_needed: false,
      transponder_number: '',
      notes: '',
      damages: '',
      deposit_amount: 0,
      rental_amount: 0,
      rental_payment_method: 'cash',
      rental_receipt: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Car" size={24} className="text-primary" />
              {mode === 'pickup' ? 'Выдача' : 'Приём'} авто {vehicle?.license_plate || booking?.vehicle?.license_plate || 'О304СВ193'}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === 'pickup' ? 'default' : 'outline'}
                onClick={() => setMode('pickup')}
              >
                <Icon name="ArrowUp" size={16} className="mr-1" />
                Выдача
              </Button>
              <Button
                size="sm"
                variant={mode === 'return' ? 'default' : 'outline'}
                onClick={() => setMode('return')}
              >
                <Icon name="ArrowDown" size={16} className="mr-1" />
                Приём
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="main">Основные данные</TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1">
              <Icon name="Plus" size={14} />
              Свои поля
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6 py-4">
          {mode === 'pickup' && (
            <>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Wallet" size={20} className="text-amber-600" />
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-100">Получение залога</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Сумма залога (₽)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="10000"
                    value={handoverData.deposit_amount || ''}
                    onChange={(e) => setHandoverData({...handoverData, deposit_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="CreditCard" size={20} className="text-green-600" />
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">Оплата аренды</div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rental_amount">Сумма оплаты (₽) *</Label>
                    <Input
                      id="rental_amount"
                      type="number"
                      placeholder="42000"
                      value={handoverData.rental_amount || ''}
                      onChange={(e) => setHandoverData({...handoverData, rental_amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Способ оплаты *</Label>
                    <Select 
                      value={handoverData.rental_payment_method} 
                      onValueChange={(val) => setHandoverData({...handoverData, rental_payment_method: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Наличные</SelectItem>
                        <SelectItem value="transfer">Банковский перевод</SelectItem>
                        <SelectItem value="bank">Безналичный расчёт (р/с)</SelectItem>
                        <SelectItem value="qr">QR-код (СБП)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt">Прикрепить чек (необязательно)</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setHandoverData({...handoverData, rental_receipt: e.target.files?.[0] || null})}
                    />
                    {handoverData.rental_receipt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="FileText" size={14} />
                        {handoverData.rental_receipt.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата выдачи</Label>
              <Input
                id="date"
                type="date"
                value={handoverData.date}
                onChange={(e) => setHandoverData({...handoverData, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время выдачи</Label>
              <Input
                id="time"
                type="time"
                value={handoverData.time}
                onChange={(e) => setHandoverData({...handoverData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-sidebar/20 border rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Gauge" size={18} className="text-primary" />
              <Label className="text-base font-semibold">Техническое состояние</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="odometer">Показания спидометра (км) *</Label>
              <Input
                id="odometer"
                type="text"
                placeholder="272540 или текст"
                value={handoverData.odometer}
                onChange={(e) => setHandoverData({...handoverData, odometer: e.target.value})}
                className="text-lg font-mono"
              />
              <p className="text-xs text-muted-foreground">Укажите цифры или текст (например, "не работает")</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_level">Уровень топлива *</Label>
              <Input
                id="fuel_level"
                type="text"
                placeholder="100% или 50 литров, или текст"
                value={handoverData.fuel_level}
                onChange={(e) => setHandoverData({...handoverData, fuel_level: e.target.value})}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">Укажите проценты, литры или текст</p>
            </div>
          </div>

          {mode === 'pickup' && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="transponder_needed" className="cursor-pointer">Необходим транспондер</Label>
                  <p className="text-xs text-muted-foreground mt-1">Отметьте, если нужна выдача транспондера для платных дорог</p>
                </div>
                <Switch
                  id="transponder_needed"
                  checked={handoverData.transponder_needed}
                  onCheckedChange={(checked) => setHandoverData({...handoverData, transponder_needed: checked})}
                />
              </div>
              
              {handoverData.transponder_needed && (
                <div className="space-y-2">
                  <Label htmlFor="transponder_number">Номер транспондера</Label>
                  <Input
                    id="transponder_number"
                    placeholder="TP-12345"
                    value={handoverData.transponder_number}
                    onChange={(e) => setHandoverData({...handoverData, transponder_number: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'return' && (
            <div className="space-y-2">
              <Label htmlFor="damages">Повреждения / Замечания</Label>
              <Textarea
                id="damages"
                placeholder="Царапина на заднем бампере, сколы на капоте..."
                value={handoverData.damages}
                onChange={(e) => setHandoverData({...handoverData, damages: e.target.value})}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Дополнительная информация</Label>
            <Textarea
              id="notes"
              placeholder="Особенности, комментарии..."
              value={handoverData.notes}
              onChange={(e) => setHandoverData({...handoverData, notes: e.target.value})}
              rows={3}
            />
          </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="p-4 bg-info/10 rounded-lg border border-info/30 mb-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-info mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Добавьте дополнительные поля</p>
                  <p className="text-muted-foreground">
                    Комментарии, особенности выдачи/приёма, дополнительные параметры
                  </p>
                </div>
              </div>
            </div>

            {customFields.map((field) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-sidebar/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название поля</Label>
                    <Input
                      placeholder="Напр.: Место выдачи, Контакт, Особенности"
                      value={field.name}
                      onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Тип поля</Label>
                    <Select value={field.type} onValueChange={(val) => updateCustomField(field.id, 'type', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Текст</SelectItem>
                        <SelectItem value="number">Число</SelectItem>
                        <SelectItem value="date">Дата</SelectItem>
                        <SelectItem value="checkbox">Да/Нет</SelectItem>
                        <SelectItem value="textarea">Длинный текст</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Значение</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        placeholder="Введите значение"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                        rows={3}
                      />
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 h-10">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => updateCustomField(field.id, 'value', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-muted-foreground">{field.value ? 'Да' : 'Нет'}</span>
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder="Введите значение"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => removeCustomField(field.id)}
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addCustomField}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить свое поле
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-600 to-green-700"
            onClick={handleHandover}
          >
            <Icon name="CheckCircle" size={18} className="mr-2" />
            {mode === 'pickup' ? 'Выдать авто' : 'Принять авто'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleHandoverDialog;