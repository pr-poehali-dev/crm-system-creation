import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface MaintenanceStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
}

export const MaintenanceStatusDialog = ({ open, onOpenChange, vehicle }: MaintenanceStatusDialogProps) => {
  if (!vehicle) return null;

  const maintenanceItems = [
    { 
      name: 'Антифриз',
      lastOdometer: 322199,
      lastDate: '01.09.2025',
      nextOdometer: 27373,
      status: 'ok'
    },
    { 
      name: 'Генератор, обслуживание',
      lastOdometer: 1,
      lastDate: null,
      nextOdometer: -254825,
      status: 'critical'
    },
    { 
      name: 'Жидкость тормозная',
      lastOdometer: 332633,
      lastDate: '05.10.2025',
      nextOdometer: 37807,
      status: 'ok'
    },
    { 
      name: 'Колодки тормозные задние',
      lastOdometer: 303550,
      lastDate: '30.06.2025',
      nextOdometer: 8724,
      status: 'warning'
    },
    { 
      name: 'Колодки тормозные передние',
      lastOdometer: 312677,
      lastDate: '31.07.2025',
      nextOdometer: 17851,
      status: 'ok'
    },
    { 
      name: 'Масло в АКПП',
      lastOdometer: 322199,
      lastDate: '01.09.2025',
      nextOdometer: 27373,
      status: 'ok'
    },
    { 
      name: 'Масло в заднем дифференциале',
      lastOdometer: 312677,
      lastDate: '31.07.2025',
      nextOdometer: 57851,
      status: 'ok'
    },
    { 
      name: 'Масло моторное',
      lastOdometer: 353426,
      lastDate: '10.01.2026',
      nextOdometer: 8600,
      status: 'warning'
    },
    { 
      name: 'Ремень/Цепь ГРМ',
      lastOdometer: 1,
      lastDate: '31.05.2024',
      nextOdometer: -154825,
      status: 'critical'
    },
    { 
      name: 'Фильтр воздушный',
      lastOdometer: 353426,
      lastDate: '10.01.2026',
      nextOdometer: 8600,
      status: 'warning'
    },
    { 
      name: 'Фильтр масляный',
      lastOdometer: 353426,
      lastDate: '10.01.2026',
      nextOdometer: 8600,
      status: 'warning'
    },
    { 
      name: 'Фильтр салона',
      lastOdometer: 353426,
      lastDate: '10.01.2026',
      nextOdometer: 8600,
      status: 'warning'
    },
    { 
      name: 'Фильтр топливный',
      lastOdometer: 342181,
      lastDate: '23.11.2025',
      nextOdometer: 7355,
      status: 'warning'
    },
  ];

  const currentOdometer = vehicle.current_km || 354826;

  const getStatusColor = (status: string) => {
    if (status === 'ok') return 'text-green-600';
    if (status === 'warning') return 'text-orange-600';
    if (status === 'critical') return 'text-red-600';
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Wrench" size={24} className="text-primary" />
            Статус ТО {vehicle.license_plate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Регламент ТО</div>
              <div className="font-medium">Starex ЕРБР-б</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Текущий пробег</div>
              <div className="text-xl font-bold">{currentOdometer.toLocaleString()} км</div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Наименование</th>
                  <th className="text-right p-3 font-medium">Последняя замена, пробег</th>
                  <th className="text-right p-3 font-medium">Дата</th>
                  <th className="text-right p-3 font-medium">Замена через, км</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceItems.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3">{item.name}</td>
                    <td className="text-right p-3 font-medium">
                      {item.lastOdometer > 1 ? item.lastOdometer.toLocaleString() : '—'}
                    </td>
                    <td className="text-right p-3 text-sm text-muted-foreground">
                      {item.lastDate || '—'}
                    </td>
                    <td className={cn('text-right p-3 font-bold', getStatusColor(item.status))}>
                      {item.nextOdometer > 0 ? item.nextOdometer.toLocaleString() : item.nextOdometer.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>В норме (&gt;10 000 км)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span>Скоро замена (&lt;10 000 км)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>Просрочено (отрицательное)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceStatusDialog;
