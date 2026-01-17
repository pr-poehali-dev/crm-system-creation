import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';

interface Integration {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  description: string;
  isActive: boolean;
  config?: any;
}

export const IntegrationsPage = () => {
  const { toast } = useToast();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'avito',
      name: 'Avito',
      type: 'marketplace',
      icon: 'ShoppingBag',
      color: 'from-blue-500 to-blue-600',
      description: 'Автоматическое размещение объявлений об аренде автомобилей',
      isActive: false,
      config: {
        client_id: '',
        client_secret: '',
        user_id: '',
      },
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      type: 'messenger',
      icon: 'Send',
      color: 'from-blue-400 to-blue-500',
      description: 'Уведомления о заявках и управление через Telegram бота',
      isActive: false,
      config: {
        bot_token: '',
        chat_id: '',
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      type: 'messenger',
      icon: 'MessageCircle',
      color: 'from-green-500 to-green-600',
      description: 'Отправка напоминаний и уведомлений клиентам',
      isActive: false,
      config: {
        api_key: '',
        phone: '',
      },
    },
    {
      id: 'google_calendar',
      name: 'Google Календарь',
      type: 'calendar',
      icon: 'Calendar',
      color: 'from-red-500 to-orange-500',
      description: 'Синхронизация бронирований с Google Calendar',
      isActive: false,
      config: {
        api_key: '',
        calendar_id: '',
      },
    },
    {
      id: 'yandex_direct',
      name: 'Яндекс.Директ',
      type: 'advertising',
      icon: 'TrendingUp',
      color: 'from-yellow-500 to-red-500',
      description: 'Отслеживание эффективности рекламных кампаний',
      isActive: false,
      config: {
        token: '',
      },
    },
  ]);

  const handleToggle = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, isActive: !int.isActive } : int
    ));
    
    const integration = integrations.find(int => int.id === id);
    toast({
      title: integration?.isActive ? "Интеграция отключена" : "Интеграция включена",
      description: `${integration?.name} ${integration?.isActive ? 'отключена' : 'активирована'}`,
    });
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      setIntegrations(integrations.map(int => 
        int.id === selectedIntegration.id ? selectedIntegration : int
      ));
      toast({
        title: "Настройки сохранены",
        description: `Конфигурация ${selectedIntegration.name} успешно сохранена`,
      });
      setSelectedIntegration(null);
    }
  };

  const updateConfig = (field: string, value: string) => {
    if (selectedIntegration) {
      setSelectedIntegration({
        ...selectedIntegration,
        config: {
          ...selectedIntegration.config,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Plug" size={24} className="text-primary" />
            Интеграции
          </CardTitle>
          <CardDescription>
            Подключите внешние сервисы для автоматизации работы CRM
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card 
                key={integration.id}
                className="hover:border-primary/50 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedIntegration(integration)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center text-white`}>
                        <Icon name={integration.icon as any} size={24} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {integration.type}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={() => handleToggle(integration.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIntegration(integration);
                    }}
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настроить
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-info/10 border-info/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-info" />
                <CardTitle className="text-base">Нужна помощь с интеграцией?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Если у вас возникли сложности с настройкой интеграций, обратитесь в поддержку
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Icon name="BookOpen" size={16} className="mr-2" />
                  Документация
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  Написать в поддержку
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={selectedIntegration !== null} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedIntegration.color} flex items-center justify-center text-white`}>
                    <Icon name={selectedIntegration.icon as any} size={24} />
                  </div>
                  <div>
                    <DialogTitle>Настройка {selectedIntegration.name}</DialogTitle>
                    <DialogDescription>{selectedIntegration.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {selectedIntegration.id === 'avito' && (
                  <Tabs defaultValue="credentials" className="w-full">
                    <TabsList>
                      <TabsTrigger value="credentials">Доступы</TabsTrigger>
                      <TabsTrigger value="settings">Настройки</TabsTrigger>
                      <TabsTrigger value="help">Инструкция</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credentials" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="avito_client_id">Client ID</Label>
                        <Input 
                          id="avito_client_id" 
                          placeholder="Введите Client ID из личного кабинета Avito"
                          value={selectedIntegration.config.client_id}
                          onChange={(e) => updateConfig('client_id', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avito_client_secret">Client Secret</Label>
                        <Input 
                          id="avito_client_secret" 
                          type="password"
                          placeholder="Введите Client Secret"
                          value={selectedIntegration.config.client_secret}
                          onChange={(e) => updateConfig('client_secret', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avito_user_id">User ID</Label>
                        <Input 
                          id="avito_user_id" 
                          placeholder="Ваш ID пользователя Avito"
                          value={selectedIntegration.config.user_id}
                          onChange={(e) => updateConfig('user_id', e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      <Card className="bg-info/10 border-info/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Icon name="CheckCircle" size={20} className="text-info mt-0.5" />
                            <div className="space-y-2 text-sm">
                              <p className="font-medium">Авито подключён успешно!</p>
                              <p className="text-muted-foreground">
                                Теперь вы можете синхронизировать свой автопарк с объявлениями на Avito
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Автоматическое обновление объявлений</div>
                          <div className="text-sm text-muted-foreground">Поднимать объявления каждые 2 часа</div>
                        </div>
                        <Switch 
                          checked={selectedIntegration.config?.auto_update || false}
                          onCheckedChange={(checked) => updateConfig('auto_update', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Снимать с публикации занятые авто</div>
                          <div className="text-sm text-muted-foreground">При бронировании автоматически убирать из Avito</div>
                        </div>
                        <Switch 
                          checked={selectedIntegration.config?.hide_booked !== false}
                          onCheckedChange={(checked) => updateConfig('hide_booked', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Шаблон описания объявления</Label>
                        <Textarea 
                          placeholder="Аренда {model} в отличном состоянии. Год выпуска {year}. Цена {price} руб/сутки."
                          rows={4}
                          value={selectedIntegration.config?.ad_template || ''}
                          onChange={(e) => updateConfig('ad_template', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Доступные переменные: {'{model}'}, {'{year}'}, {'{price}'}, {'{number}'}
                        </p>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                        size="lg"
                        onClick={() => {
                          toast({
                            title: "Синхронизация запущена",
                            description: "Ваш автопарк публикуется на Avito. Это займёт несколько минут.",
                          });
                        }}
                      >
                        <Icon name="Upload" size={18} className="mr-2" />
                        Опубликовать автопарк на Avito
                      </Button>
                    </TabsContent>

                    <TabsContent value="help" className="space-y-4 mt-4">
                      <div className="space-y-3 text-sm">
                        <p className="font-medium">Как получить Client ID и Secret:</p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                          <li>Зайдите на <a href="https://developers.avito.ru" target="_blank" className="text-primary hover:underline">developers.avito.ru</a></li>
                          <li>Создайте новое приложение</li>
                          <li>Скопируйте Client ID и Client Secret</li>
                          <li>Вставьте их в соответствующие поля</li>
                        </ol>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {selectedIntegration.id === 'telegram' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bot_token">Bot Token</Label>
                      <Input 
                        id="bot_token" 
                        type="password"
                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                        value={selectedIntegration.config.bot_token}
                        onChange={(e) => updateConfig('bot_token', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Получить токен: <a href="https://t.me/BotFather" target="_blank" className="text-primary hover:underline">@BotFather</a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chat_id">Chat ID</Label>
                      <Input 
                        id="chat_id" 
                        placeholder="-1001234567890"
                        value={selectedIntegration.config.chat_id}
                        onChange={(e) => updateConfig('chat_id', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        ID чата или группы для уведомлений
                      </p>
                    </div>

                    <Card className="bg-muted">
                      <CardContent className="pt-4">
                        <p className="text-sm">
                          <strong>Возможности бота:</strong>
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• Уведомления о новых заявках</li>
                          <li>• Напоминания о возврате авто</li>
                          <li>• Предупреждения об истечении документов</li>
                          <li>• Управление заявками через команды</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedIntegration.id === 'whatsapp' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wa_api_key">API Key</Label>
                      <Input 
                        id="wa_api_key" 
                        type="password"
                        placeholder="Ключ от WhatsApp Business API"
                        value={selectedIntegration.config.api_key}
                        onChange={(e) => updateConfig('api_key', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wa_phone">Номер телефона</Label>
                      <Input 
                        id="wa_phone" 
                        placeholder="+7 (999) 123-45-67"
                        value={selectedIntegration.config.phone}
                        onChange={(e) => updateConfig('phone', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Автоответчик</div>
                        <div className="text-xs text-muted-foreground">Отвечать на входящие сообщения</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'google_calendar' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gc_api_key">API Key</Label>
                      <Input 
                        id="gc_api_key" 
                        type="password"
                        placeholder="Ключ Google Calendar API"
                        value={selectedIntegration.config.api_key}
                        onChange={(e) => updateConfig('api_key', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calendar_id">Calendar ID</Label>
                      <Input 
                        id="calendar_id" 
                        placeholder="example@group.calendar.google.com"
                        value={selectedIntegration.config.calendar_id}
                        onChange={(e) => updateConfig('calendar_id', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'yandex_direct' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="yd_token">OAuth Token</Label>
                      <Input 
                        id="yd_token" 
                        type="password"
                        placeholder="Токен доступа к Яндекс.Директ"
                        value={selectedIntegration.config.token}
                        onChange={(e) => updateConfig('token', e.target.value)}
                      />
                    </div>

                    <Card className="bg-muted">
                      <CardContent className="pt-4">
                        <p className="text-sm">
                          <strong>Отслеживание:</strong>
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• Стоимость привлечения клиента</li>
                          <li>• Конверсия по рекламным кампаниям</li>
                          <li>• ROI рекламных каналов</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Отмена
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={handleSaveConfig}
                >
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsPage;