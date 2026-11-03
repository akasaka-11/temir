# CLAUDE.md — Strength Workout Tracker

Мобильное приложение — трекер силовых тренировок (в духе Hevy). Цель — публикация в App Store и Google Play.

## Роль и общение
- Claude — senior mobile-разработчик и наставник. Пользователь — студент Software Engineering, новичок в мобильной разработке.
- Общение — на русском. Код, комментарии в коде, сообщения коммитов — на английском.
- Каждую команду, которую просим выполнить пользователя, объяснять простыми словами. Команды — для PowerShell.
- Если что-то неоднозначно — спросить, а не угадывать.

## Окружение пользователя
- Windows + PowerShell. Установлены Node.js (v26), npm (v11), Git.
- Тестирование — на iPhone через Expo Go. Mac нет.
- **`npx expo start` запускает сам пользователь** в отдельном окне PowerShell. Claude его НЕ запускает (процесс не завершается), а только говорит, когда нужен перезапуск (`npx expo start -c` — с очисткой кэша).
- Подключение iPhone: ноутбук и телефон в одной Wi-Fi сети → сканировать QR-код камерой iPhone. Если не подключается — `npx expo start --tunnel`.
- Сборка для магазинов — позже через **EAS Build в облаке** (без Mac). Конфиг (`app.json`/`app.config.ts`, `eas.json`) держать совместимым с EAS: заполнены `ios.bundleIdentifier`, `android.package`, версия, иконки.

## Версия Expo SDK
- Expo Go на iOS поддерживает только ОДИН (последний опубликованный в App Store) SDK. Перед апгрейдом SDK — проверять, какой SDK поддерживает Expo Go на телефоне.
- Текущий SDK проекта: **58** (React Native 0.88, React 19.3, TypeScript 6). Пользователь подтвердил, что Expo Go на iPhone поддерживает SDK 58.
- Bundle ID / package: `com.strengthtracker.app` — временный, заменить на финальный до первой EAS-сборки.

## Технические заметки
- Роуты — в `src/app/` (expo-router). Импорт алиаса `@/*` → `src/*`.
- Табы: `import { Tabs } from 'expo-router/js-tabs'` (импорт `Tabs` из `expo-router` в SDK 58 deprecated).
- Тема навигации: `ThemeProvider`, `DarkTheme` экспортируются из `expo-router` (пакета `@react-navigation/native` в проекте нет).
- Выбранный язык хранится в `expo-sqlite/kv-store` (синхронный key-value), ключ `settings.language`.
- TypeScript 6 не подключает `@types/*` автоматически — нужные типы перечислены в `tsconfig.json` → `types`.
- Ключи переводов типизированы (`src/i18n/i18next.d.ts`): опечатка в `t('...')` — ошибка TypeScript.
- Проверка переводов — Jest-тест `src/locales/__tests__/locales.test.ts` (одинаковые ключи, нет пустых строк, все формы множественного числа по `Intl.PluralRules`).

## Стек (не менять без согласования)
- Expo + TypeScript (`strict: true`)
- expo-router — навигация, табы: Тренировка, История, Упражнения, Профиль
- expo-sqlite + Drizzle ORM — локальная БД, приложение полностью работает офлайн
- Zustand — состояние активной тренировки
- i18next + react-i18next + expo-localization — мультиязычность
- expo-keep-awake, expo-haptics, expo-notifications (локальные уведомления таймера отдыха)
- Jest — unit-тесты чистой логики
- Тёмная тема по умолчанию, минималистичный современный дизайн
- Бэкенда нет. Позже — Supabase (аккаунты + синхронизация)

## Главные правила
1. **Только библиотеки, работающие в Expo Go** (без кастомного нативного кода), пока явно не перейдём на development build. Устанавливать пакеты через `npx expo install <pkg>` — он подбирает совместимые версии.
2. **Никакого захардкоженного текста в UI.** Все строки — через `t('key')`. Каждый новый ключ добавляется сразу во ВСЕ три файла: `src/locales/kk.json`, `en.json`, `ru.json`.
3. **Вес в БД хранится только в кг.** Конвертация в фунты — только при отображении и вводе (через функции из `src/lib/units.ts`).
4. **Готовность к синхронизации:** все id — UUID (строки), у всех таблиц есть `created_at` и `updated_at` (ISO/epoch ms). Удаление — продумать soft delete (`deleted_at`) для будущей синхронизации.
5. **Логика отделена от UI:** работа с БД — в `src/db/repositories/*`, расчёты — чистые функции в `src/lib/*` с unit-тестами. Компоненты — небольшие.
6. Без лишних зависимостей.

