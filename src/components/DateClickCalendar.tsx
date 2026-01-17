import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DateClickCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  bookings?: any[];
  onNavigateToCalendar?: () => void;
}

const DateClickCalendar = ({ open, onOpenChange, date, bookings = [], onNavigateToCalendar }: DateClickCalendarProps) => {
  const dateStr = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const todayBookings = bookings.filter(booking => {
    if (!booking.start_date) return false;
    const bookingDate = new Date(booking.start_date);
    return bookingDate.toDateString() === date.toDateString();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            {dateStr}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {todayBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6 text-center">
                <Icon name="CalendarOff" size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  На эту дату нет броней или заявок
                </p>
                <Button variant="outline" onClick={onNavigateToCalendar}>
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Открыть календарь
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Найдено броней: {todayBookings.length}
              </div>
              
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <Card key={booking.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium">{booking.client_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.client_phone}</div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {booking.booking_id}
                        </Badge>
                      </div>

                      {booking.vehicle_model && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Icon name="Car" size={14} />
                          <span>{booking.vehicle_model}</span>
                          {booking.vehicle_license_plate && (
                            <Badge variant="outline" className="text-xs">
                              {booking.vehicle_license_plate}
                            </Badge>
                          )}
                        </div>
                      )}

                      {booking.pickup_location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="MapPin" size={14} />
                          <span>{booking.pickup_location}</span>
                        </div>
                      )}

                      {booking.total_price && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Сумма</span>
                          <span className="font-bold text-primary">₽{booking.total_price.toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={onNavigateToCalendar}
              >
                <Icon name="Calendar" size={16} className="mr-2" />
                Открыть полный календарь
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DateClickCalendar;
