/**
 * ============================================================================
 * CYBERERA FOOTBALL MANAGER 2026 - STATIC DATABASE (database.js)
 * Yazar: AI & Sen
 * Açıklama: İngiliz/Hristiyan isim kütüphaneleri, kulüp listeleri, katsayılar,
 * mevki ağırlık haritaları, özel yetenek (Trait) parametreleri ve ekonomi tabloları.
 * ============================================================================
 */

/**
 * 1. MENAJER VE OYUNCU İSİM HAVUZU (İngiliz / Hristiyan Kökenli)
 * Benzersiz jenerasyonlar için devasa isim/soyisim veri havuzu.
 */
export const MALE_FIRST_NAMES = [
    "Pep", "Erling", "Harry", "John", "James", "David", "Paul", "George", "Arthur", "Robert",
    "Thomas", "Edward", "Charles", "William", "Richard", "Joseph", "Daniel", "Matthew", "Mark", "Luke",
    "Andrew", "Steven", "Michael", "Kevin", "Christopher", "Gary", "Brian", "Ronald", "Donald", "Kenneth",
    "Anthony", "Jason", "Jeff", "Timothy", "Ryan", "Jeffrey", "Frank", "Gary", "Eric", "Stephen",
    "Alexander", "Jack", "Oliver", "Noah", "Leo", "Lucas", "Mason", "Logan", "Ethan", "Jacob",
    "Freddie", "Archie", "Alfie", "Charlie", "Henry", "Teddy", "Oscar", "Theo", "Toby", "Albert",
    "Arthur", "Bobby", "Frankie", "Jude", "Gareth", "Roy", "Ian", "Graham", "Alan", "Duncan",
    "Marcus", "Raheem", "Declan", "Bukayo", "Mason", "Phil", "Jordan", "Trent", "Reece", "Ben",
    "Kieran", "Tyrone", "Conor", "Kyle", "Aaron", "Nick", "Dean", "Fraser", "Calum", "Scott",
    "Billy", "Oliver", "Harvey", "Cole", "Morgan", "Curtis", "Jacob", "Niall", "Louis", "Liam",
    "Sean", "Patrick", "Connor", "Nathan", "Owen", "Rory", "Finley", "Max", "Alex", "Lewis",
    "Dylan", "Rhys", "Evan", "Owen", "Tyler", "Cameron", "Jamie", "Christian", "Gabriel", "Adrian",
    "Albert", "Alan", "Barry", "Bernard", "Bruce", "Colin", "Craig", "Douglas", "Duncan", "Gordon",
    "Keith", "Malcolm", "Neil", "Peter", "Philip", "Robin", "Raymond", "Stuart", "Terence", "Victor"
];

export const FEMALE_FIRST_NAMES = [
    "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Charlotte", "Mia", "Amelia", "Harper", "Evelyn",
    "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", "Sofia", "Camila", "Aria", "Scarlett",
    "Victoria", "Madison", "Luna", "Grace", "Chloe", "Penelope", "Layla", "Riley", "Zoey", "Nora",
    "Lily", "Eleanor", "Hannah", "Lillian", "Addison", "Aubrey", "Ellie", "Stella", "Natalie", "Zoe",
    "Leah", "Hazel", "Violet", "Aurora", "Savannah", "Audrey", "Brooklyn", "Bella", "Claire", "Skylar",
    "Lucy", "Alex", "Sarah", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan",
    "Margaret", "Dorothy", "Lisa", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol",
    "Ruth", "Sharon", "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica", "Shirley", "Cynthia",
    "Angela", "Melissa", "Brenda", "Amy", "Anna", "Rebecca", "Virginia", "Kathleen", "Pamela", "Martha",
    "Debra", "Amanda", "Stephanie", "Carolyn", "Christine", "Marie", "Janet", "Catherine", "Frances"
];

export const SURNAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Taylor",
    "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres",
    "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz",
    "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez",
    "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim",
    "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray",
    "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long",
    "Ross", "Foster", "Jimenez", "Porter", "Ryan", "Salazar", "Hubbard", "Guardiola", "Klopp", "Arteta",
    "Lampard", "Gerrard", "Southgate", "Keane", "Scholes", "Beckham", "Rooney", "Terry", "Ferdinand"
];

