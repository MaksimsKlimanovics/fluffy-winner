import type { T } from "./i18n";

export type RealCase = { title: T; text: T };

/**
 * More places in everyday life where each topic is used, on top of the main
 * real case in lib/curriculum.ts. Keyed by topic id. Each one can be opened
 * in a chat with the helper ("Uzzināt vairāk"), so keep the numbers concrete
 * and within the grade's stage (grade 1: up to 20, no π before grade 7).
 */
export const MORE_CASES: Record<string, RealCase[]> = {
  // ---------- 1. klase ----------
  "saskaitisana-20": [
    {
      title: { lv: "Punkti spēlē", ru: "Очки в игре" },
      text: {
        lv: "Galda spēlē tu uzmeti 6, bet nākamajā gājienā — 5. Lai zinātu, uz kura lauciņa stāvēt, saskaiti: 6 + 5 = 11.",
        ru: "В настольной игре ты выбросил 6, а в следующий ход — 5. Чтобы знать, на какую клетку встать, сложи: 6 + 5 = 11.",
      },
    },
    {
      title: { lv: "Krēsli ballītei", ru: "Стулья для праздника" },
      text: {
        lv: "Uz dzimšanas dienu nāks 8 klasesbiedri un 4 brālēni. Cik krēslu jānoliek pie galda? 8 + 4 = 12.",
        ru: "На день рождения придут 8 одноклассников и 4 двоюродных брата. Сколько стульев поставить у стола? 8 + 4 = 12.",
      },
    },
  ],
  "atnemsana-20": [
    {
      title: { lv: "Cik vēl jāgaida?", ru: "Сколько ещё ждать?" },
      text: {
        lv: "Adventes kalendārā līdz Ziemassvētkiem ir 15 lodziņi, 9 jau atvērti. Cik vēl jāatver? 15 − 9 = 6.",
        ru: "В адвент-календаре до Рождества 15 окошек, 9 уже открыто. Сколько ещё открыть? 15 − 9 = 6.",
      },
    },
    {
      title: { lv: "Lapas grāmatā", ru: "Страницы в книжке" },
      text: {
        lv: "Grāmatiņā ir 20 lapas, tu jau izlasīji 13. Cik lapu vēl palicis līdz beigām? 20 − 13 = 7.",
        ru: "В книжке 20 страниц, ты уже прочитал 13. Сколько страниц осталось до конца? 20 − 13 = 7.",
      },
    },
  ],
  figuras: [
    {
      title: { lv: "Ceļa zīmes", ru: "Дорожные знаки" },
      text: {
        lv: "Brīdinājuma zīmes ir trijstūri, aizlieguma zīmes — apļi, bet informācijas zīmes — kvadrāti un taisnstūri. Pēc formas šoferis zīmi saprot jau no tālienes.",
        ru: "Предупреждающие знаки — треугольники, запрещающие — круги, а информационные — квадраты и прямоугольники. По форме водитель узнаёт знак уже издалека.",
      },
    },
    {
      title: { lv: "Bišu šūnas", ru: "Пчелиные соты" },
      text: {
        lv: "Bites būvē šūnas sešstūru formā. Sešstūri cieši pieguļ viens otram bez spraugām, tāpēc vaska vajag mazāk un medus ietilpst vairāk.",
        ru: "Пчёлы строят соты в форме шестиугольников. Шестиугольники плотно прилегают друг к другу без щелей, поэтому воска нужно меньше, а мёда помещается больше.",
      },
    },
  ],
  virknes: [
    {
      title: { lv: "Pērļu rokassprādze", ru: "Браслет из бусин" },
      text: {
        lv: "Tu ver pērles: sarkana, zila, sarkana, zila… Ja zini likumu, vari pateikt, ka 10. pērle būs zila, pat neskaitot līdz galam.",
        ru: "Ты нанизываешь бусины: красная, синяя, красная, синяя… Если знаешь правило, можно сказать, что 10-я бусина будет синей, даже не досчитывая.",
      },
    },
    {
      title: { lv: "Lēcieni pa divi", ru: "Прыжки через два" },
      text: {
        lv: "Klasīšu spēlē tu lec pa lauciņiem 2, 4, 6, 8. Nākamais būs 10 — katrs lēciens ir par 2 lielāks.",
        ru: "В классиках ты прыгаешь по клеткам 2, 4, 6, 8. Следующая будет 10 — каждый прыжок на 2 больше.",
      },
    },
  ],
  "nauda-1": [
    {
      title: { lv: "Tirgū pēc āboliem", ru: "За яблоками на рынок" },
      text: {
        lv: "Ābols maksā 10 centu, bumbieris — 5 centus. Ja tev ir 20 centi, vari nopirkt vienu ābolu un divus bumbierus: 10 + 5 + 5 = 20.",
        ru: "Яблоко стоит 10 центов, груша — 5 центов. Если у тебя 20 центов, можно купить одно яблоко и две груши: 10 + 5 + 5 = 20.",
      },
    },
    {
      title: { lv: "Vienāda summa — dažādas monētas", ru: "Одна сумма — разные монеты" },
      text: {
        lv: "10 centus var samaksāt ar vienu 10 c monētu, ar divām 5 c monētām vai ar piecām 2 c monētām. Pārdevējam der jebkurš veids.",
        ru: "10 центов можно заплатить одной монетой 10 ц, двумя по 5 ц или пятью по 2 ц. Продавцу подойдёт любой способ.",
      },
    },
  ],
  // ---------- 2. klase ----------
  "saskaitisana-100": [
    {
      title: { lv: "Basketbola rezultāts", ru: "Счёт в баскетболе" },
      text: {
        lv: "Pirmajā puslaikā komanda guva 38 punktus, otrajā — 45. Tablo rāda kopā 38 + 45 = 83 punktus.",
        ru: "В первой половине команда набрала 38 очков, во второй — 45. Табло показывает всего 38 + 45 = 83 очка.",
      },
    },
    {
      title: { lv: "Uzlīmju albums", ru: "Альбом наклеек" },
      text: {
        lv: "Albumā ir 100 vietu. Tev jau ir 57 uzlīmes, un draugs uzdāvina vēl 26. Tagad tev ir 83 — līdz pilnam albumam trūkst 17.",
        ru: "В альбоме 100 мест. У тебя уже 57 наклеек, и друг дарит ещё 26. Теперь у тебя 83 — до полного альбома не хватает 17.",
      },
    },
  ],
  "reizinasana-intro": [
    {
      title: { lv: "Riteņi stāvvietā", ru: "Колёса на стоянке" },
      text: {
        lv: "Pie skolas stāv 6 velosipēdi. Katram ir 2 riteņi, tātad kopā 6 · 2 = 12 riteņu — nav jāskaita katrs atsevišķi.",
        ru: "У школы стоят 6 велосипедов. У каждого 2 колеса, значит всего 6 · 2 = 12 колёс — не нужно считать каждое отдельно.",
      },
    },
    {
      title: { lv: "Jogurtu iepakojums", ru: "Упаковка йогуртов" },
      text: {
        lv: "Veikalā jogurti ir iepakojumos pa 4. Ja paņem 3 iepakojumus, mājās būs 3 · 4 = 12 jogurtu visai nedēļai.",
        ru: "В магазине йогурты продаются упаковками по 4. Если взять 3 упаковки, дома будет 3 · 4 = 12 йогуртов на всю неделю.",
      },
    },
  ],
  pulkstenis: [
    {
      title: { lv: "Multfilma pirms gulētiešanas", ru: "Мультик перед сном" },
      text: {
        lv: "Multfilma sākas 19:30 un ilgst 30 minūtes. Tātad tā beigsies 20:00 — tieši laikā, lai mazgātu zobus.",
        ru: "Мультик начинается в 19:30 и длится 30 минут. Значит, он закончится в 20:00 — как раз пора чистить зубы.",
      },
    },
    {
      title: { lv: "Autobusa saraksts", ru: "Расписание автобуса" },
      text: {
        lv: "Autobuss pieturā pienāk ik pēc 15 minūtēm: 8:00, 8:15, 8:30. Ja nokavēji 8:15, nākamais būs 8:30.",
        ru: "Автобус приходит на остановку каждые 15 минут: 8:00, 8:15, 8:30. Если опоздал на 8:15, следующий будет в 8:30.",
      },
    },
  ],
  "nauda-2": [
    {
      title: { lv: "Kabatas nauda nedēļai", ru: "Карманные деньги на неделю" },
      text: {
        lv: "Tev ir 5 €. Pirmdien nopērc bulciņu par 1 € 20 c. Paliek 3 € 80 c — jāplāno, lai pietiek līdz piektdienai.",
        ru: "У тебя 5 €. В понедельник покупаешь булочку за 1 € 20 ц. Остаётся 3 € 80 ц — надо планировать, чтобы хватило до пятницы.",
      },
    },
    {
      title: { lv: "Vai pārdevējs nekļūdījās?", ru: "Не ошибся ли продавец?" },
      text: {
        lv: "Burtnīca maksā 65 c, tu dod 1 €. Atlikumam jābūt 35 c. Ja saskaiti 65 + 35 = 100, zini, ka atlikums ir pareizs.",
        ru: "Тетрадь стоит 65 ц, ты даёшь 1 €. Сдача должна быть 35 ц. Если сложить 65 + 35 = 100, ты знаешь, что сдача верная.",
      },
    },
  ],
  mervienibas: [
    {
      title: { lv: "Cik smaga ir skolas soma?", ru: "Сколько весит рюкзак?" },
      text: {
        lv: "Ārsti iesaka, lai soma nesvērtu vairāk par desmito daļu no bērna svara. Ja tu sver 30 kg, somai jābūt ne smagākai par 3 kg.",
        ru: "Врачи советуют, чтобы рюкзак весил не больше десятой части веса ребёнка. Если ты весишь 30 кг, рюкзак должен быть не тяжелее 3 кг.",
      },
    },
    {
      title: { lv: "Recepte pankūkām", ru: "Рецепт блинов" },
      text: {
        lv: "Receptē rakstīts 500 ml piena. Mājās ir 1 litra paka — tas ir 1000 ml, tātad pietiks divām porcijām.",
        ru: "В рецепте написано 500 мл молока. Дома пакет на 1 литр — это 1000 мл, значит хватит на две порции.",
      },
    },
  ],
  // ---------- 3. klase ----------
  reizrekins: [
    {
      title: { lv: "Šokolādes tāfelīte", ru: "Плитка шоколада" },
      text: {
        lv: "Šokolādē ir 4 rindas pa 6 gabaliņiem. Nav jāskaita katrs: 4 · 6 = 24 gabaliņi — pietiks visai klasei pa vienam?",
        ru: "В шоколадке 4 ряда по 6 долек. Не нужно считать каждую: 4 · 6 = 24 дольки — хватит ли всему классу по одной?",
      },
    },
    {
      title: { lv: "Kino zāle", ru: "Зал кинотеатра" },
      text: {
        lv: "Mazajā kino zālē ir 8 rindas, katrā 9 krēsli. Kasiere uzreiz zina, ka seansam var pārdot 8 · 9 = 72 biļetes.",
        ru: "В малом зале кинотеатра 8 рядов по 9 кресел. Кассир сразу знает, что на сеанс можно продать 8 · 9 = 72 билета.",
      },
    },
  ],
  dalisana: [
    {
      title: { lv: "Komandas sporta stundā", ru: "Команды на физкультуре" },
      text: {
        lv: "Klasē ir 24 skolēni, skolotājs grib 4 vienādas komandas. 24 : 4 = 6 — katrā komandā būs 6 spēlētāji.",
        ru: "В классе 24 ученика, учитель хочет 4 равные команды. 24 : 4 = 6 — в каждой команде будет 6 игроков.",
      },
    },
    {
      title: { lv: "Cik kastīšu vajag?", ru: "Сколько коробок нужно?" },
      text: {
        lv: "Jāiepako 35 smilšu kūciņas, kastītē ietilpst 5. 35 : 5 = 7 kastītes — dalīšana pasaka, cik iepakojumu ņemt līdzi.",
        ru: "Нужно упаковать 35 печений, в коробку помещается 5. 35 : 5 = 7 коробок — деление подсказывает, сколько упаковок взять.",
      },
    },
  ],
  perimetrs: [
    {
      title: { lv: "Lampiņu virtene logam", ru: "Гирлянда на окно" },
      text: {
        lv: "Logs ir 120 cm plats un 150 cm augsts. Lai virtene aizsniegtu apkārt visam logam, vajag 2 · (120 + 150) = 540 cm jeb 5 m 40 cm.",
        ru: "Окно шириной 120 см и высотой 150 см. Чтобы гирлянда обошла всё окно, нужно 2 · (120 + 150) = 540 см, то есть 5 м 40 см.",
      },
    },
    {
      title: { lv: "Futbola laukuma aplis", ru: "Круг вокруг футбольного поля" },
      text: {
        lv: "Skolas laukums ir 90 m garš un 60 m plats. Viens aplis apkārt ir 2 · (90 + 60) = 300 m — tā treneris zina, cik apļu skriet.",
        ru: "Школьное поле 90 м в длину и 60 м в ширину. Один круг вокруг — 2 · (90 + 60) = 300 м, так тренер знает, сколько кругов бежать.",
      },
    },
  ],
  "skaitli-1000": [
    {
      title: { lv: "Kāpnes uz baznīcas torni", ru: "Лестница на башню церкви" },
      text: {
        lv: "Uz Rīgas Svētā Pētera baznīcas skatu platformu var uzbraukt ar liftu 72 m augstumā. Ja kāptu pa pakāpieniem, to būtu vairāki simti — salīdzini lielus skaitļus!",
        ru: "На смотровую площадку церкви Святого Петра в Риге поднимает лифт на высоту 72 м. Если идти пешком, ступенек было бы несколько сотен — сравни большие числа!",
      },
    },
    {
      title: { lv: "Skolas bibliotēka", ru: "Школьная библиотека" },
      text: {
        lv: "Bibliotēkā ir 640 grāmatas, šogad nopirka vēl 285. Bibliotekāre saskaita 640 + 285 = 925, lai zinātu, vai plauktos pietiks vietas tūkstoš grāmatām.",
        ru: "В библиотеке 640 книг, в этом году купили ещё 285. Библиотекарь складывает 640 + 285 = 925, чтобы понять, хватит ли полок на тысячу книг.",
      },
    },
  ],
  diagrammas: [
    {
      title: { lv: "Laika ziņas", ru: "Прогноз погоды" },
      text: {
        lv: "Televīzijā laika prognozi rāda ar stabiņiem: jo augstāks stabiņš, jo vairāk nokrišņu. Uzreiz redzams, kurā dienā ņemt lietussargu.",
        ru: "По телевизору прогноз показывают столбиками: чем выше столбик, тем больше осадков. Сразу видно, в какой день брать зонт.",
      },
    },
    {
      title: { lv: "Cik soļu nedēļā?", ru: "Сколько шагов за неделю?" },
      text: {
        lv: "Telefons parāda soļus katrai dienai stabiņu diagrammā. Tu redzi, ka sestdienā pārgājienā gāji visvairāk, bet svētdien — vismazāk.",
        ru: "Телефон показывает шаги за каждый день столбчатой диаграммой. Видно, что в субботу в походе ты прошёл больше всего, а в воскресенье — меньше всего.",
      },
    },
  ],
  // ---------- 4. klase ----------
  "dalas-intro": [
    {
      title: { lv: "Puse no kūkas", ru: "Половина торта" },
      text: {
        lv: "Mamma izcepa kūku un pusi atstāja vecmāmiņai. Ja kūkā bija 12 gabali, vecmāmiņa saņems 12 : 2 = 6 gabalus.",
        ru: "Мама испекла торт и половину оставила бабушке. Если в торте было 12 кусков, бабушка получит 12 : 2 = 6 кусков.",
      },
    },
    {
      title: { lv: "Telefona baterija", ru: "Батарея телефона" },
      text: {
        lv: "Baterijas ikona rāda ceturtdaļu. Ja pilna baterija izturētu 20 stundas, ceturtdaļa — vēl apmēram 20 : 4 = 5 stundas.",
        ru: "Значок батареи показывает четверть. Если полной батареи хватает на 20 часов, четверти — ещё примерно на 20 : 4 = 5 часов.",
      },
    },
  ],
  laukums: [
    {
      title: { lv: "Krāsa sienai", ru: "Краска для стены" },
      text: {
        lv: "Siena ir 4 m plata un 3 m augsta, tātad 12 m². Uz krāsas bundžas rakstīts “pietiek 6 m²”, tāpēc vajag 2 bundžas.",
        ru: "Стена шириной 4 м и высотой 3 м, то есть 12 м². На банке краски написано «хватает на 6 м²», поэтому нужно 2 банки.",
      },
    },
    {
      title: { lv: "Zāliens pie mājas", ru: "Газон у дома" },
      text: {
        lv: "Zāliens ir 10 m × 8 m = 80 m². Uz sēklu paciņas rakstīts “1 paciņa uz 40 m²” — vajag 2 paciņas.",
        ru: "Газон 10 м × 8 м = 80 м². На пачке семян написано «1 пачка на 40 м²» — нужно 2 пачки.",
      },
    },
  ],
  "rakstu-reizinasana": [
    {
      title: { lv: "Pusdienas visai skolai", ru: "Обеды для всей школы" },
      text: {
        lv: "Skolas virtuvē katru dienu gatavo 245 porcijas. Nedēļā (5 dienās) tās ir 245 · 5 = 1225 porcijas — tā pavārs zina, cik kartupeļu pasūtīt.",
        ru: "На школьной кухне каждый день готовят 245 порций. За неделю (5 дней) это 245 · 5 = 1225 порций — так повар знает, сколько заказать картошки.",
      },
    },
    {
      title: { lv: "Sienas no ķieģeļiem", ru: "Стена из кирпичей" },
      text: {
        lv: "Mūrniekam vienā rindā ir 38 ķieģeļi, sienā būs 24 rindas. 38 · 24 = 912 ķieģeļi — tik daudz jāatved ar mašīnu.",
        ru: "У каменщика в одном ряду 38 кирпичей, в стене будет 24 ряда. 38 · 24 = 912 кирпичей — столько нужно привезти на машине.",
      },
    },
  ],
  // ---------- 5. klase ----------
  decimaldalas: [
    {
      title: { lv: "Degviela uzpildes stacijā", ru: "Топливо на заправке" },
      text: {
        lv: "Benzīna cena ir 1,65 € par litru. Uzpildot 10 litrus, komats pārvietojas: 1,65 · 10 = 16,50 €.",
        ru: "Бензин стоит 1,65 € за литр. Если заправить 10 литров, запятая сдвигается: 1,65 · 10 = 16,50 €.",
      },
    },
    {
      title: { lv: "Sporta rezultāti", ru: "Спортивные результаты" },
      text: {
        lv: "Skriešanā 60 m: Anna — 9,8 s, Jānis — 9,75 s. Uzvar Jānis, jo 9,75 < 9,80. Simtdaļas sekundes izšķir, kurš ir pirmais.",
        ru: "В беге на 60 м: Анна — 9,8 с, Янис — 9,75 с. Побеждает Янис, потому что 9,75 < 9,80. Сотые доли секунды решают, кто первый.",
      },
    },
  ],
  "dalu-saskaitisana": [
    {
      title: { lv: "Recepte ar glāzēm", ru: "Рецепт стаканами" },
      text: {
        lv: "Kūkai vajag 1/4 glāzes cukura mīklai un vēl 2/4 glāzes krēmam. Kopā 3/4 glāzes — vari nomērīt vienā reizē.",
        ru: "Для торта нужно 1/4 стакана сахара в тесто и ещё 2/4 стакана в крем. Всего 3/4 стакана — можно отмерить за один раз.",
      },
    },
    {
      title: { lv: "Ceļš uz skolu", ru: "Дорога в школу" },
      text: {
        lv: "Līdz skolai ir 1 km. Tu noej 3/10 kilometra līdz parkam un vēl 5/10 līdz veikalam. Nogājis 8/10, līdz skolai paliek 2/10 km.",
        ru: "До школы 1 км. Ты проходишь 3/10 километра до парка и ещё 5/10 до магазина. Пройдя 8/10, до школы остаётся 2/10 км.",
      },
    },
  ],
  lenki: [
    {
      title: { lv: "Pulksteņa rādītāji", ru: "Стрелки часов" },
      text: {
        lv: "Plkst. 3:00 rādītāji veido taisnu leņķi — 90°. Plkst. 6:00 tie ir vienā taisnē — 180°. Katra stunda uz ciparnīcas ir 30°.",
        ru: "В 3:00 стрелки образуют прямой угол — 90°. В 6:00 они на одной прямой — 180°. Каждый час на циферблате — это 30°.",
      },
    },
    {
      title: { lv: "Klēpjdatora ekrāns", ru: "Экран ноутбука" },
      text: {
        lv: "Ērtākais leņķis, atverot klēpjdatoru, ir ap 110°. Ja ekrāns ir 90°, jāliecas uz priekšu, bet 180° — ekrāns guļ uz galda.",
        ru: "Самый удобный угол раскрытия ноутбука — около 110°. При 90° приходится наклоняться вперёд, а при 180° экран лежит на столе.",
      },
    },
  ],
  atrums: [
    {
      title: { lv: "Vilciens uz Jūrmalu", ru: "Поезд в Юрмалу" },
      text: {
        lv: "No Rīgas līdz Majoriem ir ~30 km, vilciens brauc vidēji 45 km/h. Laiks t = 30 : 45 = 2/3 stundas jeb 40 minūtes.",
        ru: "От Риги до Майори ~30 км, поезд едет в среднем 45 км/ч. Время t = 30 : 45 = 2/3 часа, то есть 40 минут.",
      },
    },
    {
      title: { lv: "Ātruma ierobežojums", ru: "Ограничение скорости" },
      text: {
        lv: "Pilsētā drīkst braukt 50 km/h, uz šosejas — 90 km/h. 45 km ceļu pa šoseju var nobraukt pusstundā, bet pilsētas ātrumā — gandrīz stundā.",
        ru: "В городе можно ехать 50 км/ч, на шоссе — 90 км/ч. 45 км по шоссе можно проехать за полчаса, а с городской скоростью — почти за час.",
      },
    },
  ],
  pirmskaitli: [
    {
      title: { lv: "Cikādes un pirmskaitļi", ru: "Цикады и простые числа" },
      text: {
        lv: "Dažas Amerikas cikādes izlien no zemes reizi 13 vai 17 gados. Tā kā tie ir pirmskaitļi, plēsēji ar 2, 3 vai 4 gadu ciklu reti sakrīt ar cikādēm.",
        ru: "Некоторые американские цикады выходят из-под земли раз в 13 или 17 лет. Это простые числа, поэтому хищники с циклом 2, 3 или 4 года редко совпадают с цикадами.",
      },
    },
    {
      title: { lv: "Slepenas ziņas internetā", ru: "Секретные сообщения в интернете" },
      text: {
        lv: "Kad maksā internetā, savienojumu aizsargā šifrs, kas balstās uz ļoti lieliem pirmskaitļiem. Divus pirmskaitļus sareizināt ir viegli, bet atrast tos no reizinājuma — ļoti grūti.",
        ru: "Когда платишь в интернете, соединение защищает шифр на очень больших простых числах. Перемножить два простых легко, а найти их по произведению — очень трудно.",
      },
    },
  ],
  // ---------- 6. klase ----------
  procenti: [
    {
      title: { lv: "Telefona uzlāde", ru: "Зарядка телефона" },
      text: {
        lv: "Baterija rāda 40%. Ja pilna baterija ir 4000 mAh, tad tajā vēl ir 4000 · 40 : 100 = 1600 mAh.",
        ru: "Батарея показывает 40%. Если полная батарея — 4000 мА·ч, то в ней ещё 4000 · 40 : 100 = 1600 мА·ч.",
      },
    },
    {
      title: { lv: "Sula un cukurs", ru: "Сок и сахар" },
      text: {
        lv: "Uz sulas pakas rakstīts: 10 g cukura uz 100 ml, tātad 10%. Glāzē (250 ml) ir 25 g cukura — tas ir vairāk nekā 6 tējkarotes.",
        ru: "На пакете сока написано: 10 г сахара на 100 мл, то есть 10%. В стакане (250 мл) 25 г сахара — это больше 6 чайных ложек.",
      },
    },
  ],
  proporcijas: [
    {
      title: { lv: "Atšķaidīts sīrups", ru: "Разбавленный сироп" },
      text: {
        lv: "Uz pudeles rakstīts: 1 daļa sīrupa uz 4 daļām ūdens. 1,5 litru krūzei vajag 300 ml sīrupa un 1200 ml ūdens.",
        ru: "На бутылке написано: 1 часть сиропа на 4 части воды. Для кувшина 1,5 литра нужно 300 мл сиропа и 1200 мл воды.",
      },
    },
    {
      title: { lv: "Valūtas maiņa", ru: "Обмен валюты" },
      text: {
        lv: "Ceļojumā uz Zviedriju 1 € ≈ 11 kronas. Saldējums par 33 kronām maksā apmēram 33 : 11 = 3 €.",
        ru: "В поездке в Швецию 1 € ≈ 11 крон. Мороженое за 33 кроны стоит примерно 33 : 11 = 3 €.",
      },
    },
  ],
  negativi: [
    {
      title: { lv: "Lifts uz pazemes stāvvietu", ru: "Лифт на подземную парковку" },
      text: {
        lv: "Liftā pogas ir −2, −1, 0, 1, 2… Ja esi 3. stāvā un brauc uz −2, lifts pārvietojas 3 − (−2) = 5 stāvus.",
        ru: "В лифте кнопки −2, −1, 0, 1, 2… Если ты на 3-м этаже и едешь на −2, лифт проезжает 3 − (−2) = 5 этажей.",
      },
    },
    {
      title: { lv: "Bankas konts", ru: "Банковский счёт" },
      text: {
        lv: "Ja kontā ir 20 €, bet tu ar karti samaksā 25 € (kredītlimitā), atlikums kļūst −5 €. Mīnuss nozīmē parādu bankai.",
        ru: "Если на счёте 20 €, а ты платишь картой 25 € (в кредитном лимите), баланс становится −5 €. Минус означает долг банку.",
      },
    },
  ],
  aplis: [
    {
      title: { lv: "Koka stumbra apkārtmērs", ru: "Обхват ствола дерева" },
      text: {
        lv: "Mežsargi mēra koka apkārtmēru ar mērlenti. Ja apkārtmērs ir 3 m, diametrs ir apmēram 3 : 3 = 1 m — liels, vecs ozols!",
        ru: "Лесники измеряют обхват дерева рулеткой. Если обхват 3 м, диаметр примерно 3 : 3 = 1 м — большой старый дуб!",
      },
    },
    {
      title: { lv: "Apaļā dobe", ru: "Круглая клумба" },
      text: {
        lv: "Dobes diametrs ir 2 m. Lai apliktu apmali, vajag nedaudz vairāk par 3 diametriem — ap 6,3 m apmales lentes.",
        ru: "Диаметр клумбы 2 м. Чтобы выложить бордюр, нужно чуть больше 3 диаметров — около 6,3 м бордюрной ленты.",
      },
    },
  ],
  "videja-vertiba": [
    {
      title: { lv: "Vidējais laiks ceļā", ru: "Среднее время в дороге" },
      text: {
        lv: "Uz skolu nedēļā gāji 12, 15, 11, 14 un 13 minūtes. Vidēji (12 + 15 + 11 + 14 + 13) : 5 = 13 minūtes — tā zini, cikos iziet no mājām.",
        ru: "В школу за неделю ты шёл 12, 15, 11, 14 и 13 минут. В среднем (12 + 15 + 11 + 14 + 13) : 5 = 13 минут — так знаешь, когда выходить.",
      },
    },
    {
      title: { lv: "Basketbolista statistika", ru: "Статистика баскетболиста" },
      text: {
        lv: "Spēlētājs trīs spēlēs guva 18, 24 un 21 punktu. Vidēji 21 punkts spēlē — tā komentētāji salīdzina spēlētājus.",
        ru: "Игрок в трёх матчах набрал 18, 24 и 21 очко. В среднем 21 очко за игру — так комментаторы сравнивают игроков.",
      },
    },
  ],
  koordinatas: [
    {
      title: { lv: "Šahs", ru: "Шахматы" },
      text: {
        lv: "Katram šaha lauciņam ir adrese: burts un cipars, piemēram, e4. Tā šahisti pieraksta katru gājienu un var atkārtot visu partiju.",
        ru: "У каждой клетки шахматной доски есть адрес: буква и цифра, например e4. Так шахматисты записывают ходы и могут повторить всю партию.",
      },
    },
    {
      title: { lv: "Karte telefonā", ru: "Карта в телефоне" },
      text: {
        lv: "GPS katru vietu apraksta ar diviem skaitļiem — platumu un garumu. Rīgas centrs ir ap 56,95° Z platuma un 24,1° A garuma.",
        ru: "GPS описывает каждое место двумя числами — широтой и долготой. Центр Риги — около 56,95° с. ш. и 24,1° в. д.",
      },
    },
  ],
  // ---------- 7. klase ----------
  vienadojumi: [
    {
      title: { lv: "Mobilā telefona plāns", ru: "Тариф мобильного" },
      text: {
        lv: "Plāns maksā 5 € mēnesī un 0,10 € par katru minūti. Rēķins bija 8 €: 5 + 0,1x = 8, tātad x = 30 minūtes.",
        ru: "Тариф стоит 5 € в месяц и 0,10 € за каждую минуту. Счёт был 8 €: 5 + 0,1x = 8, значит x = 30 минут.",
      },
    },
    {
      title: { lv: "Taupīšana velosipēdam", ru: "Копим на велосипед" },
      text: {
        lv: "Tev jau ir 60 €, katru nedēļu atliec 15 €. Velosipēds maksā 240 €: 60 + 15x = 240, x = 12 nedēļas.",
        ru: "У тебя уже 60 €, каждую неделю откладываешь 15 €. Велосипед стоит 240 €: 60 + 15x = 240, x = 12 недель.",
      },
    },
  ],
  pakapes: [
    {
      title: { lv: "Datora atmiņa", ru: "Память компьютера" },
      text: {
        lv: "Datori skaita ar divnieku pakāpēm: 2¹⁰ = 1024 baiti ir kilobaits. Tāpēc atmiņas kartes ir 32, 64, 128 vai 256 GB — tās visas ir 2 pakāpes.",
        ru: "Компьютеры считают степенями двойки: 2¹⁰ = 1024 байта — это килобайт. Поэтому карты памяти бывают 32, 64, 128 или 256 ГБ — всё это степени 2.",
      },
    },
    {
      title: { lv: "Attālums līdz Saulei", ru: "Расстояние до Солнца" },
      text: {
        lv: "Līdz Saulei ir ap 150 000 000 km. Zinātnieki to raksta īsāk: 1,5 · 10⁸ km. Desmit pakāpes palīdz nesajaukt nulles.",
        ru: "До Солнца около 150 000 000 км. Учёные пишут короче: 1,5 · 10⁸ км. Степени десяти помогают не запутаться в нулях.",
      },
    },
  ],
  trijsturi: [
    {
      title: { lv: "Velosipēda rāmis", ru: "Рама велосипеда" },
      text: {
        lv: "Velosipēda rāmis sastāv no diviem trijstūriem. Trijstūris ir stingra figūra — to nevar saspiest, nemainot malas, tāpēc rāmis ir izturīgs.",
        ru: "Рама велосипеда состоит из двух треугольников. Треугольник — жёсткая фигура: его нельзя сжать, не меняя сторон, поэтому рама прочная.",
      },
    },
    {
      title: { lv: "Jumta slīpums", ru: "Уклон крыши" },
      text: {
        lv: "Latvijā jumtiem jābūt stāviem, lai sniegs noslīdētu. Ja pie pamata leņķi ir 50° un 50°, korē ir 180° − 100° = 80°.",
        ru: "В Латвии крыши делают крутыми, чтобы снег соскальзывал. Если углы у основания 50° и 50°, в коньке 180° − 100° = 80°.",
      },
    },
  ],
  "procentu-izmainas": [
    {
      title: { lv: "Inflācija", ru: "Инфляция" },
      text: {
        lv: "Ja cenas gadā pieaug par 5%, maize par 2,00 € nākamgad maksās 2,10 €. Tāpēc tie paši 10 € pēc gada nopērk mazāk.",
        ru: "Если цены за год вырастают на 5%, хлеб за 2,00 € в следующем году будет стоить 2,10 €. Поэтому те же 10 € через год покупают меньше.",
      },
    },
    {
      title: { lv: "Krājkonts bankā", ru: "Сберегательный счёт" },
      text: {
        lv: "Bankā noguldīji 200 € ar 3% gadā. Pēc gada būs 206 €, bet pēc otra — 212,18 €, jo procenti tiek rēķināti arī no iepriekšējiem procentiem.",
        ru: "Ты положил в банк 200 € под 3% годовых. Через год будет 206 €, а через два — 212,18 €, потому что проценты начисляются и на прошлые проценты.",
      },
    },
  ],
  nevienadibas: [
    {
      title: { lv: "Bagāža lidmašīnā", ru: "Багаж в самолёте" },
      text: {
        lv: "Rokas bagāža drīkst svērt ≤ 10 kg. Soma sver 1,5 kg, katra grāmata 0,5 kg, citas mantas 5 kg: 1,5 + 5 + 0,5x ≤ 10, tātad x ≤ 7 grāmatas.",
        ru: "Ручная кладь — не больше 10 кг. Сумка весит 1,5 кг, каждая книга 0,5 кг, другие вещи 5 кг: 1,5 + 5 + 0,5x ≤ 10, значит x ≤ 7 книг.",
      },
    },
    {
      title: { lv: "Kabatas naudas budžets", ru: "Бюджет карманных денег" },
      text: {
        lv: "Tev ir 20 €, kino biļete maksā 7 €, popkorns — 3 € porcija. 7 + 3x ≤ 20, x ≤ 4,3 — vari nopirkt ne vairāk kā 4 porcijas visiem draugiem.",
        ru: "У тебя 20 €, билет в кино 7 €, попкорн — 3 € порция. 7 + 3x ≤ 20, x ≤ 4,3 — можно купить не больше 4 порций на всех друзей.",
      },
    },
  ],
  // ---------- 8. klase ----------
  "lineara-funkcija": [
    {
      title: { lv: "Elektrības rēķins", ru: "Счёт за электричество" },
      text: {
        lv: "Rēķins = 4 € abonēšanas maksa + 0,18 € par katru kWh: y = 0,18x + 4. Patērējot 150 kWh, jāmaksā 31 €. Grafiks ir taisne.",
        ru: "Счёт = 4 € абонентская плата + 0,18 € за каждый кВт·ч: y = 0,18x + 4. При расходе 150 кВт·ч платишь 31 €. График — прямая.",
      },
    },
    {
      title: { lv: "Svece deg", ru: "Свеча горит" },
      text: {
        lv: "Svece ir 20 cm gara un stundā sadeg 2,5 cm: h = 20 − 2,5t. Pēc 8 stundām tā būs izdegusi — tur grafiks krusto x asi.",
        ru: "Свеча длиной 20 см сгорает на 2,5 см в час: h = 20 − 2,5t. Через 8 часов она догорит — там график пересекает ось x.",
      },
    },
  ],
  pitagors: [
    {
      title: { lv: "Televizora izmērs", ru: "Размер телевизора" },
      text: {
        lv: "Televizoriem norāda diagonāli collās. Ekrāns 48 × 36 collas ir “60 collu” televizors, jo √(48² + 36²) = 60.",
        ru: "У телевизоров указывают диагональ в дюймах. Экран 48 × 36 дюймов — это «60-дюймовый» телевизор, потому что √(48² + 36²) = 60.",
      },
    },
    {
      title: { lv: "Taisns stūris celtniecībā", ru: "Прямой угол на стройке" },
      text: {
        lv: "Celtnieki pārbauda, vai stūris ir taisns, ar likumu 3–4–5: uz vienas sienas atzīmē 3 m, uz otras 4 m. Ja attālums starp atzīmēm ir 5 m, stūris ir 90°.",
        ru: "Строители проверяют прямой угол правилом 3–4–5: на одной стене отмечают 3 м, на другой 4 м. Если между отметками 5 м, угол равен 90°.",
      },
    },
  ],
  kvadratsakne: [
    {
      title: { lv: "Cik tālu redz horizontu?", ru: "Как далеко виден горизонт?" },
      text: {
        lv: "Attālumu līdz horizontam km aptuveni aprēķina kā 3,57 · √h, kur h ir acu augstums metros. No 16 m augstas kāpas redz ~3,57 · 4 ≈ 14 km tālu jūrā.",
        ru: "Расстояние до горизонта в км примерно равно 3,57 · √h, где h — высота глаз в метрах. С дюны высотой 16 м видно ~3,57 · 4 ≈ 14 км в море.",
      },
    },
    {
      title: { lv: "Kvadrātveida dārza dobe", ru: "Квадратная грядка" },
      text: {
        lv: "Komposta paciņa pietiek 49 m² kvadrātveida dobei. Lai zinātu, cik garu apmali likt, vajag sānu: √49 = 7 m.",
        ru: "Пачки компоста хватает на квадратную грядку 49 м². Чтобы знать длину бортика, нужна сторона: √49 = 7 м.",
      },
    },
  ],
  varbutiba: [
    {
      title: { lv: "Galda spēle ar kauliņu", ru: "Настольная игра с кубиком" },
      text: {
        lv: "Lai izietu no cietuma, jāuzmet 6. Varbūtība vienā metienā ir 1/6, tāpēc vidēji jāgaida apmēram 6 gājienus.",
        ru: "Чтобы выйти из тюрьмы, нужно выбросить 6. Вероятность за один бросок 1/6, поэтому в среднем ждать около 6 ходов.",
      },
    },
    {
      title: { lv: "Loterija", ru: "Лотерея" },
      text: {
        lv: "Loterijā no 1000 biļetēm 10 ir laimīgas. Varbūtība laimēt ir 10/1000 = 1/100 — 99 reizes no 100 tu nelaimēsi. Matemātika palīdz neiztērēt naudu velti.",
        ru: "В лотерее из 1000 билетов 10 выигрышных. Вероятность выиграть 10/1000 = 1/100 — 99 раз из 100 ты не выиграешь. Математика помогает не тратить деньги зря.",
      },
    },
  ],
  "rinkis-pi": [
    {
      title: { lv: "Kura pica ir izdevīgāka?", ru: "Какая пицца выгоднее?" },
      text: {
        lv: "Viena 40 cm pica vai divas 28 cm picas? S = πr²: 3,14 · 20² ≈ 1256 cm², bet 2 · 3,14 · 14² ≈ 1231 cm². Viena lielā ir pat vairāk!",
        ru: "Одна пицца 40 см или две по 28 см? S = πr²: 3,14 · 20² ≈ 1256 см², а 2 · 3,14 · 14² ≈ 1231 см². Одна большая — даже больше!",
      },
    },
    {
      title: { lv: "Rīgas panorāmas rats", ru: "Колесо обозрения" },
      text: {
        lv: "Ja panorāmas rata diametrs ir 30 m, vienā apgriezienā kabīne veic π · 30 ≈ 94 m. Inženieri tā aprēķina kabīnes ātrumu.",
        ru: "Если диаметр колеса обозрения 30 м, за один оборот кабинка проходит π · 30 ≈ 94 м. Так инженеры рассчитывают скорость кабинки.",
      },
    },
  ],
  "moda-mediana": [
    {
      title: { lv: "Apavu veikals", ru: "Обувной магазин" },
      text: {
        lv: "Veikalam svarīgākā ir moda — biežāk pirktais izmērs. Ja visbiežāk pērk 38. izmēru, to pasūta visvairāk, nevis “vidējo” 38,7.",
        ru: "Магазину важнее всего мода — самый частый размер. Если чаще всего покупают 38-й размер, его заказывают больше всего, а не «средний» 38,7.",
      },
    },
    {
      title: { lv: "Mājokļu cenas", ru: "Цены на жильё" },
      text: {
        lv: "Ielā piecas mājas maksā 80, 90, 95, 100 un 900 tūkstošus €. Vidējā cena 253 000 € maldina, bet mediāna 95 000 € parāda tipisko māju.",
        ru: "На улице пять домов стоят 80, 90, 95, 100 и 900 тысяч €. Средняя цена 253 000 € обманчива, а медиана 95 000 € показывает типичный дом.",
      },
    },
  ],
  // ---------- 9. klase ----------
  kvadratvienadojumi: [
    {
      title: { lv: "Strūklaka", ru: "Фонтан" },
      text: {
        lv: "Strūklakas ūdens augstums ir h = 8t − 5t². Atrisinot 8t − 5t² = 0, iegūst t = 1,6 s — tik ilgi lāse ir gaisā.",
        ru: "Высота струи фонтана h = 8t − 5t². Решив 8t − 5t² = 0, получаем t = 1,6 с — столько капля в воздухе.",
      },
    },
    {
      title: { lv: "Fotorāmis", ru: "Фоторамка" },
      text: {
        lv: "Foto 20 × 30 cm ielikts rāmī ar vienāda platuma x malu; kopējais laukums 875 cm²: (20 + 2x)(30 + 2x) = 875, tātad x = 2,5 cm.",
        ru: "Фото 20 × 30 см вставлено в рамку с полями ширины x; общая площадь 875 см²: (20 + 2x)(30 + 2x) = 875, значит x = 2,5 см.",
      },
    },
  ],
  sistemas: [
    {
      title: { lv: "Divi mobilie plāni", ru: "Два мобильных тарифа" },
      text: {
        lv: "Plāns A: 3 € + 0,05 € par minūti, plāns B: 6 € + 0,02 €. Sistēma y = 3 + 0,05x un y = 6 + 0,02x dod x = 100 minūtes — virs tām izdevīgāks ir B.",
        ru: "Тариф A: 3 € + 0,05 € за минуту, тариф B: 6 € + 0,02 €. Система y = 3 + 0,05x и y = 6 + 0,02x даёт x = 100 минут — выше этого выгоднее B.",
      },
    },
    {
      title: { lv: "Augļu salāti", ru: "Фруктовый салат" },
      text: {
        lv: "2 āboli un 3 banāni sver 1 kg, bet 4 āboli un 1 banāns — 1,2 kg. Atrisinot sistēmu, uzzini: ābols sver 0,26 kg, banāns — 0,16 kg.",
        ru: "2 яблока и 3 банана весят 1 кг, а 4 яблока и 1 банан — 1,2 кг. Решив систему, узнаёшь: яблоко весит 0,26 кг, банан — 0,16 кг.",
      },
    },
  ],
  lidziba: [
    {
      title: { lv: "Kartes un modeļi", ru: "Карты и модели" },
      text: {
        lv: "Modeļa vilciens mērogā 1 : 87 ir līdzīgs īstajam. Ja modeļa vagons ir 23 cm, īstais ir 23 · 87 ≈ 2000 cm jeb 20 m garš.",
        ru: "Модель поезда в масштабе 1 : 87 подобна настоящему. Если вагон модели 23 см, настоящий — 23 · 87 ≈ 2000 см, то есть 20 м.",
      },
    },
    {
      title: { lv: "Fotoaparāts", ru: "Фотоаппарат" },
      text: {
        lv: "Kamerā attēls rodas no līdzīgiem trijstūriem: objekta augstums pret attālumu ir tāds pats kā attēla augstums pret objektīva fokusa attālumu.",
        ru: "В камере изображение строится подобными треугольниками: высота предмета к расстоянию равна высоте изображения к фокусному расстоянию объектива.",
      },
    },
  ],
  trigonometrija: [
    {
      title: { lv: "Lidmašīnas nolaišanās", ru: "Посадка самолёта" },
      text: {
        lv: "Lidmašīnas nosēžas 3° leņķī. Ja tā ir 300 m augstumā, līdz skrejceļam ir 300 : tg 3° ≈ 5,7 km — piloti to zina, sākot nolaišanos.",
        ru: "Самолёты садятся под углом 3°. Если высота 300 м, до полосы 300 : tg 3° ≈ 5,7 км — пилоты знают это, начиная снижение.",
      },
    },
    {
      title: { lv: "Saules paneļi", ru: "Солнечные панели" },
      text: {
        lv: "Latvijā saules paneļus liek ~40° leņķī. Ja panelis ir 1,7 m garš, tā augšmala paceļas 1,7 · sin 40° ≈ 1,1 m virs jumta.",
        ru: "В Латвии солнечные панели ставят под углом ~40°. Если панель длиной 1,7 м, её верхний край поднят на 1,7 · sin 40° ≈ 1,1 м над крышей.",
      },
    },
  ],
  tilpums: [
    {
      title: { lv: "Akvārijs", ru: "Аквариум" },
      text: {
        lv: "Akvārijs 60 × 30 × 40 cm ietilpst 72 000 cm³ = 72 litrus. Pēc tilpuma izvēlas filtru un nosaka, cik zivju tajā var dzīvot.",
        ru: "Аквариум 60 × 30 × 40 см вмещает 72 000 см³ = 72 литра. По объёму выбирают фильтр и решают, сколько рыб в нём может жить.",
      },
    },
    {
      title: { lv: "Smiltis smilšu kastei", ru: "Песок для песочницы" },
      text: {
        lv: "Smilšu kaste ir 2 m × 2 m, smilšu slānis 0,25 m. Vajag 2 · 2 · 0,25 = 1 m³ smilšu — tieši tik var pasūtīt ar vienu kravu.",
        ru: "Песочница 2 м × 2 м, слой песка 0,25 м. Нужно 2 · 2 · 0,25 = 1 м³ песка — ровно столько можно заказать одной машиной.",
      },
    },
  ],
  progresija: [
    {
      title: { lv: "Sēdvietas amfiteātrī", ru: "Места в амфитеатре" },
      text: {
        lv: "Mežaparka estrādē pirmajā rindā ir 20 vietas, katrā nākamajā — par 2 vairāk. 15. rindā ir 20 + 14 · 2 = 48 vietas.",
        ru: "На эстраде Межапарка в первом ряду 20 мест, в каждом следующем — на 2 больше. В 15-м ряду 20 + 14 · 2 = 48 мест.",
      },
    },
    {
      title: { lv: "Taksometra skaitītājs", ru: "Счётчик такси" },
      text: {
        lv: "Brauciena sākumā skaitītājs rāda 2 €, un katrs kilometrs pieskaita 0,80 €. Summas pēc 1, 2, 3… km veido aritmētisko progresiju.",
        ru: "В начале поездки счётчик показывает 2 €, и каждый километр прибавляет 0,80 €. Суммы после 1, 2, 3… км образуют арифметическую прогрессию.",
      },
    },
  ],
  "trijstura-nevienadiba": [
    {
      title: { lv: "Navigācija", ru: "Навигация" },
      text: {
        lv: "No Rīgas uz Cēsīm taisni ir ~80 km, bet ceļš caur Siguldu un Valmieru noteikti ir garāks. Trijstūra nevienādība: apkārtceļš nekad nav īsāks par taisno.",
        ru: "От Риги до Цесиса напрямую ~80 км, а дорога через Сигулду и Валмиеру точно длиннее. Неравенство треугольника: объезд никогда не короче прямого пути.",
      },
    },
    {
      title: { lv: "Saliekamais galds", ru: "Складной стол" },
      text: {
        lv: "Galda kāja ar 70 cm un 50 cm stieņiem var atvērties tikai līdz attālumam, kas mazāks par 120 cm. Inženieri tā aprēķina, cik plati galds atveras.",
        ru: "Ножка стола из стержней 70 см и 50 см может раскрыться только на расстояние меньше 120 см. Так инженеры рассчитывают, насколько раскрывается стол.",
      },
    },
  ],
};
