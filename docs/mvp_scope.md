MVP Scope MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	MVP Scope
Versi	v1.0
Acuan Utama	docs/PRD.md
Status	Draft awal
Target Penyimpanan	docs/MVP_SCOPE.md
2. Ringkasan MVP

MVP MANGROVE-EYE adalah versi awal sistem yang berfokus pada pembuktian bahwa data citra satelit dapat diolah menjadi informasi spasial yang berguna untuk mendeteksi dini dugaan deforestasi mangrove di Kwala Serapuh.

MVP ini tidak bertujuan membangun seluruh sistem secara kompleks sejak awal. Fokus utama MVP adalah membuat alur dasar yang berjalan dari:

AOI Kwala Serapuh
→ Analisis Sentinel-2 di Google Earth Engine
→ Perhitungan MVI/CMRI
→ Perbandingan before-after
→ Deteksi hotspot perubahan
→ Penyimpanan ke PostgreSQL/PostGIS
→ Visualisasi di dashboard WebGIS
→ Validasi lapangan
→ Export laporan PDF

Pada tahap MVP, proses analisis di Google Earth Engine boleh dilakukan secara manual atau semi-manual oleh admin/pengembang. Otomasi penuh, notifikasi real-time, dan model AI/U-Net tidak menjadi kewajiban MVP awal.

3. Tujuan MVP

Tujuan MVP MANGROVE-EYE adalah membangun purwarupa yang dapat:

Memuat AOI Kwala Serapuh, khususnya kawasan KTH Nipah ±242 ha dan area konflik ±60–62 ha.
Mengolah citra Sentinel-2 melalui Google Earth Engine.
Menghitung indeks spektral utama MVI dan CMRI.
Menggunakan NDVI dan NDWI sebagai indeks pendukung.
Membandingkan kondisi before-after berdasarkan periode yang dipilih.
Menghasilkan hotspot dugaan perubahan tutupan mangrove.
Menyimpan hotspot sebagai data spasial di PostgreSQL/PostGIS.
Menampilkan hotspot pada dashboard WebGIS berbasis React Leaflet.
Menyediakan validasi lapangan oleh pengguna berwenang.
Menghasilkan laporan PDF sederhana.
Melindungi koordinat dan data sensitif melalui role-based access control.
Menjadi dasar teknis untuk pengembangan lanjutan dan penulisan esai lomba nasional.
4. Prinsip MVP
4.1 Realistis untuk Tim Kecil

MVP harus dapat dibangun oleh tim mahasiswa atau tim kecil. Oleh karena itu, fitur yang membutuhkan sumber daya besar, seperti deep learning production-ready, aplikasi mobile native, dan integrasi real-time, tidak dimasukkan ke tahap awal.

4.2 GEE sebagai Mesin Analisis

Google Earth Engine digunakan untuk mengambil dan mengolah citra satelit. Laravel tidak digunakan untuk menghitung indeks spektral dari raster mentah.

Laravel hanya berperan untuk:

menerima hasil analisis;
menyimpan data spasial;
mengelola user dan role;
menyediakan API;
menampilkan data ke frontend;
membuat laporan PDF.
4.3 MVI dan CMRI sebagai Fokus Analisis

MVP tidak hanya menggunakan NDVI. Indeks utama untuk membaca perubahan mangrove adalah:

MVI untuk mendeteksi karakteristik vegetasi mangrove;
CMRI untuk membantu membedakan mangrove dari non-mangrove.

NDVI dan NDWI tetap digunakan sebagai indeks pendukung untuk membaca vegetasi umum dan elemen air.

4.4 Output Satelit Bukan Vonis Final

Hotspot yang muncul dari sistem hanya merupakan indikasi awal. Setiap hotspot tetap membutuhkan validasi lapangan sebelum digunakan dalam laporan advokasi yang lebih kuat.

4.5 Data Sensitif Harus Dilindungi

Koordinat presisi, polygon zona konflik, foto validasi, catatan lapangan, dan laporan internal tidak boleh dibuka penuh kepada publik.

5. Ruang Lingkup Wilayah MVP
5.1 Wilayah Utama

MVP hanya berfokus pada:

Kwala Serapuh,
Kecamatan Tanjung Pura,
Kabupaten Langkat,
Sumatera Utara
5.2 AOI Utama

AOI utama adalah kawasan KTH Nipah dengan estimasi luas:

