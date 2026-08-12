# PRD MANGROVE-EYE

## 1. Informasi Dokumen

| Item | Keterangan |
| --- | --- |
| Nama Sistem | MANGROVE-EYE |
| Jenis Sistem | WebGIS / Spatial Intelligence Dashboard / Early Warning System |
| Fokus Masalah | Deteksi dini dugaan deforestasi mangrove ilegal |
| Lokasi Studi Kasus | Kwala Serapuh, Kecamatan Tanjung Pura, Kabupaten Langkat, Sumatera Utara |
| Versi Dokumen | v1.1 |
| Status | Revisi PRD untuk MVP + Redesign UI/UX |
| Target Penyimpanan | docs/PRD.md |
| Stack Utama | Laravel + React + PostgreSQL/PostGIS + Google Earth Engine |
| UI Internal | shadcn/ui + Tailwind CSS |
| UI Landing Page | Referensi dari ReactBits, Vengence UI, Animate UI, Uiverse, Uilora, AnimMasterLib, dan Skiper UI |
| Prinsip Dashboard | Map-first, page-per-page, security-aware, tidak card-first |

---

## 2. Ringkasan Produk

MANGROVE-EYE adalah sistem WebGIS berbasis Laravel, React, PostgreSQL/PostGIS, dan Google Earth Engine untuk membantu mendeteksi dini dugaan deforestasi mangrove ilegal di kawasan Kwala Serapuh, Kecamatan Tanjung Pura, Kabupaten Langkat, Sumatera Utara.

Sistem ini menggunakan citra satelit Sentinel-2 yang diproses melalui Google Earth Engine untuk menghitung indeks spektral utama MVI dan CMRI, dengan NDVI dan NDWI sebagai indeks pendukung. Hasil analisis digunakan untuk mendeteksi perubahan tutupan mangrove pada AOI KTH Nipah ±242 hektare dan area konflik ±60–62 hektare.

Output utama sistem adalah hotspot dugaan perubahan tutupan mangrove, dashboard WebGIS, validasi lapangan, upload foto bukti, serta laporan PDF untuk mendukung advokasi atau tindak lanjut oleh pihak berwenang.

MANGROVE-EYE tidak dimaksudkan sebagai sistem yang langsung memvonis suatu area telah mengalami pelanggaran hukum. Sistem ini berperan sebagai instrumen penilaian awal atau early assessment tool. Setiap hotspot tetap perlu diverifikasi melalui validasi lapangan.

Dalam revisi PRD ini, MANGROVE-EYE tidak hanya difokuskan pada fungsi backend dan WebGIS, tetapi juga pada perombakan UI/UX agar sistem terlihat profesional, rapi, dan tidak tampak seperti template AI. Struktur internal setelah login harus dibuat terpisah page per page, sedangkan landing page dibuat lebih visual dan modern menggunakan referensi website/library yang telah ditentukan.

---

## 3. Latar Belakang

Kawasan mangrove di Kwala Serapuh memiliki nilai ekologis, sosial, dan ekonomi yang penting bagi masyarakat pesisir. Mangrove berfungsi sebagai pelindung abrasi, habitat biota pesisir, penyerap karbon biru, serta penopang mata pencaharian nelayan.

Namun, pengawasan kawasan mangrove secara manual memiliki banyak keterbatasan. Area pesisir dan rawa sulit dijangkau, patroli membutuhkan waktu dan biaya, serta informasi kerusakan sering terlambat diketahui. Dalam kasus konflik lahan, masyarakat dan aktivis lingkungan juga dapat menghadapi risiko intimidasi ketika melakukan pemantauan langsung.

Karena itu, diperlukan sistem yang dapat memberikan peringatan dini berbasis data satelit. MANGROVE-EYE dirancang untuk menjembatani data satelit, analisis indeks spektral, penyimpanan data spasial, visualisasi WebGIS, validasi lapangan, dan laporan PDF dalam satu alur yang implementatif.

