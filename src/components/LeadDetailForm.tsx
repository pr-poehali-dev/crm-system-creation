import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface LeadDetailFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leadData: any) => void;
}

export const LeadDetailForm = ({ open, onOpenChange, onSave }: LeadDetailFormProps) => {
  const { toast } = useToast();
  const [leadData, setLeadData] = useState({
    // Основная информация
    client_name: '',
    client_phone: '',
    client_email: '',
    telegram_username: '',
    telegram_link: '',
    
    // Паспортные данные
    passport_series: '',
    passport_number: '',
    passport_issued_by: '',
    passport_issued_date: '',
    passport_registration: '',
    birth_date: '',
    birth_place: '',
    
    // Водительское удостоверение
    driver_license_series: '',
    driver_license_number: '',
    driver_license_issued_date: '',
    driver_license_expiry_date: '',
    driver_license_issued_by: '',
    driver_license_categories: '',
    
    // Дополнительно
    notes: '',
    source: 'manual',
    documents: [] as File[],
    media: [] as File[],
  });

  const updateData = (key: string, value: any) => {
    setLeadData({ ...leadData, [key]: value });
  };

  const handleFileUpload = (type: 'documents' | 'media', files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    updateData(type, [...leadData[type], ...newFiles]);
  };

  const removeFile = (type: 'documents' | 'media', index: number) => {
    const updated = leadData[type].filter((_, i) => i !== index);
    updateData(type, updated);
  };

  const handleSave = () => {
    if (!leadData.client_name || !leadData.client_phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните имя и телефон',
        variant: 'destructive',
      });
      return;
    }

    onSave(leadData);
    toast({
      title: 'Успешно',
      description: 'Лид сохранён',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            Детальная форма лида
          </DialogTitle>
          <DialogDescription>Заполните полную информацию о клиенте</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="main">Основное</TabsTrigger>
            <TabsTrigger value="passport">Паспорт</TabsTrigger>
            <TabsTrigger value="license">Права</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ФИО *</Label>
                <Input
                  placeholder="Иванов Иван Иванович"
                  value={leadData.client_name}
                  onChange={(e) => updateData('client_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input
                  placeholder="+7 (999) 123-45-67"
                  value={leadData.client_phone}
                  onChange={(e) => updateData('client_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={leadData.client_email}
                  onChange={(e) => updateData('client_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Дата рождения</Label>
                <Input
                  type="date"
                  value={leadData.birth_date}
                  onChange={(e) => updateData('birth_date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Место рождения</Label>
              <Input
                placeholder="г. Москва"
                value={leadData.birth_place}
                onChange={(e) => updateData('birth_place', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Заметки</Label>
              <Textarea
                placeholder="Дополнительная информация о клиенте"
                value={leadData.notes}
                onChange={(e) => updateData('notes', e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="passport" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="CreditCard" size={20} />
                  Паспортные данные
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Серия</Label>
                    <Input
                      placeholder="0319"
                      value={leadData.passport_series}
                      onChange={(e) => updateData('passport_series', e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Номер</Label>
                    <Input
                      placeholder="547170"
                      value={leadData.passport_number}
                      onChange={(e) => updateData('passport_number', e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Кем выдан</Label>
                  <Textarea
                    placeholder="ГУ МВД России по Краснодарскому краю"
                    value={leadData.passport_issued_by}
                    onChange={(e) => updateData('passport_issued_by', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Дата выдачи</Label>
                  <Input
                    type="date"
                    value={leadData.passport_issued_date}
                    onChange={(e) => updateData('passport_issued_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Адрес регистрации</Label>
                  <Textarea
                    placeholder="г. Хадыженск, ул. Колхозная, д. 48"
                    value={leadData.passport_registration}
                    onChange={(e) => updateData('passport_registration', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Car" size={20} />
                  Водительское удостоверение
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Серия</Label>
                    <Input
                      placeholder="4509"
                      value={leadData.driver_license_series}
                      onChange={(e) => updateData('driver_license_series', e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Номер</Label>
                    <Input
                      placeholder="380313"
                      value={leadData.driver_license_number}
                      onChange={(e) => updateData('driver_license_number', e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Категории</Label>
                  <Input
                    placeholder="B, B1"
                    value={leadData.driver_license_categories}
                    onChange={(e) => updateData('driver_license_categories', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дата выдачи</Label>
                    <Input
                      type="date"
                      value={leadData.driver_license_issued_date}
                      onChange={(e) => updateData('driver_license_issued_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата окончания</Label>
                    <Input
                      type="date"
                      value={leadData.driver_license_expiry_date}
                      onChange={(e) => updateData('driver_license_expiry_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Кем выдано</Label>
                  <Textarea
                    placeholder="ОТДЕЛЕНИЕМ ПО РАЙОНУ ЧЕРТАНОВО ЮЖНОЕ ОУФМС РОССИИ ПО ГОР.МОСКВЕ В ЮАО"
                    value={leadData.driver_license_issued_by}
                    onChange={(e) => updateData('driver_license_issued_by', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="MessageCircle" size={20} />
                  Контакты и мессенджеры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Icon name="Send" size={16} />
                    Telegram username
                  </Label>
                  <Input
                    placeholder="@username"
                    value={leadData.telegram_username}
                    onChange={(e) => updateData('telegram_username', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Icon name="Link" size={16} />
                    Ссылка на Telegram
                  </Label>
                  <Input
                    placeholder="https://t.me/username"
                    value={leadData.telegram_link}
                    onChange={(e) => updateData('telegram_link', e.target.value)}
                  />
                  {leadData.telegram_link && (
                    <a 
                      href={leadData.telegram_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Icon name="ExternalLink" size={14} />
                      Открыть в Telegram
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Paperclip" size={20} />
                  Документы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Загрузить документы (паспорт, права, договоры)</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload('documents', e.target.files)}
                  />
                </div>
                {leadData.documents.length > 0 && (
                  <div className="space-y-2">
                    {leadData.documents.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-sidebar/20 rounded">
                        <span className="text-sm flex items-center gap-2">
                          <Icon name="FileText" size={16} />
                          {file.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile('documents', idx)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Image" size={20} />
                  Медиа файлы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Загрузить фото/видео</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload('media', e.target.files)}
                  />
                </div>
                {leadData.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {leadData.media.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-square bg-sidebar/20 rounded flex items-center justify-center">
                          <Icon name="Image" size={32} className="text-muted-foreground" />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile('media', idx)}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                        <span className="text-xs truncate block mt-1">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить лида</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailForm;