±242 hektare

Status data:

Perlu dikonfirmasi dalam format GeoJSON/Shapefile resmi.

Jika data resmi belum tersedia, MVP dapat menggunakan hasil digitasi sementara.

5.3 Area Konflik Prioritas

Area pengamatan intensif adalah area konflik/kerusakan dengan estimasi luas:

±60–62 hektare

Status data:

Perlu dikunci secara spasial dalam bentuk GeoJSON/Shapefile.
5.4 Batasan Wilayah

MVP tidak mencakup:

seluruh pesisir Kabupaten Langkat;
seluruh pesisir Sumatera Utara;
seluruh kawasan mangrove nasional;
multi-AOI lintas daerah.

Ekspansi wilayah baru masuk tahap lanjutan setelah MVP stabil.

6. Scope Fitur MVP
6.1 Autentikasi dan Role Dasar
Deskripsi

Sistem menyediakan login dan pembagian hak akses berdasarkan role.

Role Awal MVP
Role	Fungsi
Public Viewer	Melihat informasi umum tanpa koordinat presisi
Validator Lapangan	Melihat detail hotspot dan mengisi validasi
NGO / Advocate	Melihat hasil validasi dan export laporan
Admin	Mengelola AOI, analysis run, hotspot, user, dan laporan
Super Admin	Mengelola seluruh konfigurasi sistem
Kebutuhan Minimal
Login.
Logout.
Middleware role.
Pembatasan akses halaman.
Pembatasan response API berdasarkan role.
6.2 Manajemen AOI
Deskripsi

Admin dapat menyimpan dan melihat Area of Interest yang akan digunakan sebagai batas analisis.

Data Minimal AOI
Field	Keterangan
Nama AOI	Contoh: Kawasan KTH Nipah
Tipe AOI	AOI utama / zona konflik / buffer / referensi
Lokasi	Desa, kecamatan, kabupaten, provinsi
Luas estimasi	Dalam hektare
Status hukum	Jika tersedia
Geometry	Polygon/MultiPolygon
Sumber data	Resmi / digitasi sementara / OSM / lainnya
Status verifikasi	Draft / verified / needs_revision
Kebutuhan Minimal
Import GeoJSON.
Simpan geometry ke PostGIS.
Tampilkan AOI di peta.
Edit metadata AOI.
Aktif/nonaktifkan AOI.
6.3 Analysis Run
Deskripsi

Analysis run adalah catatan setiap proses analisis before-after yang dilakukan pada AOI tertentu.

Pada MVP, proses GEE dapat dilakukan manual/semi-manual, tetapi hasilnya tetap harus dicatat di sistem.

Data Minimal Analysis Run
Field	Keterangan
Nama analisis	Contoh: Analisis Kwala Serapuh Jan-Jun 2026
AOI	AOI yang dianalisis
Periode before	Rentang tanggal citra awal
Periode after	Rentang tanggal citra terbaru
Dataset	Sentinel-2
Indeks utama	MVI, CMRI
Indeks pendukung	NDVI, NDWI
Cloud threshold	Batas awan yang digunakan
Threshold perubahan	Nilai ambang deteksi hotspot
Jumlah hotspot	Total hotspot hasil deteksi
Total estimasi luas	Estimasi luas terdampak
Status	Draft / processed / published / archived
Kebutuhan Minimal
Admin dapat membuat analysis run.
Admin dapat menyimpan metadata parameter analisis.
Admin dapat mengunggah/mengimpor hasil GEE.
Sistem menampilkan daftar analysis run.
Sistem menampilkan detail analysis run.
6.4 Import Hasil GEE
Deskripsi

MVP tidak wajib melakukan pemanggilan GEE otomatis dari Laravel. Jalur awal yang realistis adalah:

GEE Code Editor
→ Export GeoJSON/CSV/static image/tile URL
→ Import ke Laravel
→ Simpan ke PostGIS
→ Tampilkan di React Leaflet
Format Hasil yang Didukung MVP
Format	Fungsi
GeoJSON	Hotspot polygon/point
CSV	Metadata hotspot jika diperlukan
PNG/JPG	Peta statis untuk laporan PDF
Tile URL	Layer raster peta jika tersedia
JSON manual	Metadata indeks dan analysis run
Kebutuhan Minimal
Admin dapat mengimpor file GeoJSON hotspot.
Sistem membaca geometry hotspot.
Sistem mengaitkan hotspot dengan analysis run.
Sistem menyimpan nilai indeks before-after.
Sistem menyimpan estimasi luas dan prioritas.
6.5 Hotspot Detection Result
Deskripsi

