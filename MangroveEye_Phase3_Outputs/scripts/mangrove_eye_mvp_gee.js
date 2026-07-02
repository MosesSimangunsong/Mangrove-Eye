// =========================================================
// MANGROVE-EYE GEE MVP SCRIPT
// Phase 3 - GEE Prototype
// Fokus: Deteksi indikasi awal perubahan tutupan mangrove
// Lokasi: Kwala Serapuh, Langkat, Sumatera Utara
// Catatan: Hasil hotspot adalah indikasi awal, bukan vonis hukum
// =========================================================


// ---------------------------------------------------------
// 1. PARAMETER ANALYSIS RUN
// ---------------------------------------------------------

// Periode before / baseline
var beforeStart = '2024-01-01';
var beforeEnd   = '2024-04-30';

// Periode after / observasi
var afterStart  = '2025-01-01';
var afterEnd    = '2025-04-30';

// Filter awan awal per scene
var maxCloudCoverage = 60;


// ---------------------------------------------------------
// 2. AOI KWALA SERAPUH
// Status: Draft sementara, bukan batas resmi
// Format koordinat: [longitude, latitude]
// ---------------------------------------------------------

var aoi = ee.Geometry.Polygon([
  [
    [98.435, 4.005],
    [98.475, 4.005],
    [98.475, 4.035],
    [98.435, 4.035],
    [98.435, 4.005]
  ]
]);

// Fokuskan peta ke AOI
Map.centerObject(aoi, 14);

// Tampilkan batas AOI
Map.addLayer(
  aoi,
  { color: 'red' },
  'AOI Draft Kwala Serapuh'
);


// ---------------------------------------------------------
// 3. CEK AWAL
// ---------------------------------------------------------

print('MANGROVE-EYE Phase 3 dimulai');
print('AOI Draft Kwala Serapuh:', aoi);
print('Periode before:', beforeStart, 'sampai', beforeEnd);
print('Periode after:', afterStart, 'sampai', afterEnd);

// ---------------------------------------------------------
// 4. LOAD SENTINEL-2 DAN FILTER CITRA
// Dataset utama: Sentinel-2 Surface Reflectance Harmonized
// ---------------------------------------------------------

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

// Filter berdasarkan AOI dan persentase awan
var s2Filtered = s2
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', maxCloudCoverage));

// Pisahkan koleksi citra untuk periode before dan after
var beforeCol = s2Filtered.filterDate(beforeStart, beforeEnd);
var afterCol  = s2Filtered.filterDate(afterStart, afterEnd);

// Cek jumlah citra yang tersedia
print('Jumlah citra before:', beforeCol.size());
print('Jumlah citra after:', afterCol.size());

// Cek contoh citra pertama
print('Contoh citra before pertama:', beforeCol.first());
print('Contoh citra after pertama:', afterCol.first());

// ---------------------------------------------------------
// 5. FUNGSI PEMBERSIHAN AWAN (CLOUD MASKING SCL)
// Menyingkirkan piksel cuaca buruk (3=bayangan, 8=awan sedang, 9=awan tebal, 10=cirrus)
// ---------------------------------------------------------

function maskS2Clouds(image) {
  var scl = image.select('SCL');

  // Deteksi kelas gangguan spektral
  var cloudShadows = scl.eq(3);
  var cloudsMed    = scl.eq(8);
  var cloudsHigh   = scl.eq(9);
  var cirrus       = scl.eq(10);

  // Gabungkan semua jenis gangguan awan (OR) dan balikkan logikanya (NOT)
  var mask = cloudShadows.or(cloudsMed).or(cloudsHigh).or(cirrus).not();

  // Lubangi area berawan, normalisasi desimal rasio pantulan absolut (0-1), 
  // dan pertahankan metadata kalender
  return image.updateMask(mask)
              .divide(10000)
              .copyProperties(image, image.propertyNames());
}

print('Fungsi maskS2Clouds berhasil dimuat ke memori.');

// ---------------------------------------------------------
// 6. MEMBUAT COMPOSITE BEFORE DAN AFTER
// Menggabungkan banyak citra menjadi satu citra representatif
// ---------------------------------------------------------

var beforeComposite = beforeCol
  .map(maskS2Clouds)
  .median()
  .clip(aoi);

