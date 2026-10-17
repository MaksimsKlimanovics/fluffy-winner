/**
 * Skola2030: the national basic education standard for mathematics.
 *
 * Source: Cabinet of Ministers Regulation No. 747 of 27 November 2018,
 * Annex 6, "Sasniedzamie rezultāti matemātikas mācību jomā, beidzot 3., 6. un
 * 9. klasi" (likumi.lv id 303768). The extracted text is kept in
 * docs/skola2030/ and tests check every quote below against it word for word.
 *
 * The standard sets outcomes for the END of three stages (grades 1–3, 4–6,
 * 7–9), not per grade. A topic may only cite outcomes of the stage its grade
 * belongs to. `[..]` marks a formula that is an image in the source PDF.
 */

export type Stage = 3 | 6 | 9;

export const SOURCE = {
  lv: "MK 27.11.2018. noteikumi Nr. 747, 6. pielikums “Sasniedzamie rezultāti matemātikas mācību jomā, beidzot 3., 6. un 9. klasi”",
  ru: "Правила КМ № 747 от 27.11.2018, приложение 6 «Sasniedzamie rezultāti matemātikas mācību jomā, beidzot 3., 6. un 9. klasi»",
  url: "https://likumi.lv/ta/id/303768",
};

export function stageOf(grade: number): Stage {
  return grade <= 3 ? 3 : grade <= 6 ? 6 : 9;
}

/** The six big ideas of the mathematics learning area (standard, verbatim). */
export const BIG_IDEAS: Record<string, string> = {
  "1": "Matemātikas valodu izmanto saziņai un zinātniskai jēdzienu, ideju, problēmu risinājumu aprakstīšanai",
  "2": "Risināt problēmu matemātikai raksturīgi nozīmē saskatīt struktūras, sistēmas, sakarības, veidot vispārinājumus un tos pierādīt",
  "3": "Skaitļus izmanto konkrētu, arī praktisku uzdevumu atrisināšanai. Katrai darbībai ar skaitļiem ir noteikta jēga, un to izpildei ir noteikti likumi/algoritmi",
  "4": "Sakarības starp lielumiem apraksta algebriskie modeļi un funkcijas. Izmantojot šos modeļus problēmu risināšanai, tos pārveido, nodrošinot ekvivalenci",
  "5": "Datus par objektiem, situācijām, notikumiem, procesiem var matemātiski apstrādāt, analizēt, lai pieņemtu pamatotus lēmumus",
  "6": "Figūru īpašību, novietojuma, to raksturojošo lielumu izpēte ļauj risināt konkrētas, arī praktiskas, problēmas, formulēt vispārīgus secinājumus par objektiem, telpu, formu",
};

