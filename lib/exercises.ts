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

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <X,>(items: readonly X[]): X => items[Math.floor(Math.random() * items.length)];
const shuffle = <X,>(items: X[]): X[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
    const coins = [1, 2, 5, 10, 20, 50];
    const picked = Array.from({ length: rnd(2, 4) }, () => pick(coins));
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
      { lv: "trijstūris", ru: "треугольник", corners: 3 },
      { lv: "kvadrāts", ru: "квадрат", corners: 4 },
      { lv: "taisnstūris", ru: "прямоугольник", corners: 4 },
      { lv: "piecstūris", ru: "пятиугольник", corners: 5 },
      { lv: "sešstūris", ru: "шестиугольник", corners: 6 },
    ];
    const s = pick(items);
    return {
      question: {
        lv: `Cik stūru ir figūrai “${s.lv}”?`,
        ru: `Сколько углов у фигуры «${s.ru}»?`,
      },
      ...num(s.corners),
      hint: {
        lv: "Nosaukums bieži pasaka priekšā: “trij-stūris” — trīs stūri.",
        ru: "Название часто подсказывает: «тре-угольник» — три угла.",
      },
      solution: { lv: `${s.lv}: ${s.corners} stūri`, ru: `${s.ru}: ${s.corners} угла(ов)` },
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
    return {
      question: {
        lv: `Katrā olu kastītē ir ${a} rindas pa ${b} olām. Cik olu ir kastītē?`,
        ru: `В коробке для яиц ${a} ряда по ${b} яиц. Сколько всего яиц?`,
      },
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
    const price = rnd(3, 18) * 10 + pick([0, 5]);
    const paid = price <= 100 ? 100 : 200;
    return {
      question: {
        lv: `Saldējums maksā ${eur(price)}. Tu dod ${eur(paid)}. Cik centu tev atdos atpakaļ?`,
        ru: `Мороженое стоит ${eur(price)}. Ты даёшь ${eur(paid)}. Сколько центов тебе вернут?`,
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
    const a = rnd(3, 9);
    const b = rnd(3, 9);
    return {
      question: {
        lv: `Klasē ir ${a} galdu rindas, katrā rindā ${b} skolēni. Cik skolēnu ir klasē?`,
        ru: `В классе ${a} ряда(ов) парт, в каждом ряду ${b} учеников. Сколько всего учеников?`,
      },
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
    return {
      question: {
        lv: `${b * q} konfektes jāsadala vienādi ${b} draugiem. Cik konfekšu saņems katrs?`,
        ru: `${b * q} конфет нужно поровну разделить между ${b} друзьями. Сколько получит каждый?`,
      },
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
    return {
      question: {
        lv: `Klasē ir ${whole} skolēni. 1/${d} no viņiem brauc uz skolu ar velosipēdu. Cik skolēnu brauc ar velosipēdu?`,
        ru: `В классе ${whole} учеников. 1/${d} из них ездит в школу на велосипеде. Сколько учеников ездит на велосипеде?`,
      },
      ...num(whole / d),
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
    const p = pick([10, 20, 25, 30, 40, 50]);
    const price = pick([20, 40, 60, 80, 120, 150]);
    return {
      question: {
        lv: `Kedas maksā ${price} €. Izpārdošanā atlaide ir ${p}%. Cik maksās kedas ar atlaidi?`,
        ru: `Кеды стоят ${price} €. На распродаже скидка ${p}%. Сколько будут стоить кеды со скидкой?`,
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
    const people = pick([2, 4]);
    const flour = pick([150, 200, 250, 300]);
    const want = pick([6, 8, 10, 12].filter((w) => w % people === 0));
    return {
      question: {
        lv: `Pankūku receptē ${people} cilvēkiem vajag ${flour} g miltu. Cik gramu miltu vajag ${want} cilvēkiem?`,
        ru: `В рецепте блинов на ${people} человек нужно ${flour} г муки. Сколько граммов муки нужно на ${want} человек?`,
      },
      ...num((flour / people) * want),
      unit: { lv: "g", ru: "г" },
      hint: {
        lv: `Cik reizes vairāk cilvēku? ${want} : ${people}. Tikpat reizes vairāk miltu.`,
        ru: `Во сколько раз больше людей? ${want} : ${people}. Во столько же раз больше муки.`,
      },
      solution: {
        lv: `${want} : ${people} = ${want / people}; ${flour} · ${want / people} = ${(flour / people) * want} g`,
        ru: `${want} : ${people} = ${want / people}; ${flour} · ${want / people} = ${(flour / people) * want} г`,
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
    const d = pick([50, 60, 66, 70]);
    const turns = pick([10, 100, 1000]);
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
    const base = pick([2, 3, 10]);
    const exp = base === 10 ? rnd(2, 6) : rnd(2, 6);
    const story =
      base === 2
        ? {
            lv: `Ziņa tiek pārsūtīta: katrs to nosūta 2 draugiem. Cik cilvēku saņems ziņu ${exp}. kārtā? (2^${exp})`,
            ru: `Сообщение пересылают: каждый отправляет его 2 друзьям. Сколько человек получат его на ${exp}-м шаге? (2^${exp})`,
          }
        : base === 3
          ? {
              lv: `Baktērija ik stundu sadalās 3 daļās. Cik baktēriju būs pēc ${exp} stundām? (3^${exp})`,
              ru: `Бактерия каждый час делится на 3. Сколько бактерий будет через ${exp} часов? (3^${exp})`,
            }
          : {
              lv: `Cik ir 10^${exp}? (Tik daudz nulles kā kāpinātājs!)`,
              ru: `Сколько будет 10^${exp}? (Столько нулей, сколько показатель!)`,
            };
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
    const [a, b, c] = pick([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [9, 12, 15],
      [8, 15, 17],
      [12, 16, 20],
    ]);
    const askHyp = Math.random() < 0.6;
    return askHyp
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
    const side = rnd(4, 20);
    return {
      question: {
        lv: `Kvadrātveida terases laukums ir ${side * side} m². Cik garš ir terases sāns?`,
        ru: `Площадь квадратной террасы ${side * side} м². Какова длина её стороны?`,
      },
      ...num(side),
      unit: U.m,
      hint: {
        lv: "Meklē skaitli, kuru reizinot pašu ar sevi, iegūst laukumu.",
        ru: "Найди число, которое при умножении само на себя даёт площадь.",
      },
      solution: { lv: `√${side * side} = ${side} m`, ru: `√${side * side} = ${side} м` },
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
    const r1 = rnd(-6, 6);
    let r2 = rnd(-6, 6);
    if (r2 === r1) r2 = r1 + 2;
    const b = -(r1 + r2);
    const c = r1 * r2;
    const big = Math.max(r1, r2);
    const term = (coef: number, sym: string) =>
      coef === 0 ? "" : `${coef > 0 ? " + " : " − "}${Math.abs(coef) === 1 && sym ? "" : Math.abs(coef)}${sym}`;
    return {
      question: {
        lv: `Atrisini vienādojumu x²${term(b, "x")}${term(c, "")} = 0. Ieraksti lielāko sakni.`,
        ru: `Реши уравнение x²${term(b, "x")}${term(c, "")} = 0. Впиши больший корень.`,
      },
      ...num(big),
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
    const a = rnd(2, 6);
    const b = rnd(2, 4);
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
} satisfies Record<string, () => Exercise>;

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
