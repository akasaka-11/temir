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
- **В PowerShell пользователя запрещено выполнение скриптов** (`npm.ps1` блокируется) → во всех инструкциях писать `npm.cmd` / `npx.cmd` (напр. `npx.cmd expo start`), если пользователь не сменил ExecutionPolicy.
- Новое окно PowerShell открывается в `C:\WINDOWS\System32` → в инструкциях всегда начинать с `cd $HOME\Documents\strength-tracker`.
- Expo Go на iOS требует входа в один аккаунт Expo на ноутбуке и в Expo Go. Вход через браузер на этом ПК падает → использовать `npx.cmd expo login --no-browser`. Пользователь уже вошёл (проект успешно открылся на iPhone).
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
- **БД:** drizzle-orm 0.45 (stable) + expo-sqlite. Схема — `src/db/schema.ts`, клиент — `src/db/client.ts` (foreign_keys ON, WAL).
  - Изменил схему → `npm.cmd run db:generate -- --name <what_changed>` → коммитить сгенерированные файлы в `src/db/migrations/`. Руками миграции не править.
  - Миграции применяются при старте в `DatabaseProvider` (`useMigrations`), потом `seedDatabase`.
  - `.sql` импортируются строками: `babel-plugin-inline-import` (babel.config.js) + `sourceExts.push('sql')` (metro.config.js).
  - Встроенные упражнения: `src/db/seed/exercises.ts`, id детерминированные (UUID от ключа) — **никогда не менять id**. Изменил список → увеличить `EXERCISE_SEED_VERSION` и добавить переводы `exerciseNames.<key>` во все языки (тест это проверяет).
  - В `workout_sets` добавлено поле `exercise_position` (порядок упражнения в тренировке) — отклонение от исходной модели, согласовано в этапе 2.
  - UUID для новых строк — `newId()` из `src/lib/id.ts` (expo-crypto).
- **Typed routes**: типы маршрутов (`.expo/types/router.d.ts`) генерирует dev-сервер. После добавления нового экрана `tsc` ругается на `href`, пока типы не обновятся → `CI=1 timeout 60 npx.cmd expo start --port 8095` (через Bash, на отдельном порту, сам завершается).
- Живые данные из БД в UI — `useLiveQuery` (drizzle-orm/expo-sqlite); БД открыта с `enableChangeListener: true`.
- Поиск: `src/lib/search.ts` (без `\p{...}` в регулярках — осторожно с Hermes). Названия упражнений: `getExerciseName` + `t('exerciseNames', { returnObjects: true })`.
- **Активная тренировка** живёт в Zustand (`src/store/activeWorkout.ts`, persist в kv-store) и попадает в БД только при «Завершить» (`src/features/workout/finishWorkout.ts`, сохраняются только отмеченные подходы). Логика переходов — чистые функции `src/lib/activeWorkout.ts`.
  - Вес в полях ввода — текст в единицах тренировки (`workout.unit` фиксируется при старте); в кг переводится в `collectCompletedSets`.
  - Рекорды (`findPersonalRecords`): макс. вес, макс. 1ПМ (Эпли), макс. объём одного подхода; упражнения без истории не дают рекордов.
  - Таймер отдыха: `useRestTimer` + локальное уведомление (`restNotifications.ts`); в foreground уведомления скрыты (handler), вместо них — вибрация.
- Настройки (единицы, таймер отдыха) — `src/store/settings.ts` (UI появится на этапе 8).
- Длинные node-скрипты не передавать через `bash -c`/heredoc с эмодзи и кавычками — писать во временный .js файл.
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

Текущий статус: этап 4 завершён (активная тренировка), ждёт проверки на iPhone. Следующий — этап 5 (история). «Начать по шаблону» добавить на этапе 6.
Отложено пользователем: изображения упражнений (вариант — SVG-иконки групп мышц/пиктограммы, обсудить на этапе 8).
Открытые вопросы: финальное название приложения и bundle ID; казахские переводы — на ревью у пользователя.
