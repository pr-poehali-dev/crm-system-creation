import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Sidebar = ({ activeSection, onNavigate }: SidebarProps) => {
  const navItems = [
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

  return (
    <aside className="desktop-sidebar fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border md:flex flex-col items-center py-6 space-y-8 z-50 hidden">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
        РФ
      </div>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative',
            activeSection === item.id
              ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/50'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
          )}
        >
          <Icon name={item.icon as any} size={22} />
          <span className="absolute left-20 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-border">
            {item.label}
          </span>
        </button>
      ))}
    </aside>
  );
};
