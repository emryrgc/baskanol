# BAŞKAN OL — Oyun Tasarım Dokümanı

> Bu dosya oyunun "anayasası"dır. Kararlar değiştikçe güncellenir.
> Son güncelleme: v0.10 (net yazılar, otobüs dükkânı, ince çerçeve)

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
| **İtibar (0-100)** | Arttıkça seçmenler **bağış** yapar ve kasa dolar. Skandallar ve yakalanmalar itibarı düşürür. Ayrıca: **her gece** itibara göre oy kazanılır ya da kaybedilir; gündüz seçmenlerin memnun kalma ihtimali itibarla artar; seçimde kararsızlar itibara göre dağılır. Ana sayfada itibar kartına dokununca açıklama çıkar. |
| **Erzak** | Gündüz seçmenlere fırlatılan hediyeler. Kasadan satın alınır. |

Rakip partilerin de kendi oy oranı ve itibarı vardır.

**Para bulma** (ana sayfada KASA kartına dokun; kasa 2.000 TL'nin altına düşünce kart kırmızı yanıp söner):
- **Dış güçlerden fon:** +6.000 TL, itibar -8. Günde bir kez alınabilir. Ertesi sabah %35 ihtimalle ortaya çıkar (itibar -6, manşet olur).
- **Bağış yemeği:** İtibar x 80 TL kazandırır, ama o gündüzü ya da geceyi harcar.

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
- Gece başında kamera gazete binasını, rakibi ve oyuncuyu sırayla gösterir. Ekrana dokununca bu tanıtım geçilir.
- Üstte görev listesi var: GAZETE[ ] RAKİP[ ]. Hedef ekran dışındaysa kenarda yanıp sönen bir ok çıkar.
- Gazete binasının etrafı yanıp sönen bir çerçeveyle işaretlidir.
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

## 6. 60 günlük takvim *(Prototip 3: yapıldı)*

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

**Prototip 3'teki uygulama:**
- Ana sayfanın üstünde 60 günlük takvim şeridi ve "sıradaki özel gün" yazısı var.
- **Sabah:** Gündüze çık, **geceye geç** (sadece gündüzü atlar, yarım otomatik kazanç sağlar) ya da **haftayı atla** (özel güne gelince durur).
- **Akşam:** Geceye çık ya da geceyi atla.
- Atlanan günlerde ekip kampanyayı idare eder: itibara bağlı küçük oy değişimi ve bağış gelir.
- Her gece yarısı rakipler hamle yapar: kararsızları toplarlar, bazen seni eleştirirler (itibar -2), bazen birbirleriyle kavga ederler.
- **Anket günleri** 10, 20, 40 ve 50. günlerdir. Bir önceki anketle karşılaştırma gösterilir.
- **TV münazarası** 30. gündedir. En güçlü rakiple 4 soru sorulur, her soruya ciddi, popülist ya da saldırgan cevap verilir. Seyircinin sevdiği cevap alkış toplar.
- **Rastgele olaylar:** Sabahları %40 ihtimalle çıkar (8 olay var, örneğin düğün daveti, otobüs arızası, esnaf bağışı). Her birinde iki seçenek vardır.
- **60. gün seçim:** Kararsızlar itibara göre dağılır, oylar sayılır, kazanan ilan edilir.
- Oyun her ekranda otomatik kaydedilir. Başlık ekranında "Devam et" çıkar.

## 7. Geliştirme planı

| Aşama | İçerik | Durum |
|---|---|---|
| Prototip 1 | Gündüz otobüs dağıtımı ve KAÇ! kovalama | ✅ |
| Prototip 2 | Gece gizlilik, gazete, rakibi kışkırtma ve ana sayfa | ✅ İlk sürüm |
| Prototip 3 | Takvim, atlama, anket, münazara, olaylar, seçim, kayıt | ✅ İlk sürüm |
| Sonra | Karakter tasarımları, müzik, rakip partiler, mağaza hazırlığı | ⏳ |

## 8. Teknik notlar

- **Motor:** Phaser 3 (`lib/phaser.min.js`). Kütüphane depoda tutulur, internet gerekmez.
- **Çözünürlük:** 180 piksel genişlik. Yükseklik telefona göre 300-400 piksel arasında ayarlanır ve görüntü büyütülerek gösterilir.
- **Grafikler:** Şimdilik kodla çizilen pixel art (`src/sprites.js`). İleride gerçek çizimlerle değiştirilebilir.
- **Font:** Rubik (OFL lisanslı). Oyunun tek yazı tipidir (v0.9'da piksel font seçeneği kaldırıldı).
- **Ses:** Kodla üretilen retro efektler (`src/sfx.js`).

## 10. v0.4 eklemeleri

### Açılış menüsü
- **Yeni oyun:** Eski kayıt varsa onay sorulur. Ardından aday adı ekranı açılır: Türkçe pixel klavye (bilgisayar klavyesi de çalışır), en fazla 12 harf, "Rastgele ad" butonu var. Ad ana sayfadaki pankartta, ankette, mitingde ve münazarada kullanılır.
- **Oyun yükle:** Kayıt kartı gösterilir (ad, gün, oy, kasa, itibar). Buradan yüklenir ya da silinir.
- **Ayarlar:** Ses, titreşim, zorluk (Kolay / Normal / Zor) ve kayıtları silme.
  - Zorluk etkileri: polisin fark etme hızı, rakiplerin büyüme ve saldırı hızı, kaza cezası ve başlangıç parası (15.000 / 10.000 / 7.000 TL).
- **Credits:** Kayan yazı.
- **Çıkış:** Mağaza uygulamasında uygulamayı kapatır. Tarayıcıda oyunu kaydedip veda ekranı gösterir.

### Günün görevi (v0.5: görevi oyun seçer)
Oyuncu görev seçmez. Her gün için gündüz ve gece görevini oyun belirler: o gün yeni açılan görev varsa o gelir, yoksa açık görevlerden rastgele biri seçilir (mümkünse bir önceki görevle aynı olmaz). Ana sayfadaki buton görevin adını gösterir (örneğin "GÜNDÜZ: MİTİNG"). Yeni bir görev açıldığı gün sabah duyuru çıkar.

| Görev | Zaman | Açılır | Nasıl oynanır |
|---|---|---|---|
| Seçim otobüsü | Gündüz | 1. gün | 40 saniye sürer (kovalama dahil). Erzak dağıt, KAÇ! |
| **Miting** | Gündüz | 3. gün | 35 saniye sürer. Ok yeşil bölgedeyken "SLOGAN AT" butonuna bas, kombolar yap. Kalabalıkta "YUH!" diyenlere dokunup sustur, yoksa domates gelir. Sonunda ortalama coşkuya göre oy, itibar ve bağış kazanılır. |
| Gizli operasyon | Gece | 1. gün | Gazete ve rakip |
| **Afiş baskını** | Gece | 4. gün | 45 saniye sürer. 3 afiş vardır, her biri farklı rakibe aittir. Afişe basılı tut, 0,9 saniyede bıyık çizilir (her afiş rakip itibarı -2). "AYAK SESİ!" uyarısından sonra polis geçer: fenerin altında çizersen yakalanırsın. |

### Dükkân (ana sayfada DÜKKAN butonu)
Her ekipmanın 3 seviyesi var:

| Ekipman | Etkisi (seviye başına) |
|---|---|
| Turbo motor | Kaçışta kovalayandan daha hızlı uzaklaşırsın, kazada daha az yaklaşır |
| Dev hoparlör | Seçmen daha sık gelir, mitingde coşku daha yavaş düşer |
| Baklava erzak | Seçmen +%5 daha fazla memnun kalır |
| Pro takma bıyık | Polis %20 daha geç fark eder, afişte tolerans artar |
| Spor ayakkabı | Gece %15 daha hızlı yürürsün |

### Zorluk artışı
- 20. günden sonra gece haritasında 4. polis, 40. günden sonra 5. polis çıkar.
- Rakiplerin seni eleştirme ihtimali seçime yaklaştıkça artar.

## 9. Fikir havuzu (sıradaki işler)

**Görev çeşitliliği** (oyun sahibinin isteği: tekrar eden görevler sıkıcı olmasın):
- Gündüz: ~~miting kürsüsü~~ (yapıldı), kapı kapı gezme, pazar yerinde tezgâh, bebek öpme ve esnaf ziyareti mini oyunları.
- Gece: ~~rakibin afişlerini değiştirme~~ (yapıldı), rakip kampanya ofisine gizlice girip belge fotoğraflama, rakip otobüsünün lastiğini indirme, sahte anket şirketi.
- Her gün farklı bir mahalle ve seçmen profili.
- Görevlerin günlere göre açılması: ilk günlerde basit, ilerledikçe yenileri.

**Diğer:**
- Karakter ve seçmen tasarımları (oyun sahibi çizecek)
- 4. rakip parti
- Müzik
- Mağaza hazırlığı (Capacitor)

## 11. v0.5 görsel düzeltmeler
- **Font:** Tiny5'e geçildi. Türkçe büyük İ doğru görünüyor.
- **Tam sayı büyütme:** Oyun ekrana tam sayı katıyla (2x, 3x) büyütülür. Böylece bütün pikseller eşit boyda olur. Ekran oranı tutmazsa kenarlarda ince koyu boşluk kalabilir.
- **Keskin yazı:** BO.PixelText, yazıların bulanık kenarlarını temizler.
- **Hareketli butonlar:** Butonlar artık büyüyüp küçülmüyor ya da sallanmıyor. Yazı sabit kalıyor, sadece çevresindeki çerçeve parlıyor (BO.pulse).
- **Ana sayfa:** Durum kutuları küçültüldü (46x20).
- **Kaçış yön tuşları:** Kutu kaldırıldı, gölgeli büyük ok tuşları kullanılıyor.
- **Klavye ve ana menü:** Harfler 2 kat büyük (16 piksel).

## 12. v0.6
- **Yüksek çözünürlüklü çizim:** Oyun dünyası hâlâ 180 piksel genişliğinde, ama ekran K kat çözünürlükte (telefonda genellikle 2) çizilir ve kamera K kat yakınlaştırılır (main.js). Sprite pikselleri eşit kalır, yazılar K kat detayla çizilir.
- **Yazı boyutu:** Varsayılan yazı boyutu 12 (Tiny5'in 1,5 katı). K=2'de ekranda 3 kat net görünür. Ana menü ve klavye harfleri 16.
- **Kamera:** Gece haritasında kamera elle takip eder (updateCam).
- **Alt butonlar yukarı alındı:** Erzak butonu, kaçış okları, EVE DÖN ve ana sayfa butonları ekranın altından uzaklaştırıldı.
- **Afiş baskını:** Afişler küçüldü (40x50), kılıklı aday ve polis 2 kat büyüdü.
- **Ana sayfa:** Durum kutuları 54x26.

## 13. v0.7
- **Açılış hikayesi (IntroScene):** "Yeni oyun"dan sonra 8 sahnelik kısa bir sinematik oynar. Sırasıyla şehir, üç aday, Vedat, Selin, Ulvi, "ve sen", gündüz/gece ve sandık gösterilir. Yazılar daktilo efektiyle çıkar. Dokununca sonraki sahneye geçilir, GEÇ ile hikaye atlanır. Hikaye bitince aday adı ekranı açılır.
- **Renk teması (BO.TEMA):** Butonlar 5 türdedir: ana (sarı), ikinci (lacivert), tehlike (kırmızı), pasif (soluk) ve kağıt (beyaz seçenekler ve klavye). Pencere başlık bantları lacivert, başlıklar sarıdır.
- **Ekran ölçekleme:** Uygulama içindeki küçük pencerelerde oyun artık 1 kata düşmüyor. 2x çizilip pencereye sığacak kadar küçültülüyor. Büyük ekranlarda tam sayı katı korunuyor (Phaser FIT + max).
- **Alt boşluk (BO.ALT):** Alttaki butonlar ekranın dibinden 6-20 piksel ek boşlukla yukarıda duruyor. Kısa ekranlarda boşluk küçülüyor.
- **Yazı boyutu:** 11.

## 14. v0.8
- **Yazı tipi seçeneği:** Ayarlar ekranında YAZI TİPİ ile **Normal** (Rubik, OFL) ve **Piksel** (Tiny5) arasında geçilir. Varsayılan Normal'dir. Piksel modunda yazılar keskinleştirilir, Normal modunda yumuşak kenarlı kalır.
- **İsim konumu:** Aday adı, ad yazma kutusunda ve ana sayfa pankartında dikeyde ortalandı. Pankart pencerenin üstüne taşındı, böylece adayın başı ismi kapatmıyor.
- **Açılış hikayesi:** Kalan sahneleri gösteren noktalar kaldırıldı.

## 15. v0.9
- **Tek yazı tipi:** Piksel yazı seçeneği kaldırıldı. Bütün yazılarda Rubik kullanılıyor.
- **Çerçeveli seçmenler:** Otobüs görevinde henüz erzak almamış seçmenlerin etrafında 1 piksellik beyaz çerçeve var, böylece kaldırımla karışmıyorlar. Erzak ulaşıp tepki verdikleri anda çerçeve kalkar.
- Seçmenler %5 daha büyük çizilir.

## 16. v0.10
- **Net yazılar:** Oyun telefonun gerçek piksel yoğunluğunda çizilir (en fazla 4 kat: dünya pikseli × ekran yoğunluğu). Yazılar artık telefonun büyütmesiyle bulanıklaşmıyor.
- **İnce çerçeve:** Seçmen çerçeveleri yarım piksel kalınlığında (çerçeveli kopya 2 kat detaylı üretilip 0,5 ölçekle gösterilir).
- **Otobüs dükkânı:** Otobüs görevinde alttaki buton artık DÜKKAN. Açılınca oyun durur ve erzak paketleri satın alınır: +10 / 500 TL, +25 / 1.100 TL, +50 / 2.000 TL. Erzak bitince "DÜKKANDAN ERZAK SATIN AL!" yazısı çıkar ve buton kırmızı çerçeveyle yanıp söner.
- Ana sayfadaki dükkâna da "Erzak paketi" satırı eklendi (+10 / 500 TL).