/**
 * 2. KULÜP VERİTABANI (Lig Seviyelerine Göre Dağıtılmış Takımlar)
 * Önemli: Takımlar Lig Seviyesine ve Ortalama Başlangıç CA değerlerine göre ayrılmıştır.
 */
export const TEAMS_DATABASE = {
    // 1. Lig (Elit Takımlar - Ortalama CA: 155 - 180)
    1: [
        { name: "Arsenal", colors: { primary: "#ef4444", secondary: "#ffffff" }, avgCA: 165 },
        { name: "Manchester City", colors: { primary: "#00a2ff", secondary: "#ffffff" }, avgCA: 175 },
        { name: "Manchester United", colors: { primary: "#dc2626", secondary: "#000000" }, avgCA: 160 },
        { name: "Liverpool", colors: { primary: "#b91c1c", secondary: "#facc15" }, avgCA: 168 },
        { name: "Barcelona", colors: { primary: "#1e3a8a", secondary: "#b91c1c" }, avgCA: 164 },
        { name: "Real Madrid", colors: { primary: "#f8fafc", secondary: "#e2e8f0" }, avgCA: 172 },
        { name: "Galatasaray", colors: { primary: "#eab308", secondary: "#b91c1c" }, avgCA: 155 },
        { name: "Bayern Munich", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 167 },
        { name: "PSG", colors: { primary: "#1e3a8a", secondary: "#ffffff" }, avgCA: 166 },
        { name: "Atletico Madrid", colors: { primary: "#ef4444", secondary: "#1e3a8a" }, avgCA: 158 }
    ],
    // 2. Lig (Güçlü Takımlar - Ortalama CA: 140 - 154)
    2: [
        { name: "Brighton", colors: { primary: "#2563eb", secondary: "#ffffff" }, avgCA: 146 },
        { name: "Aston Villa", colors: { primary: "#800020", secondary: "#00f3ff" }, avgCA: 148 },
        { name: "Fenerbahçe", colors: { primary: "#1e3b8b", secondary: "#facc15" }, avgCA: 147 },
        { name: "Villareal", colors: { primary: "#eab308", secondary: "#1e3a8a" }, avgCA: 144 },
        { name: "AEK", colors: { primary: "#eab308", secondary: "#000000" }, avgCA: 140 },
        { name: "Freiburg", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 142 },
        { name: "Sporting Lisboa", colors: { primary: "#16a34a", secondary: "#ffffff" }, avgCA: 149 },
        { name: "Bodo Glimt", colors: { primary: "#facc15", secondary: "#000000" }, avgCA: 141 },
        { name: "Juventus", colors: { primary: "#0f172a", secondary: "#ffffff" }, avgCA: 152 },
        { name: "Inter", colors: { primary: "#1e3a8a", secondary: "#000000" }, avgCA: 154 }
    ],
    // 3. Lig (Orta Seviye Takımlar - Ortalama CA: 125 - 139)
    3: [
        { name: "Newcastle", colors: { primary: "#000000", secondary: "#ffffff" }, avgCA: 139 },
        { name: "Chelsea", colors: { primary: "#1e40af", secondary: "#ffffff" }, avgCA: 138 },
        { name: "Porto", colors: { primary: "#2563eb", secondary: "#ffffff" }, avgCA: 137 },
        { name: "Trabzonspor", colors: { primary: "#800020", secondary: "#00a2ff" }, avgCA: 132 },
        { name: "Valencia", colors: { primary: "#f8fafc", secondary: "#000000" }, avgCA: 133 },
        { name: "Olympiacos", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 134 },
        { name: "Lens", colors: { primary: "#ef4444", secondary: "#facc15" }, avgCA: 130 },
        { name: "Real Betis", colors: { primary: "#16a34a", secondary: "#ffffff" }, avgCA: 135 },
        { name: "Napoli", colors: { primary: "#0ea5e9", secondary: "#ffffff" }, avgCA: 139 },
        { name: "Dortmund", colors: { primary: "#eab308", secondary: "#000000" }, avgCA: 138 },
        { name: "Leipzig", colors: { primary: "#f8fafc", secondary: "#b91c1c" }, avgCA: 136 }
    ],
    // 4. Lig (Gelişmekte Olan Takımlar - Ortalama CA: 110 - 124)
    4: [
        { name: "Tottenham", colors: { primary: "#0f172a", secondary: "#ffffff" }, avgCA: 124 },
        { name: "Everton", colors: { primary: "#1d4ed8", secondary: "#ffffff" }, avgCA: 120 },
        { name: "Benfica", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 123 },
        { name: "Beşiktaş", colors: { primary: "#000000", secondary: "#ffffff" }, avgCA: 122 },
        { name: "Sevilla", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 118 },
        { name: "Panathinaikos", colors: { primary: "#15803d", secondary: "#ffffff" }, avgCA: 115 },
        { name: "Leverkusen", colors: { primary: "#dc2626", secondary: "#000000" }, avgCA: 124 },
        { name: "Lille", colors: { primary: "#1d4ed8", secondary: "#ffffff" }, avgCA: 119 },
        { name: "Como", colors: { primary: "#2563eb", secondary: "#ffffff" }, avgCA: 110 },
        { name: "Stuttgart", colors: { primary: "#f8fafc", secondary: "#dc2626" }, avgCA: 116 }
    ]
};

// Alt ligden düşenlerin yerine gelecek rezerv/yedek kulüpler (CA: 100 - 110)
export const RESERVE_TEAMS = [
    { name: "Samsunspor", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 105 },
    { name: "Young Boys", colors: { primary: "#eab308", secondary: "#000000" }, avgCA: 107 },
    { name: "Copenhagen", colors: { primary: "#f8fafc", secondary: "#1e3a8a" }, avgCA: 108 },
    { name: "Göztepe", colors: { primary: "#eab308", secondary: "#dc2626" }, avgCA: 104 },
    { name: "Ajax", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 110 },
    { name: "PSV", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 109 },
    { name: "AZ Alkmaar", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 106 },
    { name: "Monaco", colors: { primary: "#dc2626", secondary: "#ffffff" }, avgCA: 110 },
    { name: "Milano", colors: { primary: "#000000", secondary: "#dc2626" }, avgCA: 110 },
    { name: "Paok", colors: { primary: "#000000", secondary: "#ffffff" }, avgCA: 105 },
    { name: "Frankfurt", colors: { primary: "#000000", secondary: "#dc2626" }, avgCA: 108 },
    { name: "Lyon", colors: { primary: "#1e3a8a", secondary: "#dc2626" }, avgCA: 109 }
];

/**
 * 3. OYUNCU POZİSYONLARI
 * Sahadaki dağılım ve pozisyon kodları.
 */
export const PLAYER_POSITIONS = {
    GK: { name: "Kaleci", code: "GK", area: "gk" },
    CB: { name: "Stoper", code: "CB", area: "df" },
    LB: { name: "Sol Bek", code: "LB", area: "df" },
    RB: { name: "Sağ Bek", code: "RB", area: "df" },
    DM: { name: "Defansif Orta Saha", code: "DM", area: "mf" },
    CM: { name: "Merkez Orta Saha", code: "CM", area: "mf" },
    AM: { name: "Ofansif Orta Saha", code: "AM", area: "mf" },
    LW: { name: "Sol Kanat", code: "LW", area: "mf" },
    RW: { name: "Sağ Kanat", code: "RW", area: "mf" },
    ST: { name: "Forvet", code: "ST", area: "fw" }
};

/**
 * 4. NİTELİKLER (PASİF STATLAR) VE AÇIKLAMALARI
 */
