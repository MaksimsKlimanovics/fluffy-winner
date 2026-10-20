import type { GeneratorId } from "./exercises";
import type { T } from "./i18n";
import { MORE_CASES, type RealCase } from "./real-life";

/**
 * Topics follow the Skola2030 basic education standard for mathematics
 * (Cabinet Regulation No. 747, Annex 6). Every topic lists the standard's
 * outcome codes it builds towards — see lib/skola2030.ts. Each topic answers
 * three questions for the child: why do I need this, where do I meet it in real life, and how does it work —
 * then lets them touch it (widget) and practise it (generator).
 */
export type WidgetId =
  | "numberLine"
  | "coins"
  | "shapes"
  | "clock"
  | "multGrid"
  | "areaGrid"
  | "fractionPizza"
  | "angle"
  | "percentBar"
  | "circle"
  | "balance"
  | "triangle"
  | "linearGraph"
  | "pythagoras"
  | "parabola"
  | "trig"
  | "barChart"
  | "coordPlane";

export type Topic = {
  id: string;
  title: T;
  icon: string;
  kind: "algebra" | "geometry" | "data";
  why: T;
  /** The main real-life case; more in lib/real-life.ts, all of them via realCases(). */
  realCase: RealCase;
  theory: T[];
  formula?: string;
  widget?: WidgetId;
  generator: GeneratorId;
  /** Outcome codes from MK Nr. 747 Annex 6 for this grade's stage (see lib/skola2030.ts). */
  skola2030: string[];
  askAi: T[];
};

export type Grade = {
  grade: number;
  title: T;
  subtitle: T;
  color: string;
  topics: Topic[];
};