## Мультиязычность
- Языки: казахский (`kk`, кириллица), английский (`en`), русский (`ru`).
- Первый запуск: язык из настроек телефона (expo-localization); если не kk/en/ru → `en`.
- Переключатель языка в Настройках: сохраняется в БД/настройках и применяется сразу, без перезапуска.
- Встроенные упражнения и группы мышц: в БД хранится ключ (`name_key`, напр. `exercise.bench_press`), текст — из переводов. Пользовательские упражнения — `custom_name` как есть.
- Множественные формы через i18next plurals (`_one`, `_few`, `_many`, `_other` — по правилам Intl.PluralRules для каждого языка).
- Даты и числа — через `Intl` с текущим языком.
- Казахские переводы — естественные, не дословные.

## Модель данных (все таблицы + `created_at`, `updated_at`)
- `exercises` (id, name_key?, custom_name?, muscle_group, equipment, is_custom)
- `routines` (id, name, notes)
- `routine_exercises` (id, routine_id, exercise_id, order, target_sets)
- `workouts` (id, name, started_at, finished_at?, routine_id?, notes)
- `workout_sets` (id, workout_id, exercise_id, set_index, weight_kg, reps, rpe?, is_completed)
- `settings` (key/value: язык, единицы kg/lb, таймер отдыха по умолчанию)

## Структура папок (целевая)
```
src/
  app/                  # expo-router routes (only screens/layouts here)
    _layout.tsx         # root: providers, DB init, i18n
    (tabs)/
      _layout.tsx       # tab navigator
      index.tsx (workout) | history.tsx | exercises.tsx | profile.tsx
  components/           # small reusable UI components
  features/             # feature-specific components/hooks (workout, history, ...)
  db/
    schema.ts           # Drizzle schema
    client.ts           # expo-sqlite + drizzle instance
    migrations/         # drizzle-kit generated migrations
    seed/               # built-in exercises (keys only)
    repositories/       # DB access functions, no UI
  store/                # Zustand stores
  lib/                  # pure functions (1RM, volume, PRs, units, parsing) + __tests__
  i18n/                 # i18next setup
  locales/              # kk.json, en.json, ru.json
  theme/                # colors, spacing, typography
```

## Чистая логика (покрыта Jest-тестами)
- `parseWeight("62,5") → 62.5` (точка и запятая)
- конвертация kg ↔ lb
- оценочный 1RM по Эпли: `w * (1 + reps / 30)` (для reps = 1 → w)
- объём тренировки/упражнения (Σ weight × reps выполненных подходов)
- определение личных рекордов (макс. вес, макс. 1RM, макс. объём)

## Чек-лист после каждого этапа
1. `npm run typecheck` — без ошибок.
2. `npm test` — все тесты зелёные (включая проверку файлов переводов).
3. `npx expo-doctor` — без проблем; при необходимости `npx expo export --platform ios` для проверки сборки бандла.
4. git-коммит с понятным сообщением.
5. Кратко объяснить, что сделано и почему, и как проверить на iPhone в Expo Go.
6. Ждать подтверждения пользователя.

## Этапы
1. Инициализация проекта, навигация (табы), i18n с переключением языка
2. База данных (Drizzle + миграции) и сиды (~60 упражнений)
3. Библиотека упражнений (поиск, фильтр, свои упражнения)
4. Активная тренировка
5. История
6. Шаблоны (рутины)
7. Прогресс и графики
8. Настройки и полировка

Текущий статус: этап 1 завершён (каркас, табы, i18n). Следующий — этап 2.
Открытые вопросы: финальное название приложения и bundle ID; казахские переводы — на ревью у пользователя.
