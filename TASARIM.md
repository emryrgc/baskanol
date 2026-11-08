# BAŞKAN OL — Oyun Tasarım Dokümanı

> Bu dosya oyunun "anayasası"dır. Kararlar değiştikçe güncellenir.
> Son güncelleme: Prototip 2 (gece ve ana sayfa)

## 1. Özet

| | |
|---|---|
| **Tür** | Komik / parodi seçim kampanyası oyunu |
| **Görünüm** | Pixel art, dikey (portre) mobil ekran |
| **Platform** | HTML5 (Phaser 3). İleride Capacitor ile Google Play / App Store |
| **Amaç** | Seçime 60 gün kala kampanyayı yönetip seçimi kazanmak |
| **Ton** | Komik, abartılı, parodi. Gerçek siyasetçi ve parti yok, hepsi hayali |

## 2. Temel kaynaklar

| Kaynak | Açıklama |
|---|---|
| **Oy oranı (%)** | Ana skor. Seçim günü en yüksek oy oranına sahip olan kazanır. |
| **Kasa (TL)** | Belli bir miktar parayla başlanır. Erzak almak ve gazetelere para vermek için harcanır. |
| **İtibar (0-100)** | Arttıkça seçmenler **bağış** yapar ve kasa dolar. Skandallar ve yakalanmalar itibarı düşürür. |
| **Erzak** | Gündüz seçmenlere fırlatılan hediyeler. Kasadan satın alınır. |

Rakip partilerin de kendi oy oranı ve itibarı vardır.

## 3. Rakipler

- **3-4 rakip parti** olacak. Şu an 3 tane var (geçici isimler, `src/data.js` içinde):

| Lider | Parti | Renk | Zaafı (en çok neye kızar) |
|---|---|---|---|
| Vaatçi Vedat | Bol Vaat Partisi | Mavi | Tutulmayan vaatler |
| Selfi Selin | Işıltı Partisi | Kırmızı | Görüntüsü |
| Uykucu Ulvi | Yarın Partisi | Yeşil | Tembelliği |

- Başlangıç anketi: Biz %12, Vedat %30, Selin %22, Ulvi %18, kararsız %18.
- Rakibin itibarı düşünce oy kaybeder. Bu oyun %40'ı bize, %60'ı kararsızlara geçer.
- Bizim siyasetçimizin adı ve görünüşü de şimdilik geçici. Kararı oyun sahibi verecek.

## 4. Gündüz: Seçim otobüsü

### 4.1 Dağıtım modu
- Üstü açık seçim otobüsü yolda ilerler, yol ekranda aşağı doğru akar.
- Kaldırımlarda seçmenler yürür. **Tüm seçmenler aynı görünür** (tasarımları daha sonra eklenecek).
- Bir gün en fazla ~1-1,5 dakika sürer (kovalamalar dahil 70 sn).
- Seçmenler birbirinin içine girmez.
- Oyuncu bir seçmene **dokununca** otobüsten ona erzak/hediye fırlatılır (simit, çay, makarna...).
- Her hediye 1 erzak harcar.
- **Seçmenin tepkisi rastgeledir**, kim olduğu önceden bilinmez:
  - 😀 **Memnun:** Oy ve itibar kazanılır.
  - 🍅 **Domates fırlatır:** İtibar biraz düşer.
  - 😡 **Kızar ve kovalamayı başlatır.**
- Kovalama ayrıca gün içinde **rastgele bir anda** kendiliğinden de başlayabilir.

### 4.2 Kovalama modu ("KAÇ!")
- Ekran kırmızı yanıp söner ve büyük harflerle **"KAÇ!"** yazar.
- Sahne **3 şeritli yola** döner. Otobüs hızlanır, düşman seçmenler (kamyonetle) arkadan kovalar.
- Oyuncu **ekrandaki ← → butonlarıyla** şerit değiştirip trafikteki arabalara makas atar.
- Arabaya çarpmak otobüsü yavaşlatır ve kovalayanlar yaklaşır.
- **Kurtulursan** dağıtıma geri dönersin.
- **Yakalanırsan** oy, erzak ve itibar kaybedersin.

## 5. Gece: Gizli operasyon *(Prototip 2: yapıldı)*