Selain masalah teknis, sistem juga perlu memiliki tampilan yang kredibel. Antarmuka yang buruk, terlalu ramai, atau terlihat seperti template AI dapat menurunkan kepercayaan pengguna. Oleh karena itu, UI/UX MANGROVE-EYE harus dirancang ulang agar terasa seperti spatial intelligence dashboard yang profesional, bukan sekadar aplikasi demo.

---

## 4. Masalah yang Ingin Diselesaikan

Masalah utama yang ingin diselesaikan oleh MANGROVE-EYE adalah:

### 4.1 Pemantauan Manual Tidak Efisien

Kawasan mangrove sulit dipantau secara rutin hanya dengan patroli darat. Area yang luas, rawa, dan akses lapangan yang terbatas membuat kerusakan sering tidak terdeteksi cepat.

### 4.2 Kerusakan Sering Terlambat Diketahui

Deforestasi, pembukaan lahan, atau konversi menjadi kebun sawit dapat terjadi lebih cepat daripada proses pelaporan manual.

### 4.3 Kurangnya Bukti Spasial Awal

Laporan masyarakat sering membutuhkan data pendukung berupa lokasi, perubahan visual, estimasi area terdampak, dan bukti awal yang dapat dipahami oleh pihak eksternal.

### 4.4 Data Koordinat Sensitif Berisiko Disalahgunakan

Koordinat detail hotspot, polygon zona konflik, foto validasi, dan catatan validator tidak boleh dibuka penuh kepada publik karena dapat membahayakan masyarakat lokal dan aktivis lingkungan.

### 4.5 Sistem Pemetaan yang Ada Cenderung Pasif

Banyak platform hanya menampilkan data tutupan lahan secara umum, belum dirancang sebagai sistem peringatan dini hiper-lokal yang mendukung advokasi lapangan.

### 4.6 Validasi Lapangan Belum Terdokumentasi Rapi

Hasil temuan lapangan seperti foto, catatan, status validasi, confidence, dan laporan perlu disimpan dalam sistem yang terstruktur.

### 4.7 UI/UX Sistem Masih Belum Layak untuk Demo Serius

Tampilan sistem saat ini masih perlu dirombak agar lebih profesional, rapi, tidak terlihat seperti buatan AI, dan lebih mudah digunakan oleh pengguna non-teknis.

### 4.8 Fitur Internal Terlalu Berisiko Jika Ditumpuk dalam Satu Dashboard

Semua fitur internal tidak boleh dijejalkan dalam satu halaman dashboard. Fitur seperti AOI, Analysis Run, Hotspot, Validasi, Report, User Management, Audit Log, dan Settings harus dipisah ke halaman masing-masing agar alur kerja lebih jelas.

---

## 5. Tujuan Sistem

Tujuan utama MANGROVE-EYE adalah membangun sistem MVP yang mampu:

1. Mengambil dan memproses citra Sentinel-2 untuk AOI Kwala Serapuh melalui Google Earth Engine.
2. Menghitung indeks spektral utama MVI dan CMRI.
3. Menggunakan NDVI dan NDWI sebagai indeks pendukung.
4. Membandingkan kondisi before-after pada periode waktu tertentu.
5. Menghasilkan hotspot dugaan perubahan tutupan mangrove.
6. Menyimpan data hotspot dan geometri spasial ke PostgreSQL/PostGIS.
7. Menampilkan hasil analisis pada dashboard WebGIS berbasis React Leaflet.
8. Menyediakan validasi lapangan oleh pengguna berwenang.
9. Menyediakan upload foto validasi melalui endpoint terproteksi.
10. Menyediakan laporan PDF sebagai dokumen ringkas untuk advokasi atau tindak lanjut.
11. Melindungi data koordinat detail melalui role-based access control.
12. Menyediakan landing page publik yang menarik, modern, dan layak untuk presentasi lomba.
13. Menyediakan internal app setelah login yang terstruktur page per page.
14. Menggunakan shadcn/ui sebagai komponen utama untuk seluruh halaman internal.
15. Menjadi dasar teknis yang kuat untuk esai lomba nasional dan pengembangan sistem lanjutan.

---

## 6. Target Pengguna

### 6.1 Pengguna Utama

