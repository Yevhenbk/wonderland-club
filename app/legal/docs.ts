import { org, organizer } from "./organizer";

/**
 * The legal pages' text: the terms of sale and the privacy policy, in
 * Ukrainian (the site's language) and Polish (for Polish buyers and
 * authorities; it prevails if the two differ).
 *
 * Each section is a numbered list of points. A point may hold a link as
 * [label](href) and a bulleted list as an array.
 *
 * Drafted for a private person selling the tickets, refunds only
 * when a night is cancelled or moved, entry 18+. Have it reviewed by someone
 * who knows Polish consumer and data protection law before real sales.
 */

export type Point = string | string[];
export interface Section {
  title: string;
  points: Point[];
}
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

export const UPDATED = "12.10.2026";
const SITE = "wonderlandkrk.club";
const VENUE = "Stefana Batorego 1, Kraków";

/* ------------------------------------------------------------------ terms */

export function termsUk(): LegalDoc {
  const nip = organizer.nip ? `, NIP: ${organizer.nip}` : "";
  return {
    title: "Регламент продажу квитків",
    updated: UPDATED,
    intro: `Цей регламент визначає, як купити квиток на вечірку Wonderland Club через сайт ${SITE} і за якими правилами проходить вхід на подію. Купуючи квиток, ти приймаєш цей регламент.`,
    sections: [
      {
        title: "Організатор",
        points: [
          `Продавцем квитків і організатором подій є ${org("name", "uk")}, адреса для кореспонденції: ${org("address", "uk")}${nip} (далі «Організатор»).`,
          `Зв'язок з Організатором: ${org("email", "uk")}.`,
          `Подія проходить у клубі ${org("club", "uk")} за адресою ${VENUE}. Клуб не є продавцем квитків.`,
        ],
      },
      {
        title: "Квитки",
        points: [
          "Квиток є електронним документом з унікальним QR-кодом, який дає право на вхід на конкретну подію, вказану в ньому.",
          "Стандартний квиток дає право на вхід однієї особи.",
          "VIP-зона купується цілком однією покупкою для компанії, кількість гостей якої вказана при купівлі. Кількість VIP-зон обмежена: коли всі зони певного розміру продано, купити їх неможливо.",
        ],
      },
      {
        title: "Купівля та оплата",
        points: [
          "Квитки продаються через сайт. Ціни вказані в польських злотих (zł) і є кінцевими.",
          "Оплату приймає платіжний оператор Stripe: картка, BLIK, Apple Pay або Google Pay. Організатор не отримує і не зберігає даних платіжних карток.",
          "Договір укладається в момент підтвердження оплати. Після цього покупець бачить квитки на сторінці замовлення і отримує їх на вказаний email.",
          `Покупець відповідає за правильність вказаного email. Якщо лист з квитками не надійшов, напиши на ${org("email", "uk")}.`,
        ],
      },
      {
        title: "Вхід на подію",
        points: [
          "Кожен QR-код проходить на вході один раз. Повторне сканування того самого коду не дає права на вхід.",
          "Не пересилай і не публікуй свій квиток. Якщо його копію хтось використає раніше, власника оригіналу не буде впущено. Організатор не відповідає за наслідки передачі квитка іншим особам.",
          "Вхід лише для осіб від 18 років. На вході можуть попросити документ з фото, що посвідчує особу. Особі, яка не підтвердить повноліття, буде відмовлено у вході без повернення коштів.",
          "Організатор і охорона можуть відмовити у вході або вивести з події, без повернення коштів, особу, яка:",
          [
            "перебуває в стані сильного алкогольного чи наркотичного сп'яніння,",
            "поводиться агресивно або загрожує безпеці інших,",
            "порушує цей регламент або правила клубу.",
          ],
          "На вході може проводитися огляд речей. Заборонено проносити зброю, наркотичні речовини, піротехніку та власний алкоголь.",
          "Гості VIP-зони заходять разом за одним QR-кодом. Кількість гостей не може перевищувати вказану при купівлі.",
          `Під час події діють також правила клубу ${org("club", "uk")}.`,
          "На події може вестися фото- і відеозйомка для соцмереж Організатора. Якщо не хочеш потрапити в кадр, скажи про це фотографу.",
        ],
      },
      {
        title: "Повернення та обмін",
        points: [
          "Згідно зі ст. 38 ч. 1 п. 12 закону Польщі про права споживачів від 30 травня 2014 року (ustawa o prawach konsumenta), право відмовитися від договору протягом 14 днів не поширюється на квитки на розважальні події з визначеною датою.",
          "Куплені квитки не повертаються і не обмінюються, зокрема у разі неявки, запізнення або відмови у вході з причин, описаних вище.",
          "Якщо подію скасовано, Організатор повертає повну вартість квитка протягом 14 днів тим самим способом оплати, без жодних дій з боку покупця.",
          `Якщо дату події змінено, квиток дійсний на нову дату. Якщо нова дата не підходить, протягом 14 днів від оголошення про зміну можна попросити повернення повної вартості, написавши на ${org("email", "uk")}.`,
        ],
      },
      {
        title: "Скарги",
        points: [
          `Скаргу можна надіслати на ${org("email", "uk")}, вказавши номер замовлення і суть проблеми. Організатор відповідає протягом 14 днів.`,
          "Покупець, який є споживачем, може також звернутися по безкоштовну допомогу до міського або повітового уповноваженого з прав споживачів (rzecznik konsumentów) або до Торгової інспекції (Inspekcja Handlowa).",
        ],
      },
      {
        title: "Персональні дані",
        points: [
          "Як Організатор обробляє персональні дані, описано в [Політиці конфіденційності](/privacy).",
        ],
      },
      {
        title: "Прикінцеві положення",
        points: [
          "Регламент регулюється польським правом і не обмежує прав, які споживачам надає закон.",
          "Організатор може змінити регламент. Зміни не стосуються квитків, куплених до їх набрання чинності.",
          "Регламент доступний українською та [польською](/pl/regulamin) мовами. У разі розбіжностей переважає польська версія.",
          `Регламент діє з ${UPDATED}.`,
        ],
      },
    ],
  };
}

