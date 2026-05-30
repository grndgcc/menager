/**
 * ============================================================================
 * CYBERERA FOOTBALL MANAGER 2026 - MAIN ENGINE CORE (main.js)
 * Yazar: AI & Sen
 * Açıklama: Oyunun ana başlatıcısı. Global State (Durum) yönetimi, Save/Load
 * sistemleri, ekran geçişleri (Routing) ve ilk kurulum (Bootstrapping) işlemleri.
 * ============================================================================
 */

// İleride oluşturacağımız modüllerden varsayılan içe aktarımlar (Imports)
// Not: Bu dosyalar henüz yok ama main.js bunlara referans verecek şekilde hazırlandı.
import { generateWorld } from './generator.js';
import { setupCalendar, advanceToNextDay } from './calendar.js';
import { updateUI_TopBar } from './ui_audio.js';

/**
 * Global Oyun Durumu (Game State)
 * Oyunun RAM üzerinde tutulacağı, Save/Load işlemlerinde JSON'a çevrilecek devasa obje.
 */
export const GameState = {
    metadata: {
        version: "1.0.0 Alpha",
        creationDate: null,
        lastSaveDate: null,
        playTimeSeconds: 0
    },
    date: {
        day: 1,
        month: 8, // Ağustos
        year: 2026,
        totalDaysPassed: 0
    },
    player: {
        id: null, // Yaratılan menajerin ID'si
        clubId: null, // Yönetilen kulübün ID'si
        finances: {
            personalWealth: 0,
            monthlyExpense: 0,
            stylePoints: 0 // Reputation / İtibar puanı
        },
        relationships: {
            partnerName: null,
            status: "Bekar",
            health: 50
        },
        assets: [] // Satın alınan lüks evler, arabalar
    },
    world: {
        clubs: [], // Tüm kulüpler
        players: [], // Dünyadaki tüm oyuncular
        managers: [], // Oyuncu dahil tüm menajerler
        leagues: [], // 1., 2., 3., 4. lig puan durumları
        cups: [], // Kupa ağacı ve eşleşmeler
        matches: [] // Oynanmış ve oynanacak tüm fikstür
    },
    history: {
        records: {},
        pastChampions: [],
        awardWinners: []
    },
    economy: {
        globalInflationRate: 2.4, // Her sezon başı güncellenir
        baseTransferMultiplier: 1.0
    }
};

/**
 * Ana Oyun Motoru Sınıfı
 */
class GameEngine {
    constructor() {
        this.currentScreen = 'screen-main-menu';
        this.isGameRunning = false;
        
        // Menajer yaratma ekranındaki puan dağılımı için değişkenler
        this.creationData = {
            maxPoints: 52,
            spentPoints: 4, // Başlangıçta hepsi 1 olduğu için 4 puan harcanmış sayılır
            attributes: {
                training: 1,
                tactics: 1,
                transfer: 1,
                morale: 1
            }
        };

        // DOM yüklendiğinde motoru başlat
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    /**
     * Motoru Başlat (Boot Sequence)
     */
    init() {
        this.logSystem("Oyun Motoru Başlatılıyor...", "info");
        
        // Global Yükleyiciyi Gizle (HTML'de loading class'ı varsa kaldır)
        document.body.classList.remove('loading');

        this.bindMenuEvents();
        this.bindManagerCreationEvents();
        this.bindNavigationEvents();
        this.bindTimeEngineEvents();
        
        this.logSystem("Sistem Hazır. Ana Menü Bekleniyor.", "success");
    }

    /**
     * Gelişmiş Konsol Loglayıcı
     * @param {string} message - Gösterilecek mesaj
     * @param {string} type - info, success, warning, error
     */
    logSystem(message, type = "info") {
        const colors = {
            info: "#00a2ff",
            success: "#00ff66",
            warning: "#ffb800",
            error: "#ff003c"
        };
        const color = colors[type] || colors.info;
        console.log(`%c[CYBERERA ENGINE]%c ${message}`, `color: ${color}; font-weight: bold;`, `color: #e2e8f0;`);
    }

    /**
     * Ekranlar Arası Geçiş (Routing / Navigation)
     * CSS'teki active ve hidden class'larını yöneterek pürüzsüz geçiş sağlar.
     * @param {string} targetScreenId - Gidilecek ekranın HTML ID'si
     */
    switchScreen(targetScreenId) {
        if (this.currentScreen === targetScreenId) return;

        const currentEl = document.getElementById(this.currentScreen);
        const targetEl = document.getElementById(targetScreenId);

        if (!targetEl) {
            this.logSystem(`HATA: ${targetScreenId} adında bir ekran bulunamadı!`, "error");
            return;
        }

        // Mevcut ekranı gizle
        if (currentEl) {
            currentEl.classList.remove('active');
            setTimeout(() => {
                currentEl.classList.add('hidden');
            }, 300); // CSS transition süresi kadar bekle
        }

        // Yeni ekranı göster
        setTimeout(() => {
            targetEl.classList.remove('hidden');
            // Bir frame bekle ki display:block işlendikten sonra opacity transition devreye girsin
            requestAnimationFrame(() => {
                targetEl.classList.add('active');
            });
        }, 310);

        this.currentScreen = targetScreenId;
        this.logSystem(`Ekran Değiştirildi: ${targetScreenId}`, "info");

        // Eğer oyun içi menüler arası geçiş yapılıyorsa sidebar'ı da güncelle
        this.updateSidebarUI(targetScreenId);
    }

    /**
     * Sidebar (Sol Menü) butonlarının aktiflik durumunu günceller
     */
    updateSidebarUI(targetScreenId) {
        const buttons = document.querySelectorAll('.sidebar-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-target') === targetScreenId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Yükleme Ekranı Kontrolcüsü
     * @param {boolean} state - true (göster), false (gizle)
     * @param {string} text - Ekranda yazacak metin
     */
    toggleLoader(state, text = "SİSTEMLER GÜNCELLENİYOR...") {
        const loader = document.getElementById('global-loader');
        const loaderText = document.getElementById('loader-text');
        
        if (state) {
            loaderText.innerText = text;
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }

    /**
     * Ana Menü Butonları (Yeni Oyun, Kayıt Yükle, Ayarlar)
     */
    bindMenuEvents() {
        const btnNewGame = document.getElementById('btn-new-game');
        const btnLoadGame = document.getElementById('btn-load-game');
        const fileInput = document.getElementById('save-file-input');

        if (btnNewGame) {
            btnNewGame.addEventListener('click', () => {
                this.switchScreen('screen-manager-creation');
            });
        }

        // Kayıt Yükleme İşlemi (Görünmez file input'u tetikler)
        if (btnLoadGame && fileInput) {
            btnLoadGame.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadGameData(file);
                }
            });
        }
    }