Hotspot adalah area atau titik yang terdeteksi mengalami perubahan mencurigakan berdasarkan perubahan MVI/CMRI, dengan dukungan pembacaan NDVI/NDWI.

Data Minimal Hotspot
Field	Keterangan
ID Hotspot	Kode unik hotspot
Analysis Run	Sumber analisis
AOI	Area terkait
Centroid	Titik pusat hotspot
Geometry	Polygon area terdampak
Estimasi luas	Dalam hektare
MVI before	Nilai MVI periode awal
MVI after	Nilai MVI periode akhir
Delta MVI	Selisih perubahan
CMRI before	Nilai CMRI periode awal
CMRI after	Nilai CMRI periode akhir
Delta CMRI	Selisih perubahan
NDVI/NDWI pendukung	Opsional untuk interpretasi
Prioritas	Low / medium / high
Status validasi	detected / under_review / validated / rejected / needs_recheck
Kebutuhan Minimal
Hotspot dapat disimpan sebagai point dan polygon.
Hotspot dapat ditampilkan di peta.
Hotspot memiliki popup detail.
Hotspot dapat difilter berdasarkan status, prioritas, dan analysis run.
Hotspot dapat dibuka untuk validasi.
6.6 Dashboard WebGIS
Deskripsi

Dashboard WebGIS adalah output utama MVP. Dashboard harus membantu pengguna memahami lokasi, perubahan, status, dan prioritas hotspot.

Komponen Minimal Dashboard
Peta interaktif.
Layer AOI.
Layer hotspot.
Popup detail hotspot.
Filter tanggal/analysis run.
Filter status validasi.
Filter prioritas.
Statistik ringkas.
Before-after layer sederhana.
Tombol buka detail hotspot.
Tombol export laporan untuk role berwenang.
Statistik Minimal
Statistik	Keterangan
Total hotspot	Jumlah hotspot pada analysis run
Total estimasi luas terdampak	Akumulasi luas hotspot
Hotspot validated	Jumlah hotspot valid
Hotspot rejected	Jumlah hotspot ditolak
Hotspot needs_recheck	Jumlah hotspot perlu cek ulang
Hotspot high priority	Jumlah hotspot prioritas tinggi
Prinsip UI
Peta harus menjadi fokus utama.
Warna hotspot harus mudah dibedakan.
Popup tidak boleh terlalu panjang.
Informasi teknis indeks ditampilkan ringkas.
Detail lengkap ditampilkan pada halaman detail.
6.7 Before-After Visualization
Deskripsi

Before-after visualization digunakan untuk membandingkan kondisi area sebelum dan sesudah periode tertentu.

Scope MVP

MVP cukup menyediakan before-after sederhana, tidak harus sangat kompleks.

Opsi implementasi MVP:

Menampilkan dua layer bergantian.
Menampilkan slider before-after.
Menampilkan static image before-after pada detail analysis run.
Menampilkan layer perubahan sebagai overlay hotspot.
Data Minimal
Data	Fungsi
Citra before	Visual periode awal
Citra after	Visual periode akhir
MVI/CMRI before	Indeks utama periode awal
MVI/CMRI after	Indeks utama periode akhir
Delta layer	Area perubahan
Hotspot overlay	Hasil deteksi
Catatan

Jika tile before-after belum siap, MVP dapat memulai dari static image atau layer sederhana hasil export GEE.

6.8 Validasi Lapangan
Deskripsi

Validasi lapangan digunakan untuk memeriksa apakah hotspot hasil analisis satelit benar-benar menunjukkan perubahan di lapangan.

Status Validasi
Status	Makna
detected	Hotspot baru terdeteksi dari analisis
under_review	Sedang diperiksa oleh validator
validated	Terbukti sesuai dengan kondisi lapangan
rejected	Tidak terbukti / false positive
needs_recheck	Perlu pemeriksaan ulang
Data Minimal Validasi
Field	Keterangan
Hotspot	Hotspot yang divalidasi
Validator	User yang melakukan validasi
Status	Status hasil validasi
Catatan	Catatan lapangan
Foto	Bukti visual
Koordinat validasi	Jika tersedia
Tanggal validasi	Waktu validasi
Tingkat keyakinan	Opsional
Kebutuhan Minimal
Validator dapat membuka detail hotspot.
Validator dapat mengubah status validasi.
Validator dapat mengisi catatan.
Validator dapat mengunggah foto.
Sistem menyimpan identitas validator dan timestamp.
Admin/NGO dapat melihat riwayat validasi.
6.9 Export Laporan PDF
Deskripsi