export function termsPl(): LegalDoc {
  const nip = organizer.nip ? `, NIP: ${organizer.nip}` : "";
  return {
    title: "Regulamin sprzedaży biletów",
    updated: UPDATED,
    intro: `Niniejszy regulamin określa zasady zakupu biletów na imprezy Wonderland Club za pośrednictwem strony ${SITE} oraz zasady wstępu na wydarzenie. Kupując bilet, akceptujesz regulamin.`,
    sections: [
      {
        title: "Organizator",
        points: [
          `Sprzedawcą biletów i organizatorem wydarzeń jest ${org("name", "pl")}, adres do korespondencji: ${org("address", "pl")}${nip} (dalej „Organizator”).`,
          `Kontakt z Organizatorem: ${org("email", "pl")}.`,
          `Wydarzenie odbywa się w klubie ${org("club", "pl")} przy ${VENUE}. Klub nie jest sprzedawcą biletów.`,
        ],
      },
      {
        title: "Bilety",
        points: [
          "Bilet jest dokumentem elektronicznym z unikalnym kodem QR, uprawniającym do wstępu na wskazane w nim wydarzenie.",
          "Bilet standardowy uprawnia do wstępu jednej osoby.",
          "Strefa VIP jest kupowana w całości, jednym zakupem, dla grupy o liczbie osób wskazanej przy zakupie. Liczba stref VIP jest ograniczona: po sprzedaży wszystkich stref danej wielkości ich zakup nie jest możliwy.",
        ],
      },
      {
        title: "Zakup i płatność",
        points: [
          "Bilety są sprzedawane za pośrednictwem strony. Ceny podane są w złotych polskich (zł) i są cenami końcowymi.",
          "Płatności obsługuje operator płatności Stripe: karta, BLIK, Apple Pay lub Google Pay. Organizator nie otrzymuje ani nie przechowuje danych kart płatniczych.",
          "Umowa zostaje zawarta z chwilą potwierdzenia płatności. Kupujący widzi wtedy bilety na stronie zamówienia i otrzymuje je na podany adres email.",
          `Kupujący odpowiada za poprawność podanego adresu email. Jeśli wiadomość z biletami nie dotarła, napisz na ${org("email", "pl")}.`,
        ],
      },
      {
        title: "Wstęp na wydarzenie",
        points: [
          "Każdy kod QR można użyć przy wejściu jeden raz. Ponowne zeskanowanie tego samego kodu nie uprawnia do wstępu.",
          "Nie przesyłaj ani nie publikuj swojego biletu. Jeśli ktoś wcześniej użyje jego kopii, właściciel oryginału nie zostanie wpuszczony. Organizator nie odpowiada za skutki przekazania biletu innym osobom.",
          "Wstęp wyłącznie dla osób pełnoletnich (18+). Przy wejściu można zostać poproszonym o dokument tożsamości ze zdjęciem. Osoba, która nie potwierdzi pełnoletności, nie zostanie wpuszczona, bez zwrotu ceny biletu.",
          "Organizator i ochrona mogą odmówić wstępu lub usunąć z wydarzenia, bez zwrotu ceny biletu, osobę, która:",
          [
            "znajduje się w stanie znacznego upojenia alkoholowego lub pod wpływem środków odurzających,",
            "zachowuje się agresywnie lub zagraża bezpieczeństwu innych,",
            "narusza niniejszy regulamin lub regulamin klubu.",
          ],
          "Przy wejściu może być przeprowadzana kontrola rzeczy. Zabronione jest wnoszenie broni, środków odurzających, materiałów pirotechnicznych i własnego alkoholu.",
          "Goście strefy VIP wchodzą razem, na jeden kod QR. Liczba gości nie może przekraczać liczby wskazanej przy zakupie.",
          `Podczas wydarzenia obowiązuje również regulamin klubu ${org("club", "pl")}.`,
          "Podczas wydarzenia mogą być wykonywane zdjęcia i nagrania wideo na potrzeby mediów społecznościowych Organizatora. Jeśli nie chcesz znaleźć się w kadrze, powiedz o tym fotografowi.",
        ],
      },
      {
        title: "Zwroty i wymiana",
        points: [
          "Zgodnie z art. 38 ust. 1 pkt 12 ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo odstąpienia od umowy w terminie 14 dni nie przysługuje w przypadku biletów na wydarzenia rozrywkowe, w których oznaczono dzień świadczenia usługi.",
          "Zakupione bilety nie podlegają zwrotowi ani wymianie, w szczególności w razie niestawienia się, spóźnienia lub odmowy wstępu z przyczyn opisanych powyżej.",
          "W razie odwołania wydarzenia Organizator zwraca pełną cenę biletu w ciągu 14 dni, tą samą metodą płatności, bez konieczności działania ze strony kupującego.",
          `W razie zmiany daty wydarzenia bilet zachowuje ważność na nowy termin. Jeśli nowy termin nie odpowiada kupującemu, w ciągu 14 dni od ogłoszenia zmiany może on zażądać zwrotu pełnej ceny, pisząc na ${org("email", "pl")}.`,
        ],
      },
      {
        title: "Reklamacje",
        points: [
          `Reklamację można złożyć na adres ${org("email", "pl")}, podając numer zamówienia i opis problemu. Organizator odpowiada w ciągu 14 dni.`,
          "Kupujący będący konsumentem może również skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów albo Inspekcji Handlowej.",
        ],
      },
      {
        title: "Dane osobowe",
        points: [
          "Zasady przetwarzania danych osobowych opisuje [Polityka prywatności](/pl/polityka-prywatnosci).",
        ],
      },
      {
        title: "Postanowienia końcowe",
        points: [
          "Regulamin podlega prawu polskiemu i nie ogranicza praw przysługujących konsumentom z mocy prawa.",
          "Organizator może zmienić regulamin. Zmiany nie dotyczą biletów kupionych przed ich wejściem w życie.",
          "Regulamin jest dostępny w języku polskim i [ukraińskim](/terms). W razie rozbieżności rozstrzyga wersja polska.",
          `Regulamin obowiązuje od ${UPDATED}.`,
        ],
      },
    ],
  };
}

