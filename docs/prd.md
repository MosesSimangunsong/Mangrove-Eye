PRD MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Sistem	Dashboard WebGIS / Spatial Intelligence Dashboard / Early Warning System
Fokus Masalah	Deteksi dini dugaan deforestasi mangrove ilegal
Lokasi Studi Kasus	Kwala Serapuh, Kecamatan Tanjung Pura, Kabupaten Langkat, Sumatera Utara
Versi Dokumen	v1.0
Status	Draft awal untuk pengembangan MVP
Target Penyimpanan	docs/PRD.md
2. Ringkasan Produk

MANGROVE-EYE adalah sistem dashboard WebGIS berbasis Laravel + React + PostgreSQL/PostGIS + Google Earth Engine untuk membantu mendeteksi dini dugaan deforestasi mangrove ilegal di kawasan Kwala Serapuh.

Sistem ini menggunakan citra satelit Sentinel-2 yang diproses melalui Google Earth Engine untuk menghitung indeks spektral utama MVI dan CMRI, dengan NDVI dan NDWI sebagai indeks pendukung untuk membaca kondisi vegetasi dan elemen air. Hasil analisis digunakan untuk mendeteksi perubahan tutupan mangrove pada AOI KTH Nipah ±242 ha dan area konflik ±60–62 ha, menghasilkan hotspot dugaan kerusakan, menampilkan perubahan before-after pada peta interaktif, mendukung validasi lapangan, serta menghasilkan laporan PDF.

MANGROVE-EYE tidak dimaksudkan sebagai sistem yang langsung memvonis suatu area telah mengalami pelanggaran hukum. Sistem ini berperan sebagai instrumen penilaian awal / early assessment tool untuk membantu masyarakat, NGO, dan otoritas terkait menentukan lokasi yang perlu diverifikasi lebih lanjut.

3. Latar Belakang

Kawasan mangrove di Kwala Serapuh memiliki nilai ekologis, sosial, dan ekonomi yang penting bagi masyarakat pesisir. Mangrove berfungsi sebagai pelindung abrasi, habitat biota pesisir, penyerap karbon biru, serta penopang mata pencaharian nelayan.

Namun, pengawasan kawasan mangrove secara manual memiliki banyak keterbatasan. Area pesisir dan rawa sulit dijangkau, patroli membutuhkan waktu dan biaya, serta informasi kerusakan sering terlambat diketahui. Dalam kasus konflik lahan, masyarakat dan aktivis lingkungan juga dapat menghadapi risiko intimidasi ketika melakukan pemantauan langsung.

Karena itu, diperlukan sistem yang dapat memberikan peringatan dini berbasis data satelit. MANGROVE-EYE dirancang untuk menjembatani data satelit, analisis indeks spektral, penyimpanan data spasial, visualisasi WebGIS, dan validasi lapangan dalam satu alur yang implementatif.

4. Masalah yang Ingin Diselesaikan

Masalah utama yang ingin diselesaikan:

Pemantauan manual tidak efisien
Kawasan mangrove sulit dipantau secara rutin hanya dengan patroli darat.
Kerusakan sering terlambat diketahui
Deforestasi atau pembukaan lahan dapat terjadi lebih cepat daripada proses pelaporan manual.
Kurangnya bukti spasial awal
Laporan masyarakat sering membutuhkan data pendukung berupa lokasi, perubahan visual, dan estimasi area terdampak.
Data koordinat sensitif berisiko disalahgunakan
Koordinat detail hotspot di wilayah konflik tidak boleh dibuka sepenuhnya ke publik.
Sistem pemetaan yang ada cenderung pasif
Banyak platform hanya menampilkan data tutupan lahan secara umum, belum dirancang sebagai sistem peringatan dini hiper-lokal untuk advokasi lapangan.
Validasi lapangan belum terdokumentasi dengan rapi
Hasil temuan lapangan seperti foto, catatan, status validasi, dan laporan perlu disimpan dalam sistem yang terstruktur.
5. Tujuan Sistem