| Pengguna | Kebutuhan Utama |
| --- | --- |
| KTH Nipah / masyarakat lokal | Mengetahui titik dugaan kerusakan dan melakukan validasi lapangan |
| Validator lapangan | Memverifikasi hotspot dengan foto, catatan, koordinat, dan status validasi |
| NGO / pendamping advokasi | Mengakses data perubahan spasial dan membuat laporan pendukung |
| Admin sistem | Mengelola AOI, analysis run, hotspot, user, role, report, dan audit |
| Super Admin | Mengelola seluruh konfigurasi sistem dan keamanan |

### 6.2 Pengguna Sekunder

| Pengguna | Kebutuhan Utama |
| --- | --- |
| Dinas LHK / KPH | Melihat lokasi prioritas patroli dan hasil validasi |
| Aparat penegak hukum / regulator | Menerima laporan awal berbasis data spasial |
| Publik / media lingkungan | Melihat informasi umum tanpa membuka koordinat sensitif |
| Tim pengembang / peneliti | Mengembangkan workflow GEE, API, database, dan dashboard |

---

## 7. Stakeholder

| Stakeholder | Peran dalam Sistem |
| --- | --- |
| KTH Nipah | Pemilik konteks lapangan, pengguna validasi, penerima manfaat utama |
| Masyarakat nelayan | Kelompok terdampak langsung dari kerusakan mangrove |
| WALHI / NGO lingkungan | Pendamping advokasi dan pengguna laporan PDF |
| Yayasan/komunitas konservasi | Pendukung validasi dan penguatan data lapangan |
| Dinas LHK / KPH | Pihak teknis kehutanan yang dapat menindaklanjuti laporan |
| KLHK / BPSKL / BPKH | Sumber data legal/spasial dan otoritas kehutanan |
| Aparat penegak hukum | Penerima laporan awal untuk investigasi lanjutan |
| Tim pengembang | Pengelola teknis sistem dan pengembangan lanjutan |
| Publik | Penerima informasi umum dan edukasi lingkungan |

---

## 8. Scope Sistem

### 8.1 Scope MVP

MVP MANGROVE-EYE mencakup:

1. Landing page publik.
2. Public dashboard dengan data tergeneralisasi.
3. Login internal.
4. Dashboard WebGIS internal.
5. Manajemen AOI.
6. Manajemen analysis run.
7. Import hasil GEE berupa GeoJSON.
8. Manajemen hotspot.
9. Filter dan layer WebGIS.
10. Detail hotspot.
11. Validasi lapangan.
12. Upload foto validasi.
13. Gallery foto validasi internal.
14. Generate dan download laporan PDF.
15. User management dan role/permission.
16. Audit log aktivitas penting.
17. Security hardening untuk data sensitif.
18. Redesign UI/UX internal menggunakan shadcn/ui.
19. Struktur fitur internal page per page.

### 8.2 Di Luar Scope MVP

Fitur berikut tidak dikerjakan pada MVP awal:

1. U-Net production-ready.
2. Training model AI.
3. Sentinel-1 SAR workflow.
4. Scheduler otomatis penuh.
5. Notifikasi WhatsApp/Telegram.
6. Aplikasi mobile native.
7. Offline validation.
8. Multi-AOI nasional.
9. Legal case management.
10. Integrasi langsung dengan API KLHK.
11. Integrasi live tile GEE interaktif.
12. Real-time collaborative editing.
13. Manajemen dokumen hukum lengkap.

### 8.3 Keputusan Scope UI/UX Terbaru

Keputusan UI/UX terbaru yang wajib diikuti:

1. Semua komponen UI utama setelah login wajib menggunakan shadcn/ui.
2. Internal app tidak boleh menggunakan ReactBits, Vengence UI, Animate UI, Uiverse, Uilora, AnimMasterLib, atau Skiper UI sebagai komponen utama.
3. Library eksternal visual dari daftar tersebut hanya digunakan untuk landing page.
4. Fitur setelah login harus dipisah page per page.
5. Dashboard internal tetap map-first, tetapi tidak boleh menjadi tempat semua fitur ditumpuk.
6. Public dashboard tetap harus aman dan tidak boleh menampilkan data sensitif.
7. Landing page boleh dibuat lebih visual dan interaktif, tetapi tetap harus relevan dengan tema MANGROVE-EYE.
8. UI tidak boleh terlihat seperti template AI generik.

