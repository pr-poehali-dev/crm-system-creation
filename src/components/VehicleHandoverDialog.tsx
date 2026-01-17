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
  const [handoverData, setHandoverData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '13:32',
    odometer: 0,
    fuel: 'Топливо при выдаче',
    transponder: false,
    notes: '',
  });

  const handleHandover = () => {
    toast({
      title: "Автомобиль выдан",
      description: `${vehicle?.model || 'Автомобиль'} успешно выдан клиенту`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Car" size={24} className="text-primary" />
            Выдача авто {vehicle?.license_plate || 'О304СВ193'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <Icon name="AlertTriangle" size={20} className="text-red-600" />
            <div className="text-sm">
              <div className="font-medium text-red-900">К оплате -42 000 Р</div>
            </div>
          </div>

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
            <Label htmlFor="odometer">Пробег при выдаче</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="0"
              value={handoverData.odometer}
              onChange={(e) => setHandoverData({...handoverData, odometer: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel">Топливо при выдаче</Label>
            <Select value={handoverData.fuel} onValueChange={(val) => setHandoverData({...handoverData, fuel: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Топливо при выдаче">Топливо при выдаче</SelectItem>
                <SelectItem value="Полный бак">Полный бак</SelectItem>
                <SelectItem value="3/4 бака">3/4 бака</SelectItem>
                <SelectItem value="1/2 бака">1/2 бака</SelectItem>
                <SelectItem value="1/4 бака">1/4 бака</SelectItem>
                <SelectItem value="Пустой">Пустой</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Дополнительная информация</Label>
            <Textarea
              id="notes"
              placeholder="Особенности выдачи, состояние автомобиля..."
              value={handoverData.notes}
              onChange={(e) => setHandoverData({...handoverData, notes: e.target.value})}
              rows={4}
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
            Выдать авто
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleHandoverDialog;