Tujuan utama MANGROVE-EYE adalah membangun sistem MVP yang mampu:

Mengambil dan memproses citra Sentinel-2 untuk AOI Kwala Serapuh, khususnya kawasan KTH Nipah ±242 ha dan area konflik ±60–62 ha, melalui Google Earth Engine.
Menghitung indeks spektral yang relevan untuk mangrove, dengan penekanan utama pada MVI dan CMRI, serta menggunakan NDVI dan NDWI sebagai indeks pendukung.
Membandingkan kondisi before-after pada periode waktu tertentu.
Menghasilkan hotspot dugaan perubahan tutupan mangrove.
Menyimpan data hotspot dan geometri spasial ke PostgreSQL/PostGIS.
Menampilkan hasil analisis pada dashboard WebGIS berbasis React Leaflet.
Menyediakan alur validasi lapangan oleh pengguna berwenang.
Menyediakan laporan PDF sebagai dokumen ringkas untuk advokasi atau tindak lanjut.
Melindungi data koordinat detail melalui role-based access control.
Menjadi dasar teknis yang kuat untuk esai lomba nasional dan pengembangan sistem lanjutan.
6. Target Pengguna
6.1 Pengguna Utama
Pengguna	Kebutuhan Utama
KTH Nipah / masyarakat lokal	Mengetahui titik dugaan kerusakan dan melakukan validasi lapangan
NGO / pendamping advokasi	Mengakses data perubahan spasial dan membuat laporan pendukung
Admin sistem	Mengelola AOI, hasil analisis, hotspot, user, role, dan laporan
Validator lapangan	Memverifikasi hotspot dengan foto, catatan, dan status validasi
6.2 Pengguna Sekunder
Pengguna	Kebutuhan Utama
Dinas LHK / KPH	Melihat lokasi prioritas patroli dan hasil validasi
Aparat penegak hukum / regulator	Menerima laporan awal berbasis data spasial
Publik / media lingkungan	Melihat informasi umum tanpa membuka koordinat sensitif
Tim pengembang / peneliti	Mengembangkan workflow GEE, API, database, dan dashboard
7. Stakeholder
Stakeholder	Peran dalam Sistem
KTH Nipah	Pemilik konteks lapangan, pengguna validasi, penerima manfaat utama
Masyarakat nelayan	Kelompok terdampak langsung dari kerusakan mangrove
WALHI / NGO lingkungan	Pendamping advokasi dan pengguna laporan PDF
Yayasan/komunitas konservasi	Pendukung validasi dan penguatan data lapangan
Dinas LHK / KPH	Pihak teknis kehutanan yang dapat menindaklanjuti laporan
KLHK / BPSKL / BPKH	Sumber data legal/spasial dan otoritas kehutanan
Aparat penegak hukum	Penerima laporan awal untuk investigasi lanjutan
Tim pengembang	Pengelola teknis sistem dan dokumentasi
8. Scope Sistem
8.1 Scope MVP

MVP MANGROVE-EYE berfokus pada:

Satu wilayah studi: Kwala Serapuh / kawasan KTH Nipah ±242 ha, dengan fokus pengamatan lebih intensif pada area konflik ±60–62 ha yang batas spasial finalnya masih perlu dikunci dalam GeoJSON/Shapefile.
Pengolahan citra Sentinel-2 melalui Google Earth Engine.
Perhitungan indeks MVI dan CMRI sebagai indeks utama deteksi mangrove, dengan NDVI dan NDWI sebagai indeks pendukung.
Analisis before-after berbasis periode waktu.
Deteksi hotspot dugaan penurunan tutupan mangrove.
Penyimpanan hotspot ke PostgreSQL/PostGIS.
Dashboard WebGIS berbasis React Leaflet.
Detail hotspot dalam popup.
Validasi lapangan oleh user berwenang.
Export laporan PDF sederhana.
Role-based access control untuk membedakan akses publik dan internal.
8.2 Di Luar Scope MVP

