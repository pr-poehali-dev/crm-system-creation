import { useState, useEffect } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import ClientAnalytics from '@/components/ClientAnalytics';

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
  driver_license_series?: string;
  driver_license_number?: string;
  driver_license_issued_date?: string;
  license_issued_date?: string;
  notes?: string;
  created_at: string;
}

interface ClientsSectionProps {
  initialClientData?: { name: string; phone: string };
  autoOpenAdd?: boolean;
}

const CLIENTS_API = 'https://functions.poehali.dev/c3ce619a-2f5c-4408-845b-21d43e357f57';
const BOOKINGS_API = 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142';

export const ClientsSection = ({ initialClientData, autoOpenAdd }: ClientsSectionProps = {}) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(autoOpenAdd || false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clientBookings, setClientBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

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
    driver_license_series: '',
    driver_license_number: '',
    driver_license_issued_date: '',
    license_issued_date: '',
    notes: ''
  });
  const [clientId, setClientId] = useState<number | null>(null);

  const [passportPhotos, setPassportPhotos] = useState<string[]>([]);
  const [licensePhotos, setLicensePhotos] = useState<string[]>([]);

  // Автосохранение клиента
  useAutoSave({
    data: newClient,
    enabled: isAddDialogOpen && newClient.name && newClient.phone,
    onSave: async (data) => {
      const clientData = { ...data, id: clientId, status: 'Черновик' };
      const response = await fetch(CLIENTS_API, {
        method: clientId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (response.ok) {
        const result = await response.json();
        if (!clientId && result.client?.id) {
          setClientId(result.client.id);
        }
      }
    },
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(CLIENTS_API);
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список клиентов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientBookings = async (clientId: number) => {
    try {
      setIsLoadingBookings(true);
      const response = await fetch(BOOKINGS_API);
      const data = await response.json();
      // Фильтруем заказы по ID клиента (или по имени/телефону)
      const clientName = selectedClient?.name;
      const clientPhone = selectedClient?.phone;
      const bookings = data.bookings?.filter((b: any) => 
        b.client_name === clientName || b.client_phone === clientPhone
      ) || [];
      setClientBookings(bookings);
    } catch (error) {
      console.error('Error loading client bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleFileUpload = (file: File, type: 'passport' | 'license', index: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'passport') {
        const updated = [...passportPhotos];
        updated[index] = base64;
        setPassportPhotos(updated);
      } else {
        const updated = [...licensePhotos];
        updated[index] = base64;
        setLicensePhotos(updated);
      }
      toast({
        title: "Фото загружено",
        description: `Фото ${type === 'passport' ? 'паспорта' : 'водительского удостоверения'} ${index + 1} успешно загружено`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля: ФИО и телефон",
        variant: "destructive",
      });
      return;
    }

    try {
      const clientData = { 
        ...newClient, 
        id: clientId,
        status: 'Активен'
      };
      
      const response = await fetch(CLIENTS_API, {
        method: clientId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save client');
      }
      
      const data = await response.json();
      
      setIsAddDialogOpen(false);
      setClientId(null);
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
        driver_license_series: '',
        driver_license_number: '',
        driver_license_issued_date: '',
        license_issued_date: '',
        notes: ''
      });
      setPassportPhotos([]);
      setLicensePhotos([]);

      toast({
        title: clientId ? "Клиент обновлён" : "Клиент добавлен",
        description: `${newClient.name} успешно ${clientId ? 'обновлён' : 'добавлен в базу'}`,
      });
      
      await loadClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить клиента",
        variant: "destructive",
      });
    }
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
                База клиентов и аналитика продаж
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

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="mx-6">
            <TabsTrigger value="clients">База клиентов</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-0">

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
                    </div>

                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Icon name="Eye" size={14} className="mr-1" />
                        Открыть
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm(`Удалить клиента ${client.name}?`)) return;
                          
                          try {
                            const response = await fetch(`${CLIENTS_API}?id=${client.id}`, {
                              method: 'DELETE'
                            });
                            
                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({}));
                              throw new Error(errorData.error || 'Failed to delete');
                            }
                            
                            toast({
                              title: "Клиент удалён",
                              description: `${client.name} удалён из базы`,
                            });
                            
                            await loadClients();
                          } catch (error: any) {
                            console.error('Delete error:', error);
                            toast({
                              title: "Ошибка",
                              description: error.message || "Не удалось удалить клиента",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </CardContent>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 px-6 pb-6">
            <ClientAnalytics clients={clients} />
          </TabsContent>
        </Tabs>
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

                <div className="space-y-4">
                  <Label>Фото паспорта (до 2 файлов)</Label>
                  
                  <div className="space-y-3">
                    {[0, 1].map((index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Label className="text-sm text-muted-foreground min-w-[80px]">Файл {index + 1}:</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'passport', index);
                            }}
                          />
                          {passportPhotos[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(passportPhotos[index], '_blank')}
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                          )}
                        </div>
                        {passportPhotos[index] && (
                          <div className="ml-[92px]">
                            <img src={passportPhotos[index]} alt={`Паспорт ${index + 1}`} className="max-h-32 rounded border" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                    <Label htmlFor="driver_license_series">Серия ВУ</Label>
                    <Input
                      id="driver_license_series"
                      placeholder="1234"
                      maxLength={4}
                      value={newClient.driver_license_series}
                      onChange={(e) => setNewClient({ ...newClient, driver_license_series: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_license_number">Номер ВУ</Label>
                    <Input
                      id="driver_license_number"
                      placeholder="567890"
                      maxLength={6}
                      value={newClient.driver_license_number}
                      onChange={(e) => setNewClient({ ...newClient, driver_license_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_license_issued_date">Дата выдачи</Label>
                    <Input
                      id="driver_license_issued_date"
                      type="date"
                      value={newClient.driver_license_issued_date}
                      onChange={(e) => setNewClient({ ...newClient, driver_license_issued_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Фото водительского удостоверения (до 2 файлов)</Label>
                  
                  <div className="space-y-3">
                    {[0, 1].map((index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Label className="text-sm text-muted-foreground min-w-[80px]">Файл {index + 1}:</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'license', index);
                            }}
                          />
                          {licensePhotos[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(licensePhotos[index], '_blank')}
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                          )}
                        </div>
                        {licensePhotos[index] && (
                          <div className="ml-[92px]">
                            <img src={licensePhotos[index]} alt={`ВУ ${index + 1}`} className="max-h-32 rounded border" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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

      {/* Диалог клиента с вкладками */}
      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
        setIsDetailDialogOpen(open);
        if (open && selectedClient) {
          setEditClient(selectedClient);
          loadClientBookings(selectedClient.id);
        } else {
          setEditClient(null);
          setClientBookings([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">{editClient.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">{editClient.phone}</div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary"
                    onClick={() => {
                      // Здесь открываем форму создания заказа с предзаполненными данными клиента
                      setIsDetailDialogOpen(false);
                      // TODO: Открыть BookingWizard с данными клиента
                    }}
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать заказ
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Информация</TabsTrigger>
                  <TabsTrigger value="orders">История заказов</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>ФИО *</Label>
                    <Input
                      value={editClient.name || ''}
                      onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Телефон *</Label>
                    <Input
                      value={editClient.phone || ''}
                      onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editClient.email || ''}
                      onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Дата рождения</Label>
                    <Input
                      type="date"
                      value={editClient.birth_date || ''}
                      onChange={(e) => setEditClient({ ...editClient, birth_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Адрес</Label>
                    <Input
                      value={editClient.address || ''}
                      onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Паспорт (серия)</Label>
                    <Input
                      value={editClient.passport_series || ''}
                      onChange={(e) => setEditClient({ ...editClient, passport_series: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Паспорт (номер)</Label>
                    <Input
                      value={editClient.passport_number || ''}
                      onChange={(e) => setEditClient({ ...editClient, passport_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ВУ (серия)</Label>
                    <Input
                      value={editClient.driver_license_series || ''}
                      onChange={(e) => setEditClient({ ...editClient, driver_license_series: e.target.value })}
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ВУ (номер)</Label>
                    <Input
                      value={editClient.driver_license_number || ''}
                      onChange={(e) => setEditClient({ ...editClient, driver_license_number: e.target.value })}
                      maxLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Дата выдачи ВУ</Label>
                    <Input
                      type="date"
                      value={editClient.driver_license_issued_date || ''}
                      onChange={(e) => setEditClient({ ...editClient, driver_license_issued_date: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Заметки</Label>
                    <Textarea
                      value={editClient.notes || ''}
                      onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                    onClick={async () => {
                      if (!editClient.name || !editClient.phone) {
                        toast({
                          title: "Ошибка",
                          description: "Заполните обязательные поля: ФИО и телефон",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        const response = await fetch(CLIENTS_API, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editClient)
                        });
                        
                        if (!response.ok) throw new Error('Failed to update client');
                        
                        toast({
                          title: "✅ Клиент обновлён",
                          description: `Данные ${editClient.name} успешно обновлены`,
                        });
                        
                        setIsDetailDialogOpen(false);
                        await loadClients();
                      } catch (error) {
                        console.error('Update error:', error);
                        toast({
                          title: "Ошибка",
                          description: "Не удалось обновить клиента",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-3 mt-4">
                {isLoadingBookings ? (
                  <div className="text-center py-12">
                    <Icon name="Loader2" size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                    <p className="text-muted-foreground">Загрузка заказов...</p>
                  </div>
                ) : clientBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="mb-2">У клиента пока нет заказов</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        // TODO: Открыть форму создания заказа
                      }}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Создать первый заказ
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientBookings.map((booking) => (
                      <Card key={booking.id} className="hover:border-primary/50 transition-all cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name="Car" size={16} className="text-primary" />
                                <span className="font-medium">{booking.vehicle_model || 'Автомобиль'}</span>
                                {booking.vehicle_license_plate && (
                                  <Badge variant="outline" className="text-xs">{booking.vehicle_license_plate}</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {booking.start_date && (
                                  <div className="flex items-center gap-2">
                                    <Icon name="Calendar" size={14} />
                                    <span>{new Date(booking.start_date).toLocaleDateString('ru-RU')} - {booking.end_date ? new Date(booking.end_date).toLocaleDateString('ru-RU') : '?'}</span>
                                  </div>
                                )}
                                {booking.pickup_location && (
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" size={14} />
                                    <span>{booking.pickup_location} → {booking.dropoff_location || '?'}</span>
                                  </div>
                                )}
                                {booking.total_price && (
                                  <div className="flex items-center gap-2">
                                    <Icon name="Wallet" size={14} />
                                    <span className="font-medium">{booking.total_price.toLocaleString()} ₽</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={cn(
                              booking.status === 'Бронь' && 'bg-blue-500',
                              booking.status === 'Услуга' && 'bg-purple-500',
                              booking.status === 'Черновик' && 'bg-gray-500'
                            )}>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsSection;