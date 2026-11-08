export type Deck = { id: string; title: string; emoji: string; words: readonly string[] };

export const DECKS: readonly Deck[] = [
  {
    id: "djur",
    title: "Djur",
    emoji: "🦒",
    words: [
      "Giraff", "Pingvin", "Krokodil", "Igelkott", "Bläckfisk", "Känguru", "Älg", "Flamingo", "Sengångare", "Zebra",
      "Haj", "Papegoja", "Kamel", "Ekorre", "Delfin", "Noshörning", "Fladdermus", "Snigel", "Uggla", "Lama",
      "Panda", "Bäver", "Sköldpadda", "Hummer", "Örn", "Myrslok", "Gorilla", "Mullvad", "Säl", "Påfågel",
    ],
  },
  {
    id: "gor-som",
    title: "Gör som jag",
    emoji: "🕺",
    words: [
      "Borsta tänderna", "Åka skidor", "Spela gitarr", "Byta blöja", "Dammsuga", "Surfa", "Klättra i träd",
      "Mjölka en ko", "Gå på lina", "Bowla", "Ro en båt", "Blåsa ballong", "Steka pannkakor", "Dyka", "Fiska",
      "Spela golf", "Hugga ved", "Vara zombie", "Ta en selfie", "Jonglera", "Rida", "Simma fjärilsim",
      "Laga mat på tv", "Dirigera en orkester", "Skotta snö", "Måla naglarna", "Boxas", "Spela fiol",
    ],
  },
  {
    id: "yrken",
    title: "Yrken",
    emoji: "👩‍🚒",
    words: [
      "Brandman", "Tandläkare", "Pilot", "Bagare", "Frisör", "Polis", "Astronaut", "Präst", "Bonde", "Elektriker",
      "Domare", "Clown", "Kirurg", "Bibliotekarie", "Sotare", "Veterinär", "Trollkarl", "Kock", "Lärare",
      "Busschaufför", "Fotograf", "Rörmokare", "Arkeolog", "Brevbärare", "Skådespelare", "Livvakt", "Dj",
      "Gruvarbetare",
    ],
  },
  {
    id: "mat",
    title: "Mat & dryck",
    emoji: "🍕",
    words: [
      "Pizza", "Surströmming", "Kanelbulle", "Sushi", "Köttbullar", "Tacos", "Prinsesstårta", "Avokado", "Glögg",
      "Pannkaka", "Semla", "Spaghetti", "Lakrits", "Popcorn", "Hamburgare", "Banan", "Ostbåge", "Kebab",
      "Varm korv", "Kaviar", "Smörgåstårta", "Ärtsoppa", "Kladdkaka", "Cola", "Champagne", "Gurka", "Chips",
      "Jordgubbe", "Lussekatt",
    ],
  },
  {
    id: "film",
    title: "Film & tv",
    emoji: "🎬",
    words: [
      "Titanic", "Harry Potter", "Sagan om ringen", "Star Wars", "Frost", "Lejonkungen", "Jurassic Park",
      "Hajen", "Kalle Anka", "Pippi Långstrump", "Emil i Lönneberga", "Ronja Rövardotter", "Bamse", "Mamma Mia",
      "Matrix", "Shrek", "Tillbaka till framtiden", "Hitta Nemo", "Spider-Man", "James Bond", "Ghostbusters",
      "Batman", "Pirates of the Caribbean", "Ensam hemma", "Muminmamman", "Toy Story", "Vänner", "Melodifestivalen",
    ],
  },
  {
    id: "saker",
    title: "Saker hemma",
    emoji: "🛋️",
    words: [
      "Brödrost", "Tandborste", "Strykjärn", "Fjärrkontroll", "Dammsugare", "Kudde", "Kylskåp", "Paraply",
      "Diskmaskin", "Tofflor", "Spegel", "Ljusstake", "Mikrovågsugn", "Hårfön", "Gungstol", "Väckarklocka",
      "Duschdraperi", "Kaffebryggare", "Grill", "Badkar", "Tvättkorg", "Kastrull", "Nyckelknippa", "Soffa",
      "Brandvarnare", "Tejp", "Sax", "Glödlampa",
    ],
  },
  {
    id: "platser",
    title: "Platser",
    emoji: "🗺️",
    words: [
      "Eiffeltornet", "Gröna Lund", "Kinesiska muren", "Ikea", "Sahara", "Mount Everest", "Venedig", "Ishotellet",
      "Pyramiderna", "Vasamuseet", "Frihetsgudinnan", "Gotland", "Nordpolen", "Disneyland", "Amazonas",
      "Las Vegas", "Liseberg", "Kolmården", "Big Ben", "Grand Canyon", "Akropolis", "Globen", "Kiruna",
      "Hollywood", "Colosseum", "Mars", "Atlantis", "Skansen",
    ],
  },
  {
    id: "blandat",
    title: "Lite av allt",
    emoji: "🎲",
    words: [
      "Midsommar", "Tomten", "Regnbåge", "Vampyr", "Snögubbe", "Robot", "Pirat", "Dinosaurie", "Vulkan",
      "Spöke", "Enhörning", "Ninja", "Bröllop", "Fyrverkeri", "Sjörövare", "Fotboll", "Schack", "Tidsmaskin",
      "Hiss", "Karaoke", "Bastu", "Trädkoja", "Rymdraket", "Kryssning", "Tandfén", "Superhjälte", "Loppis",
      "Allsång",
    ],
  },
];
