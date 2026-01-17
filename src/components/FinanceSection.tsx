import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export const FinanceSection = () => {
  const payments = [
    { id: 1, date: '17.01.2026 14:30', client: 'Алексей Петров', type: 'Оплата', method: 'Наличные', amount: 5500, status: 'Завершён', request: '#1' },
    { id: 2, date: '17.01.2026 13:00', client: 'Дмитрий Соколов', type: 'Оплата', method: 'Карта', amount: 12000, status: 'Завершён', request: '#4' },
    { id: 3, date: '17.01.2026 16:00', client: 'Анна Сидорова', type: 'Предоплата', method: 'Перевод', amount: 5000, status: 'Завершён', request: '#5' },
    { id: 4, date: '17.01.2026 17:00', client: 'ООО "ТехноСтрой"', type: 'Счёт выставлен', method: 'Безнал', amount: 45000, status: 'Ожидает оплаты', request: '#3' },
  ];

  const debts = [
    { client: 'Мария Иванова', amount: -2250, service: 'Аренда авто', dueDate: '20.01.2026', days: 3 },
    { client: 'ООО "ТехноСтрой"', amount: -45000, service: 'Абонемент консьерж', dueDate: '24.01.2026', days: 7 },
  ];

  const expenses = [
    { date: '17.01.2026', category: 'ГСМ', description: 'Заправка автопарка', amount: -15000 },
    { date: '16.01.2026', category: 'ТО', description: 'Обслуживание Audi A8', amount: -8500 },
    { date: '15.01.2026', category: 'Химия', description: 'Расходные материалы', amount: -12000 },
    { date: '14.01.2026', category: 'Зарплата', description: 'Аванс сотрудникам', amount: -50000 },
  ];

  const stats = [
    { label: 'Выручка за месяц', value: '₽1,247,500', trend: 'up', change: '+12%' },
    { label: 'Задолженности', value: '₽47,250', trend: 'down', change: '-8%' },
    { label: 'Расходы', value: '₽285,500', trend: 'up', change: '+5%' },
    { label: 'Чистая прибыль', value: '₽962,000', trend: 'up', change: '+18%' },
  ];

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant="outline" className={stat.trend === 'up' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}>
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} className="text-primary" />
            Финансовые операции
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Платежи</TabsTrigger>
              <TabsTrigger value="debts">Задолженности</TabsTrigger>
              <TabsTrigger value="expenses">Расходы</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-3 mt-6">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Дата и время</div>
                        <div className="font-medium">{payment.date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Клиент</div>
                        <div className="font-medium">{payment.client}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Тип / Метод</div>
                        <div className="font-medium">{payment.type} / {payment.method}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Заявка</div>
                        <div className="font-medium">{payment.request}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={cn('border', payment.status === 'Завершён' ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30')}>
                          {payment.status}
                        </Badge>
                        <span className="text-lg font-bold text-primary">₽{payment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="debts" className="space-y-3 mt-6">
              {debts.map((debt, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 hover:border-destructive/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Клиент</div>
                        <div className="font-medium">{debt.client}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Услуга</div>
                        <div className="font-medium">{debt.service}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Срок оплаты</div>
                        <div className="font-medium">{debt.dueDate}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive">Просрочка {debt.days}д</Badge>
                        <span className="text-lg font-bold text-destructive">₽{Math.abs(debt.amount).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      <Icon name="Send" size={16} className="mr-2" />
                      Напомнить
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-3 mt-6">
              {expenses.map((expense, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Дата</div>
                        <div className="font-medium">{expense.date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Категория</div>
                        <Badge variant="outline">{expense.category}</Badge>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm text-muted-foreground">Описание</div>
                        <div className="font-medium">{expense.description}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-destructive">{expense.amount.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" className="flex-1">
              <Icon name="FileDown" size={18} className="mr-2" />
              Экспорт в Excel
            </Button>
            <Button variant="outline" className="flex-1">
              <Icon name="Printer" size={18} className="mr-2" />
              Печать отчёта
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить операцию
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSection;
