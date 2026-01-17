import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface VehicleChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleModel?: string;
  vehiclePlate?: string;
  checklistType: 'pickup' | 'return';
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  required: boolean;
  status?: 'ok' | 'issue' | 'not_checked';
  notes?: string;
}

export const VehicleChecklistDialog = ({ 
  open, 
  onOpenChange, 
  vehicleModel = 'Hyundai Grand Starex',
  vehiclePlate = 'А123ВС777',
  checklistType 
}: VehicleChecklistDialogProps) => {
  const { toast } = useToast();

  const pickupChecklist: Record<string, ChecklistItem[]> = {
    'Документы': [
      { id: '1', category: 'Документы', item: 'Проверка паспорта клиента', description: 'Сверить данные с договором', required: true },
      { id: '2', category: 'Документы', item: 'Проверка водительского удостоверения', description: 'Стаж минимум 2 года', required: true },
      { id: '3', category: 'Документы', item: 'Подписание договора', description: 'Все подписи на месте', required: true },
    ],
    'Финансы': [
      { id: '4', category: 'Финансы', item: 'Получение залога', description: 'Сумма согласно тарифу', required: true },
      { id: '5', category: 'Финансы', item: 'Оплата аренды', description: 'Полная или частичная оплата', required: true },
    ],
    'Кузов': [
      { id: '6', category: 'Кузов', item: 'Осмотр внешнего состояния', description: 'Царапины, вмятины, сколы', required: true },
      { id: '7', category: 'Кузов', item: 'Фотофиксация повреждений', description: 'Фото всех 4 сторон + крупные дефекты', required: true },
    ],
    'Салон': [
      { id: '8', category: 'Салон', item: 'Чистота салона', description: 'Нет мусора и грязи', required: true },
      { id: '9', category: 'Салон', item: 'Состояние сидений', description: 'Нет пятен, порезов', required: true },
      { id: '10', category: 'Салон', item: 'Комплектность', description: 'Огнетушитель, аптечка, знак', required: true },
    ],
    'Техническое': [
      { id: '11', category: 'Техническое', item: 'Уровень топлива', description: 'Записать текущий уровень', required: true },
      { id: '12', category: 'Техническое', item: 'Показания одометра', description: 'Зафиксировать пробег', required: true },
      { id: '13', category: 'Техническое', item: 'Работа всех систем', description: 'Свет, кондиционер, стеклоподъёмники', required: true },
      { id: '14', category: 'Техническое', item: 'Давление в шинах', description: 'Визуальная проверка', required: false },
    ],
    'Дополнительно': [
      { id: '15', category: 'Дополнительно', item: 'Инструктаж клиента', description: 'Объяснить особенности управления', required: false },
    ],
  };

  const returnChecklist: Record<string, ChecklistItem[]> = {
    'Кузов': [
      { id: '1', category: 'Кузов', item: 'Осмотр на новые повреждения', description: 'Сравнить с актом выдачи', required: true },
      { id: '2', category: 'Кузов', item: 'Фотофиксация новых повреждений', description: 'Если обнаружены', required: false },
    ],
    'Салон': [
      { id: '3', category: 'Салон', item: 'Чистота салона', description: 'Проверка на загрязнения', required: true },
      { id: '4', category: 'Салон', item: 'Запах в салоне', description: 'Табак, животные, другие', required: true },
      { id: '5', category: 'Салон', item: 'Комплектность', description: 'Все аксессуары на месте', required: true },
    ],
    'Техническое': [
      { id: '6', category: 'Техническое', item: 'Уровень топлива', description: 'Сравнить с договором', required: true },
      { id: '7', category: 'Техническое', item: 'Показания одометра', description: 'Рассчитать пробег', required: true },
      { id: '8', category: 'Техническое', item: 'Работа всех систем', description: 'Проверка электроники', required: true },
      { id: '9', category: 'Техническое', item: 'Сигнальные лампы', description: 'Check Engine и другие ошибки', required: true },
    ],
    'Финансы': [
      { id: '10', category: 'Финансы', item: 'Расчёт доплаты', description: 'За пробег, повреждения, топливо', required: true },
      { id: '11', category: 'Финансы', item: 'Возврат залога', description: 'Если нет претензий', required: true },
    ],
    'Документы': [
      { id: '12', category: 'Документы', item: 'Подписание акта приёма-передачи', description: 'Клиент подтверждает возврат', required: true },
    ],
  };

  const [items, setItems] = useState<Record<string, ChecklistItem[]>>(
    checklistType === 'pickup' ? pickupChecklist : returnChecklist
  );

  const [globalNotes, setGlobalNotes] = useState('');

  const handleStatusChange = (categoryKey: string, itemId: string, status: 'ok' | 'issue' | 'not_checked') => {
    setItems(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map(item =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));
  };

  const handleNotesChange = (categoryKey: string, itemId: string, notes: string) => {
    setItems(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map(item =>
        item.id === itemId ? { ...item, notes } : item
      ),
    }));
  };

  const handleComplete = () => {
    const allRequired = Object.values(items).flat().filter(item => item.required);
    const checkedRequired = allRequired.filter(item => item.status === 'ok' || item.status === 'issue');
    
    if (checkedRequired.length < allRequired.length) {
      toast({
        title: "Не все обязательные пункты проверены",
        description: `Проверено ${checkedRequired.length} из ${allRequired.length} обязательных пунктов`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Чек-лист завершён",
      description: `Проверка ${checklistType === 'pickup' ? 'выдачи' : 'приёмки'} завершена успешно`,
    });
    onOpenChange(false);
  };

  const getTotalProgress = () => {
    const all = Object.values(items).flat();
    const checked = all.filter(item => item.status === 'ok' || item.status === 'issue');
    return { checked: checked.length, total: all.length };
  };

  const progress = getTotalProgress();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={24} className="text-primary" />
            {checklistType === 'pickup' ? 'Выдача автомобиля' : 'Приёмка автомобиля'}
          </DialogTitle>
          <DialogDescription>
            {vehicleModel} • {vehiclePlate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Прогресс проверки</div>
              <div className="text-sm text-muted-foreground">
                {progress.checked} из {progress.total} пунктов проверено
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">
              {Math.round((progress.checked / progress.total) * 100)}%
            </div>
          </div>

          <Accordion type="multiple" className="w-full" defaultValue={Object.keys(items)}>
            {Object.entries(items).map(([category, categoryItems]) => {
              const categoryChecked = categoryItems.filter(item => item.status === 'ok' || item.status === 'issue').length;
              const categoryTotal = categoryItems.length;
              
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold">{category}</span>
                      <Badge variant="secondary">
                        {categoryChecked}/{categoryTotal}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="p-4 rounded-lg border border-border bg-card">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="font-medium">{item.item}</Label>
                                {item.required && (
                                  <Badge variant="destructive" className="text-xs">Обязательно</Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                              )}
                              
                              <RadioGroup 
                                value={item.status || 'not_checked'}
                                onValueChange={(value) => handleStatusChange(category, item.id, value as any)}
                                className="flex gap-4 mb-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="ok" id={`${item.id}-ok`} />
                                  <Label htmlFor={`${item.id}-ok`} className="cursor-pointer flex items-center gap-1">
                                    <Icon name="CheckCircle" size={16} className="text-success" />
                                    ОК
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="issue" id={`${item.id}-issue`} />
                                  <Label htmlFor={`${item.id}-issue`} className="cursor-pointer flex items-center gap-1">
                                    <Icon name="AlertCircle" size={16} className="text-destructive" />
                                    Проблема
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="not_checked" id={`${item.id}-not`} />
                                  <Label htmlFor={`${item.id}-not`} className="cursor-pointer flex items-center gap-1">
                                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                                    Не проверено
                                  </Label>
                                </div>
                              </RadioGroup>

                              {item.status === 'issue' && (
                                <Textarea
                                  placeholder="Опишите проблему..."
                                  value={item.notes || ''}
                                  onChange={(e) => handleNotesChange(category, item.id, e.target.value)}
                                  rows={2}
                                  className="mt-2"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="space-y-2">
            <Label>Общие примечания</Label>
            <Textarea
              placeholder="Дополнительная информация о состоянии автомобиля..."
              value={globalNotes}
              onChange={(e) => setGlobalNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={handleComplete}
          >
            <Icon name="CheckCircle" size={18} className="mr-2" />
            Завершить проверку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleChecklistDialog;
