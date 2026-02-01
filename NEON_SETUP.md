# Настройка Neon PostgreSQL

## ✅ Установка завершена

Проект настроен для работы с **Neon PostgreSQL** - современной облачной базой данных.

## Шаги настройки

### 1. Создание таблиц в базе данных

**Вариант 1: Автоматически через скрипт (рекомендуется)**
```bash
npm run init-db
```

**Вариант 2: Через Neon Console**
1. Откройте [Neon Console](https://console.neon.tech)
2. Выберите ваш проект
3. Перейдите в SQL Editor
4. Скопируйте содержимое файла `database/schema.sql`
5. Выполните скрипт

**Вариант 3: Через psql**
```bash
psql 'postgresql://neondb_owner:npg_W8opYvisq7Zl@ep-winter-wind-ahf3uxvs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' < database/schema.sql
```

### 2. Структура базы данных

После выполнения скрипта будут созданы:

- **Таблица `users`** - пользователи системы
- **Таблица `chat_sessions`** - сессии чата
- **Таблица `products`** - продукты в магазине

### 3. Проверка подключения

1. Запустите приложение:
   ```bash
   npm run dev
   ```

2. Зарегистрируйте нового пользователя
3. Проверьте в Neon Console, что пользователь создан в таблице `users`

## Конфигурация

Строка подключения настроена в `src/lib/neon.ts`:
```typescript
const DATABASE_URL = 'postgresql://neondb_owner:npg_W8opYvisq7Zl@ep-winter-wind-ahf3uxvs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
```

## Особенности

- ✅ Использует **PostgreSQL** (полноценная реляционная БД)
- ✅ **JSONB** для хранения сложных структур (quota, inventory, subscription, stats, transactions, messages)
- ✅ **UUID** для ID записей
- ✅ **Индексы** для быстрого поиска
- ✅ **CASCADE** удаление (при удалении пользователя удаляются его сессии)

## Миграция данных

Если у вас были данные в Appwrite, их нужно будет мигрировать вручную или создать скрипт миграции.

## Тестирование

После создания таблиц:
1. Зарегистрируйте пользователя
2. Создайте сообщение в чате
3. Добавьте продукт через админ-панель

Все должно работать с Neon PostgreSQL!
