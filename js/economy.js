/**
 * ============================================================================
 * CYBERERA FOOTBALL MANAGER 2026 - ECONOMY ENGINE (economy.js)
 * Yazar: AI & Sen
 * Açıklama: Kulüp ve bireysel finans yönetimini, küresel enflasyonu,
 * bilet/TV gelirlerini, kredi/faiz sarmalını, oyuncu değerlemelerini ve 
 * kulübü batıran menajerlerin kovulma algoritmalarını yöneten ana modül.
 * ============================================================================
 */

import { FINANCIAL_BASE_TABLE, LIFESTYLE_ASSETS_CATALOG } from './database.js';

// ============================================================================
// YARDIMCI / LOGLAMA FONKSİYONLARI
// ============================================================================

const logEconomy = (message, type = "info") => {
    const colors = { info: "#00a2ff", success: "#00ff66", warning: "#ffb800", danger: "#ff003c" };
    console.log(`%c[ECONOMY]%c ${message}`, `color: ${colors[type]}; font-weight: bold;`, `color: #e2e8f0;`);
};

/**
 * ID'ye göre oyuncuyu global havuzdan bulur
 */
const getPlayerById = (GameState, playerId) => {
    return GameState.world.players.find(p => p.id === playerId);
};

/**
 * ID'ye göre menajeri global havuzdan bulur
 */
const getManagerById = (GameState, managerId) => {
    return GameState.world.managers.find(m => m.id === managerId);
};

// ============================================================================
// 1. HAFTALIK FİNANS İŞLEMLERİ (WAGES & SALARIES)
// ============================================================================

/**
 * Her maç haftasının sonunda (veya takvimde hafta dönümünde) çağrılır.
 * Tüm dünyadaki oyuncu ve menajer maaşlarını kulüp kasasından düşer.
 * @param {Object} GameState - Global Durum Objesi
 */
export const processWeeklyFinances = (GameState) => {
    logEconomy("Haftalık maaş ve finansal giderler işleniyor...", "info");

    const allClubs = [...GameState.world.clubs, ...GameState.world.reserveClubs];

    allClubs.forEach(club => {
        let totalWageExpense = 0;

        // 1. Oyuncu Maaşlarını Hesapla ve Öde
        if (club.squadIds && club.squadIds.length > 0) {
            club.squadIds.forEach(playerId => {
                const player = getPlayerById(GameState, playerId);
                if (player && player.contract && player.contract.wage) {
                    totalWageExpense += player.contract.wage;
                    // Oyuncunun bireysel serveti artar
                    player.finances.personalWealth += player.contract.wage;
                }
            });
        }

        // 2. Menajer Maaşını Hesapla ve Öde
        if (club.managerId) {
            const manager = getManagerById(GameState, club.managerId);
            if (manager) {
                // Menajer maaşı takımın ortalama CA'sına göre varsayımsal hesaplanır
                // Formül: (AvgCA * 1000) * İtibar Katsayısı
                const managerWage = (club.avgCA * 1000) * (manager.finances.stylePoints > 500 ? 1.5 : 1.0);
                totalWageExpense += managerWage;
                
                // Menajerin şahsi hesabına parayı yatır
                manager.finances.personalWealth += managerWage;
            }
        }

        // 3. Kulübün Kasasından Düş (Eğer para yoksa bakiye eksiye - borca düşer)
        club.finances.balance -= totalWageExpense;

        // Eksiye düştüyse borç miktarını güncelle
        if (club.finances.balance < 0) {
            club.finances.debt = Math.abs(club.finances.balance);
        } else {
            club.finances.debt = 0;
        }
    });

    logEconomy("Tüm haftalık maaşlar ödendi ve şahsi servetlere aktarıldı.", "success");
};

// ============================================================================
// 2. AYLIK FİNANS İŞLEMLERİ (SPONSOR, BAKIM, FAİZ VE YAŞAM GİDERLERİ)
// ============================================================================

/**
 * Her ayın sonunda (Örn: 1 Eylül, 1 Ekim) çağrılır.
 * Tesis giderleri, sponsorluk gelirleri, kredi faizleri ve yaşam simülasyonu harcamaları.
 */