Hal berikut tidak menjadi kewajiban MVP awal:

Segmentasi U-Net atau AI segmentation production-ready.
Training model deep learning, penyusunan dataset anotasi besar, dan deployment model AI sebagai komponen produksi.
Integrasi Sentinel-1 SAR.
Aplikasi mobile native.
Notifikasi WhatsApp/Telegram otomatis.
Realtime monitoring penuh setiap hari.
Cakupan seluruh pesisir Sumatera Utara.
Sistem legal case management lengkap.
Integrasi langsung dengan sistem pemerintah.
Pembuktian hukum final tanpa verifikasi lapangan.
9. Fitur Utama Sistem
9.1 Dashboard WebGIS

Dashboard WebGIS menjadi pusat visualisasi data. Pengguna dapat melihat:

peta area Kwala Serapuh;
batas AOI;
layer citra satelit;
layer indeks spektral;
hotspot dugaan kerusakan;
popup detail hotspot;
status validasi;
statistik ringkas;
before-after comparison.
9.2 Analisis Citra Satelit via GEE

Google Earth Engine digunakan sebagai mesin analisis utama pada MVP, dengan proses awal yang dapat dijalankan secara manual atau semi-manual oleh admin/pengembang untuk

mengambil citra Sentinel-2;
filter area berdasarkan AOI;
filter tanggal;
filter awan;
membuat komposit citra;
menghitung MVI dan CMRI sebagai indeks utama, serta NDVI dan NDWI sebagai indeks pendukung;
membandingkan periode before-after;
menghasilkan data perubahan berbasis periode before-after yang ditentukan oleh admin;
mengekspor hasil ke format yang dapat digunakan sistem.
9.3 Hotspot Detection

Hotspot adalah lokasi dugaan perubahan tutupan mangrove berdasarkan hasil analisis indeks spektral, terutama perubahan pada MVI/CMRI yang diperkuat oleh pembacaan NDVI/NDWI.

Data hotspot minimal berisi informasi spasial, nilai indeks, status validasi, dan metadata analisis agar dapat ditindaklanjuti sebagai indikasi awal di lapangan:

ID hotspot;
tanggal deteksi;
lokasi titik pusat;
geometri area terdampak;
estimasi luas;
nilai indeks before;
nilai indeks after;
delta perubahan;
tingkat prioritas;
status validasi.
9.4 Before-After Visualization

Sistem menyediakan tampilan perbandingan before-after berdasarkan periode yang ditentukan oleh admin untuk membantu pengguna memahami perubahan tutupan mangrove secara visual.

Contoh:
citra periode awal;
citra periode terbaru;
layer indeks sebelum, terutama MVI/CMRI;
layer indeks sesudah, terutama MVI/CMRI;
layer perubahan;
slider perbandingan.
9.5 Validasi Lapangan

Output satelit tidak dianggap sebagai bukti final. Karena itu, sistem harus menyediakan modul validasi.

Validator dapat:

membuka detail hotspot;
melihat koordinat;
melihat estimasi area terdampak;
mengunggah foto lapangan;
menulis catatan;
mengubah status validasi;
menyimpan bukti geotag;
menandai hotspot sebagai valid, tidak valid, atau perlu pengecekan ulang.
9.6 Export Laporan PDF

Sistem menyediakan export laporan PDF untuk mendukung advokasi dan tindak lanjut.

Isi laporan minimal:

judul laporan;
tanggal deteksi;
peta lokasi;
ringkasan hotspot;
estimasi luas terdampak;
nilai indeks before-after;
hasil validasi lapangan;
foto bukti jika tersedia;
catatan validator;
disclaimer bahwa laporan merupakan indikasi awal, bukan vonis hukum final.
9.7 Role-Based Access Control

Sistem harus membedakan hak akses pengguna.

Contoh role awal:

Role	Hak Akses
Public Viewer	Melihat dashboard umum tanpa koordinat presisi
Validator Lapangan	Melihat koordinat detail dan mengisi validasi
NGO / Advocate	Melihat hasil validasi dan export laporan
Admin	Mengelola data sistem, user, AOI, hotspot, laporan
Super Admin	Akses penuh termasuk konfigurasi teknis
10. Fitur MVP

Fitur yang wajib ada pada MVP:

Login dan manajemen role dasar.
Import/simpan AOI dalam format GeoJSON.
Menjalankan atau menerima hasil analisis GEE untuk AOI tertentu.
Menyimpan hasil analysis run.
Menyimpan hotspot sebagai point/polygon PostGIS.
Menampilkan peta interaktif React Leaflet.
Menampilkan layer AOI.
Menampilkan marker/polygon hotspot.
Menampilkan popup detail hotspot.
Menampilkan statistik ringkas:
jumlah hotspot;
total estimasi luas terdampak;
jumlah hotspot berdasarkan status validasi.
Menyediakan before-after layer sederhana.
Menyediakan form validasi lapangan.
Upload foto validasi.
Status validasi hotspot:
detected;
under_review;
validated;
rejected;
needs_recheck.
Export PDF per hotspot atau per analysis run.
Pembatasan koordinat sensitif berdasarkan role.
11. Fitur Non-MVP / Tahap Lanjutan

Fitur lanjutan:

