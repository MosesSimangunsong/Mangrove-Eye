GEE Workflow MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	Google Earth Engine Workflow
Versi	v1.0
Acuan Utama	docs/PRD.md, docs/MVP_SCOPE.md, docs/DATABASE_DESIGN.md
Mesin Analisis	Google Earth Engine
Dataset Utama	Sentinel-2 Level-2A
Indeks Utama	MVI, CMRI
Indeks Pendukung	NDVI, NDWI
Output Utama	Hotspot GeoJSON, layer before-after, static map, metadata analisis
Target Penyimpanan	docs/GEE_WORKFLOW.md
2. Tujuan Dokumen

Dokumen ini menjelaskan alur kerja Google Earth Engine untuk sistem MANGROVE-EYE, mulai dari persiapan AOI, pemanggilan citra Sentinel-2, filter awan, pembuatan komposit, perhitungan indeks spektral, deteksi perubahan before-after, ekstraksi hotspot, hingga export hasil agar dapat digunakan oleh backend Laravel dan database PostgreSQL/PostGIS.

Dokumen ini tidak membahas training U-Net, AI segmentation, Sentinel-1 SAR, atau otomasi penuh scheduler, karena seluruh komponen tersebut berada di luar scope MVP awal.

3. Posisi GEE dalam Arsitektur Sistem

Google Earth Engine berperan sebagai mesin analisis citra satelit.

Laravel tidak digunakan untuk menghitung indeks spektral dari raster mentah. Laravel hanya menerima dan menyimpan hasil yang sudah diproses oleh GEE.

Alur posisi GEE dalam sistem:

AOI GeoJSON
→ Google Earth Engine
→ Sentinel-2 Filtering
→ MVI/CMRI/NDVI/NDWI Calculation
→ Before-After Change Detection
→ Hotspot Extraction
→ Export GeoJSON / Static Image / Tile URL
→ Laravel Import
→ PostgreSQL/PostGIS
→ React Leaflet Dashboard

Pada MVP awal, proses GEE dapat dijalankan secara:

manual / semi-manual

Artinya, admin atau pengembang menjalankan script GEE terlebih dahulu, lalu hasilnya diekspor dan diimpor ke sistem Laravel.

4. Prinsip Utama Workflow GEE
4.1 GEE Bukan Sekadar Visualisasi Peta

GEE digunakan untuk analisis citra satelit, bukan hanya menampilkan peta. Analisis yang dilakukan mencakup:

pemilihan citra Sentinel-2;
filter lokasi;
filter tanggal;
filter awan;
pembuatan komposit;
perhitungan indeks MVI, CMRI, NDVI, dan NDWI;
perbandingan before-after;
deteksi hotspot perubahan.
4.2 MVI dan CMRI sebagai Indeks Utama

MVP MANGROVE-EYE tidak menjadikan NDVI sebagai satu-satunya dasar deteksi. Indeks utama adalah:

Indeks	Fungsi
MVI	Membantu mendeteksi karakteristik vegetasi mangrove
CMRI	Membantu membedakan mangrove dari non-mangrove dan membaca perubahan
NDVI	Indeks pendukung untuk kesehatan vegetasi umum
NDWI	Indeks pendukung untuk elemen air, tambak, pasang surut, dan masking

Keputusan ini sesuai dengan arah teknis riset implementasi, yang menempatkan CMRI dan MVI sebagai pendekatan spektral yang lebih realistis untuk MVP dibandingkan U-Net production-ready.

4.3 Output GEE Bukan Vonis Final

Hasil GEE hanya menghasilkan indikasi awal. Hotspot yang terdeteksi tetap harus divalidasi di lapangan.

Status awal hotspot dari GEE adalah:

detected

Status tersebut dapat berubah setelah validasi lapangan menjadi:

under_review
validated
rejected
needs_recheck
4.4 AOI Harus Sempit dan Fokus

MVP tidak memproses seluruh pesisir Sumatera Utara. AOI dibatasi pada:

kawasan KTH Nipah ±242 ha;
area konflik prioritas ±60–62 ha;
buffer atau area referensi jika diperlukan.

Pendekatan AOI sempit membuat query GEE lebih ringan, hasil lebih fokus, dan proses validasi lebih realistis.

5. Prasyarat Workflow
5.1 Akun dan Akses

Sebelum menjalankan workflow, tim perlu memiliki:

akun Google;
akses Google Earth Engine;
akses Google Earth Engine Code Editor;
file AOI dalam format GeoJSON/KML/Shapefile;
script GEE awal;
akses ke repository sistem MANGROVE-EYE;
akses ke backend Laravel untuk import hasil.
5.2 Data AOI

Data AOI dapat berasal dari:

