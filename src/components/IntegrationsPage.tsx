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
  const [avitoAuthLoading, setAvitoAuthLoading] = useState(false);
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

  const handleAvitoOAuth = () => {
    setAvitoAuthLoading(true);
    const clientId = 'VzbKJ5EdJ2AYmep_vm_v';
    const redirectUri = 'https://functions.poehali.dev/7fd067bc-2105-405e-9d29-2694f2701abe';
    const scope = 'messenger:read';
    
    const authUrl = `https://avito.ru/oauth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    // Открываем popup окно для авторизации
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      authUrl,
      'AvitoAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Слушаем сообщения от popup окна
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'avito-oauth-success') {
        setAvitoAuthLoading(false);
        popup?.close();
        
        toast({
          title: "Авторизация успешна!",
          description: "Avito подключен. Теперь можно загружать диалоги автоматически.",
        });
        
        // Активируем интеграцию
        setIntegrations(integrations.map(int => 
          int.id === 'avito' ? { ...int, isActive: true } : int
        ));
        
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'avito-oauth-error') {
        setAvitoAuthLoading(false);
        popup?.close();
        
        toast({
          title: "Ошибка авторизации",
          description: event.data.error || "Не удалось подключить Avito",
          variant: "destructive",
        });
        
        window.removeEventListener('message', handleMessage);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Проверяем закрытие окна без авторизации
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setAvitoAuthLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
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
                      <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <Icon name="Zap" size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">Автоматическое подключение Avito</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Нажмите кнопку ниже, разрешите доступ к вашему аккаунту Avito — и все диалоги начнут загружаться автоматически.
                              </p>
                              <Button 
                                onClick={handleAvitoOAuth}
                                disabled={avitoAuthLoading}
                                className="w-full"
                                size="lg"
                              >
                                {avitoAuthLoading ? (
                                  <>
                                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                                    Ожидание авторизации...
                                  </>
                                ) : (
                                  <>
                                    <Icon name="ShoppingBag" size={18} className="mr-2" />
                                    Подключить Avito
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      <Card className="bg-info/10 border-info/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Icon name="CheckCircle" size={20} className="text-info mt-0.5" />
                            <div className="space-y-2 text-sm">
                              <p className="font-medium">Авито подключён успешно!</p>
                              <p className="text-muted-foreground">
                                Все новые сообщения от клиентов с Avito будут автоматически появляться в разделе "Лиды"
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Получать уведомления о новых сообщениях</div>
                          <div className="text-sm text-muted-foreground">Автоматически создавать лид при обращении</div>
                        </div>
                        <Switch 
                          checked={selectedIntegration.config?.auto_leads !== false}
                          onCheckedChange={(checked) => updateConfig('auto_leads', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Звуковое уведомление</div>
                          <div className="text-sm text-muted-foreground">Оповещать звуком о новых сообщениях</div>
                        </div>
                        <Switch 
                          checked={selectedIntegration.config?.sound_notify || false}
                          onCheckedChange={(checked) => updateConfig('sound_notify', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ответственный за лиды с Avito</Label>
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option>Распределять автоматически</option>
                          <option>Анна К.</option>
                          <option>Сергей П.</option>
                          <option>Дмитрий И.</option>
                        </select>
                      </div>

                      <Card className="bg-muted">
                        <CardContent className="pt-4">
                          <p className="text-sm font-medium mb-2">Что будет происходить:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Новые сообщения → автоматически создаются лиды</li>
                            <li>• Все диалоги доступны в разделе "Лиды"</li>
                            <li>• Можно отвечать клиентам прямо из CRM</li>
                            <li>• История общения сохраняется</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="help" className="space-y-4 mt-4">
                      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                              <Icon name="AlertCircle" size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">Перед подключением!</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Чтобы кнопка "Подключить Avito" заработала, сначала добавьте Redirect URI в настройках вашего приложения на Avito.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <div className="space-y-3 text-sm">
                          <p className="font-semibold text-base">Шаг 1: Добавьте Redirect URI на Avito</p>
                          <ol className="list-decimal list-inside space-y-3 text-muted-foreground pl-2">
                            <li>
                              Откройте страницу вашего приложения:{" "}
                              <a 
                                href="https://autoload.avito.ru/applications" 
                                target="_blank" 
                                className="text-primary hover:underline font-medium"
                              >
                                autoload.avito.ru/applications
                              </a>
                            </li>
                            <li>
                              Найдите поле <strong>"Redirect URI"</strong> (URL переадресации)
                            </li>
                            <li>
                              Скопируйте и вставьте туда эту ссылку:
                              <div className="mt-2 p-3 bg-muted rounded-lg border font-mono text-xs break-all">
                                https://functions.poehali.dev/7fd067bc-2105-405e-9d29-2694f2701abe
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  navigator.clipboard.writeText('https://functions.poehali.dev/7fd067bc-2105-405e-9d29-2694f2701abe');
                                  toast({
                                    title: "Скопировано!",
                                    description: "Redirect URI скопирован в буфер обмена",
                                  });
                                }}
                              >
                                <Icon name="Copy" size={16} className="mr-2" />
                                Скопировать ссылку
                              </Button>
                            </li>
                            <li>Нажмите <strong>"Сохранить"</strong> на странице приложения Avito</li>
                          </ol>
                        </div>

                        <div className="space-y-3 text-sm pt-4 border-t">
                          <p className="font-semibold text-base">Шаг 2: Подключите Avito к CRM</p>
                          <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-2" start={5}>
                            <li>Вернитесь на вкладку <strong>"Доступы"</strong></li>
                            <li>Нажмите кнопку <strong>"Подключить Avito"</strong></li>
                            <li>Разрешите доступ к вашему аккаунту</li>
                            <li>Готово! Все диалоги загрузятся автоматически</li>
                          </ol>
                        </div>
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