Segmentasi U-Net untuk pemetaan area mangrove secara lebih presisi.
Training dataset berbasis tile Sentinel-2.
Integrasi Sentinel-1 SAR untuk mengurangi masalah awan.
Otomasi scheduler analisis berkala.
Notifikasi WhatsApp/Telegram saat hotspot baru muncul.
Mobile-friendly field validation mode.
Offline field validation.
Integrasi data drone atau foto udara.
Multi-AOI untuk wilayah pesisir lain.
Dashboard tren multi-tahun.
Sistem rekomendasi prioritas patroli.
Case management untuk proses advokasi hukum.
Public transparency portal dengan data yang sudah digeneralisasi.
12. Alur Kerja Sistem Secara Umum
12.1 Alur Analisis Satelit
Admin menentukan AOI Kwala Serapuh, khususnya kawasan KTH Nipah ±242 ha dan/atau area konflik ±60–62 ha yang sudah tersedia dalam bentuk GeoJSON/Shapefile atau hasil digitasi sementara.
Admin menentukan periode before-after, lalu GEE mengambil citra Sentinel-2 berdasarkan AOI dan periode waktu tersebut.
GEE melakukan filter awan dan membuat komposit citra.
GEE menghitung MVI dan CMRI sebagai indeks utama, serta NDVI dan NDWI sebagai indeks pendukung.
GEE membandingkan periode before dan after.
GEE menghasilkan area perubahan yang melewati threshold.
Hasil dikonversi menjadi hotspot point/polygon.
Data hotspot dari hasil GEE dikirim atau diimpor ke backend Laravel secara manual/semi-manual pada fase MVP awal.
Laravel menyimpan data ke PostgreSQL/PostGIS.
Dashboard React menampilkan hasil pada peta.
12.2 Alur Validasi Lapangan
Validator login ke dashboard.
Validator membuka daftar hotspot prioritas.
Validator memilih hotspot dan melihat detail lokasi.
Validator melakukan pengecekan lapangan.
Validator mengunggah foto dan catatan.
Validator mengubah status hotspot.
Sistem menyimpan validasi.
NGO/Admin dapat mengekspor laporan PDF.
12.3 Alur Akses Publik
Publik membuka dashboard umum.
Publik melihat ringkasan kondisi mangrove.
Publik melihat area perubahan secara general.
Publik tidak melihat koordinat detail atau data sensitif.
Publik dapat membaca ringkasan dampak dan status umum.
13. Kebutuhan Fungsional
13.1 Manajemen Pengguna dan Role
ID	Kebutuhan
FR-001	Sistem menyediakan autentikasi login.
FR-002	Sistem mendukung role user.
FR-003	Admin dapat membuat, mengedit, dan menonaktifkan user.
FR-004	Sistem membatasi akses fitur berdasarkan role.
FR-005	Koordinat detail hanya terlihat untuk role berwenang.
13.2 Manajemen AOI
ID	Kebutuhan
FR-006	Admin dapat menyimpan AOI dalam format GeoJSON.
FR-007	AOI disimpan sebagai geometry PostGIS.
FR-008	AOI memiliki metadata lokasi, nama, luas, dan status hukum.
FR-009	Dashboard dapat menampilkan batas AOI pada peta.
FR-010	Admin dapat mengaktifkan/nonaktifkan AOI.
13.3 Analysis Run
ID	Kebutuhan
FR-011	Sistem menyimpan riwayat analysis run.
FR-012	Analysis run memiliki periode before dan after.
FR-013	Analysis run menyimpan parameter indeks yang digunakan.
FR-014	Analysis run menyimpan ringkasan hasil analisis.
FR-015	Admin dapat melihat daftar analysis run.
13.4 Hotspot
ID	Kebutuhan
FR-016	Sistem menyimpan hotspot hasil deteksi.
FR-017	Hotspot memiliki point centroid.
FR-018	Hotspot dapat memiliki polygon area terdampak.
FR-019	Hotspot menyimpan estimasi luas terdampak.
FR-020	Hotspot menyimpan nilai indeks before-after.
FR-021	Hotspot memiliki status validasi.
FR-022	Hotspot dapat ditampilkan di peta.
FR-023	Hotspot memiliki popup detail.
13.5 WebGIS Dashboard
ID	Kebutuhan
FR-024	Dashboard menampilkan peta interaktif.
FR-025	Dashboard menampilkan layer AOI.
FR-026	Dashboard menampilkan hotspot.
FR-027	Dashboard menampilkan layer before-after.
FR-028	Dashboard menampilkan statistik ringkas.
FR-029	Dashboard menyediakan filter berdasarkan tanggal, status, dan prioritas.
FR-030	Dashboard membedakan tampilan publik dan internal.
13.6 Validasi Lapangan
ID	Kebutuhan
FR-031	Validator dapat membuka detail hotspot.
FR-032	Validator dapat mengunggah foto lapangan.
FR-033	Validator dapat menulis catatan validasi.
FR-034	Validator dapat mengubah status hotspot.
FR-035	Sistem menyimpan waktu dan identitas validator.
FR-036	Sistem menyimpan koordinat validasi jika tersedia.
13.7 Laporan PDF
ID	Kebutuhan
FR-037	Sistem dapat membuat laporan PDF dari hotspot.
FR-038	Laporan memuat peta statis.
FR-039	Laporan memuat ringkasan indeks dan estimasi luas.
FR-040	Laporan memuat hasil validasi lapangan.
FR-041	Laporan memuat disclaimer indikasi awal.
FR-042	NGO/Admin dapat mengunduh laporan PDF.
14. Kebutuhan Non-Fungsional
14.1 Performance
Dashboard peta harus tetap ringan walaupun menampilkan layer spasial.
Layer raster sebaiknya ditampilkan sebagai tile, bukan file GeoTIFF besar.
Query geospasial harus memanfaatkan indeks PostGIS.
Data GeoJSON yang dikirim ke frontend harus dibatasi sesuai kebutuhan viewport dan role.
14.2 Security
Sistem menggunakan autentikasi.
Sistem menggunakan role-based access control.
Data koordinat detail dibatasi untuk role tertentu.
Upload foto harus divalidasi tipe dan ukuran file.
Endpoint API internal harus dilindungi.
Aktivitas penting perlu dicatat dalam audit log.
14.3 Reliability
Sistem harus tetap dapat membuka data analisis historis meskipun GEE sedang tidak dipanggil.
Hasil analysis run harus disimpan agar tidak bergantung pada kalkulasi ulang terus-menerus.
Export PDF harus tetap dapat dibuat dari data yang sudah tersimpan.
14.4 Maintainability
Kode backend dipisahkan berdasarkan domain:
AOI;
analysis run;
hotspot;
validation;
report;
user/role.
Dokumentasi API harus jelas.
Struktur database harus siap untuk pengembangan tahap lanjutan.
14.5 Usability
Dashboard harus mudah dipahami pengguna non-teknis.
Warna hotspot harus intuitif.
Popup harus ringkas.
Alur validasi tidak boleh terlalu panjang.
Laporan PDF harus menggunakan bahasa yang jelas.
14.6 Ethical and Legal Safety
Sistem tidak boleh mengklaim hasil deteksi sebagai vonis hukum final.
Sistem harus menulis disclaimer bahwa hasil adalah indikasi awal.
Data sensitif harus dilindungi.
Sistem harus mendukung validasi lapangan sebelum laporan digunakan untuk advokasi formal.
15. Kebutuhan Data
15.1 Data Spasial
Data	Format	Status
AOI KTH Nipah	GeoJSON / Shapefile	Perlu dikonfirmasi
Zona merah area konflik	GeoJSON / Polygon	Perlu dikonfirmasi
Batas administrasi desa	GeoJSON / OSM / RBI	Opsional
Hotspot point	PostGIS Point	Wajib MVP
Hotspot polygon	PostGIS Polygon/MultiPolygon	Wajib MVP
Data validasi lapangan	Foto + metadata + geometry	Wajib MVP
15.2 Data Satelit
Data	Sumber	Fungsi
Sentinel-2 Level-2A	Google Earth Engine	Dataset utama analisis
NDVI	Hasil kalkulasi GEE	Indeks vegetasi umum
NDWI	Hasil kalkulasi GEE	Indeks air/masking
MVI	Hasil kalkulasi GEE	Deteksi mangrove
CMRI	Hasil kalkulasi GEE	Pembedaan mangrove dan non-mangrove
Sentinel-1 SAR	GEE	Tahap lanjutan untuk awan
15.3 Data Aplikasi
Data	Fungsi
Users	Akun pengguna
Roles	Hak akses
AOI Areas	Area studi
Analysis Runs	Riwayat analisis
Satellite Layers	Metadata layer
Hotspots	Hasil deteksi
Hotspot Validations	Validasi lapangan
Reports	Laporan PDF
Audit Logs	Catatan aktivitas penting
16. Kebutuhan Keamanan dan Akses
16.1 Prinsip Akses