export const ATTRIBUTES_CONFIG = {
    guc: { name: "Güç", desc: "Fiziksel mücadeleler ve şut hızı hesabını etkiler." },
    ceviklik: { name: "Çeviklik", desc: "Tepki hızı ve çalım/kayma hamlesi bonusu." },
    dayaniklilik: { name: "Dayanıklılık", desc: "Kondisyon düşüşünü yavaşlatır, sakatlık şiddetini azaltır." },
    zeka: { name: "Zeka", desc: "Yapay zeka zorluğu ve karar kalitesini belirler." },
    esneklik: { name: "Esneklik", desc: "Top kapma ve pas/şut mekaniklerini geliştirir." },
    hiz: { name: "Hız", desc: "Topsuz ve toplu koşu hızını belirler." },
    profesyonellik: { name: "Profesyonellik", desc: "Moral yönetimini ve taktiksel uyumu sağlar." }
};

/**
 * 5. YETENEKLER (AKTİF D20 ZAR STATLARI)
 */
export const SKILLS_CONFIG = {
    // Pasif Sayılan Yetenekler
    top_surme: { name: "Top Sürme", isActive: false },
    markaj: { name: "Markaj", isActive: false },
    
    // Aktif Zarlarla Tetiklenen Yetenekler (D20 Atılır)
    calim: { name: "Çalım", isActive: true, opposedBy: "top_kapma" },
    sut: { name: "Şut", isActive: true, opposedBy: "kaleci_refleksi" },
    pas: { name: "Pas", isActive: true, opposedBy: "markaj" },
    arapas: { name: "Ara Pas", isActive: true, opposedBy: "markaj" },
    orta_acma: { name: "Orta Açma", isActive: true, opposedBy: "markaj" },
    top_kapma: { name: "Top Kapma", isActive: true, opposedBy: "calim" },
    kayma: { name: "Kayma", isActive: true, opposedBy: "calim" },
    kaleci_refleksi: { name: "Kaleci Refleksi", isActive: true, opposedBy: "sut" },
    kafa_vurusu: { name: "Kafa Vuruşu", isActive: true, opposedBy: "markaj" },
    rovasata: { name: "Rövaşata", isActive: true, opposedBy: "kaleci_refleksi" }
};

/**
 * 6. ÖZEL YETENEKLER (TRAITS)
 * Barbar ve Yıldız Oyuncu mekanikleri.
 */
export const SPECIAL_TRAITS = {
    barbar: {
        name: "Barbar",
        desc: "2 kat daha zor sakatlanır, Güç zarlarını avantajlı atar. Kondisyon düşüşü 2 kat yavaş, yenilenmesi 2 kat hızlıdır.",
        activationCondition: "Dayanıklılık ve Güç niteliklerinin ikisi de en az 15 olmalıdır."
    },
    yildiz_oyuncu: {
        name: "Yıldız Oyuncu",
        desc: "Tüm zar atışlarını avantajlı (iki zar atıp en yükseğini seçme) atar.",
        activationCondition: "Herhangi bir sezon sonu ödülü (Gol Kralı, Yılın Oyuncusu vs.) alındığında aktif olur."
    }
};

/**
 * 7. MEVKİ BAZLI CA STAT AĞIRLIK HARİTASI (POSITION CA WEIGHTS)
 * Bir oyuncunun CA (Current Ability) puanına her özelliğin etki gücü katsayısı.
 * Örneğin, bir Kaleci için Kaleci Refleksi katsayısı yüksekken, Forvet için Şut yüksektir.
 */
