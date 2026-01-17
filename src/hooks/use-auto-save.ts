import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

export function useAutoSave({ data, onSave, delay = 1000, enabled = true, onStatusChange }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRender = useRef(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Пропускаем первый рендер
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Если автосохранение отключено
    if (!enabled) return;

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('saving');
    onStatusChange?.('saving');

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        setStatus('saved');
        onStatusChange?.('saved');
        
        // Убираем индикатор через 2 секунды
        setTimeout(() => {
          setStatus('idle');
          onStatusChange?.('idle');
        }, 2000);
      } catch (error) {
        console.error('Ошибка автосохранения:', error);
        setStatus('error');
        onStatusChange?.('error');
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay]);

  return { status };
}