Laporan PDF digunakan untuk mendokumentasikan hasil deteksi dan validasi sebagai bahan advokasi atau tindak lanjut.

Scope MVP

MVP cukup menyediakan laporan sederhana, bukan laporan hukum final.

Jenis Export MVP
Jenis Laporan	Status
PDF per hotspot	Wajib MVP
PDF per analysis run	Opsional MVP
Laporan multi-periode	Non-MVP
Laporan legal case lengkap	Non-MVP
Isi Minimal PDF
Judul laporan.
Tanggal laporan.
Nama AOI.
Periode before-after.
Peta lokasi hotspot.
Estimasi luas terdampak.
Nilai MVI/CMRI before-after.
Status validasi.
Foto validasi jika tersedia.
Catatan validator.
Disclaimer indikasi awal.
Disclaimer Wajib
Laporan ini merupakan hasil indikasi awal berbasis analisis citra satelit dan/atau validasi lapangan awal. Laporan ini tidak dimaksudkan sebagai vonis hukum final dan tetap memerlukan verifikasi lanjutan oleh pihak berwenang.
6.10 Keamanan dan RBAC
Deskripsi

MVP harus melindungi data sensitif karena lokasi konflik dan koordinat hotspot dapat berdampak pada keselamatan lapangan.

Data yang Dibatasi
Data	Public Viewer	Internal
Ringkasan kondisi	Bisa	Bisa
Peta umum	Bisa	Bisa
Koordinat presisi	Tidak	Bisa
Detail polygon konflik	Tidak	Bisa
Foto validasi	Tidak	Bisa
Catatan validator	Tidak	Bisa
PDF lengkap	Tidak	Bisa
Export data GeoJSON	Tidak	Admin/Super Admin
Strategi MVP
Middleware role.
API response filtering.
Generalisasi koordinat untuk publik.
Pembatasan akses file foto.
Pembatasan export laporan.
Audit log untuk perubahan penting.
7. Non-Scope MVP

Fitur berikut tidak dikerjakan pada MVP awal.