Sumber AOI	Status
GeoJSON/Shapefile resmi KTH Nipah	Paling ideal
Digitasi manual sementara	Dapat digunakan untuk MVP
KML dari Google Earth Pro	Dapat digunakan sebagai awal
GeoJSON dari QGIS	Direkomendasikan
Data OSM / referensi visual	Opsional

Status saat ini:

Perlu dikonfirmasi:
- AOI resmi KTH Nipah ±242 ha
- area konflik ±60–62 ha

Jika data resmi belum tersedia, gunakan digitasi sementara dan tandai sebagai:

verification_status = draft
5.3 Dataset GEE

Dataset utama:

COPERNICUS/S2_SR_HARMONIZED

Dataset ini digunakan karena:

tersedia di Google Earth Engine;
merupakan Sentinel-2 Surface Reflectance;
cocok untuk analisis vegetasi;
memiliki band RGB, NIR, dan SWIR;
mendukung perhitungan NDVI, NDWI, MVI, dan CMRI;
cukup realistis untuk MVP.

Dataset pendukung opsional:

COPERNICUS/S2_CLOUD_PROBABILITY

Dataset ini dapat digunakan untuk cloud masking yang lebih baik jika workflow awal sudah stabil.

6. Band Sentinel-2 yang Digunakan
Band	Nama Umum	Resolusi	Fungsi
B2	Blue	10 m	Visual RGB
B3	Green	10 m	NDWI, MVI
B4	Red	10 m	NDVI
B8	NIR	10 m	NDVI, NDWI, MVI
B11	SWIR1	20 m	MVI
B12	SWIR2	20 m	Opsional untuk analisis lanjutan

Catatan:

Karena B11 memiliki resolusi 20 m, GEE akan menangani resampling saat operasi antar-band.
Untuk MVP, resolusi output dapat menggunakan scale: 10 atau scale: 20, tetapi perlu konsisten saat export.
Jika fokus pada MVI yang memakai SWIR, scale: 20 bisa lebih aman.
Jika fokus pada peta hotspot praktis, scale: 10 dapat digunakan, tetapi hasil tetap harus ditafsirkan hati-hati.
7. Rumus Indeks
7.1 NDVI
NDVI = (NIR - Red) / (NIR + Red)

Sentinel-2:

NDVI = (B8 - B4) / (B8 + B4)

Fungsi:

membaca vegetasi umum;
melihat penurunan kehijauan;
membantu interpretasi perubahan vegetasi.
7.2 NDWI
NDWI = (Green - NIR) / (Green + NIR)

Sentinel-2:

NDWI = (B3 - B8) / (B3 + B8)

Fungsi:

membaca badan air;
membantu membedakan air, tambak, tanah basah, dan pasang surut;
mengurangi false positive.
7.3 CMRI
CMRI = NDVI - NDWI

Fungsi:

membantu membedakan mangrove dari elemen air;
membaca perubahan vegetasi pesisir;
menjadi indeks utama deteksi perubahan pada MVP.
7.4 MVI
MVI = (NIR - Green) / (SWIR1 - Green)

Sentinel-2:

MVI = (B8 - B3) / (B11 - B3)

Fungsi:

membantu mengenali karakteristik spektral mangrove;
memanfaatkan relasi NIR, Green, dan SWIR;
menjadi indeks utama untuk membaca tutupan mangrove.

Catatan:

Nilai MVI perlu ditafsirkan dengan hati-hati karena kondisi air, pasang surut, awan, bayangan awan, dan tambak dapat memengaruhi hasil.

8. Parameter Awal MVP

Parameter awal berikut dapat digunakan sebagai baseline, tetapi belum final.

Parameter	Nilai Awal	Status
Cloud percentage	< 20%	Bisa disesuaikan
Composite method	median()	Direkomendasikan untuk MVP
Scale export vektor	10 atau 20 meter	Perlu diuji
Minimum hotspot area	0.05 ha atau 0.1 ha	Perlu kalibrasi
Threshold delta MVI	Perlu uji lokal	Perlu dikonfirmasi
Threshold delta CMRI	Perlu uji lokal	Perlu dikonfirmasi
Periode before-after	Manual	Sesuai PRD
AOI	KTH Nipah ±242 ha / konflik ±60–62 ha	Perlu finalisasi GeoJSON

Threshold tidak boleh dikunci secara sembarangan. Nilai threshold harus diuji menggunakan sampel citra dan validasi lapangan.

