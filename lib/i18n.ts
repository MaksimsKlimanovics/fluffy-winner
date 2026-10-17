export type Lang = "lv" | "ru";

/** Bilingual text: every user-visible string in content has both languages. */
export type T = { lv: string; ru: string };

export const LANGS: { id: Lang; label: string }[] = [
  { id: "lv", label: "LV" },
  { id: "ru", label: "RU" },
];

export function tr(text: T, lang: Lang): string {
  return text[lang];
}

/** Interface strings. Content strings live next to the content in lib/curriculum.ts. */
export const UI = {
  appName: { lv: "Cipariņi", ru: "Ципариньи" },
  tagline: {
    lv: "Matemātika, kas strādā īstajā dzīvē",
    ru: "Математика, которая работает в настоящей жизни",
  },
  start: { lv: "Sākt", ru: "Начать" },
  next: { lv: "Tālāk", ru: "Дальше" },
  skip: { lv: "Izlaist", ru: "Пропустить" },
  chooseGrade: { lv: "Izvēlies savu klasi", ru: "Выбери свой класс" },
  grade: { lv: "klase", ru: "класс" },
  topics: { lv: "tēmas", ru: "темы" },
  back: { lv: "Atpakaļ", ru: "Назад" },
  why: { lv: "Kāpēc tas vajadzīgs?", ru: "Зачем это нужно?" },
  realCase: { lv: "Dzīves situācija", ru: "Случай из жизни" },
  howItWorks: { lv: "Kā tas strādā", ru: "Как это работает" },
  tryIt: { lv: "Izmēģini pats", ru: "Попробуй сам" },
  practice: { lv: "Treniņš", ru: "Тренировка" },
  check: { lv: "Pārbaudīt", ru: "Проверить" },
  newTask: { lv: "Jauns uzdevums", ru: "Новое задание" },
  hint: { lv: "Padoms", ru: "Подсказка" },
  showSolution: { lv: "Parādīt risinājumu", ru: "Показать решение" },
  correct: { lv: "Pareizi! Malacis!", ru: "Правильно! Молодец!" },
  wrong: { lv: "Vēl nav. Pamēģini vēlreiz!", ru: "Пока нет. Попробуй ещё раз!" },
  yourAnswer: { lv: "Tava atbilde", ru: "Твой ответ" },
  askAi: { lv: "Jautāt Cipariņam", ru: "Спросить Ципариньша" },
  askAiAbout: { lv: "Nesaprati? Jautā Cipariņam!", ru: "Не понял? Спроси Ципариньша!" },
  chatTitle: { lv: "Cipariņš — tavs AI palīgs", ru: "Ципариньш — твой AI-помощник" },
  chatPlaceholder: { lv: "Uzraksti savu jautājumu…", ru: "Напиши свой вопрос…" },
  send: { lv: "Sūtīt", ru: "Отправить" },
  chatHello: {
    lv: "Sveiks! Es esmu Cipariņš. Palīdzēšu saprast jebkuru matemātikas uzdevumu — nevis vienkārši pateikšu atbildi, bet kopā izdomāsim. Ko pētām?",
    ru: "Привет! Я Ципариньш. Помогу разобраться с любой задачей по математике — не просто скажу ответ, а мы вместе додумаемся. Что изучаем?",
  },
  chatError: {
    lv: "Hmm, savienojums pazuda. Pamēģini vēlreiz pēc brīža.",
    ru: "Хм, связь пропала. Попробуй ещё раз чуть позже.",
  },
  chatContext: { lv: "Tēma", ru: "Тема" },
  chatClear: { lv: "Sākt no jauna", ru: "Начать заново" },
  stars: { lv: "zvaigznes", ru: "звёзды" },
  streak: { lv: "pēc kārtas", ru: "подряд" },
  home: { lv: "Sākums", ru: "Главная" },
  chat: { lv: "AI čats", ru: "AI-чат" },
  suggestions: { lv: "Piemēram:", ru: "Например:" },
  aiDisclaimer: {
    lv: "Cipariņš ir mākslīgais intelekts un var kļūdīties. Pārbaudi svarīgas atbildes kopā ar skolotāju vai vecākiem.",
    ru: "Ципариньш — искусственный интеллект и может ошибаться. Проверяй важные ответы вместе с учителем или родителями.",
  },
  notFound: { lv: "Šāda lapa nav atrasta", ru: "Такая страница не найдена" },
  standardOriginal: {
    lv: "Citāts no pamatizglītības standarta.",
    ru: "Цитата из стандарта основного образования приводится на латышском, как в оригинале.",
  },
} satisfies Record<string, T>;