var afterComposite = afterCol
  .map(maskS2Clouds)
  .median()
  .clip(aoi);

print('Before composite berhasil dibuat:', beforeComposite);
print('After composite berhasil dibuat:', afterComposite);
print('Band before composite:', beforeComposite.bandNames());
print('Band after composite:', afterComposite.bandNames());


// ---------------------------------------------------------
// 7. VISUALISASI RGB BEFORE DAN AFTER
// Band Sentinel-2:
// B4 = Red
// B3 = Green
// B2 = Blue
// ---------------------------------------------------------

var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2']
};

Map.addLayer(
  beforeComposite,
  rgbVis,
  'RGB Before Composite',
  false
);

Map.addLayer(
  afterComposite,
  rgbVis,
  'RGB After Composite',
  true
);

// ---------------------------------------------------------
// 8. MENGHITUNG INDEKS NDVI, NDWI, CMRI, DAN MVI
// ---------------------------------------------------------

function addIndices(image) {
  // NDVI = (NIR - RED) / (NIR + RED)
  // Sentinel-2: B8 = NIR, B4 = Red
  var ndvi = image
    .normalizedDifference(['B8', 'B4'])
    .rename('NDVI');

  // NDWI = (GREEN - NIR) / (GREEN + NIR)
  // Sentinel-2: B3 = Green, B8 = NIR
  var ndwi = image
    .normalizedDifference(['B3', 'B8'])
    .rename('NDWI');

  // CMRI = NDVI - NDWI
  var cmri = ndvi
    .subtract(ndwi)
    .rename('CMRI');

  // MVI = (NIR - GREEN) / (SWIR1 - GREEN)
  // Sentinel-2: B8 = NIR, B3 = Green, B11 = SWIR1
  var mvi = image.expression(
    '(NIR - GREEN) / (SWIR1 - GREEN)',
    {
      'NIR': image.select('B8'),
      'GREEN': image.select('B3'),
      'SWIR1': image.select('B11')
    }
  ).rename('MVI');

  return image.addBands([ndvi, ndwi, cmri, mvi]);
}

// Tambahkan indeks ke composite before dan after
var before = addIndices(beforeComposite);
var after = addIndices(afterComposite);

// Cek band baru
print('Band before setelah ditambah indeks:', before.bandNames());
print('Band after setelah ditambah indeks:', after.bandNames());

// ---------------------------------------------------------
// 9. VISUALISASI INDEKS MVI DAN CMRI
// ---------------------------------------------------------

var mviVis = {
  min: -2,
  max: 8,
  palette: ['brown', 'yellow', 'green']
};

var cmriVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'darkgreen']
};

Map.addLayer(
  before.select('MVI'),
  mviVis,
  'MVI Before',
  false
);

Map.addLayer(
  after.select('MVI'),
  mviVis,
  'MVI After',
  true
);

Map.addLayer(
  before.select('CMRI'),
  cmriVis,
  'CMRI Before',
  false
);

Map.addLayer(
  after.select('CMRI'),
  cmriVis,
  'CMRI After',
  false
);

// ---------------------------------------------------------
// 10. CHANGE DETECTION BEFORE-AFTER
// Menghitung selisih indeks: after - before
// Nilai negatif besar menunjukkan penurunan vegetasi/mangrove
// ---------------------------------------------------------

var deltaMVI = after
  .select('MVI')
  .subtract(before.select('MVI'))
  .rename('deltaMVI');

var deltaCMRI = after
  .select('CMRI')
  .subtract(before.select('CMRI'))
  .rename('deltaCMRI');

var deltaNDVI = after
  .select('NDVI')
  .subtract(before.select('NDVI'))
  .rename('deltaNDVI');

var deltaNDWI = after
  .select('NDWI')
  .subtract(before.select('NDWI'))
  .rename('deltaNDWI');

print('Delta MVI berhasil dibuat:', deltaMVI);
print('Delta CMRI berhasil dibuat:', deltaCMRI);
print('Delta NDVI berhasil dibuat:', deltaNDVI);
print('Delta NDWI berhasil dibuat:', deltaNDWI);

// ---------------------------------------------------------
// 11. VISUALISASI DELTA MVI DAN DELTA CMRI
// Area merah = indikasi penurunan kuat
// ---------------------------------------------------------

