# Настройка Appwrite для проекта

## Инструкция по настройке базы данных Appwrite

После установки зависимостей и настройки кода, необходимо создать структуру базы данных в Appwrite Console.

### 1. Создание базы данных

1. Перейдите в [Appwrite Console](https://cloud.appwrite.io)
2. Войдите в свой проект
3. Перейдите в раздел **Databases**
4. Создайте новую базу данных с ID: `main`

### 2. Создание коллекций

Создайте следующие коллекции в базе данных `main`:

#### Коллекция: `users`

**Атрибуты:**
- `email` (String, 255, required, unique)
- `name` (String, 255, required)
- `password` (String, 255, required)
- `avatar` (String, 500, optional)
- `createdAt` (String, 255, required)
- `role` (String, 50, required, default: "user")
- `balance` (Integer, required, default: 0)
- `quota` (String, 10000, required) - JSON объект: `{"used": 0, "lastReset": timestamp}`
- `inventory` (String, 10000, required) - JSON массив строк: `[]`
- `subscription` (String, 1000, required) - JSON объект: `{"plan": "free", "expiresAt": null}`
- `stats` (String, 10000, required) - JSON объект: `{"tokensUsed": 0, "chatsCount": 0, "totalSpent": 0}`
- `transactions` (String, 50000, required) - JSON массив объектов

**Индексы:**
- `email` (unique)

**Права доступа:**
- Create: Users
- Read: Any
- Update: Any
- Delete: Any

#### Коллекция: `chat_sessions`

**Атрибуты:**
- `userId` (String, 255, required)
- `title` (String, 255, required)
- `messages` (String, 100000, required) - JSON массив сообщений
- `createdAt` (String, 255, required)

**Индексы:**
- `userId` (key: userId)

**Права доступа:**
- Create: Users
- Read: Users (только свои сессии)
- Update: Users (только свои сессии)
- Delete: Users (только свои сессии)

#### Коллекция: `products`

**Атрибуты:**
- `title` (String, 255, required)
- `category` (String, 100, required)
- `price` (Integer, required)
- `image` (String, 500, required)
- `description` (String, 2000, optional)
- `purchasedContent` (String, 5000, optional)
- `accessLevel` (String, 50, optional) - значения: "free", "standard", "premium"

**Индексы:**
- `category` (key: category)

**Права доступа:**
- Create: Any
- Read: Any
- Update: Any
- Delete: Any

### 3. Настройка API ключа

API ключ уже настроен в файле `src/lib/appwrite.ts`:
- Endpoint: `https://cloud.appwrite.io/v1`
- Project ID: `standard_c32f0124d7f6b6c90b89aa5d16e6c21d0c7b2a8ef7043834dfa8f5754610b9562288f916119e249cc9af6a26dfb3eb6cb4d803bbdb9d348b3a36ff989480025f47bf8898d0bd58f763bd38a291b085616df1a373ec30bae0ad5a529b56f9d2ed9caf05b2bef5906febf95c7853c67ae63db7bd9d9f2dd2f0992aa0113c39e831`

### 4. Миграция данных (опционально)

Если у вас есть существующие данные в localStorage, они будут автоматически мигрированы при первом входе пользователя.

### 5. Тестирование

После настройки базы данных:
1. Запустите приложение: `npm run dev`
2. Зарегистрируйте нового пользователя
3. Проверьте, что данные сохраняются в Appwrite
4. Проверьте работу чата и сохранение сессий

### Важные замечания

- **Безопасность паролей**: В текущей реализации пароли хранятся в открытом виде. В продакшене необходимо использовать хеширование (например, bcrypt).
- **Права доступа**: Настройте права доступа в соответствии с требованиями безопасности вашего приложения.
- **Валидация данных**: Appwrite автоматически валидирует данные согласно атрибутам коллекций.
