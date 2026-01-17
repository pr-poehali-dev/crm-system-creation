import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    odometer: 0,
    fuel_level: 100,
    fuel_liters: 0,
    transponder: false,
    notes: '',
    damages: '',
    payment_amount: 0,
  });

  const handleHandover = () => {
    if (!handoverData.odometer) {
      toast({
        title: "Заполните пробег",
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
    if (!handoverData.fuel_liters) {
      toast({
        title: "Заполните количество топлива",
        description: "Количество литров обязательно для заполнения",
        variant: "destructive",
      });
      return;
    }

    console.log('Handover data:', {
      mode,
      vehicle: vehicle?.license_plate || booking?.vehicle?.license_plate,
      ...handoverData,
    });

    toast({
      title: mode === 'pickup' ? "Автомобиль выдан" : "Автомобиль принят",
      description: `${vehicle?.model || booking?.vehicle?.model || 'Автомобиль'} • Пробег: ${handoverData.odometer} км • Топливо: ${handoverData.fuel_level}% (${handoverData.fuel_liters}л)`,
    });
    onOpenChange(false);
    setHandoverData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
      odometer: 0,
      fuel_level: 100,
      fuel_liters: 0,
      transponder: false,
      notes: '',
      damages: '',
      payment_amount: 0,
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

        <div className="space-y-6 py-4">
          {mode === 'pickup' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
                <div className="text-sm font-medium text-red-900">Сумма к оплате</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment">Сумма платежа (₽)</Label>
                <Input
                  id="payment"
                  type="number"
                  placeholder="42000"
                  value={handoverData.payment_amount || ''}
                  onChange={(e) => setHandoverData({...handoverData, payment_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="odometer">Пробег при {mode === 'pickup' ? 'выдаче' : 'возврате'} (км) *</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="272540"
              value={handoverData.odometer || ''}
              onChange={(e) => setHandoverData({...handoverData, odometer: parseInt(e.target.value) || 0})}
              className="text-lg font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_level">Уровень топлива (%) *</Label>
              <Input
                id="fuel_level"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={handoverData.fuel_level || ''}
                onChange={(e) => setHandoverData({...handoverData, fuel_level: parseInt(e.target.value) || 0})}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_liters">Количество литров *</Label>
              <Input
                id="fuel_liters"
                type="number"
                step="0.1"
                placeholder="75.5"
                value={handoverData.fuel_liters || ''}
                onChange={(e) => setHandoverData({...handoverData, fuel_liters: parseFloat(e.target.value) || 0})}
                className="text-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="transponder" className="cursor-pointer">Выдан транспондер</Label>
              <div className="text-sm text-muted-foreground">Отметьте если был выдан</div>
            </div>
            <Switch
              id="transponder"
              checked={handoverData.transponder}
              onCheckedChange={(checked) => setHandoverData({...handoverData, transponder: checked})}
            />
          </div>

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
        </div>

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