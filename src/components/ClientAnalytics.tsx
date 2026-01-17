import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CLIENTS_API = 'https://functions.poehali.dev/c3ce619a-2f5c-4408-845b-21d43e357f57';

interface ClientAnalyticsProps {
  clients?: any[];
}

export const ClientAnalytics = ({ clients: providedClients }: ClientAnalyticsProps) => {
  const [clients, setClients] = useState<any[]>(providedClients || []);
  const [isLoading, setIsLoading] = useState(!providedClients);

  useEffect(() => {
    if (!providedClients) {
      loadClients();
    }
  }, [providedClients]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(CLIENTS_API);
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;
  const totalOrders = clients.reduce((sum, c) => sum + (c.orders_count || 0), 0);
  const blacklistedClients = clients.filter(c => c.is_blacklist).length;

  const topClients = [...clients]
    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
    .slice(0, 5);

  const sourceData = clients.reduce((acc: any, client) => {
    const source = client.source || 'Неизвестно';
    if (!acc[source]) {
      acc[source] = { name: source, value: 0 };
    }
    acc[source].value++;
    return acc;
  }, {});

  const sourceChartData = Object.values(sourceData);

  const cityData = clients.reduce((acc: any, client) => {
    const city = client.city || 'Не указан';
    if (!acc[city]) {
      acc[city] = { city, count: 0, revenue: 0 };
    }
    acc[city].count++;
    acc[city].revenue += client.total_spent || 0;
    return acc;
  }, {});

  const cityChartData = Object.values(cityData).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Загрузка аналитики...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего клиентов</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalClients}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Общая выручка</p>
                <p className="text-2xl sm:text-3xl font-bold">₽{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средний чек</p>
                <p className="text-2xl sm:text-3xl font-bold">₽{Math.round(avgRevenue).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Icon name="ShoppingCart" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              ТОП-5 клиентов по выручке
            </CardTitle>
            <CardDescription>Самые прибыльные клиенты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.orders_count || 0} заказов</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₽{(client.total_spent || 0).toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      ⭐ {(client.rating || 5).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" size={20} className="text-primary" />
              Источники клиентов
            </CardTitle>
            <CardDescription>Откуда приходят клиенты</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MapPin" size={20} className="text-primary" />
              Выручка по городам
            </CardTitle>
            <CardDescription>ТОП-5 городов по доходу</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₽${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" name="Выручка" fill="#4ECDC4" />
                <Bar dataKey="count" name="Клиентов" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {blacklistedClients > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-medium">Клиентов в черном списке: {blacklistedClients}</p>
                <p className="text-sm text-muted-foreground">Требуется внимание</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientAnalytics;
