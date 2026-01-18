import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function CacheCleaner() {
  const { toast } = useToast();

  const handleClearCache = async () => {
    try {
      // Очистить кэш Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Очистить Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Очистить localStorage
      localStorage.clear();
      
      // Очистить sessionStorage
      sessionStorage.clear();

      toast({
        title: "Кэш очищен",
        description: "Страница будет перезагружена через 1 секунду",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось очистить кэш. Попробуйте Ctrl+F5",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      className="gap-2"
    >
      <Icon name="RefreshCw" size={16} />
      Очистить кэш
    </Button>
  );
}
