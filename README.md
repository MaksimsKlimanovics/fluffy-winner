# Cipariņi — математика 1–9 класс с AI-помощником

Интерактивное веб-приложение для школьников Латвии (1–9 класс, по стандарту **Skola2030** — MK noteikumi Nr. 747, 6. pielikums):
математика и геометрия на реальных жизненных примерах, с объяснением *зачем это нужно*,
интерактивными моделями и AI-помощником **Cipariņš** на базе Claude.

Интерфейс и весь контент — на **латышском и русском** (переключатель LV/RU).

## Что внутри

| Раздел | Описание |
|---|---|
| **9 классов, 46 тем** | От «Сложение до 20» до «Тригонометрии» и «Объёма». Каждая тема привязана к результатам стандарта Skola2030. `lib/curriculum.ts` |
| **Каждая тема** | «Зачем это нужно?» → случай из жизни в Латвии → теория + формула → интерактивная модель → тренировка → вопросы к AI |
| **18 интерактивных моделей** | Числовая ось, монеты, часы, таблица умножения, площадь/периметр, пицца-дроби, транспортир, скидки %, окружность, весы-уравнения, треугольник, график y = kx + b, Пифагор, парабола, тригонометрия, столбчатая диаграмма, координатная плоскость. Модели учитывают этап стандарта (например, π — только с 7 класса). `components/widgets/` |
| **Бесконечные задачи** | 47 генераторов с историями из жизни (евро, рижский трамвай, Даугавпилсская зима, памятник Свободы…), подсказкой и пошаговым решением. Ответы принимаются с запятой (`3,5`). `lib/exercises.ts` |
| **AI-чат «Cipariņš»** | Claude в роли репетитора: не даёт готовый ответ, а ведёт вопросами; знает класс и тему, из которой открыт чат; отвечает на языке интерфейса. `app/api/chat/route.ts`, `lib/tutor.ts` |
| **Cipariņš внутри задачи** | Кнопка «Спросить Ципариньша» открывает чат прямо в карточке задачи. Помощник видит именно эту задачу, правильный ответ, эталонное решение, неверные попытки ребёнка и статус (решено / нет / решение открыто). Быстрые кнопки: «С чего начать?», «Объясни ход решения по шагам», «Где я ошибся?», «Почему так правильно?». `components/chat/ExerciseTutor.tsx` |
| **Прогресс** | Звёзды за решённые задачи хранятся в браузере (localStorage) |

Персонаж **Cipariņš** — оригинальный маленький робот-инженер «который живёт внутри вещей и знает,
как в них работает математика» (по духу как Фиксики, но собственный персонаж — без чужих
торговых марок).

## Atbilstība Skola2030 / Соответствие Skola2030

