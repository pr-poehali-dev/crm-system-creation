import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issued_date?: string;
  address?: string;
  birth_date?: string;
  driver_license?: string;
  license_issued_date?: string;
  notes?: string;
  created_at: string;
}

interface ClientsSectionProps {
  initialClientData?: { name: string; phone: string };
  autoOpenAdd?: boolean;
}

export const ClientsSection = ({ initialClientData, autoOpenAdd }: ClientsSectionProps = {}) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(autoOpenAdd || false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newClient, setNewClient] = useState({
    name: initialClientData?.name || '',
    phone: initialClientData?.phone || '',
    email: '',
    passport_series: '',
    passport_number: '',
    passport_issued_by: '',
    passport_issued_date: '',
    address: '',
    birth_date: '',
    driver_license: '',
    license_issued_date: '',
    notes: ''
  });

  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  const handleFileUpload = (file: File, type: 'passport' | 'license') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'passport') {
        setPassportPhoto(base64);
      } else {
        setLicensePhoto(base64);
      }
      toast({
        title: "Фото загружено",
        description: `Фото ${type === 'passport' ? 'паспорта' : 'водительского удостоверения'} успешно загружено`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: ФИО и телефон",
        variant: "destructive",
      });
      return;
    }

    const client: Client = {
      id: Date.now(),
      ...newClient,
      created_at: new Date().toISOString()
    };

    setClients([...clients, client]);
    setIsAddDialogOpen(false);
    setNewClient({
      name: '',
      phone: '',
      email: '',
      passport_series: '',
      passport_number: '',
      passport_issued_by: '',
      passport_issued_date: '',
      address: '',
      birth_date: '',
      driver_license: '',
      license_issued_date: '',
      notes: ''
    });
    setPassportPhoto(null);
    setLicensePhoto(null);

    toast({
      title: "Клиент добавлен",
      description: `${client.name} успешно добавлен в базу`,
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={24} className="text-primary" />
                Клиенты
              </CardTitle>
              <CardDescription>
                База клиентов и их контактная информация
              </CardDescription>
            </div>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить клиента
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="Users" size={32} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Нет клиентов</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Добавьте первого клиента, чтобы начать работу
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить клиента
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <Badge variant="outline">
                        <Icon name="Calendar" size={12} className="mr-1" />
                        {new Date(client.created_at).toLocaleDateString('ru-RU')}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{client.name}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={14} />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size={14} />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.driver_license && (
                        <div className="flex items-center gap-2">
                          <Icon name="CreditCard" size={14} />
                          <span>ВУ: {client.driver_license}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Подробнее
                      <Icon name="ChevronRight" size={16} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления клиента */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить клиента</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом клиенте
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">ФИО *</Label>
                <Input
                  id="name"
                  placeholder="Иванов Иван Иванович"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  placeholder="+7 (999) 123-45-67"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Дата рождения</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={newClient.birth_date}
                  onChange={(e) => setNewClient({ ...newClient, birth_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  placeholder="г. Москва, ул. Примерная, д. 1"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Паспортные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport_series">Серия</Label>
                    <Input
                      id="passport_series"
                      placeholder="1234"
                      maxLength={4}
                      value={newClient.passport_series}
                      onChange={(e) => setNewClient({ ...newClient, passport_series: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Номер</Label>
                    <Input
                      id="passport_number"
                      placeholder="567890"
                      maxLength={6}
                      value={newClient.passport_number}
                      onChange={(e) => setNewClient({ ...newClient, passport_number: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="passport_issued_by">Кем выдан</Label>
                    <Input
                      id="passport_issued_by"
                      placeholder="ОУФМС по г. Москве"
                      value={newClient.passport_issued_by}
                      onChange={(e) => setNewClient({ ...newClient, passport_issued_by: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passport_issued_date">Дата выдачи</Label>
                    <Input
                      id="passport_issued_date"
                      type="date"
                      value={newClient.passport_issued_date}
                      onChange={(e) => setNewClient({ ...newClient, passport_issued_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_photo">Фото паспорта</Label>
                  <div className="flex gap-2">
                    <Input
                      id="passport_photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'passport');
                      }}
                    />
                    {passportPhoto && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(passportPhoto, '_blank')}
                      >
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                    )}
                  </div>
                  {passportPhoto && (
                    <div className="mt-2">
                      <img src={passportPhoto} alt="Паспорт" className="max-h-32 rounded border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Водительское удостоверение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver_license">Номер ВУ</Label>
                    <Input
                      id="driver_license"
                      placeholder="1234 567890"
                      value={newClient.driver_license}
                      onChange={(e) => setNewClient({ ...newClient, driver_license: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_issued_date">Дата выдачи</Label>
                    <Input
                      id="license_issued_date"
                      type="date"
                      value={newClient.license_issued_date}
                      onChange={(e) => setNewClient({ ...newClient, license_issued_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_photo">Фото водительского удостоверения</Label>
                  <div className="flex gap-2">
                    <Input
                      id="license_photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'license');
                      }}
                    />
                    {licensePhoto && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(licensePhoto, '_blank')}
                      >
                        <Icon name="Eye" size={16} className="mr-1" />
                        Просмотр
                      </Button>
                    )}
                  </div>
                  {licensePhoto && (
                    <div className="mt-2">
                      <img src={licensePhoto} alt="Водительское удостоверение" className="max-h-32 rounded border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация о клиенте..."
                rows={3}
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={handleAddClient}
            >
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог деталей клиента */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClient.name}</DialogTitle>
                <DialogDescription>
                  Информация о клиенте
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Контактная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Телефон:</span>
                      <span className="font-medium">{selectedClient.phone}</span>
                    </div>
                    {selectedClient.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Адрес:</span>
                        <span className="font-medium text-right">{selectedClient.address}</span>
                      </div>
                    )}
                    {selectedClient.birth_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Дата рождения:</span>
                        <span className="font-medium">{new Date(selectedClient.birth_date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(selectedClient.passport_series || selectedClient.passport_number) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Паспортные данные</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Серия и номер:</span>
                        <span className="font-medium">
                          {selectedClient.passport_series} {selectedClient.passport_number}
                        </span>
                      </div>
                      {selectedClient.passport_issued_by && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Кем выдан:</span>
                          <span className="font-medium text-right">{selectedClient.passport_issued_by}</span>
                        </div>
                      )}
                      {selectedClient.passport_issued_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дата выдачи:</span>
                          <span className="font-medium">{new Date(selectedClient.passport_issued_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedClient.driver_license && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Водительское удостоверение</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Номер ВУ:</span>
                        <span className="font-medium">{selectedClient.driver_license}</span>
                      </div>
                      {selectedClient.license_issued_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дата выдачи:</span>
                          <span className="font-medium">{new Date(selectedClient.license_issued_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedClient.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Заметки</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Закрыть
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Edit" size={18} className="mr-2" />
                  Редактировать
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsSection;