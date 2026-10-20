import type { T } from "./i18n";

/**
 * An exercise is generated fresh every time, so a child can practise a topic
 * endlessly. Every generator wraps the numbers in a small real-life story set
 * in Latvia, and ships its own hint and worked solution in both languages.
 */
export type Exercise = {
  question: T;
  hint: T;
  solution: T;
  unit?: T;
} & (
  | { kind: "number"; answer: number; tolerance?: number }
  | { kind: "choice"; answer: string; choices: string[] }
);

export type GeneratorId = keyof typeof generators;

// All randomness goes through `random` so an exercise can be rebuilt from its
// seed: the client shows it, and the tutor API regenerates the very same task
// (with its answer key) server-side instead of trusting text from the browser.
let random: () => number = Math.random;

/** mulberry32 — tiny, fast, good enough for picking numbers in word problems. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const pick = <X,>(items: readonly X[]): X => items[Math.floor(random() * items.length)];
const shuffle = <X,>(items: X[]): X[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const round = (x: number, digits = 2) => Math.round(x * 10 ** digits) / 10 ** digits;
/** Latvian and Russian both write decimals with a comma. */
const fmt = (x: number, digits = 2) => String(round(x, digits)).replace(".", ",");
const eur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

const NAMES_LV = ["Anna", "Jānis", "Elza", "Roberts", "Katrīna", "Mārtiņš", "Sofija", "Daniels"];
const NAMES_RU = ["Анна", "Янис", "Эльза", "Роберт", "Катрина", "Мартиньш", "София", "Даниэль"];
const person = () => {
  const i = rnd(0, NAMES_LV.length - 1);
  return { lv: NAMES_LV[i], ru: NAMES_RU[i] };
};

/** Noun after a number: Latvian takes the singular after 1, 21, 31… (not 11). */
const lvN = (n: number, one: string, many: string) => (n % 10 === 1 && n % 100 !== 11 ? one : many);
/** Russian: 1 треугольник, 2–4 треугольника, 5–20 треугольников. */
const ruN = (n: number, one: string, few: string, many: string) => {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return one;
  return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
};

const num = (answer: number, tolerance?: number) => ({ kind: "number" as const, answer, tolerance });
const choice = (answer: string, wrong: string[]) => ({
  kind: "choice" as const,
  answer,
  choices: shuffle([...new Set([answer, ...wrong])].slice(0, 4)),
});
const U = {
  eur: { lv: "€", ru: "€" },
  cm: { lv: "cm", ru: "см" },
  cm2: { lv: "cm²", ru: "см²" },
  m: { lv: "m", ru: "м" },
  m2: { lv: "m²", ru: "м²" },
  m3: { lv: "m³", ru: "м³" },
  km: { lv: "km", ru: "км" },
  deg: { lv: "°", ru: "°" },
  min: { lv: "min", ru: "мин" },
  pcs: { lv: "gab.", ru: "шт." },
  l: { lv: "l", ru: "л" },
  c: { lv: "°C", ru: "°C" },
  pct: { lv: "%", ru: "%" },
};