Sistem menggunakan model akses hybrid/RBAC, yaitu sebagian informasi dapat ditampilkan secara publik, tetapi data sensitif hanya dapat diakses oleh pihak internal atau berwenang

Publik hanya dapat melihat informasi umum, ringkasan kondisi, dan visualisasi yang sudah digeneralisasi.
Koordinat presisi hotspot, detail zona konflik, dan data validasi hanya dapat dilihat oleh role internal/berwenang.
Validasi lapangan hanya dapat dilakukan validator berwenang.
Export laporan lengkap hanya dapat dilakukan admin/NGO/role tertentu.
Konfigurasi teknis hanya dapat diakses admin/super admin.
16.2 Data Sensitif

Data yang dianggap sensitif:

koordinat presisi hotspot;
foto bukti lapangan;
identitas validator;
catatan lapangan tertentu;
polygon detail zona konflik;
dokumen laporan internal.
16.3 Strategi Perlindungan
Pembatasan response API berdasarkan role.
Generalisasi koordinat untuk public viewer.
Validasi upload file.
Audit log untuk perubahan status.
Pembatasan akses laporan PDF.
Penggunaan HTTPS pada deployment.
Backup database berkala.
17. Batasan Sistem
Sistem tidak dapat mendeteksi kerusakan jika citra tertutup awan tebal dalam periode panjang.
Sentinel-2 memiliki resolusi 10 meter, sehingga perubahan sangat kecil mungkin tidak terdeteksi.
Hasil indeks spektral, termasuk MVI dan CMRI, dapat dipengaruhi awan, bayangan awan, pasang surut, tanah basah, tambak, dan kondisi pesisir yang berubah secara temporal.
Hasil deteksi adalah indikasi awal, bukan bukti hukum final.
Threshold MVI/CMRI perlu dikalibrasi berdasarkan kondisi lokal Kwala Serapuh dan hasil validasi lapangan.
Data batas resmi AOI KTH Nipah perlu dikonfirmasi.
Validasi lapangan tetap diperlukan.
MVP hanya fokus pada Kwala Serapuh, khususnya AOI KTH Nipah ±242 ha dan area konflik ±60–62 ha, bukan seluruh wilayah Sumatera Utara.
U-Net tidak menjadi bagian wajib MVP awal.
Sistem tidak menggantikan kewenangan pemerintah atau aparat penegak hukum.
18. Asumsi
Tim memiliki akses ke Google Earth Engine.
Tim dapat menentukan AOI awal menggunakan GeoJSON hasil digitasi sementara atau data resmi, dengan catatan batas final AOI KTH Nipah ±242 ha dan area konflik ±60–62 ha masih perlu diverifikasi.
Citra Sentinel-2 cukup untuk MVP awal berbasis indeks spektral MVI/CMRI dan hotspot detection.
Pengguna internal bersedia melakukan validasi lapangan.
PostgreSQL/PostGIS dapat digunakan di lingkungan pengembangan.
React Leaflet cukup untuk kebutuhan visualisasi WebGIS MVP.
Laravel digunakan sebagai backend utama.
Laporan PDF dibutuhkan sebagai ringkasan hasil analisis dan/atau validasi lapangan, bukan dokumen legal final.
Koneksi internet tersedia untuk membuka dashboard.
Pengembangan dilakukan oleh tim kecil/mahasiswa sehingga proses GEE pada MVP awal dapat dijalankan manual/semi-manual sebelum otomatisasi penuh dikembangkan.
19. Risiko
Risiko	Dampak	Mitigasi
Tutupan awan tinggi	Analisis Sentinel-2 terganggu	Gunakan komposit temporal dan filter awan
Pasang surut memicu false positive	Hotspot salah deteksi	Gunakan kombinasi NDWI, MVI, CMRI dan validasi lapangan
AOI resmi belum tersedia	Analisis kurang presisi	Digitasi manual sementara, lalu konfirmasi ke sumber resmi
Threshold belum akurat	Deteksi tidak stabil	Kalibrasi bertahap dengan sampel lapangan
Koordinat bocor ke publik	Risiko keamanan lapangan	RBAC dan generalisasi koordinat
Laporan dianggap vonis hukum	Overclaim	Tambahkan disclaimer indikasi awal
Validasi lapangan minim	Data tidak kuat	Buat alur validasi sederhana dan prioritas hotspot
Sistem terlalu kompleks	MVP gagal selesai	Tunda U-Net dan fitur non-esensial
Server lambat saat memuat raster	UX buruk	Gunakan raster tile, bukan GeoTIFF penuh
Serangan atau penyalahgunaan akses	Data sensitif bocor	Auth, RBAC, audit log, backup
20. Indikator Keberhasilan