var deltaMviVis = {
  min: -5,
  max: 1,
  palette: ['red', 'yellow', 'white', 'green']
};

var deltaCmriVis = {
  min: -2,
  max: 1,
  palette: ['red', 'yellow', 'white', 'green']
};

Map.addLayer(
  deltaMVI,
  deltaMviVis,
  'Delta MVI After - Before',
  true
);

Map.addLayer(
  deltaCMRI,
  deltaCmriVis,
  'Delta CMRI After - Before',
  false
);

Map.addLayer(
  deltaNDVI,
  {
    min: -1,
    max: 1,
    palette: ['red', 'white', 'green']
  },
  'Delta NDVI After - Before',
  false
);

Map.addLayer(
  deltaNDWI,
  {
    min: -1,
    max: 1,
    palette: ['brown', 'white', 'blue']
  },
  'Delta NDWI After - Before',
  false
);


// ---------------------------------------------------------
// 12. THRESHOLD DAN MASK AWAL HOTSPOT
// Mengubah delta indeks menjadi kandidat hotspot
// Catatan: threshold masih baseline eksperimen, bukan nilai final
// ---------------------------------------------------------

var mviThreshold = -1.5;
var cmriThreshold = -0.3;

// Syarat utama indikasi perubahan:
// MVI turun kuat dan CMRI juga turun
var lossMask = deltaMVI
  .lte(mviThreshold)
  .and(deltaCMRI.lte(cmriThreshold));

// Mask area yang sebelumnya memang vegetasi/mangrove
// Ini membantu mengurangi false positive dari area air/tambak/lahan kosong
var wasVegetation = before
  .select('NDVI')
  .gt(0.3);

// Kandidat hotspot awal
var hotspotPixelMask = lossMask
  .and(wasVegetation)
  .selfMask();

print('Loss mask berhasil dibuat:', lossMask);
print('Was vegetation mask berhasil dibuat:', wasVegetation);
print('Hotspot pixel mask awal berhasil dibuat:', hotspotPixelMask);

// ---------------------------------------------------------
// 13. VISUALISASI HOTSPOT PIXEL MASK AWAL
// Area merah = kandidat hotspot awal
// ---------------------------------------------------------

Map.addLayer(
  hotspotPixelMask,
  { palette: ['red'] },
  'Raw Hotspot Pixel Mask',
  true
);

// ---------------------------------------------------------
// 14. NOISE CLEANING HOTSPOT
// Membersihkan bintik kecil agar hotspot lebih rapi
// ---------------------------------------------------------

// Minimum jumlah piksel yang saling tersambung.
// Sentinel-2 resolusi 10m, jadi 1 piksel sekitar 100 m2.
// 15 piksel kira-kira 1.500 m2 atau 0,15 ha.
var minConnectedPixels = 15;

// Hitung jumlah piksel merah yang saling tersambung
var patchSize = hotspotPixelMask.connectedPixelCount(100, true);

// Pertahankan hanya patch yang jumlah pikselnya cukup besar
var cleanHotspotPixels = hotspotPixelMask
  .updateMask(patchSize.gte(minConnectedPixels));

print('Patch size berhasil dibuat:', patchSize);
print('Clean hotspot pixels berhasil dibuat:', cleanHotspotPixels);

// ---------------------------------------------------------
// 15. VISUALISASI HOTSPOT SETELAH NOISE CLEANING
// Area merah gelap = kandidat hotspot yang sudah dibersihkan
// ---------------------------------------------------------

Map.addLayer(
  cleanHotspotPixels,
  { palette: ['darkred'] },
  'Clean Hotspot Pixel Mask',
  true
);

// ---------------------------------------------------------
// 16. VECTORIZE HOTSPOT
// Mengubah hotspot raster/pixel menjadi polygon vector
// ---------------------------------------------------------

// reduceToVectors membutuhkan image label yang rapi.
// Kita ubah clean hotspot menjadi integer label.
var hotspotVectorSource = cleanHotspotPixels
  .rename('hotspot_class')
  .toInt();

// Ubah pixel hotspot menjadi polygon
var hotspotPolygons = hotspotVectorSource.reduceToVectors({
  geometry: aoi,
  scale: 10,
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'hotspot_class',
  reducer: ee.Reducer.countEvery(),
  maxPixels: 1e8
});