export const processMonthlyFinances = (GameState) => {
    logEconomy("Aylık finansal bilanço (Sponsor, TV, Tesis, Faiz) hesaplanıyor...", "info");

    const allClubs = [...GameState.world.clubs, ...GameState.world.reserveClubs];

    allClubs.forEach(club => {
        // 1. Sponsorluk, Yayın (TV) ve Ürün (Merchandise) Gelirleri
        // Lig seviyesi düştükçe baz gelir azalır. 1. Lig: 5M, 2. Lig: 2M, 3. Lig: 800k, 4. Lig: 300k
        let baseSponsorship = 0;
        switch(club.leagueLevel) {
            case 1: baseSponsorship = 5000000; break;
            case 2: baseSponsorship = 2000000; break;
            case 3: baseSponsorship = 800000; break;
            case 4: baseSponsorship = 300000; break;
            default: baseSponsorship = 100000; break; // Rezerv takımlar
        }

        // İtibar çarpanı: 20 İtibar = 2.0 Çarpan, 10 İtibar = 1.0 Çarpan
        const repMultiplier = Math.max(0.5, club.reputation / 10);
        const totalMonthlyIncome = Math.floor(baseSponsorship * repMultiplier);
        
        club.finances.balance += totalMonthlyIncome;

        // 2. Tesis Bakım Giderleri (Maintenance)
        // Stadyum, Antrenman ve Altyapı seviyeleri (1-5 arası)
        const stadiumCost = club.facilities.stadiumLevel * 150000;
        const trainingCost = club.facilities.trainingLevel * 100000;
        const youthCost = club.facilities.youthLevel * 75000;
        const totalMaintenance = stadiumCost + trainingCost + youthCost;

        club.finances.balance -= totalMaintenance;

        // 3. Borç ve Faiz Sarmalı (İflas Riski)
        // Eğer bakiye 0'ın altındaysa banka devreye girer ve aylık %3 bileşik faiz işler
        if (club.finances.balance < 0) {
            const interest = Math.floor(Math.abs(club.finances.balance) * 0.03);
            club.finances.balance -= interest; // Faiz ana paraya eklenir (eksi olarak büyür)
            club.finances.debt = Math.abs(club.finances.balance);
            
            // AI veya İnsan Menajer için iflas kontrolü
            checkJobSecurity(GameState, club);
        } else {
            club.finances.debt = 0;
        }
    });

    // 4. Bireysel Yaşam ve Stil Giderleri (Sims Mekaniği)
    processLifestyleExpenses(GameState);

    logEconomy("Aylık kulüp bilançoları kapandı ve faizler işlendi.", "success");
};

/**
 * Menajerlerin lüks hayat giderlerini (ev, araba, hizmetli) şahsi servetlerinden düşer.
 */
const processLifestyleExpenses = (GameState) => {
    GameState.world.managers.forEach(manager => {
        let monthlyLifestyleCost = manager.finances.monthlyExpense || 2000; // Baz yaşam gideri

        // Satın alınan mülklerin (assets) aylık bakım (maintenance) masraflarını ekle
        if (manager.assets && manager.assets.length > 0) {
            manager.assets.forEach(assetId => {
                // Asset ID'sini veritabanında ara
                const assetTypes = ['realestate', 'vehicles', 'staff'];
                for (let type of assetTypes) {
                    const found = LIFESTYLE_ASSETS_CATALOG[type].find(a => a.id === assetId);
                    if (found) {
                        monthlyLifestyleCost += found.maintenance;
                        break;
                    }
                }
            });
        }

        // Sevgili/Eş varsa ek gider
        if (manager.relationships && manager.relationships.partnerName) {
            monthlyLifestyleCost += 3000; // Partner masrafı
        }

        manager.finances.personalWealth -= monthlyLifestyleCost;

        // Eğer menajer parasız kalırsa (Şahsi iflas)
        if (manager.finances.personalWealth < 0) {
            // Şahsi borca girer, stil puanı (Reputation) düşer
            manager.finances.stylePoints = Math.max(0, manager.finances.stylePoints - 50);
            
            if(manager.isHuman) {
                logEconomy("Şahsi iflas durumundasınız! Lüks harcamalarınız maaşınızı aşıyor. Stil puanınız düşüyor.", "danger");
            }
        }
    });
};

// ============================================================================
// 3. MAÇ GÜNÜ BİLET GELİRLERİ (MATCHDAY INCOME)
// ============================================================================

/**
 * Her maç oynandığında ev sahibi takım için bilet/maç günü hasılatı hesaplar.
 * @param {Object} homeClub - Ev sahibi kulüp objesi
 * @returns {number} Kazanılan Euro (€)
 */
