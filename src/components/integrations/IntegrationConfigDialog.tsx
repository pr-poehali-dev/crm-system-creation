import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

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

interface IntegrationConfigDialogProps {
  integration: Integration | null;
  onClose: () => void;
  onSave: () => void;
  onUpdateConfig: (field: string, value: string) => void;
  onAvitoAuth?: () => void;
  avitoAuthLoading?: boolean;
}

export const IntegrationConfigDialog = ({
  integration,
  onClose,
  onSave,
  onUpdateConfig,
  onAvitoAuth,
  avitoAuthLoading,
}: IntegrationConfigDialogProps) => {
  if (!integration) return null;

  const renderConfigFields = () => {
    if (!integration.config) return null;

    switch (integration.id) {
      case 'avito':
        return (
          <>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                value={integration.config.client_id || ''}
                onChange={(e) => onUpdateConfig('client_id', e.target.value)}
                placeholder="Получите в личном кабинете Avito"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={integration.config.client_secret || ''}
                onChange={(e) => onUpdateConfig('client_secret', e.target.value)}
                placeholder="Секретный ключ приложения"
              />
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={integration.config.user_id || ''}
                onChange={(e) => onUpdateConfig('user_id', e.target.value)}
                placeholder="ID пользователя Avito"
              />
            </div>
            {onAvitoAuth && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onAvitoAuth}
                disabled={avitoAuthLoading}
              >
                <Icon name={avitoAuthLoading ? "Loader2" : "Key"} size={16} className={`mr-2 ${avitoAuthLoading ? 'animate-spin' : ''}`} />
                {avitoAuthLoading ? 'Авторизация...' : 'Авторизоваться через Avito OAuth'}
              </Button>
            )}
          </>
        );

      case 'telegram':
        return (
          <>
            <div className="space-y-2">
              <Label>Bot Token</Label>
              <Input
                type="password"
                value={integration.config.bot_token || ''}
                onChange={(e) => onUpdateConfig('bot_token', e.target.value)}
                placeholder="Получите у @BotFather"
              />
            </div>
            <div className="space-y-2">
              <Label>Chat ID</Label>
              <Input
                value={integration.config.chat_id || ''}
                onChange={(e) => onUpdateConfig('chat_id', e.target.value)}
                placeholder="ID чата для уведомлений"
              />
            </div>
          </>
        );

      case 'whatsapp':
        return (
          <>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={integration.config.api_key || ''}
                onChange={(e) => onUpdateConfig('api_key', e.target.value)}
                placeholder="Ключ WhatsApp Business API"
              />
            </div>
            <div className="space-y-2">
              <Label>Номер телефона</Label>
              <Input
                value={integration.config.phone || ''}
                onChange={(e) => onUpdateConfig('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </>
        );

      case 'google_calendar':
        return (
          <>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                value={integration.config.client_id || ''}
                onChange={(e) => onUpdateConfig('client_id', e.target.value)}
                placeholder="Получите в Google Cloud Console"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={integration.config.client_secret || ''}
                onChange={(e) => onUpdateConfig('client_secret', e.target.value)}
                placeholder="Секретный ключ приложения"
              />
            </div>
            <div className="space-y-2">
              <Label>Refresh Token</Label>
              <Textarea
                value={integration.config.refresh_token || ''}
                onChange={(e) => onUpdateConfig('refresh_token', e.target.value)}
                placeholder="Token для автоматического обновления доступа"
                rows={3}
              />
            </div>
          </>
        );

      case 'yukassa':
        return (
          <>
            <div className="space-y-2">
              <Label>Shop ID</Label>
              <Input
                value={integration.config.shop_id || ''}
                onChange={(e) => onUpdateConfig('shop_id', e.target.value)}
                placeholder="ID магазина в ЮKassa"
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input
                type="password"
                value={integration.config.secret_key || ''}
                onChange={(e) => onUpdateConfig('secret_key', e.target.value)}
                placeholder="Секретный ключ магазина"
              />
            </div>
          </>
        );

      case 'yandex_direct':
        return (
          <div className="space-y-2">
            <Label>OAuth Token</Label>
            <Textarea
              value={integration.config.token || ''}
              onChange={(e) => onUpdateConfig('token', e.target.value)}
              placeholder="Получите токен в кабинете Яндекс.Директ"
              rows={3}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            Настройки для этой интеграции не требуются
          </div>
        );
    }
  };

  return (
    <Dialog open={!!integration} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройка {integration.name}</DialogTitle>
          <DialogDescription>
            {integration.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderConfigFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-secondary"
            onClick={onSave}
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