    /**
     * Menajer Yaratma Ekranı Olayları (Zar Dağıtımı ve Karakter Yaratma)
     */
    bindManagerCreationEvents() {
        const btnBack = document.getElementById('btn-back-to-main');
        const btnFinish = document.getElementById('btn-finish-creation');
        
        // Geri Dön Butonu
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchScreen('screen-main-menu');
            });
        }

        // Puan Artırma/Azaltma Butonları (+ / -)
        const btnIncreases = document.querySelectorAll('.btn-increase');
        const btnDecreases = document.querySelectorAll('.btn-decrease');

        btnIncreases.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAttributeChange(e, 1));
        });

        btnDecreases.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAttributeChange(e, -1));
        });

        // Form validasyonu için input dinleyicileri
        const nameInput = document.getElementById('manager-firstname');
        const lastnameInput = document.getElementById('manager-lastname');
        const portraitInput = document.getElementById('manager-portrait-url');
        const portraitImg = document.getElementById('portrait-preview-img');

        const validateForm = () => {
            if (nameInput.value.trim() !== "" && lastnameInput.value.trim() !== "") {
                btnFinish.classList.remove('disabled');
                btnFinish.removeAttribute('disabled');
            } else {
                btnFinish.classList.add('disabled');
                btnFinish.setAttribute('disabled', 'true');
            }
        };

        if (nameInput) nameInput.addEventListener('input', validateForm);
        if (lastnameInput) lastnameInput.addEventListener('input', validateForm);

        // Portre URL canlı önizleme
        if (portraitInput && portraitImg) {
            portraitInput.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                // Basit url kontrolü, resim değilse onerror çalışır
                if (url !== "") {
                    portraitImg.src = url;
                } else {
                    portraitImg.src = "assets/default-manager.png";
                }
            });
            // Resim kırıksa varsayılana dön
            portraitImg.onerror = () => {
                portraitImg.src = "assets/default-manager.png";
            };
        }

        // Oyunu Başlat (Kariyeri Yarat)
        if (btnFinish) {
            btnFinish.addEventListener('click', () => this.startNewCareer());
        }
    }

    /**
     * Nitelik (Zar/Stat) Artırma Azaltma Mantığı (Max 52 Toplam Puan)
     */
    handleAttributeChange(event, changeValue) {
        const targetId = event.target.getAttribute('data-target'); // Örn: attr-training
        const inputEl = document.getElementById(targetId);
        
        // Hangi nitelik değiştiriliyor string parçalama (attr-training -> training)
        const attrKey = targetId.split('-')[1]; 
        
        let currentValue = parseInt(inputEl.value);
        let currentPointsSpent = this.creationData.spentPoints;
        let maxPoints = this.creationData.maxPoints;

        if (changeValue > 0) {
            // Artırma isteği
            if (currentValue < 20 && currentPointsSpent < maxPoints) {
                currentValue++;
                this.creationData.spentPoints++;
                this.creationData.attributes[attrKey] = currentValue;
                inputEl.value = currentValue;
            }
        } else {
            // Azaltma isteği
            if (currentValue > 1) {
                currentValue--;
                this.creationData.spentPoints--;
                this.creationData.attributes[attrKey] = currentValue;
                inputEl.value = currentValue;
            }
        }

        // Kalan Puanı UI'da Güncelle
        const pointsLeft = maxPoints - this.creationData.spentPoints;
        document.getElementById('remaining-points').innerText = pointsLeft;
        
        // Puan bittiyse renk uyarısı
        if (pointsLeft === 0) {
            document.getElementById('remaining-points').style.color = 'var(--color-danger)';
        } else {
            document.getElementById('remaining-points').style.color = 'var(--color-primary)';
        }
    }

    /**
     * YENİ KARİYER OLUŞTURMA AKIŞI
     * Bu fonksiyon Generator modülünü tetikler, dünyayı yaratır.
     */
    async startNewCareer() {
        try {
            this.toggleLoader(true, "VERİTABANI OLUŞTURULUYOR... LÜTFEN BEKLEYİN");

            // Form verilerini topla
            const firstName = document.getElementById('manager-firstname').value.trim();
            const lastName = document.getElementById('manager-lastname').value.trim();
            const gender = document.getElementById('manager-gender').value;
            const personality = document.getElementById('manager-personality').value;
            let portraitUrl = document.getElementById('manager-portrait-url').value.trim();
            
            if (!portraitUrl) portraitUrl = "assets/default-manager.png";

            // State objesine oyuncu verilerini yaz
            GameState.metadata.creationDate = new Date().toISOString();
            GameState.player = {
                id: "MGR_PLAYER_01",
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                personality: personality,
                portrait: portraitUrl,
                attributes: this.creationData.attributes,
                finances: {
                    personalWealth: 100000, // Başlangıç parası €100.000
                    monthlyExpense: 2000, // Varsayılan yaşam gideri
                    stylePoints: 10
                },
                relationships: {
                    partnerName: null,
                    status: "Bekar",
                    health: 50
                },
                assets: []
            };

            // DÜNYAYI YARAT (generator.js içindeki asenkron fonksiyonu çağır)
            // Not: generator.js CPU yoğunluklu olacağı için asenkron bekliyoruz
            this.logSystem("Generator.js tetikleniyor...", "warning");
            
            // Eğer generator.js implemente edilmemişse şimdilik simüle ediyoruz:
            if(typeof generateWorld === 'function') {
                 await generateWorld(GameState);
            } else {
                 await new Promise(resolve => setTimeout(resolve, 1500)); // Simüle edilmiş bekleme
                 this.logSystem("Generator Modülü şimdilik simüle edildi.", "warning");
            }

            // Takvimi Başlat
            if(typeof setupCalendar === 'function') {
                setupCalendar(GameState);
            }

            this.isGameRunning = true;
            this.logSystem("Yeni Kariyer Başarıyla Oluşturuldu!", "success");

            // Yükleme ekranını kaldır ve oyun içi ana ekrana (Kadro) geç
            this.toggleLoader(false);
            
            // UI'yi Başlat (Maaşlar, Tarih vs Top-bar'a yazılsın)
            if(typeof updateUI_TopBar === 'function') {
                updateUI_TopBar(GameState);
            }

            // Oyun İçi Arayüzü (Hub) görünür yap
            document.getElementById('screen-main-menu').classList.add('hidden');
            document.getElementById('screen-manager-creation').classList.add('hidden');
            document.getElementById('game-ui-container').classList.remove('hidden');
            
            // İlk sekme olan Kadro sekmesini aç
            this.switchScreen('screen-squad');

        } catch (error) {
            this.logSystem(`Dünya yaratılırken ölümcül hata: ${error.message}`, "error");
            this.toggleLoader(false);
            alert("Kariyer oluşturulurken bir hata meydana geldi. Konsolu kontrol edin.");
        }
    }

    /**
     * Oyun İçi Yan Menü (Sidebar) Navigasyon Olayları
     */
    bindNavigationEvents() {
        const sidebarButtons = document.querySelectorAll('.sidebar-btn');
        sidebarButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Tıklanan butonun içindeki span'a vb tıklanırsa en yakın butonu bul
                const targetBtn = e.target.closest('.sidebar-btn'); 
                if (!targetBtn) return;

                const targetScreen = targetBtn.getAttribute('data-target');
                if (targetScreen) {
                    this.switchScreen(targetScreen);
                }
            });
        });
    }

    /**
     * Zamanı İlerletme Mekanizması (Core Game Loop Trigger)
     */
    bindTimeEngineEvents() {
        const btnContinue = document.getElementById('btn-continue-time');
        
        if (btnContinue) {
            btnContinue.addEventListener('click', async () => {
                if (!this.isGameRunning) return;

                // UI'ı kilitle, yükleme ekranını aç
                btnContinue.classList.add('disabled');
                this.toggleLoader(true, "HAFTALIK SİMÜLASYON HESAPLANIYOR...");

                try {
                    // calendar.js içindeki gün atlatma fonksiyonunu çağır
                    if(typeof advanceToNextDay === 'function') {
                        await advanceToNextDay(GameState);
                    } else {
                        // Geçici Simülasyon
                        await new Promise(resolve => setTimeout(resolve, 800));
                        GameState.date.day++;
                        this.logSystem(`Gün atlandı. Yeni Gün: ${GameState.date.day}`, "info");
                    }

                    // Top Bar UI Güncellemesi
                    if(typeof updateUI_TopBar === 'function') {
                        updateUI_TopBar(GameState);
                    }

                } catch (error) {
                    this.logSystem(`Simülasyon Hatası: ${error.message}`, "error");
                } finally {
                    // Yüklemeyi bitir ve butonu aç
                    this.toggleLoader(false);
                    btnContinue.classList.remove('disabled');
                }
            });
        }
    }

    /**
     * JSON DOSYASINA OYUNU KAYDETME (Serialization)
     */
    saveGame() {
        if (!this.isGameRunning) {
            alert("Sadece oyun içindeyken kayıt alabilirsiniz.");
            return;
        }

        try {
            GameState.metadata.lastSaveDate = new Date().toISOString();
            
            // Obje JSON'a dönüştürülüyor
            const gameStateJSON = JSON.stringify(GameState);
            
            // Blob oluştur ve indirt
            const blob = new Blob([gameStateJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            
            // Dosya adı örneği: CyberEra_Save_Pep_2026.json
            const mgrName = GameState.player.firstName;
            const year = GameState.date.year;
            a.download = `CyberEra_Save_${mgrName}_${year}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.logSystem("Oyun Başarıyla JSON olarak dışa aktarıldı.", "success");
            alert("Kayıt dosyası indirildi!");
            
        } catch (error) {
            this.logSystem(`Kayıt Hatası: ${error.message}`, "error");
            alert("Kayıt alınırken bir hata oluştu.");
        }
    }

    /**
     * JSON DOSYASINDAN OYUN YÜKLEME (Deserialization)
     * @param {File} file - input[type="file"] ile seçilen dosya
     */
    loadGameData(file) {
        this.toggleLoader(true, "KAYIT DOSYASI OKUNUYOR...");
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const parsedData = JSON.parse(e.target.result);
                
                // Basit bir güvenlik/doğrulama kontrolü
                if (!parsedData.metadata || !parsedData.metadata.version) {
                    throw new Error("Geçersiz CyberEra kayıt dosyası.");
                }

                // Global State'i üzerine yaz
                Object.assign(GameState, parsedData);
                
                this.isGameRunning = true;
                this.logSystem("Kayıt Başarıyla Yüklendi!", "success");

                // UI'yi Yeniden Çizdir
                if(typeof updateUI_TopBar === 'function') {
                    updateUI_TopBar(GameState);
                }

                this.toggleLoader(false);
                
                // Oyun ekranlarına geçiş
                document.getElementById('screen-main-menu').classList.add('hidden');
                document.getElementById('game-ui-container').classList.remove('hidden');
                this.switchScreen('screen-squad');

            } catch (error) {
                this.logSystem(`Dosya Okuma Hatası: ${error.message}`, "error");
                this.toggleLoader(false);
                alert(`Kayıt dosyası okunamadı: ${error.message}`);
            }
        };

        reader.onerror = () => {
            this.logSystem("FileReader dosya okurken hata verdi.", "error");
            this.toggleLoader(false);
        };

        reader.readAsText(file);
    }
}

// Global olarak erişilebilmesi için sınıfın bir örneğini oluşturup dışa aktarıyoruz.
// Bu sayede diğer js dosyaları Engine.GameState diyerek tüm verilere ulaşabilecek.
const Engine = new GameEngine();

// UI üzerinden çağırabilmek için Save metodunu global window objesine de bağlıyoruz 
// (Örneğin ayarlar menüsünde bir onclick="window.saveGame()" butonu için)
window.saveGame = () => Engine.saveGame();

export default Engine;