9. Workflow Utama GEE
9.1 Ringkasan Workflow
1. Load AOI
2. Set periode before dan after
3. Load Sentinel-2 Surface Reflectance
4. Filter AOI
5. Filter tanggal
6. Filter awan
7. Buat composite before
8. Buat composite after
9. Hitung NDVI, NDWI, CMRI, dan MVI
10. Hitung delta indeks before-after
11. Buat mask perubahan
12. Bersihkan noise
13. Vectorize hotspot
14. Hitung luas dan centroid
15. Klasifikasikan prioritas
16. Export GeoJSON
17. Export static map / tile URL jika diperlukan
18. Import hasil ke Laravel
9.2 Tahap 1 — Load AOI

AOI dapat dibuat dengan tiga cara:

Opsi 1 — Gambar Langsung di GEE

Cocok untuk eksplorasi awal.

Kelebihan:

cepat;
cocok untuk pemula;
tidak perlu file eksternal.

Kekurangan:

kurang rapi untuk production;
sulit dilacak versinya;
tidak ideal untuk repository.
Opsi 2 — Upload GeoJSON/KML ke GEE Assets

Cocok untuk MVP.

Kelebihan:

lebih rapi;
bisa dipanggil ulang;
cocok untuk workflow berulang.

Contoh:

var aoi = ee.FeatureCollection('users/username/aoi_kwala_serapuh');
Opsi 3 — Definisikan Polygon Langsung di Script

Cocok untuk testing cepat.

Contoh:

var aoi = ee.Geometry.Polygon([
  [
    [98.455001, 4.011001],
    [98.460002, 4.011001],
    [98.460002, 4.015002],
    [98.455001, 4.015002],
    [98.455001, 4.011001]
  ]
]);

Catatan:

Koordinat di atas hanya contoh struktur. Koordinat final harus diganti dengan hasil digitasi resmi atau hasil validasi AOI.

9.3 Tahap 2 — Set Periode Before dan After

Periode before-after ditentukan oleh admin atau pengembang.

Contoh:

var beforeStart = '2024-01-01';
var beforeEnd   = '2024-03-31';

var afterStart  = '2025-01-01';
var afterEnd    = '2025-03-31';

Prinsip pemilihan periode:

jangan membandingkan satu hari dengan satu hari;
gunakan rentang waktu agar citra bebas awan lebih mudah diperoleh;
gunakan periode yang sebanding secara musim jika memungkinkan;
hindari perbandingan citra pasang tinggi vs surut ekstrem jika data pasang surut belum tersedia.
9.4 Tahap 3 — Load Sentinel-2
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

Catatan:

Filter CLOUDY_PIXEL_PERCENTAGE hanya filter tingkat scene, bukan jaminan bahwa semua piksel dalam AOI bebas awan. Karena itu, masking tambahan tetap disarankan.

9.5 Tahap 4 — Cloud Masking Sederhana

Untuk MVP awal, cloud masking dapat memakai band SCL dari Sentinel-2 SR.

Contoh fungsi:

function maskS2Clouds(image) {
  var scl = image.select('SCL');

  var cloudShadow = scl.eq(3);
  var clouds = scl.eq(8)
    .or(scl.eq(9))
    .or(scl.eq(10));

  var mask = cloudShadow.or(clouds).not();

  return image.updateMask(mask)
    .divide(10000)
    .copyProperties(image, image.propertyNames());
}

Penjelasan:

SCL = 3 biasanya cloud shadow;
SCL = 8, 9, 10 biasanya cloud medium/high/cirrus;
divide(10000) mengubah skala reflectance agar lebih mudah dihitung.

Catatan:

Untuk workflow lanjutan, gunakan s2cloudless agar masking lebih baik.

9.6 Tahap 5 — Buat Composite

Composite digunakan untuk membuat satu citra representatif dari kumpulan citra pada periode tertentu.

function getComposite(startDate, endDate) {
  return s2
    .filterDate(startDate, endDate)
    .map(maskS2Clouds)
    .median()
    .clip(aoi);
}

Contoh:

var beforeComposite = getComposite(beforeStart, beforeEnd);
var afterComposite = getComposite(afterStart, afterEnd);

Mengapa menggunakan median()?

mengurangi efek awan tersisa;
mengurangi noise;
lebih stabil untuk periode beberapa minggu/bulan;
cocok untuk MVP awal.
9.7 Tahap 6 — Hitung Indeks
function addIndices(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  var cmri = ndvi.subtract(ndwi).rename('CMRI');

  var mvi = image.expression(
    '(NIR - GREEN) / (SWIR1 - GREEN)', {
      'NIR': image.select('B8'),
      'GREEN': image.select('B3'),
      'SWIR1': image.select('B11')
    }
  ).rename('MVI');

  return image.addBands([ndvi, ndwi, cmri, mvi]);
}

Contoh:

var before = addIndices(beforeComposite);
var after = addIndices(afterComposite);
9.8 Tahap 7 — Hitung Delta Perubahan

Delta digunakan untuk membaca perubahan antara periode before dan after.

var deltaMVI = after.select('MVI')
  .subtract(before.select('MVI'))
  .rename('delta_MVI');

var deltaCMRI = after.select('CMRI')
  .subtract(before.select('CMRI'))
  .rename('delta_CMRI');

var deltaNDVI = after.select('NDVI')
  .subtract(before.select('NDVI'))
  .rename('delta_NDVI');

var deltaNDWI = after.select('NDWI')
  .subtract(before.select('NDWI'))
  .rename('delta_NDWI');

Interpretasi umum:

Kondisi	Makna Awal
Delta MVI turun	Potensi perubahan vegetasi mangrove
Delta CMRI turun	Potensi kehilangan tutupan mangrove
Delta NDVI turun	Vegetasi umum menurun
Delta NDWI naik/tidak stabil	Kemungkinan pengaruh air, tambak, atau pasang surut
9.9 Tahap 8 — Buat Mask Perubahan

Contoh awal:

var changeMask = deltaMVI.lt(-1.0)
  .and(deltaCMRI.lt(-0.2))
  .and(deltaNDVI.lt(-0.1));

Catatan penting:

Nilai di atas hanya contoh awal. Threshold final harus dikalibrasi.

Versi lebih hati-hati:

var waterMask = after.select('NDWI').lt(0.3);

var changeMask = deltaMVI.lt(-1.0)
  .and(deltaCMRI.lt(-0.2))
  .and(deltaNDVI.lt(-0.1))
  .and(waterMask);

Tujuan waterMask:

mengurangi salah deteksi pada air terbuka;
mengurangi false positive pada tambak atau pasang surut;
membantu fokus pada perubahan vegetasi.
9.10 Tahap 9 — Bersihkan Noise

Mask perubahan perlu dibersihkan agar hotspot kecil yang tidak relevan tidak langsung dianggap ancaman.

Contoh:

var cleanedMask = changeMask
  .selfMask()
  .connectedPixelCount(8, true)
  .gte(5)
  .selfMask();

Penjelasan:

connectedPixelCount() membantu memilih piksel yang saling terhubung;
gte(5) berarti minimal 5 piksel berdekatan;
angka ini perlu diuji sesuai skala resolusi.
9.11 Tahap 10 — Vectorize Hotspot

Konversi raster perubahan menjadi polygon hotspot.

var hotspotVectors = cleanedMask.reduceToVectors({
  geometry: aoi,
  scale: 10,
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'change',
  maxPixels: 1e13
});

Catatan:

scale dapat memakai 10 atau 20 meter;
jika hasil terlalu berisik, gunakan 20 meter atau naikkan minimum connected pixels;
jika AOI kecil, proses ini masih realistis untuk MVP.
9.12 Tahap 11 — Hitung Luas dan Centroid
var hotspotsWithAttributes = hotspotVectors.map(function(feature) {
  var geom = feature.geometry();
  var areaHa = geom.area().divide(10000);
  var centroid = geom.centroid();

  return feature.set({
    'area_ha': areaHa,
    'centroid_lon': centroid.coordinates().get(0),
    'centroid_lat': centroid.coordinates().get(1),
    'validation_status': 'detected'
  });
});

Catatan:

area_ha digunakan untuk estimasi luas terdampak;
centroid digunakan untuk marker peta dan navigasi lapangan;
status awal adalah detected.
9.13 Tahap 12 — Tambahkan Statistik Indeks per Hotspot

Agar setiap hotspot memiliki nilai indeks before-after, gunakan reduceRegions.

Contoh ringkas:

var indexStack = before.select(['MVI', 'CMRI', 'NDVI', 'NDWI'])
  .rename(['mvi_before', 'cmri_before', 'ndvi_before', 'ndwi_before'])
  .addBands(
    after.select(['MVI', 'CMRI', 'NDVI', 'NDWI'])
      .rename(['mvi_after', 'cmri_after', 'ndvi_after', 'ndwi_after'])
  )
  .addBands([
    deltaMVI.rename('mvi_delta'),
    deltaCMRI.rename('cmri_delta'),
    deltaNDVI.rename('ndvi_delta'),
    deltaNDWI.rename('ndwi_delta')
  ]);

var hotspotStats = indexStack.reduceRegions({
  collection: hotspotsWithAttributes,
  reducer: ee.Reducer.mean(),
  scale: 10
});

Output ini menghasilkan setiap polygon hotspot dengan atribut nilai rata-rata indeks.

9.14 Tahap 13 — Klasifikasi Prioritas

Contoh aturan prioritas awal:

var classifiedHotspots = hotspotStats.map(function(feature) {
  var areaHa = ee.Number(feature.get('area_ha'));
  var cmriDelta = ee.Number(feature.get('cmri_delta'));
  var mviDelta = ee.Number(feature.get('mvi_delta'));

  var priority = ee.String(
    ee.Algorithms.If(
      areaHa.gte(1.0).and(cmriDelta.lt(-0.3)),
      'high',
      ee.Algorithms.If(
        areaHa.gte(0.3).and(cmriDelta.lt(-0.2)),
        'medium',
        'low'
      )
    )
  );

  return feature.set({
    'priority': priority
  });
});

Catatan:

Aturan prioritas di atas hanya baseline. Kalibrasi perlu dilakukan berdasarkan kondisi lokal Kwala Serapuh dan hasil validasi lapangan.

9.15 Tahap 14 — Export GeoJSON Hotspot

Untuk MVP, output paling penting adalah GeoJSON.

Export.table.toDrive({
  collection: classifiedHotspots,
  description: 'mangrove_eye_hotspots_kwala_serapuh',
  fileFormat: 'GeoJSON'
});

Hasil GeoJSON ini akan diimpor ke Laravel, lalu disimpan sebagai:

hotspots.centroid;
hotspots.geom;
hotspots.area_ha;
hotspots.mvi_before;
hotspots.mvi_after;
hotspots.mvi_delta;
hotspots.cmri_before;
hotspots.cmri_after;
hotspots.cmri_delta;
hotspots.ndvi_*;
hotspots.ndwi_*;
hotspots.priority;
hotspots.validation_status.
9.16 Tahap 15 — Export Static Map untuk PDF

Static map digunakan untuk laporan PDF.

Contoh konsep:

var rgbVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
};

var thumbUrl = afterComposite.visualize(rgbVis).getThumbURL({
  region: aoi,
  dimensions: 1200,
  format: 'png'
});

print('Static Map URL:', thumbUrl);

Catatan:

Static map tidak wajib otomatis pada MVP awal;
URL dapat disalin manual atau diunduh sebagai gambar;
gambar ini dapat dimasukkan ke PDF report.
9.17 Tahap 16 — Tile Layer untuk Dashboard

Tile URL digunakan untuk layer raster interaktif di React Leaflet.

Pada MVP, tile layer bersifat opsional. Jika belum siap, dashboard cukup menampilkan AOI dan hotspot GeoJSON.

Contoh konsep GEE:

var cmriVis = {
  min: -1,
  max: 1,
  palette: ['red', 'yellow', 'green']
};

Map.addLayer(after.select('CMRI'), cmriVis, 'CMRI After');

Untuk integrasi tile ke React Leaflet, workflow lanjutan dapat menggunakan getMapId() atau pendekatan tile URL dari Earth Engine API.

Catatan penting:

Jangan memaksa Laravel memuat GeoTIFF besar untuk dashboard. Untuk raster dinamis, gunakan tile. Untuk MVP awal, static image atau hotspot GeoJSON sudah cukup.

10. Struktur Output GeoJSON Hotspot

GeoJSON hotspot sebaiknya memiliki struktur atribut seperti berikut:

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "hotspot_code": "HS-KS-2026-0001",
        "analysis_name": "Analisis Kwala Serapuh Jan-Jun 2026",
        "aoi_code": "AOI-KTH-001",
        "detected_at": "2026-06-30",
        "area_ha": 0.75,
        "centroid_lat": 4.012345,
        "centroid_lon": 98.456789,
        "mvi_before": 2.145,
        "mvi_after": 0.934,
        "mvi_delta": -1.211,
        "cmri_before": 0.642,
        "cmri_after": 0.311,
        "cmri_delta": -0.331,
        "ndvi_before": 0.782,
        "ndvi_after": 0.512,
        "ndvi_delta": -0.270,
        "ndwi_before": 0.140,
        "ndwi_after": 0.201,
        "ndwi_delta": 0.061,
        "priority": "high",
        "validation_status": "detected",
        "sensitivity_level": "restricted"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
    }
  ]
}

Catatan:

coordinates harus diisi dari hasil vectorize GEE.
hotspot_code dapat dibuat di GEE atau dibuat ulang oleh Laravel saat import.
sensitivity_level default untuk hotspot konflik sebaiknya restricted.
11. Struktur Script GEE yang Disarankan

File script GEE dapat disusun menjadi beberapa bagian:

gee/
  01_aoi_setup.js
  02_sentinel2_preprocessing.js
  03_indices_mvi_cmri.js
  04_before_after_change.js
  05_hotspot_export.js

Untuk MVP awal, semuanya boleh berada dalam satu script:

