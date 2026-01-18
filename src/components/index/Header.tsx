import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CacheCleaner from '@/components/CacheCleaner';

interface HeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
  onNewBooking: () => void;
  onDateClick: () => void;
}

export const Header = ({ userName, userRole, onLogout, onNewBooking, onDateClick }: HeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          CRM Русская Фантазия
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Управление заявками и автопарком</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-wrap w-full md:w-auto">
        <Badge variant="outline" className="hidden md:flex px-4 py-2">
          <Icon name="User" size={16} className="mr-2" />
          {userName} • {userRole}
        </Badge>
        <Badge 
          variant="outline" 
          className="px-3 md:px-4 py-2 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={onDateClick}
        >
          <Icon name="Calendar" size={14} className="mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
        </Badge>
        <Button variant="outline" className="hidden md:flex" size="sm">
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт
        </Button>
        <CacheCleaner />
        <Button variant="outline" onClick={onLogout} size="sm" className="hidden md:flex">
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти
        </Button>
        <Button 
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 flex-1 md:flex-none"
          onClick={onNewBooking}
          size="sm"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Новая заявка
        </Button>
      </div>
    </div>
  );
};