export const POSITION_WEIGHTS = {
    GK: {
        attributes: { guc: 1.0, ceviklik: 1.5, dayaniklilik: 1.0, zeka: 1.2, esneklik: 1.5, hiz: 0.5, profesyonellik: 1.0 },
        skills: { kaleci_refleksi: 3.0, pas: 1.0, top_surme: 0.1, markaj: 0.1, calim: 0.1, sut: 0.1, top_kapma: 0.1, kayma: 0.1, arapas: 0.5, orta_acma: 0.2, kafa_vurusu: 0.5, rovasata: 0.1 }
    },
    CB: {
        attributes: { guc: 1.8, ceviklik: 1.0, dayaniklilik: 1.4, zeka: 1.5, esneklik: 1.2, hiz: 1.2, profesyonellik: 1.0 },
        skills: { markaj: 2.5, top_kapma: 2.5, kafa_vurusu: 2.0, kayma: 1.5, pas: 1.0, calim: 0.2, sut: 0.3, top_surme: 0.5, arapas: 0.5, orta_acma: 0.3, kaleci_refleksi: 0.1, rovasata: 0.2 }
    },
    LB: {
        attributes: { guc: 1.2, ceviklik: 1.4, dayaniklilik: 1.6, zeka: 1.3, esneklik: 1.2, hiz: 1.8, profesyonellik: 1.0 },
        skills: { top_kapma: 2.0, markaj: 1.8, orta_acma: 2.0, top_surme: 1.4, calim: 1.2, pas: 1.2, kayma: 1.4, kafa_vurusu: 0.8, arapas: 1.0, sut: 0.5, kaleci_refleksi: 0.1, rovasata: 0.1 }
    },
    RB: {
        attributes: { guc: 1.2, ceviklik: 1.4, dayaniklilik: 1.6, zeka: 1.3, esneklik: 1.2, hiz: 1.8, profesyonellik: 1.0 },
        skills: { top_kapma: 2.0, markaj: 1.8, orta_acma: 2.0, top_surme: 1.4, calim: 1.2, pas: 1.2, kayma: 1.4, kafa_vurusu: 0.8, arapas: 1.0, sut: 0.5, kaleci_refleksi: 0.1, rovasata: 0.1 }
    },
    DM: {
        attributes: { guc: 1.5, ceviklik: 1.1, dayaniklilik: 1.7, zeka: 1.6, esneklik: 1.3, hiz: 1.1, profesyonellik: 1.0 },
        skills: { markaj: 2.2, top_kapma: 2.2, pas: 1.8, arapas: 1.5, kafa_vurusu: 1.2, kayma: 1.2, top_surme: 1.0, calim: 0.8, sut: 0.8, orta_acma: 0.8, kaleci_refleksi: 0.1, rovasata: 0.2 }
    },
    CM: {
        attributes: { guc: 1.2, ceviklik: 1.3, dayaniklilik: 1.6, zeka: 1.8, esneklik: 1.4, hiz: 1.2, profesyonellik: 1.0 },
        skills: { pas: 2.5, arapas: 2.5, top_surme: 1.5, calim: 1.4, top_kapma: 1.2, markaj: 1.2, sut: 1.2, orta_acma: 1.0, kafa_vurusu: 0.8, kayma: 0.8, kaleci_refleksi: 0.1, rovasata: 0.3 }
    },
    AM: {
        attributes: { guc: 1.0, ceviklik: 1.6, dayaniklilik: 1.3, zeka: 1.9, esneklik: 1.5, hiz: 1.4, profesyonellik: 1.0 },
        skills: { arapas: 2.8, calim: 2.2, pas: 2.0, top_surme: 1.8, sut: 1.6, orta_acma: 1.2, markaj: 0.5, top_kapma: 0.5, kafa_vurusu: 0.8, kayma: 0.3, kaleci_refleksi: 0.1, rovasata: 0.6 }
    },
    LW: {
        attributes: { guc: 0.9, ceviklik: 1.8, dayaniklilik: 1.5, zeka: 1.4, esneklik: 1.4, hiz: 2.0, profesyonellik: 1.0 },
        skills: { calim: 2.5, top_surme: 2.2, orta_acma: 2.0, sut: 1.6, pas: 1.4, arapas: 1.4, markaj: 0.4, top_kapma: 0.4, kafa_vurusu: 0.6, kayma: 0.2, kaleci_refleksi: 0.1, rovasata: 0.5 }
    },
    RW: {
        attributes: { guc: 0.9, ceviklik: 1.8, dayaniklilik: 1.5, zeka: 1.4, esneklik: 1.4, hiz: 2.0, profesyonellik: 1.0 },
        skills: { calim: 2.5, top_surme: 2.2, orta_acma: 2.0, sut: 1.6, pas: 1.4, arapas: 1.4, markaj: 0.4, top_kapma: 0.4, kafa_vurusu: 0.6, kayma: 0.2, kaleci_refleksi: 0.1, rovasata: 0.5 }
    },
    ST: {
        attributes: { guc: 1.6, ceviklik: 1.4, dayaniklilik: 1.3, zeka: 1.6, esneklik: 1.2, hiz: 1.7, profesyonellik: 1.0 },
        skills: { sut: 3.0, kafa_vurusu: 2.0, calim: 1.5, top_surme: 1.3, rovasata: 1.0, pas: 0.8, arapas: 0.6, markaj: 0.2, top_kapma: 0.2, kayma: 0.1, orta_acma: 0.4, kaleci_refleksi: 0.1 }
    }
};