Fitur	Alasan Ditunda
U-Net production-ready	Butuh dataset anotasi, training, evaluasi, dan deployment
Training deep learning besar	Tidak realistis untuk MVP cepat
Sentinel-1 SAR	Butuh workflow tambahan dan interpretasi berbeda
Notifikasi WhatsApp/Telegram	Bisa ditambahkan setelah hotspot stabil
Scheduler otomatis penuh	MVP cukup manual/semi-manual
Mobile native app	Web dashboard sudah cukup untuk MVP
Offline field validation	Kompleks, masuk tahap lanjutan
Drone integration	Butuh perangkat dan workflow tambahan
Multi-AOI nasional	MVP fokus hiper-lokal
Legal case management	Bukan kebutuhan inti deteksi awal
Public transparency portal penuh	Butuh desain data publik yang lebih matang
Real-time monitoring harian	Sentinel-2 dan kondisi awan tidak mendukung real-time penuh
8. Workflow MVP
8.1 Workflow Data dan Analisis
1. Admin menyiapkan AOI Kwala Serapuh.
2. Admin/pengembang menjalankan script GEE.
3. GEE mengambil citra Sentinel-2 sesuai AOI dan periode.
4. GEE memfilter awan dan membuat komposit.
5. GEE menghitung MVI, CMRI, NDVI, dan NDWI.
6. GEE membandingkan periode before dan after.
7. GEE menghasilkan layer perubahan.
8. GEE menghasilkan hotspot point/polygon.
9. Hasil diekspor sebagai GeoJSON/static image/tile.
10. Admin mengimpor hasil ke Laravel.
11. Laravel menyimpan data ke PostgreSQL/PostGIS.
12. React Leaflet menampilkan hasil di dashboard.
8.2 Workflow Validasi
1. Validator login ke dashboard.
2. Validator membuka daftar hotspot prioritas.
3. Validator melihat detail hotspot.
4. Validator menuju lokasi lapangan.
5. Validator mengunggah foto dan catatan.
6. Validator mengubah status validasi.
7. Sistem menyimpan riwayat validasi.
8. Admin/NGO meninjau hasil validasi.
9. Laporan PDF dapat dibuat.
8.3 Workflow Akses Publik
1. Publik membuka dashboard umum.
2. Sistem menampilkan ringkasan kondisi mangrove.
3. Sistem menampilkan visualisasi umum tanpa koordinat presisi.
4. Publik melihat status umum hotspot.
5. Publik tidak dapat mengakses foto, catatan, koordinat detail, dan laporan internal.
9. Data MVP
9.1 Data Input
Data	Sumber	Status
AOI KTH Nipah ±242 ha	GeoJSON/Shapefile resmi atau digitasi	Perlu dikonfirmasi
Area konflik ±60–62 ha	GeoJSON/Shapefile atau digitasi	Perlu dikonfirmasi
Sentinel-2	Google Earth Engine	Wajib
Periode before-after	Input admin	Wajib
Threshold MVI/CMRI	Parameter admin/pengembang	Perlu dikalibrasi
Foto validasi	Validator lapangan	Wajib untuk validasi kuat
Catatan validasi	Validator lapangan	Wajib
9.2 Data Output
Data	Format	Digunakan Untuk
Hotspot point	PostGIS Point / GeoJSON	Marker peta
Hotspot polygon	PostGIS Polygon/MultiPolygon / GeoJSON	Area terdampak
Analysis summary	JSON/database	Statistik dashboard
Before-after image	PNG/JPG/tile	Visualisasi dan PDF
Validation record	Database	Bukti lapangan
Laporan PDF	PDF	Advokasi/tindak lanjut
10. Tech Stack MVP
10.1 Backend
Komponen	Teknologi
Framework	Laravel
Database	PostgreSQL
Spatial Extension	PostGIS
Authentication	Laravel Auth / Sanctum / session auth
Role Management	Spatie Laravel Permission atau custom RBAC sederhana
PDF Export	DomPDF / Browsershot / Snappy
File Storage	Local storage pada MVP, bisa pindah ke object storage
10.2 Frontend
Komponen	Teknologi
Framework UI	React
WebGIS Library	React Leaflet
Map Engine	Leaflet
Basemap	OpenStreetMap / Esri / Carto
Before-after	leaflet-side-by-side / react-compare-slider / implementasi sederhana
HTTP Client	Axios / Fetch
UI Component	Shadcn UI / Tailwind / komponen custom
10.3 Geospatial Processing
Komponen	Teknologi
Analisis citra	Google Earth Engine
Dataset utama	Sentinel-2 Level-2A
Indeks utama	MVI, CMRI
Indeks pendukung	NDVI, NDWI
Export vektor	GeoJSON
Export raster	PNG/JPG/GeoTIFF/tile sesuai kebutuhan
11. Struktur Modul MVP

MVP dapat dibagi menjadi modul berikut:

modules/
  auth/
  users_roles/
  aoi/
  analysis_runs/
  gee_imports/
  hotspots/
  field_validations/
  reports/
  dashboard/
  audit_logs/
11.1 Auth Module

Mengatur login, logout, dan user session.

11.2 Users & Roles Module

Mengatur user, role, dan permission.

11.3 AOI Module

Mengatur penyimpanan dan visualisasi Area of Interest.

11.4 Analysis Runs Module

Mengatur metadata analisis before-after.

11.5 GEE Imports Module

Mengatur import hasil analisis dari Google Earth Engine.

11.6 Hotspots Module

Mengatur hotspot hasil deteksi perubahan.

11.7 Field Validations Module

Mengatur validasi lapangan, foto, catatan, dan status.

11.8 Reports Module

Mengatur pembuatan laporan PDF.

11.9 Dashboard Module

Mengatur statistik dan visualisasi WebGIS.

11.10 Audit Logs Module

Mencatat aktivitas penting seperti perubahan status, import data, dan export laporan.

12. Acceptance Criteria MVP

MVP dianggap selesai jika memenuhi kriteria berikut:

