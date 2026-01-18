import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRequest: any;
  setNewRequest: (req: any) => void;
  selectedServices: Array<{id: string; name: string; price: number; adjustedPrice: number}>;
  setSelectedServices: (services: any) => void;
  requestCustomFields: Array<{id: string; name: string; type: string; value: any}>;
  addRequestCustomField: () => void;
  updateRequestCustomField: (id: string, key: string, value: any) => void;
  removeRequestCustomField: (id: string) => void;
  services: any[];
  fleet: any[];
  calculatePrice: () => number;
  onSubmit: () => void;
}

export const NewRequestDialog = ({
  open,
  onOpenChange,
  newRequest,
  setNewRequest,
  selectedServices,
  setSelectedServices,
  requestCustomFields,
  addRequestCustomField,
  updateRequestCustomField,
  removeRequestCustomField,
  services,
  fleet,
  calculatePrice,
  onSubmit,
}: NewRequestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div></div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание новой заявки</DialogTitle>
          <DialogDescription>Заполните данные для формирования заявки с автоматическим расчётом стоимости</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="main">Основная инфо</TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1">
              <Icon name="Plus" size={14} />
              Свои поля
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-4">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Клиент</Label>
                  <Input 
                    id="client" 
                    placeholder="ФИО или название компании"
                    value={newRequest.client}
                    onChange={(e) => setNewRequest({...newRequest, client: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input 
                    id="phone" 
                    placeholder="+7 (999) 123-45-67"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({...newRequest, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Услуги (можно выбрать несколько)</Label>
                <div className="p-4 border rounded-lg space-y-3 bg-sidebar/30">
                  {services.map(service => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    const selectedService = selectedServices.find(s => s.id === service.id);
                    
                    return (
                      <div key={service.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices([...selectedServices, {
                                id: service.id,
                                name: service.name,
                                price: service.price,
                                adjustedPrice: service.price
                              }]);
                              if (service.id === 'rent') {
                                setNewRequest({...newRequest, service: 'rent'});
                              }
                            } else {
                              setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                              if (service.id === 'rent') {
                                setNewRequest({...newRequest, service: ''});
                              }
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Базовая: ₽{service.price.toLocaleString()} / {service.unit}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Цена:</Label>
                            <Input
                              type="number"
                              className="w-28"
                              value={selectedService?.adjustedPrice || service.price}
                              onChange={(e) => {
                                setSelectedServices(selectedServices.map(s => 
                                  s.id === service.id 
                                    ? {...s, adjustedPrice: parseInt(e.target.value) || 0}
                                    : s
                                ));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedServices.some(s => s.id === 'rent') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="car">Автомобиль</Label>
                    <Select value={newRequest.car} onValueChange={(val) => setNewRequest({...newRequest, car: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите авто" />
                      </SelectTrigger>
                      <SelectContent>
                        {fleet.filter(c => c.status === 'Свободен').map(c => (
                          <SelectItem key={c.id} value={c.model}>
                            {c.model} ({c.license_plate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="days">Количество суток</Label>
                      <Input 
                        id="days" 
                        type="number" 
                        min="1"
                        value={newRequest.days}
                        onChange={(e) => setNewRequest({...newRequest, days: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="km">Километраж</Label>
                      <Input 
                        id="km" 
                        type="number" 
                        min="0"
                        placeholder="км"
                        value={newRequest.km}
                        onChange={(e) => setNewRequest({...newRequest, km: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Дополнительная информация..."
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                  rows={3}
                />
              </div>

              {selectedServices.length > 0 && (
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Расчёт стоимости</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedServices.map(service => (
                        <div key={service.id} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span className="font-medium">₽{service.adjustedPrice.toLocaleString()}</span>
                        </div>
                      ))}
                      {selectedServices.some(s => s.id === 'rent') && (
                        <>
                          {newRequest.days > 1 && (
                            <div className="flex justify-between text-sm">
                              <span>Доп. дни ({newRequest.days - 1} сут × ₽5,000)</span>
                              <span className="font-medium">₽{(5000 * (newRequest.days - 1)).toLocaleString()}</span>
                            </div>
                          )}
                          {newRequest.km > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Пробег ({newRequest.km} км × ₽15)</span>
                              <span className="font-medium">₽{(15 * newRequest.km).toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Итого:</span>
                        <span className="text-primary">₽{calculatePrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="p-4 bg-info/10 rounded-lg border border-info/30 mb-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-info mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Добавьте свои поля в заявку</p>
                  <p className="text-muted-foreground">
                    Пометки, особенности, дополнительные услуги и любые другие параметры
                  </p>
                </div>
              </div>
            </div>

            {requestCustomFields.map((field) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-sidebar/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название поля</Label>
                    <Input
                      placeholder="Напр.: Доп. услуги, Контакт, Особенности"
                      value={field.name}
                      onChange={(e) => updateRequestCustomField(field.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Тип поля</Label>
                    <Select value={field.type} onValueChange={(val) => updateRequestCustomField(field.id, 'type', val)}>
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
                        onChange={(e) => updateRequestCustomField(field.id, 'value', e.target.value)}
                        rows={3}
                      />
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 h-10">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => updateRequestCustomField(field.id, 'value', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-muted-foreground">{field.value ? 'Да' : 'Нет'}</span>
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder="Введите значение"
                        value={field.value}
                        onChange={(e) => updateRequestCustomField(field.id, 'value', e.target.value)}
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => removeRequestCustomField(field.id)}
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addRequestCustomField}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить поле
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={onSubmit}
          >
            Создать заявку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