/**
 * 8. EKONOMİ VE DEĞER PARAMETRELERİ (FINANCIAL CONSTANTS)
 * Cyberfoot stili baz transfer değerleri ve haftalık maaş katsayıları.
 * Formül: Baz Fiyat = CA Katsayısı * Reputation Katsayısı * Sezonluk Ort Puan Katsayısı
 */
export const FINANCIAL_BASE_TABLE = {
    // CA seviyesine göre baz fiyat katsayısı (€)
    caValues: [
        { min: 1, max: 80, baseVal: 50000, baseWage: 500 },
        { min: 81, max: 100, baseVal: 200000, baseWage: 1500 },
        { min: 101, max: 120, baseVal: 1000000, baseWage: 8000 },
        { min: 121, max: 135, baseVal: 5000000, baseWage: 25000 },
        { min: 136, max: 150, baseVal: 15000000, baseWage: 60000 },
        { min: 151, max: 165, baseVal: 35000000, baseWage: 120000 },
        { min: 166, max: 180, baseVal: 70000000, baseWage: 220000 },
        { min: 181, max: 200, baseVal: 120000000, baseWage: 350000 }
    ],
    // Reputation (1-20) katsayısı (Baz fiyatı çarpar)
    reputationMultiplier: {
        1: 1.0, 2: 1.05, 3: 1.1, 4: 1.15, 5: 1.2,
        6: 1.3, 7: 1.4, 8: 1.5, 9: 1.6, 10: 1.8,
        11: 2.0, 12: 2.2, 13: 2.5, 14: 2.8, 15: 3.2,
        16: 3.8, 17: 4.5, 18: 5.5, 19: 7.0, 20: 10.0
    },
    // Maç başına kazanılacak para (Lig seviyesine göre değişken bilet/tv payı)
    matchWinPrize: {
        1: 500000, // 1. Lig galibiyet ödülü (€500.000)
        2: 250000, // 2. Lig galibiyet ödülü
        3: 125000, // 3. Lig galibiyet ödülü
        4: 60000   // 4. Lig galibiyet ödülü
    }
};

/**
 * 9. LÜKS MAĞAZA KATALOĞU (LIFESTYLE STORE ASSETS)
 * Menajerin (ve oyuncuların) satın alabileceği mülkler ve personeller.
 */
export const LIFESTYLE_ASSETS_CATALOG = {
    realestate: [
        { id: "house_1", name: "Şehir Merkezi Daire", price: 250000, maintenance: 1000, stylePoints: 50, icon: "🏢" },
        { id: "house_2", name: "Lüks Banliyö Villası", price: 1500000, maintenance: 5000, stylePoints: 300, icon: "🏡" },
        { id: "house_3", name: "Malikane & Şato", price: 8000000, maintenance: 25000, stylePoints: 1200, icon: "🏰" }
    ],
    vehicles: [
        { id: "car_1", name: "Spor Araba", price: 150000, maintenance: 500, stylePoints: 40, icon: "🚗" },
        { id: "car_2", name: "Ultra Lüks Hypercar", price: 2500000, maintenance: 10000, stylePoints: 500, icon: "🏎️" },
        { id: "yacht_1", name: "Süper Yat", price: 12000000, maintenance: 80000, stylePoints: 2000, icon: "🚢" }
    ],
    staff: [
        { id: "staff_1", name: "Özel Aşçı ve Hizmetli", price: 0, maintenance: 15000, stylePoints: 100, icon: "👨‍🍳", statBonus: 1 }
    ]
};