- Siyasetçi **kılık değiştirmiş** hâlde karanlık mahallede gezer.
- Kontrol: **Dokunulan yere yürür.**
- **Gizlilik:** Polis, gazeteci ve rakip korumalarının görüş alanına girmemek gerekir. Gölgelere saklanılabilir.
- **Görev 1: Gazete binası.** Para verilir, ertesi sabah rakip hakkında komik ve uydurma bir manşet çıkar. Rakibin itibarı düşer.
- **Görev 2: Rakibi kışkırtmak.**
  1. Sokakta rakip siyasetçi bulunur.
  2. Laf sokma cümlelerinden biri seçilir ve rakibin **sinir barı** dolar.
  3. Rakip patlayınca **telefon çıkarılır**. Doğru anda çekim yapılan bir mini oyun oynanır.
  4. Video viral olur ve rakibin itibarı düşer.
- **Risk:** Yakalanırsan kılığın düşer, skandal patlar ve itibarın düşer.

**Prototip 2'deki uygulama:**
- Gece 90 saniye sürer. İstenirse "EVE DÖN" ile erken bitirilebilir.
- 3 polis devriye gezer ve fenerinin konisine giren oyuncuyu görür. Lamba ışığındaysan seni daha uzaktan görür.
- Çalı ve çöp konteynerlerinde saklanılabilir. Görülünce yakalanma göstergesi dolar, dolarsa yakalanırsın.
- Gazete: 2.000 TL karşılığında seçilen rakibin itibarı ertesi sabah 8 düşer. Gecede bir kez kullanılabilir.
- Her gece rastgele bir rakip lider sokakta dolaşır. Ona dokununca yanına gidilir.
- Laf sokma 3 turdan oluşur, her turda 3 seçenek vardır: rakibin zaafı +45, genel laf +25, başka rakibin zaafı +10.
- Sinir 100'ü geçerse rakip patlar ve telefon mini oyunu başlar: 3 çekim yapılır, rakip vizörün ortasına ne kadar yakınsa o kadar iyi.
- Video, rakibin itibarını 5 ile 23 arasında düşürür.
- Sabah Gazetesi gecenin sonuçlarını manşet olarak gösterir.

## 5.5 Ana sayfa (Kampanya Merkezi)
- Ortada aday kürsüde durur. Etrafında oy, itibar, kasa ve erzak göstergeleri, altında anket vardır.
- **Sabah:** "Gündüz: Sahaya in" ya da "Gündüzü atla".
- **Akşam:** "Gece: Operasyon" ya da "Geceyi atla".
- Akış: Ana sayfa (sabah) → Gündüz → Akşam Postası → Ana sayfa (akşam) → Gece → Sabah Gazetesi → yeni gün.
- İleride bu ekrana takvim, olaylar ve hafta atlama eklenecek.

## 6. 60 günlük takvim *(Prototip 3)*

Her sabah bir seçim yapılır:

| Seçenek | Sonuç |
|---|---|
| 🚌 Sahaya in | Gündüz bölümü oynanır |
| 🌙 Gece operasyonu | Gece bölümü oynanır |
| ⏩ Günü atla | Otomatik geçer, itibara göre küçük kazanç sağlar. Rakipler de hamle yapar. |
| ⏩⏩ Hafta atla | 7 gün birden geçer, kazancı azdır |

**Atlanamayan özel günler:**
- 📊 Her 10 günde bir anket
- 📺 TV münazarası (diyalog mini oyunu)
- 📰 Rastgele olaylar
- 🗳️ 60. gün: Seçim ve sandık sonucu

Her sabah dünün olaylarını komik manşetlerle özetleyen bir **gazete ekranı** çıkar.

Hedef oyun süresi: 30-45 dakika.

## 7. Geliştirme planı

| Aşama | İçerik | Durum |
|---|---|---|
| Prototip 1 | Gündüz otobüs dağıtımı ve KAÇ! kovalama | ✅ |
| Prototip 2 | Gece gizlilik, gazete, rakibi kışkırtma ve ana sayfa | ✅ İlk sürüm |
| Prototip 3 | Takvim, kasa, itibar, bağış, anket ve seçim sonu | ⏳ |
| Sonra | Karakter tasarımları, müzik, rakip partiler, mağaza hazırlığı | ⏳ |

## 8. Teknik notlar

- **Motor:** Phaser 3 (`lib/phaser.min.js`). Kütüphane depoda tutulur, internet gerekmez.
- **Çözünürlük:** 180 piksel genişlik. Yükseklik telefona göre 300-400 piksel arasında ayarlanır ve görüntü büyütülerek gösterilir.
- **Grafikler:** Şimdilik kodla çizilen pixel art (`src/sprites.js`). İleride gerçek çizimlerle değiştirilebilir.
- **Font:** Press Start 2P (OFL lisanslı, Türkçe karakterleri destekler).
- **Ses:** Kodla üretilen retro efektler (`src/sfx.js`).
