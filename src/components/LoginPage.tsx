import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const USERS = {
  nikita: { password: 'nikita2026', name: 'Никита', role: 'Генеральный директор' },
  marina: { password: 'marina2026', name: 'Марина', role: 'Генеральный директор' },
};

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccessRequestOpen, setIsAccessRequestOpen] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = USERS[username.toLowerCase() as keyof typeof USERS];
      
      if (user && user.password === password) {
        toast({
          title: "Успешный вход",
          description: `Добро пожаловать, ${user.name}!`,
        });
        onLogin(username.toLowerCase());
        setLoginAttempts(0);
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          toast({
            title: "Доступ запрещён",
            description: "У вас нет прав для входа в систему. Запросите доступ.",
            variant: "destructive",
          });
          setIsAccessRequestOpen(true);
        } else {
          toast({
            title: "Ошибка входа",
            description: `Неверный логин или пароль. Попыток осталось: ${3 - newAttempts}`,
            variant: "destructive",
          });
        }
      }
      
      setIsLoading(false);
    }, 800);
  };

  const handleQuickLogin = (userKey: keyof typeof USERS) => {
    setUsername(userKey);
    setPassword(USERS[userKey].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sidebar/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border/50 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg shadow-primary/50">
            РФ
          </div>
          <div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CRM Русская Фантазия
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Управление заявками и автопарком
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                placeholder="nikita или marina"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Быстрый вход</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickLogin('nikita')}
              className="h-auto py-4 flex-col gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div className="text-center">
                <div className="font-medium">Никита</div>
                <div className="text-xs text-muted-foreground">Ген. директор</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickLogin('marina')}
              className="h-auto py-4 flex-col gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Icon name="User" size={20} className="text-secondary" />
              </div>
              <div className="text-center">
                <div className="font-medium">Марина</div>
                <div className="text-xs text-muted-foreground">Ген. директор</div>
              </div>
            </Button>
          </div>

          <Card className="bg-info/10 border-info/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Icon name="Shield" size={20} className="text-info mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Защищённый доступ</p>
                  <p>Ваши данные защищены. Все действия в системе логируются.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setIsAccessRequestOpen(true)}
            >
              <Icon name="UserPlus" size={18} className="mr-2" />
              Получить доступ к CRM "Русская Фантазия"
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAccessRequestOpen} onOpenChange={setIsAccessRequestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <Icon name="Lock" size={24} />
              </div>
              <div>
                <DialogTitle>Запрос доступа</DialogTitle>
                <DialogDescription>
                  Заполните форму для получения доступа к CRM
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Доступ ограничен</p>
                    <p className="text-muted-foreground">
                      CRM «Русская Фантазия» доступна только авторизованным сотрудникам.
                      Доступ предоставляется генеральными директорами.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="request_name">Ваше имя *</Label>
              <Input
                id="request_name"
                placeholder="Иван Иванов"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_email">Email или телефон *</Label>
              <Input
                id="request_email"
                placeholder="ivan@example.com или +7 999 123-45-67"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_reason">Причина запроса доступа *</Label>
              <Textarea
                id="request_reason"
                placeholder="Опишите, зачем вам нужен доступ к CRM и какую должность вы занимаете..."
                rows={4}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </div>

            <Card className="bg-info/10 border-info/30">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon name="Info" size={16} className="text-info mt-0.5 flex-shrink-0" />
                  <p>
                    Ваш запрос будет отправлен генеральным директорам Никите и Марине.
                    Они рассмотрят вашу заявку и свяжутся с вами.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAccessRequestOpen(false);
                setRequestName('');
                setRequestEmail('');
                setRequestReason('');
              }}
            >
              Отмена
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => {
                if (!requestName || !requestEmail || !requestReason) {
                  toast({
                    title: "Заполните все поля",
                    description: "Все поля обязательны для заполнения",
                    variant: "destructive",
                  });
                  return;
                }

                toast({
                  title: "Запрос отправлен",
                  description: "Генеральные директора рассмотрят вашу заявку. Ожидайте ответа на указанные контакты.",
                });

                console.log('Access request:', {
                  name: requestName,
                  contact: requestEmail,
                  reason: requestReason,
                  timestamp: new Date().toISOString(),
                });

                setIsAccessRequestOpen(false);
                setRequestName('');
                setRequestEmail('');
                setRequestReason('');
                setLoginAttempts(0);
              }}
            >
              <Icon name="Send" size={18} className="mr-2" />
              Отправить запрос
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;