export const generators = {
  // ---------- 1. klase ----------
  add20: (): Exercise => {
    const a = rnd(2, 12);
    const b = rnd(1, 20 - a);
    const p = person();
    return {
      question: {
        lv: `${p.lv} savāca mežā ${a} čiekurus, bet tētis vēl ${b}. Cik čiekuru viņiem ir kopā?`,
        ru: `${p.ru} собрал(а) в лесу ${a} шишек, а папа ещё ${b}. Сколько всего шишек?`,
      },
      ...num(a + b),
      unit: U.pcs,
      hint: {
        lv: `Sāc no lielākā skaitļa un skaiti uz priekšu ${Math.min(a, b)} soļus.`,
        ru: `Начни с большего числа и отсчитай вперёд ${Math.min(a, b)} шагов.`,
      },
      solution: { lv: `${a} + ${b} = ${a + b}`, ru: `${a} + ${b} = ${a + b}` },
    };
  },
  sub20: (): Exercise => {
    const a = rnd(8, 20);
    const b = rnd(1, a - 1);
    return {
      question: {
        lv: `Uz šķīvja bija ${a} pankūkas. Ģimene apēda ${b}. Cik pankūku palika?`,
        ru: `На тарелке было ${a} блинов. Семья съела ${b}. Сколько блинов осталось?`,
      },
      ...num(a - b),
      unit: U.pcs,
      hint: {
        lv: `Atņemšana — tas ir “cik palika”. No ${a} ej atpakaļ ${b} soļus.`,
        ru: `Вычитание — это «сколько осталось». От ${a} шагни назад ${b} раз.`,
      },
      solution: { lv: `${a} − ${b} = ${a - b}`, ru: `${a} − ${b} = ${a - b}` },
    };
  },
  coins: (): Exercise => {
    // Grade 1 works with numbers up to 20 (standard 3.2.2: "20 apjomā").
    const picked: number[] = [];
    while (picked.length < 4) {
      const options = [1, 2, 5, 10].filter((c) => picked.reduce((s, x) => s + x, 0) + c <= 20);
      if (!options.length || (picked.length >= 2 && random() < 0.4)) break;
      picked.push(pick(options));
    }
    const sum = picked.reduce((s, c) => s + c, 0);
    const list = picked.join(" + ");
    return {
      question: {
        lv: `Krājkasītē ir monētas: ${picked.map((c) => `${c} c`).join(", ")}. Cik centu tur ir kopā?`,
        ru: `В копилке монеты: ${picked.map((c) => `${c} ц`).join(", ")}. Сколько всего центов?`,
      },
      ...num(sum),
      unit: { lv: "c", ru: "ц" },
      hint: {
        lv: "Sāc ar lielāko monētu un pieskaiti pārējās pa vienai.",
        ru: "Начни с самой крупной монеты и прибавляй остальные по одной.",
      },
      solution: { lv: `${list} = ${sum} c`, ru: `${list} = ${sum} ц` },
    };
  },
  shapes: (): Exercise => {
    const items = [
      { lv: ["trijstūris", "trijstūri"], ru: ["треугольник", "треугольника", "треугольников"], corners: 3 },
      { lv: ["kvadrāts", "kvadrāti"], ru: ["квадрат", "квадрата", "квадратов"], corners: 4 },
      { lv: ["taisnstūris", "taisnstūri"], ru: ["прямоугольник", "прямоугольника", "прямоугольников"], corners: 4 },
      { lv: ["piecstūris", "piecstūri"], ru: ["пятиугольник", "пятиугольника", "пятиугольников"], corners: 5 },
      { lv: ["sešstūris", "sešstūri"], ru: ["шестиугольник", "шестиугольника", "шестиугольников"], corners: 6 },
    ];
    const places = [
      { lv: "Uz zīmējuma ir", ru: "На рисунке" },
      { lv: "No nūjiņām uz galda saliktas figūras:", ru: "На столе из палочек сложены фигуры:" },
      { lv: "Uz rotaļu paklāja ir raksts:", ru: "На игровом коврике узор:" },
      { lv: "Uz loga ir pielīmētas papīra figūras:", ru: "На окне наклеены бумажные фигуры:" },
    ];
    const [A, B] = shuffle(items);
    // Grade 1: the total stays within 20 and is found by adding, not multiplying.
    const a = rnd(1, Math.floor((20 - B.corners) / A.corners));
    const b = rnd(1, Math.floor((20 - a * A.corners) / B.corners));
    const total = a * A.corners + b * B.corners;
    const name = (s: (typeof items)[number], n: number) => ({
      lv: `${n} ${lvN(n, s.lv[0], s.lv[1])}`,
      ru: `${n} ${ruN(n, s.ru[0], s.ru[1], s.ru[2])}`,
    });
    const [na, nb] = [name(A, a), name(B, b)];
    const place = pick(places);
    const sides = random() < 0.5;
    const sum = [...Array(a).fill(A.corners), ...Array(b).fill(B.corners)].join(" + ");
    return {
      question: {
        lv: `${place.lv} ${na.lv} un ${nb.lv}. Cik ${sides ? "malu" : "stūru"} ir visām figūrām kopā?`,
        ru: `${place.ru} ${na.ru} и ${nb.ru}. Сколько всего ${sides ? "сторон" : "углов"} у всех фигур?`,
      },
      ...num(total),
      hint: {
        lv: `Nosaukums pasaka priekšā: “${A.lv[0]}” — ${A.corners} stūri un ${A.corners} malas. Saskaiti katrai figūrai.`,
        ru: `Название подсказывает: «${A.ru[0]}» — ${A.corners} угла(ов) и столько же сторон. Сложи для каждой фигуры.`,
      },
      solution: { lv: `${sum} = ${total}`, ru: `${sum} = ${total}` },
    };
  },

  // ---------- 2. klase ----------
  add100: (): Exercise => {
    const a = rnd(11, 69);
    const b = rnd(5, 99 - a);
    return {
      question: {
        lv: `Rīgas tramvajā bija ${a} pasažieri. Pieturā iekāpa vēl ${b}. Cik pasažieru tagad ir tramvajā?`,
        ru: `В рижском трамвае было ${a} пассажиров. На остановке вошли ещё ${b}. Сколько пассажиров теперь?`,
      },
      ...num(a + b),
      hint: {
        lv: "Saskaiti atsevišķi desmitus un vieniniekus, tad apvieno.",
        ru: "Сложи отдельно десятки и единицы, потом объедини.",
      },
      solution: {
        lv: `${a} + ${b} = ${a + b}`,
        ru: `${a} + ${b} = ${a + b}`,
      },
    };
  },
  multSmall: (): Exercise => {
    const a = rnd(2, 5);
    const b = rnd(2, 10);
    const p = person();
    const question = pick([
      {
        lv: `Olu kastītē ir ${a} rindas pa ${b} olām. Cik olu ir kastītē?`,
        ru: `В коробке для яиц ${a} ${ruN(a, "ряд", "ряда", "рядов")} по ${b} ${ruN(b, "яйцу", "яйца", "яиц")}. Сколько всего яиц?`,
      },
      {
        lv: `${p.lv} nopirka ${a} zīmuļu kastītes, katrā ${b} zīmuļi. Cik zīmuļu ir kopā?`,
        ru: `${p.ru} купил(а) ${a} ${ruN(a, "коробку", "коробки", "коробок")} карандашей, в каждой по ${b}. Сколько всего карандашей?`,
      },
      {
        lv: `Uz palodzes ir ${a} puķu podi, katrā podā zied ${b} ziedi. Cik ziedu ir kopā?`,
        ru: `На подоконнике ${a} ${ruN(a, "горшок", "горшка", "горшков")}, в каждом цветёт по ${b} ${ruN(b, "цветку", "цветка", "цветков")}. Сколько всего цветков?`,
      },
      {
        lv: `Ekskursijā bērni brauc tramvajā: ${a} vagonos sēž pa ${b} bērniem. Cik bērnu brauc?`,
        ru: `На экскурсии дети едут в трамвае: в ${a} вагонах сидят по ${b} детей. Сколько детей едет?`,
      },
    ]);
    return {
      question,
      ...num(a * b),
      unit: U.pcs,
      hint: {
        lv: `Reizināšana ir ātrā saskaitīšana: ${Array(a).fill(b).join(" + ")}.`,
        ru: `Умножение — это быстрое сложение: ${Array(a).fill(b).join(" + ")}.`,
      },
      solution: { lv: `${a} · ${b} = ${a * b}`, ru: `${a} · ${b} = ${a * b}` },
    };
  },
  clock: (): Exercise => {
    const h = rnd(1, 11);
    const m = pick([0, 15, 30, 45]);
    const add = pick([15, 30, 45, 60]);
    const total = h * 60 + m + add;
    const show = (mins: number) => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
    const answer = show(total);
    return {
      question: {
        lv: `Futbola treniņš sākas ${show(h * 60 + m)} un ilgst ${add} minūtes. Cikos tas beigsies?`,
        ru: `Тренировка по футболу начинается в ${show(h * 60 + m)} и длится ${add} минут. Во сколько она закончится?`,
      },
      ...choice(answer, [show(total + 15), show(total - 15), show(total + 60), show(total - 30)]),
      hint: {
        lv: "Stundā ir 60 minūtes. 15 min — ceturtdaļa stundas, 30 min — pusstunda.",
        ru: "В часе 60 минут. 15 мин — четверть часа, 30 мин — полчаса.",
      },
      solution: {
        lv: `${show(h * 60 + m)} + ${add} min = ${answer}`,
        ru: `${show(h * 60 + m)} + ${add} мин = ${answer}`,
      },
    };
  },
  change: (): Exercise => {
    const price = rnd(3, 39) * 5;
    const paid = price < 100 ? 100 : 200;
    const item = pick([
      { lv: "Saldējums jūrmalā", ru: "Мороженое на взморье" },
      { lv: "Bulciņa skolas kafejnīcā", ru: "Булочка в школьном кафе" },
      { lv: "Burtnīca", ru: "Тетрадь" },
      { lv: "Sulas paciņa", ru: "Пакетик сока" },
      { lv: "Tramvaja biļete bērnam", ru: "Детский билет на трамвай" },
    ]);
    return {
      question: {
        lv: `${item.lv} maksā ${eur(price)}. Tu dod ${eur(paid)}. Cik centu tev atdos atpakaļ?`,
        ru: `${item.ru} стоит ${eur(price)}. Ты даёшь ${eur(paid)}. Сколько центов тебе вернут?`,
      },
      ...num(paid - price),
      unit: { lv: "c", ru: "ц" },
      hint: {
        lv: "1 € = 100 centi. Atņem cenu no samaksātās summas.",
        ru: "1 € = 100 центов. Вычти цену из того, что заплатил.",
      },
      solution: { lv: `${paid} c − ${price} c = ${paid - price} c`, ru: `${paid} ц − ${price} ц = ${paid - price} ц` },
    };
  },

  // ---------- 3. klase ----------
  multTable: (): Exercise => {
    const a = rnd(2, 9);
    const b = rnd(2, 9);
    const question = pick([
      {
        lv: `Klasē ir ${a} galdu rindas, katrā rindā ${b} skolēni. Cik skolēnu ir klasē?`,
        ru: `В классе ${a} ${ruN(a, "ряд", "ряда", "рядов")} парт, в каждом ряду ${b} учеников. Сколько всего учеников?`,
      },
      {
        lv: `Šokolādes tāfelītē ir ${a} rindas pa ${b} gabaliņiem. Cik gabaliņu ir tāfelītē?`,
        ru: `В плитке шоколада ${a} ${ruN(a, "ряд", "ряда", "рядов")} по ${b} ${ruN(b, "дольке", "дольки", "долек")}. Сколько всего долек?`,
      },
      {
        lv: `Kino zālē ir ${a} rindas, katrā ${b} krēsli. Cik biļešu var pārdot vienam seansam?`,
        ru: `В зале кинотеатра ${a} ${ruN(a, "ряд", "ряда", "рядов")}, в каждом по ${b} ${ruN(b, "креслу", "кресла", "кресел")}. Сколько билетов можно продать на один сеанс?`,
      },
    ]);
    return {
      question,
      ...num(a * b),
      hint: {
        lv: `Ja neatceries ${a} · ${b}, atceries ${a} · ${b - 1} = ${a * (b - 1)} un pieskaiti vēl ${a}.`,
        ru: `Если не помнишь ${a} · ${b}, вспомни ${a} · ${b - 1} = ${a * (b - 1)} и прибавь ещё ${a}.`,
      },
      solution: { lv: `${a} · ${b} = ${a * b}`, ru: `${a} · ${b} = ${a * b}` },
    };
  },
  divTable: (): Exercise => {
    const b = rnd(2, 9);
    const q = rnd(2, 9);
    const question = pick([
      {
        lv: `${b * q} konfektes jāsadala vienādi ${b} draugiem. Cik konfekšu saņems katrs?`,
        ru: `${b * q} конфет нужно поровну разделить между ${b} друзьями. Сколько получит каждый?`,
      },
      {
        lv: `Sporta stundā ${b * q} skolēni sadalās ${b} vienādās komandās. Cik skolēnu būs katrā komandā?`,
        ru: `На физкультуре ${b * q} учеников делятся на ${b} равных команд. Сколько учеников будет в каждой команде?`,
      },
      {
        lv: `Jāiepako ${b * q} cepumi, kastītē ietilpst ${b}. Cik kastīšu vajag?`,
        ru: `Нужно упаковать ${b * q} печений, в коробку помещается ${b}. Сколько коробок нужно?`,
      },
    ]);
    return {
      question,
      ...num(q),
      unit: U.pcs,
      hint: {
        lv: `Dalīšana ir pretēja reizināšanai: ${b} · ? = ${b * q}.`,
        ru: `Деление — обратное умножению: ${b} · ? = ${b * q}.`,
      },
      solution: { lv: `${b * q} : ${b} = ${q}`, ru: `${b * q} : ${b} = ${q}` },
    };
  },
  perimeter: (): Exercise => {
    const a = rnd(3, 15);
    const b = rnd(2, 12);
    return {
      question: {
        lv: `Dārza dobe ir taisnstūris ${a} m × ${b} m. Cik metru žoga vajag, lai to apjoztu?`,
        ru: `Грядка — прямоугольник ${a} м × ${b} м. Сколько метров забора нужно, чтобы её огородить?`,
      },
      ...num(2 * (a + b)),
      unit: U.m,
      hint: {
        lv: "Perimetrs ir visu malu garumu summa. Taisnstūrim ir 2 garās un 2 īsās malas.",
        ru: "Периметр — сумма длин всех сторон. У прямоугольника 2 длинные и 2 короткие стороны.",
      },
      solution: {
        lv: `P = 2 · (${a} + ${b}) = ${2 * (a + b)} m`,
        ru: `P = 2 · (${a} + ${b}) = ${2 * (a + b)} м`,
      },
    };
  },
  add1000: (): Exercise => {
    const a = rnd(120, 600);
    const b = rnd(50, 999 - a);
    return {
      question: {
        lv: `No Rīgas līdz Liepājai ir ~${a} km pa ceļu un atpakaļ vēl ${b} km ar līkumu caur Kuldīgu. Cik km kopā?`,
        ru: `От Риги до Лиепаи по дороге ~${a} км, а обратно ещё ${b} км с заездом в Кулдигу. Сколько всего км?`,
      },
      ...num(a + b),
      unit: U.km,
      hint: {
        lv: "Saskaiti simtus, desmitus un vieniniekus atsevišķi.",
        ru: "Сложи сотни, десятки и единицы по отдельности.",
      },
      solution: { lv: `${a} + ${b} = ${a + b}`, ru: `${a} + ${b} = ${a + b}` },
    };
  },

  // ---------- 4. klase ----------
  fractionOf: (): Exercise => {
    const d = pick([2, 3, 4, 5, 10]);
    const whole = d * rnd(2, 10);
    const p = person();
    const story = pick([
      {
        lv: `Klasē ir ${whole} skolēni. 1/${d} no viņiem brauc uz skolu ar velosipēdu. Cik skolēnu brauc ar velosipēdu?`,
        ru: `В классе ${whole} учеников. 1/${d} из них ездит в школу на велосипеде. Сколько учеников ездит на велосипеде?`,
        unit: undefined,
      },
      {
        lv: `Grāmatā ir ${whole} lappuses. ${p.lv} šodien izlasīja 1/${d} no grāmatas. Cik lappušu izlasīja?`,
        ru: `В книге ${whole} страниц. ${p.ru} сегодня прочитал(а) 1/${d} книги. Сколько страниц прочитано?`,
        unit: U.pcs,
      },
      {
        lv: `${p.lv} sakrāja ${whole} €. 1/${d} no naudas viņš iztērēja dāvanai mammai. Cik eiro maksāja dāvana?`,
        ru: `${p.ru} накопил(а) ${whole} €. 1/${d} денег потрачено на подарок маме. Сколько евро стоил подарок?`,
        unit: U.eur,
      },
    ]);
    return {
      question: { lv: story.lv, ru: story.ru },
      ...num(whole / d),
      unit: story.unit,
      hint: {
        lv: `1/${d} nozīmē “sadalīt ${d} vienādās daļās un paņemt vienu”.`,
        ru: `1/${d} значит «разделить на ${d} равных частей и взять одну».`,
      },
      solution: { lv: `${whole} : ${d} = ${whole / d}`, ru: `${whole} : ${d} = ${whole / d}` },
    };
  },
  areaRect: (): Exercise => {
    const a = rnd(3, 9);
    const b = rnd(2, 7);
    const price = pick([8, 10, 12, 15]);
    return {
      question: {
        lv: `Istabas grīda ir ${a} m × ${b} m. Lamināts maksā ${price} € par m². Cik maksās lamināts visai grīdai?`,
        ru: `Пол комнаты ${a} м × ${b} м. Ламинат стоит ${price} € за м². Сколько стоит ламинат на весь пол?`,
      },
      ...num(a * b * price),
      unit: U.eur,
      hint: {
        lv: "Vispirms aprēķini laukumu: garums · platums. Tad reizini ar cenu.",
        ru: "Сначала найди площадь: длина · ширина. Потом умножь на цену.",
      },
      solution: {
        lv: `S = ${a} · ${b} = ${a * b} m²; ${a * b} · ${price} = ${a * b * price} €`,
        ru: `S = ${a} · ${b} = ${a * b} м²; ${a * b} · ${price} = ${a * b * price} €`,
      },
    };
  },
  longMult: (): Exercise => {
    const a = rnd(12, 99);
    const b = rnd(3, 9);
    return {
      question: {
        lv: `Skolas ekskursijai pasūtīja ${b} autobusus, katrā ${a} vietas. Cik vietu ir kopā?`,
        ru: `Для школьной экскурсии заказали ${b} автобусов по ${a} мест. Сколько всего мест?`,
      },
      ...num(a * b),
      hint: {
        lv: `Sadali: ${a} = ${Math.floor(a / 10) * 10} + ${a % 10}. Reizini katru daļu ar ${b}.`,
        ru: `Разложи: ${a} = ${Math.floor(a / 10) * 10} + ${a % 10}. Умножь каждую часть на ${b}.`,
      },
      solution: {
        lv: `${Math.floor(a / 10) * 10} · ${b} + ${a % 10} · ${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${a * b}`,
        ru: `${Math.floor(a / 10) * 10} · ${b} + ${a % 10} · ${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${a * b}`,
      },
    };
  },

  // ---------- 5. klase ----------
  decimals: (): Exercise => {
    const a = rnd(50, 500) / 100;
    const b = rnd(50, 500) / 100;
    return {
      question: {
        lv: `Veikalā nopirki maizi par ${eur(a * 100)} un pienu par ${eur(b * 100)}. Cik samaksāji kopā?`,
        ru: `В магазине ты купил хлеб за ${eur(a * 100)} и молоко за ${eur(b * 100)}. Сколько заплатил всего?`,
      },
      ...num(round(a + b), 0.001),
      unit: U.eur,
      hint: {
        lv: "Raksti skaitļus vienu zem otra tā, lai komati būtu vienā kolonnā.",
        ru: "Запиши числа друг под другом так, чтобы запятые были в одном столбце.",
      },
      solution: {
        lv: `${eur(a * 100)} + ${eur(b * 100)} = ${eur(Math.round((a + b) * 100))}`,
        ru: `${eur(a * 100)} + ${eur(b * 100)} = ${eur(Math.round((a + b) * 100))}`,
      },
    };
  },
  fractionAdd: (): Exercise => {
    const d = pick([4, 5, 6, 8, 10, 12]);
    const a = rnd(1, d - 2);
    const b = rnd(1, d - a - 1);
    return {
      question: {
        lv: `Pica sagriezta ${d} vienādos gabalos. Tu apēdi ${a}/${d}, brālis ${b}/${d}. Cik ${d}-daļas jūs apēdāt kopā? (Ieraksti skaitītāju)`,
        ru: `Пицца разрезана на ${d} равных кусков. Ты съел ${a}/${d}, брат — ${b}/${d}. Сколько ${d}-х долей вы съели вместе? (Впиши числитель)`,
      },
      ...num(a + b),
      hint: {
        lv: "Ja saucēji ir vienādi, saskaita tikai skaitītājus.",
        ru: "Если знаменатели одинаковые, складывают только числители.",
      },
      solution: { lv: `${a}/${d} + ${b}/${d} = ${a + b}/${d}`, ru: `${a}/${d} + ${b}/${d} = ${a + b}/${d}` },
    };
  },
  angles: (): Exercise => {
    const type = pick(["straight", "right"] as const);
    const total = type === "straight" ? 180 : 90;
    const a = rnd(15, total - 15);
    return {
      question:
        type === "straight"
          ? {
              lv: `Atvērta grāmata veido izstieptu leņķi (180°). Viena lapa ir pacelta ${a}° leņķī pret galdu. Cik grādu ir leņķis starp lapu un otru grāmatas pusi?`,
              ru: `Раскрытая книга образует развёрнутый угол (180°). Одна страница поднята под углом ${a}° к столу. Сколько градусов между страницей и другой половиной книги?`,
            }
          : {
              lv: `Kāpnes pret sienu un grīdu veido taisnleņķa stūri (90°). Kāpņu leņķis pret grīdu ir ${a}°. Cik grādu ir leņķis pret sienu?`,
              ru: `Стена и пол образуют прямой угол (90°). Лестница стоит под углом ${a}° к полу. Сколько градусов угол между лестницей и стеной?`,
            },
      ...num(total - a),
      unit: U.deg,
      hint: {
        lv: `Abi leņķi kopā veido ${total}°.`,
        ru: `Оба угла вместе составляют ${total}°.`,
      },
      solution: { lv: `${total}° − ${a}° = ${total - a}°`, ru: `${total}° − ${a}° = ${total - a}°` },
    };
  },

  // ---------- 6. klase ----------
  percentOf: (): Exercise => {
    const p = pick([10, 20, 25, 30, 40, 50, 75]);
    const price = pick([20, 40, 60, 80, 100, 120, 150, 200]);
    const item = pick([
      { lv: ["Kedas maksā", "kedas"], ru: ["Кеды стоят", "кеды"] },
      { lv: ["Ziemas jaka maksā", "jaka"], ru: ["Зимняя куртка стоит", "куртка"] },
      { lv: ["Skrituļslidas maksā", "skrituļslidas"], ru: ["Роликовые коньки стоят", "коньки"] },
    ]);
    return {
      question: {
        lv: `${item.lv[0]} ${price} €. Izpārdošanā atlaide ir ${p}%. Cik maksās ${item.lv[1]} ar atlaidi?`,
        ru: `${item.ru[0]} ${price} €. На распродаже скидка ${p}%. Сколько будут стоить ${item.ru[1]} со скидкой?`,
      },
      ...num(round(price * (1 - p / 100)), 0.01),
      unit: U.eur,
      hint: {
        lv: `1% ir simtā daļa. ${p}% no ${price} = ${price} · ${p} : 100. Tad atņem no cenas.`,
        ru: `1% — сотая часть. ${p}% от ${price} = ${price} · ${p} : 100. Потом вычти из цены.`,
      },
      solution: {
        lv: `Atlaide: ${price} · ${p}% = ${fmt((price * p) / 100)} €. Cena: ${price} − ${fmt((price * p) / 100)} = ${fmt(price * (1 - p / 100))} €`,
        ru: `Скидка: ${price} · ${p}% = ${fmt((price * p) / 100)} €. Цена: ${price} − ${fmt((price * p) / 100)} = ${fmt(price * (1 - p / 100))} €`,
      },
    };
  },
  proportion: (): Exercise => {
    const people = pick([2, 3, 4]);
    const want = people * rnd(2, 5);
    const g = { lv: "g", ru: "г" };
    const ml = { lv: "ml", ru: "мл" };
    const [dish, what, flour, unit] = pick([
      [{ lv: "Pankūku", ru: "блинов" }, { lv: "miltu", ru: "муки" }, pick([150, 200, 250, 300]), g],
      [{ lv: "Pankūku", ru: "блинов" }, { lv: "piena", ru: "молока" }, pick([200, 300, 400, 500]), ml],
      [{ lv: "Biezpiena sacepuma", ru: "творожной запеканки" }, { lv: "cukura", ru: "сахара" }, pick([50, 75, 100, 150]), g],
      [{ lv: "Kakao", ru: "какао" }, { lv: "piena", ru: "молока" }, pick([250, 300, 400, 600]), ml],
    ] as const);
    return {
      question: {
        lv: `${dish.lv} receptē ${people} cilvēkiem vajag ${flour} ${unit.lv} ${what.lv}. Cik ${unit.lv} ${what.lv} vajag ${want} cilvēkiem?`,
        ru: `В рецепте ${dish.ru} на ${people} человек нужно ${flour} ${unit.ru} ${what.ru}. Сколько ${unit.ru} ${what.ru} нужно на ${want} человек?`,
      },
      ...num((flour / people) * want),
      unit,
      hint: {
        lv: `Cik reizes vairāk cilvēku? ${want} : ${people}. Tikpat reizes vairāk ${what.lv}.`,
        ru: `Во сколько раз больше людей? ${want} : ${people}. Во столько же раз больше ${what.ru}.`,
      },
      solution: {
        lv: `${want} : ${people} = ${want / people}; ${flour} · ${want / people} = ${(flour / people) * want} ${unit.lv}`,
        ru: `${want} : ${people} = ${want / people}; ${flour} · ${want / people} = ${(flour / people) * want} ${unit.ru}`,
      },
    };
  },
  negatives: (): Exercise => {
    const start = rnd(-12, 3);
    const change = rnd(-10, 12);
    const end = start + change;
    const sign = (x: number) => (x > 0 ? `+${x}` : String(x).replace("-", "−"));
    return {
      question: {
        lv: `Janvāra rītā Daugavpilī bija ${sign(start)} °C. Līdz pusdienlaikam temperatūra mainījās par ${sign(change)} °C. Kāda temperatūra bija pusdienlaikā?`,
        ru: `Январским утром в Даугавпилсе было ${sign(start)} °C. К обеду температура изменилась на ${sign(change)} °C. Какая температура была в обед?`,
      },
      ...num(end),
      unit: U.c,
      hint: {
        lv: "Iedomājies termometru kā skaitļu asi: “+” ir uz augšu, “−” uz leju.",
        ru: "Представь термометр как числовую ось: «+» — вверх, «−» — вниз.",
      },
      solution: {
        lv: `${sign(start)} + (${sign(change)}) = ${sign(end)} °C`,
        ru: `${sign(start)} + (${sign(change)}) = ${sign(end)} °C`,
      },
    };
  },
  circle: (): Exercise => {
    const kind = pick(["wheel", "wheel", "bed", "pizza", "ferris", "clock"] as const);
    if (kind === "bed" || kind === "ferris" || kind === "clock") {
      // Circumference C = π · d, worked with π ≈ 3,14 as the question says.
      const d = kind === "bed" ? rnd(1, 20) : kind === "ferris" ? rnd(3, 12) * 5 : rnd(5, 20) * 2;
      const c = round(3.14 * d, 2);
      const unit = kind === "clock" ? U.cm : U.m;
      const q =
        kind === "bed"
          ? {
              lv: `Apaļas puķu dobes diametrs ir ${d} m. Cik metru apmales vajag apkārt dobei? (π ≈ 3,14)`,
              ru: `Диаметр круглой клумбы ${d} м. Сколько метров бордюра нужно вокруг клумбы? (π ≈ 3,14)`,
            }
          : kind === "ferris"
            ? {
                lv: `Panorāmas rata diametrs ir ${d} m. Cik metrus kabīne nobrauc vienā apgriezienā? (π ≈ 3,14)`,
                ru: `Диаметр колеса обозрения ${d} м. Сколько метров проезжает кабинка за один оборот? (π ≈ 3,14)`,
              }
            : {
                lv: `Sienas pulksteņa minūšu rādītājs ir ${d / 2} cm garš. Cik centimetrus tā gals noiet vienā stundā? (π ≈ 3,14)`,
                ru: `Минутная стрелка настенных часов длиной ${d / 2} см. Сколько сантиметров проходит её конец за час? (π ≈ 3,14)`,
              };
      return {
        question: q,
        ...num(c, Math.max(0.1, round(c * 0.005, 2))),
        unit,
        hint: {
          lv: kind === "clock" ? "Stundā gals apiet pilnu apli: C = 2 · π · r." : "Riņķa līnijas garums C = π · d.",
          ru: kind === "clock" ? "За час конец стрелки проходит полный круг: C = 2 · π · r." : "Длина окружности C = π · d.",
        },
        solution: (() => {
          const model = kind === "clock" ? `2 · 3,14 · ${d / 2}` : `3,14 · ${d}`;
          return { lv: `C = ${model} = ${fmt(c)} ${unit.lv}`, ru: `C = ${model} = ${fmt(c)} ${unit.ru}` };
        })(),
      };
    }
    if (kind === "pizza") {
      const d = pick([24, 26, 28, 30, 32, 34, 36, 40, 45, 50]);
      const r = d / 2;
      const s = Math.round(3.14 * r * r);
      return {
        question: {
          lv: `Picas diametrs ir ${d} cm. Cik kvadrātcentimetru ir picai? (π ≈ 3,14, noapaļo līdz veseliem cm²)`,
          ru: `Диаметр пиццы ${d} см. Какова её площадь в квадратных сантиметрах? (π ≈ 3,14, округли до целых см²)`,
        },
        ...num(s, Math.max(1, Math.round(s * 0.01))),
        unit: U.cm2,
        hint: {
          lv: "Riņķa laukums S = π · r², un rādiuss ir puse no diametra.",
          ru: "Площадь круга S = π · r², а радиус — половина диаметра.",
        },
        solution: {
          lv: `r = ${d} : 2 = ${fmt(r)} cm; S = 3,14 · ${fmt(r)}² ≈ ${s} cm²`,
          ru: `r = ${d} : 2 = ${fmt(r)} см; S = 3,14 · ${fmt(r)}² ≈ ${s} см²`,
        },
      };
    }
    const d = pick([40, 50, 56, 60, 66, 70]);
    const turns = pick([10, 20, 25, 50, 100, 200, 250, 500, 1000]);
    const meters = round((Math.PI * d * turns) / 100, 1);
    return {
      question: {
        lv: `Velosipēda riteņa diametrs ir ${d} cm. Cik metrus tu nobrauksi, ja ritenis apgriezīsies ${turns} reizes? (π ≈ 3,14, noapaļo līdz veseliem metriem)`,
        ru: `Диаметр колеса велосипеда ${d} см. Сколько метров ты проедешь, если колесо сделает ${turns} оборотов? (π ≈ 3,14, округли до целых метров)`,
      },
      ...num(Math.round(meters), Math.max(1, Math.round(meters * 0.01))),
      unit: U.m,
      hint: {
        lv: "Viens apgrieziens = riņķa līnijas garums C = π · d. Neaizmirsti pārvērst cm metros.",
        ru: "Один оборот = длина окружности C = π · d. Не забудь перевести см в метры.",
      },
      solution: {
        lv: `C = 3,14 · ${d} ≈ ${fmt(Math.PI * d, 1)} cm; · ${turns} ≈ ${fmt(meters, 1)} m`,
        ru: `C = 3,14 · ${d} ≈ ${fmt(Math.PI * d, 1)} см; · ${turns} ≈ ${fmt(meters, 1)} м`,
      },
    };
  },

  // ---------- 7. klase ----------
  linearEq: (): Exercise => {
    const price = rnd(2, 9);
    const x = rnd(2, 12);
    const fee = rnd(1, 15);
    const total = price * x + fee;
    return {
      question: {
        lv: `Batuta parkā ieeja maksā ${fee} €, plus ${price} € par katru stundu. Tu samaksāji ${total} €. Cik stundas tu lēkāji? (${price}x + ${fee} = ${total})`,
        ru: `В батутном парке вход стоит ${fee} €, плюс ${price} € за каждый час. Ты заплатил ${total} €. Сколько часов ты прыгал? (${price}x + ${fee} = ${total})`,
      },
      ...num(x),
      hint: {
        lv: `Vispirms “noņem” ieejas maksu no abām pusēm, tad dali ar ${price}.`,
        ru: `Сначала «убери» плату за вход с обеих сторон, потом раздели на ${price}.`,
      },
      solution: {
        lv: `${price}x = ${total} − ${fee} = ${total - fee}; x = ${total - fee} : ${price} = ${x}`,
        ru: `${price}x = ${total} − ${fee} = ${total - fee}; x = ${total - fee} : ${price} = ${x}`,
      },
    };
  },
  powers: (): Exercise => {
    const kind = pick(["message", "bacteria", "ten", "cube", "tiles", "paper", "rule", "rule"] as const);
    if (kind === "rule") {
      // Multiplying powers with the same base: aᵐ · aⁿ = aᵐ⁺ⁿ.
      const b = pick([2, 3, 5, 7, 10]);
      const m = rnd(2, 7);
      const n = rnd(2, 7);
      return {
        question: {
          lv: `Kalkulators nespēj parādīt tik lielu skaitli, tāpēc raksti pakāpē: ${b}^${m} · ${b}^${n} = ${b}^?. Ieraksti kāpinātāju.`,
          ru: `Калькулятор не может показать такое большое число, поэтому запиши степенью: ${b}^${m} · ${b}^${n} = ${b}^?. Впиши показатель.`,
        },
        ...num(m + n),
        hint: {
          lv: `${b}^${m} ir ${m} reizinātāji ${b}, un ${b}^${n} — vēl ${n}. Cik reizinātāju kopā?`,
          ru: `${b}^${m} — это ${m} множителей ${b}, а ${b}^${n} — ещё ${n}. Сколько множителей всего?`,
        },
        solution: { lv: `${b}^${m} · ${b}^${n} = ${b}^(${m} + ${n}) = ${b}^${m + n}`, ru: `${b}^${m} · ${b}^${n} = ${b}^(${m} + ${n}) = ${b}^${m + n}` },
      };
    }
    const [base, exp] =
      kind === "message" ? [2, rnd(2, 10)]
      : kind === "bacteria" ? [3, rnd(2, 6)]
      : kind === "ten" ? [10, rnd(2, 9)]
      : kind === "cube" ? [rnd(2, 10), 3]
      : kind === "tiles" ? [rnd(11, 25), 2]
      : [2, rnd(2, 8)];
    const story = {
      message: {
        lv: `Ziņa tiek pārsūtīta: katrs to nosūta 2 draugiem. Cik cilvēku saņems ziņu ${exp}. kārtā? (2^${exp})`,
        ru: `Сообщение пересылают: каждый отправляет его 2 друзьям. Сколько человек получат его на ${exp}-м шаге? (2^${exp})`,
      },
      bacteria: {
        lv: `Baktērija ik stundu sadalās 3 daļās. Cik baktēriju būs pēc ${exp} stundām? (3^${exp})`,
        ru: `Бактерия каждый час делится на 3. Сколько бактерий будет через ${exp} часов? (3^${exp})`,
      },
      ten: {
        lv: `Cik ir 10^${exp}? (Tik daudz nulles kā kāpinātājs!)`,
        ru: `Сколько будет 10^${exp}? (Столько нулей, сколько показатель!)`,
      },
      cube: {
        lv: `Kuba formas kastes mala ir ${base} dm. Cik 1 dm³ kubiņu tajā ietilpst? (${base}^3)`,
        ru: `Ребро коробки в форме куба ${base} дм. Сколько кубиков по 1 дм³ в неё поместится? (${base}^3)`,
      },
      tiles: {
        lv: `Kvadrātveida laukumā flīzes ieklātas ${base} rindās pa ${base} flīzēm. Cik flīžu ir laukumā? (${base}^2)`,
        ru: `На квадратной площадке плитка уложена в ${base} рядов по ${base} плиток. Сколько всего плиток? (${base}^2)`,
      },
      paper: {
        lv: `Papīra lapu pārloka uz pusēm ${exp} reizes. Cik kārtās papīrs ir salocīts? (2^${exp})`,
        ru: `Лист бумаги складывают пополам ${exp} раз. Сколько слоёв бумаги получится? (2^${exp})`,
      },
    }[kind];
    return {
      question: story,
      ...num(base ** exp),
      hint: {
        lv: `${base}^${exp} nozīmē ${Array(exp).fill(base).join(" · ")}.`,
        ru: `${base}^${exp} означает ${Array(exp).fill(base).join(" · ")}.`,
      },
      solution: {
        lv: `${Array(exp).fill(base).join(" · ")} = ${base ** exp}`,
        ru: `${Array(exp).fill(base).join(" · ")} = ${base ** exp}`,
      },
    };
  },
  triangleAngles: (): Exercise => {
    const a = rnd(25, 100);
    const b = rnd(20, 160 - a);
    return {
      question: {
        lv: `Jumta šķērsgriezums ir trijstūris. Divi tā leņķi ir ${a}° un ${b}°. Cik grādu ir jumta korē (trešais leņķis)?`,
        ru: `Сечение крыши — треугольник. Два его угла ${a}° и ${b}°. Сколько градусов у конька крыши (третий угол)?`,
      },
      ...num(180 - a - b),
      unit: U.deg,
      hint: {
        lv: "Jebkura trijstūra leņķu summa ir 180°.",
        ru: "Сумма углов любого треугольника равна 180°.",
      },
      solution: { lv: `180° − ${a}° − ${b}° = ${180 - a - b}°`, ru: `180° − ${a}° − ${b}° = ${180 - a - b}°` },
    };
  },
  mean: (): Exercise => {
    const n = rnd(4, 5);
    const target = rnd(5, 9);
    const marks = Array.from({ length: n }, () => Math.max(1, Math.min(10, target + rnd(-2, 2))));
    const fix = target * n - marks.reduce((s, m) => s + m, 0);
    marks[0] = Math.max(1, Math.min(10, marks[0] + fix));
    const avg = round(marks.reduce((s, m) => s + m, 0) / n, 1);
    return {
      question: {
        lv: `Tavas atzīmes matemātikā: ${marks.join(", ")}. Kāda ir vidējā atzīme? (noapaļo līdz desmitdaļām)`,
        ru: `Твои оценки по математике: ${marks.join(", ")}. Какой средний балл? (округли до десятых)`,
      },
      ...num(avg, 0.05),
      hint: {
        lv: "Saskaiti visas atzīmes un dali ar to skaitu.",
        ru: "Сложи все оценки и раздели на их количество.",
      },
      solution: {
        lv: `(${marks.join(" + ")}) : ${n} = ${marks.reduce((s, m) => s + m, 0)} : ${n} ≈ ${fmt(avg, 1)}`,
        ru: `(${marks.join(" + ")}) : ${n} = ${marks.reduce((s, m) => s + m, 0)} : ${n} ≈ ${fmt(avg, 1)}`,
      },
    };
  },

  // ---------- 8. klase ----------
  linearFunction: (): Exercise => {
    const k = pick([0.5, 0.6, 0.75, 0.8, 1.2]);
    const b = pick([1, 1.5, 2, 2.5]);
    const x = rnd(3, 15);
    const y = round(k * x + b);
    return {
      question: {
        lv: `Taksometrs Rīgā: ${fmt(b)} € iekāpšana + ${fmt(k)} € par km. Funkcija y = ${fmt(k)}x + ${fmt(b)}. Cik maksās ${x} km brauciens?`,
        ru: `Такси в Риге: ${fmt(b)} € посадка + ${fmt(k)} € за км. Функция y = ${fmt(k)}x + ${fmt(b)}. Сколько стоит поездка на ${x} км?`,
      },
      ...num(y, 0.01),
      unit: U.eur,
      hint: {
        lv: `Ievieto x = ${x} formulā.`,
        ru: `Подставь x = ${x} в формулу.`,
      },
      solution: {
        lv: `y = ${fmt(k)} · ${x} + ${fmt(b)} = ${fmt(y)} €`,
        ru: `y = ${fmt(k)} · ${x} + ${fmt(b)} = ${fmt(y)} €`,
      },
    };
  },
  pythagoras: (): Exercise => {
    // Whole-number right triangles (Pythagorean triples and their multiples), hypotenuse up to 50.
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [20, 21, 29],
      [12, 35, 37],
      [9, 40, 41],
    ].flatMap((t) => Array.from({ length: Math.floor(50 / t[2]) }, (_, k) => t.map((x) => x * (k + 1))));
    const [p, q, c] = pick(triples);
    const [a, b] = random() < 0.5 ? [p, q] : [q, p];
    const kind = pick(["ladder", "tv", "park", "kite"] as const);
    if (kind === "park") {
      return {
        question: {
          lv: `Parks ir taisnstūris ${a} m × ${b} m. Cik garš ir celiņš pa diagonāli no viena stūra līdz pretējam?`,
          ru: `Парк — прямоугольник ${a} м × ${b} м. Какой длины дорожка по диагонали из одного угла в противоположный?`,
        },
        ...num(c),
        unit: U.m,
        hint: { lv: "Diagonāle ir taisnleņķa trijstūra hipotenūza: c² = a² + b²", ru: "Диагональ — гипотенуза прямоугольного треугольника: c² = a² + b²" },
        solution: {
          lv: `c = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${c * c} = ${c} m`,
          ru: `c = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${c * c} = ${c} м`,
        },
      };
    }
    if (kind === "kite") {
      return {
        question: {
          lv: `Pūķa aukla ir ${c} m gara un nostiepta taisni. Pūķis ir tieši virs punkta, kas ir ${b} m no tevis. Cik augstu ir pūķis (no rokas augstuma)?`,
          ru: `Нить воздушного змея длиной ${c} м натянута прямо. Змей находится точно над точкой в ${b} м от тебя. На какой высоте змей (от уровня руки)?`,
        },
        ...num(a),
        unit: U.m,
        hint: { lv: "Aukla ir hipotenūza: a² = c² − b²", ru: "Нить — гипотенуза: a² = c² − b²" },
        solution: {
          lv: `a = √(${c}² − ${b}²) = √(${c * c} − ${b * b}) = √${a * a} = ${a} m`,
          ru: `a = √(${c}² − ${b}²) = √(${c * c} − ${b * b}) = √${a * a} = ${a} м`,
        },
      };
    }
    return kind === "ladder"
      ? {
          question: {
            lv: `Kāpņu apakša ir ${a} m no mājas sienas, un tās sasniedz ${b} m augstumu. Cik garas ir kāpnes?`,
            ru: `Низ лестницы стоит в ${a} м от стены дома, а верх достаёт до высоты ${b} м. Какой длины лестница?`,
          },
          ...num(c),
          unit: U.m,
          hint: { lv: "c² = a² + b²", ru: "c² = a² + b²" },
          solution: {
            lv: `c = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${c * c} = ${c} m`,
            ru: `c = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${c * c} = ${c} м`,
          },
        }
      : {
          question: {
            lv: `Televizora ekrāna diagonāle ir ${c} dm, platums ${b} dm. Cik decimetrus augsts ir ekrāns?`,
            ru: `Диагональ экрана телевизора ${c} дм, ширина ${b} дм. Какова высота экрана в дециметрах?`,
          },
          ...num(a),
          unit: { lv: "dm", ru: "дм" },
          hint: { lv: "a² = c² − b²", ru: "a² = c² − b²" },
          solution: {
            lv: `a = √(${c}² − ${b}²) = √(${c * c} − ${b * b}) = √${a * a} = ${a} dm`,
            ru: `a = √(${c}² − ${b}²) = √(${c * c} − ${b * b}) = √${a * a} = ${a} дм`,
          },
        };
  },
  sqrt: (): Exercise => {
    const side = rnd(2, 30);
    const n = side * side;
    const [question, unit] = pick([
      [
        {
          lv: `Kvadrātveida terases laukums ir ${n} m². Cik garš ir terases sāns?`,
          ru: `Площадь квадратной террасы ${n} м². Какова длина её стороны?`,
        },
        U.m,
      ],
      [
        {
          lv: `Kvadrātveida mozaīka salikta no ${n} vienādām flīzītēm. Cik flīzīšu ir vienā rindā?`,
          ru: `Квадратная мозаика сложена из ${n} одинаковых плиток. Сколько плиток в одном ряду?`,
        },
        U.pcs,
      ],
      [
        {
          lv: `Kvadrātveida zemes gabala laukums ir ${n} m². Cik metru žoga vajag vienai tā malai?`,
          ru: `Площадь квадратного участка ${n} м². Сколько метров забора нужно на одну его сторону?`,
        },
        U.m,
      ],
      [
        {
          lv: `Kvadrātveida fotogrāfijas laukums ir ${n} cm². Cik garš ir fotogrāfijas sāns?`,
          ru: `Площадь квадратной фотографии ${n} см². Какова длина её стороны?`,
        },
        U.cm,
      ],
    ] as const);
    return {
      question,
      ...num(side),
      unit,
      hint: {
        lv: "Meklē skaitli, kuru reizinot pašu ar sevi, iegūst doto skaitli.",
        ru: "Найди число, которое при умножении само на себя даёт данное число.",
      },
      solution: { lv: `√${n} = ${side}, jo ${side} · ${side} = ${n}`, ru: `√${n} = ${side}, потому что ${side} · ${side} = ${n}` },
    };
  },
  probability: (): Exercise => {
    const red = rnd(1, 6);
    const blue = rnd(1, 6);
    const green = rnd(1, 5);
    const total = red + blue + green;
    const g = (n: number, d: number) => {
      let a = n;
      let b = d;
      while (b) [a, b] = [b, a % b];
      return `${n / a}/${d / a}`;
    };
    const answer = g(red, total);
    return {
      question: {
        lv: `Maisiņā ir ${red} sarkanas, ${blue} zilas un ${green} zaļas konfektes. Kāda ir varbūtība bez skatīšanās izvilkt sarkanu?`,
        ru: `В мешочке ${red} красных, ${blue} синих и ${green} зелёных конфет. Какова вероятность не глядя вытащить красную?`,
      },
      ...choice(answer, [g(blue, total), g(green, total), `${red}/${blue + green}`, g(red + blue, total)]),
      hint: {
        lv: "Varbūtība = labvēlīgie gadījumi : visi gadījumi.",
        ru: "Вероятность = благоприятные исходы : все исходы.",
      },
      solution: {
        lv: `P = ${red} : ${total} = ${answer}`,
        ru: `P = ${red} : ${total} = ${answer}`,
      },
    };
  },

  // ---------- 9. klase ----------
  quadratic: (): Exercise => {
    const r1 = rnd(-8, 8);
    let r2 = rnd(-8, 8);
    if (r2 === r1) r2 = r1 > 6 ? r1 - 2 : r1 + 2;
    const b = -(r1 + r2);
    const c = r1 * r2;
    const big = Math.max(r1, r2);
    const askBig = random() < 0.6;
    const term = (coef: number, sym: string) =>
      coef === 0 ? "" : `${coef > 0 ? " + " : " − "}${Math.abs(coef) === 1 && sym ? "" : Math.abs(coef)}${sym}`;
    return {
      question: {
        lv: `Atrisini vienādojumu x²${term(b, "x")}${term(c, "")} = 0. Ieraksti ${askBig ? "lielāko" : "mazāko"} sakni.`,
        ru: `Реши уравнение x²${term(b, "x")}${term(c, "")} = 0. Впиши ${askBig ? "больший" : "меньший"} корень.`,
      },
      ...num(askBig ? big : Math.min(r1, r2)),
      hint: {
        lv: "D = b² − 4ac, x = (−b ± √D) / 2a. Vai arī meklē divus skaitļus, kuru summa ir −b un reizinājums c (Vjeta teorēma).",
        ru: "D = b² − 4ac, x = (−b ± √D) / 2a. Или найди два числа с суммой −b и произведением c (теорема Виета).",
      },
      solution: {
        lv: `D = ${b * b} − ${4 * c} = ${b * b - 4 * c}; x₁ = ${Math.min(r1, r2)}, x₂ = ${big}`,
        ru: `D = ${b * b} − ${4 * c} = ${b * b - 4 * c}; x₁ = ${Math.min(r1, r2)}, x₂ = ${big}`,
      },
    };
  },
  system: (): Exercise => {
    const x = rnd(2, 9);
    const y = rnd(2, 9);
    const px = pick([2, 3, 4]);
    const py = pick([1, 5, 6].filter((p) => p !== px));
    return {
      question: {
        lv: `Kino ${x + y} biļetes maksāja kopā ${px * x + py * y} €. Bērnu biļete maksā ${px} €, pieaugušo — ${py} €. Cik bērnu biļešu nopirka?`,
        ru: `${x + y} билетов в кино стоили вместе ${px * x + py * y} €. Детский билет стоит ${px} €, взрослый — ${py} €. Сколько купили детских билетов?`,
      },
      ...num(x),
      hint: {
        lv: `x + y = ${x + y}; ${px}x + ${py}y = ${px * x + py * y}. Izsaki y no pirmā un ievieto otrajā.`,
        ru: `x + y = ${x + y}; ${px}x + ${py}y = ${px * x + py * y}. Вырази y из первого и подставь во второе.`,
      },
      solution: {
        lv: `y = ${x + y} − x ⇒ ${px}x + ${py}(${x + y} − x) = ${px * x + py * y} ⇒ x = ${x}, y = ${y}`,
        ru: `y = ${x + y} − x ⇒ ${px}x + ${py}(${x + y} − x) = ${px * x + py * y} ⇒ x = ${x}, y = ${y}`,
      },
    };
  },
  similarity: (): Exercise => {
    const stick = pick([1, 1.5, 2]);
    const stickShadow = pick([0.5, 1, 1.5, 2]);
    const k = rnd(4, 15);
    const shadow = round(stickShadow * k, 1);
    const height = round(stick * k, 1);
    return {
      question: {
        lv: `Saulainā dienā ${fmt(stick)} m augsta mietiņa ēna ir ${fmt(stickShadow)} m. Tajā pašā brīdī koka ēna ir ${fmt(shadow)} m. Cik augsts ir koks?`,
        ru: `В солнечный день тень колышка высотой ${fmt(stick)} м равна ${fmt(stickShadow)} м. В тот же момент тень дерева ${fmt(shadow)} м. Какова высота дерева?`,
      },
      ...num(height, 0.05),
      unit: U.m,
      hint: {
        lv: "Trijstūri ir līdzīgi: augstums : ēna ir vienāds abiem.",
        ru: "Треугольники подобны: высота : тень одинаковы для обоих.",
      },
      solution: {
        lv: `h = ${fmt(shadow)} · ${fmt(stick)} : ${fmt(stickShadow)} = ${fmt(height)} m`,
        ru: `h = ${fmt(shadow)} · ${fmt(stick)} : ${fmt(stickShadow)} = ${fmt(height)} м`,
      },
    };
  },
  trig: (): Exercise => {
    const angle = pick([30, 35, 40, 45, 50, 60]);
    const dist = rnd(10, 40);
    const h = round(dist * Math.tan((angle * Math.PI) / 180), 1);
    return {
      question: {
        lv: `Tu stāvi ${dist} m no Brīvības pieminekļa un redzi tā virsotni ${angle}° leņķī. Cik augsts ir objekts (no acu augstuma)? (noapaļo līdz desmitdaļām)`,
        ru: `Ты стоишь в ${dist} м от памятника Свободы и видишь его вершину под углом ${angle}°. Какова высота объекта (от уровня глаз)? (округли до десятых)`,
      },
      ...num(h, 0.15),
      unit: U.m,
      hint: {
        lv: "tg α = pretkatete : piekatete, tātad h = attālums · tg α.",
        ru: "tg α = противолежащий катет : прилежащий, значит h = расстояние · tg α.",
      },
      solution: {
        lv: `h = ${dist} · tg ${angle}° ≈ ${dist} · ${fmt(Math.tan((angle * Math.PI) / 180), 3)} ≈ ${fmt(h, 1)} m`,
        ru: `h = ${dist} · tg ${angle}° ≈ ${dist} · ${fmt(Math.tan((angle * Math.PI) / 180), 3)} ≈ ${fmt(h, 1)} м`,
      },
    };
  },
  volume: (): Exercise => {
    if (random() < 0.4) {
      // Aquarium in centimetres: 1 l = 1 dm³ = 1000 cm³.
      const a = pick([40, 50, 60, 80, 100, 120]);
      const b = pick([25, 30, 40, 50]);
      const h = pick([30, 40, 50]);
      const cm3 = a * b * h;
      return {
        question: {
          lv: `Akvārijs ir ${a} cm garš, ${b} cm plats un ${h} cm augsts. Cik litru ūdens tajā ietilpst? (1 l = 1000 cm³)`,
          ru: `Аквариум длиной ${a} см, шириной ${b} см и высотой ${h} см. Сколько литров воды в него помещается? (1 л = 1000 см³)`,
        },
        ...num(cm3 / 1000),
        unit: U.l,
        hint: {
          lv: "Tilpums V = garums · platums · augstums. Tad dali ar 1000, lai iegūtu litrus.",
          ru: "Объём V = длина · ширина · высота. Потом раздели на 1000, чтобы получить литры.",
        },
        solution: {
          lv: `V = ${a} · ${b} · ${h} = ${cm3} cm³ = ${fmt(cm3 / 1000)} l`,
          ru: `V = ${a} · ${b} · ${h} = ${cm3} см³ = ${fmt(cm3 / 1000)} л`,
        },
      };
    }
    const a = rnd(2, 8);
    const b = rnd(2, 5);
    const h = pick([1, 1.5, 2]);
    const v = round(a * b * h, 2);
    return {
      question: {
        lv: `Dārza baseins ir ${a} m garš, ${b} m plats un ūdens dziļums ${fmt(h)} m. Cik litru ūdens tajā ir? (1 m³ = 1000 l)`,
        ru: `Садовый бассейн длиной ${a} м, шириной ${b} м, глубина воды ${fmt(h)} м. Сколько литров воды в нём? (1 м³ = 1000 л)`,
      },
      ...num(v * 1000),
      unit: U.l,
      hint: {
        lv: "Tilpums V = garums · platums · augstums. Tad pārvērš m³ litros.",
        ru: "Объём V = длина · ширина · высота. Потом переведи м³ в литры.",
      },
      solution: {
        lv: `V = ${a} · ${b} · ${fmt(h)} = ${fmt(v)} m³ = ${v * 1000} l`,
        ru: `V = ${a} · ${b} · ${fmt(h)} = ${fmt(v)} м³ = ${v * 1000} л`,
      },
    };
  },
  // ---------- added for Skola2030 coverage ----------
  sequence: (): Exercise => {
    const up = random() < 0.6;
    const step = pick([1, 2, 3, 4, 5]);
    const start = up ? rnd(0, 20 - 4 * step) : rnd(4 * step, 20);
    const terms = Array.from({ length: 4 }, (_, i) => start + (up ? i : -i) * step);
    const next = start + (up ? 4 : -4) * step;
    const list = terms.join(", ");
    return {
      question: pick([
        {
          lv: `Kāpnēm uz pakāpieniem uzrakstīti skaitļi: ${list}, … Kāds skaitlis būs uz nākamā pakāpiena?`,
          ru: `На ступеньках лестницы написаны числа: ${list}, … Какое число будет на следующей ступеньке?`,
        },
        {
          lv: `Varde lec pa skaitļu taisni un nolaižas uz skaitļiem ${list}, … Uz kura skaitļa tā nolaidīsies nākamreiz?`,
          ru: `Лягушка прыгает по числовой прямой и приземляется на числа ${list}, … На какое число она приземлится в следующий раз?`,
        },
        {
          lv: `Skaitīšanas dziesmiņā bērni sauc skaitļus: ${list}, … Kāds skaitlis jāsauc tālāk?`,
          ru: `В считалке дети называют числа: ${list}, … Какое число назвать дальше?`,
        },
      ]),
      ...num(next),
      hint: {
        lv: "Paskaties, par cik mainās katrs nākamais skaitlis. Vai tie aug vai samazinās?",
        ru: "Посмотри, на сколько меняется каждое следующее число. Они растут или уменьшаются?",
      },
      solution: {
        lv: `Katrs nākamais ir par ${step} ${up ? "lielāks" : "mazāks"}: ${terms[3]} ${up ? "+" : "−"} ${step} = ${next}`,
        ru: `Каждое следующее на ${step} ${up ? "больше" : "меньше"}: ${terms[3]} ${up ? "+" : "−"} ${step} = ${next}`,
      },
    };
  },
  units: (): Exercise => {
    const kind = pick(["length", "mass", "time", "money"] as const);
    if (kind === "length") {
      const m = rnd(1, 4);
      const cm = rnd(5, 95);
      return {
        question: {
          lv: `Lentes garums ir ${m} m ${cm} cm. Cik tas ir centimetros?`,
          ru: `Длина ленты ${m} м ${cm} см. Сколько это сантиметров?`,
        },
        ...num(m * 100 + cm),
        unit: U.cm,
        hint: { lv: "1 m = 100 cm", ru: "1 м = 100 см" },
        solution: {
          lv: `${m} m = ${m * 100} cm; ${m * 100} + ${cm} = ${m * 100 + cm} cm`,
          ru: `${m} м = ${m * 100} см; ${m * 100} + ${cm} = ${m * 100 + cm} см`,
        },
      };
    }
    if (kind === "mass") {
      // Stays within 1000 (stage 1–3 works with numbers up to 1000).
      const used = pick([150, 200, 250, 300, 350, 400, 450, 600, 750]);
      return {
        question: {
          lv: `Paciņā bija 1 kg miltu. Pankūkām izlietoja ${used} g. Cik gramu miltu palika?`,
          ru: `В пачке был 1 кг муки. На блины израсходовали ${used} г. Сколько граммов муки осталось?`,
        },
        ...num(1000 - used),
        unit: { lv: "g", ru: "г" },
        hint: { lv: "1 kg = 1000 g", ru: "1 кг = 1000 г" },
        solution: {
          lv: `1 kg = 1000 g; 1000 − ${used} = ${1000 - used} g`,
          ru: `1 кг = 1000 г; 1000 − ${used} = ${1000 - used} г`,
        },
      };
    }
    if (kind === "time") {
      const h = rnd(1, 3);
      const min = pick([0, 10, 15, 20, 30, 45]);
      return {
        question: {
          lv: `Ceļš ar vilcienu no Rīgas līdz Siguldai un atpakaļ ilga ${h} h ${min} min. Cik tas ir minūtēs?`,
          ru: `Поездка на поезде из Риги в Сигулду и обратно заняла ${h} ч ${min} мин. Сколько это минут?`,
        },
        ...num(h * 60 + min),
        unit: U.min,
        hint: { lv: "1 h = 60 min", ru: "1 ч = 60 мин" },
        solution: {
          lv: `${h} h = ${h * 60} min; ${h * 60} + ${min} = ${h * 60 + min} min`,
          ru: `${h} ч = ${h * 60} мин; ${h * 60} + ${min} = ${h * 60 + min} мин`,
        },
      };
    }
    const e = rnd(1, 9);
    const c = rnd(5, 95);
    return {
      question: {
        lv: `Grāmata maksā ${e} € ${c} c. Cik tas ir centos?`,
        ru: `Книга стоит ${e} € ${c} ц. Сколько это центов?`,
      },
      ...num(e * 100 + c),
      unit: { lv: "c", ru: "ц" },
      hint: { lv: "1 € = 100 c", ru: "1 € = 100 ц" },
      solution: {
        lv: `${e} € = ${e * 100} c; ${e * 100} + ${c} = ${e * 100 + c} c`,
        ru: `${e} € = ${e * 100} ц; ${e * 100} + ${c} = ${e * 100 + c} ц`,
      },
    };
  },
  chart: (): Exercise => {
    const fruits = [
      { lv: "āboli", ru: "яблоки" },
      { lv: "bumbieri", ru: "груши" },
      { lv: "zemenes", ru: "клубника" },
      { lv: "banāni", ru: "бананы" },
    ];
    const votes = fruits.map(() => rnd(2, 12));
    const i = rnd(0, 3);
    let j = rnd(0, 3);
    if (j === i) j = (i + 1) % 4;
    const table = (lang: "lv" | "ru") => fruits.map((f, k) => `${f[lang]} — ${votes[k]}`).join("; ");
    const total = random() < 0.5;
    const answer = total ? votes.reduce((s, v) => s + v, 0) : Math.abs(votes[i] - votes[j]);
    return {
      question: total
        ? {
            lv: `Klasē aptaujāja: “Kurš ir tavs mīļākais auglis?” Rezultāti: ${table("lv")}. Cik skolēnu piedalījās aptaujā?`,
            ru: `В классе провели опрос: «Какой твой любимый фрукт?» Результаты: ${table("ru")}. Сколько учеников участвовало в опросе?`,
          }
        : {
            lv: `Klasē aptaujāja: “Kurš ir tavs mīļākais auglis?” Rezultāti: ${table("lv")}. Par cik balsīm ${fruits[i].lv} atšķiras no ${fruits[j].lv}?`,
            ru: `В классе провели опрос: «Какой твой любимый фрукт?» Результаты: ${table("ru")}. На сколько голосов отличаются ${fruits[i].ru} и ${fruits[j].ru}?`,
          },
      ...num(answer),
      hint: total
        ? { lv: "Saskaiti visu stabiņu augstumus.", ru: "Сложи высоты всех столбиков." }
        : { lv: "No lielākā skaita atņem mazāko.", ru: "Из большего числа вычти меньшее." },
      solution: total
        ? { lv: `${votes.join(" + ")} = ${answer}`, ru: `${votes.join(" + ")} = ${answer}` }
        : {
            lv: `${Math.max(votes[i], votes[j])} − ${Math.min(votes[i], votes[j])} = ${answer}`,
            ru: `${Math.max(votes[i], votes[j])} − ${Math.min(votes[i], votes[j])} = ${answer}`,
          },
    };
  },
  speed: (): Exercise => {
    const v = pick([4, 5, 12, 15, 40, 50, 60, 80, 90]);
    const t = rnd(2, 5);
    const s = v * t;
    const who =
      v <= 5
        ? { lv: "Tūrists Gaujas takā iet", ru: "Турист на тропе вдоль Гауи идёт" }
        : v <= 15
          ? { lv: "Velosipēdists brauc", ru: "Велосипедист едет" }
          : { lv: "Autobuss brauc", ru: "Автобус едет" };
    const ask = pick(["s", "t", "v"] as const);
    const q =
      ask === "s"
        ? { lv: `${who.lv} ar ātrumu ${v} km/h ${t} stundas. Cik kilometrus tas veic?`, ru: `${who.ru} со скоростью ${v} км/ч в течение ${t} часов. Сколько километров он проходит?` }
        : ask === "t"
          ? { lv: `${who.lv} ${s} km ar ātrumu ${v} km/h. Cik stundas ilgst ceļš?`, ru: `${who.ru} ${s} км со скоростью ${v} км/ч. Сколько часов длится путь?` }
          : { lv: `${who.lv} ${s} km ${t} stundās. Kāds ir ātrums?`, ru: `${who.ru} ${s} км за ${t} часа(ов). Какова скорость?` };
    const ans = ask === "s" ? s : ask === "t" ? t : v;
    const formula = ask === "s" ? `s = v · t = ${v} · ${t} = ${s} km` : ask === "t" ? `t = s : v = ${s} : ${v} = ${t} h` : `v = s : t = ${s} : ${t} = ${v} km/h`;
    return {
      question: q,
      ...num(ans),
      unit: ask === "s" ? U.km : ask === "t" ? { lv: "h", ru: "ч" } : { lv: "km/h", ru: "км/ч" },
      hint: {
        lv: "Ceļš = ātrums · laiks. Ja zināmi divi lielumi, trešo var aprēķināt.",
        ru: "Путь = скорость · время. Если известны две величины, третью можно найти.",
      },
      solution: { lv: formula, ru: formula.replace("km/h", "км/ч").replace(" km", " км").replace(" h", " ч") },
    };
  },
  primes: (): Exercise => {
    const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const COMPOSITE_TRAPS = [9, 15, 21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93];
    const p = pick(PRIMES.filter((x) => x > 10));
    const wrong = shuffle([...COMPOSITE_TRAPS]).slice(0, 3);
    const factor = (n: number) => {
      for (let d = 2; d * d <= n; d++) if (n % d === 0) return `${n} = ${d} · ${n / d}`;
      return String(n);
    };
    return {
      question: {
        lv: `Kastē ir konfektes, kuras gribam sadalīt vienādās rindās (vairāk nekā 1 rindā un katrā vairāk nekā 1 konfekte). Kuru konfekšu skaitu NEVAR tā sadalīt — kurš skaitlis ir pirmskaitlis?`,
        ru: `Конфеты хотим разложить в одинаковые ряды (больше 1 ряда и больше 1 конфеты в ряду). Какое количество конфет так разложить НЕЛЬЗЯ — какое число простое?`,
      },
      ...choice(String(p), wrong.map(String)),
      hint: {
        lv: "Pirmskaitlis dalās tikai ar 1 un pats ar sevi. Pārbaudi dalīšanu ar 2, 3, 5, 7.",
        ru: "Простое число делится только на 1 и на себя. Проверь деление на 2, 3, 5, 7.",
      },
      solution: {
        lv: `${p} dalās tikai ar 1 un ${p}. Pārējie ir salikti: ${wrong.map(factor).join("; ")}`,
        ru: `${p} делится только на 1 и на ${p}. Остальные составные: ${wrong.map(factor).join("; ")}`,
      },
    };
  },
  coords: (): Exercise => {
    const x = rnd(-5, 5);
    const y = rnd(-5, 5);
    const dx = pick([-4, -3, -2, 2, 3, 4]);
    const dy = pick([-3, -2, 2, 3]);
    const p = (a: number, b: number) => `(${String(a).replace("-", "−")}; ${String(b).replace("-", "−")})`;
    const dir = (d: number, pos: { lv: string; ru: string }, neg: { lv: string; ru: string }) => (d > 0 ? pos : neg);
    const h = dir(dx, { lv: "pa labi", ru: "вправо" }, { lv: "pa kreisi", ru: "влево" });
    const v = dir(dy, { lv: "uz augšu", ru: "вверх" }, { lv: "uz leju", ru: "вниз" });
    const answer = p(x + dx, y + dy);
    return {
      question: {
        lv: `Spēlē robots stāv punktā ${p(x, y)}. Tas pārvietojas ${Math.abs(dx)} rūtiņas ${h.lv} un ${Math.abs(dy)} rūtiņas ${v.lv}. Kurā punktā tas nonāk?`,
        ru: `В игре робот стоит в точке ${p(x, y)}. Он сдвигается на ${Math.abs(dx)} клетки ${h.ru} и на ${Math.abs(dy)} клетки ${v.ru}. В какой точке он окажется?`,
      },
      ...choice(answer, [p(x + dy, y + dx), p(x - dx, y + dy), p(x + dx, y - dy), p(y + dy, x + dx)]),
      hint: {
        lv: "Pirmā koordināta (x) mainās, ejot pa labi/kreisi, otrā (y) — uz augšu/leju.",
        ru: "Первая координата (x) меняется при движении вправо/влево, вторая (y) — вверх/вниз.",
      },
      solution: {
        lv: `x: ${x} ${dx > 0 ? "+" : "−"} ${Math.abs(dx)} = ${x + dx}; y: ${y} ${dy > 0 ? "+" : "−"} ${Math.abs(dy)} = ${y + dy}`,
        ru: `x: ${x} ${dx > 0 ? "+" : "−"} ${Math.abs(dx)} = ${x + dx}; y: ${y} ${dy > 0 ? "+" : "−"} ${Math.abs(dy)} = ${y + dy}`,
      },
    };
  },
  circleApprox: (): Exercise => {
    const d = rnd(5, 40) / 10;
    const c = round(d * 3, 2);
    const thing = pick([
      { lv: ["Apaļa galda diametrs", "lentes", "apliktu to apkārt malai"], ru: ["Диаметр круглого стола", "ленты", "обклеить его край"] },
      { lv: ["Batuta diametrs", "aizsargtīkla", "apjoztu batutu"], ru: ["Диаметр батута", "защитной сетки", "обнести батут"] },
      { lv: ["Apaļas puķu dobes diametrs", "apmales", "apliktu apkārt dobei"], ru: ["Диаметр круглой клумбы", "бордюра", "обложить клумбу"] },
      { lv: ["Apaļa paklāja diametrs", "bārkstu lentes", "apšūtu tā malu"], ru: ["Диаметр круглого ковра", "бахромы", "обшить его край"] },
    ]);
    return {
      question: {
        lv: `${thing.lv[0]} ir ${fmt(d)} m. Apmēram cik metru ${thing.lv[1]} vajag, lai ${thing.lv[2]}? (Riņķa līnija ir aptuveni trīs diametri.)`,
        ru: `${thing.ru[0]} ${fmt(d)} м. Примерно сколько метров ${thing.ru[1]} нужно, чтобы ${thing.ru[2]}? (Окружность — это примерно три диаметра.)`,
      },
      // Accept the estimate 3·d and anything up to π·d: both show understanding.
      ...num(round(d * 3.07, 2), round(d * 0.08, 2)),
      unit: U.m,
      hint: {
        lv: "Uz riņķa līnijas var “uzlikt” nedaudz vairāk par 3 diametriem.",
        ru: "На окружность можно «уложить» чуть больше 3 диаметров.",
      },
      solution: {
        lv: `C ≈ 3 · ${fmt(d)} = ${fmt(c)} m (patiesībā nedaudz vairāk, ~${fmt(Math.PI * d)} m)`,
        ru: `C ≈ 3 · ${fmt(d)} = ${fmt(c)} м (на самом деле чуть больше, ~${fmt(Math.PI * d)} м)`,
      },
    };
  },
  percentChange: (): Exercise => {
    const price = pick([20, 30, 40, 50, 60, 80, 100, 120, 150, 200]);
    const p = pick([10, 20, 25, 50]);
    const kind = pick(["upDown", "up", "down"] as const);
    if (kind !== "upDown") {
      const item = pick([
        { lv: ["Futbola bumba", "bumba"], ru: "Футбольный мяч" },
        { lv: ["Mēneša biļete sabiedriskajam transportam", "biļete"], ru: "Месячный проездной" },
        { lv: ["Austiņas", "austiņas"], ru: "Наушники" },
      ]);
      const factor = kind === "up" ? 1 + p / 100 : 1 - p / 100;
      const now = round(price * factor);
      const verb = kind === "up" ? { lv: "palielināja", ru: "подняли" } : { lv: "samazināja", ru: "снизили" };
      return {
        question: {
          lv: `${item.lv[0]} maksāja ${price} €. Cenu ${verb.lv} par ${p}%. Cik ${item.lv[1]} maksā tagad?`,
          ru: `${item.ru}: цена была ${price} €. Цену ${verb.ru} на ${p}%. Какая цена теперь?`,
        },
        ...num(now, 0.01),
        unit: U.eur,
        hint: {
          lv: `Jaunā cena ir ${kind === "up" ? 100 + p : 100 - p}% no vecās: reizini ar ${fmt(factor)}.`,
          ru: `Новая цена — ${kind === "up" ? 100 + p : 100 - p}% от старой: умножь на ${fmt(factor)}.`,
        },
        solution: {
          lv: `${price} · ${fmt(factor)} = ${fmt(now)} €`,
          ru: `${price} · ${fmt(factor)} = ${fmt(now)} €`,
        },
      };
    }
    const up = round(price * (1 + p / 100));
    const back = round(up * (1 - p / 100));
    return {
      question: {
        lv: `Velosipēda ķivere maksāja ${price} €. Pavasarī cenu palielināja par ${p}%, bet rudenī samazināja par ${p}%. Cik ķivere maksā rudenī? (Vai tā atgriezās pie ${price} €?)`,
        ru: `Велосипедный шлем стоил ${price} €. Весной цену подняли на ${p}%, а осенью снизили на ${p}%. Сколько шлем стоит осенью? (Вернулась ли цена к ${price} €?)`,
      },
      ...num(back, 0.01),
      unit: U.eur,
      hint: {
        lv: `Otrie ${p}% tiek rēķināti no jaunās cenas, nevis no ${price} €.`,
        ru: `Вторые ${p}% считаются от новой цены, а не от ${price} €.`,
      },
      solution: {
        lv: `${price} · ${fmt(1 + p / 100)} = ${fmt(up)} €; ${fmt(up)} · ${fmt(1 - p / 100)} = ${fmt(back)} € — lētāk nekā sākumā!`,
        ru: `${price} · ${fmt(1 + p / 100)} = ${fmt(up)} €; ${fmt(up)} · ${fmt(1 - p / 100)} = ${fmt(back)} € — дешевле, чем сначала!`,
      },
    };
  },
  inequality: (): Exercise => {
    const fee = pick([3, 4, 5, 6]);
    const per = pick([2, 3, 4]);
    const budget = fee + per * rnd(3, 8) + rnd(0, per - 1);
    const max = Math.floor((budget - fee) / per);
    return {
      question: {
        lv: `Mobilā plāna abonēšana maksā ${fee} € mēnesī plus ${per} € par katru papildu GB. Tavs budžets ir ${budget} €. Cik lielākais veselais GB skaits, ko vari nopirkt? (${fee} + ${per}x ≤ ${budget})`,
        ru: `Мобильный тариф стоит ${fee} € в месяц плюс ${per} € за каждый дополнительный ГБ. Твой бюджет ${budget} €. Какое наибольшее целое число ГБ можно купить? (${fee} + ${per}x ≤ ${budget})`,
      },
      ...num(max),
      unit: { lv: "GB", ru: "ГБ" },
      hint: {
        lv: "Risini kā vienādojumu, bet ar zīmi ≤. Beigās paņem lielāko veselo skaitli.",
        ru: "Решай как уравнение, но со знаком ≤. В конце возьми наибольшее целое число.",
      },
      solution: {
        lv: `${per}x ≤ ${budget} − ${fee} = ${budget - fee}; x ≤ ${fmt((budget - fee) / per)}; lielākais veselais x = ${max}`,
        ru: `${per}x ≤ ${budget} − ${fee} = ${budget - fee}; x ≤ ${fmt((budget - fee) / per)}; наибольшее целое x = ${max}`,
      },
    };
  },
  statsMedian: (): Exercise => {
    const n = pick([5, 7]);
    const temps = Array.from({ length: n }, () => rnd(-6, 8));
    const sorted = [...temps].sort((a, b) => a - b);
    const kind = pick(["median", "range"] as const);
    const answer = kind === "median" ? sorted[(n - 1) / 2] : sorted[n - 1] - sorted[0];
    const s = (x: number) => String(x).replace("-", "−");
    const list = temps.map(s).join("; ");
    return {
      question:
        kind === "median"
          ? {
              lv: `Rēzeknē nedēļas laikā pusdienlaikā izmērīja temperatūru (°C): ${list}. Kāda ir mediāna?`,
              ru: `В Резекне за неделю в полдень измеряли температуру (°C): ${list}. Чему равна медиана?`,
            }
          : {
              lv: `Rēzeknē nedēļas laikā pusdienlaikā izmērīja temperatūru (°C): ${list}. Kāda ir amplitūda (starpība starp lielāko un mazāko)?`,
              ru: `В Резекне за неделю в полдень измеряли температуру (°C): ${list}. Чему равна амплитуда (разность наибольшего и наименьшего)?`,
            },
      ...num(answer),
      unit: U.c,
      hint:
        kind === "median"
          ? { lv: "Sakārto skaitļus augošā secībā un paņem vidējo.", ru: "Упорядочи числа по возрастанию и возьми средний." }
          : { lv: "Amplitūda = lielākā vērtība − mazākā vērtība.", ru: "Амплитуда = наибольшее значение − наименьшее." },
      solution:
        kind === "median"
          ? {
              lv: `Sakārtots: ${sorted.map(s).join("; ")} → vidējais (${(n + 1) / 2}.) skaitlis ir ${s(answer)}`,
              ru: `По порядку: ${sorted.map(s).join("; ")} → средний (${(n + 1) / 2}-й) элемент ${s(answer)}`,
            }
          : {
              lv: `${s(sorted[n - 1])} − (${s(sorted[0])}) = ${answer}`,
              ru: `${s(sorted[n - 1])} − (${s(sorted[0])}) = ${answer}`,
            },
    };
  },
  arithSeq: (): Exercise => {
    const a1 = pick([2, 3, 5, 10]);
    const d = pick([1, 2, 3, 5]);
    const k = rnd(8, 20);
    const an = a1 + (k - 1) * d;
    return {
      question: {
        lv: `Tu sāc krāt naudu: 1. nedēļā ieliec krājkasītē ${a1} €, un katru nākamo nedēļu par ${d} € vairāk nekā iepriekšējā. Cik eiro tu ieliksi ${k}. nedēļā?`,
        ru: `Ты начинаешь копить: в 1-ю неделю кладёшь в копилку ${a1} €, а каждую следующую неделю на ${d} € больше, чем в предыдущую. Сколько евро ты положишь на ${k}-й неделе?`,
      },
      ...num(an),
      unit: U.eur,
      hint: {
        lv: "Aritmētiskā progresija: aₙ = a₁ + (n − 1) · d",
        ru: "Арифметическая прогрессия: aₙ = a₁ + (n − 1) · d",
      },
      solution: {
        lv: `a${k} = ${a1} + (${k} − 1) · ${d} = ${a1} + ${(k - 1) * d} = ${an} €`,
        ru: `a${k} = ${a1} + (${k} − 1) · ${d} = ${a1} + ${(k - 1) * d} = ${an} €`,
      },
    };
  },
  triangleInequality: (): Exercise => {
    const ok = (() => {
      const a = rnd(3, 9);
      const b = rnd(3, 9);
      return [a, b, rnd(Math.abs(a - b) + 1, a + b - 1)];
    })();
    const bad = () => {
      const a = rnd(2, 6);
      const b = rnd(2, 6);
      return [a, b, a + b + rnd(0, 4)];
    };
    const fmtSet = (t: number[]) => [...t].sort((x, y) => x - y).join(", ");
    const answer = fmtSet(ok);
    return {
      question: {
        lv: "Tev ir koka nūjiņas (garumi cm). No kura komplekta var salikt trijstūri?",
        ru: "У тебя есть деревянные палочки (длины в см). Из какого набора можно сложить треугольник?",
      },
      ...choice(answer, [fmtSet(bad()), fmtSet(bad()), fmtSet(bad())]),
      hint: {
        lv: "Trijstūra nevienādība: divu īsāko malu summai jābūt lielākai par garāko malu.",
        ru: "Неравенство треугольника: сумма двух меньших сторон должна быть больше большей стороны.",
      },
      solution: (() => {
        const [x, y, z] = [...ok].sort((p, q) => p - q);
        return {
          lv: `${x} + ${y} = ${x + y} > ${z}, tāpēc ${answer} der. Pārējos komplektos īsāko summa ≤ garākā mala.`,
          ru: `${x} + ${y} = ${x + y} > ${z}, поэтому ${answer} подходит. В остальных наборах сумма меньших ≤ большей стороны.`,
        };
      })(),
    };
  },
} satisfies Record<string, () => Exercise>;