MVP dianggap berhasil apabila:

AOI Kwala Serapuh dapat dimuat di sistem.
Workflow GEE dapat menghasilkan indeks NDVI, NDWI, MVI, dan CMRI.
Sistem dapat membandingkan periode before-after.
Sistem dapat menghasilkan minimal satu set data hotspot dari hasil analisis.
Hotspot dapat disimpan di PostgreSQL/PostGIS.
Hotspot dapat ditampilkan di React Leaflet.
Popup hotspot menampilkan informasi penting.
Role publik dan internal memiliki perbedaan akses.
Validator dapat mengisi hasil validasi lapangan.
Sistem dapat menghasilkan laporan PDF dari hotspot.
Dokumentasi teknis cukup jelas untuk dilanjutkan ke MVP Scope, ERD, GEE Workflow, API Contract, UI Plan, dan Development Task List.
Sistem dapat dijelaskan dalam esai sebagai solusi yang realistis, implementatif, dan tidak overclaim.
21. Roadmap Singkat
Fase 1 — Fondasi Dokumentasi dan Data
Menyusun PRD.
Menyusun MVP Scope.
Menyusun ERD.
Menentukan AOI awal.
Mengumpulkan/digitasi GeoJSON.
Fase 2 — GEE Prototype
Mengambil Sentinel-2.
Menghitung MVI dan CMRI sebagai indeks utama, serta NDVI dan NDWI sebagai indeks pendukung.
Membuat before-after comparison.
Membuat hotspot awal berdasarkan perubahan indeks MVI/CMRI pada periode before-after yang ditentukan.
Export GeoJSON/static image.
Fase 3 — WebGIS MVP
Setup Laravel.
Setup PostgreSQL/PostGIS.
Setup React Leaflet.
Menampilkan AOI dan hotspot.
Membuat detail popup.
Menyimpan analysis run.
Fase 4 — Validasi dan Laporan
Membuat modul validasi lapangan.
Upload foto bukti.
Status validasi.
Export laporan PDF.
Implementasi RBAC.
Fase 5 — Pengembangan Lanjutan
Kalibrasi threshold.
Integrasi Sentinel-1 SAR.
Dataset training U-Net.
Eksperimen AI segmentation/U-Net sebagai tahap lanjutan setelah dataset, validasi, dan baseline indeks spektral MVP terbentuk.
Notifikasi otomatis.
Ekspansi ke wilayah pesisir lain.
22. Perlu Dikonfirmasi

