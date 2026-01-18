import { useState, useEffect } from 'react';
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
  id: number;
  client_name: string;
  client_phone: string;
  vehicle_id?: number;
  vehicle_model?: string;
  vehicle_license_plate?: string;
  start_date: string;
  end_date: string;
  days: number;
  pickup_location?: string;
  dropoff_location?: string;
  status: string;
  total_price: number;
  paid_amount: number;
  deposit_amount: number;
  services: any[];
  rental_days?: number;
  rental_km?: number;
  rental_price_per_day?: number;
  rental_price_per_km?: number;
  notes?: string;
  custom_fields?: any[];
  payments?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const BOOKINGS_API = 'https://functions.poehali.dev/239ae645-08a8-4dd7-a943-a99a7b5e2142';
const INTEGRATIONS_API = 'https://functions.poehali.dev/d6ed6f95-4807-4fc5-bd93-5e841b317394';

interface CalendarSectionProps {
  onOpenBookingWizard?: () => void;
}

export const CalendarSection = ({ onOpenBookingWizard }: CalendarSectionProps = {}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showWishlist, setShowWishlist] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fleet, setFleet] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        fetch(BOOKINGS_API),
        fetch('https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f')
      ]);
      
      const bookingsData = await bookingsResponse.json();
      const vehiclesData = await vehiclesResponse.json();
      
      setBookings(bookingsData.bookings || []);
      
      const vehicleNames = (vehiclesData.vehicles || []).map((v: any) => 
        `${v.model} #${v.license_plate.slice(-3)}`
      );
      setFleet(vehicleNames.length > 0 ? vehicleNames : ['Honda Stepwgn #763']);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const handleExportCalendar = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${INTEGRATIONS_API}?action=export_ics`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
    const styles: Record<string, string> = {
      'Занято': 'bg-blue-500',
      'Бронь': 'bg-green-500',
      'В аренде': 'bg-orange-500',
      'Вишлист': 'bg-purple-400',
      'Завершено': 'bg-gray-400',
      'Отменено': 'bg-red-400',
    };
    return styles[status] || 'bg-gray-400';
  };

  const getCarBookings = (car: string, day: Date) => {
    return bookings.filter(booking => {
      const carName = booking.vehicle_model 
        ? `${booking.vehicle_model} #${booking.vehicle_license_plate?.slice(-3)}` 
        : car;
      
      if (!carName.includes(car) && !car.includes(carName.split(' #')[0])) {
        return false;
      }
      
      if (!showWishlist && booking.status === 'Вишлист') {
        return false;
      }
      
      const startDate = parseISO(booking.start_date);
      const endDate = parseISO(booking.end_date);
      
      return day >= startDate && day <= endDate;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getBookingForCarAndDate = (carModel: string, date: Date) => {
    return bookings.find(booking => {
      if (booking.status === 'Вишлист' && !showWishlist) return false;
      
      const carName = booking.vehicle_model 
        ? `${booking.vehicle_model} #${booking.vehicle_license_plate?.slice(-3)}` 
        : '';
      
      if (carName !== carModel) return false;
      
      const start = parseISO(booking.start_date);
      const end = parseISO(booking.end_date);
      return date >= start && date <= end;
    });
  };

  const isBookingStart = (booking: Booking, date: Date) => {
    return isSameDay(parseISO(booking.start_date), date);
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
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                disabled={isLoading}
              >
                <Icon name={isLoading ? "Loader2" : "RefreshCw"} size={16} className={cn("mr-2", isLoading && "animate-spin")} />
                Обновить
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleExportCalendar}
                disabled={isExporting}
              >
                <Icon name={isExporting ? "Loader2" : "Download"} size={16} className={cn("mr-2", isExporting && "animate-spin")} />
                Экспорт .ics
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary rounded-full w-14 h-14"
                onClick={() => onOpenBookingWizard?.()}
              >
                <Icon name="Plus" size={24} />
              </Button>
            </div>
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
                                  {booking.client_name}
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