mangrove_eye_mvp_gee.js

Struktur isi script:

1. Configuration
2. AOI
3. Date Parameters
4. Sentinel-2 Collection
5. Cloud Mask Function
6. Composite Function
7. Index Function
8. Before-After Calculation
9. Change Mask
10. Hotspot Vectorization
11. Attribute Calculation
12. Visualization Layers
13. Export Tasks
12. Contoh Script MVP GEE

Script berikut adalah baseline awal. Nilai threshold dan AOI harus disesuaikan.

// =====================================================
// MANGROVE-EYE MVP GEE WORKFLOW
// Sentinel-2 + MVI/CMRI + Before-After Hotspot Detection
// =====================================================

// 1. AOI
// Ganti dengan AOI final dari KTH Nipah / Kwala Serapuh.
// Untuk testing, bisa gunakan geometry dari drawing tools.
var aoi = geometry;

// 2. Parameter tanggal
var beforeStart = '2024-01-01';
var beforeEnd   = '2024-03-31';
var afterStart  = '2025-01-01';
var afterEnd    = '2025-03-31';

// 3. Parameter awal
var cloudThreshold = 20;
var scale = 10;

// 4. Load Sentinel-2
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudThreshold));

// 5. Cloud masking sederhana berbasis SCL
function maskS2Clouds(image) {
  var scl = image.select('SCL');

  var cloudShadow = scl.eq(3);
  var clouds = scl.eq(8)
    .or(scl.eq(9))
    .or(scl.eq(10));

  var mask = cloudShadow.or(clouds).not();

  return image.updateMask(mask)
    .divide(10000)
    .copyProperties(image, image.propertyNames());
}

// 6. Composite
function getComposite(startDate, endDate) {
  return s2
    .filterDate(startDate, endDate)
    .map(maskS2Clouds)
    .median()
    .clip(aoi);
}

// 7. Tambah indeks
function addIndices(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  var cmri = ndvi.subtract(ndwi).rename('CMRI');

  var mvi = image.expression(
    '(NIR - GREEN) / (SWIR1 - GREEN)', {
      'NIR': image.select('B8'),
      'GREEN': image.select('B3'),
      'SWIR1': image.select('B11')
    }
  ).rename('MVI');

  return image.addBands([ndvi, ndwi, cmri, mvi]);
}

// 8. Generate before dan after
var beforeComposite = getComposite(beforeStart, beforeEnd);
var afterComposite = getComposite(afterStart, afterEnd);

var before = addIndices(beforeComposite);
var after = addIndices(afterComposite);

// 9. Delta indeks
var deltaMVI = after.select('MVI').subtract(before.select('MVI')).rename('delta_MVI');
var deltaCMRI = after.select('CMRI').subtract(before.select('CMRI')).rename('delta_CMRI');
var deltaNDVI = after.select('NDVI').subtract(before.select('NDVI')).rename('delta_NDVI');
var deltaNDWI = after.select('NDWI').subtract(before.select('NDWI')).rename('delta_NDWI');

// 10. Mask perubahan awal
// Threshold ini hanya baseline awal dan wajib dikalibrasi.
var waterMask = after.select('NDWI').lt(0.3);

var changeMask = deltaMVI.lt(-1.0)
  .and(deltaCMRI.lt(-0.2))
  .and(deltaNDVI.lt(-0.1))
  .and(waterMask);

// 11. Bersihkan noise
var cleanedMask = changeMask
  .selfMask()
  .connectedPixelCount(8, true)
  .gte(5)
  .selfMask();

// 12. Vectorize hotspot
var hotspotVectors = cleanedMask.reduceToVectors({
  geometry: aoi,
  scale: scale,
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'change',
  maxPixels: 1e13
});

// 13. Tambahkan atribut luas dan centroid
var hotspotsWithAttributes = hotspotVectors.map(function(feature) {
  var geom = feature.geometry();
  var areaHa = geom.area().divide(10000);
  var centroid = geom.centroid();

  return feature.set({
    'area_ha': areaHa,
    'centroid_lon': centroid.coordinates().get(0),
    'centroid_lat': centroid.coordinates().get(1),
    'validation_status': 'detected',
    'sensitivity_level': 'restricted'
  });
});

// 14. Stack indeks untuk statistik per hotspot
var indexStack = before.select(['MVI', 'CMRI', 'NDVI', 'NDWI'])
  .rename(['mvi_before', 'cmri_before', 'ndvi_before', 'ndwi_before'])
  .addBands(
    after.select(['MVI', 'CMRI', 'NDVI', 'NDWI'])
      .rename(['mvi_after', 'cmri_after', 'ndvi_after', 'ndwi_after'])
  )
  .addBands([
    deltaMVI.rename('mvi_delta'),
    deltaCMRI.rename('cmri_delta'),
    deltaNDVI.rename('ndvi_delta'),
    deltaNDWI.rename('ndwi_delta')
  ]);