Sebelum lanjut ke implementasi penuh, hal berikut perlu dikonfirmasi:

Apakah AOI resmi KTH Nipah 242 ha tersedia dalam Shapefile/GeoJSON?
Apakah zona merah 60–62 ha bisa dipetakan secara presisi?
Siapa saja role pengguna final yang akan dibuat pada MVP?
Apakah public dashboard tetap dibuka atau hanya dashboard internal?
Seberapa detail koordinat yang boleh tampil untuk publik?
Apakah export PDF dibuat per hotspot atau per analysis run?
Apakah validasi lapangan wajib menyertakan foto geotag?
Threshold awal MVI/CMRI akan memakai nilai berapa?
Periode before-after default yang akan digunakan:
bulanan;
triwulan;
tahunan;
atau manual?
Apakah GEE dijalankan manual dahulu atau langsung dijadwalkan otomatis?
Apakah laporan PDF perlu mengikuti format tertentu dari NGO/pemerintah?
Apakah sistem awal akan menggunakan hosting lokal, VPS, atau platform cloud?
23. Kesimpulan PRD

MANGROVE-EYE dirancang sebagai sistem peringatan dini berbasis data satelit dan WebGIS untuk membantu mendeteksi dugaan deforestasi mangrove ilegal di Kwala Serapuh. MVP sistem harus realistis, ringan, dan dapat dibangun oleh tim kecil, sehingga pendekatan awal difokuskan pada Google Earth Engine, Sentinel-2, indeks CMRI/MVI, hotspot detection, PostgreSQL/PostGIS, React Leaflet, validasi lapangan, export PDF, dan RBAC.

U-Net dan AI segmentation tetap penting sebagai roadmap, tetapi tidak menjadi kewajiban MVP awal. Fokus utama MVP adalah membuktikan bahwa data satelit dapat diubah menjadi informasi spasial yang dapat dipahami, diverifikasi, dan digunakan untuk mendukung advokasi lingkungan secara lebih cepat dan aman.