export const calculateMatchdayIncome = (homeClub) => {
    // Stadyum kapasitesi: Seviye 1 = 15.000, Seviye 5 = 75.000 (Seviye başı 15k)
    const capacity = homeClub.facilities.stadiumLevel * 15000;
    
    // Bilet fiyatı: Lig kalitesine göre (1. Lig 80€, 4. Lig 20€)
    let ticketPrice = 0;
    switch(homeClub.leagueLevel) {
        case 1: ticketPrice = 80; break;
        case 2: ticketPrice = 50; break;
        case 3: ticketPrice = 30; break;
        case 4: ticketPrice = 20; break;
        default: ticketPrice = 10; break;
    }

    // Doluluk oranı: Kulübün itibarına (1-20) bağlıdır.
    // 20 İtibar = %100 dolu, 10 İtibar = %50 dolu. (Rastgelelik için +- %10 dalgalanma)
    let fillRate = (homeClub.reputation * 5) + (Math.random() * 20 - 10);
    if (fillRate > 100) fillRate = 100;
    if (fillRate < 10) fillRate = 10;

    const spectators = Math.floor(capacity * (fillRate / 100));
    const totalMatchIncome = spectators * ticketPrice;
    
    // Yiyecek/İçecek ve formadan gelen ekstra maç başı %15 hasılat
    const totalRevenue = Math.floor(totalMatchIncome * 1.15);

    // Kulübün kasasına ekle
    homeClub.finances.balance += totalRevenue;

    return totalRevenue;
};

// ============================================================================
// 4. KÜRESEL ENFLASYON VE SEZON SONU EKONOMİSİ
// ============================================================================

/**
 * Sezon bittiğinde tüm kulüplerin kasasındaki parayı toplar.
 * Geçen seneye göre artış varsa, enflasyon oranı belirler.
 * Tüm futbolcuların değerini yeniden hesaplar.
 */
export const processSeasonEndEconomy = (GameState) => {
    logEconomy("SEZON SONU KÜRESEL EKONOMİ GÜNCELLEMESİ BAŞLADI...", "warning");

    const allClubs = [...GameState.world.clubs, ...GameState.world.reserveClubs];
    let globalGDP = 0; // Dünya genelindeki toplam nakit
    
    allClubs.forEach(club => {
        globalGDP += club.finances.balance;
    });

    // Varsayılan ilk sezon hedef GDP'si ~5 Milyar Euro olsun
    const baseTargetGDP = 5000000000;
    
    // Enflasyon Hesaplaması (Parasal genişleme)
    let inflationRate = 0;
    if (globalGDP > baseTargetGDP) {
        // Ne kadar fazla para varsa, o kadar enflasyon. (Max %15)
        const excessRatio = (globalGDP - baseTargetGDP) / baseTargetGDP;
        inflationRate = Math.min(15, excessRatio * 10);
    } else {
        // Daralma varsa eksi enflasyon (Deflasyon - Max %-5)
        const deficitRatio = (baseTargetGDP - globalGDP) / baseTargetGDP;
        inflationRate = Math.max(-5, -deficitRatio * 10);
    }

    GameState.economy.globalInflationRate = parseFloat(inflationRate.toFixed(2));
    
    logEconomy(`Küresel Enflasyon Oranı Belirlendi: %${GameState.economy.globalInflationRate}`, "info");

    // 2. Tüm Oyuncuların Market Değerlerini Yeniden Hesapla (Massive Recalculation)
    GameState.world.players.forEach(player => {
        updatePlayerValue(player, GameState.economy.globalInflationRate);
        
        // Sezon sonu oyuncu yaşını da 1 artırıyoruz (Oyun takvim motoru da yapabilir ama burada garantiye alalım)
        // NOT: İdeal olan bunu takvim motorunun yapmasıdır, şimdilik değere etki etmesi için pasif tutuyoruz.
    });

    logEconomy("Tüm oyuncuların piyasa değerleri enflasyona, yaşa ve forma göre güncellendi.", "success");
};

/**
 * Bireysel bir oyuncunun piyasa değerini dinamik algoritma ile belirler.
 * Yaş, CA (Yetenek), İtibar, Form Durumu ve Enflasyon etkili olur.
 */
export const updatePlayerValue = (player, inflationRate = 0) => {
    // A. Baz Değerin Bulunması (database.js'teki tablo)
    let baseVal = 50000;
    for (let tier of FINANCIAL_BASE_TABLE.caValues) {
        if (player.CA >= tier.min && player.CA <= tier.max) {
            baseVal = tier.baseVal;
            break;
        }
    }

    // B. İtibar (Reputation) Çarpanı
    const repMult = FINANCIAL_BASE_TABLE.reputationMultiplier[player.reputation] || 1;
    let newValue = baseVal * repMult;

    // C. Yaş Çarpanı (Wonderkid vs Veteran)
    let ageMult = 1.0;
    if (player.age <= 18) ageMult = 2.0;       // Altın Çocuk
    else if (player.age <= 22) ageMult = 1.5;  // Genç Yetenek
    else if (player.age <= 28) ageMult = 1.0;  // Zirve Dönemi
    else if (player.age <= 31) ageMult = 0.7;  // Düşüş Başlangıcı
    else if (player.age <= 34) ageMult = 0.4;  // Veteran
    else ageMult = 0.15;                       // Emekliliğe Yakın

    newValue = newValue * ageMult;

    // D. Form (Ortalama Puan) Çarpanı
    let formMult = 1.0;
    const avgRating = player.stats.avgRating || 6.5; // Varsayılan 6.5
    if (avgRating >= 8.5) formMult = 1.4;
    else if (avgRating >= 7.5) formMult = 1.2;
    else if (avgRating < 6.0) formMult = 0.8;
    else if (avgRating < 5.0) formMult = 0.6;

    newValue = newValue * formMult;

    // E. Enflasyon Etkisi
    const inflationMultiplier = 1 + (inflationRate / 100);
    newValue = newValue * inflationMultiplier;

    // F. Sözleşme Süresi Etkisi
    // Cyberfoot tarzı oyunlarda sözleşmesi biten ucuzlar
    const currentYear = 2026; // GameState üzerinden alınabilir ama şimdilik sabit
    const yearsLeft = Math.max(0, player.contract.endYear - currentYear);
    if (yearsLeft === 0) newValue = newValue * 0.5; // Sözleşme bitiyorsa değer %50 düşer
    else if (yearsLeft === 1) newValue = newValue * 0.8;

    // Güncelle
    player.finances.marketValue = Math.floor(newValue);
};

