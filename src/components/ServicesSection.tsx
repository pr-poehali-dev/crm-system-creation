import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Service {
  id: string;
  name: string;
  price: number;
  time?: string;
  crossover?: string;
  minivan?: string;
}

export const ServicesSection = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('individual');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState('');

  const [services, setServices] = useState({
    'Озон и запахи': [
      { id: '1', name: 'Озонирование салона базовое', price: 3500, time: '30-40 мин', crossover: '+30%', minivan: '+50%' },
      { id: '2', name: 'Озонирование усиленное', price: 5500, time: '60-90 мин', crossover: '+30%', minivan: '+50%' },
      { id: '3', name: 'Удаление запаха после курения', price: 8000, time: '2 часа', crossover: '+30%', minivan: '+50%' },
      { id: '4', name: 'Удаление запаха после животных', price: 9000, time: '2.5 часа', crossover: '+30%', minivan: '+50%' },
      { id: '5', name: 'Удаление плесени комплекс', price: 17000, time: '4 часа', crossover: '+30%', minivan: '+50%' },
    ],
    'Химчистка': [
      { id: '6', name: 'Экспресс-химчистка (2 сиденья)', price: 5000, time: '1 час', crossover: '+30%', minivan: '+50%' },
      { id: '7', name: 'Химчистка салона (без потолка)', price: 13000, time: '3 часа', crossover: '+30%', minivan: '+50%' },
      { id: '8', name: 'Химчистка салона полная (с потолком)', price: 20000, time: '5 часов', crossover: '+30%', minivan: '+50%' },
      { id: '9', name: 'Химчистка потолка', price: 7000, time: '2 часа', crossover: '+30%', minivan: '+50%' },
    ],
    'Стекла и фары': [
      { id: '10', name: 'Полировка фар (пара)', price: 6500, crossover: '+20%', minivan: '+30%' },
      { id: '11', name: 'Антидождь (все стекла)', price: 3500, crossover: '+20%', minivan: '+30%' },
      { id: '12', name: 'Заклейка скола', price: 2500, crossover: '+20%', minivan: '+30%' },
    ],
    'АКБ и электрика': [
      { id: '13', name: 'Запуск автомобиля (прикурить)', price: 2500 },
      { id: '14', name: 'Диагностика АКБ', price: 2000 },
      { id: '15', name: 'Зарядка АКБ (выезд)', price: 5000 },
    ],
  });

  const handleEdit = (category: string, service: Service) => {
    setEditingCategory(category);
    setEditingService(service);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingService) return;
    
    setServices(prev => ({
      ...prev,
      [editingCategory]: prev[editingCategory as keyof typeof prev].map(s => 
        s.id === editingService.id ? editingService : s
      )
    }));
    
    toast({
      title: 'Успешно',
      description: 'Услуга обновлена',
    });
    
    setIsEditOpen(false);
    setEditingService(null);
  };

  const handleDelete = (category: string, serviceId: string) => {
    setServices(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].filter(s => s.id !== serviceId)
    }));
    
    toast({
      title: 'Удалено',
      description: 'Услуга удалена из списка',
      variant: 'destructive',
    });
  };

  const handleAddNew = (category: string) => {
    setEditingCategory(category);
    setEditingService({
      id: Date.now().toString(),
      name: '',
      price: 0,
      time: '',
      crossover: '',
      minivan: ''
    });
    setIsAddOpen(true);
  };

  const handleSaveNew = () => {
    if (!editingService || !editingService.name || editingService.price <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и цену',
        variant: 'destructive',
      });
      return;
    }
    
    setServices(prev => ({
      ...prev,
      [editingCategory]: [...prev[editingCategory as keyof typeof prev], editingService]
    }));
    
    toast({
      title: 'Успешно',
      description: 'Услуга добавлена',
    });
    
    setIsAddOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Wrench" size={24} className="text-primary" />
                Каталог услуг
              </CardTitle>
              <CardDescription>Управление услугами компании</CardDescription>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Icon name="Clock" size={16} className="mr-2" />
              09:00-19:00
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger value="individual">Все услуги</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(services).map(([category, categoryServices], idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                      {category}
                      <Badge variant="secondary" className="ml-2">{categoryServices.length}</Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mb-3 w-full"
                          onClick={() => handleAddNew(category)}
                        >
                          <Icon name="Plus" size={16} className="mr-2" />
                          Добавить услугу в "{category}"
                        </Button>
                        
                        {categoryServices.map((service) => (
                          <div key={service.id} className="p-3 rounded-lg bg-sidebar/20 border border-border/50 hover:border-primary/50 transition-all group">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-medium">{service.name}</div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  {service.time && (
                                    <span className="flex items-center gap-1">
                                      <Icon name="Clock" size={14} />
                                      {service.time}
                                    </span>
                                  )}
                                  {service.crossover && <span>Кроссовер: {service.crossover}</span>}
                                  {service.minivan && <span>Минивэн: {service.minivan}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-xl font-bold text-primary">₽{service.price.toLocaleString()}</div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleEdit(category, service)}
                                  >
                                    <Icon name="Edit" size={16} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleDelete(category, service.id)}
                                  >
                                    <Icon name="Trash2" size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/30">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-info mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-medium mb-1">Дополнительная информация</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Выезд в пределах МКАД — БЕСПЛАТНО при заказе от ₽5,000</li>
                  <li>• Ночное время (19:00-09:00) — +50% к стоимости</li>
                  <li>• Кроссоверы/внедорожники — наценка указана для каждой услуги</li>
                  <li>• Формат "Забрать-Сделать-Вернуть" — доплата от ₽3,000</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать услугу</DialogTitle>
            <DialogDescription>Измените параметры услуги</DialogDescription>
          </DialogHeader>
          
          {editingService && (
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input 
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  placeholder="Название услуги"
                />
              </div>
              <div>
                <Label>Цена (₽)</Label>
                <Input 
                  type="number"
                  value={editingService.price}
                  onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Время выполнения (опционально)</Label>
                <Input 
                  value={editingService.time || ''}
                  onChange={(e) => setEditingService({...editingService, time: e.target.value})}
                  placeholder="1 час"
                />
              </div>
              <div>
                <Label>Наценка кроссовер (опционально)</Label>
                <Input 
                  value={editingService.crossover || ''}
                  onChange={(e) => setEditingService({...editingService, crossover: e.target.value})}
                  placeholder="+30%"
                />
              </div>
              <div>
                <Label>Наценка минивэн (опционально)</Label>
                <Input 
                  value={editingService.minivan || ''}
                  onChange={(e) => setEditingService({...editingService, minivan: e.target.value})}
                  placeholder="+50%"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
            <DialogDescription>Создайте новую услугу в категории "{editingCategory}"</DialogDescription>
          </DialogHeader>
          
          {editingService && (
            <div className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input 
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  placeholder="Название услуги"
                />
              </div>
              <div>
                <Label>Цена (₽) *</Label>
                <Input 
                  type="number"
                  value={editingService.price}
                  onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Время выполнения</Label>
                <Input 
                  value={editingService.time || ''}
                  onChange={(e) => setEditingService({...editingService, time: e.target.value})}
                  placeholder="1 час"
                />
              </div>
              <div>
                <Label>Наценка кроссовер</Label>
                <Input 
                  value={editingService.crossover || ''}
                  onChange={(e) => setEditingService({...editingService, crossover: e.target.value})}
                  placeholder="+30%"
                />
              </div>
              <div>
                <Label>Наценка минивэн</Label>
                <Input 
                  value={editingService.minivan || ''}
                  onChange={(e) => setEditingService({...editingService, minivan: e.target.value})}
                  placeholder="+50%"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveNew}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesSection;