print('Hotspot polygons berhasil dibuat:', hotspotPolygons);
print('Jumlah polygon hotspot:', hotspotPolygons.size());

// ---------------------------------------------------------
// 17. VISUALISASI HOTSPOT POLYGON
// Garis kuning = batas polygon hotspot hasil vectorize
// ---------------------------------------------------------

Map.addLayer(
  ee.Image().paint(hotspotPolygons, 1, 2),
  { palette: ['yellow'] },
  'Hotspot Polygons Vector',
  true
);

// ---------------------------------------------------------
// 18. MENAMBAHKAN ATRIBUT KE POLYGON HOTSPOT
// Menghitung area, centroid, dan nilai rata-rata indeks
// ---------------------------------------------------------

// Gabungkan band-band penting menjadi satu image untuk dihitung rata-ratanya per polygon
var hotspotAttributeImage = before.select('MVI').rename('mvi_before')
  .addBands(after.select('MVI').rename('mvi_after'))
  .addBands(deltaMVI.rename('mvi_delta'))
  .addBands(before.select('CMRI').rename('cmri_before'))
  .addBands(after.select('CMRI').rename('cmri_after'))
  .addBands(deltaCMRI.rename('cmri_delta'))
  .addBands(before.select('NDVI').rename('ndvi_before'))
  .addBands(after.select('NDVI').rename('ndvi_after'))
  .addBands(deltaNDVI.rename('ndvi_delta'))
  .addBands(before.select('NDWI').rename('ndwi_before'))
  .addBands(after.select('NDWI').rename('ndwi_after'))
  .addBands(deltaNDWI.rename('ndwi_delta'));

var hotspotsWithData = hotspotPolygons.map(function(feature) {
  var geom = feature.geometry();

  // Hitung luas dalam hektare
  var areaHa = geom.area(1).divide(10000);

  // Hitung centroid
  var centroid = geom.centroid(1);
  var coords = centroid.coordinates();

  // Hitung rata-rata nilai indeks di dalam polygon
  var stats = hotspotAttributeImage.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geom,
    scale: 10,
    maxPixels: 1e6
  });

  return feature.set({
    'area_ha': areaHa,
    'centroid_lon': coords.get(0),
    'centroid_lat': coords.get(1),

    'mvi_before_mean': stats.get('mvi_before'),
    'mvi_after_mean': stats.get('mvi_after'),
    'mvi_delta_mean': stats.get('mvi_delta'),

    'cmri_before_mean': stats.get('cmri_before'),
    'cmri_after_mean': stats.get('cmri_after'),
    'cmri_delta_mean': stats.get('cmri_delta'),

    'ndvi_before_mean': stats.get('ndvi_before'),
    'ndvi_after_mean': stats.get('ndvi_after'),
    'ndvi_delta_mean': stats.get('ndvi_delta'),

    'ndwi_before_mean': stats.get('ndwi_before'),
    'ndwi_after_mean': stats.get('ndwi_after'),
    'ndwi_delta_mean': stats.get('ndwi_delta'),

    'validation_status': 'detected',
    'source': 'gee_sentinel2_mvp',
    'aoi_name': 'Kwala Serapuh Draft AOI'
  });
});

print('Hotspot dengan atribut berhasil dibuat:', hotspotsWithData);
print('Jumlah hotspot dengan atribut:', hotspotsWithData.size());
print('Contoh hotspot pertama dengan atribut:', hotspotsWithData.first());

// ---------------------------------------------------------
// 19. VISUALISASI HOTSPOT DENGAN ATRIBUT
// Garis cyan = polygon hotspot yang sudah punya atribut
// ---------------------------------------------------------

Map.addLayer(
  ee.Image().paint(hotspotsWithData, 1, 2),
  { palette: ['cyan'] },
  'Hotspot Polygons With Attributes',
  true
);

// ---------------------------------------------------------
// 20. KLASIFIKASI PRIORITAS HOTSPOT
// Menentukan prioritas berdasarkan luas area dan penurunan MVI
// ---------------------------------------------------------

