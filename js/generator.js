/**
 * ============================================================================
 * CYBERERA FOOTBALL MANAGER 2026 - WORLD GENERATOR (generator.js)
 * Yazar: AI & Sen
 * Açıklama: Yeni kariyer başlatıldığında evreni sıfırdan yaratan motor.
 * Ligleri, takımları, binlerce oyuncuyu, regenleri ve NPC menajerleri 
 * CA/PA dengesine, cinsiyete ve mevkilere göre prosedürel olarak üretir.
 * ============================================================================
 */

import {
    MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, SURNAMES,
    TEAMS_DATABASE, RESERVE_TEAMS, PLAYER_POSITIONS,
    POSITION_WEIGHTS, FINANCIAL_BASE_TABLE, SPECIAL_TRAITS
} from './database.js';

// ============================================================================
// YARDIMCI (HELPER) FONKSİYONLAR
// ============================================================================

/** Rastgele tam sayı üretir (min ve max dahil) */
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Rastgele dizi elemanı seçer */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Benzersiz ID (UUID) üretici */
const generateUUID = (prefix = 'ID') => {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

/** Ağırlıklı rastgele seçim (Weighted Random) */
const getWeightedRandomKey = (weightsObj) => {
    let sum = 0;
    for (let key in weightsObj) sum += weightsObj[key];
    let rand = Math.random() * sum;
    for (let key in weightsObj) {
        if (rand < weightsObj[key]) return key;
        rand -= weightsObj[key];
    }
    return Object.keys(weightsObj)[0];
};

/** 
 * İsim Üretici
 * @param {string} gender - 'male' veya 'female'
 */
const generateName = (gender) => {
    const firstNames = gender === 'female' ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES;
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(SURNAMES);
    return { firstName, lastName, fullName: `${firstName} ${lastName}` };
};

// ============================================================================
// YAPAY ZEKA (NPC) MENAJER JENERATÖRÜ
// ============================================================================

/**
 * 52 puanlık nitelik havuzunu NPC menajerlere mantıklı dağıtır
 */
const generateNPCManager = (clubName) => {
    const gender = Math.random() > 0.8 ? 'female' : 'male'; // %20 Kadın Menajer
    const { firstName, lastName, fullName } = generateName(gender);
    const personalities = ['disciplined', 'motivator', 'tactician', 'economist'];
    
    // Temel nitelikleri 1'den başlat (Toplam 4 puan)
    let stats = { training: 1, tactics: 1, transfer: 1, morale: 1 };
    let pointsLeft = 52 - 4; // Dağıtılacak 48 puan var

    // Kalan 48 puanı rastgele dağıt (Max sınır 20)
    const statKeys = Object.keys(stats);
    while (pointsLeft > 0) {
        let randomStat = pickRandom(statKeys);
        if (stats[randomStat] < 20) {
            stats[randomStat]++;
            pointsLeft--;
        }
    }

    return {
        id: generateUUID('MGR'),
        isHuman: false,
        firstName,
        lastName,
        fullName,
        gender,
        personality: pickRandom(personalities),
        clubId: null, // Takım atandığında güncellenecek
        portrait: `assets/manager_${gender}_${rnd(1,10)}.png`, // Varsayılan resim
        attributes: stats,
        finances: {
            personalWealth: rnd(50000, 2000000),
            stylePoints: rnd(10, 500)
        },
        relationships: {
            status: Math.random() > 0.5 ? "Evli" : "Bekar",
            partnerName: Math.random() > 0.5 ? generateName(gender === 'male' ? 'female' : 'male').fullName : null,
            health: rnd(30, 100)
        }
    };
};

// ============================================================================
// OYUNCU (FUTBOLCU) JENERATÖRÜ VE MATEMATİĞİ
// ============================================================================

/**
 * Belirli bir mevki ve hedef CA (Mevcut Yetenek) için oyuncu yaratır.
 * Yetenekler 1-20 arası, CA/PA ise 1-200 arasıdır.
 */
const generatePlayer = (positionCode, targetCA, teamAvgCA) => {
    // 1. Temel Bilgiler
    // Kadın futbolcu oranı %15 olsun (Modern evren ayarı)
    const gender = Math.random() > 0.85 ? 'female' : 'male';
    const { firstName, lastName, fullName } = generateName(gender);
    
    // Yaş Dağılımı: Genç (16-21) %20, Olgun (22-29) %60, Yaşlı (30-36) %20
    const ageRoll = Math.random();
    let age = 24;
    if (ageRoll < 0.20) age = rnd(16, 21);
    else if (ageRoll < 0.80) age = rnd(22, 29);
    else age = rnd(30, 36);

    // PA (Potansiyel Yetenek) Hesaplaması
    // Gençlerin potansiyeli daha yüksektir. Yaşlıların PA'sı CA'sına eşittir.
    let paMargin = 0;
    if (age <= 21) paMargin = rnd(10, 35);
    else if (age <= 25) paMargin = rnd(5, 15);
    else if (age <= 28) paMargin = rnd(0, 5);
    else paMargin = 0; // 28 yaşından sonra potansiyel artmaz
    
    let PA = targetCA + paMargin;
    if (PA > 200) PA = 200; // Maksimum sınır
    
    // Baskın Ayak (Sağ %70, Sol %20, Çift %10)
    const footRoll = Math.random();
    let dominantFoot = "Sağ";
    if (footRoll > 0.9) dominantFoot = "Çift";
    else if (footRoll > 0.7) dominantFoot = "Sol";

    // 2. Başlangıç Statları (Her şey 1)
    let attributes = { guc: 1, ceviklik: 1, dayaniklilik: 1, zeka: 1, esneklik: 1, hiz: 1, profesyonellik: rnd(5, 20) };
    let skills = { top_surme: 1, markaj: 1, calim: 1, sut: 1, pas: 1, arapas: 1, orta_acma: 1, top_kapma: 1, kayma: 1, kaleci_refleksi: 1, kafa_vurusu: 1, rovasata: 1 };
    
    // Profesyonellik CA'yı etkilemez, oyuncunun karakteridir. O yüzden onu dağıtımdan çıkarıyoruz.

    const posWeights = POSITION_WEIGHTS[positionCode];
    
    // 3. Hedef CA'ya Ulaşana Kadar Stat Dağıtma Algoritması
    // Basit bir yaklaşımla: Hedef CA'nın 200'e oranı kadar toplam puan dağıtacağız.
    // 200 CA = Yaklaşık tüm statların ağırlıklı ortalamasının 20 olması demektir.
    // Toplam 18 stat var (6 nitelik + 12 yetenek). Max puan havuzu ~360.
    // Formula: Dağıtılacak Puan = (targetCA / 200) * 360 * 0.85
    
    let totalPointsToDistribute = Math.floor((targetCA / 200) * 320); // 320 kalibrasyon değeri
    
    // Statları rastgele artır (Mevki ağırlıklarını baz alarak)
    while (totalPointsToDistribute > 0) {
        // Nitelik mi, Yetenek mi artacak? (%40 Nitelik, %60 Yetenek)
        if (Math.random() < 0.40) {
            let attrKey = getWeightedRandomKey(posWeights.attributes);
            if (attributes[attrKey] < 20) {
                attributes[attrKey]++;
                totalPointsToDistribute--;
            }
        } else {
            let skillKey = getWeightedRandomKey(posWeights.skills);
            if (skills[skillKey] < 20) {
                skills[skillKey]++;
                totalPointsToDistribute--;
            }
        }
    }

    // 4. Cinsiyet Bonusları (Kural Seti)
    if (gender === 'male') {
        // Erkek: Güç ve Dayanıklılık +1 veya +2
        attributes.guc = Math.min(20, attributes.guc + rnd(1, 2));
        attributes.dayaniklilik = Math.min(20, attributes.dayaniklilik + rnd(1, 2));
    } else {
        // Kadın: Esneklik ve Çeviklik +1 veya +2
        attributes.esneklik = Math.min(20, attributes.esneklik + rnd(1, 2));
        attributes.ceviklik = Math.min(20, attributes.ceviklik + rnd(1, 2));
    }

    // 5. Özel Yetenek (Trait) Kontrolleri
    let specialTrait = null;
    // Barbar Kontrolü (Dayanıklılık ve Güç >= 15 ise %20 ihtimal)
    if (attributes.dayaniklilik >= 15 && attributes.guc >= 15) {
        if (Math.random() < 0.20) specialTrait = "barbar";
    }

    // 6. Değer ve Maaş Hesaplaması (Economy Module)
    // Reputation CA'ya bağlı başlar (1-20)
    let reputation = Math.ceil(targetCA / 10); 
    if (reputation > 20) reputation = 20;
    if (reputation < 1) reputation = 1;

    // Mali tabloya göre baz fiyat bul
    let baseVal = 50000;
    let baseWage = 500;
    for (let tier of FINANCIAL_BASE_TABLE.caValues) {
        if (targetCA >= tier.min && targetCA <= tier.max) {
            baseVal = tier.baseVal;
            baseWage = tier.baseWage;
            break;
        }
    }

    // İtibar Çarpanı Ekle
    const repMult = FINANCIAL_BASE_TABLE.reputationMultiplier[reputation] || 1;
    let marketValue = Math.floor(baseVal * repMult);
    let weeklyWage = Math.floor(baseWage * (repMult * 0.8)); // Maaş biraz daha düşük ivmeyle artar

    // Gençse değeri artar, yaşlıysa düşer
    if (age <= 21) marketValue = Math.floor(marketValue * 1.5);
    if (age >= 32) marketValue = Math.floor(marketValue * 0.4);

    return {
        id: generateUUID('PLR'),
        firstName,
        lastName,
        fullName,
        gender,
        age,
        position: positionCode,
        dominantFoot,
        CA: targetCA,
        PA,
        reputation,
        specialTrait,
        condition: 100, // %100 Fiziksel Kondisyon
        morale: 100, // %100 Moral
        attributes,
        skills,
        contract: {
            wage: weeklyWage,
            endYear: 2026 + rnd(1, 5) // 1 ila 5 yıllık sözleşmeler
        },
        finances: {
            marketValue,
            personalWealth: weeklyWage * rnd(10, 100) // Geçmişten kalan birikim simülasyonu
        },
        relationships: {
            status: Math.random() > 0.6 ? "Sevgili" : "Bekar",
            partnerName: Math.random() > 0.6 ? generateName(gender === 'male' ? 'female' : 'male').fullName : null,
            health: rnd(50, 100)
        },
        stats: {
            appearances: 0, goals: 0, assists: 0, avgRating: 0.0,
            distanceRun: 0, shotsOnTarget: 0, passesCompleted: 0,
            tacklesWon: 0, saves: 0, conceded: 0,
            redCards: 0, yellowCards: 0,
            history: [] // Önceki sezon verileri (Yeni oyunda boş)
        },
        transferHistory: [] // [{year, from, to, fee}]
    };
};

/**
 * Bir kulüp için 24 kişilik tam teşekküllü bir kadro üretir
 * Dağılım: 3 GK, 4 CB, 2 LB, 2 RB, 2 DM, 4 CM, 2 AM, 2 LW, 2 RW, 3 ST
 */
const generateSquad = (teamAvgCA) => {
    const squad = [];
    const positionsToFill = [
        ...Array(3).fill('GK'), ...Array(4).fill('CB'),
        ...Array(2).fill('LB'), ...Array(2).fill('RB'),
        ...Array(2).fill('DM'), ...Array(4).fill('CM'),
        ...Array(2).fill('AM'), ...Array(2).fill('LW'),
        ...Array(2).fill('RW'), ...Array(3).fill('ST')
    ];

    positionsToFill.forEach(pos => {
        // Her oyuncunun CA'sı takım ortalamasından -8 ile +8 arası sapabilir
        // Böylece takımda yedekler zayıf, yıldızlar güçlü olur.
        const variance = rnd(-8, 8);
        let playerCA = teamAvgCA + variance;
        if (playerCA > 200) playerCA = 200;
        if (playerCA < 1) playerCA = 1;

        const newPlayer = generatePlayer(pos, playerCA, teamAvgCA);
        squad.push(newPlayer);
    });

    return squad;
};

// ============================================================================
// ANA DÜNYA YARATILIŞ (BOOTSTRAP) FONKSİYONU
// ============================================================================

/**
 * Tüm GameState'i sıfırlar ve database.js'e göre dünyayı yaratır.
 * main.js tarafından yeni oyuna tıklandığında async olarak çağrılır.
 * @param {Object} GameState - main.js'den gelen global durum objesi
 */
export const generateWorld = async (GameState) => {
    console.log("[GENERATOR] Dünya yaratım süreci başlatıldı...");

    // 1. Array'leri temizle
    GameState.world.clubs = [];
    GameState.world.players = [];
    GameState.world.managers = [];
    GameState.world.leagues = [
        { level: 1, name: "Cyber Premier Lig", standings: [], playoffTop: [], playoffBottom: [] },
        { level: 2, name: "Cyber Championship", standings: [], playoffTop: [], playoffBottom: [] },
        { level: 3, name: "Cyber League One", standings: [], playoffTop: [], playoffBottom: [] },
        { level: 4, name: "Cyber League Two", standings: [], playoffTop: [], playoffBottom: [] }
    ];

    // Oyuncunun menajer profilini manager listesine ekle
    GameState.player.isHuman = true;
    GameState.world.managers.push(GameState.player);

    let humanAssigned = false; // Oyuncunun bir takıma atanıp atanmadığını izle

    // 2. TEAMS_DATABASE Üzerinde Dönerek Kulüpleri, Kadroları ve NPC'leri Yarat
    for (let leagueLevel in TEAMS_DATABASE) {
        const teamsArray = TEAMS_DATABASE[leagueLevel];
        
        for (let teamData of teamsArray) {
            
            // Kulüp objesini oluştur
            const clubId = generateUUID('CLUB');
            const club = {
                id: clubId,
                name: teamData.name,
                leagueLevel: parseInt(leagueLevel),
                colors: teamData.colors,
                avgCA: teamData.avgCA,
                reputation: Math.ceil(teamData.avgCA / 10), // 150 CA = 15 Rep
                finances: {
                    balance: teamData.avgCA * 200000, // Örn: 160 CA = 32 Milyon Euro Bakiye
                    debt: 0
                },
                facilities: {
                    stadiumLevel: Math.ceil(teamData.avgCA / 40), // 1-5 arası
                    trainingLevel: Math.ceil(teamData.avgCA / 40),
                    youthLevel: Math.ceil(teamData.avgCA / 45)
                },
                legends: [],
                squadIds: [],
                managerId: null
            };

            // 3. Kadroyu Yarat
            const squad = generateSquad(teamData.avgCA);
            squad.forEach(player => {
                player.clubId = clubId;
                club.squadIds.push(player.id);
                GameState.world.players.push(player); // Global listeye ekle
            });

            // 4. Menajer Ataması (İnsan Oyuncu mu NPC mi?)
            // Kullanıcıyı rastgele 1. veya 2. ligden bir takıma atayalım (Eğer seçmemişse)
            if (!humanAssigned && parseInt(leagueLevel) <= 2) {
                // %20 ihtimalle bu takıma ata (rastgeleliği sağlamak için)
                if (Math.random() < 0.20 || (parseInt(leagueLevel) === 2 && teamsArray.indexOf(teamData) === teamsArray.length - 1)) {
                    club.managerId = GameState.player.id;
                    GameState.player.clubId = clubId;
                    humanAssigned = true;
                    console.log(`[GENERATOR] İnsan Oyuncu (${GameState.player.lastName}) -> ${club.name} takımına atandı.`);
                } else {
                    const npcManager = generateNPCManager(club.name);
                    npcManager.clubId = clubId;
                    club.managerId = npcManager.id;
                    GameState.world.managers.push(npcManager);
                }
            } else {
                // Normal NPC Menajer Yarat ve Ata
                const npcManager = generateNPCManager(club.name);
                npcManager.clubId = clubId;
                club.managerId = npcManager.id;
                GameState.world.managers.push(npcManager);
            }

            // Kulübü Global Listeye Ekle
            GameState.world.clubs.push(club);

            // Lig Puan Durumu Tablosuna (Standings) Kaydet
            const leagueIndex = parseInt(leagueLevel) - 1;
            GameState.world.leagues[leagueIndex].standings.push({
                clubId: clubId,
                played: 0, won: 0, drawn: 0, lost: 0,
                goalsFor: 0, goalsAgainst: 0, goalDiff: 0,
                points: 0, form: []
            });
        }
    }

    // 5. Serbest Statüdeki Rezerv Takımları Yarat (4. Ligden düşenlerin yerine geçmek için)
    // Bunların ligleri yoktur, alt klasörde beklerler
    GameState.world.reserveClubs = [];
    for (let resData of RESERVE_TEAMS) {
        const resClubId = generateUUID('RES_CLUB');
        const resClub = {
            id: resClubId,
            name: resData.name,
            leagueLevel: 0, // Aktif ligde değil
            colors: resData.colors,
            avgCA: resData.avgCA,
            reputation: Math.ceil(resData.avgCA / 10),
            finances: { balance: 5000000, debt: 0 },
            facilities: { stadiumLevel: 2, trainingLevel: 2, youthLevel: 2 },
            squadIds: [],
            managerId: null
        };

        const squad = generateSquad(resData.avgCA);
        squad.forEach(player => {
            player.clubId = resClubId;
            resClub.squadIds.push(player.id);
            GameState.world.players.push(player);
        });

        const npcManager = generateNPCManager(resClub.name);
        npcManager.clubId = resClubId;
        resClub.managerId = npcManager.id;
        GameState.world.managers.push(npcManager);

        GameState.world.reserveClubs.push(resClub);
    }

    console.log(`[GENERATOR] Dünya Başarıyla Yaratıldı!`);
    console.log(`[GENERATOR] Toplam Kulüp: ${GameState.world.clubs.length + GameState.world.reserveClubs.length}`);
    console.log(`[GENERATOR] Toplam Oyuncu: ${GameState.world.players.length}`);
    console.log(`[GENERATOR] Toplam Menajer: ${GameState.world.managers.length}`);
    
    // CPU'yu yormamak adına biraz bekleme simülasyonu ekliyoruz (Yükleme ekranının okunması için)
    await new Promise(resolve => setTimeout(resolve, 800));
};

// Modül dışa aktarımı
export default { generateWorld };
