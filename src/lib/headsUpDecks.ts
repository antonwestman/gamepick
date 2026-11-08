export const DIFFICULTIES = [
  { id: "easy", label: "Lätt" },
  { id: "medium", label: "Medel" },
  { id: "hard", label: "Svår" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["id"];

export type Deck = { id: string; title: string; emoji: string; words: Record<Difficulty, readonly string[]> };

export const DECKS: readonly Deck[] = [
  {
    id: "djur",
    title: "Djur",
    emoji: "🦒",
    words: {
      easy: [
        "Giraff", "Pingvin", "Krokodil", "Igelkott", "Bläckfisk", "Känguru", "Älg", "Flamingo", "Sengångare", "Zebra",
        "Haj", "Papegoja", "Kamel", "Ekorre", "Delfin", "Noshörning", "Fladdermus", "Snigel", "Uggla", "Lama",
        "Panda", "Bäver", "Sköldpadda", "Hummer", "Örn", "Gorilla", "Mullvad", "Säl", "Påfågel",
      ],
      medium: [
        "Narval", "Tapir", "Hyena", "Bältdjur", "Kameleont", "Pelikan", "Valross", "Grävling", "Lodjur", "Järv",
        "Tvättbjörn", "Skunk", "Kobra", "Struts", "Rådjur", "Svan", "Termit", "Manet", "Gnu", "Myrslok",
      ],
      hard: [
        "Axolotl", "Näbbdjur", "Okapi", "Dront", "Björndjur", "Nakenråtta", "Vombat", "Lemur", "Myrkott", "Pungdjävul",
        "Jak", "Tvestjärt", "Sjöko", "Kasuar", "Slamkrypare", "Blobfisk", "Ormvråk", "Mink", "Iller", "Sjöpung",
      ],
    },
  },
  {
    id: "gor-som",
    title: "Gör som jag",
    emoji: "🕺",
    words: {
      easy: [
        "Borsta tänderna", "Åka skidor", "Spela gitarr", "Byta blöja", "Dammsuga", "Surfa", "Klättra i träd",
        "Mjölka en ko", "Gå på lina", "Bowla", "Ro en båt", "Blåsa ballong", "Steka pannkakor", "Dyka", "Fiska",
        "Spela golf", "Hugga ved", "Vara zombie", "Ta en selfie", "Jonglera", "Rida", "Simma fjärilsim",
        "Dirigera en orkester", "Skotta snö", "Måla naglarna", "Boxas", "Spela fiol",
      ],
      medium: [
        "Byta däck", "Slå en kullerbytta", "Spela säckpipa", "Tämja ett lejon", "Sätta in linser", "Knyta slips",
        "Bygga en snögubbe", "Paddla kanot", "Plocka svamp", "Kasta pil", "Spela curling", "Gå på catwalk",
        "Hålla tal", "Väcka en björn", "Slå in ett paket", "Bära en soffa", "Sätta upp ett tält",
        "Halka på ett bananskal", "Mata duvor", "Spela tennis",
      ],
      hard: [
        "Fastna i en hiss", "Missa bussen", "Tvätta en katt", "Hypnotisera någon", "Dansa tango",
        "Sätta ihop en Ikea-garderob", "Laga en punktering", "Flyga drake", "Klä på en bebis", "Bli rädd för en spindel",
        "Gå i motvind", "Vara mim i en låda", "Trampa på en lego", "Vinna OS-guld", "Somna på jobbet",
        "Fånga en fluga med ätpinnar", "Slå sönder en vas", "Gå på månen", "Brottas med en krokodil",
        "Gå på glödande kol",
      ],
    },
  },
  {
    id: "yrken",
    title: "Yrken",
    emoji: "👩‍🚒",
    words: {
      easy: [
        "Brandman", "Tandläkare", "Pilot", "Bagare", "Frisör", "Polis", "Astronaut", "Präst", "Bonde", "Elektriker",
        "Domare", "Clown", "Kirurg", "Bibliotekarie", "Sotare", "Veterinär", "Trollkarl", "Kock", "Lärare",
        "Busschaufför", "Fotograf", "Rörmokare", "Brevbärare", "Skådespelare", "Livvakt", "Dj",
      ],
      medium: [
        "Diplomat", "Revisor", "Glasblåsare", "Smed", "Dirigent", "Bartender", "Fyrvaktare", "Barnmorska",
        "Kranförare", "Tolk", "Sommelier", "Jägare", "Skräddare", "Optiker", "Snickare", "Begravningsentreprenör",
        "Stuntman", "Meteorolog", "Florist", "Arkeolog",
      ],
      hard: [
        "Aktuarie", "Lobbyist", "Hovslagare", "Konservator", "Kartograf", "Ordboksredaktör", "Notarie", "Logoped",
        "Speditör", "Ergonom", "Kiropraktor", "Narkosläkare", "Hovmästare", "Talman", "Biodlare", "Kriminolog",
        "Flygledare", "Arborist", "Statistiker", "Kyrkvaktmästare",
      ],
    },
  },
  {
    id: "mat",
    title: "Mat & dryck",
    emoji: "🍕",
    words: {
      easy: [
        "Pizza", "Surströmming", "Kanelbulle", "Sushi", "Köttbullar", "Tacos", "Prinsesstårta", "Avokado", "Glögg",
        "Pannkaka", "Semla", "Spaghetti", "Lakrits", "Popcorn", "Hamburgare", "Banan", "Ostbåge", "Kebab",
        "Varm korv", "Kaviar", "Smörgåstårta", "Ärtsoppa", "Kladdkaka", "Cola", "Champagne", "Gurka", "Chips",
        "Jordgubbe", "Lussekatt",
      ],
      medium: [
        "Pyttipanna", "Kalops", "Raggmunk", "Tiramisu", "Gazpacho", "Fondue", "Hummus", "Pesto", "Wasabi",
        "Kroppkakor", "Croissant", "Paella", "Sill", "Lutfisk", "Dumplings", "Mazarin", "Västerbottenpaj", "Ramen",
        "Falafel", "Janssons frestelse",
      ],
      hard: [
        "Gubbröra", "Kalvsylta", "Kimchi", "Kombucha", "Quinoa", "Ceviche", "Bouillabaisse", "Saffran", "Tryffel",
        "Kardemumma", "Halloumi", "Sjömansbiff", "Kalvdans", "Ostkaka", "Fläskpannkaka", "Messmör", "Palt", "Rotmos",
        "Tapenade", "Biff Rydberg",
      ],
    },
  },
  {
    id: "film",
    title: "Film & tv",
    emoji: "🎬",
    words: {
      easy: [
        "Titanic", "Harry Potter", "Sagan om ringen", "Star Wars", "Frost", "Lejonkungen", "Jurassic Park",
        "Hajen", "Kalle Anka", "Pippi Långstrump", "Emil i Lönneberga", "Ronja Rövardotter", "Bamse", "Mamma Mia",
        "Shrek", "Hitta Nemo", "Spider-Man", "James Bond", "Batman", "Ensam hemma", "Toy Story", "Melodifestivalen",
      ],
      medium: [
        "Inception", "Forrest Gump", "Gudfadern", "Rocky", "Pulp Fiction", "Wall-E", "Avatar", "Grease",
        "Dirty Dancing", "Top Gun", "Mupparna", "Simpsons", "Breaking Bad", "Game of Thrones", "Sällskapsresan",
        "Solsidan", "Bolibompa", "På spåret", "Let's Dance", "Matrix",
      ],
      hard: [
        "Casablanca", "Psycho", "Fight Club", "Amélie från Montmartre", "Det sjunde inseglet", "Fanny och Alexander",
        "Jönssonligan", "Kops", "Fucking Åmål", "Torsk på Tallinn", "Måndag hela veckan", "Twin Peaks", "Seinfeld",
        "The Office", "Alien", "Sound of Music", "Mad Max", "Tillbaka till framtiden", "Ghostbusters", "Vänner",
      ],
    },
  },
  {
    id: "saker",
    title: "Saker hemma",
    emoji: "🛋️",
    words: {
      easy: [
        "Brödrost", "Tandborste", "Strykjärn", "Fjärrkontroll", "Dammsugare", "Kudde", "Kylskåp", "Paraply",
        "Diskmaskin", "Tofflor", "Spegel", "Ljusstake", "Mikrovågsugn", "Hårfön", "Gungstol", "Väckarklocka",
        "Kaffebryggare", "Grill", "Badkar", "Soffa", "Sax", "Glödlampa",
      ],
      medium: [
        "Äggklocka", "Vitlökspress", "Durkslag", "Element", "Proppskåp", "Badrumsvåg", "Tvättlina", "Strykbräda",
        "Brödkniv", "Stege", "Termometer", "Skohorn", "Galge", "Pepparkvarn", "Kökshandduk", "Tändsticksask",
        "Förlängningssladd", "Persienn", "Termos", "Duschdraperi",
      ],
      hard: [
        "Rivjärn", "Mortel", "Silikonfog", "Golvbrunn", "Dörrstopp", "Gångjärn", "Spisfläkt", "Tvättmedelsfack",
        "Kabelkanal", "Ludd", "Luftavfuktare", "Taklist", "Diskborste", "Lampskärm", "Brevinkast", "Brandvarnare",
        "Nyckelknippa", "Tejp", "Kastrull", "Ostskärare",
      ],
    },
  },
  {
    id: "platser",
    title: "Platser",
    emoji: "🗺️",
    words: {
      easy: [
        "Eiffeltornet", "Gröna Lund", "Kinesiska muren", "Ikea", "Sahara", "Mount Everest", "Venedig", "Ishotellet",
        "Pyramiderna", "Frihetsgudinnan", "Gotland", "Nordpolen", "Disneyland", "Las Vegas", "Liseberg", "Kolmården",
        "Big Ben", "Hollywood", "Mars", "Skansen",
      ],
      medium: [
        "Machu Picchu", "Stonehenge", "Taj Mahal", "Niagarafallen", "Kreml", "Vatikanen", "Dubai",
        "Bermudatriangeln", "Sydpolen", "Öland", "Riksdagshuset", "Tower Bridge", "Lutande tornet i Pisa",
        "Operahuset i Sydney", "Kilimanjaro", "Galápagos", "Island", "Grand Canyon", "Colosseum", "Vasamuseet",
      ],
      hard: [
        "Angkor Wat", "Petra", "Timbuktu", "Atacamaöknen", "Marianergraven", "Påskön", "Svalbard", "Tjernobyl",
        "Alcatraz", "Area 51", "Versailles", "Uluru", "Stora barriärrevet", "Döda havet", "Kaspiska havet", "Bhutan",
        "Liechtenstein", "Haparanda", "Treriksröset", "Atlantis",
      ],
    },
  },
  {
    id: "jargong",
    title: "Corporatejargong",
    emoji: "💼",
    words: {
      easy: [
        "Möte", "Deadline", "Excel", "Mejl", "Powerpoint", "Kaffemaskin", "Kick-off", "Afterwork", "Chef",
        "Semester", "Kalender", "Wifi", "Lösenord", "Skrivare", "Teams-möte", "Projektor", "Post-it", "Whiteboard",
        "Budget", "Kontorslandskap", "Headset", "Övertid", "Lönesamtal", "Kollega",
      ],
      medium: [
        "Sprint", "Backlog", "Scrum", "Standup", "Retro", "Kanban", "Roadmap", "KPI", "Stakeholder", "Onboarding",
        "Workshop", "Brainstorm", "MVP", "Release", "Bugg", "Deploy", "Jira", "Gantt-schema", "Business case",
        "Product owner", "Uppföljningsmöte", "Konsult",
      ],
      hard: [
        "Synergi", "Lågt hängande frukt", "Paradigmskifte", "Circle back", "Teknisk skuld", "Scope creep",
        "Ta det offline", "Moving the needle", "Deep dive", "Bandbredd", "Helikopterperspektiv", "Parkera frågan",
        "Pivot", "Quick win", "Single source of truth", "Alignment", "Story points", "Definition of done",
        "Agil transformation", "Vi tar det i nästa sprint", "Mötet som kunde varit ett mejl", "Boil the ocean",
      ],
    },
  },
  {
    id: "blandat",
    title: "Lite av allt",
    emoji: "🎲",
    words: {
      easy: [
        "Midsommar", "Tomten", "Regnbåge", "Vampyr", "Snögubbe", "Robot", "Pirat", "Dinosaurie", "Vulkan",
        "Spöke", "Enhörning", "Ninja", "Bröllop", "Fyrverkeri", "Fotboll", "Schack", "Tidsmaskin", "Hiss", "Karaoke",
        "Bastu", "Trädkoja", "Rymdraket", "Superhjälte", "Allsång",
      ],
      medium: [
        "Hicka", "Jetlag", "Solförmörkelse", "Snöstorm", "Tandställning", "Kärleksbrev", "Nyårslöfte", "Tunnelbana",
        "Hemlig agent", "Brandövning", "Spökhus", "Kompass", "Tidszon", "Luftballong", "Lottovinst", "Ishockey",
        "Tandfén", "Kryssning", "Loppis", "Fika",
      ],
      hard: [
        "Déjà vu", "Inflation", "Demokrati", "Nostalgi", "Ironi", "Gravitation", "Algoritm", "Byråkrati",
        "Prokrastinering", "Ånger", "Svartsjuka", "Lagom", "Fredagsmys", "Allemansrätten", "Jantelagen",
        "Måndagsångest", "Skadeglädje", "Hemlängtan", "Tvivel", "Mansplaining",
      ],
    },
  },
];
