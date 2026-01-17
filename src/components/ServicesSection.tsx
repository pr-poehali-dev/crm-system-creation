import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  km_price?: number;
  is_active: boolean;
}

export const ServicesSection = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const services: Service[] = [
    { id: 1, name: 'Выездная мойка', description: 'Профессиональная мойка автомобиля на выезде', price: 2500, unit: 'услуга', is_active: true },
    { id: 2, name: 'Аренда авто', description: 'Посуточная аренда автомобиля премиум класса', price: 5000, unit: 'сутки', km_price: 15, is_active: true },
    { id: 3, name: 'Детейлинг', description: 'Полный комплекс детейлинга автомобиля', price: 12000, unit: 'услуга', is_active: true },
    { id: 4, name: 'Абонемент консьерж', description: 'Корпоративный пакет услуг консьержа', price: 45000, unit: 'месяц', is_active: true },
    { id: 5, name: 'Водитель с авто', description: 'Аренда автомобиля с водителем', price: 3000, unit: 'час', is_active: true },
    { id: 6, name: 'Химчистка салона', description: 'Профессиональная химчистка салона', price: 8000, unit: 'услуга', is_active: false },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wrench" size={24} className="text-primary" />
              Каталог услуг
            </CardTitle>
            <CardDescription>Управление услугами и ценообразованием</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить услугу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новая услуга</DialogTitle>
                <DialogDescription>Добавление услуги в каталог</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Название услуги</Label>
                  <Input placeholder="Например: Выездная мойка" />
                </div>
                
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea placeholder="Краткое описание услуги" rows={3} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Цена (₽)</Label>
                    <Input type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Единица измерения</Label>
                    <Select defaultValue="услуга">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="услуга">Услуга</SelectItem>
                        <SelectItem value="час">Час</SelectItem>
                        <SelectItem value="сутки">Сутки</SelectItem>
                        <SelectItem value="месяц">Месяц</SelectItem>
                        <SelectItem value="км">Километр</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Цена за км (опционально)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Активна</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Отмена</Button>
                <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => setIsAddOpen(false)}>
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-lg bg-gradient-to-br from-sidebar/40 to-sidebar/20 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group"
              onClick={() => setEditingService(service)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="DollarSign" size={16} className="text-primary" />
                      <span className="font-bold text-primary">₽{service.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">/ {service.unit}</span>
                    </div>
                    {service.km_price && (
                      <div className="flex items-center gap-2">
                        <Icon name="Navigation" size={16} className="text-secondary" />
                        <span className="font-medium">₽{service.km_price} / км</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <Icon name="ChevronRight" size={20} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesSection;
