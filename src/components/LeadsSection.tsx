import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  source: 'avito' | 'telegram' | 'whatsapp' | 'phone' | 'site';
  client: string;
  phone: string;
  message: string;
  car: string;
  stage: 'new' | 'contact' | 'meeting' | 'offer' | 'deal' | 'rejected';
  created: string;
  lastActivity: string;
  sum: number;
  manager?: string;
}

interface LeadsSectionProps {
  onConvertToClient?: (leadData: { name: string; phone: string }) => void;
}

export const LeadsSection = ({ onConvertToClient }: LeadsSectionProps = {}) => {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeStage, setActiveStage] = useState<string>('all');

  const stages = [
    { id: 'new', name: 'Новый', color: 'bg-blue-500', count: 8 },
    { id: 'contact', name: 'Связались', color: 'bg-purple-500', count: 12 },
    { id: 'meeting', name: 'Встреча', color: 'bg-orange-500', count: 5 },
    { id: 'offer', name: 'Предложение', color: 'bg-yellow-500', count: 7 },
    { id: 'deal', name: 'Сделка', color: 'bg-green-500', count: 23 },
    { id: 'rejected', name: 'Отказ', color: 'bg-red-500', count: 4 },
  ];

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    client: '',
    phone: '',
    message: '',
    car: '',
    sum: 0
  });

  const loadAvitoMessages = async () => {
    setIsLoadingLeads(true);
    try {
      toast({
        title: "Загрузка диалогов из Avito",
        description: "Получаем новые сообщения...",
      });
      
      const response = await fetch(
        'https://functions.poehali.dev/3bb741cd-372e-476f-a500-1db53ca2236d'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Форматируем даты для отображения
        const formattedLeads = data.leads.map((lead: any) => ({
          ...lead,
          created: new Date(lead.created).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          lastActivity: new Date(lead.lastActivity).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        
        setLeads(formattedLeads);
        
        if (data.count === 0) {
          toast({
            title: "Ручной режим работы",
            description: data.message || "Добавляйте диалоги из Avito вручную через кнопку 'Добавить диалог вручную'",
          });
        } else {
          toast({
            title: "Диалоги загружены",
            description: `Загружено ${data.count} диалогов с Avito`,
          });
        }
      } else {
        throw new Error('Неверный формат ответа');
      }
    } catch (error) {
      console.error('Avito loading error:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить диалоги из Avito. Проверьте настройки интеграции.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      avito: 'ShoppingBag',
      telegram: 'Send',
      whatsapp: 'MessageCircle',
      phone: 'Phone',
      site: 'Globe',
    };
    return icons[source] || 'User';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      avito: 'bg-blue-500',
      telegram: 'bg-blue-400',
      whatsapp: 'bg-green-500',
      phone: 'bg-purple-500',
      site: 'bg-orange-500',
    };
    return colors[source] || 'bg-gray-500';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-700 border-blue-300',
      contact: 'bg-purple-500/20 text-purple-700 border-purple-300',
      meeting: 'bg-orange-500/20 text-orange-700 border-orange-300',
      offer: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
      deal: 'bg-green-500/20 text-green-700 border-green-300',
      rejected: 'bg-red-500/20 text-red-700 border-red-300',
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-700';
  };

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      new: 'Новый',
      contact: 'Связались',
      meeting: 'Встреча',
      offer: 'Предложение',
      deal: 'Сделка',
      rejected: 'Отказ',
    };
    return names[stage] || stage;
  };

  const filteredLeads = activeStage === 'all' 
    ? leads 
    : leads.filter(lead => lead.stage === activeStage);

  const moveToStage = (leadId: string, newStage: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage as any, lastActivity: new Date().toLocaleString('ru-RU') } : lead
    ));
    toast({
      title: "Лид перемещён",
      description: `Статус изменён на "${getStageName(newStage)}"`,
    });
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" size={24} className="text-primary" />
                Лиды и сделки
              </CardTitle>
              <CardDescription>
                Воронка продаж и работа с обращениями из всех каналов
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={loadAvitoMessages}
                disabled={isLoadingLeads}
              >
                <Icon name="Download" size={18} className="mr-2" />
                {isLoadingLeads ? 'Загрузка...' : 'Загрузить из Avito'}
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary"
                onClick={() => setIsAddLeadOpen(true)}
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить диалог вручную
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-6 gap-3 mb-6">
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                activeStage === 'all' ? 'ring-2 ring-primary' : ''
              )}
              onClick={() => setActiveStage('all')}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{leads.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Всего</div>
              </CardContent>
            </Card>
            {stages.map((stage) => {
              const count = leads.filter(l => l.stage === stage.id).length;
              return (
                <Card 
                  key={stage.id}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    activeStage === stage.id ? 'ring-2 ring-primary' : ''
                  )}
                  onClick={() => setActiveStage(stage.id)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)}></div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{stage.name}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <Input placeholder="Поиск по имени, телефону, сообщению..." className="flex-1" />
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все источники</SelectItem>
                <SelectItem value="avito">Avito</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">Телефон</SelectItem>
                <SelectItem value="site">Сайт</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Icon name="SlidersHorizontal" size={18} className="mr-2" />
              Фильтры
            </Button>
          </div>

          <div className="space-y-3">
            {leads.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Icon name="Inbox" size={32} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Нет лидов</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Загрузите диалоги из Avito или добавьте лид вручную
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline"
                          onClick={loadAvitoMessages}
                          disabled={isLoadingLeads}
                        >
                          <Icon name="Download" size={18} className="mr-2" />
                          Загрузить из Avito
                        </Button>
                        <Button className="bg-gradient-to-r from-primary to-secondary">
                          <Icon name="Plus" size={18} className="mr-2" />
                          Добавить лид
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredLeads.map((lead) => (
              <Card 
                key={lead.id}
                className="hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setSelectedLead(lead)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', getSourceColor(lead.source))}>
                          <Icon name={getSourceIcon(lead.source) as any} size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-lg">{lead.client}</div>
                            <Badge className={cn('border', getStageColor(lead.stage))}>
                              {getStageName(lead.stage)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Phone" size={14} />
                              {lead.phone}
                            </span>
                            {lead.manager && (
                              <span className="flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {lead.manager}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {lead.lastActivity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pl-13 space-y-2">
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {lead.message}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Icon name="Car" size={14} className="text-muted-foreground" />
                            <span className="font-medium">{lead.car}</span>
                          </span>
                          <span className="text-primary font-bold">
                            {lead.sum > 0 ? `₽${lead.sum.toLocaleString()}` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="ChevronRight" size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedLead !== null} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white', getSourceColor(selectedLead.source))}>
                      <Icon name={getSourceIcon(selectedLead.source) as any} size={24} />
                    </div>
                    <div>
                      <DialogTitle>{selectedLead.client}</DialogTitle>
                      <DialogDescription>{selectedLead.phone}</DialogDescription>
                    </div>
                  </div>
                  <Badge className={cn('border text-sm px-3 py-1', getStageColor(selectedLead.stage))}>
                    {getStageName(selectedLead.stage)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Этапы сделки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {stages.map((stage) => (
                        <Button
                          key={stage.id}
                          variant={selectedLead.stage === stage.id ? 'default' : 'outline'}
                          className={cn(
                            selectedLead.stage === stage.id && stage.color.replace('bg-', 'bg-') + ' text-white hover:opacity-90'
                          )}
                          onClick={() => moveToStage(selectedLead.id, stage.id)}
                        >
                          {stage.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Сообщение клиента</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      {selectedLead.message}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Интересующее авто</div>
                        <div className="font-medium">{selectedLead.car}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Сумма сделки</div>
                        <div className="font-bold text-primary text-lg">
                          {selectedLead.sum > 0 ? `₽${selectedLead.sum.toLocaleString()}` : 'Не указана'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="MessageSquare" size={20} />
                      История общения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                            <p className="text-sm">{selectedLead.message}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{selectedLead.created}</div>
                        </div>
                      </div>

                      {selectedLead.stage !== 'new' && (
                        <div className="flex gap-3 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Icon name="User" size={16} className="text-white" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none inline-block text-left">
                              <p className="text-sm">Здравствуйте! Я свяжусь с вами в ближайшее время для уточнения деталей.</p>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{selectedLead.lastActivity}</div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Textarea placeholder="Написать сообщение..." rows={3} />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                            <Icon name="Send" size={14} className="mr-2" />
                            Отправить
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icon name="Phone" size={14} className="mr-2" />
                            Позвонить
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icon name="FileText" size={14} className="mr-2" />
                            Шаблон
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Информация о лиде</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="manager">Ответственный</Label>
                        <Select defaultValue={selectedLead.manager || 'none'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не назначен</SelectItem>
                            <SelectItem value="anna">Анна К.</SelectItem>
                            <SelectItem value="sergey">Сергей П.</SelectItem>
                            <SelectItem value="dmitry">Дмитрий И.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sum">Сумма сделки</Label>
                        <Input 
                          id="sum" 
                          type="number"
                          placeholder="0"
                          defaultValue={selectedLead.sum}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Заметки</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Дополнительная информация о клиенте..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Закрыть
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (onConvertToClient && selectedLead) {
                      onConvertToClient({
                        name: selectedLead.client,
                        phone: selectedLead.phone
                      });
                      setSelectedLead(null);
                      toast({
                        title: "Переход к созданию клиента",
                        description: `Данные из лида ${selectedLead.client} перенесены в форму клиента`,
                      });
                    }
                  }}
                >
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Перевести в клиента
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог добавления лида вручную */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить диалог из Avito</DialogTitle>
            <DialogDescription>
              Внесите информацию из диалога с клиентом с Avito
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead_client">Имя клиента</Label>
                <Input
                  id="lead_client"
                  placeholder="Александр"
                  value={newLead.client}
                  onChange={(e) => setNewLead({ ...newLead, client: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_phone">Телефон (если есть)</Label>
                <Input
                  id="lead_phone"
                  placeholder="+7 (999) 123-45-67"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="lead_car">Интересующий автомобиль</Label>
                <Input
                  id="lead_car"
                  placeholder="BMW X5 2019"
                  value={newLead.car}
                  onChange={(e) => setNewLead({ ...newLead, car: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="lead_message">Сообщение клиента</Label>
                <Textarea
                  id="lead_message"
                  placeholder="Здравствуйте, интересует ваш автомобиль..."
                  rows={4}
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_sum">Предполагаемая сумма (₽)</Label>
                <Input
                  id="lead_sum"
                  type="number"
                  placeholder="0"
                  value={newLead.sum}
                  onChange={(e) => setNewLead({ ...newLead, sum: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Card className="bg-info/10 border-info/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-info mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Инструкция</p>
                    <p className="text-muted-foreground">
                      Скопируйте информацию из диалога с клиентом в Avito и вставьте в форму.
                      После добавления сможете обработать обращение и перевести в клиенты.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => {
                if (!newLead.client || !newLead.message) {
                  toast({
                    title: "Ошибка",
                    description: "Заполните имя клиента и сообщение",
                    variant: "destructive",
                  });
                  return;
                }

                const lead: Lead = {
                  id: `manual_${Date.now()}`,
                  source: 'avito',
                  client: newLead.client,
                  phone: newLead.phone || 'Не указан',
                  message: newLead.message,
                  car: newLead.car || 'Не указан',
                  stage: 'new',
                  created: new Date().toLocaleString('ru-RU'),
                  lastActivity: new Date().toLocaleString('ru-RU'),
                  sum: newLead.sum
                };

                setLeads([lead, ...leads]);
                setIsAddLeadOpen(false);
                setNewLead({ client: '', phone: '', message: '', car: '', sum: 0 });

                toast({
                  title: "Диалог добавлен",
                  description: `Обращение от ${lead.client} добавлено в лиды`,
                });
              }}
            >
              <Icon name="Save" size={18} className="mr-2" />
              Добавить лид
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsSection;