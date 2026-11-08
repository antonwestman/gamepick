import type { Words } from "./pannlappenDecks.ts";

export const SV = {
  "djur": {
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
  "gor-som": {
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
  "yrken": {
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
  "mat": {
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
  "film": {
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
  "saker": {
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
  "platser": {
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
  "jargong": {
    easy: [
      "Möte", "Deadline", "Excel", "Mejl", "Powerpoint", "Kaffemaskin", "Kickoff", "Afterwork", "Chef", "Semester",
      "Kalender", "Wifi", "Lösenord", "Skrivare", "Teams-möte", "Projektor", "Post-it-lapp", "Whiteboard", "Budget",
      "Kontorslandskap", "Headset", "Övertid", "Lönesamtal", "Kollega",
    ],
    medium: [
      "Avstämning", "Veckomöte", "Uppföljning", "Leverans", "Tidsplan", "Projektledare", "Styrgrupp", "Beställare",
      "Förstudie", "Kravställning", "Uppstartsmöte", "Workshop", "Releasedatum", "Bugg", "Ärende", "Backlog",
      "Sprint", "Gantt-schema", "Konsult", "Utvecklingssamtal", "Omorganisation", "Medarbetarenkät",
    ],
    hard: [
      "Synergi", "Lågt hängande frukt", "Paradigmskifte", "Återkoppla", "Teknisk skuld", "Ta det utanför mötet",
      "Flytta fram positionerna", "Djupdyka", "Bandbredd", "Helikopterperspektiv", "Parkera frågan", "Förankra",
      "Landa i", "Stämma av", "Bolla", "Lyfta frågan", "Snabba vinster", "Ansvarsfördelning", "Värdeskapande",
      "Mötet som kunde varit ett mejl", "Vi tar det i nästa sprint", "Agil transformation",
    ],
  },
  "gaming": {
    easy: [
      "Super Mario", "Minecraft", "Tetris", "Pac-Man", "Fortnite", "Pokémon", "Zelda", "Sonic", "Pong", "Joystick",
      "Handkontroll", "Playstation", "Xbox", "Nintendo Switch", "Game Boy", "Angry Birds", "Candy Crush", "The Sims",
      "FIFA", "Roblox",
    ],
    medium: [
      "Tomb Raider", "Street Fighter", "Mortal Kombat", "Donkey Kong", "Space Invaders", "Grand Theft Auto",
      "Call of Duty", "World of Warcraft", "Counter-Strike", "Among Us", "Animal Crossing", "Mario Kart",
      "Guitar Hero", "Wii", "Bossfight", "Extraliv", "Fuskkod", "Speedrun", "Lagg", "Sparfil",
    ],
    hard: [
      "Respawn", "Noob", "Lootlåda", "Hitbox", "Grinda", "Rage quit", "Easter egg", "Sidouppdrag", "Öppen värld",
      "Pixelgrafik", "Half-Life", "Dark Souls", "The Witcher", "Skyrim", "Baldur's Gate", "Portal", "E-sport",
      "Twitch", "Battle royale", "Mikrotransaktion",
    ],
  },
  "bradspel": {
    easy: [
      "Monopol", "Schack", "Fia med knuff", "Yatzy", "Memory", "Domino", "Fyra i rad", "Twister", "Uno", "Kortlek",
      "Tärning", "Pussel", "Alfapet", "Sänka skepp", "Othello", "Backgammon", "Bingo", "Plockepinn", "Kalaha",
      "Luffarschack",
    ],
    medium: [
      "Catan", "Carcassonne", "Ticket to Ride", "Trivial Pursuit", "Cluedo", "Risk", "Pictionary", "Rummikub",
      "Dixit", "Codenames", "Alias", "Jenga", "Mastermind", "Poker", "Bridge", "Go", "Kinaschack", "Stratego",
      "Labyrint", "Spelplan",
    ],
    hard: [
      "Wingspan", "Pandemic", "Terraforming Mars", "Azul", "Gloomhaven", "Agricola", "Dominion", "Splendor",
      "7 Wonders", "Blood on the Clocktower", "Mahjong", "Worker placement", "Kortbyggande", "Regelbok", "Expansion",
      "Spelledare", "Kingmaker", "Turordning", "Samarbetsspel", "Brädspelskafé",
    ],
  },
  "matte": {
    easy: [
      "Plus", "Minus", "Gånger", "Division", "Noll", "Miniräknare", "Linjal", "Cirkel", "Triangel", "Kvadrat",
      "Rektangel", "Udda tal", "Jämnt tal", "Hälften", "Dubbelt", "Miljon", "Procent", "Kub", "Klot",
      "Multiplikationstabell",
    ],
    medium: [
      "Pi", "Bråk", "Decimaltal", "Ekvation", "Pythagoras sats", "Primtal", "Kvadratrot", "Diagram", "Medelvärde",
      "Vinkel", "Radie", "Diameter", "Omkrets", "Area", "Volym", "Gradskiva", "Passare", "Negativt tal",
      "Oändlighet", "Sannolikhet",
    ],
    hard: [
      "Derivata", "Integral", "Logaritm", "Fibonacci", "Gyllene snittet", "Matris", "Vektor", "Hypotenusa",
      "Parabel", "Exponent", "Fakultet", "Standardavvikelse", "Median", "Asymptot", "Polynom", "Imaginära tal",
      "Algebra", "Topologi", "Möbiusband", "Fraktal",
    ],
  },
  "vaxter": {
    easy: [
      "Ros", "Tulpan", "Solros", "Kaktus", "Maskros", "Ek", "Gran", "Björk", "Palm", "Gräs", "Äppelträd", "Morot",
      "Potatis", "Vitsippa", "Blåbärsris", "Mossa", "Lavendel", "Bambu", "Ormbunke", "Näckros",
    ],
    medium: [
      "Orkidé", "Brännässla", "Murgröna", "Lönn", "Tall", "Blåklocka", "Krokus", "Hortensia", "Pion", "Kastanj",
      "Pelargon", "Monstera", "Aloe vera", "Basilika", "Mistel", "Klöver", "Liljekonvalj", "Rabarber", "Vass",
      "Bonsai",
    ],
    hard: [
      "Fotosyntes", "Klorofyll", "Pollen", "Frö", "Rotsystem", "Stickling", "Köttätande växt", "Venusflugfälla",
      "Sequoia", "Baobab", "Lav", "Kompost", "Ståndare", "Pistill", "Pollinering", "Växthus", "Ympning", "Perenn",
      "Ettårig växt", "Carl von Linné",
    ],
  },
  "historia": {
    easy: [
      "Vikingar", "Riddare", "Pyramid", "Slott", "Kung", "Drottning", "Pirat", "Cowboy", "Gladiator", "Mumie",
      "Grottmänniska", "Stenåldern", "Svärd", "Sköld", "Kanon", "Ånglok", "Månlandningen", "Berlinmuren", "Titanic",
      "Medeltiden",
    ],
    medium: [
      "Napoleon", "Kleopatra", "Julius Caesar", "Gustav Vasa", "Karl XII", "Columbus", "Marco Polo", "Romarriket",
      "Franska revolutionen", "Industriella revolutionen", "Kalla kriget", "Digerdöden", "Korståg", "Samuraj",
      "Tsar", "Renässansen", "Hansan", "Upplysningen", "Runsten", "Jeanne d'Arc",
    ],
    hard: [
      "Westfaliska freden", "Trettioåriga kriget", "Kalmarunionen", "Stockholms blodbad", "Hundraårskriget",
      "Bysantinska riket", "Osmanska riket", "Inkariket", "Aztekerna", "Mesopotamien", "Feodalism", "Reformationen",
      "Merkantilism", "Sidenvägen", "Rosettastenen", "Karl den store", "Djingis khan", "Tutankhamon",
      "Hammurabis lagar", "Spanska armadan",
    ],
  },
  "grekland": {
    easy: [
      "Zeus", "Olympen", "Olympiska spelen", "Trojanska hästen", "Herkules", "Medusa", "Minotauros", "Pegasus",
      "Kyklop", "Toga", "Kolonn", "Amfiteater", "Lagerkrans", "Spartan", "Aten", "Poseidon", "Sirener",
      "Pandoras ask", "Akilleshäl", "Maraton",
    ],
    medium: [
      "Sokrates", "Platon", "Aristoteles", "Pythagoras", "Homeros", "Odysseus", "Athena", "Afrodite", "Apollon",
      "Hades", "Hermes", "Ares", "Demokrati", "Filosofi", "Oraklet i Delfi", "Labyrinten", "Tragedi", "Amasoner",
      "Sparta", "Kentaur",
    ],
    hard: [
      "Parthenon", "Arkimedes", "Hippokrates", "Herodotos", "Thermopyle", "Perikles", "Alexander den store",
      "Prometheus", "Ikaros", "Narkissos", "Dionysos", "Persefone", "Sisyfos", "Tantalos", "Agora", "Hoplit",
      "Trirem", "Akademien", "Stoicism", "Odysséen",
    ],
  },
  "blandat": {
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
} satisfies Words;
