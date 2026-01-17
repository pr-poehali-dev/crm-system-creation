import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export const SettingsSection = () => {
  const { toast } = useToast();
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    balance: 0
  });
  
  const employees = [
    { id: 1, name: 'Иванов Иван', position: 'Мастер', phone: '+7 (999) 111-11-11', email: 'ivanov@rf.ru', balance: 25000, active: true },
    { id: 2, name: 'Петрова Анна', position: 'Менеджер', phone: '+7 (999) 222-22-22', email: 'petrova@rf.ru', balance: 35000, active: true },
    { id: 3, name: 'Сидоров Петр', position: 'Детейлер', phone: '+7 (999) 333-33-33', email: 'sidorov@rf.ru', balance: 28000, active: true },
    { id: 4, name: 'Козлова Мария', position: 'Администратор', phone: '+7 (999) 444-44-44', email: 'kozlova@rf.ru', balance: 30000, active: false },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={24} className="text-primary" />
          Настройки системы
        </CardTitle>
        <CardDescription>Управление параметрами CRM и сотрудниками</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company">Компания</TabsTrigger>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название компании</Label>
                  <Input defaultValue="Русская Фантазия" />
                </div>
                <div className="space-y-2">
                  <Label>ИНН</Label>
                  <Input defaultValue="7701234567" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input defaultValue="+7 (495) 123-45-67" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@russkaya-fantaziya.ru" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input defaultValue="г. Москва, ул. Тверская, д. 1" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Рабочие часы</div>
                  <div className="text-sm text-muted-foreground">Отображается клиентам</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Пн-Вс: 9:00 - 21:00</div>
                  <Button variant="link" size="sm">Изменить</Button>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить изменения
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">Всего сотрудников: {employees.length}</div>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary"
                onClick={() => setIsAddEmployeeOpen(true)}
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить сотрудника
              </Button>
            </div>

            {employees.map((employee) => (
              <div key={employee.id} className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.position}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Телефон</div>
                        <div className="font-medium text-sm">{employee.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium text-sm">{employee.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Баланс</div>
                        <div className="font-medium text-primary">₽{employee.balance.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={employee.active} />
                    <Button variant="ghost" size="icon">
                      <Icon name="MoreVertical" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">Email уведомления</div>
                  <div className="text-sm text-muted-foreground">Получать уведомления о новых заявках</div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">Telegram уведомления</div>
                  <div className="text-sm text-muted-foreground">Отправлять уведомления в Telegram бот</div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">WhatsApp уведомления</div>
                  <div className="text-sm text-muted-foreground">Отправлять клиентам напоминания в WhatsApp</div>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">SMS уведомления</div>
                  <div className="text-sm text-muted-foreground">Отправлять SMS о статусе заявки</div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Email для уведомлений</Label>
                <Input type="email" defaultValue="notifications@russkaya-fantaziya.ru" />
              </div>

              <div className="space-y-2">
                <Label>Telegram Bot Token</Label>
                <Input type="password" defaultValue="••••••••••••••••" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={24} className="text-primary" />
              Добавить сотрудника
            </DialogTitle>
            <DialogDescription>
              Заполните данные нового сотрудника
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ФИО *</Label>
                <Input 
                  placeholder="Иванов Иван Иванович"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Должность *</Label>
                <Input 
                  placeholder="Менеджер"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input 
                  placeholder="+7 (999) 123-45-67"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  placeholder="email@example.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Начальный баланс (₽)</Label>
              <Input 
                type="number"
                placeholder="0"
                value={newEmployee.balance}
                onChange={(e) => setNewEmployee({...newEmployee, balance: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
              Отмена
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => {
                if (!newEmployee.name || !newEmployee.position || !newEmployee.phone || !newEmployee.email) {
                  toast({
                    title: 'Ошибка',
                    description: 'Заполните все обязательные поля',
                    variant: 'destructive'
                  });
                  return;
                }
                toast({
                  title: '✅ Сотрудник добавлен',
                  description: `${newEmployee.name} успешно добавлен в систему`
                });
                setIsAddEmployeeOpen(false);
                setNewEmployee({ name: '', position: '', phone: '', email: '', balance: 0 });
              }}
            >
              <Icon name="Save" size={18} className="mr-2" />
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SettingsSection;