export const GRADES: Grade[] = [
  {
    grade: 1,
    title: { lv: "Pirmie soļi", ru: "Первые шаги" },
    subtitle: { lv: "Skaitļi līdz 20, figūras, virknes, nauda", ru: "Числа до 20, фигуры, ряды, деньги" },
    color: "#ff8a3d",
    topics: [
      {
        id: "saskaitisana-20",
        title: { lv: "Saskaitīšana līdz 20", ru: "Сложение до 20" },
        icon: "➕",
        kind: "algebra",
        why: {
          lv: "Saskaitīšana palīdz uzzināt, cik kaut kā ir kopā — konfekšu, draugu, punktu spēlē.",
          ru: "Сложение помогает узнать, сколько всего чего-то — конфет, друзей, очков в игре.",
        },
        realCase: {
          title: { lv: "Ogošana mežā", ru: "Сбор ягод в лесу" },
          text: {
            lv: "Tu salasīji 7 zemenes, bet māsa — 5. Lai godīgi sadalītu ievārījumam, vispirms jāzina, cik ir kopā: 7 + 5 = 12.",
            ru: "Ты собрал 7 земляничек, а сестра — 5. Чтобы честно поделить на варенье, сначала надо узнать, сколько всего: 7 + 5 = 12.",
          },
        },
        theory: [
          { lv: "Saskaitīt nozīmē apvienot divas grupas vienā.", ru: "Сложить — значит объединить две группы в одну." },
          { lv: "Uz skaitļu ass saskaitīšana ir solis pa labi.", ru: "На числовой оси сложение — это шаг вправо." },
          { lv: "Saskaitāmos var mainīt vietām: 3 + 8 = 8 + 3.", ru: "Слагаемые можно менять местами: 3 + 8 = 8 + 3." },
        ],
        formula: "a + b = b + a",
        widget: "numberLine",
        generator: "add20",
        skola2030: ["3.2.2", "1.2.2", "3.3.1"],
        askAi: [
          { lv: "Kāpēc 8 + 5 ir tas pats, kas 5 + 8?", ru: "Почему 8 + 5 — то же самое, что 5 + 8?" },
          { lv: "Kā ātri saskaitīt 9 + 7?", ru: "Как быстро сложить 9 + 7?" },
        ],
      },
      {
        id: "atnemsana-20",
        title: { lv: "Atņemšana līdz 20", ru: "Вычитание до 20" },
        icon: "➖",
        kind: "algebra",
        why: {
          lv: "Atņemšana pasaka, cik palika vai cik vēl trūkst.",
          ru: "Вычитание говорит, сколько осталось или сколько ещё не хватает.",
        },
        realCase: {
          title: { lv: "Dzimšanas dienas kūka", ru: "Торт на день рождения" },
          text: {
            lv: "Kūkai bija 16 gabaliņi. Viesi apēda 9. Vai pietiks vēl 6 draugiem, kuri nāks vēlāk? 16 − 9 = 7 — pietiks!",
            ru: "В торте было 16 кусочков. Гости съели 9. Хватит ли ещё 6 друзьям, которые придут позже? 16 − 9 = 7 — хватит!",
          },
        },
        theory: [
          { lv: "Atņemt nozīmē noņemt daļu no kopuma.", ru: "Вычесть — значит убрать часть из целого." },
          { lv: "Uz skaitļu ass atņemšana ir solis pa kreisi.", ru: "На числовой оси вычитание — шаг влево." },
          { lv: "Pārbaude: ja 12 − 5 = 7, tad 7 + 5 = 12.", ru: "Проверка: если 12 − 5 = 7, то 7 + 5 = 12." },
        ],
        widget: "numberLine",
        generator: "sub20",
        skola2030: ["3.2.2", "1.2.2", "3.3.1"],
        askAi: [{ lv: "Kā pārbaudīt atņemšanu ar saskaitīšanu?", ru: "Как проверить вычитание сложением?" }],
      },
      {
        id: "figuras",
        title: { lv: "Ģeometriskās figūras", ru: "Геометрические фигуры" },
        icon: "🔺",
        kind: "geometry",
        why: {
          lv: "Figūras ir visur: logi ir taisnstūri, riteņi — apļi, jumti — trijstūri. Pazīstot tās, vari zīmēt, būvēt un konstruēt.",
          ru: "Фигуры повсюду: окна — прямоугольники, колёса — круги, крыши — треугольники. Зная их, можно рисовать, строить и конструировать.",
        },
        realCase: {
          title: { lv: "Kāpēc riteņi ir apaļi?", ru: "Почему колёса круглые?" },
          text: {
            lv: "Aplim visi punkti ir vienādā attālumā no centra, tāpēc ass vienmēr ir vienā augstumā un brauciens ir gluds. Kvadrātveida ritenis lēkātu!",
            ru: "У круга все точки на одинаковом расстоянии от центра, поэтому ось всегда на одной высоте и ехать плавно. Квадратное колесо прыгало бы!",
          },
        },
        theory: [
          { lv: "Trijstūrim ir 3 malas un 3 stūri.", ru: "У треугольника 3 стороны и 3 угла." },
          { lv: "Kvadrātam visas 4 malas ir vienādas.", ru: "У квадрата все 4 стороны равны." },
          { lv: "Aplim nav stūru.", ru: "У круга нет углов." },
        ],
        widget: "shapes",
        generator: "shapes",
        skola2030: ["6.1.1", "6.1.2"],
        askAi: [{ lv: "Kur mājās var atrast trijstūri?", ru: "Где дома можно найти треугольник?" }],
      },
      {
        id: "virknes",
        title: { lv: "Skaitļu virknes", ru: "Числовые ряды" },
        icon: "🪜",
        kind: "algebra",
        why: {
          lv: "Likumsakarības palīdz paredzēt, kas būs tālāk: mājas numurus ielā, rakstu uz džempera, kāpņu pakāpienus.",
          ru: "Закономерности помогают предсказать, что будет дальше: номера домов на улице, узор на свитере, ступеньки лестницы.",
        },
        realCase: {
          title: { lv: "Māju numuri ielā", ru: "Номера домов на улице" },
          text: {
            lv: "Vienā ielas pusē mājām ir numuri 2, 4, 6, 8… Ja tu stāvi pie 8. mājas, nākamā būs 10 — katru reizi par 2 vairāk!",
            ru: "На одной стороне улицы дома имеют номера 2, 4, 6, 8… Если ты стоишь у дома 8, следующий будет 10 — каждый раз на 2 больше!",
          },
        },
        theory: [
          { lv: "Virknē skaitļi seko viens otram pēc noteikuma.", ru: "В ряду числа следуют друг за другом по правилу." },
          { lv: "Lai atrastu noteikumu, salīdzini blakus skaitļus: par cik tie atšķiras?", ru: "Чтобы найти правило, сравни соседние числа: на сколько они отличаются?" },
        ],
        widget: "numberLine",
        generator: "sequence",
        skola2030: ["4.1.1"],
        askAi: [{ lv: "Kā izdomāt pašam savu virkni?", ru: "Как придумать свой собственный ряд?" }],
      },
      {
        id: "nauda-1",
        title: { lv: "Nauda: eiro un centi", ru: "Деньги: евро и центы" },
        icon: "🪙",
        kind: "algebra",
        why: {
          lv: "Prast skaitīt naudu nozīmē droši iepirkties un krāt savam sapnim.",
          ru: "Уметь считать деньги — значит уверенно делать покупки и копить на мечту.",
        },
        realCase: {
          title: { lv: "Krājkasīte", ru: "Копилка" },
          text: {
            lv: "Tu gribi nopirkt uzlīmju albumu par 50 centiem. Krājkasītē ir 20 c, 20 c un 10 c monētas. 20 + 20 + 10 = 50 — tieši pietiek!",
            ru: "Ты хочешь купить альбом наклеек за 50 центов. В копилке монеты 20 ц, 20 ц и 10 ц. 20 + 20 + 10 = 50 — как раз хватает!",
          },
        },
        theory: [
          { lv: "1 eiro = 100 centi.", ru: "1 евро = 100 центов." },
          { lv: "Monētas: 1, 2, 5, 10, 20, 50 c, 1 € un 2 €.", ru: "Монеты: 1, 2, 5, 10, 20, 50 ц, 1 € и 2 €." },
        ],
        widget: "coins",
        generator: "coins",
        skola2030: ["3.1.3", "3.2.4", "5.3.4"],
        askAi: [{ lv: "Kā ar vismazāk monētām samaksāt 38 centus?", ru: "Как заплатить 38 центов наименьшим числом монет?" }],
      },
    ],
  },
  {
    grade: 2,
    title: { lv: "Skaitļi līdz 100", ru: "Числа до 100" },
    subtitle: { lv: "Desmiti, reizināšana, laiks, mērvienības", ru: "Десятки, умножение, время, единицы измерения" },
    color: "#ffb703",
    topics: [
      {
        id: "saskaitisana-100",
        title: { lv: "Saskaitīšana līdz 100", ru: "Сложение до 100" },
        icon: "🚋",
        kind: "algebra",
        why: {
          lv: "Lielākus skaitļus saskaitām, kad skaitām pasažierus, punktus vai lappuses grāmatā.",
          ru: "Большие числа складываем, когда считаем пассажиров, очки или страницы в книге.",
        },
        realCase: {
          title: { lv: "Tramvajs Nr. 11", ru: "Трамвай № 11" },
          text: {
            lv: "Vadītājam jāzina, vai tramvajā vēl ir vieta: tajā bija 46 cilvēki, iekāpa 27. 40 + 20 = 60, 6 + 7 = 13, kopā 73.",
            ru: "Водителю нужно знать, есть ли ещё место: в трамвае было 46 человек, вошли 27. 40 + 20 = 60, 6 + 7 = 13, всего 73.",
          },
        },
        theory: [
          { lv: "Skaitlis sastāv no desmitiem un vieniniekiem: 46 = 4 desmiti + 6 vieninieki.", ru: "Число состоит из десятков и единиц: 46 = 4 десятка + 6 единиц." },
          { lv: "Ja vieninieku ir vairāk par 9, tie veido jaunu desmitu.", ru: "Если единиц больше 9, они образуют новый десяток." },
        ],
        widget: "numberLine",
        generator: "add100",
        skola2030: ["3.2.1", "3.1.1", "3.3.1"],
        askAi: [{ lv: "Kā saskaitīt 38 + 47 galvā?", ru: "Как сложить 38 + 47 в уме?" }],
      },
      {
        id: "reizinasana-intro",
        title: { lv: "Reizināšanas sākums", ru: "Начало умножения" },
        icon: "✖️",
        kind: "algebra",
        why: {
          lv: "Reizināšana ir ātrs veids, kā saskaitīt vienādas grupas — nav jāskaita katrs priekšmets.",
          ru: "Умножение — быстрый способ сложить одинаковые группы, не пересчитывая каждый предмет.",
        },
        realCase: {
          title: { lv: "Olu kastīte", ru: "Коробка яиц" },
          text: {
            lv: "Kastītē ir 2 rindas pa 5 olām. Nav jāskaita 1, 2, 3… — 2 · 5 = 10.",
            ru: "В коробке 2 ряда по 5 яиц. Не нужно считать 1, 2, 3… — 2 · 5 = 10.",
          },
        },
        theory: [
          { lv: "3 · 4 nozīmē 4 + 4 + 4.", ru: "3 · 4 означает 4 + 4 + 4." },
          { lv: "Reizinātājus var mainīt vietām: 3 · 4 = 4 · 3.", ru: "Множители можно менять местами: 3 · 4 = 4 · 3." },
        ],
        widget: "multGrid",
        generator: "multSmall",
        skola2030: ["3.2.2", "1.1.2"],
        askAi: [{ lv: "Kāpēc 3 · 4 ir tas pats, kas 4 · 3?", ru: "Почему 3 · 4 — то же, что 4 · 3?" }],
      },
      {
        id: "pulkstenis",
        title: { lv: "Pulkstenis un laiks", ru: "Часы и время" },
        icon: "⏰",
        kind: "algebra",
        why: {
          lv: "Laiks palīdz nenokavēt skolu, autobusu un mīļāko multfilmu.",
          ru: "Время помогает не опоздать в школу, на автобус и на любимый мультфильм.",
        },
        realCase: {
          title: { lv: "Uz treniņu", ru: "На тренировку" },
          text: {
            lv: "Treniņš sākas 16:30, ceļā jāpavada 20 minūtes. Lai nenokavētu, jāiziet ne vēlāk kā 16:10.",
            ru: "Тренировка начинается в 16:30, на дорогу нужно 20 минут. Чтобы не опоздать, выйти надо не позже 16:10.",
          },
        },
        theory: [
          { lv: "Īsais rādītājs rāda stundas, garais — minūtes.", ru: "Короткая стрелка показывает часы, длинная — минуты." },
          { lv: "1 stunda = 60 minūtes; diennaktī ir 24 stundas.", ru: "1 час = 60 минут; в сутках 24 часа." },
        ],
        widget: "clock",
        generator: "clock",
        skola2030: ["5.3.3", "5.3.4"],
        askAi: [{ lv: "Kā saprast, cik ir “bez ceturkšņa trīs”?", ru: "Как понять, сколько это «без четверти три»?" }],
      },
      {
        id: "nauda-2",
        title: { lv: "Iepirkšanās un atlikums", ru: "Покупки и сдача" },
        icon: "🛒",
        kind: "algebra",
        why: {
          lv: "Ja proti aprēķināt atlikumu, vari pārbaudīt, vai pārdevējs nav kļūdījies.",
          ru: "Если умеешь считать сдачу, можешь проверить, не ошибся ли продавец.",
        },
        realCase: {
          title: { lv: "Saldējums jūrmalā", ru: "Мороженое в Юрмале" },
          text: {
            lv: "Saldējums maksā 1,35 €, tu dod 2 €. Atlikums: 200 c − 135 c = 65 c.",
            ru: "Мороженое стоит 1,35 €, ты даёшь 2 €. Сдача: 200 ц − 135 ц = 65 ц.",
          },
        },
        theory: [
          { lv: "Atlikums = samaksāts − cena.", ru: "Сдача = заплачено − цена." },
          { lv: "Ērti visu pārvērst centos.", ru: "Удобно всё перевести в центы." },
        ],
        widget: "coins",
        generator: "change",
        skola2030: ["3.2.4", "3.1.3", "5.3.4"],
        askAi: [{ lv: "Kā ātri izrēķināt atlikumu no 5 eiro?", ru: "Как быстро посчитать сдачу с 5 евро?" }],
      },
      {
        id: "mervienibas",
        title: { lv: "Mērvienības", ru: "Единицы измерения" },
        icon: "📏",
        kind: "geometry",
        why: {
          lv: "Receptēs, veikalā un sportā lielumus mēra dažādās vienībās — jāprot tās pārvērst, lai salīdzinātu.",
          ru: "В рецептах, магазине и спорте величины измеряют в разных единицах — нужно уметь их переводить, чтобы сравнивать.",
        },
        realCase: {
          title: { lv: "Vai gulta ielīdīs?", ru: "Поместится ли кровать?" },
          text: {
            lv: "Gulta ir 2 m 5 cm gara, bet siena — 210 cm. 2 m 5 cm = 205 cm, un 205 < 210 — ielīdīs!",
            ru: "Кровать длиной 2 м 5 см, а стена — 210 см. 2 м 5 см = 205 см, и 205 < 210 — поместится!",
          },
        },
        theory: [
          { lv: "1 m = 100 cm, 1 cm = 10 mm, 1 km = 1000 m.", ru: "1 м = 100 см, 1 см = 10 мм, 1 км = 1000 м." },
          { lv: "1 kg = 1000 g; 1 h = 60 min; 1 € = 100 c.", ru: "1 кг = 1000 г; 1 ч = 60 мин; 1 € = 100 ц." },
          { lv: "Lielāku vienību pārvēršot mazākā, skaitlis kļūst lielāks.", ru: "При переводе крупной единицы в мелкую число становится больше." },
        ],
        generator: "units",
        skola2030: ["5.3.4", "1.1.2"],
        askAi: [{ lv: "Kāpēc 1 m ir tieši 100 cm?", ru: "Почему в 1 м ровно 100 см?" }],
      },
    ],
  },
  {
    grade: 3,
    title: { lv: "Reizrēķins", ru: "Таблица умножения" },
    subtitle: { lv: "Reizināšana, dalīšana, perimetrs, diagrammas", ru: "Умножение, деление, периметр, диаграммы" },
    color: "#2ec4b6",
    topics: [
      {
        id: "reizrekins",
        title: { lv: "Reizināšanas tabula", ru: "Таблица умножения" },
        icon: "🧮",
        kind: "algebra",
        why: {
          lv: "Reizrēķins ir matemātikas “alfabēts” — bez tā grūti dalīt, rēķināt laukumu un procentus.",
          ru: "Таблица умножения — «алфавит» математики: без неё трудно делить, считать площадь и проценты.",
        },
        realCase: {
          title: { lv: "Klases ekskursija", ru: "Экскурсия класса" },
          text: {
            lv: "Siguldas bobsleja trasē biļete maksā 7 €. Klasē ir 8 skolēni grupā — 8 · 7 = 56 €. Skolotāja to izrēķina sekundē!",
            ru: "Билет на бобслейную трассу в Сигулде стоит 7 €. В группе 8 учеников — 8 · 7 = 56 €. Учительница считает это за секунду!",
          },
        },
        theory: [
          { lv: "Reizinājums ir taisnstūris: 6 · 7 = 6 rindas pa 7.", ru: "Произведение — это прямоугольник: 6 · 7 = 6 рядов по 7." },
          { lv: "Triks ar 9: 9 · 7 = 70 − 7 = 63.", ru: "Трюк с 9: 9 · 7 = 70 − 7 = 63." },
        ],
        widget: "multGrid",
        generator: "multTable",
        skola2030: ["3.2.2", "3.2.1"],
        askAi: [{ lv: "Kā vieglāk iemācīties reizrēķinu ar 7?", ru: "Как легче выучить умножение на 7?" }],
      },
      {
        id: "dalisana",
        title: { lv: "Dalīšana", ru: "Деление" },
        icon: "🍬",
        kind: "algebra",
        why: {
          lv: "Dalīšana palīdz godīgi sadalīt — konfektes, laiku, naudu.",
          ru: "Деление помогает делить честно — конфеты, время, деньги.",
        },
        realCase: {
          title: { lv: "Picas vakars", ru: "Вечер пиццы" },
          text: {
            lv: "3 picas pa 8 gabaliem = 24 gabali. Jūs esat 6 draugi: 24 : 6 = 4 gabali katram.",
            ru: "3 пиццы по 8 кусков = 24 куска. Вас 6 друзей: 24 : 6 = 4 куска каждому.",
          },
        },
        theory: [
          { lv: "Dalīšana ir pretēja reizināšanai: 24 : 6 = 4, jo 6 · 4 = 24.", ru: "Деление обратно умножению: 24 : 6 = 4, потому что 6 · 4 = 24." },
          { lv: "Ar nulli dalīt nedrīkst!", ru: "Делить на ноль нельзя!" },
        ],
        widget: "multGrid",
        generator: "divTable",
        skola2030: ["3.2.1", "3.2.2"],
        askAi: [{ lv: "Kāpēc nevar dalīt ar nulli?", ru: "Почему нельзя делить на ноль?" }],
      },
      {
        id: "perimetrs",
        title: { lv: "Perimetrs", ru: "Периметр" },
        icon: "🏡",
        kind: "geometry",
        why: {
          lv: "Perimetrs pasaka, cik garš ir figūras “apvalks” — cik žoga, apmales vai lentes vajag.",
          ru: "Периметр говорит, какой длины «обводка» фигуры — сколько нужно забора, бордюра или ленты.",
        },
        realCase: {
          title: { lv: "Žogs vecmāmiņas dārzā", ru: "Забор у бабушки на даче" },
          text: {
            lv: "Dobe ir 6 m × 4 m. Žogs: 6 + 4 + 6 + 4 = 20 m. Ja nopirktu tikai 10 m, puse dobes paliktu zaķiem!",
            ru: "Грядка 6 м × 4 м. Забор: 6 + 4 + 6 + 4 = 20 м. Если купить только 10 м, половина грядки достанется зайцам!",
          },
        },
        theory: [
          { lv: "Perimetrs = visu malu summa.", ru: "Периметр = сумма всех сторон." },
          { lv: "Taisnstūrim P = 2 · (a + b).", ru: "Для прямоугольника P = 2 · (a + b)." },
        ],
        formula: "P = 2(a + b)",
        widget: "areaGrid",
        generator: "perimeter",
        skola2030: ["6.4.2"],
        askAi: [{ lv: "Vai divām figūrām ar vienādu perimetru ir vienāds laukums?", ru: "Если у двух фигур одинаковый периметр, равны ли их площади?" }],
      },
      {
        id: "skaitli-1000",
        title: { lv: "Skaitļi līdz 1000", ru: "Числа до 1000" },
        icon: "🗺️",
        kind: "algebra",
        why: {
          lv: "Ar simtiem rēķinām attālumus, cenas un iedzīvotājus.",
          ru: "Сотнями считаем расстояния, цены и жителей.",
        },
        realCase: {
          title: { lv: "Ceļojums pa Latviju", ru: "Путешествие по Латвии" },
          text: {
            lv: "Rīga → Liepāja ~220 km, Liepāja → Ventspils ~120 km. Kopā 340 km — vai pietiks ar vienu degvielas bāku?",
            ru: "Рига → Лиепая ~220 км, Лиепая → Вентспилс ~120 км. Всего 340 км — хватит ли одного бака?",
          },
        },
        theory: [
          { lv: "Skaitlis 347 = 3 simti + 4 desmiti + 7 vieninieki.", ru: "Число 347 = 3 сотни + 4 десятка + 7 единиц." },
        ],
        widget: "numberLine",
        generator: "add1000",
        skola2030: ["3.1.1", "3.2.1"],
        askAi: [{ lv: "Kā noapaļot 347 līdz desmitiem?", ru: "Как округлить 347 до десятков?" }],
      },
      {
        id: "diagrammas",
        title: { lv: "Tabulas un stabiņu diagrammas", ru: "Таблицы и столбчатые диаграммы" },
        icon: "📊",
        kind: "data",
        why: {
          lv: "Diagramma ļauj ar vienu skatienu redzēt, kā ir visvairāk un kā vismazāk — laika ziņās, sporta rezultātos, aptaujās.",
          ru: "Диаграмма позволяет одним взглядом увидеть, чего больше всего и меньше всего — в прогнозе погоды, спорте, опросах.",
        },
        realCase: {
          title: { lv: "Klases ekskursijas balsojums", ru: "Голосование за экскурсию" },
          text: {
            lv: "Klase balso: zoodārzs 9, Rundāles pils 6, akvaparks 11. Stabiņu diagrammā uzreiz redzams, ka uzvar akvaparks — par 2 balsīm vairāk nekā zoodārzs.",
            ru: "Класс голосует: зоопарк 9, Рундальский дворец 6, аквапарк 11. На столбчатой диаграмме сразу видно, что побеждает аквапарк — на 2 голоса больше, чем зоопарк.",
          },
        },
        theory: [
          { lv: "Tabulā datus pieraksta rindās un kolonnās.", ru: "В таблице данные записывают в строках и столбцах." },
          { lv: "Stabiņu diagrammā katra stabiņa augstums parāda skaitu.", ru: "На столбчатой диаграмме высота каждого столбика показывает количество." },
        ],
        widget: "barChart",
        generator: "chart",
        skola2030: ["5.1.2", "5.1.3", "5.1.4"],
        askAi: [{ lv: "Kā uzzīmēt stabiņu diagrammu?", ru: "Как нарисовать столбчатую диаграмму?" }],
      },
    ],
  },
  {
    grade: 4,
    title: { lv: "Daļas un laukums", ru: "Дроби и площадь" },
    subtitle: { lv: "Daļas, laukums, rakstu reizināšana", ru: "Дроби, площадь, умножение столбиком" },
    color: "#4cc9f0",
    topics: [
      {
        id: "dalas-intro",
        title: { lv: "Daļas", ru: "Дроби" },
        icon: "🍕",
        kind: "algebra",
        why: {
          lv: "Daļas palīdz runāt par to, kas nav vesels: puse picas, ceturtdaļa stundas.",
          ru: "Дроби помогают говорить о том, что не целое: половина пиццы, четверть часа.",
        },
        realCase: {
          title: { lv: "Ceturtdaļa stundas", ru: "Четверть часа" },
          text: {
            lv: "“Gaidi ceturtdaļu stundas” = 1/4 no 60 min = 15 min. Daļas ir pat pulkstenī!",
            ru: "«Подожди четверть часа» = 1/4 от 60 мин = 15 мин. Дроби есть даже в часах!",
          },
        },
        theory: [
          { lv: "Saucējs (apakšā) — cik daļās sadalīts veselais.", ru: "Знаменатель (внизу) — на сколько частей разделено целое." },
          { lv: "Skaitītājs (augšā) — cik daļas paņemtas.", ru: "Числитель (вверху) — сколько частей взято." },
        ],
        formula: "a/b",
        widget: "fractionPizza",
        generator: "fractionOf",
        skola2030: ["3.2.4", "1.2.2"],
        askAi: [{ lv: "Kas ir lielāks — 1/3 vai 1/4?", ru: "Что больше — 1/3 или 1/4?" }],
      },
      {
        id: "laukums",
        title: { lv: "Laukums", ru: "Площадь" },
        icon: "🟩",
        kind: "geometry",
        why: {
          lv: "Laukums pasaka, cik vietas aizņem virsma — cik krāsas, flīžu vai paklāja vajag.",
          ru: "Площадь говорит, сколько места занимает поверхность — сколько нужно краски, плитки или ковра.",
        },
        realCase: {
          title: { lv: "Jauna grīda tavā istabā", ru: "Новый пол в твоей комнате" },
          text: {
            lv: "Istaba 4 m × 3 m = 12 m². Lamināts 10 €/m² → 120 €. Bez laukuma vecāki nopirktu par daudz vai par maz!",
            ru: "Комната 4 м × 3 м = 12 м². Ламинат 10 €/м² → 120 €. Без площади родители купили бы слишком много или мало!",
          },
        },
        theory: [
          { lv: "Laukumu mēra kvadrātvienībās: cm², m².", ru: "Площадь измеряют в квадратных единицах: см², м²." },
          { lv: "Taisnstūrim S = a · b.", ru: "Для прямоугольника S = a · b." },
        ],
        formula: "S = a · b",
        widget: "areaGrid",
        generator: "areaRect",
        skola2030: ["6.4.1", "5.3.2", "2.3.3"],
        askAi: [{ lv: "Kāpēc laukumu mēra kvadrātmetros?", ru: "Почему площадь измеряют в квадратных метрах?" }],
      },
      {
        id: "rakstu-reizinasana",
        title: { lv: "Reizināšana rakstos", ru: "Умножение столбиком" },
        icon: "🚌",
        kind: "algebra",
        why: {
          lv: "Ar lieliem skaitļiem galvā ir grūti — rakstu metode strādā vienmēr.",
          ru: "С большими числами в уме сложно — метод столбиком работает всегда.",
        },
        realCase: {
          title: { lv: "Autobusi ekskursijai", ru: "Автобусы для экскурсии" },
          text: {
            lv: "4 autobusi pa 48 vietām: 40 · 4 = 160, 8 · 4 = 32, kopā 192 vietas.",
            ru: "4 автобуса по 48 мест: 40 · 4 = 160, 8 · 4 = 32, всего 192 места.",
          },
        },
        theory: [
          { lv: "Sadali skaitli desmitos un vieniniekos, reizini katru un saskaiti.", ru: "Разложи число на десятки и единицы, умножь каждое и сложи." },
        ],
        widget: "multGrid",
        generator: "longMult",
        skola2030: ["3.2.1", "3.2.3"],
        askAi: [{ lv: "Parādi soli pa solim 36 · 7", ru: "Покажи по шагам 36 · 7" }],
      },
    ],
  },
  {
    grade: 5,
    title: { lv: "Decimāldaļas un leņķi", ru: "Десятичные дроби и углы" },
    subtitle: { lv: "Decimāldaļas, daļas, leņķi, ātrums, pirmskaitļi", ru: "Десятичные, дроби, углы, скорость, простые числа" },
    color: "#4361ee",
    topics: [
      {
        id: "decimaldalas",
        title: { lv: "Decimāldaļas", ru: "Десятичные дроби" },
        icon: "🧾",
        kind: "algebra",
        why: {
          lv: "Cenas, svars un laiks sportā tiek rakstīti ar komatu: 2,49 €, 1,5 kg, 9,58 s.",
          ru: "Цены, вес и время в спорте пишут с запятой: 2,49 €, 1,5 кг, 9,58 с.",
        },
        realCase: {
          title: { lv: "Veikala čeks", ru: "Чек из магазина" },
          text: {
            lv: "Maize 1,29 € + piens 0,99 € + āboli 2,15 € = 4,43 €. Pārbaudi čeku — kases aparāts arī var kļūdīties!",
            ru: "Хлеб 1,29 € + молоко 0,99 € + яблоки 2,15 € = 4,43 €. Проверь чек — касса тоже может ошибиться!",
          },
        },
        theory: [
          { lv: "0,1 = 1/10; 0,01 = 1/100.", ru: "0,1 = 1/10; 0,01 = 1/100." },
          { lv: "Saskaitot komatus raksta vienu zem otra.", ru: "При сложении запятые пишут одну под другой." },
        ],
        widget: "numberLine",
        generator: "decimals",
        skola2030: ["3.1.1", "3.2.1", "3.2.6"],
        askAi: [{ lv: "Kāpēc 0,5 ir tas pats, kas 1/2?", ru: "Почему 0,5 — это то же, что 1/2?" }],
      },
      {
        id: "dalu-saskaitisana",
        title: { lv: "Daļu saskaitīšana", ru: "Сложение дробей" },
        icon: "🥧",
        kind: "algebra",
        why: {
          lv: "Receptēs, mūzikā un mērījumos daļas bieži jāsaskaita.",
          ru: "В рецептах, музыке и измерениях дроби часто нужно складывать.",
        },
        realCase: {
          title: { lv: "Mūzikas takts", ru: "Музыкальный такт" },
          text: {
            lv: "Taktī 4/4: ceturtdaļnots (1/4) + pusnots (2/4) + ceturtdaļnots (1/4) = 4/4 — takts pilna!",
            ru: "В такте 4/4: четверть (1/4) + половинная (2/4) + четверть (1/4) = 4/4 — такт заполнен!",
          },
        },
        theory: [
          { lv: "Ar vienādiem saucējiem saskaita skaitītājus: 2/8 + 3/8 = 5/8.", ru: "При одинаковых знаменателях складывают числители: 2/8 + 3/8 = 5/8." },
          { lv: "Ar dažādiem saucējiem vispirms jāatrod kopsaucējs.", ru: "При разных знаменателях сначала находят общий знаменатель." },
        ],
        formula: "a/n + b/n = (a+b)/n",
        widget: "fractionPizza",
        generator: "fractionAdd",
        skola2030: ["3.2.1", "1.2.2"],
        askAi: [{ lv: "Kā saskaitīt 1/2 un 1/3?", ru: "Как сложить 1/2 и 1/3?" }],
      },
      {
        id: "lenki",
        title: { lv: "Leņķi", ru: "Углы" },
        icon: "📐",
        kind: "geometry",
        why: {
          lv: "Leņķi nosaka, kā stāv kāpnes, kā krīt bumba un kā pagriežas ritenis.",
          ru: "Углы определяют, как стоит лестница, как летит мяч и как поворачивает руль.",
        },
        realCase: {
          title: { lv: "Skeitparka rampa", ru: "Рампа в скейт-парке" },
          text: {
            lv: "Rampa 15° leņķī — iesācējiem, 45° — profiem. Pārāk stāva rampa ir bīstama, tāpēc būvnieki leņķi mēra ar transportieri.",
            ru: "Рампа под 15° — для новичков, 45° — для профи. Слишком крутая рампа опасна, поэтому строители измеряют угол транспортиром.",
          },
        },
        theory: [
          { lv: "Šaurs leņķis < 90°, taisns = 90°, plats > 90°, izstiepts = 180°.", ru: "Острый < 90°, прямой = 90°, тупой > 90°, развёрнутый = 180°." },
          { lv: "Pilns apgrieziens = 360°.", ru: "Полный оборот = 360°." },
        ],
        widget: "angle",
        generator: "angles",
        skola2030: ["6.1.3", "5.3.1", "6.4.1"],
        askAi: [{ lv: "Kāpēc pilnā aplī ir tieši 360 grādi?", ru: "Почему в полном круге именно 360 градусов?" }],
      },
      {
        id: "atrums",
        title: { lv: "Ātrums, ceļš un laiks", ru: "Скорость, путь и время" },
        icon: "🚆",
        kind: "algebra",
        why: {
          lv: "Ātrums palīdz plānot: kad jāiziet, lai paspētu uz vilcienu, un cik ilgi ies pārgājiens.",
          ru: "Скорость помогает планировать: когда выйти, чтобы успеть на поезд, и сколько продлится поход.",
        },
        realCase: {
          title: { lv: "Pārgājiens Gaujas nacionālajā parkā", ru: "Поход в Национальном парке Гауя" },
          text: {
            lv: "Taka ir 12 km gara, tu ej ar ātrumu 4 km/h. Laiks t = 12 : 4 = 3 stundas — tātad jāsāk ne vēlāk kā 3 stundas pirms tumsas.",
            ru: "Тропа длиной 12 км, ты идёшь со скоростью 4 км/ч. Время t = 12 : 4 = 3 часа — значит, начать нужно не позже чем за 3 часа до темноты.",
          },
        },
        theory: [
          { lv: "Ceļš = ātrums · laiks (s = v · t).", ru: "Путь = скорость · время (s = v · t)." },
          { lv: "Ja zināmi divi lielumi, trešo var aprēķināt: v = s : t, t = s : v.", ru: "Если известны две величины, третью можно найти: v = s : t, t = s : v." },
          { lv: "Ātrumu mēra km/h vai m/s.", ru: "Скорость измеряют в км/ч или м/с." },
        ],
        formula: "s = v · t",
        generator: "speed",
        skola2030: ["4.2.3", "5.3.2"],
        askAi: [{ lv: "Kā pārvērst km/h par m/s?", ru: "Как перевести км/ч в м/с?" }],
      },
      {
        id: "pirmskaitli",
        title: { lv: "Pirmskaitļi un saliktie skaitļi", ru: "Простые и составные числа" },
        icon: "🧩",
        kind: "algebra",
        why: {
          lv: "Dalītāji palīdz sadalīt lietas vienādās grupās, bet pirmskaitļi ir pamatā šifrēšanai, kas sargā tavas paroles internetā.",
          ru: "Делители помогают делить вещи на равные группы, а простые числа лежат в основе шифрования, защищающего твои пароли в интернете.",
        },
        realCase: {
          title: { lv: "Krēslu rindas zālē", ru: "Ряды стульев в зале" },
          text: {
            lv: "24 krēslus var salikt 2·12, 3·8, 4·6 rindās. Bet 23 krēslus vienādās rindās salikt nevar — 23 ir pirmskaitlis!",
            ru: "24 стула можно расставить рядами 2·12, 3·8, 4·6. А 23 стула поровну по рядам не расставить — 23 простое число!",
          },
        },
        theory: [
          { lv: "Pirmskaitlis dalās tikai ar 1 un pats ar sevi (2, 3, 5, 7, 11…).", ru: "Простое число делится только на 1 и на себя (2, 3, 5, 7, 11…)." },
          { lv: "Saliktam skaitlim ir vēl citi dalītāji (piem., 15 = 3 · 5).", ru: "У составного числа есть и другие делители (напр., 15 = 3 · 5)." },
          { lv: "Dalāmības pazīmes: ar 2 — pāra skaitlis; ar 3 — ciparu summa dalās ar 3; ar 5 — beidzas ar 0 vai 5.", ru: "Признаки делимости: на 2 — чётное; на 3 — сумма цифр делится на 3; на 5 — оканчивается на 0 или 5." },
        ],
        widget: "multGrid",
        generator: "primes",
        skola2030: ["3.1.4", "2.1.3"],
        askAi: [{ lv: "Kāpēc 1 nav pirmskaitlis?", ru: "Почему 1 не простое число?" }],
      },
    ],
  },
  {
    grade: 6,
    title: { lv: "Procenti un proporcijas", ru: "Проценты и пропорции" },
    subtitle: { lv: "Procenti, proporcijas, negatīvi skaitļi, koordinātas, vidējais", ru: "Проценты, пропорции, отрицательные, координаты, среднее" },
    color: "#7b2ff7",
    topics: [
      {
        id: "procenti",
        title: { lv: "Procenti", ru: "Проценты" },
        icon: "🏷️",
        kind: "algebra",
        why: {
          lv: "Atlaides, akumulatora uzlāde, atzīmes testos un banku procenti — visur ir %.",
          ru: "Скидки, заряд батареи, баллы за тесты и проценты в банке — везде %.",
        },
        realCase: {
          title: { lv: "Melnā piektdiena", ru: "Чёрная пятница" },
          text: {
            lv: "Austiņas 80 € ar −25% atlaidi: 25% no 80 = 20 €, cena 60 €. Bet uzmanies: “−25%, tad vēl −10%” nav −35%!",
            ru: "Наушники 80 € со скидкой −25%: 25% от 80 = 20 €, цена 60 €. Но осторожно: «−25%, потом ещё −10%» — это не −35%!",
          },
        },
        theory: [
          { lv: "1% = 1/100 daļa no skaitļa.", ru: "1% = 1/100 часть числа." },
          { lv: "p% no A = A · p : 100.", ru: "p% от A = A · p : 100." },
        ],
        formula: "p% · A = A · p / 100",
        widget: "percentBar",
        generator: "percentOf",
        skola2030: ["3.2.4", "3.2.2"],
        askAi: [{ lv: "Kāpēc −25% un tad −10% nav −35%?", ru: "Почему −25% и потом −10% — это не −35%?" }],
      },
      {
        id: "proporcijas",
        title: { lv: "Attiecības un proporcijas", ru: "Отношения и пропорции" },
        icon: "🥞",
        kind: "algebra",
        why: {
          lv: "Proporcijas palīdz palielināt recepti, lasīt kartes mērogu un sajaukt krāsas.",
          ru: "Пропорции помогают увеличить рецепт, читать масштаб карты и смешивать краски.",
        },
        realCase: {
          title: { lv: "Kartes mērogs", ru: "Масштаб карты" },
          text: {
            lv: "Gaujas Nacionālā parka kartē 1 cm = 500 m. Takas garums kartē 7 cm → 3,5 km. Pietiks ar ūdens pudeli!",
            ru: "На карте Национального парка Гауя 1 см = 500 м. Тропа на карте 7 см → 3,5 км. Бутылки воды хватит!",
          },
        },
        theory: [
          { lv: "Proporcija: a : b = c : d.", ru: "Пропорция: a : b = c : d." },
          { lv: "Krusteniskais reizinājums: a · d = b · c.", ru: "Перекрёстное произведение: a · d = b · c." },
        ],
        formula: "a/b = c/d",
        widget: "balance",
        generator: "proportion",
        skola2030: ["4.2.4", "4.2.7"],
        askAi: [{ lv: "Kā izmantot kartes mērogu 1:50 000?", ru: "Как пользоваться масштабом карты 1:50 000?" }],
      },
      {
        id: "negativi",
        title: { lv: "Negatīvi skaitļi", ru: "Отрицательные числа" },
        icon: "🌡️",
        kind: "algebra",
        why: {
          lv: "Ziemā termometrs rāda zem nulles, liftā ir pagrabstāvi, bankā — parāds.",
          ru: "Зимой термометр показывает ниже нуля, в лифте есть подвал, в банке — долг.",
        },
        realCase: {
          title: { lv: "Latvijas ziema", ru: "Латвийская зима" },
          text: {
            lv: "No rīta −8 °C, dienā sasila par 11 grādiem: −8 + 11 = +3 °C. Sniegs sāks kust!",
            ru: "Утром −8 °C, днём потеплело на 11 градусов: −8 + 11 = +3 °C. Снег начнёт таять!",
          },
        },
        theory: [
          { lv: "Uz skaitļu ass negatīvie ir pa kreisi no nulles.", ru: "На числовой оси отрицательные — слева от нуля." },
          { lv: "−3 > −7, jo −3 ir tuvāk nullei.", ru: "−3 > −7, потому что −3 ближе к нулю." },
        ],
        widget: "numberLine",
        generator: "negatives",
        skola2030: ["3.2.1", "1.2.2", "2.2.6"],
        askAi: [{ lv: "Kāpēc mīnuss reiz mīnuss ir pluss?", ru: "Почему минус на минус даёт плюс?" }],
      },
      {
        id: "aplis",
        title: { lv: "Riņķa līnijas garums", ru: "Длина окружности" },
        icon: "🚲",
        kind: "geometry",
        why: {
          lv: "Zinot diametru, vari novērtēt, cik garš ir riteņa, apaļa galda vai dobes apkārtmērs — bez mērlentes.",
          ru: "Зная диаметр, можно оценить длину обода колеса, края круглого стола или клумбы — без рулетки.",
        },
        realCase: {
          title: { lv: "Velosipēda ritenis", ru: "Колесо велосипеда" },
          text: {
            lv: "Riteņa diametrs ir 66 cm. Vienā apgriezienā ritenis nobrauc apmēram 3 · 66 ≈ 200 cm jeb 2 m. Pēc 100 apgriezieniem — jau ap 200 m!",
            ru: "Диаметр колеса 66 см. За один оборот колесо проезжает примерно 3 · 66 ≈ 200 см, то есть 2 м. За 100 оборотов — уже около 200 м!",
          },
        },
        theory: [
          { lv: "Diametrs ir nogrieznis caur centru no malas līdz malai; rādiuss ir puse diametra.", ru: "Диаметр — отрезок через центр от края до края; радиус — половина диаметра." },
          { lv: "Riņķa līnijas garums ir aptuveni trīs diametri: C ≈ 3 · d.", ru: "Длина окружности — примерно три диаметра: C ≈ 3 · d." },
          { lv: "Precīzāk tas ir nedaudz vairāk par 3 — šo skaitli iepazīsi 7.–9. klasē.", ru: "Точнее — чуть больше 3; это число ты узнаешь в 7–9 классах." },
        ],
        formula: "C ≈ 3 · d",
        widget: "circle",
        generator: "circleApprox",
        skola2030: ["6.4.1"],
        askAi: [{ lv: "Kāpēc riņķa līnija ir apmēram trīs diametri?", ru: "Почему окружность — это примерно три диаметра?" }],
      },
      {
        id: "videja-vertiba",
        title: { lv: "Vidējā vērtība", ru: "Среднее значение" },
        icon: "📊",
        kind: "data",
        why: {
          lv: "Vidējais palīdz salīdzināt: atzīmes, laikapstākļus, sportistu rezultātus.",
          ru: "Среднее помогает сравнивать: оценки, погоду, результаты спортсменов.",
        },
        realCase: {
          title: { lv: "Semestra atzīme", ru: "Оценка за семестр" },
          text: {
            lv: "Atzīmes 7, 8, 6, 9 → (7+8+6+9) : 4 = 7,5. Vari aprēķināt, kāda atzīme vajadzīga nākamajā testā, lai sanāktu 8!",
            ru: "Оценки 7, 8, 6, 9 → (7+8+6+9) : 4 = 7,5. Можно посчитать, какая оценка нужна в следующем тесте, чтобы вышло 8!",
          },
        },
        theory: [
          { lv: "Vidējais = visu vērtību summa : vērtību skaits.", ru: "Среднее = сумма всех значений : их количество." },
          { lv: "Vidējais var nesakrist ne ar vienu no skaitļiem datu kopā.", ru: "Среднее может не совпадать ни с одним из чисел набора." },
        ],
        formula: "x̄ = (x₁ + … + xₙ) / n",
        generator: "mean",
        skola2030: ["5.1.5"],
        askAi: [{ lv: "Ar ko atšķiras vidējais un mediāna?", ru: "Чем отличается среднее от медианы?" }],
      },
      {
        id: "koordinatas",
        title: { lv: "Koordinātu plakne", ru: "Координатная плоскость" },
        icon: "🗺️",
        kind: "geometry",
        why: {
          lv: "Koordinātas ir adrese punktam: tās izmanto kartēs, GPS, datorspēlēs un šahā.",
          ru: "Координаты — это адрес точки: их используют в картах, GPS, компьютерных играх и шахматах.",
        },
        realCase: {
          title: { lv: "Jūras kauja", ru: "Морской бой" },
          text: {
            lv: "Spēlē “Jūras kauja” šāviens “C5” ir punkts ar divām koordinātām. Koordinātu plaknē tā pati ideja: (3; 5) — 3 pa labi, 5 uz augšu.",
            ru: "В игре «Морской бой» выстрел «C5» — это точка с двумя координатами. На координатной плоскости та же идея: (3; 5) — 3 вправо, 5 вверх.",
          },
        },
        theory: [
          { lv: "Punktu raksta kā (x; y): vispirms x (pa labi/kreisi), tad y (uz augšu/leju).", ru: "Точку записывают как (x; y): сначала x (вправо/влево), потом y (вверх/вниз)." },
          { lv: "Koordinātu sākumpunkts ir (0; 0).", ru: "Начало координат — точка (0; 0)." },
          { lv: "Negatīvs x — pa kreisi no y ass, negatīvs y — zem x ass.", ru: "Отрицательный x — слева от оси y, отрицательный y — под осью x." },
        ],
        widget: "coordPlane",
        generator: "coords",
        skola2030: ["6.2.1"],
        askAi: [{ lv: "Kā atcerēties, kura koordināta ir pirmā?", ru: "Как запомнить, какая координата первая?" }],
      },
    ],
  },
  {
    grade: 7,
    title: { lv: "Algebras sākums", ru: "Начала алгебры" },
    subtitle: { lv: "Vienādojumi, nevienādības, pakāpes, trijstūri, procentu izmaiņas", ru: "Уравнения, неравенства, степени, треугольники, изменения в %" },
    color: "#b5179e",
    topics: [
      {
        id: "vienadojumi",
        title: { lv: "Lineāri vienādojumi", ru: "Линейные уравнения" },
        icon: "⚖️",
        kind: "algebra",
        why: {
          lv: "Vienādojums ir veids, kā atrast nezināmo — cenu, laiku, daudzumu.",
          ru: "Уравнение — способ найти неизвестное: цену, время, количество.",
        },
        realCase: {
          title: { lv: "Batuta parks", ru: "Батутный парк" },
          text: {
            lv: "Ieeja 5 € + 6 € stundā. Tev ir 23 €. Cik stundas vari lēkāt? 6x + 5 = 23 → x = 3.",
            ru: "Вход 5 € + 6 € в час. У тебя 23 €. Сколько часов можно прыгать? 6x + 5 = 23 → x = 3.",
          },
        },
        theory: [
          { lv: "Vienādojums ir kā svari: ar abām pusēm dara to pašu.", ru: "Уравнение как весы: с обеими сторонами делают одно и то же." },
          { lv: "Pārnesot locekli uz otru pusi, maina zīmi.", ru: "При переносе слагаемого в другую часть меняют знак." },
        ],
        formula: "ax + b = c  ⇒  x = (c − b) / a",
        widget: "balance",
        generator: "linearEq",
        skola2030: ["4.3.4", "4.4.1"],
        askAi: [{ lv: "Kāpēc pārnesot mainās zīme?", ru: "Почему при переносе меняется знак?" }],
      },
      {
        id: "pakapes",
        title: { lv: "Pakāpes", ru: "Степени" },
        icon: "📱",
        kind: "algebra",
        why: {
          lv: "Pakāpes apraksta strauju augšanu: vīrusi, ziņu izplatīšanās, datora atmiņa (GB, TB).",
          ru: "Степени описывают быстрый рост: вирусы, распространение новостей, память компьютера (ГБ, ТБ).",
        },
        realCase: {
          title: { lv: "Virālais video", ru: "Вирусное видео" },
          text: {
            lv: "Ja katrs pārsūta video 3 draugiem, pēc 10 soļiem tas sasniedz 3¹⁰ = 59 049 cilvēkus. Tāpēc baumas izplatās tik ātri!",
            ru: "Если каждый пересылает видео 3 друзьям, через 10 шагов его увидят 3¹⁰ = 59 049 человек. Вот почему слухи так быстро расходятся!",
          },
        },
        theory: [
          { lv: "aⁿ = a · a · … · a (n reizes).", ru: "aⁿ = a · a · … · a (n раз)." },
          { lv: "aᵐ · aⁿ = aᵐ⁺ⁿ.", ru: "aᵐ · aⁿ = aᵐ⁺ⁿ." },
        ],
        formula: "aᵐ · aⁿ = aᵐ⁺ⁿ",
        generator: "powers",
        skola2030: ["4.3.3", "3.1.2"],
        askAi: [{ lv: "Kāpēc jebkurš skaitlis nultajā pakāpē ir 1?", ru: "Почему любое число в нулевой степени равно 1?" }],
      },
      {
        id: "trijsturi",
        title: { lv: "Trijstūra leņķi", ru: "Углы треугольника" },
        icon: "🏠",
        kind: "geometry",
        why: {
          lv: "Trijstūris ir stingrākā figūra — tāpēc to izmanto tiltos, jumtos un celtņos.",
          ru: "Треугольник — самая жёсткая фигура, поэтому его используют в мостах, крышах и кранах.",
        },
        realCase: {
          title: { lv: "Vanšu tilts", ru: "Вантовый мост" },
          text: {
            lv: "Rīgas Vanšu tilta troses ar pilonu veido trijstūrus. Inženieri rēķina leņķus, lai slodze sadalītos vienmērīgi.",
            ru: "Тросы Вантового моста в Риге вместе с пилоном образуют треугольники. Инженеры рассчитывают углы, чтобы нагрузка распределялась равномерно.",
          },
        },
        theory: [
          { lv: "Trijstūra iekšējo leņķu summa ir 180°.", ru: "Сумма внутренних углов треугольника 180°." },
          { lv: "Vienādsānu trijstūrim leņķi pie pamata ir vienādi.", ru: "У равнобедренного треугольника углы при основании равны." },
        ],
        formula: "α + β + γ = 180°",
        widget: "triangle",
        generator: "triangleAngles",
        skola2030: ["6.4.1"],
        askAi: [{ lv: "Kā pierādīt, ka trijstūra leņķu summa ir 180°?", ru: "Как доказать, что сумма углов треугольника 180°?" }],
      },
      {
        id: "procentu-izmainas",
        title: { lv: "Procentuālās izmaiņas", ru: "Процентные изменения" },
        icon: "📈",
        kind: "algebra",
        why: {
          lv: "Cenas, algas un iedzīvotāju skaits mainās procentos. Kas prot tos rēķināt, to nevar apmānīt reklāmā.",
          ru: "Цены, зарплаты и численность населения меняются в процентах. Кто умеет их считать, того не обманет реклама.",
        },
        realCase: {
          title: { lv: "Reklāmas triks", ru: "Рекламный трюк" },
          text: {
            lv: "Veikals pacēla cenu par 20%, pēc tam izsludināja “−20% atlaidi”. 100 € → 120 € → 96 €. Prece kļuva lētāka nevis par 0%, bet par 4%!",
            ru: "Магазин поднял цену на 20%, а потом объявил «скидку −20%». 100 € → 120 € → 96 €. Товар подешевел не на 0%, а на 4%!",
          },
        },
        theory: [
          { lv: "Palielinājums par p%: reizinām ar (1 + p/100).", ru: "Увеличение на p%: умножаем на (1 + p/100)." },
          { lv: "Samazinājums par p%: reizinām ar (1 − p/100).", ru: "Уменьшение на p%: умножаем на (1 − p/100)." },
          { lv: "Katrs nākamais procents tiek rēķināts no jaunās vērtības.", ru: "Каждый следующий процент считается от нового значения." },
        ],
        formula: "A · (1 ± p/100)",
        widget: "percentBar",
        generator: "percentChange",
        skola2030: ["3.2.4", "3.2.5"],
        askAi: [{ lv: "Kā pārbaudīt, vai reklāmas atlaide ir godīga?", ru: "Как проверить, честная ли скидка в рекламе?" }],
      },
      {
        id: "nevienadibas",
        title: { lv: "Lineāras nevienādības", ru: "Линейные неравенства" },
        icon: "📱",
        kind: "algebra",
        why: {
          lv: "Nevienādības atbild uz jautājumiem “cik daudz drīkst?” un “cik vismaz vajag?” — budžetā, laikā, svarā.",
          ru: "Неравенства отвечают на вопросы «сколько можно?» и «сколько нужно хотя бы?» — в бюджете, времени, весе.",
        },
        realCase: {
          title: { lv: "Lifta kravnesība", ru: "Грузоподъёмность лифта" },
          text: {
            lv: "Lifts iztur 400 kg. Kurjers sver 80 kg, katra kaste — 30 kg: 80 + 30x ≤ 400 → x ≤ 10,6… Var vest ne vairāk kā 10 kastes.",
            ru: "Лифт выдерживает 400 кг. Курьер весит 80 кг, каждая коробка — 30 кг: 80 + 30x ≤ 400 → x ≤ 10,6… Можно везти не больше 10 коробок.",
          },
        },
        theory: [
          { lv: "Nevienādību risina kā vienādojumu, bet atbilde ir skaitļu kopa.", ru: "Неравенство решают как уравнение, но ответ — множество чисел." },
          { lv: "Reizinot vai dalot ar negatīvu skaitli, nevienādības zīme mainās uz pretējo.", ru: "При умножении или делении на отрицательное число знак неравенства меняется на противоположный." },
        ],
        formula: "ax + b ≤ c",
        widget: "numberLine",
        generator: "inequality",
        skola2030: ["4.3.4", "4.4.1"],
        askAi: [{ lv: "Kāpēc, dalot ar negatīvu skaitli, zīme mainās?", ru: "Почему при делении на отрицательное число знак меняется?" }],
      },
    ],
  },
  {
    grade: 8,
    title: { lv: "Funkcijas un Pitagors", ru: "Функции и Пифагор" },
    subtitle: { lv: "Lineāra funkcija, Pitagors, √, π, statistika, varbūtība", ru: "Линейная функция, Пифагор, √, π, статистика, вероятность" },
    color: "#f72585",
    topics: [
      {
        id: "lineara-funkcija",
        title: { lv: "Lineāra funkcija", ru: "Линейная функция" },
        icon: "🚕",
        kind: "algebra",
        why: {
          lv: "Funkcija apraksta atkarību: cena no attāluma, ceļš no laika, alga no stundām.",
          ru: "Функция описывает зависимость: цена от расстояния, путь от времени, зарплата от часов.",
        },
        realCase: {
          title: { lv: "Taksometra tarifs", ru: "Тариф такси" },
          text: {
            lv: "Taksometrs: 1,50 € + 0,70 €/km → y = 0,7x + 1,5. Grafikā k ir slīpums (cik ātri aug cena), b — kur taisne krusto y asi.",
            ru: "Такси: 1,50 € + 0,70 €/км → y = 0,7x + 1,5. На графике k — наклон (как быстро растёт цена), b — где прямая пересекает ось y.",
          },
        },
        theory: [
          { lv: "y = kx + b; k — slīpuma koeficients, b — brīvais loceklis.", ru: "y = kx + b; k — угловой коэффициент, b — свободный член." },
          { lv: "Ja k > 0, funkcija aug; ja k < 0 — dilst.", ru: "Если k > 0, функция возрастает; если k < 0 — убывает." },
        ],
        formula: "y = kx + b",
        widget: "linearGraph",
        generator: "linearFunction",
        skola2030: ["4.2.2", "4.2.3"],
        askAi: [{ lv: "Kā no grafika noteikt k un b?", ru: "Как по графику определить k и b?" }],
      },
      {
        id: "pitagors",
        title: { lv: "Pitagora teorēma", ru: "Теорема Пифагора" },
        icon: "🪜",
        kind: "geometry",
        why: {
          lv: "Ar Pitagoru aprēķina attālumu, ja nevar to izmērīt tieši: kāpnes, ekrāna diagonāle, īsākais ceļš pāri parkam.",
          ru: "С помощью Пифагора находят расстояние, которое нельзя измерить напрямую: лестница, диагональ экрана, кратчайший путь через парк.",
        },
        realCase: {
          title: { lv: "Ugunsdzēsēju kāpnes", ru: "Пожарная лестница" },
          text: {
            lv: "Logs 12 m augstumā, mašīna var piebraukt 5 m no sienas. Kāpnēm jābūt √(12² + 5²) = 13 m garām.",
            ru: "Окно на высоте 12 м, машина подъезжает на 5 м от стены. Лестница должна быть √(12² + 5²) = 13 м.",
          },
        },
        theory: [
          { lv: "Taisnleņķa trijstūrī c² = a² + b² (c — hipotenūza).", ru: "В прямоугольном треугольнике c² = a² + b² (c — гипотенуза)." },
          { lv: "Ēģiptiešu trijstūris 3-4-5 — veids, kā uzbūvēt taisnu leņķi ar virvi.", ru: "Египетский треугольник 3-4-5 — способ построить прямой угол верёвкой." },
        ],
        formula: "c² = a² + b²",
        widget: "pythagoras",
        generator: "pythagoras",
        skola2030: ["6.4.1"],
        askAi: [{ lv: "Kā būvnieki izmanto 3-4-5 trijstūri?", ru: "Как строители используют треугольник 3-4-5?" }],
      },
      {
        id: "kvadratsakne",
        title: { lv: "Kvadrātsakne", ru: "Квадратный корень" },
        icon: "🟥",
        kind: "algebra",
        why: {
          lv: "Sakne ir pretēja kvadrātam: zinot laukumu, atrod malu.",
          ru: "Корень — обратное к квадрату: зная площадь, находят сторону.",
        },
        realCase: {
          title: { lv: "Kvadrātveida terase", ru: "Квадратная терраса" },
          text: {
            lv: "Tētis grib 36 m² terasi. Cik garai jābūt malai? √36 = 6 m.",
            ru: "Папа хочет террасу 36 м². Какой длины должна быть сторона? √36 = 6 м.",
          },
        },
        theory: [
          { lv: "√a = b, ja b² = a un b ≥ 0.", ru: "√a = b, если b² = a и b ≥ 0." },
          { lv: "Pilni kvadrāti: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100…", ru: "Полные квадраты: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100…" },
        ],
        formula: "√(a²) = |a|",
        widget: "areaGrid",
        generator: "sqrt",
        skola2030: ["3.1.1", "3.2.1"],
        askAi: [{ lv: "Kā novērtēt √50 bez kalkulatora?", ru: "Как оценить √50 без калькулятора?" }],
      },
      {
        id: "varbutiba",
        title: { lv: "Varbūtība", ru: "Вероятность" },
        icon: "🎲",
        kind: "data",
        why: {
          lv: "Varbūtība palīdz novērtēt iespējas: laika prognozē, spēlēs, loterijā.",
          ru: "Вероятность помогает оценивать шансы: в прогнозе погоды, играх, лотерее.",
        },
        realCase: {
          title: { lv: "Lietus prognoze", ru: "Прогноз дождя" },
          text: {
            lv: "“Lietus varbūtība 70%” nozīmē: no 10 līdzīgām dienām 7 līst. Lietussargu labāk ņemt!",
            ru: "«Вероятность дождя 70%» значит: из 10 похожих дней в 7 идёт дождь. Зонт лучше взять!",
          },
        },
        theory: [
          { lv: "P = labvēlīgo iznākumu skaits : visu iznākumu skaits.", ru: "P = число благоприятных исходов : число всех исходов." },
          { lv: "0 ≤ P ≤ 1; 0 — neiespējams, 1 — drošs notikums.", ru: "0 ≤ P ≤ 1; 0 — невозможное, 1 — достоверное событие." },
        ],
        formula: "P(A) = m / n",
        generator: "probability",
        skola2030: ["5.2.2", "5.2.3"],
        askAi: [{ lv: "Vai pēc 5 “ģērboņiem” nākamais noteikti būs “cipars”?", ru: "Если 5 раз выпал «орёл», обязательно ли выпадет «решка»?" }],
      },
      {
        id: "rinkis-pi",
        title: { lv: "Riņķa līnija, riņķis un π", ru: "Окружность, круг и π" },
        icon: "⭕",
        kind: "geometry",
        why: {
          lv: "Ar π precīzi aprēķina riteņa ceļu, apaļas dobes laukumu un pat planētu orbītas.",
          ru: "С помощью π точно вычисляют путь колеса, площадь круглой клумбы и даже орбиты планет.",
        },
        realCase: {
          title: { lv: "Velospidometrs", ru: "Велоспидометр" },
          text: {
            lv: "Spidometrs zina riteņa diametru (66 cm) un skaita apgriezienus. 1 apgrieziens = π · 66 ≈ 207 cm. Tā tas zina, cik tu nobrauci!",
            ru: "Спидометр знает диаметр колеса (66 см) и считает обороты. 1 оборот = π · 66 ≈ 207 см. Так он знает, сколько ты проехал!",
          },
        },
        theory: [
          { lv: "Jebkurā riņķa līnijā garums : diametrs = π ≈ 3,14.", ru: "В любой окружности длина : диаметр = π ≈ 3,14." },
          { lv: "Riņķa līnijas garums C = π · d = 2πr.", ru: "Длина окружности C = π · d = 2πr." },
          { lv: "Riņķa laukums S = πr².", ru: "Площадь круга S = πr²." },
        ],
        formula: "C = πd,  S = πr²",
        widget: "circle",
        generator: "circle",
        skola2030: ["6.4.1", "3.2.8"],
        askAi: [{ lv: "No kurienes radās skaitlis π?", ru: "Откуда взялось число π?" }],
      },
      {
        id: "moda-mediana",
        title: { lv: "Moda, mediāna, amplitūda", ru: "Мода, медиана, размах" },
        icon: "🌡️",
        kind: "data",
        why: {
          lv: "Vidējais ne vienmēr stāsta patiesību. Mediāna un amplitūda palīdz saprast datus, kuros ir “izlēcēji”.",
          ru: "Среднее не всегда говорит правду. Медиана и размах помогают понять данные, в которых есть «выбросы».",
        },
        realCase: {
          title: { lv: "Algas ziņās", ru: "Зарплаты в новостях" },
          text: {
            lv: "Uzņēmumā 9 darbinieki saņem 1200 €, direktors — 12 000 €. Vidējā alga 2280 €, bet mediāna 1200 € — tā daudz labāk raksturo, cik saņem vairums.",
            ru: "На предприятии 9 сотрудников получают 1200 €, директор — 12 000 €. Средняя зарплата 2280 €, а медиана 1200 € — она гораздо лучше показывает, сколько получает большинство.",
          },
        },
        theory: [
          { lv: "Moda — vērtība, kas datu kopā sastopama visbiežāk.", ru: "Мода — значение, которое встречается в наборе чаще всего." },
          { lv: "Mediāna — vidējā vērtība sakārtotā datu kopā.", ru: "Медиана — серединное значение упорядоченного набора." },
          { lv: "Amplitūda — starpība starp lielāko un mazāko vērtību.", ru: "Амплитуда (размах) — разность между наибольшим и наименьшим значением." },
        ],
        widget: "barChart",
        generator: "statsMedian",
        skola2030: ["5.1.4", "5.1.6"],
        askAi: [{ lv: "Kad labāk izmantot mediānu, nevis vidējo?", ru: "Когда лучше использовать медиану, а не среднее?" }],
      },
    ],
  },
  {
    grade: 9,
    title: { lv: "Gatavojamies eksāmenam", ru: "Готовимся к экзамену" },
    subtitle: { lv: "Kvadrātvienādojumi, sistēmas, progresija, līdzība, trigonometrija", ru: "Квадратные уравнения, системы, прогрессия, подобие, тригонометрия" },
    color: "#3a0ca3",
    topics: [
      {
        id: "kvadratvienadojumi",
        title: { lv: "Kvadrātvienādojumi", ru: "Квадратные уравнения" },
        icon: "🏀",
        kind: "algebra",
        why: {
          lv: "Parabola apraksta mestas bumbas ceļu, strūklaku un tilta arku.",
          ru: "Парабола описывает полёт брошенного мяча, фонтан и арку моста.",
        },
        realCase: {
          title: { lv: "Soda metiens basketbolā", ru: "Штрафной бросок в баскетболе" },
          text: {
            lv: "Bumbas augstums h(t) = −5t² + 8t + 2. Atrisinot h = 0, uzzini, kad bumba piezemētos, bet virsotne parāda maksimālo augstumu.",
            ru: "Высота мяча h(t) = −5t² + 8t + 2. Решив h = 0, узнаешь, когда мяч упадёт, а вершина покажет максимальную высоту.",
          },
        },
        theory: [
          { lv: "ax² + bx + c = 0; D = b² − 4ac.", ru: "ax² + bx + c = 0; D = b² − 4ac." },
          { lv: "D > 0 — divas saknes, D = 0 — viena, D < 0 — nav reālu sakņu.", ru: "D > 0 — два корня, D = 0 — один, D < 0 — нет действительных корней." },
          { lv: "x = (−b ± √D) / 2a", ru: "x = (−b ± √D) / 2a" },
        ],
        formula: "x = (−b ± √D) / 2a",
        widget: "parabola",
        generator: "quadratic",
        skola2030: ["4.3.4", "4.2.2"],
        askAi: [{ lv: "Ko diskriminants pasaka par parabolu?", ru: "Что дискриминант говорит о параболе?" }],
      },
      {
        id: "sistemas",
        title: { lv: "Vienādojumu sistēmas", ru: "Системы уравнений" },
        icon: "🎟️",
        kind: "algebra",
        why: {
          lv: "Ja ir divi nezināmie, vajag divus faktus — sistēma tos apvieno.",
          ru: "Если неизвестных два, нужны два факта — система их объединяет.",
        },
        realCase: {
          title: { lv: "Biļetes uz koncertu", ru: "Билеты на концерт" },
          text: {
            lv: "10 biļetes par 46 €; bērnu 3 €, pieaugušo 7 €. x + y = 10, 3x + 7y = 46 → 6 bērnu un 4 pieaugušo.",
            ru: "10 билетов за 46 €; детский 3 €, взрослый 7 €. x + y = 10, 3x + 7y = 46 → 6 детских и 4 взрослых.",
          },
        },
        theory: [
          { lv: "Ievietošanas metode: izsaka vienu mainīgo un ievieto otrā vienādojumā.", ru: "Метод подстановки: выражают одну переменную и подставляют во второе уравнение." },
          { lv: "Grafiski: atrisinājums ir taišņu krustpunkts.", ru: "Графически: решение — точка пересечения прямых." },
        ],
        widget: "linearGraph",
        generator: "system",
        skola2030: ["4.3.4", "4.4.1"],
        askAi: [{ lv: "Kad sistēmai nav atrisinājuma?", ru: "Когда у системы нет решения?" }],
      },
      {
        id: "lidziba",
        title: { lv: "Līdzīgi trijstūri", ru: "Подобные треугольники" },
        icon: "🌳",
        kind: "geometry",
        why: {
          lv: "Līdzība ļauj izmērīt nesasniedzamo — koka, torņa vai kalna augstumu.",
          ru: "Подобие позволяет измерить недостижимое — высоту дерева, башни или горы.",
        },
        realCase: {
          title: { lv: "Kā Tāls mērīja piramīdu", ru: "Как Фалес измерил пирамиду" },
          text: {
            lv: "Pirms 2600 gadiem Tāls salīdzināja piramīdas ēnu ar nūjas ēnu. To pašu vari izdarīt ar Rīgas Domu baznīcas torni!",
            ru: "2600 лет назад Фалес сравнил тень пирамиды с тенью палки. То же самое можно сделать с башней Домского собора в Риге!",
          },
        },
        theory: [
          { lv: "Līdzīgiem trijstūriem atbilstošie leņķi ir vienādi, malas proporcionālas.", ru: "У подобных треугольников соответственные углы равны, стороны пропорциональны." },
          { lv: "k — līdzības koeficients; laukumi attiecas kā k².", ru: "k — коэффициент подобия; площади относятся как k²." },
        ],
        formula: "a₁/a₂ = b₁/b₂ = k",
        widget: "trig",
        generator: "similarity",
        skola2030: ["6.3.3"],
        askAi: [{ lv: "Kāpēc laukumi attiecas kā k²?", ru: "Почему площади относятся как k²?" }],
      },
      {
        id: "trigonometrija",
        title: { lv: "Trigonometrija", ru: "Тригонометрия" },
        icon: "🗼",
        kind: "geometry",
        why: {
          lv: "sin, cos un tg ļauj atrast augstumu un attālumu, zinot tikai leņķi.",
          ru: "sin, cos и tg позволяют найти высоту и расстояние, зная только угол.",
        },
        realCase: {
          title: { lv: "Rampa ratiņkrēslam", ru: "Пандус для коляски" },
          text: {
            lv: "Pēc būvnormatīviem rampas slīpums nedrīkst būt lielāks par ~5°. Lai paceltos 0,5 m, vajag ≈ 0,5 : tg 5° ≈ 5,7 m garu rampu.",
            ru: "По строительным нормам уклон пандуса не больше ~5°. Чтобы подняться на 0,5 м, нужен пандус длиной ≈ 0,5 : tg 5° ≈ 5,7 м.",
          },
        },
        theory: [
          { lv: "sin α = pretkatete / hipotenūza", ru: "sin α = противолежащий катет / гипотенуза" },
          { lv: "cos α = piekatete / hipotenūza", ru: "cos α = прилежащий катет / гипотенуза" },
          { lv: "tg α = pretkatete / piekatete", ru: "tg α = противолежащий / прилежащий" },
        ],
        formula: "tg α = a / b",
        widget: "trig",
        generator: "trig",
        skola2030: ["6.4.1", "1.1.3"],
        askAi: [{ lv: "Kā atcerēties, kas ir sin, cos un tg?", ru: "Как запомнить, что такое sin, cos и tg?" }],
      },
      {
        id: "tilpums",
        title: { lv: "Tilpums", ru: "Объём" },
        icon: "🏊",
        kind: "geometry",
        why: {
          lv: "Tilpums pasaka, cik ietilpst: ūdens baseinā, smiltis kravas auto, gaiss istabā.",
          ru: "Объём говорит, сколько помещается: воды в бассейне, песка в грузовике, воздуха в комнате.",
        },
        realCase: {
          title: { lv: "Dārza baseins", ru: "Садовый бассейн" },
          text: {
            lv: "Baseins 4 × 2 × 1,2 m = 9,6 m³ = 9600 l. Ar šļūteni 10 l/min piepildīšana ilgs 16 stundas!",
            ru: "Бассейн 4 × 2 × 1,2 м = 9,6 м³ = 9600 л. Из шланга 10 л/мин наполнение займёт 16 часов!",
          },
        },
        theory: [
          { lv: "Taisnstūra paralēlskaldnis: V = a · b · c.", ru: "Прямоугольный параллелепипед: V = a · b · c." },
          { lv: "Cilindrs: V = πr²h.", ru: "Цилиндр: V = πr²h." },
          { lv: "1 m³ = 1000 l, 1 dm³ = 1 l.", ru: "1 м³ = 1000 л, 1 дм³ = 1 л." },
        ],
        formula: "V = a · b · c",
        widget: "areaGrid",
        generator: "volume",
        skola2030: ["6.4.1"],
        askAi: [{ lv: "Kāpēc 1 m³ ir 1000 litri?", ru: "Почему в 1 м³ 1000 литров?" }],
      },
      {
        id: "progresija",
        title: { lv: "Aritmētiskā progresija", ru: "Арифметическая прогрессия" },
        icon: "🐷",
        kind: "algebra",
        why: {
          lv: "Progresija apraksta vienmērīgu augšanu: krājumus, treniņu slodzi, sēdvietas amfiteātrī.",
          ru: "Прогрессия описывает равномерный рост: накопления, нагрузку на тренировках, места в амфитеатре.",
        },
        realCase: {
          title: { lv: "Treniņu plāns", ru: "План тренировок" },
          text: {
            lv: "Pirmajā dienā noskrien 1 km, katru nākamo dienu — par 0,5 km vairāk. 15. dienā: 1 + 14 · 0,5 = 8 km. Bez formulas būtu jāskaita 15 reizes!",
            ru: "В первый день пробегаешь 1 км, каждый следующий — на 0,5 км больше. На 15-й день: 1 + 14 · 0,5 = 8 км. Без формулы пришлось бы считать 15 раз!",
          },
        },
        theory: [
          { lv: "Aritmētiskajā progresijā katrs nākamais loceklis ir par d lielāks: aₙ₊₁ = aₙ + d.", ru: "В арифметической прогрессии каждый следующий член больше на d: aₙ₊₁ = aₙ + d." },
          { lv: "n-tais loceklis: aₙ = a₁ + (n − 1)d.", ru: "n-й член: aₙ = a₁ + (n − 1)d." },
        ],
        formula: "aₙ = a₁ + (n − 1)d",
        widget: "numberLine",
        generator: "arithSeq",
        skola2030: ["4.1.1"],
        askAi: [{ lv: "Kā atrast pirmo 10 locekļu summu?", ru: "Как найти сумму первых 10 членов?" }],
      },
      {
        id: "trijstura-nevienadiba",
        title: { lv: "Trijstūra nevienādība", ru: "Неравенство треугольника" },
        icon: "📐",
        kind: "geometry",
        why: {
          lv: "Taisnais ceļš vienmēr ir īsākais. Tas palīdz plānot maršrutus un pārbaudīt, vai konstrukciju vispār var uzbūvēt.",
          ru: "Прямой путь всегда кратчайший. Это помогает планировать маршруты и проверять, можно ли вообще построить конструкцию.",
        },
        realCase: {
          title: { lv: "Taka pāri parkam", ru: "Тропинка через парк" },
          text: {
            lv: "Gar parka malām ir 300 m + 400 m, bet cilvēki iemin taku pa diagonāli — tā noteikti ir īsāka par 700 m (patiesībā 500 m).",
            ru: "Вдоль краёв парка 300 м + 400 м, но люди протаптывают тропинку по диагонали — она точно короче 700 м (на самом деле 500 м).",
          },
        },
        theory: [
          { lv: "Jebkurā trijstūrī divu malu summa ir lielāka par trešo malu.", ru: "В любом треугольнике сумма двух сторон больше третьей стороны." },
          { lv: "Pietiek pārbaudīt: divu īsāko malu summa > garākā mala.", ru: "Достаточно проверить: сумма двух меньших сторон > большей стороны." },
        ],
        formula: "a + b > c",
        widget: "triangle",
        generator: "triangleInequality",
        skola2030: ["6.4.3", "6.2.1"],
        askAi: [{ lv: "Kas notiek, ja a + b = c?", ru: "Что будет, если a + b = c?" }],
      },
    ],
  },
];

export function getGrade(grade: number): Grade | undefined {
  return GRADES.find((g) => g.grade === grade);
}

export function getTopic(grade: number, topicId: string): Topic | undefined {
  return getGrade(grade)?.topics.find((t) => t.id === topicId);
}

/** Every real-life application of a topic: the main case first, then the extra ones. */
export function realCases(topic: Topic): RealCase[] {
  return [topic.realCase, ...(MORE_CASES[topic.id] ?? [])];
}
