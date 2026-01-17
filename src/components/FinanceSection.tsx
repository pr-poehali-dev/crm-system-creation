import { useState } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Payment {
  id: number;
  booking_id: string;
  date: string;
  client: string;
  type: string;
  method: string;
  amount: number;
  status: string;
  document?: File;
  documentName?: string;
}

export const FinanceSection = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    booking_id: '',
    client: '',
    amount: 0,
    method: 'cash',
    type: 'payment',
    document: null as File | null
  });
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Автосохранение платежа
  useAutoSave({
    data: paymentForm,
    enabled: isPaymentFormOpen && paymentForm.client && paymentForm.amount > 0,
    onSave: async (data) => {
      const paymentData = {
        ...data,
        id: paymentId,
        status: 'Черновик'
      };
      // Здесь был бы fetch к API, но пока локальное хранение
      console.log('Автосохранение платежа:', paymentData);
    },
  });

  const stats = [
    { label: 'Выручка за месяц', value: '₽0', trend: 'up', change: '+0%' },
    { label: 'Задолженности', value: '₽0', trend: 'down', change: '0%' },
    { label: 'Расходы', value: '₽0', trend: 'up', change: '+0%' },
    { label: 'Чистая прибыль', value: '₽0', trend: 'up', change: '+0%' },
  ];

  const handleSavePayment = () => {
    if (!paymentForm.client || !paymentForm.amount) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const newPayment: Payment = {
      id: paymentId || Date.now(),
      booking_id: paymentForm.booking_id || `BK-${Date.now()}`,
      date: new Date().toLocaleString('ru-RU'),
      client: paymentForm.client,
      type: paymentForm.type === 'payment' ? 'Оплата' : 'Предоплата',
      method: getMethodName(paymentForm.method),
      amount: paymentForm.amount,
      status: 'Завершён', // Финальный статус
      document: paymentForm.document,
      documentName: paymentForm.document?.name
    };

    setPayments([newPayment, ...payments]);
    setIsPaymentFormOpen(false);
    setPaymentId(null);
    setPaymentForm({
      booking_id: '',
      client: '',
      amount: 0,
      method: 'cash',
      type: 'payment',
      document: null
    });

    toast({
      title: '✅ Платёж добавлен',
      description: `Зафиксирована оплата ${newPayment.amount}₽`
    });
  };

  const getMethodName = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Наличные',
      card: 'Карта',
      transfer: 'Перевод',
      bank: 'Безнал',
      qr: 'QR-код'
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wallet" size={24} className="text-primary" />
              Финансовые операции
            </CardTitle>
            <Button onClick={() => setIsPaymentFormOpen(true)} className="bg-gradient-to-r from-primary to-secondary w-full sm:w-auto">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить платёж
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Платежи</TabsTrigger>
              <TabsTrigger value="debts">Задолженности</TabsTrigger>
              <TabsTrigger value="expenses">Расходы</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-3 mt-6">
              {payments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Wallet" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Платежей пока нет</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsPaymentFormOpen(true)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить первый платёж
                  </Button>
                </div>
              ) : (
                payments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="p-3 md:p-4 rounded-lg bg-sidebar/30 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 space-y-2 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Дата</div>
                          <div className="font-medium text-sm">{payment.date}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Клиент</div>
                          <div className="font-medium text-sm">{payment.client}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Способ</div>
                          <div className="font-medium text-sm">{payment.method}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-success/20 text-success border-success/30">
                            {payment.status}
                          </Badge>
                          <span className="text-lg font-bold text-primary">₽{payment.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="hidden md:block text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="debts" className="space-y-3 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 opacity-50 text-success" />
                <p>Задолженностей нет</p>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-3 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="TrendingDown" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Расходов пока нет</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Диалог добавления платежа */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить платёж</DialogTitle>
            <DialogDescription>Зафиксируйте оплату от клиента</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Номер брони (необязательно)</Label>
              <Input
                placeholder="BK-12345"
                value={paymentForm.booking_id}
                onChange={(e) => setPaymentForm({...paymentForm, booking_id: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Клиент *</Label>
              <Input
                placeholder="ФИО клиента"
                value={paymentForm.client}
                onChange={(e) => setPaymentForm({...paymentForm, client: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Сумма *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={paymentForm.amount || ''}
                onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Тип платежа</Label>
              <Select value={paymentForm.type} onValueChange={(val) => setPaymentForm({...paymentForm, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Полная оплата</SelectItem>
                  <SelectItem value="prepayment">Предоплата</SelectItem>
                  <SelectItem value="deposit">Залог</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Способ оплаты *</Label>
              <Select value={paymentForm.method} onValueChange={(val) => setPaymentForm({...paymentForm, method: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="card">Карта</SelectItem>
                  <SelectItem value="transfer">Банковский перевод</SelectItem>
                  <SelectItem value="bank">Безналичный расчёт</SelectItem>
                  <SelectItem value="qr">QR-код (СБП)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Документ об оплате (чек, квитанция)</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentForm({...paymentForm, document: e.target.files?.[0] || null})}
              />
              {paymentForm.document && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="FileText" size={14} />
                  {paymentForm.document.name}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentFormOpen(false)}>Отмена</Button>
            <Button onClick={handleSavePayment}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог детальной информации */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Детали платежа #{selectedPayment?.id}</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Дата</div>
                  <div className="font-medium">{selectedPayment.date}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Бронь</div>
                  <div className="font-medium">{selectedPayment.booking_id}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Клиент</div>
                <div className="font-medium">{selectedPayment.client}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Тип</div>
                  <div className="font-medium">{selectedPayment.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Способ</div>
                  <div className="font-medium">{selectedPayment.method}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Сумма</div>
                <div className="text-2xl font-bold text-primary">₽{selectedPayment.amount.toLocaleString()}</div>
              </div>

              {selectedPayment.documentName && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Документ</div>
                  <div className="p-3 bg-sidebar/20 rounded-lg flex items-center gap-2">
                    <Icon name="FileText" size={18} />
                    <span className="text-sm">{selectedPayment.documentName}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Badge className="bg-success/20 text-success border-success/30">
                  {selectedPayment.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceSection;