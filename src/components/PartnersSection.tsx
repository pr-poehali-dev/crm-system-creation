import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Partner {
  id: string;
  type: 'subrentcontractor' | 'contractor';
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  telegram_username?: string;
  telegram_link?: string;
  
  // Юридические данные
  legal_name?: string;
  inn?: string;
  kpp?: string;
  legal_address?: string;
  
  // Банковские реквизиты
  bank_name?: string;
  bank_account?: string;
  correspondent_account?: string;
  bik?: string;
  
  // Паспорт контактного лица
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issued_date?: string;
  
  // Для субаренды автомобилей
  vehicles?: Array<{
    model: string;
    license_plate: string;
    daily_rate: number;
    notes?: string;
  }>;
  
  // Для подрядчиков услуг
  services?: Array<{
    name: string;
    price: number;
    unit: string;
    notes?: string;
  }>;
  
  notes?: string;
  documents?: File[];
  created_at: string;
}

export const PartnersSection = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [formData, setFormData] = useState<Partial<Partner>>({
    type: 'subrent',
    vehicles: [],
    services: [],
    documents: [],
  });

  const updateFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const addVehicle = () => {
    updateFormData('vehicles', [
      ...(formData.vehicles || []),
      { model: '', license_plate: '', daily_rate: 0, notes: '' }
    ]);
  };

  const updateVehicle = (index: number, key: string, value: any) => {
    const updated = [...(formData.vehicles || [])];
    updated[index] = { ...updated[index], [key]: value };
    updateFormData('vehicles', updated);
  };

  const removeVehicle = (index: number) => {
    const updated = (formData.vehicles || []).filter((_, i) => i !== index);
    updateFormData('vehicles', updated);
  };

  const addService = () => {
    updateFormData('services', [
      ...(formData.services || []),
      { name: '', price: 0, unit: '', notes: '' }
    ]);
  };

  const updateService = (index: number, key: string, value: any) => {
    const updated = [...(formData.services || [])];
    updated[index] = { ...updated[index], [key]: value };
    updateFormData('services', updated);
  };

  const removeService = (index: number) => {
    const updated = (formData.services || []).filter((_, i) => i !== index);
    updateFormData('services', updated);
  };

  const handleSave = () => {
    if (!formData.company_name || !formData.contact_person || !formData.phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const newPartner: Partner = {
      id: editingPartner?.id || Date.now().toString(),
      ...formData as Partner,
      created_at: editingPartner?.created_at || new Date().toISOString(),
    };

    if (editingPartner) {
      setPartners(partners.map(p => p.id === editingPartner.id ? newPartner : p));
      toast({ title: 'Партнёр обновлён' });
    } else {
      setPartners([...partners, newPartner]);
      toast({ title: 'Партнёр добавлен' });
    }

    setIsFormOpen(false);
    setEditingPartner(null);
    setFormData({ type: 'subrent', vehicles: [], services: [], documents: [] });
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData(partner);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setPartners(partners.filter(p => p.id !== id));
    toast({ title: 'Партнёр удалён', variant: 'destructive' });
  };

  const getPartnerTypeLabel = (type: string) => {
    return type === 'subrent' ? 'Субаренда авто' : 'Подрядчик услуг';
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Handshake" size={24} className="text-primary" />
                Партнёры и подрядчики
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Управление партнёрами: субаренда автомобилей и подрядчики услуг
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить партнёра
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{partner.company_name}</CardTitle>
                        <Badge variant={partner.type === 'subrent' ? 'default' : 'secondary'}>
                          {getPartnerTypeLabel(partner.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {partner.contact_person} • {partner.phone}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(partner)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(partner.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {partner.type === 'subrent' && partner.vehicles && partner.vehicles.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Автомобили:</div>
                      {partner.vehicles.map((vehicle, idx) => (
                        <div key={idx} className="text-sm p-2 bg-sidebar/20 rounded mb-1">
                          {vehicle.model} ({vehicle.license_plate}) — {vehicle.daily_rate}₽/сутки
                        </div>
                      ))}
                    </div>
                  )}

                  {partner.type === 'contractor' && partner.services && partner.services.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Услуги:</div>
                      {partner.services.map((service, idx) => (
                        <div key={idx} className="text-sm p-2 bg-sidebar/20 rounded mb-1">
                          {service.name} — {service.price}₽/{service.unit}
                        </div>
                      ))}
                    </div>
                  )}

                  {partner.notes && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      {partner.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {partners.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Handshake" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нет добавленных партнёров</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить первого партнёра
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Форма добавления/редактирования */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Handshake" size={24} />
              {editingPartner ? 'Редактировать партнёра' : 'Добавить партнёра'}
            </DialogTitle>
            <DialogDescription>
              Заполните данные о партнёре или подрядчике
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="main">Основное</TabsTrigger>
              <TabsTrigger value="legal">Юр.данные</TabsTrigger>
              <TabsTrigger value="items">Авто/Услуги</TabsTrigger>
              <TabsTrigger value="passport">Паспорт</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Тип партнёра *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => updateFormData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subrent">Субаренда автомобилей</SelectItem>
                    <SelectItem value="contractor">Подрядчик услуг</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название компании *</Label>
                  <Input
                    placeholder="ООО Партнёр"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Контактное лицо *</Label>
                  <Input
                    placeholder="Иванов Иван Иванович"
                    value={formData.contact_person}
                    onChange={(e) => updateFormData('contact_person', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Телефон *</Label>
                  <Input
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telegram username</Label>
                  <Input
                    placeholder="@username"
                    value={formData.telegram_username}
                    onChange={(e) => updateFormData('telegram_username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ссылка на Telegram</Label>
                  <Input
                    placeholder="https://t.me/username"
                    value={formData.telegram_link}
                    onChange={(e) => updateFormData('telegram_link', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Заметки</Label>
                <Textarea
                  placeholder="Дополнительная информация"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="legal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Юридическое название</Label>
                <Input
                  placeholder="ООО «Партнёр»"
                  value={formData.legal_name}
                  onChange={(e) => updateFormData('legal_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ИНН</Label>
                  <Input
                    placeholder="1234567890"
                    value={formData.inn}
                    onChange={(e) => updateFormData('inn', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>КПП</Label>
                  <Input
                    placeholder="123456789"
                    value={formData.kpp}
                    onChange={(e) => updateFormData('kpp', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Юридический адрес</Label>
                <Textarea
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  value={formData.legal_address}
                  onChange={(e) => updateFormData('legal_address', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Название банка</Label>
                <Input
                  placeholder="ПАО Сбербанк"
                  value={formData.bank_name}
                  onChange={(e) => updateFormData('bank_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Расчётный счёт</Label>
                  <Input
                    placeholder="40702810..."
                    value={formData.bank_account}
                    onChange={(e) => updateFormData('bank_account', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>БИК</Label>
                  <Input
                    placeholder="044525225"
                    value={formData.bik}
                    onChange={(e) => updateFormData('bik', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Корреспондентский счёт</Label>
                <Input
                  placeholder="30101810..."
                  value={formData.correspondent_account}
                  onChange={(e) => updateFormData('correspondent_account', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 mt-4">
              {formData.type === 'subrent' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Автомобили</CardTitle>
                      <Button size="sm" onClick={addVehicle}>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить авто
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(formData.vehicles || []).map((vehicle, idx) => (
                      <div key={idx} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Автомобиль #{idx + 1}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeVehicle(idx)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Модель"
                            value={vehicle.model}
                            onChange={(e) => updateVehicle(idx, 'model', e.target.value)}
                          />
                          <Input
                            placeholder="Гос. номер"
                            value={vehicle.license_plate}
                            onChange={(e) => updateVehicle(idx, 'license_plate', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="₽/сутки"
                            value={vehicle.daily_rate}
                            onChange={(e) => updateVehicle(idx, 'daily_rate', Number(e.target.value))}
                          />
                        </div>
                        <Input
                          placeholder="Заметки"
                          value={vehicle.notes}
                          onChange={(e) => updateVehicle(idx, 'notes', e.target.value)}
                        />
                      </div>
                    ))}
                    {(formData.vehicles || []).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Добавьте автомобили, которые берёте в субаренду
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {formData.type === 'contractor' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Услуги</CardTitle>
                      <Button size="sm" onClick={addService}>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить услугу
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(formData.services || []).map((service, idx) => (
                      <div key={idx} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Услуга #{idx + 1}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeService(idx)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Название услуги"
                            value={service.name}
                            onChange={(e) => updateService(idx, 'name', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Цена"
                            value={service.price}
                            onChange={(e) => updateService(idx, 'price', Number(e.target.value))}
                          />
                          <Input
                            placeholder="Единица"
                            value={service.unit}
                            onChange={(e) => updateService(idx, 'unit', e.target.value)}
                          />
                        </div>
                        <Input
                          placeholder="Заметки"
                          value={service.notes}
                          onChange={(e) => updateService(idx, 'notes', e.target.value)}
                        />
                      </div>
                    ))}
                    {(formData.services || []).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Добавьте услуги, которые оказывает подрядчик
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="passport" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Паспорт контактного лица</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Серия</Label>
                      <Input
                        placeholder="0319"
                        value={formData.passport_series}
                        onChange={(e) => updateFormData('passport_series', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Номер</Label>
                      <Input
                        placeholder="547170"
                        value={formData.passport_number}
                        onChange={(e) => updateFormData('passport_number', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Кем выдан</Label>
                    <Textarea
                      placeholder="ГУ МВД России..."
                      value={formData.passport_issued_by}
                      onChange={(e) => updateFormData('passport_issued_by', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Дата выдачи</Label>
                    <Input
                      type="date"
                      value={formData.passport_issued_date}
                      onChange={(e) => updateFormData('passport_issued_date', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersSection;
