import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

export const ServicesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('individual');

  const individualServices = {
    'Озон и запахи': [
      { name: 'Озонирование салона базовое', price: 3500, time: '30-40 мин', crossover: '+30%', minivan: '+50%' },
      { name: 'Озонирование усиленное', price: 5500, time: '60-90 мин', crossover: '+30%', minivan: '+50%' },
      { name: 'Удаление запаха после курения', price: 8000, time: '2 часа', crossover: '+30%', minivan: '+50%' },
      { name: 'Удаление запаха после животных', price: 9000, time: '2.5 часа', crossover: '+30%', minivan: '+50%' },
      { name: 'Удаление плесени комплекс', price: 17000, time: '4 часа', crossover: '+30%', minivan: '+50%' },
    ],
    'Химчистка': [
      { name: 'Экспресс-химчистка (2 сиденья)', price: 5000, time: '1 час', crossover: '+30%', minivan: '+50%' },
      { name: 'Химчистка салона (без потолка)', price: 13000, time: '3 часа', crossover: '+30%', minivan: '+50%' },
      { name: 'Химчистка салона полная (с потолком)', price: 20000, time: '5 часов', crossover: '+30%', minivan: '+50%' },
      { name: 'Химчистка потолка', price: 7000, time: '2 часа', crossover: '+30%', minivan: '+50%' },
    ],
    'Стекла и фары': [
      { name: 'Полировка фар (пара)', price: 6500, crossover: '+20%', minivan: '+30%' },
      { name: 'Антидождь (все стекла)', price: 3500, crossover: '+20%', minivan: '+30%' },
      { name: 'Заклейка скола', price: 2500, crossover: '+20%', minivan: '+30%' },
    ],
    'АКБ и электрика': [
      { name: 'Запуск автомобиля (прикурить)', price: 2500 },
      { name: 'Диагностика АКБ', price: 2000 },
      { name: 'Зарядка АКБ (выезд)', price: 5000 },
    ],
  };

  const packages = [
    { name: 'Антизапах Про', description: 'Озон 90 мин + химчистка + фильтр + кондиционер', price: 24000, old: 31000 },
    { name: 'Прощай, курилка', description: 'Озон + химчистка + фильтр + потолок', price: 26000, old: 34000 },
    { name: 'Идеальный салон', description: 'Химчистка + озон + кожа + пластик + потолок', price: 36000, old: 48000 },
    { name: 'Продай дороже Премиум', description: 'Полная подготовка к продаже', price: 40000, old: 54000 },
  ];

  const subscriptions = [
    { name: 'Чистый салон', description: '4 озонирования/месяц', price: 13000, old: 14000, period: 'месяц' },
    { name: 'Сезонный уход', description: '4 комплекса/год', price: 32000, old: 42000, period: 'год' },
    { name: 'Всегда готов', description: '12 визитов/год', price: 80000, old: 115000, period: 'год' },
  ];

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Wrench" size={24} className="text-primary" />
                Каталог услуг Русская Фантазия
              </CardTitle>
              <CardDescription>Полный спектр выездных услуг для вашего автомобиля</CardDescription>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Icon name="Clock" size={16} className="mr-2" />
              09:00-19:00
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="individual">Индивидуальные</TabsTrigger>
              <TabsTrigger value="packages">Пакеты</TabsTrigger>
              <TabsTrigger value="subscriptions">Абонементы</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(individualServices).map(([category, services], idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                      {category}
                      <Badge variant="secondary" className="ml-2">{services.length}</Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {services.map((service, sIdx) => (
                          <div key={sIdx} className="p-3 rounded-lg bg-sidebar/20 border border-border/50 hover:border-primary/50 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{service.name}</div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  {service.time && (
                                    <span className="flex items-center gap-1">
                                      <Icon name="Clock" size={14} />
                                      {service.time}
                                    </span>
                                  )}
                                  {service.crossover && <span>Кроссовер: {service.crossover}</span>}
                                  {service.minivan && <span>Минивэн: {service.minivan}</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">от ₽{service.price.toLocaleString()}</div>
                                <Button size="sm" variant="outline" className="mt-2">Заказать</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              {packages.map((pkg, idx) => (
                <div key={idx} className="p-5 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold">{pkg.name}</h4>
                        <Badge className="bg-success">Экономия ₽{(pkg.old - pkg.price).toLocaleString()}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{pkg.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through">₽{pkg.old.toLocaleString()}</span>
                        <Icon name="ArrowRight" size={16} />
                        <span className="text-2xl font-bold text-primary">₽{pkg.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="ShoppingCart" size={18} className="mr-2" />
                      Заказать
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4">
              {subscriptions.map((sub, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-sidebar/40 to-sidebar/20 border-border/50 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{sub.name}</span>
                      <Badge variant="outline" className="text-lg px-4 py-2">₽{sub.price.toLocaleString()}/{sub.period}</Badge>
                    </CardTitle>
                    <CardDescription>{sub.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm space-y-1">
                        <div className="text-muted-foreground">Без абонемента: ₽{sub.old.toLocaleString()}</div>
                        <div className="text-success font-medium">Экономия: ₽{(sub.old - sub.price).toLocaleString()}/{sub.period}</div>
                      </div>
                      <Button variant="outline">
                        <Icon name="Phone" size={18} className="mr-2" />
                        Подключить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/30">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-info mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-medium mb-1">Дополнительная информация</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Выезд в пределах МКАД — БЕСПЛАТНО при заказе от ₽5,000</li>
                  <li>• Ночное время (19:00-09:00) — +50% к стоимости</li>
                  <li>• Кроссоверы/внедорожники — наценка указана для каждой услуги</li>
                  <li>• Формат "Забрать-Сделать-Вернуть" — доплата от ₽3,000</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesSection;