// ============================================================================
// 5. İŞ GÜVENLİĞİ (KOVULMA) VE KULÜP KAYYUM MEKANİZMASI
// ============================================================================

/**
 * Kulüp ciddi borçtaysa Yönetim Kurulu toplanır ve menajeri kovar.
 * NPC menajerler de kovulur ve yerine boştaki biri atanır.
 */
const checkJobSecurity = (GameState, club) => {
    // İflas Sınırı (Kulübün CA'sına göre tahammül sınırı değişir)
    // Küçük takımlar 5M'de batarken, Real Madrid 100M borca dayanabilir.
    const toleranceLimit = -(club.avgCA * 200000); 

    if (club.finances.balance < toleranceLimit) {
        const manager = getManagerById(GameState, club.managerId);
        
        if (!manager) return; // Menajer yoksa (zaten kovulmuşsa) işlem yapma

        // Eğer menajer Ekonomist kişiliğe sahipse yönetim %30 daha fazla tolerans gösterir
        const finalTolerance = manager.personality === 'economist' ? toleranceLimit * 1.3 : toleranceLimit;

        if (club.finances.balance < finalTolerance) {
            
            // Eğer İnsan Oyuncu İse (Oyun Bitti veya Başka Kulübe Geçme)
            if (manager.isHuman) {
                logEconomy(`YÖNETİM KURULU KARARI: KULÜBÜ İFLASA SÜRÜKLEDİNİZ! KOVULDUNUZ!`, "danger");
                // TODO: UI tarafında "Kovuldunuz" ekranı tetiklenmeli
                manager.clubId = null;
                club.managerId = null;
                
                // Oyuncu "Boşta" statüsüne geçer
                GameState.player.clubId = null; 

            } else {
                // NPC Menajer Kovuldu
                logEconomy(`[HABER] ${club.name} kulübü finansal kriz nedeniyle menajer ${manager.fullName} ile yollarını ayırdı.`, "warning");
                manager.clubId = null;
                club.managerId = null;

                // Kulüp hemen yeni bir NPC menajerle anlaşır (Oyun dünyasının devamlılığı için)
                hireNewNPCManager(GameState, club);
                
                // Kulübe dışarıdan kayyum/sponsor nakit enjeksiyonu yapılır (Sistemin kilitlenmemesi için)
                club.finances.balance = 1000000; // 1 Milyon Euro ile kulüp kurtarılır
                club.finances.debt = 0;
            }
        }
    }
};

/**
 * Kovulan bir menajerin yerine kulübe rastgele ve boşta olan bir NPC menajer atar.
 */
const hireNewNPCManager = (GameState, club) => {
    // Kulübü olmayan tüm NPC menajerleri bul
    const unemployedManagers = GameState.world.managers.filter(m => m.clubId === null && !m.isHuman);
    
    if (unemployedManagers.length > 0) {
        // En yüksek 'Transfer' yeteneğine sahip olanı bul (Ekonomiyi toparlasın diye)
        unemployedManagers.sort((a, b) => b.attributes.transfer - a.attributes.transfer);
        const selectedManager = unemployedManagers[0];
        
        selectedManager.clubId = club.id;
        club.managerId = selectedManager.id;
        logEconomy(`[HABER] ${club.name} yeni menajeri ${selectedManager.fullName} ile sözleşme imzaladı.`, "success");
    } else {
        logEconomy(`[SİSTEM] ${club.name} için boştaki menajer bulunamadı. Asistan menajerle devam edilecek.`, "warning");
    }
};

export default {
    processWeeklyFinances,
    processMonthlyFinances,
    calculateMatchdayIncome,
    processSeasonEndEconomy,
    updatePlayerValue
};
