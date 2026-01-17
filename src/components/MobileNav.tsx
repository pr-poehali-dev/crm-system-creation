import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  userName: string;
  userRole: string;
}

const MobileNav = ({ activeSection, onNavigate, userName, userRole }: MobileNavProps) => {
  const menuItems = [
    { id: 'dashboard', icon: 'LayoutDashboard', label: 'Дашборд' },
    { id: 'leads', icon: 'Zap', label: 'Лиды' },
    { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
    { id: 'requests', icon: 'ClipboardList', label: 'Заявки' },
    { id: 'clients', icon: 'Users', label: 'Клиенты' },
    { id: 'partners', icon: 'Handshake', label: 'Партнёры' },
    { id: 'fleet', icon: 'Car', label: 'Автопарк' },
    { id: 'services', icon: 'Wrench', label: 'Услуги' },
    { id: 'finance', icon: 'Wallet', label: 'Финансы' },
    { id: 'integrations', icon: 'Plug', label: 'Интеграции' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  const mainItems = menuItems.slice(0, 4);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden mobile-bottom-nav bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="grid grid-cols-5 h-16 items-center">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all active:scale-95',
                activeSection === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                activeSection === item.id && 'bg-primary/20'
              )}>
                <Icon name={item.icon as any} size={22} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95 transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl">
                  <Icon name="Menu" size={22} />
                </div>
                <span className="text-[10px] font-medium">Ещё</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-[340px]">
              <SheetHeader>
                <SheetTitle>Меню</SheetTitle>
                <div className="py-2">
                  <Badge variant="outline" className="px-3 py-1.5">
                    <Icon name="User" size={14} className="mr-2" />
                    {userName} • {userRole}
                  </Badge>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      document.querySelector('[data-sheet-close]')?.dispatchEvent(new Event('click'));
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      activeSection === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <Icon name={item.icon as any} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default MobileNav;