12.1 Data dan Analisis
AOI dapat disimpan di database.
AOI dapat ditampilkan di peta.
Analysis run dapat dibuat.
Hasil GEE dapat diimpor ke sistem.
Hotspot dapat tersimpan sebagai data spasial PostGIS.
Hotspot memiliki nilai MVI/CMRI before-after.
Hotspot memiliki status validasi.
12.2 Dashboard
Dashboard menampilkan peta interaktif.
Dashboard menampilkan AOI.
Dashboard menampilkan hotspot.
Popup hotspot menampilkan ringkasan informasi.
Dashboard menampilkan statistik hotspot.
Dashboard dapat memfilter hotspot berdasarkan status.
Dashboard dapat membedakan tampilan publik dan internal.
12.3 Validasi
Validator dapat membuka detail hotspot.
Validator dapat mengisi catatan validasi.
Validator dapat mengunggah foto.
Validator dapat mengubah status validasi.
Riwayat validasi tersimpan.
12.4 Laporan
Admin/NGO dapat membuat PDF per hotspot.
PDF memuat peta lokasi.
PDF memuat nilai indeks dan estimasi luas.
PDF memuat hasil validasi jika tersedia.
PDF memuat disclaimer indikasi awal.
12.5 Keamanan
Public viewer tidak dapat melihat koordinat presisi.
Public viewer tidak dapat mengakses foto validasi internal.
Hanya role berwenang yang dapat export PDF.
Perubahan status validasi tercatat.
13. Batasan Teknis MVP
Analisis GEE belum wajib otomatis dari backend.
Export hasil GEE dapat dilakukan manual/semi-manual.
Tile raster belum wajib jika belum siap; static image dapat digunakan sementara.
Threshold MVI/CMRI masih perlu kalibrasi.
AOI resmi masih perlu dikonfirmasi.
Validasi lapangan masih bergantung pada pengguna internal.
Sistem belum mendukung offline mode.
Sistem belum mendukung notifikasi otomatis.
Sistem belum mendukung AI segmentation production-ready.
Sistem belum menggantikan pemeriksaan hukum atau investigasi resmi.
14. Asumsi MVP
Tim memiliki akses ke Google Earth Engine.
Tim dapat menjalankan script GEE secara manual/semi-manual.
AOI awal dapat dibuat dari GeoJSON hasil digitasi sementara.
Sentinel-2 cukup untuk baseline MVP.
PostgreSQL/PostGIS tersedia di environment pengembangan.
React Leaflet cukup untuk kebutuhan WebGIS awal.
Validator lapangan dapat membantu memeriksa hotspot prioritas.
Laporan PDF awal tidak harus mengikuti format resmi pemerintah.
Public dashboard hanya menampilkan data yang sudah digeneralisasi.
Pengembangan MVP dilakukan bertahap dan tidak memaksakan seluruh roadmap.
15. Risiko MVP
Risiko	Dampak	Mitigasi
AOI belum akurat	Deteksi tidak presisi	Gunakan digitasi sementara dan tandai sebagai unverified
Awan tinggi	Citra tidak terbaca baik	Gunakan komposit temporal dan filter awan
Pasang surut	False positive	Gunakan NDWI sebagai pendukung dan validasi lapangan
Threshold belum stabil	Hotspot terlalu banyak/sedikit	Kalibrasi dengan sampel lokal
Data GeoJSON terlalu berat	Dashboard lambat	Simplify geometry dan pagination/filter
Koordinat bocor	Risiko keamanan	RBAC dan generalisasi koordinat
Validasi minim	Laporan kurang kuat	Prioritaskan hotspot high priority
PDF terlalu kompleks	Lama dikembangkan	Mulai dari PDF per hotspot
Terlalu banyak fitur	MVP tidak selesai	Tunda fitur non-MVP
GEE workflow belum stabil	Import data berantakan	Standarkan format export dari awal
16. Prioritas Pengembangan MVP
16.1 Must Have

Fitur yang wajib ada:

Auth dan role dasar.
AOI import dan storage.
Analysis run.
Import hasil GEE.
Hotspot PostGIS.
Dashboard peta.
Popup hotspot.
Filter status.
Validasi lapangan.
Upload foto.
Export PDF per hotspot.
RBAC koordinat sensitif.
16.2 Should Have

Fitur yang sebaiknya ada:

Statistik dashboard.
Before-after visual sederhana.
Audit log.
Filter prioritas.
Export ringkasan analysis run.
Generalisasi koordinat publik.
16.3 Could Have

Fitur tambahan jika waktu cukup:

Slider before-after interaktif.
Tile layer MVI/CMRI.
PDF per analysis run.
Bulk import hotspot.
Peta static otomatis dari viewport.
Catatan validasi dengan tingkat keyakinan.
16.4 Won’t Have in MVP

Fitur yang tidak dikerjakan:

U-Net production-ready.
Training model AI.
Sentinel-1 integration.
Scheduler otomatis.
WhatsApp/Telegram notification.
Mobile native app.
Offline validation.
Multi-region monitoring.
Legal case management.
17. Rencana Implementasi MVP Bertahap
Tahap 1 — Setup Fondasi
Setup Laravel.
Setup PostgreSQL/PostGIS.
Setup React.
Setup React Leaflet.
Setup autentikasi.
Setup role dasar.
Tahap 2 — AOI dan Analysis Run
Buat tabel AOI.
Import GeoJSON AOI.
Tampilkan AOI di peta.
Buat tabel analysis run.
Buat form metadata analysis run.
Tahap 3 — GEE Prototype dan Import
Finalisasi script GEE awal.
Hitung MVI/CMRI/NDVI/NDWI.
Export hotspot GeoJSON.
Buat import hotspot.
Simpan hotspot ke PostGIS.
Tahap 4 — Dashboard WebGIS
Tampilkan hotspot di peta.
Buat popup detail.
Buat filter status/prioritas.
Buat statistik ringkas.
Buat tampilan public/internal.
Tahap 5 — Validasi Lapangan
Buat detail hotspot.
Buat form validasi.
Upload foto.
Ubah status validasi.
Simpan riwayat validasi.
Tahap 6 — Laporan PDF dan Keamanan
Buat export PDF per hotspot.
Tambahkan disclaimer.
Batasi akses PDF.
Tambahkan audit log.
Uji RBAC data sensitif.
18. Deliverable MVP

Deliverable akhir MVP:

Repository Laravel + React.
Database PostgreSQL/PostGIS.
Script GEE awal.
File AOI GeoJSON awal.
Modul import hasil GEE.
Modul hotspot.
Dashboard WebGIS.
Modul validasi lapangan.
Modul export PDF.
Sistem role-based access.
Dokumentasi teknis:
PRD.md
MVP_SCOPE.md
DATABASE_DESIGN.md
GEE_WORKFLOW.md
API_CONTRACT.md
UI_DASHBOARD_PLAN.md
DEVELOPMENT_TASK_LIST.md
19. Perlu Dikonfirmasi

Hal yang perlu dikonfirmasi sebelum implementasi final MVP:

Apakah AOI KTH Nipah ±242 ha sudah tersedia dalam GeoJSON/Shapefile?
Apakah area konflik ±60–62 ha bisa dipetakan presisi?
Apakah public dashboard benar-benar dibutuhkan pada MVP?
Role final yang akan dipakai pada sistem.
Apakah PDF wajib dibuat per hotspot atau per analysis run.
Format laporan PDF yang diinginkan.
Apakah foto validasi wajib geotag.
Threshold awal MVI/CMRI.
Default periode before-after.
Apakah hasil GEE akan diimpor melalui GeoJSON manual atau API semi-otomatis.
Hosting awal sistem.
Apakah tile raster perlu masuk MVP atau cukup static image.
20. Kesimpulan MVP Scope

MVP MANGROVE-EYE difokuskan pada pembangunan alur inti sistem peringatan dini deforestasi mangrove berbasis WebGIS. Scope awal sengaja dibuat realistis agar dapat dibangun oleh tim kecil, tetapi tetap cukup kuat untuk membuktikan nilai utama sistem.

Fokus MVP adalah:

GEE + Sentinel-2 + MVI/CMRI + Hotspot Detection
+ PostgreSQL/PostGIS + Laravel API
+ React Leaflet Dashboard
+ Validasi Lapangan + PDF Report + RBAC

Fitur seperti U-Net, Sentinel-1, notifikasi otomatis, mobile app, dan ekspansi multi-wilayah tetap penting, tetapi tidak menjadi bagian wajib MVP awal.

Dengan scope ini, MANGROVE-EYE dapat dibangun sebagai purwarupa yang implementatif, aman, dan relevan untuk mendukung pemantauan mangrove, advokasi lingkungan, serta penulisan esai lomba nasional berbasis solusi teknologi yang realistis.