var hotspotsFinal = hotspotsWithData.map(function(feature) {
  var areaHa = ee.Number(feature.get('area_ha'));
  var mviDelta = ee.Number(feature.get('mvi_delta_mean'));

  var priority = ee.Algorithms.If(
    areaHa.gte(1.0).and(mviDelta.lte(-3.5)),
    'high',
    ee.Algorithms.If(
      areaHa.gte(0.5).or(mviDelta.lte(-2.5)),
      'medium',
      'low'
    )
  );

  return feature.set({
    'priority': priority,
    'hotspot_type': 'mangrove_loss_indication',
    'detection_method': 'sentinel2_mvi_cmri_change_detection'
  });
});

print('Hotspot final dengan prioritas berhasil dibuat:', hotspotsFinal);
print('Jumlah hotspot final:', hotspotsFinal.size());
print('Contoh hotspot final:', hotspotsFinal.first());

// ---------------------------------------------------------
// 21. VISUALISASI HOTSPOT FINAL
// Garis magenta = polygon hotspot final siap export
// ---------------------------------------------------------

Map.addLayer(
  ee.Image().paint(hotspotsFinal, 1, 3),
  { palette: ['magenta'] },
  'Final Hotspot Polygons Ready to Export',
  true
);

// ---------------------------------------------------------
// 22. EXPORT HOTSPOT GEOJSON - FIX GEOMETRY
// Mengekspor hotspot final ke Google Drive dengan geometry
// ---------------------------------------------------------

Export.table.toDrive({
  collection: hotspotsFinal,
  description: 'MANGROVE_EYE_Hotspots_KwalaSerapuh_Run001_FixGeometry',
  folder: 'MangroveEye_Phase3_Outputs',
  fileNamePrefix: 'hotspots_kwala_serapuh_run001_fix_geometry',
  fileFormat: 'GeoJSON',
  selectors: [
    '.geo',

    'area_ha',
    'centroid_lon',
    'centroid_lat',

    'mvi_before_mean',
    'mvi_after_mean',
    'mvi_delta_mean',

    'cmri_before_mean',
    'cmri_after_mean',
    'cmri_delta_mean',

    'ndvi_before_mean',
    'ndvi_after_mean',
    'ndvi_delta_mean',

    'ndwi_before_mean',
    'ndwi_after_mean',
    'ndwi_delta_mean',

    'priority',
    'validation_status',
    'hotspot_type',
    'detection_method',
    'source',
    'aoi_name'
  ]
});

print('Task export GeoJSON FIX sudah dibuat. Buka tab Tasks lalu klik Run.');

// ---------------------------------------------------------
// 23. STATIC MAP UNTUK PDF
// Membuat URL gambar statis dari GEE
// Catatan: URL getThumbURL bersifat sementara, jadi langsung buka dan simpan gambarnya.
// ---------------------------------------------------------

var staticMapRegion = aoi;

// Visualisasi before
var beforeStaticImage = before
  .visualize(rgbVis);

// Visualisasi after
var afterStaticImage = after
  .visualize(rgbVis);

// Visualisasi hotspot raster merah
var hotspotStaticImage = cleanHotspotPixels
  .visualize({
    palette: ['red'],
    forceRgbOutput: true
  });

// Visualisasi polygon final kuning
var hotspotPolygonImage = ee.Image()
  .byte()
  .paint(hotspotsFinal, 1, 2)
  .visualize({
    palette: ['yellow'],
    forceRgbOutput: true
  });

// Overlay hotspot di atas citra after
var afterWithHotspotOverlay = afterStaticImage
  .blend(hotspotStaticImage)
  .blend(hotspotPolygonImage);

// URL gambar before
var beforeMapUrl = beforeStaticImage.getThumbURL({
  region: staticMapRegion,
  dimensions: '1200x1200',
  format: 'png',
  crs: 'EPSG:4326'
});

// URL gambar after
var afterMapUrl = afterStaticImage.getThumbURL({
  region: staticMapRegion,
  dimensions: '1200x1200',
  format: 'png',
  crs: 'EPSG:4326'
});

// URL gambar after + hotspot overlay
var hotspotOverlayMapUrl = afterWithHotspotOverlay.getThumbURL({
  region: staticMapRegion,
  dimensions: '1200x1200',
  format: 'png',
  crs: 'EPSG:4326'
});

print('Static Map Before URL:', beforeMapUrl);
print('Static Map After URL:', afterMapUrl);
print('Static Map Hotspot Overlay URL:', hotspotOverlayMapUrl);