Pamatā ir saistošais dokuments — **MK 27.11.2018. noteikumi Nr. 747, 6. pielikums** “Sasniedzamie rezultāti matemātikas mācību jomā, beidzot 3., 6. un 9. klasi” ([likumi.lv](https://likumi.lv/ta/id/303768)).

- Standarts nosaka rezultātus **trim posmiem** (1.–3., 4.–6., 7.–9. klase), nevis katrai klasei. Katra tēma atsaucas uz sava posma rezultātu kodiem (`skola2030: ["3.2.4", …]` failā `lib/curriculum.ts`), un tēmas lapā tie redzami burtiski blokā “Skola2030”.
- `lib/skola2030.ts` — rezultātu citāti un sešas “lielās idejas”. `docs/skola2030/` — no PDF izvilktais pielikuma teksts, sadalīts pa posmu kolonnām (`scripts/skola2030-columns.py`).
- `tests/skola2030.test.ts` pārbauda, ka:
  - katrs citāts **burtiski** sakrīt ar sava posma kolonnu standartā;
  - katra tēma atsaucas tikai uz **savas klases posma** rezultātiem;
  - uzdevumi paliek posma skaitļu robežās (1. klasē līdz 20, 1.–3. klasē 0–1000, naturāli skaitļi);
  - π un riņķa laukums neparādās līdz 7. klasei (posma 9 rezultāts 6.4.1).
- Cipariņš saņem tēmas rezultātus, posma robežas un standartā nosauktās problēmrisināšanas stratēģijas (“mēģinu un pārbaudu”, “spriežu no beigām”, “pāreja uz vienkāršāku problēmu”) un skaidro pēc matemātiskās modelēšanas cikla (2.2).
- Tēmu sadalījums pa klasēm **posma iekšienē** ir mūsu (programmas parauga VISC PDF nebija pieejams). Ja ir programmas paraugs, sadalījumu var precizēt, nemainot atsauces uz standartu.

## Стек

- **Next.js 16** (App Router) + React 19 + TypeScript — все страницы тем статически генерируются
- **@anthropic-ai/sdk** — потоковые ответы Claude через серверный route `/api/chat`
- Без CSS-фреймворков: один `app/globals.css`, SVG-иллюстрации в коде

## Запуск локально

```bash
npm install
cp .env.example .env.local      # впишите ANTHROPIC_API_KEY
npm run dev                     # http://localhost:3000
npm test                        # тесты генераторов и валидации чата
```

Без ключа приложение полностью работает, кроме чата — он вежливо сообщит, что AI не включён.

## Деплой на Vercel

1. Импортируйте репозиторий в Vercel (**Add New → Project**). Framework определится как Next.js автоматически.
2. В **Settings → Environment Variables** добавьте:
   - `ANTHROPIC_API_KEY` — ключ из [console.anthropic.com](https://console.anthropic.com) (обязательно)
   - `CLAUDE_MODEL` — модель (необязательно, по умолчанию `claude-opus-5-5`)
3. **Deploy.** Ключ используется только на сервере и никогда не попадает в браузер.

### Настройки AI

- Модель по умолчанию — `claude-opus-5-5` с `effort: "low"` (быстрые короткие ответы репетитора).
  Для экономии можно задать `CLAUDE_MODEL=claude-haiku-5-5`.
- Включён серверный fallback (`fallbacks: "default"`): если фильтр безопасности модели отклонит
  безобидный запрос, Anthropic автоматически повторит его на резервной модели.
- Контекст задачи: браузер передаёт только `generator` + `seed` + попытки. Сервер сам заново
  генерирует задачу (генераторы детерминированы по seed) и подставляет условие, ответ и решение
  в системный промпт. Подменить ответ или условие с клиента нельзя. Пока задача не решена,
  Cipariņš ведёт по шагам, но последний шаг оставляет ребёнку. После решения объясняет всё до конца.
  Для разбора задачи используется `effort: "medium"`, для обычного чата — `"low"`.
- Защита: история обрезается до 24 сообщений по 2000 символов; контекст темы подставляется на
  сервере по id (клиент не может вписать свой текст в системный промпт); простой лимит
  12 запросов/мин на IP.
- ⚠️ Лимит в памяти работает в пределах одного serverless-инстанса. Для публичного запуска
  добавьте правило rate limit в **Vercel Firewall** и установите лимит расходов в
  Anthropic Console.

## Структура

```
app/
  page.tsx                       главная: онбординг + выбор класса
  klase/[grade]/page.tsx         список тем класса
  klase/[grade]/[topic]/page.tsx страница темы
  chat/page.tsx                  AI-чат (?grade=&topic=&q= для контекста)
  api/chat/route.ts              потоковый прокси к Claude
components/
  HomeView, GradeView, TopicView, ChatView, ExerciseCard
  Mascot.tsx                     персонаж Cipariņš (SVG)
  Scenes.tsx                     иллюстрации в стиле референсов
  widgets/                       16 интерактивных моделей
lib/
  curriculum.ts                  классы, темы, тексты LV/RU
  exercises.ts                   генераторы задач и проверка ответов
  tutor.ts                       системный промпт и валидация истории чата
  i18n.ts                        строки интерфейса LV/RU
tests/                           node:test (npm test)
```

## Как добавить тему

1. Добавьте генератор в `lib/exercises.ts` (вопрос/подсказка/решение на `lv` и `ru`).
2. Добавьте объект темы в нужный класс в `lib/curriculum.ts`, укажите `generator`, `skola2030` (коды результатов этапа этого класса) и при желании `widget`.
3. Если нужен новый результат стандарта — добавьте его дословно в `lib/skola2030.ts`.
4. `npm test` проверит генератор, переводы, дословность цитаты и что код относится к этапу класса.