/** Outcomes cited by topics, keyed "<stage>:<code>" — codes repeat across stages. */
export const OUTCOMES: Record<string, string> = {
  // ---------- beidzot 3. klasi ----------
  "3:1.1.2":
    "Lieto piktogrammas vai burtus, ja kāds no skaitļiem nav zināms vai nav konkrēts, skaidro šādus pierakstus, piemēram, a · 4 = a + a + a + a, lieto garuma, masas, laika, naudas mērvienību apzīmējumus",
  "3:1.2.2":
    "Naturālo skaitļu salīdzināšanu un darbības ar tiem modelē ar reāliem objektiem, ģeometriski, uz skaitļu taisnes, ar simta kvadrātu, skaidro matemātisku jēdzienu ar paša izvēlētu attēlojumu, tēlu, asociāciju u. tml.",
  "3:3.1.1":
    "Skaidro naturāla skaitļa decimālo sastāvu, tā saistību ar pierakstu konkrētos piemēros, izmantojot dažādus modeļus un attēlojumus.",
  "3:3.1.3":
    "Lasa negatīvus skaitļus, nosakot temperatūru, un izsaka centos un/vai eiro naudas summu, kas pierakstīta decimāldaļas veidā",
  "3:3.2.1":
    "Veic darbības ar naturāliem skaitļiem (saskaita un atņem 1000 apjomā, reizina un dala ar viencipara skaitli, ar 10, ar 100), izmantojot skaitļu decimālo sastāvu, darbību īpašības, skaidrojot izvēlēto/ izmantoto darbību izpildes paņēmienu.",
  "3:3.2.2":
    "Darbības ar naturāliem skaitļiem vienkāršākos gadījumos izpilda galvā (saskaitīšanu, atņemšanu 20 apjomā un pilnos desmitos, simtos, reizināšanas tabulas apjomā).",
  "3:3.2.4": "Veic aritmētiskās darbības ar nosauktiem skaitļiem",
  "3:3.3.1": "Pieraksta reālu situāciju ar aritmētiskām darbībām, naturālu skaitļu izteiksmēm (1–2 darbības)",
  "3:4.1.1":
    "Turpina, papildina reālu objektu, figūru, skaitļu virkni un figūru, skaitļu sakārtojumus, piemēram, skaitļu kvadrātus, vienkāršās situācijās, ievērojot saskatīto likumsakarību, piemēram, periodiskumu, saistību ar citiem elementiem.",
  "3:5.1.2": "Nolasa informāciju no dažādu veidu tabulām, diagrammām, īsa vārdiska teksta",
  "3:5.1.3":
    "Lasa un ar pedagoga palīdzību veido vienkāršas tabulas lielumu pierakstīšanai, tabulā apkopotos datus attēlo stabiņveida diagrammā (tai skaitā veidotā ar piktogrammām, punktiem) un otrādi",
  "3:5.1.4": "Salīdzina datus par diviem dažādiem objektiem.",
  "3:5.3.3": "Nosaka laiku, izmantojot gan analogo, gan digitālo pulksteni",
  "3:5.3.4":
    "Zina galvenās sakarības starp garuma, masas, laika, naudas mērvienībām un izsaka lielāku mērvienību (garumam, masai, naudai) mazākā, pāriet no vienas laika vienības uz citu",
  "3:6.1.1":
    "Praktiskā darbībā nosaka figūru, telpisku ķermeņu īpašības, raksturo tās, lietojot jēdzienus \"liekta līnija\", \"taisna līnija\", \"nogrieznis\", \"lauzta līnija\", \"riņķis\", \"daudzstūris\", \"šķautne\", \"skaldne\", \"kubs\", \"taisnstūru skaldnis\", \"piramīda\", \"lode\", \"cilindrs\", \"konuss\", praktiski veido figūras ar noteiktu īpašību.",
  "3:6.1.2":
    "Klasificē daudzstūrus, četrstūrus, taisnstūrus, grupē figūras, nosakot kopīgo un atšķirīgo, piederību grupai.",
  "3:6.4.2":
    "Aprēķina lauztas līnijas garumu, daudzstūra apkārtmēru, izmantojot mērījumos iegūtos vai dotos mērus, nosaka plaknes figūras laukumu un telpiska ķermeņa tilpumu kā rūtiņu vai kubiņu skaitu",

  // ---------- beidzot 6. klasi ----------
  "6:1.2.2":
    "Izmanto dažādus attēlojumus, skaidrojot darbības ar racionāliem skaitļiem, racionālu skaitļu salīdzināšanu, piemēram, skaitļu taisne un ģeometriski objekti parasto daļu salīdzināšanai, saskaitīšanai, vērsti nogriežņi uz vienas taisnes darbībām ar dažādzīmju skaitļiem",
  "6:2.1.3":
    "Veido un pārbauda vispārinājumus, aplūkojot atsevišķus gadījumus, piemēram, formulējot dalāmības pazīmes naturāliem skaitļiem, vai spriež vispārīgi, piemēram, salīdzinot vienas darbības burtu izteiksmes",
  "6:2.2.6":
    "Pazīstamās un jaunās situācijās lieto paņēmienus \"spriežu no beigām\", piemēram, nosakot sākotnējo daudzumu situācijā, kas raksturota ar daļām, \"sadalu problēmu daļās\", piemēram, problēmsituācijā atsevišķi aplūko pozitīvus un negatīvus skaitļus",
  "6:2.3.3":
    "Izveido pretpiemēru jaunā situācijā, saistot to ar zināmo, piemēram, izvērtē patiesumu apgalvojumam \"taisnstūriem ar vienādu perimetru arī laukumi ir vienādi\"",
  "6:3.1.1":
    "Skaidro racionāla skaitļa (pierakstīts kā decimāldaļa) decimālo sastāvu, tā saistību ar pierakstu konkrētos piemēros.",
  "6:3.1.4":
    "Grupē racionālus skaitļus pēc noteiktas pazīmes, atšķir pirmskaitļus un saliktus skaitļus (līdz 100)",
  "6:3.2.1":
    "Veic darbības ar parastajām daļām, decimāldaļām, pozitīviem un negatīviem skaitļiem (saskaita, atņem, reizina, dala, kāpina), izmantojot atbilstošus skaitļa pieraksta veidus, lietojot darbību īpašības, saistību starp darbībām, piemērotus algoritmus.",
  "6:3.2.2":
    "Skaidro ar daļām, procentiem saistītos jēdzienus un identiskos pārveidojumus, piemēram, kurš lielums dotajā situācijā ir veselais jeb 100 %, ko nozīmē saīsināt daļu.",
  "6:3.2.3":
    "Aprēķina vērtību racionālu skaitļu izteiksmēm, demonstrējot ieradumu vienkāršus aprēķinus izpildīt galvā, ja nepieciešams, lietot digitālos rīkus",
  "6:3.2.4":
    "Aprēķina vērtību daļai (procentiem) no skaitļa, skaitli, ja zināma tā daļas (procentu) vērtība, izsaka vienu skaitli kā otra skaitļa daļu (procentus) situācijās ar matemātisku, citu mācību jomu un reālu kontekstu, izvēloties atbilstošu un sev piemērotu risinājuma gaitu",
  "6:3.2.6":
    "Izmanto konkrētus skaitļus vai to aptuvenās vērtības reālā kontekstā, piemēram, plānojot izdevumus, veidojot spriedumus matemātiskā kontekstā, prognozējot un/vai pārbaudot iegūto rezultātu, veicot darbības ar racionāliem skaitļiem, tai skaitā ar digitāliem rīkiem",
  "6:4.2.3":
    "Veido un izmanto sakarības starp trim lielumiem viena aprēķināšanai, ja divi no tiem zināmi, piemēram, ātrums – ceļš – laiks",
  "6:4.2.4":
    "Ilustrējot ar piemēriem, skaidro, kas ir tieši proporcionāli lielumi, apgriezti proporcionāli lielumi, risina uzdevumus par proporcionāliem lielumiem, spriežot un veicot secīgas darbības, izvēloties sev piemērotu paņēmienu.",
  "6:4.2.7": "Lieto mērogu matemātiskā, reālā kontekstā",
  "6:5.1.5": "Aprēķina datu kopas aritmētisko vidējo",
  "6:5.3.1":
    "Skaidro, kā mēra leņķi, un mēra leņķa lielumu ar transportieri (tai skaitā ar digitāliem rīkiem), izvērtē, ar kādu precizitāti veikti mērījumi.",
  "6:5.3.2": "Skaidro un/vai ilustrē ar modeli laukuma un tilpuma vienības, ātruma mērvienības km/h, m/s.",
  "6:6.1.3": "Klasificē leņķus pēc to veida (šaurs, taisns, plats) vai lieluma, trijstūrus pēc malām vai leņķiem",
  "6:6.2.1":
    "Koordinātu plaknē nosaka punkta koordinātas un atliek punktu pēc tā koordinātām, attēlo plaknes figūru atbilstoši dotajiem nosacījumiem",
  "6:6.4.1":
    "Praktiskos un matemātiskos kontekstos aprēķina leņķa lielumu, lietojot sakarības starp leņķiem, kurus veido stari ar vienu sākumpunktu, taisnstūra perimetru, laukumu, malu, ja zināms otras malas garums un laukums vai perimetrs, kombinētu (var sadalīt taisnstūros) figūru laukumu, riņķa līnijas garumu (aptuveni trīs diametri), taisnstūra paralēlskaldņa tilpumu.",

  // ---------- beidzot 9. klasi ----------
  "9:1.1.3": "Lasa, pieraksta šaurā leņķa trigonometriskās sakarības, demonstrējot izpratni par simbolu lietojumu",
  "9:3.1.1":
    "Konkrētos piemēros skaidro, kas ir iracionāla skaitļa, kas pierakstīts kā kvadrātsakne no racionāla skaitļa, skaitliskā vērtība un kā to iegūt, lietojot arī digitālos rīkus.",
  "9:3.1.2":
    "Lasa un pieraksta reālu skaitli dažādos veidos atbilstoši situācijas kontekstam, tai skaitā izmantojot 10 pakāpes (kāpinātājs ir vesels skaitlis)",
  "9:3.2.1":
    "Veic darbības ar reāliem skaitļiem (saskaita, atņem, reizina, dala, kāpina veselā pakāpē, aprēķina kvadrātsaknes vērtību), izvēloties atbilstošu skaitļa pieraksta veidu, lietojot darbību īpašības, saistību starp darbībām, piemērotus algoritmus.",
  "9:3.2.4":
    "Lieto daļas, procentus, procentuālo palielinājumu, samazinājumu, salīdzinājumu, situācijās ar matemātisku, citu mācību jomu un reālu kontekstu, tai skaitā izmantojot digitālos rīkus.",
  "9:3.2.5": "Analizē un izvērtē procentu lietojumu ikdienā, plašsaziņas līdzekļu materiālos",
  "9:3.2.8": "Noapaļo bezgalīgu decimāldaļu ar norādīto vai izvēlēto precizitāti",
  "9:4.1.1":
    "Saskata likumsakarību reālu skaitļu virknē, tai skaitā aritmētiskajā progresijā, \"figūru virknē\", un pieraksta to formulas veidā.",
  "9:4.2.2":
    "Veido un lasa funkcijas (lineāra, kvadrātfunkcija, [..], kā arī svešas/nezināmas) attēlojumus dažādos veidos (tabulā, vārdiski, grafiski, ar formulu), pāriet no vienas attēlojuma formas uz citu, izmantojot arī digitālos rīkus, situācijās ar matemātisku un citu jomu reālu kontekstu.",
  "9:4.2.3":
    "Skaidro reālo situāciju pēc grafiskā attēla, lietojot gan matemātisko terminoloģiju (definīcijas apgabals, vērtību apgabals, arguments, funkcijas vērtība, augoša/dilstoša funkcija, funkcijas nulles, funkcijas vērtības – pozitīvas/negatīvas), gan reālo kontekstu",
  "9:4.3.3":
    "Veic darbības ar monomiem un polinomiem, lieto pakāpju īpašības, sadala polinomus reizinātājos, iznesot kopīgo reizinātāju pirms iekavām un lietojot saīsinātās reizināšanas formulas (kvadrātu starpība, summas/starpības kvadrāts).",
  "9:4.3.4":
    "Atrisina lineāru vienādojumu, kvadrātvienādojumu, to sistēmas, vienādojumu [..] (x – nezināmais), atrisina lineāru nevienādību un kvadrātnevienādību, izvēloties sev piemērotāko vai situācijai atbilstošāko risinājuma paņēmienu.",
  "9:4.4.1":
    "Modelē ar algebriskām izteiksmēm, vienādojumiem (tai skaitā proporcijām) un to sistēmām, nevienādībām situāciju ar matemātisku, citu mācību jomu un reālu kontekstu",
  "9:5.1.4":
    "Aprēķina datu kopas modu, mediānu, amplitūdu, absolūto un relatīvo biežumu, izmantojot arī izklājlapās iebūvētās funkcijas",
  "9:5.1.6": "Izvērtē datu ticamību, formulē datos balstītus secinājumus un raksturo tendences",
  "9:5.2.2":
    "Izvēlas paņēmienu notikuma visu vienādi iespējamo iznākumu skaita un labvēlīgo iznākumu skaita noteikšanai un aprēķina notikuma varbūtību.",
  "9:5.2.3":
    "Formulē pieņēmumu par notikuma varbūtības skaitlisko vērtību, izvērtē jēdziena \"varbūtība\" lietošanu ikdienā, plašsaziņas līdzekļos",
  "9:6.2.1": "Pēta un secina, kādiem jābūt nogriežņu garumiem, lai nogriežņi veidotu trijstūri.",
  "9:6.3.3":
    "Nosaka līdzīgus trijstūrus, lieto sakarības starp to lielumiem matemātiskos un praktiskos kontekstos, demonstrējot izpratni par jēdzienu \"attiecība\", \"proporcionalitāte\" lietošanu ģeometriskā kontekstā.",
  "9:6.4.1":
    "Zināmās un jaunās situācijās, arī ar praktisku kontekstu, aprēķina leņķus, kas rodas, krustojoties 2–3 taisnēm, trijstūru, četrstūru nezināmos leņķus un malas, taisnleņķa trijstūra nezināmo malu, izmantojot Pitagora teorēmu un tai apgriezto teorēmu, šaurā leņķa trigonometriskās sakarības, riņķa līnijas garumu (sakarība ar π) un riņķa laukumu, trijstūra, dažādu četrstūru laukumus (lietojot laukuma īpašības un atbilstošas formulas), telpisku figūru (prizma, cilindrs) virsmas laukumus un tilpumu",
  "9:6.4.3": "Lieto trijstūra nevienādību situācijās ar matemātisku un reālu kontekstu",
};

export function outcome(stage: Stage, code: string): string | undefined {
  return OUTCOMES[`${stage}:${code}`];
}

/**
 * Problem-solving strategies the standard names for each stage (outcomes
 * 2.2.5 / 2.2.6). The tutor uses these so its explanations practise exactly
 * the methods the child is expected to master.
 */
export const STRATEGIES: Record<Stage, string> = {
  3: "\"mēģinu un pārbaudu\" (try and check)",
  6: "\"spriežu no beigām\" (work backwards) and \"sadalu problēmu daļās\" (split the problem into parts)",
  9: "\"pāreja uz līdzīgu, vienkāršāku problēmu\" (move to a similar, simpler problem) and \"apskatu kaut kādā ziņā īpašu lielumu\" (look at a special value)",
};