---

## 9. Struktur Halaman Sistem

### 9.1 Halaman Publik

| Halaman | Fungsi |
| --- | --- |
| Landing Page | Menjelaskan masalah, solusi, alur sistem, fitur utama, dampak, dan CTA |
| Public Dashboard | Menampilkan peta umum dengan hotspot tergeneralisasi |
| Login Page | Akses masuk pengguna internal |

### 9.2 Halaman Internal Setelah Login

| Halaman | Fungsi |
| --- | --- |
| Internal Dashboard WebGIS | Pusat pemantauan peta, hotspot, layer, filter, dan ringkasan |
| Hotspots | Daftar dan pengelolaan hotspot |
| Hotspot Detail | Detail hotspot, indeks, status, validasi, dan report terkait |
| AOI Management | Kelola Area of Interest |
| Analysis Runs | Kelola riwayat analisis GEE |
| GEE Imports | Kelola import hasil GeoJSON dari Google Earth Engine |
| Field Validations | Kelola validasi lapangan |
| Validation Photos | Lihat bukti foto validasi internal |
| Reports | Generate, list, dan download laporan PDF |
| Users & Roles | Kelola user, role, dan permission |
| Audit Logs | Lihat log aktivitas penting |
| Settings / Profile | Pengaturan akun dan profil pengguna |

### 9.3 Prinsip Page per Page

Setiap fitur utama harus memiliki halaman atau modul yang jelas. Dashboard tidak boleh menjadi satu halaman raksasa yang memuat seluruh fitur.

Dashboard hanya boleh memuat:

1. Peta utama.
2. Ringkasan metrik.
3. Filter dan layer penting.
4. Hotspot terpilih.
5. Shortcut aksi penting.

Fitur detail seperti report list, user management, audit log, dan manajemen AOI harus dipisah ke halaman masing-masing.

---

## 10. Ketentuan UI/UX

### 10.1 Internal App

Internal app adalah semua halaman setelah login.

Ketentuan internal app:

1. Wajib menggunakan shadcn/ui sebagai basis komponen.
2. Styling menggunakan Tailwind CSS.
3. Ikon dapat menggunakan lucide-react karena umum dipakai dalam ekosistem shadcn.
4. Komponen seperti Button, Card, Dialog, Sheet, Tabs, Select, Table, Badge, Tooltip, Dropdown Menu, Accordion, Alert, Form, Input, Textarea, Checkbox, Switch, dan Toast harus mengikuti pola shadcn/ui.
5. Tidak boleh menggunakan library UI dekoratif lain untuk internal app.
6. Tidak boleh membuat desain card-grid besar yang menutupi peta.
7. Tidak boleh memakai animasi berlebihan di atas peta.
8. Tidak boleh membuat marker Leaflet menggunakan animasi berat.
9. Semua halaman internal harus konsisten secara layout, warna, spacing, radius, dan komponen.

### 10.2 Landing Page

Landing page adalah halaman publik utama untuk memperkenalkan MANGROVE-EYE.

Ketentuan landing page:

1. Landing page boleh menggunakan referensi visual dari:
   - ReactBits
   - Vengence UI
   - Animate UI
   - Uiverse
   - Uilora
   - AnimMasterLib
   - Skiper UI
2. Landing page tidak menggunakan library di luar daftar tersebut.
3. Landing page boleh lebih visual, modern, interaktif, dan menarik.
4. Landing page tetap harus menjaga konteks lingkungan, WebGIS, dan advokasi.
5. Landing page tidak boleh membocorkan data sensitif.
6. Landing page tidak boleh menampilkan raw GeoJSON, koordinat presisi, foto validasi, catatan validator, atau laporan internal.
7. Efek visual boleh digunakan, tetapi tidak boleh membuat halaman berat atau mengganggu performa.
8. Landing page harus tetap profesional dan cocok untuk presentasi lomba nasional.

### 10.3 Public Dashboard

Public dashboard adalah tampilan peta publik yang hanya menampilkan data aman.

