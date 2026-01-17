import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Booking {
  id: string;
  carModel: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'Занято' | 'Бронь' | 'В аренде' | 'Вишлист';
  days: number;
}

export const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showWishlist, setShowWishlist] = useState(true);
  const [showArchive, setShowArchive] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fleet = [
    'Honda Stepwgn #763',
    'Hyundai Grand Starex #464',
    'Hyundai Grand Starex #692',
    'Hyundai Grand Starex #118',
    'Hyundai Grand Starex #218',
    'Hyundai Grand Starex #304',
    'Hyundai Grand Starex #670',
    'Hyundai Grand Starex #826',
    'Hyundai Grand Starex #080',
    'Hyundai Grand Starex #194',
    'Hyundai Grand Starex #939',
    'Hyundai Grand Starex #485',
    'Hyundai Grand Starex #609',
    'Hyundai Grand Starex #656',
    'Hyundai Grand Starex #776',
    'Hyundai Grand Starex #967',
  ];

  const bookings: Booking[] = [
    { id: 'b1', carModel: 'Hyundai Grand Starex #464', client: 'К - 4 суток', startDate: '2026-01-17', endDate: '2026-01-21', status: 'Занято', days: 4 },
    { id: 'b2', carModel: 'Hyundai Grand Starex #692', client: 'З - 5 суток Д', startDate: '2026-01-18', endDate: '2026-01-23', status: 'Бронь', days: 5 },
    { id: 'b3', carModel: 'Hyundai Grand Starex #218', client: 'М - 5 суток', startDate: '2026-01-19', endDate: '2026-01-24', status: 'Занято', days: 5 },
    { id: 'b4', carModel: 'Hyundai Grand Starex #304', client: 'М - 2 суток', startDate: '2026-01-20', endDate: '2026-01-22', status: 'Занято', days: 2 },
    { id: 'b5', carModel: 'Hyundai Grand Starex #670', client: 'М - 5 суток Д', startDate: '2026-01-20', endDate: '2026-01-25', status: 'Бронь', days: 5 },
    { id: 'b6', carModel: 'Hyundai Grand Starex #826', client: 'М - 4 суток', startDate: '2026-01-24', endDate: '2026-01-28', status: 'Занято', days: 4 },
    { id: 'b7', carModel: 'Hyundai Grand Starex #080', client: 'О - 3 суток Д', startDate: '2026-01-20', endDate: '2026-01-23', status: 'Бронь', days: 3 },
    { id: 'b8', carModel: 'Hyundai Grand Starex #194', client: 'О - 2 суток', startDate: '2026-01-24', endDate: '2026-01-26', status: 'Занято', days: 2 },
    { id: 'b9', carModel: 'Hyundai Grand Starex #939', client: 'В аренде весь месяц', startDate: '2026-01-01', endDate: '2026-01-31', status: 'В аренде', days: 30 },
    { id: 'b10', carModel: 'Hyundai Grand Starex #609', client: 'О - 4 суток → К', startDate: '2026-01-17', endDate: '2026-01-21', status: 'Занято', days: 4 },
    { id: 'b11', carModel: 'Honda Stepwgn #763', client: 'Клиент → Краснодар', startDate: '2026-01-16', endDate: '2026-01-17', status: 'Вишлист', days: 1 },
    { id: 'b12', carModel: 'Hyundai Grand Starex #485', client: 'К - 3 суток', startDate: '2026-01-27', endDate: '2026-01-30', status: 'Занято', days: 3 },
  ];

  const branches = [
    { id: 'all', name: 'Все города — 16 авто' },
    { id: 'krasnodar', name: 'Краснодар — 3 авто' },
    { id: 'moscow', name: 'Москва — 5 авто' },
    { id: 'spb', name: 'Санкт-Петербург — 8 авто' },
  ];

  const employees = [
    { id: 'all', name: 'Все филиалы' },
    { id: 'anton', name: 'GA - КРД - Антон' },
    { id: 'dmitriy', name: 'GA - КРД - Дмитрий' },
    { id: 'maksim', name: 'GA - КРД - Максим' },
    { id: 'sergey', name: 'GA - КРД - Сергей' },
    { id: 'timur', name: 'GA - КРД - Тимур' },
    { id: 'azad', name: 'GA - МСК - Азад' },
    { id: 'aleksandr', name: 'GA - МСК - Александр' },
    { id: 'anatoliy', name: 'GA - МСК - Анатолий' },
  ];

  const getBookingStyle = (status: string) => {
    const styles = {
      'Занято': 'bg-blue-500',
      'Бронь': 'bg-green-500',
      'В аренде': 'bg-orange-500',
      'Вишлист': 'bg-purple-400',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-400';
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getBookingForCarAndDate = (carModel: string, date: Date) => {
    return bookings.find(booking => {
      if (booking.status === 'Вишлист' && !showWishlist) return false;
      if (booking.carModel !== carModel) return false;
      
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);
      return date >= start && date <= end;
    });
  };

  const isBookingStart = (booking: Booking, date: Date) => {
    return isSameDay(parseISO(booking.startDate), date);
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={24} className="text-primary" />
                Календарь бронирований
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>Главная</span>
                <span>/</span>
                <span>Календарь</span>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary rounded-full w-14 h-14">
              <Icon name="Plus" size={24} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Все филиалы" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch id="wishlist" checked={showWishlist} onCheckedChange={setShowWishlist} />
              <Label htmlFor="wishlist" className="cursor-pointer">Показать виш-лист</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="archive" checked={showArchive} onCheckedChange={setShowArchive} />
              <Label htmlFor="archive" className="cursor-pointer">Показать архивные</Label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1400px]">
              <div className="grid grid-cols-[200px_1fr] gap-0 border border-border rounded-lg overflow-hidden">
                <div className="bg-sidebar/30">
                  <div className="h-12 border-b border-border"></div>
                  {fleet.map((car, idx) => (
                    <div key={idx} className="h-12 border-b border-border last:border-0 px-3 flex items-center text-sm font-medium">
                      {car}
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${monthDays.length}, 60px)` }}>
                    <div className="contents">
                      {monthDays.map((day, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'h-12 border-l border-b border-border flex flex-col items-center justify-center text-xs',
                            isWeekend(day) ? 'bg-purple-100/30' : 'bg-background',
                            isSameDay(day, new Date()) && 'bg-purple-300/30'
                          )}
                        >
                          <div className="font-medium">{format(day, 'd', { locale: ru })}</div>
                          <div className="text-muted-foreground">{format(day, 'EEE', { locale: ru })}</div>
                        </div>
                      ))}
                    </div>

                    {fleet.map((car, carIdx) => (
                      <div key={carIdx} className="contents">
                        {monthDays.map((day, dayIdx) => {
                          const booking = getBookingForCarAndDate(car, day);
                          const isStart = booking && isBookingStart(booking, day);
                          
                          return (
                            <div
                              key={dayIdx}
                              className={cn(
                                'h-12 border-l border-b border-border relative',
                                isWeekend(day) && 'bg-yellow-100/20'
                              )}
                            >
                              {booking && isStart && (
                                <div
                                  className={cn(
                                    'absolute top-1 left-0 h-10 rounded text-white text-xs font-medium flex items-center justify-center px-2',
                                    getBookingStyle(booking.status)
                                  )}
                                  style={{
                                    width: `${booking.days * 60 - 2}px`,
                                    zIndex: 10,
                                  }}
                                >
                                  {booking.client}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span>Занято</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span>Бронь</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span>В аренде</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-400 rounded"></div>
              <span>Вишлист</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Выходные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-300 rounded"></div>
              <span>Сегодня</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
