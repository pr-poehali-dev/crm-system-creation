import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { IntegrationConfigDialog } from '@/components/integrations/IntegrationConfigDialog';
import { IntegrationFilters } from '@/components/integrations/IntegrationFilters';

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

const INTEGRATIONS_API = 'https://functions.poehali.dev/d6ed6f95-4807-4fc5-bd93-5e841b317394';

export const IntegrationsPage = () => {
  const { toast } = useToast();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [avitoAuthLoading, setAvitoAuthLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
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
        client_id: '',
        client_secret: '',
        refresh_token: '',
      },
    },
    {
      id: 'yukassa',
      name: 'ЮKassa',
      type: 'payment',
      icon: 'CreditCard',
      color: 'from-purple-500 to-pink-500',
      description: 'Приём платежей от клиентов онлайн',
      isActive: false,
      config: {
        shop_id: '',
        secret_key: '',
      },
    },
    {
      id: 'calendar_export',
      name: 'Экспорт календаря',
      type: 'export',
      icon: 'Download',
      color: 'from-gray-500 to-gray-600',
      description: 'Экспорт бронирований в формат .ics для любого календаря',
      isActive: true,
      config: {},
    },
    {
      id: 'myradius',
      name: 'MyRadius Календарь',
      type: 'calendar',
      icon: 'CalendarClock',
      color: 'from-indigo-500 to-purple-600',
      description: 'Импорт и синхронизация записей из MyRadius календаря',
      isActive: true,
      config: {
        ics_url: 'https://api.myradius.ru/platform-calendar/api/v1/calendar/ical/ac0071f018d6ac7568394853c44cef1f@myradius.ru/calendar.ics'
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

  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${INTEGRATIONS_API}?action=google_sync`);
      const data = await response.json();
      
      if (data.error) {
        toast({
          title: "Ошибка синхронизации",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Синхронизация завершена",
          description: `Синхронизировано: ${data.synced || 0} броней`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать с Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMyRadiusImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch(`${INTEGRATIONS_API}?action=myradius_import`);
      const data = await response.json();
      
      if (data.error) {
        toast({
          title: "Ошибка импорта",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Импорт завершён",
          description: `Импортировано: ${data.imported} новых записей, пропущено: ${data.skipped} (уже существуют)`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось импортировать календарь MyRadius",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCalendar = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${INTEGRATIONS_API}?action=export_ics`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Экспорт завершён",
        description: "Файл bookings.ics загружен. Импортируйте его в любой календарь",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать календарь",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAvitoOAuth = () => {
    setAvitoAuthLoading(true);
    const clientId = 'VzbKJ5EdJ2AYmep_vm_v';
    const redirectUri = 'https://functions.poehali.dev/7fd067bc-2105-405e-9d29-2694f2701abe';
    const scope = 'messenger:read';
    
    const authUrl = `https://avito.ru/oauth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    const authWindow = window.open(authUrl, 'AvitoAuth', 'width=600,height=700');
    
    const checkAuth = setInterval(() => {
      try {
        if (authWindow?.closed) {
          clearInterval(checkAuth);
          setAvitoAuthLoading(false);
          
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            toast({
              title: "Авторизация успешна",
              description: "Код получен, сохраните настройки для завершения",
            });
            
            if (selectedIntegration) {
              setSelectedIntegration({
                ...selectedIntegration,
                config: {
                  ...selectedIntegration.config,
                  authorization_code: code
                }
              });
            }
          }
        }
      } catch (e) {
      }
    }, 500);
    
    setTimeout(() => {
      clearInterval(checkAuth);
      setAvitoAuthLoading(false);
    }, 300000);
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && integration.isActive;
    if (activeTab === 'inactive') return matchesSearch && !integration.isActive;
    if (activeTab === 'calendar') return matchesSearch && integration.type === 'calendar';
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plug" size={24} className="text-primary" />
                Интеграции
              </CardTitle>
              <CardDescription>
                Подключите сторонние сервисы для автоматизации работы
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <IntegrationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={handleToggle}
                onConfigure={setSelectedIntegration}
                onSync={integration.id === 'google_calendar' ? handleGoogleCalendarSync : undefined}
                onImport={integration.id === 'myradius' ? handleMyRadiusImport : undefined}
                onExport={integration.id === 'calendar_export' ? handleExportCalendar : undefined}
                isSyncing={isSyncing}
                isImporting={isImporting}
                isExporting={isExporting}
              />
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Интеграции не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить поисковый запрос</p>
            </div>
          )}
        </CardContent>
      </Card>

      <IntegrationConfigDialog
        integration={selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        onSave={handleSaveConfig}
        onUpdateConfig={updateConfig}
        onAvitoAuth={selectedIntegration?.id === 'avito' ? handleAvitoOAuth : undefined}
        avitoAuthLoading={avitoAuthLoading}
      />
    </div>
  );
};

export default IntegrationsPage;
