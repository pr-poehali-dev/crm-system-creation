import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onHandover?: () => void;
}

export const BookingDetailDialog = ({ 
  open, 
  onOpenChange, 
  booking,
  onHandover
}: BookingDetailDialogProps) => {
  if (!booking) return null;

  const payments = [
    { 
      date: '03.01.2026', 
      type: 'income', 
      amount: 10000, 
      method: 'QR-код', 
      category: 'Аренда',
      icon: 'TrendingUp'
    },
    { 
      date: '03.01.2026', 
      type: 'expense', 
      amount: 70, 
      method: 'РС / Корп. карта', 
      category: 'Банковское обслуживание → QR Комиссия за эквайринг',
      icon: 'TrendingDown'
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600 text-white">-42 000</Badge>
              <span>Бронь #{booking.id || '38ac8899'}</span>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                <Icon name="X" size={14} className="mr-1" />
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icon name="FileText" size={16} className="mr-2" />
                DOCX
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Клиент</div>
                      <div className="font-medium text-lg">{booking.client || 'Шликарь Дмитрий'}</div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Phone" size={16} />
                      <span>{booking.phone || '+7 (913) 531 12 12'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="MapPin" size={16} />
                      <span>Москва → Краснодар</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-sm text-muted-foreground">Автомобиль</div>
                    <Badge variant="outline" className="text-sm">{booking.car || 'О304СВ193'}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Выдача</div>
                    <div className="font-medium">{booking.startDate || '19.01.2026 15:00'} — Офис</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Возврат</div>
                    <div className="font-medium">{booking.endDate || '21.01.2026 15:00'} — Офис</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Создано: 03.01.2026 10:24</div>
                  <div>Обновлено: 11.01.2026 15:08</div>
                </div>

                {booking.notes && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-1">Примечания</div>
                    <div className="text-sm">{booking.notes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Расчёт стоимости</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-center py-4">
                42 000 + 10 000 <span className="text-muted-foreground">(залог)</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Оплачено</span>
                  <span className="font-medium text-green-600">→ 10 000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Взять оплату</span>
                  <span className="font-medium text-red-600">→ -42 000</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="font-medium mb-3">Включено в стоимость:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">КАРШЕРИНГ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 суток аренды (42 000 руб)</span>
                    <span className="font-medium">42 000 руб</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 400 км пробега (30 руб/км)</span>
                    <span className="font-medium">42 000 руб</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">
                  Платежи: <span className="font-medium text-foreground">10 000 - 70 = 9 930 ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Платежи</CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Plus" size={16} className="mr-2" />
                  К оплате
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4 flex-1">
                      <Icon 
                        name={payment.icon as any} 
                        size={20} 
                        className={payment.type === 'income' ? 'text-green-600' : 'text-red-600'} 
                      />
                      <div>
                        <div className="text-sm text-muted-foreground">{payment.date}</div>
                        <div className="font-medium text-sm">
                          {payment.type === 'income' ? 'Доход' : 'Расход'} / {payment.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'font-bold',
                        payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {payment.type === 'income' ? '+' : '-'}{payment.amount.toLocaleString()} ₽
                      </div>
                      <div className="text-xs text-muted-foreground">{payment.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              size="lg"
              onClick={onHandover}
            >
              <Icon name="Car" size={20} className="mr-2" />
              Выдать авто
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              size="lg"
            >
              <Icon name="CreditCard" size={20} className="mr-2" />
              К оплате -42 000 Р
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;
