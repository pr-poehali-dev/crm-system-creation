import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DashboardCardsProps {
  bookings: any[];
  onNavigate: (section: string) => void;
}

export const DashboardCards = ({ bookings, onNavigate }: DashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <Card 
        className="bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 animate-scale-in cursor-pointer active:scale-95"
        onClick={() => onNavigate('leads')}
      >
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={18} className="text-purple-500" />
              <CardTitle className="text-base md:text-lg">Лиды</CardTitle>
            </div>
            <Icon name="ChevronRight" size={18} className="text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 md:py-6 text-muted-foreground">
            <Icon name="Zap" size={28} className="mx-auto mb-2 opacity-50 md:w-8 md:h-8" />
            <p className="text-xs md:text-sm">Лидов пока нет</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 animate-scale-in cursor-pointer active:scale-95"
        onClick={() => onNavigate('requests')}
      >
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} className="text-orange-500" />
              <CardTitle className="text-lg">Заявки</CardTitle>
            </div>
            <Icon name="ChevronRight" size={20} className="text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Icon name="ClipboardList" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs md:text-sm">Заявок пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">{bookings.length}</div>
              <div className="text-sm text-muted-foreground">Всего заявок</div>
              <div className="text-xs text-muted-foreground mt-2">
                Активных: {bookings.filter(b => b.status === 'Бронь' || b.status === 'В аренде').length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card 
        className="bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 animate-scale-in cursor-pointer active:scale-95"
        onClick={() => onNavigate('calendar')}
      >
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={20} className="text-blue-500" />
              <CardTitle className="text-lg">Брони</CardTitle>
            </div>
            <Icon name="ChevronRight" size={20} className="text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          {bookings.filter(b => b.status === 'Бронь').length === 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">Активных броней нет</div>
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CalendarOff" size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Создайте новую бронь</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-600">{bookings.filter(b => b.status === 'Бронь').length}</div>
              <div className="text-sm text-muted-foreground mb-4">Активных броней</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {bookings.filter(b => b.status === 'Бронь').slice(0, 3).map(b => (
                  <div key={b.id} className="text-xs p-2 bg-background/50 rounded border border-border/30">
                    <div className="font-medium">{b.client_name}</div>
                    <div className="text-muted-foreground">{b.vehicle_model || 'Авто не указано'}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card 
        className="bg-green-500/10 border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 animate-scale-in cursor-pointer active:scale-95"
        onClick={() => onNavigate('fleet')}
      >
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Car" size={20} className="text-green-500" />
              <CardTitle className="text-lg">В аренде</CardTitle>
            </div>
            <Icon name="ChevronRight" size={20} className="text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          {bookings.filter(b => b.status === 'В аренде').length === 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">Авто в аренде нет</div>
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CarOff" size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Передайте авто клиенту</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'В аренде').length}</div>
              <div className="text-sm text-muted-foreground mb-4">Автомобилей в аренде</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {bookings.filter(b => b.status === 'В аренде').slice(0, 3).map(b => (
                  <div key={b.id} className="text-xs p-2 bg-background/50 rounded border border-border/30">
                    <div className="font-medium">{b.vehicle_model || 'Авто не указано'}</div>
                    <div className="text-muted-foreground">{b.client_name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