Ketentuan public dashboard:

1. Menggunakan public API.
2. Menampilkan generalized centroid atau coarse point.
3. Tidak menampilkan polygon detail.
4. Tidak menampilkan koordinat presisi.
5. Tidak menampilkan foto validasi.
6. Tidak menampilkan catatan validator.
7. Tidak menampilkan laporan PDF internal.
8. Tidak menampilkan raw properties atau raw GeoJSON.
9. Wajib menampilkan disclaimer bahwa data adalah indikasi awal.

### 10.4 Prinsip Visual

UI MANGROVE-EYE harus memberi kesan:

1. Profesional.
2. Bersih.
3. Tenang.
4. Spasial.
5. Ilmiah.
6. Dapat dipercaya.
7. Cocok untuk advokasi lingkungan.
8. Tidak berlebihan.
9. Tidak seperti template AI generik.
10. Tidak seperti game atau dashboard SaaS promosi.

---

## 11. Fitur Utama Sistem

### 11.1 Landing Page

Landing page berfungsi untuk menjelaskan sistem kepada publik, juri lomba, calon mitra, dan pihak yang belum login.

Konten minimal landing page:

1. Hero section MANGROVE-EYE.
2. Penjelasan masalah mangrove Kwala Serapuh.
3. Penjelasan solusi WebGIS + GEE + validasi lapangan.
4. Alur kerja sistem.
5. Fitur utama.
6. Keunggulan sistem.
7. Dampak sosial-ekologis.
8. Disclaimer data.
9. CTA ke public dashboard.
10. CTA login internal.

### 11.2 Public Dashboard

Public dashboard menampilkan informasi umum terkait deteksi dini tanpa membuka data sensitif.

Fitur minimal:

1. Peta umum.
2. Hotspot tergeneralisasi.
3. Ringkasan jumlah hotspot.
4. Estimasi luas terdampak.
5. Status umum analisis terbaru.
6. Disclaimer.
7. Informasi bahwa data detail hanya tersedia untuk pengguna berwenang.

### 11.3 Internal Dashboard WebGIS

Dashboard internal adalah pusat pemantauan peta.

Fitur minimal:

1. Peta React Leaflet.
2. AOI layer.
3. Hotspot polygon.
4. Hotspot centroid jika tersedia.
5. Filter priority.
6. Filter validation status.
7. Filter tanggal.
8. Filter area.
9. Layer control.
10. Legend.
11. Fit to AOI.
12. Fit to all hotspots.
13. Popup hotspot.
14. Drawer ringkas hotspot.
15. Shortcut ke halaman detail hotspot.

Dashboard internal tidak boleh memuat seluruh fitur administrasi dalam satu halaman.

### 11.4 Manajemen AOI

Admin dapat mengelola Area of Interest.

Fitur minimal:

1. List AOI.
2. Detail AOI.
3. Create AOI.
4. Edit metadata AOI.
5. Import GeoJSON.
6. Aktif/nonaktifkan AOI.
7. Status verifikasi AOI: draft, verified, needs_revision.
8. Tampilkan AOI pada peta internal.

### 11.5 Analysis Run

Analysis run menyimpan riwayat proses analisis before-after.

Fitur minimal:

1. List analysis run.
2. Detail analysis run.
3. Create analysis run.
4. Edit metadata analysis run.
5. Status analysis run.
6. Parameter before-after.
7. Jumlah hotspot.
8. Total area hotspot.
9. Relasi ke GEE import dan report.

### 11.6 GEE Import

GEE import menerima hasil analisis dari Google Earth Engine.

Fitur minimal:

1. Upload/import GeoJSON hotspot.
2. Validasi format FeatureCollection.
3. Validasi geometry Polygon/MultiPolygon.
4. Simpan hotspot ke PostGIS.
5. Simpan metadata import.
6. Simpan ringkasan import.
7. Update analysis run summary.

### 11.7 Hotspot Management

Hotspot adalah indikasi awal perubahan tutupan mangrove.

Fitur minimal:

