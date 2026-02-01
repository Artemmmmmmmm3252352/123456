# Список зависимостей проекта

## Production Dependencies (dependencies)

### UI компоненты и библиотеки
- **@radix-ui/react-accordion** (^1.2.11) - Аккордеон компонент
- **@radix-ui/react-alert-dialog** (^1.1.14) - Диалог с предупреждением
- **@radix-ui/react-aspect-ratio** (^1.1.7) - Компонент для управления соотношением сторон
- **@radix-ui/react-avatar** (^1.1.10) - Компонент аватара
- **@radix-ui/react-checkbox** (^1.3.2) - Чекбокс
- **@radix-ui/react-collapsible** (^1.1.11) - Сворачиваемый компонент
- **@radix-ui/react-context-menu** (^2.2.15) - Контекстное меню
- **@radix-ui/react-dialog** (^1.1.14) - Модальное окно/диалог
- **@radix-ui/react-dropdown-menu** (^2.1.15) - Выпадающее меню
- **@radix-ui/react-hover-card** (^1.1.14) - Карточка при наведении
- **@radix-ui/react-label** (^2.1.7) - Компонент метки
- **@radix-ui/react-menubar** (^1.1.15) - Меню-бар
- **@radix-ui/react-navigation-menu** (^1.2.13) - Навигационное меню
- **@radix-ui/react-popover** (^1.1.14) - Всплывающее окно
- **@radix-ui/react-progress** (^1.1.7) - Индикатор прогресса
- **@radix-ui/react-radio-group** (^1.3.7) - Группа радиокнопок
- **@radix-ui/react-scroll-area** (^1.2.9) - Область прокрутки
- **@radix-ui/react-select** (^2.2.5) - Выпадающий список
- **@radix-ui/react-separator** (^1.1.7) - Разделитель
- **@radix-ui/react-slider** (^1.3.5) - Слайдер
- **@radix-ui/react-slot** (^1.2.3) - Слот для композиции компонентов
- **@radix-ui/react-switch** (^1.2.5) - Переключатель
- **@radix-ui/react-tabs** (^1.1.12) - Вкладки
- **@radix-ui/react-toast** (^1.2.14) - Уведомления (toast)
- **@radix-ui/react-toggle** (^1.1.9) - Переключатель
- **@radix-ui/react-toggle-group** (^1.1.10) - Группа переключателей
- **@radix-ui/react-tooltip** (^1.2.7) - Подсказка

### React и основные библиотеки
- **react** (^18.3.1) - Основная библиотека React
- **react-dom** (^18.3.1) - React DOM рендерер
- **react-router-dom** (^6.30.1) - Маршрутизация для React приложений

### Формы и валидация
- **react-hook-form** (^7.71.1) - Управление формами
- **@hookform/resolvers** (^3.10.0) - Резолверы для react-hook-form
- **zod** (^3.25.76) - Схема валидации TypeScript-first

### Стилизация и UI утилиты
- **tailwind-merge** (^2.6.0) - Объединение Tailwind классов
- **tailwindcss-animate** (^1.0.7) - Анимации для Tailwind CSS
- **class-variance-authority** (^0.7.1) - Управление вариантами классов
- **clsx** (^2.1.1) - Утилита для условных классов
- **framer-motion** (^12.26.2) - Библиотека анимаций для React

### Иконки
- **lucide-react** (^0.462.0) - Набор иконок
- **@phosphor-icons/react** (^2.1.10) - Иконки Phosphor для React

### Компоненты и утилиты
- **cmdk** (^1.1.1) - Командная палитра (command menu)
- **embla-carousel-react** (^8.6.0) - Карусель/слайдер
- **react-resizable-panels** (^2.1.9) - Изменяемые панели
- **vaul** (^0.9.9) - Drawer компонент
- **sonner** (^1.7.4) - Toast уведомления
- **input-otp** (^1.4.2) - OTP (одноразовый пароль) input

### Работа с данными
- **@tanstack/react-query** (^5.83.0) - Управление серверным состоянием и кэшированием
- **zustand** (^5.0.10) - Легковесная библиотека управления состоянием

### Работа с датами
- **date-fns** (^3.6.0) - Утилиты для работы с датами
- **react-day-picker** (^8.10.1) - Компонент выбора даты

### Графики
- **recharts** (^2.15.4) - Библиотека для построения графиков

### Markdown и математика
- **react-markdown** (^10.1.0) - Рендеринг Markdown в React
- **remark-math** (^6.0.0) - Плагин для математических формул в Markdown
- **rehype-katex** (^7.0.1) - Плагин для рендеринга математических формул
- **katex** (^0.16.28) - Библиотека для рендеринга математических формул

### Темы
- **next-themes** (^0.3.0) - Управление темами (светлая/темная)

### Утилиты
- **uuid** (^13.0.0) - Генерация UUID

---

## Development Dependencies (devDependencies)

### Сборка и инструменты разработки
- **vite** (^5.4.19) - Сборщик и dev-сервер
- **@vitejs/plugin-react-swc** (^3.11.0) - Плагин Vite для React с SWC

### TypeScript
- **typescript** (^5.8.3) - Язык программирования TypeScript
- **@types/node** (^22.16.5) - Типы для Node.js
- **@types/react** (^18.3.23) - Типы для React
- **@types/react-dom** (^18.3.7) - Типы для React DOM
- **@types/uuid** (^10.0.0) - Типы для uuid

### Стилизация
- **tailwindcss** (^3.4.17) - CSS фреймворк
- **@tailwindcss/typography** (^0.5.19) - Плагин Typography для Tailwind
- **postcss** (^8.5.6) - Инструмент для трансформации CSS
- **autoprefixer** (^10.4.21) - Автоматическое добавление префиксов CSS

### Линтинг и форматирование
- **eslint** (^9.32.0) - Линтер для JavaScript/TypeScript
- **@eslint/js** (^9.32.0) - Конфигурация ESLint
- **typescript-eslint** (^8.38.0) - ESLint плагин для TypeScript
- **eslint-plugin-react-hooks** (^5.2.0) - Правила для React Hooks
- **eslint-plugin-react-refresh** (^0.4.20) - Правила для React Refresh
- **globals** (^15.15.0) - Глобальные переменные для ESLint

### Тестирование
- **vitest** (^3.2.4) - Фреймворк для тестирования
- **@testing-library/react** (^16.0.0) - Утилиты для тестирования React компонентов
- **@testing-library/jest-dom** (^6.6.0) - Матчеры для DOM тестирования
- **jsdom** (^20.0.3) - Реализация DOM для Node.js (для тестирования)

### Другие инструменты
- **lovable-tagger** (^1.1.13) - Инструмент для тегирования

---

## Статистика зависимостей

- **Всего production зависимостей**: 45
- **Всего development зависимостей**: 16
- **Общее количество зависимостей**: 61

## Основные технологии

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI (множество компонентов)
- **State Management**: Zustand 5.0.10, TanStack Query 5.83.0
- **Routing**: React Router DOM 6.30.1
- **Forms**: React Hook Form 7.71.1 + Zod 3.25.76
- **Testing**: Vitest 3.2.4