/* ---------------------------------------------------------------- privacy */

export function privacyUk(): LegalDoc {
  return {
    title: "Політика конфіденційності",
    updated: UPDATED,
    intro: `Тут пояснено, які персональні дані ми збираємо, коли ти купуєш квиток на сайті ${SITE}, навіщо, кому їх передаємо і які в тебе права. Політика відповідає Загальному регламенту ЄС про захист даних (RODO, GDPR).`,
    sections: [
      {
        title: "Адміністратор даних",
        points: [
          `Адміністратором даних є ${org("name", "uk")}, адреса: ${org("address", "uk")}, email: ${org("email", "uk")}. З усіх питань щодо даних пиши на цю адресу.`,
        ],
      },
      {
        title: "Які дані ми обробляємо",
        points: [
          [
            "email: щоб надіслати квитки (обов'язково для купівлі),",
            "ім'я: друкується на квитку (необов'язково),",
            "дані замовлення: квиток, кількість, сума, дата оплати, номер замовлення,",
            "час проходу за квитком на вході,",
            "технічні дані (IP-адреса, тип браузера) у журналах сервера,",
            "анонімна статистика відвідувань: які сторінки й розділи переглянуто, які кнопки натиснуто, скільки часу сторінка була відкрита, з якого сайту прийшов відвідувач і з телефона чи комп'ютера.",
          ],
          "Дані платіжної картки або банківського рахунку обробляє лише Stripe. Ми їх не отримуємо.",
        ],
      },
      {
        title: "Навіщо і на якій підставі",
        points: [
          "Продаж і надсилання квитків, вхід на подію: виконання договору (ст. 6 ч. 1 літ. b RODO).",
          "Бухгалтерський облік і податки: юридичний обов'язок (ст. 6 ч. 1 літ. c RODO).",
          "Запобігання шахрайству і повторному використанню квитків, розгляд скарг, захист від претензій: законний інтерес адміністратора (ст. 6 ч. 1 літ. f RODO).",
          "Анонімна статистика відвідувань, щоб розуміти, як працює сайт і реклама: законний інтерес адміністратора (ст. 6 ч. 1 літ. f RODO). Вона не використовує cookies і нічого не зберігає у браузері. Відвідувача рахує добовий анонімний ідентифікатор (хеш IP-адреси і браузера з секретним ключем), який змінюється щодня; IP-адреса не зберігається, а зв'язати візити різних днів неможливо. Статистика зберігається до 13 місяців.",
          "Ми не надсилаємо реклами і не продаємо даних. Автоматизованих рішень і профілювання немає.",
        ],
      },
      {
        title: "Кому передаються дані",
        points: [
          "Дані обробляють постачальники, які діють за нашим дорученням:",
          [
            "Stripe Payments Europe Ltd. (Ірландія): оплата,",
            "Resend (США): надсилання листів з квитками,",
            "Vercel Inc. (США): хостинг сайту,",
            "Upstash (США): зберігання відміток про вхід,",
            "бухгалтер, якщо цього вимагає облік.",
          ],
          "Деякі з них знаходяться в США. Передача відбувається на підставі рамкової угоди ЄС-США про захист даних (EU-U.S. Data Privacy Framework) або стандартних договірних умов, затверджених Європейською комісією.",
        ],
      },
      {
        title: "Як довго зберігаються дані",
        points: [
          "Дані замовлень: 5 років від кінця року, в якому відбулася оплата (вимоги податкового права).",
          "Відмітки про вхід: до 120 днів.",
          "Журнали сервера та листів: протягом строку, встановленого постачальником, зазвичай до кількох тижнів.",
        ],
      },
      {
        title: "Твої права",
        points: [
          "Ти маєш право на доступ до своїх даних, їх виправлення, видалення, обмеження обробки, перенесення, а також право заперечити проти обробки на підставі законного інтересу.",
          `Щоб скористатися правом, напиши на ${org("email", "uk")}. Ми відповімо протягом місяця.`,
          "Ти можеш подати скаргу до наглядового органу: Голова Управління із захисту персональних даних (Prezes Urzędu Ochrony Danych Osobowych), ul. Stawki 2, 00-193 Warszawa.",
          "Надання email добровільне, але без нього купити квиток неможливо.",
        ],
      },
      {
        title: "Cookies",
        points: [
          "Сайт не використовує аналітичних чи рекламних cookies: статистика відвідувань анонімна і працює без них. Технічний cookie ставиться лише на телефонах персоналу на вході. Сторінка оплати Stripe використовує власні cookies згідно з політикою Stripe.",
        ],
      },
      {
        title: "Зміни",
        points: [
          "Політика доступна українською та [польською](/pl/polityka-prywatnosci) мовами. У разі розбіжностей переважає польська версія.",
          `Політика діє з ${UPDATED}.`,
        ],
      },
    ],
  };
}