export const MAX_SEED = 2 ** 31 - 1;

export function newSeed(): number {
  return Math.floor(Math.random() * MAX_SEED);
}

export function isGeneratorId(id: string): id is GeneratorId {
  return Object.hasOwn(generators, id);
}

/** Deterministic: the same (id, seed) always yields the same exercise. */
export function generateExercise(id: GeneratorId, seed: number): Exercise {
  const previous = random;
  random = seeded(seed);
  try {
    return generators[id]();
  } finally {
    random = previous;
  }
}

/** Every topic has a numbered set of at least this many different problems. */
export const PROBLEMS_PER_TOPIC = 100;

/** Two exercises are the same problem when the story, numbers and answer options match. */
export function problemKey(ex: Exercise): string {
  return ex.kind === "choice" ? `${ex.question.lv}|${[...ex.choices].sort().join("|")}` : ex.question.lv;
}

const sets = new Map<GeneratorId, number[]>();

/**
 * The topic's numbered problems, as seeds: the same list on every device and on the
 * server, so "problem 37" is always the same task and the tutor can rebuild it. Seeds are
 * walked in a fixed order and repeats of an earlier problem are skipped.
 */
export function problemSet(id: GeneratorId): number[] {
  const cached = sets.get(id);
  if (cached) return cached;
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const next = seeded(h);
  const seen = new Set<string>();
  const seeds: number[] = [];
  for (let tries = 0; seeds.length < PROBLEMS_PER_TOPIC && tries < PROBLEMS_PER_TOPIC * 100; tries++) {
    const seed = Math.floor(next() * MAX_SEED);
    const key = problemKey(generateExercise(id, seed));
    if (seen.has(key)) continue;
    seen.add(key);
    seeds.push(seed);
  }
  sets.set(id, seeds);
  return seeds;
}

/** Accepts "3,5", "3.5", " 3 ", "-4", "−4". Returns null when it isn't a number. */
export function parseNumber(input: string): number | null {
  const cleaned = input.trim().replace(/\s/g, "").replace(",", ".").replace("−", "-").replace(/[€%°]$/, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function checkAnswer(ex: Exercise, input: string): boolean {
  if (ex.kind === "choice") return input === ex.answer;
  const n = parseNumber(input);
  if (n === null) return false;
  return Math.abs(n - ex.answer) <= (ex.tolerance ?? 1e-9);
}

export function formatAnswer(ex: Exercise): string {
  return ex.kind === "choice" ? ex.answer : fmt(ex.answer);
}
