# CRM Database Integration Guide

## ✅ Что уже сделано

### 1. База данных (PostgreSQL)
Созданы таблицы:
- `leads` - лиды
- `partners` - партнёры
- `partner_vehicles` - автомобили партнёров
- `partner_services` - услуги подрядчиков  
- `vehicle_handovers` - выдачи и приёмы автомобилей
- `finance_operations` - финансовые операции

### 2. Backend API
**Функция:** `backend/vehicles/index.py`
- Поддерживает `?action=handover` для записи выдач/приёмов
- Поддерживает `?action=handover_history` для просмотра истории

**URL:** `https://functions.poehali.dev/31c1f036-1400-4618-bf9f-592d93e0f06f`

### 3. Frontend хук
**Файл:** `src/hooks/useCRMData.ts`

Использование:
```tsx
import { useCRMData } from '@/hooks/useCRMData';

// В компоненте
const { data, loading, create, update, remove } = useCRMData({ 
  type: 'vehicle_handovers',
  vehicleId: 123 // опционально
});

// Создать запись
await create({ vehicle_id: 1, type: 'pickup', ... });

// Обновить
await update(id, { notes: 'Updated' });

// Удалить
await remove(id);
```

### 4. История выдач/приёмов
**Компонент:** `src/components/VehicleHandoverHistory.tsx`
- Показывает все выдачи и приёмы автомобиля
- Отображает пробег, топливо, залог, оплату
- Интегрирован в автопарк (кнопка с иконкой History)

## 📝 Как интегрировать БД в другие компоненты

### Пример 1: FinanceSection (финансы)
```tsx
import { useCRMData } from '@/hooks/useCRMData';

export const FinanceSection = () => {
  const { data: payments, create, refresh } = useCRMData<Payment>({ 
    type: 'finances',
    category: 'payment'
  });

  const handleSavePayment = async () => {
    await create({
      operation_id: `PM-${Date.now()}`,
      client_name: form.client,
      amount: form.amount,
      method: form.method,
      category: 'payment',
      type: 'Оплата',
      status: 'completed'
    });
    refresh(); // Обновить список
  };

  return (
    <div>
      {payments.map(p => <PaymentCard key={p.id} payment={p} />)}
    </div>
  );
};
```

### Пример 2: LeadsSection (лиды)
```tsx
import { useCRMData } from '@/hooks/useCRMData';

export const LeadsSection = () => {
  const { data: leads, create, update } = useCRMData<Lead>({ 
    type: 'leads'
  });

  const handleCreateLead = async (leadData) => {
    await create({
      lead_id: `LD-${Date.now()}`,
      client_name: leadData.name,
      phone: leadData.phone,
      source: leadData.source,
      status: 'new'
    });
  };

  const handleUpdateStatus = async (id, status) => {
    await update(id, { status });
  };

  return (
    <div>
      {leads.map(lead => (
        <LeadCard 
          key={lead.id} 
          lead={lead}
          onStatusChange={(status) => handleUpdateStatus(lead.id, status)}
        />
      ))}
    </div>
  );
};
```

### Пример 3: PartnersSection (партнёры)
```tsx
import { useCRMData } from '@/hooks/useCRMData';

export const PartnersSection = () => {
  const { data: partners, create, update, remove } = useCRMData<Partner>({ 
    type: 'partners'
  });

  const handleSavePartner = async (partner) => {
    if (partner.id) {
      await update(partner.id, partner);
    } else {
      await create({
        partner_id: `PT-${Date.now()}`,
        ...partner
      });
    }
  };

  return (
    <div>
      {partners.map(p => <PartnerCard key={p.id} partner={p} />)}
    </div>
  );
};
```

## 🔄 Автосинхронизация

Все изменения автоматически сохраняются в БД при вызове `create`, `update`, `remove`.

Для автообновления данных используйте:
```tsx
const { data, refresh } = useCRMData({ type: 'leads' });

// Обновить данные вручную
useEffect(() => {
  const interval = setInterval(refresh, 30000); // каждые 30 сек
  return () => clearInterval(interval);
}, [refresh]);
```

## 📊 Доступные типы данных

| Type | Описание |
|------|----------|
| `leads` | Лиды |
| `partners` | Партнёры |
| `vehicle_handovers` | Выдачи/приёмы авто |
| `finances` | Финансы |
| `bookings` | Брони |
| `vehicles` | Автопарк |
| `clients` | Клиенты |
| `requests` | Заявки |

## 🎯 Следующие шаги

1. Интегрировать БД в `FinanceSection`
2. Интегрировать БД в `LeadsSection`
3. Интегрировать БД в `PartnersSection`
4. Интегрировать БД в `ClientsSection`
5. Добавить real-time updates через WebSockets (опционально)
