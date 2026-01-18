import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

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

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string) => void;
  onConfigure: (integration: Integration) => void;
  onSync?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  isSyncing?: boolean;
  isImporting?: boolean;
  isExporting?: boolean;
}

export const IntegrationCard = ({
  integration,
  onToggle,
  onConfigure,
  onSync,
  onImport,
  onExport,
  isSyncing,
  isImporting,
  isExporting,
}: IntegrationCardProps) => {
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      marketplace: 'Маркетплейс',
      messenger: 'Мессенджер',
      calendar: 'Календарь',
      payment: 'Платежи',
      export: 'Экспорт',
      advertising: 'Реклама',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      marketplace: 'bg-blue-100 text-blue-700',
      messenger: 'bg-green-100 text-green-700',
      calendar: 'bg-orange-100 text-orange-700',
      payment: 'bg-purple-100 text-purple-700',
      export: 'bg-gray-100 text-gray-700',
      advertising: 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className={cn(
      'hover:border-primary/50 transition-all duration-200',
      integration.isActive && 'ring-2 ring-primary/20'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center', integration.color)}>
              <Icon name={integration.icon as any} size={24} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <Badge variant="outline" className={cn('mt-1', getTypeColor(integration.type))}>
                {getTypeLabel(integration.type)}
              </Badge>
            </div>
          </div>
          {integration.id !== 'calendar_export' && integration.id !== 'myradius' && (
            <Switch
              checked={integration.isActive}
              onCheckedChange={() => onToggle(integration.id)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {integration.description}
        </CardDescription>
        
        <div className="flex gap-2">
          {integration.id === 'calendar_export' && onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onExport}
              disabled={isExporting}
            >
              <Icon name={isExporting ? "Loader2" : "Download"} size={16} className={cn("mr-2", isExporting && "animate-spin")} />
              {isExporting ? 'Экспортируем...' : 'Скачать .ics'}
            </Button>
          )}

          {integration.id === 'myradius' && onImport && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onImport}
              disabled={isImporting}
            >
              <Icon name={isImporting ? "Loader2" : "Upload"} size={16} className={cn("mr-2", isImporting && "animate-spin")} />
              {isImporting ? 'Импортируем...' : 'Импортировать'}
            </Button>
          )}

          {integration.id === 'google_calendar' && integration.isActive && onSync && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onSync}
              disabled={isSyncing}
            >
              <Icon name={isSyncing ? "Loader2" : "RefreshCw"} size={16} className={cn("mr-2", isSyncing && "animate-spin")} />
              {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
            </Button>
          )}

          {integration.id !== 'calendar_export' && integration.id !== 'myradius' && (
            <Button 
              variant="outline" 
              size="sm" 
              className={integration.id === 'google_calendar' && integration.isActive ? 'flex-1' : 'w-full'}
              onClick={() => onConfigure(integration)}
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Настроить
            </Button>
          )}
        </div>

        {integration.isActive && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Активна
          </div>
        )}
      </CardContent>
    </Card>
  );
};