export function privacyPl(): LegalDoc {
  return {
    title: "Polityka prywatności",
    updated: UPDATED,
    intro: `Wyjaśniamy tu, jakie dane osobowe zbieramy przy zakupie biletu na stronie ${SITE}, w jakim celu, komu je przekazujemy i jakie masz prawa. Polityka jest zgodna z ogólnym rozporządzeniem o ochronie danych (RODO).`,
    sections: [
      {
        title: "Administrator danych",
        points: [
          `Administratorem danych jest ${org("name", "pl")}, adres: ${org("address", "pl")}, email: ${org("email", "pl")}. We wszystkich sprawach dotyczących danych pisz na ten adres.`,
        ],
      },
      {
        title: "Jakie dane przetwarzamy",
        points: [
          [
            "adres email: aby wysłać bilety (wymagany do zakupu),",
            "imię: drukowane na bilecie (opcjonalne),",
            "dane zamówienia: bilet, liczba, kwota, data płatności, numer zamówienia,",
            "godzina wejścia na podstawie biletu,",
            "dane techniczne (adres IP, typ przeglądarki) w logach serwera,",
            "anonimowe statystyki odwiedzin: które strony i sekcje zostały obejrzane, które przyciski kliknięto, jak długo strona była otwarta, z jakiej strony przyszedł odwiedzający oraz czy z telefonu, czy z komputera.",
          ],
          "Dane karty płatniczej lub rachunku bankowego przetwarza wyłącznie Stripe. Nie otrzymujemy ich.",
        ],
      },
      {
        title: "Cele i podstawy prawne",
        points: [
          "Sprzedaż i wysyłka biletów, wstęp na wydarzenie: wykonanie umowy (art. 6 ust. 1 lit. b RODO).",
          "Rachunkowość i podatki: obowiązek prawny (art. 6 ust. 1 lit. c RODO).",
          "Zapobieganie oszustwom i ponownemu użyciu biletów, rozpatrywanie reklamacji, obrona przed roszczeniami: prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO).",
          "Anonimowe statystyki odwiedzin, aby rozumieć, jak działa strona i reklama: prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO). Nie używają plików cookies i niczego nie zapisują w przeglądarce. Odwiedzającego liczy dobowy anonimowy identyfikator (skrót adresu IP i przeglądarki z tajnym kluczem), zmieniany codziennie; adres IP nie jest zapisywany, a wizyt z różnych dni nie da się powiązać. Statystyki są przechowywane do 13 miesięcy.",
          "Nie wysyłamy reklam i nie sprzedajemy danych. Nie podejmujemy zautomatyzowanych decyzji ani nie profilujemy.",
        ],
      },
      {
        title: "Odbiorcy danych",
        points: [
          "Dane przetwarzają dostawcy działający na nasze zlecenie:",
          [
            "Stripe Payments Europe Ltd. (Irlandia): płatności,",
            "Resend (USA): wysyłka wiadomości z biletami,",
            "Vercel Inc. (USA): hosting strony,",
            "Upstash (USA): przechowywanie informacji o wejściach,",
            "księgowy, jeśli wymaga tego rachunkowość.",
          ],
          "Część z nich ma siedzibę w USA. Przekazanie odbywa się na podstawie EU-U.S. Data Privacy Framework lub standardowych klauzul umownych zatwierdzonych przez Komisję Europejską.",
        ],
      },
      {
        title: "Okres przechowywania",
        points: [
          "Dane zamówień: 5 lat od końca roku, w którym dokonano płatności (przepisy podatkowe).",
          "Informacje o wejściach: do 120 dni.",
          "Logi serwera i wiadomości: przez okres ustalony przez dostawcę, zwykle do kilku tygodni.",
        ],
      },
      {
        title: "Twoje prawa",
        points: [
          "Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie.",
          `Aby skorzystać z tych praw, napisz na ${org("email", "pl")}. Odpowiemy w ciągu miesiąca.`,
          "Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.",
          "Podanie adresu email jest dobrowolne, ale bez niego zakup biletu nie jest możliwy.",
        ],
      },
      {
        title: "Pliki cookies",
        points: [
          "Strona nie używa analitycznych ani reklamowych plików cookies: statystyki odwiedzin są anonimowe i działają bez nich. Techniczny plik cookie jest zapisywany wyłącznie na telefonach obsługi przy wejściu. Strona płatności Stripe używa własnych plików cookies zgodnie z polityką Stripe.",
        ],
      },
      {
        title: "Zmiany",
        points: [
          "Polityka jest dostępna w języku polskim i [ukraińskim](/privacy). W razie rozbieżności rozstrzyga wersja polska.",
          `Polityka obowiązuje od ${UPDATED}.`,
        ],
      },
    ],
  };
}