1. List hotspot.
2. Detail hotspot.
3. Peta lokasi hotspot.
4. Nilai MVI before, after, delta.
5. Nilai CMRI before, after, delta.
6. Nilai NDVI dan NDWI pendukung.
7. Area hektare.
8. Centroid.
9. Priority.
10. Validation status.
11. Update status oleh user berwenang.
12. Relasi ke field validation dan report.

### 11.8 Field Validation

Field validation digunakan untuk mencatat hasil pengecekan lapangan.

Fitur minimal:

1. Form validasi lapangan.
2. Status validasi.
3. Observed condition.
4. Confidence score.
5. Catatan validator.
6. Waktu kunjungan.
7. Sensitivity level.
8. Input koordinat manual.
9. Ambil lokasi dari browser.
10. Update validasi existing.
11. Riwayat validasi per hotspot.

### 11.9 Validation Photo

Validation photo digunakan untuk mengunggah bukti lapangan.

Fitur minimal:

1. Upload foto.
2. Preview sebelum upload.
3. Caption.
4. Taken at.
5. Optional photo coordinate.
6. Gallery foto internal.
7. Endpoint file terproteksi.
8. Hanya user berwenang yang bisa membuka file.

### 11.10 Report PDF

Report PDF digunakan sebagai dokumen ringkas untuk advokasi atau tindak lanjut.

Fitur minimal:

1. Generate PDF per hotspot.
2. Generate PDF analysis run.
3. Opsi include validation photos.
4. Opsi include precise coordinates.
5. Disclaimer wajib.
6. List report terbaru.
7. Download report.
8. File report disimpan pada private storage.
9. Report hanya dapat diakses oleh user berwenang.

### 11.11 User and Role Management

Admin dan super admin dapat mengelola user dan role.

Fitur minimal:

1. List user.
2. Create user.
3. Edit user.
4. Aktif/nonaktifkan user.
5. Assign role.
6. Assign permission jika diperlukan.
7. Cegah user tanpa izin mengakses fitur sensitif.

### 11.12 Audit Log

Audit log mencatat aktivitas penting sistem.

Aktivitas yang perlu dicatat:

1. Login.
2. Import GEE.
3. Create/update AOI.
4. Create/update analysis run.
5. Update hotspot status.
6. Create/update validation.
7. Upload/delete validation photo.
8. Generate/download report.
9. Perubahan user/role.
10. Akses file sensitif jika memungkinkan.

---

## 12. Role dan Hak Akses

### 12.1 Role MVP

| Role | Keterangan |
| --- | --- |
| Public Access | Akses tanpa login untuk landing page dan public dashboard |
| Validator | Melihat hotspot detail dan mengisi validasi lapangan |
| NGO Advocate | Melihat hasil validasi dan membuat/mengunduh laporan |
| Admin | Mengelola AOI, analysis run, hotspot, import, user, dan laporan |
| Super Admin | Akses penuh ke seluruh sistem |

Catatan:

Public access bukan role login. Publik tidak perlu akun.

### 12.2 Permission Utama

| Permission | Fungsi |
| --- | --- |
| view_internal_dashboard | Melihat dashboard internal |
| view_precise_coordinates | Melihat koordinat presisi |
| manage_aoi | Mengelola AOI |
| manage_analysis_runs | Mengelola analysis run |
| import_gee_result | Import hasil GEE |
| view_hotspot | Melihat hotspot |
| update_hotspot_status | Mengubah status hotspot |
| validate_hotspot | Mengisi validasi lapangan |
| upload_validation_photo | Upload foto validasi |
| view_validation_photo | Melihat foto validasi |
| export_report | Generate dan download report |
| manage_users | Mengelola user |
| view_audit_logs | Melihat audit log |

---

## 13. Alur Kerja Sistem Secara Umum

### 13.1 Alur Analisis Satelit

```text
AOI Kwala Serapuh
→ Google Earth Engine
→ Sentinel-2 Filtering
→ Cloud Masking
→ Before-After Composite
→ MVI/CMRI/NDVI/NDWI Calculation
→ Change Detection
→ Hotspot Extraction
→ Export GeoJSON
→ Import ke Laravel
→ Simpan ke PostgreSQL/PostGIS
→ Tampil di WebGIS Dashboard