// 15. Hitung nilai rata-rata indeks pada tiap hotspot
var hotspotStats = indexStack.reduceRegions({
  collection: hotspotsWithAttributes,
  reducer: ee.Reducer.mean(),
  scale: scale
});

// 16. Prioritas awal
var classifiedHotspots = hotspotStats.map(function(feature) {
  var areaHa = ee.Number(feature.get('area_ha'));
  var cmriDelta = ee.Number(feature.get('cmri_delta'));

  var priority = ee.String(
    ee.Algorithms.If(
      areaHa.gte(1.0).and(cmriDelta.lt(-0.3)),
      'high',
      ee.Algorithms.If(
        areaHa.gte(0.3).and(cmriDelta.lt(-0.2)),
        'medium',
        'low'
      )
    )
  );

  return feature.set({
    'priority': priority
  });
});

// 17. Visualisasi
Map.centerObject(aoi, 14);

Map.addLayer(beforeComposite, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
}, 'RGB Before');

Map.addLayer(afterComposite, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
}, 'RGB After');

Map.addLayer(after.select('CMRI'), {
  min: -1,
  max: 1,
  palette: ['red', 'yellow', 'green']
}, 'CMRI After');

Map.addLayer(cleanedMask, {
  palette: ['red']
}, 'Detected Change Mask');

Map.addLayer(classifiedHotspots, {}, 'Hotspot Vectors');

// 18. Export GeoJSON
Export.table.toDrive({
  collection: classifiedHotspots,
  description: 'mangrove_eye_hotspots_kwala_serapuh',
  fileFormat: 'GeoJSON'
});
13. Workflow Import ke Laravel

Setelah export GeoJSON dari GEE selesai:

1. Download file GeoJSON dari Google Drive.
2. Login sebagai Admin.
3. Buka menu Analysis Run.
4. Buat analysis run baru.
5. Isi AOI, periode before-after, dataset, threshold, dan parameter.
6. Upload file GeoJSON hotspot.
7. Laravel membaca setiap feature.
8. Geometry disimpan ke PostGIS.
9. Nilai indeks disimpan ke tabel hotspots.
10. Status awal hotspot = detected.
11. Dashboard menampilkan hotspot.

Data dari GeoJSON harus dipetakan ke tabel:

analysis_runs
gee_imports
hotspots
satellite_layers
14. Format Export yang Digunakan
Output	Format	Status MVP	Fungsi
Hotspot point/polygon	GeoJSON	Wajib	Import ke Laravel/PostGIS
Metadata indeks	GeoJSON properties / JSON	Wajib	Nilai MVI/CMRI/NDVI/NDWI
Static map	PNG/JPG	Disarankan	Laporan PDF
Raster tile	Tile URL	Opsional	Layer interaktif React Leaflet
GeoTIFF	GeoTIFF	Opsional/lanjutan	Analisis mendalam, bukan dashboard langsung
CSV	CSV	Opsional	Backup metadata non-spasial

Rekomendasi MVP:

Wajib:
- GeoJSON hotspot

Disarankan:
- Static PNG/JPG untuk laporan PDF

Opsional:
- Tile URL untuk layer raster interaktif
15. Naming Convention Export

Agar file rapi, gunakan pola nama:

mangrove_eye_[jenis_output]_[aoi]_[before]_[after]

Contoh:

mangrove_eye_hotspots_kwala_serapuh_2024q1_2025q1.geojson
mangrove_eye_static_map_kwala_serapuh_2024q1_2025q1.png
mangrove_eye_cmri_after_kwala_serapuh_2025q1.png

Untuk analysis run:

RUN-KS-2026-001

Untuk hotspot:

HS-KS-2026-0001
HS-KS-2026-0002
HS-KS-2026-0003
16. Validasi Kualitas Hasil GEE

Sebelum hasil GEE diimpor ke Laravel, admin/pengembang harus mengecek:

Apakah AOI sudah benar.
Apakah citra before dan after tidak tertutup awan tebal.
Apakah komposit tidak terlalu gelap atau terlalu terang.
Apakah hotspot muncul di area yang masuk akal.
Apakah hotspot tidak didominasi air terbuka atau tambak.
Apakah jumlah hotspot tidak terlalu banyak akibat noise.
Apakah nilai area_ha masuk akal.
Apakah GeoJSON dapat dibuka di QGIS/geojson.io.
Apakah properties indeks terbaca.
Apakah status awal detected sudah tersedia.
17. Risiko dan Mitigasi Workflow GEE
Risiko	Dampak	Mitigasi
AOI salah	Deteksi tidak relevan	Gunakan AOI resmi atau digitasi diverifikasi
Awan tebal	Indeks tidak akurat	Gunakan filter awan dan composite median
Bayangan awan	False positive	Gunakan SCL mask dan validasi visual
Pasang surut	Area air terbaca sebagai perubahan	Gunakan NDWI sebagai pendukung
Tambak/air berlumpur	Salah deteksi	Kombinasikan MVI, CMRI, NDVI, NDWI
Threshold terlalu sensitif	Hotspot terlalu banyak	Naikkan threshold dan min area
Threshold terlalu ketat	Hotspot penting terlewat	Turunkan threshold dan cek visual
GeoJSON terlalu besar	Import lambat	Simplify geometry / filter min area
Tile belum siap	Dashboard raster tidak tampil	Gunakan static image dan hotspot GeoJSON
Hasil dianggap bukti final	Overclaim	Tambahkan disclaimer dan validasi lapangan
18. Acceptance Criteria GEE Workflow

Workflow GEE dianggap siap untuk MVP apabila:

AOI Kwala Serapuh dapat dimuat di GEE.
Sentinel-2 dapat difilter berdasarkan AOI.
Sentinel-2 dapat difilter berdasarkan periode before-after.
Cloud masking dasar berjalan.
Composite before dan after berhasil dibuat.
NDVI, NDWI, MVI, dan CMRI berhasil dihitung.
Delta MVI dan delta CMRI berhasil dihitung.
Mask perubahan dapat ditampilkan.
Hotspot dapat dikonversi menjadi polygon.
Setiap hotspot memiliki estimasi luas.
Setiap hotspot memiliki centroid.
Setiap hotspot memiliki nilai indeks before-after.
Hotspot dapat diekspor sebagai GeoJSON.
GeoJSON dapat diimpor ke Laravel.
Hotspot dapat disimpan ke PostGIS.
Hotspot dapat ditampilkan di React Leaflet.
Hasil GEE diberi status sebagai indikasi awal, bukan vonis final.
19. Perlu Dikonfirmasi

Hal yang masih perlu dikonfirmasi:

Apakah AOI resmi KTH Nipah ±242 ha sudah tersedia.
Apakah area konflik ±60–62 ha sudah tersedia sebagai polygon.
Apakah workflow awal memakai AOI utama saja atau AOI utama + zona konflik.
Periode before-after default:
bulanan;
triwulan;
tahunan;
manual.
Nilai awal threshold MVI.
Nilai awal threshold CMRI.
Minimum luas hotspot yang dianggap relevan.
Apakah output dashboard membutuhkan tile URL pada MVP.
Apakah static map untuk PDF dibuat manual atau otomatis.
Apakah hasil export GEE diimpor manual atau semi-otomatis melalui endpoint Laravel.
Apakah cloud masking cukup dengan SCL atau langsung memakai s2cloudless.
Apakah validasi lapangan wajib memakai foto geotag.
20. Roadmap Lanjutan GEE

Setelah MVP stabil, workflow GEE dapat dikembangkan ke:

penggunaan s2cloudless untuk masking awan lebih baik;
integrasi data pasang surut atau pendekatan koreksi pasang surut;
integrasi Sentinel-1 SAR untuk mengurangi ketergantungan pada citra bebas awan;
otomatisasi Earth Engine Python API;
scheduler analisis bulanan/triwulan;
pembuatan tile layer otomatis;
dataset training U-Net berbasis tile Sentinel-2;
eksperimen segmentasi AI;
multi-AOI untuk pesisir Langkat atau Sumatera Utara;
dashboard tren multi-tahun.
21. Kesimpulan

GEE Workflow MANGROVE-EYE untuk MVP difokuskan pada proses yang realistis dan dapat dibangun oleh tim kecil:

Sentinel-2
+ AOI Kwala Serapuh
+ cloud masking
+ composite before-after
+ MVI/CMRI sebagai indeks utama
+ NDVI/NDWI sebagai pendukung
+ delta change detection
+ hotspot polygon/point
+ export GeoJSON
+ import Laravel/PostGIS
+ visualisasi React Leaflet
+ validasi lapangan

Workflow ini sengaja tidak memasukkan U-Net, Sentinel-1, scheduler otomatis, dan notifikasi sebagai kewajiban MVP. Fokus utama adalah membuktikan bahwa citra satelit dapat diubah menjadi hotspot spasial yang dapat disimpan, divisualisasikan, diverifikasi, dan digunakan sebagai dasar laporan indikasi awal deforestasi mangrove.