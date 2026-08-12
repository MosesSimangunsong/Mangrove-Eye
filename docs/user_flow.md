# User Flow MANGROVE-EYE

## 1. Informasi Dokumen

| Item | Keterangan |
| --- | --- |
| Nama Sistem | MANGROVE-EYE |
| Jenis Dokumen | User Flow / Navigation Flow |
| Versi | v1.1 |
| Status | Revisi untuk MVP + Redesign UI/UX |
| Acuan Utama | PRD.md, MVP_SCOPE.md, API_CONTRACT.md, UI_DASHBOARD_PLAN.md |
| Target Penyimpanan | docs/USER_FLOW.md |
| Fokus Dokumen | Pemetaan navigasi dan alur penggunaan fitur oleh setiap user |
| Prinsip Navigasi | Public/Internal separation, page-per-page, map-first dashboard, security-aware UI |
| UI Internal | shadcn/ui + Tailwind CSS |
| UI Landing Page | Referensi visual dari ReactBits, Vengence UI, Animate UI, Uiverse, Uilora, AnimMasterLib, dan Skiper UI |

---

## 2. Tujuan Dokumen

Dokumen ini menjelaskan alur penggunaan sistem MANGROVE-EYE dari sudut pandang pengguna.

User flow ini digunakan untuk memastikan bahwa setiap fitur memiliki jalur penggunaan yang jelas, tidak tumpang tindih, dan tidak ditumpuk semuanya dalam satu dashboard besar.

Dokumen ini menjadi acuan untuk:

1. Menentukan struktur navigasi aplikasi.
2. Menentukan halaman publik dan halaman internal.
3. Menentukan alur setiap role.
4. Menjaga agar dashboard tetap map-first.
5. Menjaga agar fitur internal dibuat rapi page per page.
6. Menjaga agar public dashboard tidak membocorkan data sensitif.
7. Menjadi pegangan Codex saat merombak UI/UX.

---

## 3. Prinsip Utama User Flow

### 3.1 Public dan Internal Harus Dipisahkan

Sistem MANGROVE-EYE memiliki dua area besar:

```text
Public Area
→ bisa diakses tanpa login
→ hanya menampilkan informasi umum dan data tergeneralisasi

Internal Area
→ hanya bisa diakses setelah login
→ menampilkan fitur operasional sesuai role dan permission

Public area tidak boleh menampilkan:

Koordinat presisi hotspot.
Polygon detail zona konflik.
Raw GeoJSON.
Foto validasi.
Catatan validator.
Laporan PDF internal.
Path file storage.
Data user internal.
Audit log.
3.2 Internal App Wajib Page per Page

Semua fitur setelah login harus dipisahkan ke halaman yang jelas.

Dashboard internal tidak boleh menjadi satu halaman besar yang menampung semua fitur.

Dashboard hanya berfungsi sebagai pusat pemantauan peta dan ringkasan cepat.

Fitur lain seperti AOI, analysis run, GEE import, validasi, report, user management, dan audit log harus memiliki halaman masing-masing.

3.3 Dashboard Tetap Map-First

Dashboard WebGIS internal tetap menjadi halaman utama setelah login.

Namun, dashboard tidak boleh penuh dengan card besar.

Struktur dashboard harus mengutamakan:

Peta WebGIS
→ Hotspot
→ Layer dan filter
→ Detail hotspot ringkas
→ Statistik ringkas
→ Shortcut ke halaman detail
3.4 Internal UI Menggunakan shadcn/ui

Seluruh area internal setelah login wajib menggunakan shadcn/ui sebagai basis komponen.

Komponen internal yang menggunakan shadcn/ui meliputi:

Button.
Card.
Sheet.
Dialog.
Table.
Tabs.
Select.
Dropdown Menu.
Badge.
Tooltip.
Alert.
Input.
Textarea.
Checkbox.
Switch.
Form.
Toast.
Skeleton.
Breadcrumb.
Sidebar jika digunakan.

Internal app tidak menggunakan ReactBits, Vengence UI, Animate UI, Uiverse, Uilora, AnimMasterLib, atau Skiper UI sebagai komponen utama.

3.5 Landing Page Boleh Lebih Visual

Landing page berbeda dari internal app.

Landing page boleh menggunakan gaya visual atau komponen dari referensi:

ReactBits.
Vengence UI.
Animate UI.
Uiverse.
Uilora.
AnimMasterLib.
Skiper UI.

Namun landing page tetap harus:

Relevan dengan tema MANGROVE-EYE.
Tidak terlalu dekoratif.
Tidak berat.
Tidak membocorkan data sensitif.
Tidak mengubah public dashboard menjadi peta presisi.
Tetap cocok untuk presentasi lomba nasional.
3.6 Sensitive-Data-Aware Flow

Setiap flow harus memperhatikan sensitivitas data.

Jika user tidak memiliki permission, maka sistem harus:

Menyembunyikan tombol aksi.
Menyembunyikan field sensitif.
Mengarahkan ke halaman forbidden jika mencoba akses langsung.
Tidak mengirim data sensitif dari API.
Tidak menampilkan file internal.
Tidak menampilkan koordinat presisi.
4. Aktor / Jenis Pengguna
4.1 Public Visitor

Public visitor adalah pengguna tanpa login.

Akses:

Landing page.
Public dashboard.
Informasi umum sistem.
Data hotspot tergeneralisasi.
CTA login.

Tidak dapat mengakses:

Dashboard internal.
Koordinat presisi.
Polygon detail.
Validasi lapangan.
Foto validasi.
Report PDF internal.
User management.
Audit log.
4.2 Validator

Validator adalah pengguna internal yang melakukan validasi lapangan.

Akses utama:

Internal dashboard.
Hotspot detail.
Field validation.
Upload foto validasi.
Melihat riwayat validasi yang relevan.
Melihat koordinat presisi jika memiliki permission.

Aksi utama:

Memilih hotspot.
Membaca detail lokasi.
Mengisi form validasi.
Mengambil lokasi browser.
Upload foto bukti.
Update validasi miliknya sendiri.
4.3 NGO Advocate

NGO Advocate adalah pengguna internal yang memakai data untuk advokasi.

Akses utama:

Internal dashboard.
Hotspot detail.
Riwayat validasi.
Foto validasi jika memiliki permission.
Report PDF.
Generate report jika memiliki permission.

Aksi utama:

Memantau hotspot prioritas.
Membaca hasil validasi.
Menghasilkan report PDF.
Mengunduh laporan.
Menyiapkan bahan advokasi.
4.4 Admin

Admin adalah pengelola data operasional sistem.

Akses utama:

Dashboard internal.
AOI Management.
Analysis Runs.
GEE Imports.
Hotspots.
Field Validations.
Reports.
Users & Roles.
Audit Logs.
Settings.

Aksi utama:

Mengelola AOI.
Membuat analysis run.
Import GeoJSON dari GEE.
Mengelola hotspot.
Mengelola user dan role.
Mengecek audit log.
Mengelola report.
4.5 Super Admin

Super Admin memiliki akses penuh.

Akses:

Semua halaman.
Semua data.
Semua aksi.
Semua konfigurasi.

Aksi utama:

Mengatur role dan permission.
Mengelola admin.
Mengecek keamanan.
Mengakses audit log.
Mengelola seluruh data sistem.
5. Struktur Navigasi Utama
5.1 Struktur Public Navigation
/
├── Landing Page
├── Public Dashboard
│   └── Public Hotspot Map
└── Login

Public navigation hanya berisi halaman yang aman untuk publik.

5.2 Struktur Internal Navigation
/dashboard
├── Dashboard WebGIS

/hotspots
├── Hotspot List
├── Hotspot Detail
└── Hotspot Map Preview

/aoi-areas
├── AOI List
├── Create AOI
├── Edit AOI
└── AOI Detail

/analysis-runs
├── Analysis Run List
├── Create Analysis Run
├── Edit Analysis Run
└── Analysis Run Detail

/gee-imports
├── GEE Import List
├── Import Hotspot GeoJSON
└── Import Detail

/field-validations
├── Validation List
├── Validation Detail
└── Edit Validation

/reports
├── Report List
├── Generate Report
└── Download Report

/users
├── User List
├── Create User
├── Edit User
└── Assign Role

/roles
├── Role List
├── Permission Matrix
└── Edit Role Permission

/audit-logs
└── Audit Log List

/settings
├── Profile
└── Account Settings

Catatan:

Dashboard WebGIS tetap menjadi pusat monitoring, tetapi bukan tempat semua CRUD dilakukan.

6. Permission-Based Navigation
6.1 Menu yang Dilihat Public Visitor
Menu	Akses
Landing Page	Ya
Public Dashboard	Ya
Login	Ya
Internal Dashboard	Tidak
Hotspots Internal	Tidak
Reports Internal	Tidak
Audit Logs	Tidak
6.2 Menu yang Dilihat Validator
Menu	Akses
Dashboard WebGIS	Ya
Hotspots	Ya
Field Validations	Ya
Reports	Terbatas / jika diberi permission
AOI Management	Tidak
Analysis Runs	Read-only jika diberi permission
GEE Imports	Tidak
Users & Roles	Tidak
Audit Logs	Tidak
Settings/Profile	Ya
6.3 Menu yang Dilihat NGO Advocate
Menu	Akses
Dashboard WebGIS	Ya
Hotspots	Ya
Field Validations	Read
Reports	Ya
AOI Management	Read-only jika diberi permission
Analysis Runs	Read-only
GEE Imports	Tidak
Users & Roles	Tidak
Audit Logs	Tidak
Settings/Profile	Ya
6.4 Menu yang Dilihat Admin
Menu	Akses
Dashboard WebGIS	Ya
Hotspots	Ya
AOI Management	Ya
Analysis Runs	Ya
GEE Imports	Ya
Field Validations	Ya
Reports	Ya
Users & Roles	Ya
Audit Logs	Ya
Settings/Profile	Ya
6.5 Menu yang Dilihat Super Admin

Super Admin dapat melihat dan mengakses semua menu.

7. User Flow Public Visitor
7.1 Flow Landing Page
User membuka /
→ Melihat hero section MANGROVE-EYE
→ Membaca konteks masalah Kwala Serapuh
→ Membaca solusi WebGIS + GEE + validasi lapangan
→ Melihat alur sistem
→ Melihat fitur utama
→ Melihat dampak sosial-ekologis
→ Klik CTA "Lihat Public Dashboard"
→ Masuk ke Public Dashboard

Tujuan flow:

Membuat user memahami masalah.
Membuat user memahami solusi.
Membuat user percaya bahwa sistem berbasis data.
Mengarahkan user ke public dashboard atau login.
7.2 Flow Public Dashboard
User membuka Public Dashboard
→ Sistem memuat public summary
→ Sistem memuat generalized hotspot
→ User melihat peta umum
→ User melihat jumlah hotspot dan estimasi area
→ User membaca disclaimer
→ User tidak dapat melihat koordinat presisi
→ User dapat kembali ke landing page atau login

Data yang boleh tampil:

Jumlah hotspot.
Estimasi area terdampak.
Priority umum.
Status umum.
Titik tergeneralisasi.
Latest analysis info.
Disclaimer.

Data yang tidak boleh tampil:

Polygon hotspot detail.
Koordinat presisi.
Foto validasi.
Catatan validator.
Report PDF internal.
Raw GeoJSON.
7.3 Flow Login dari Public Area
User klik Login
→ Sistem menampilkan Login Page
→ User memasukkan email dan password
→ Sistem validasi credential
→ Jika gagal, tampil error
→ Jika berhasil, sistem membaca role dan permission
→ User diarahkan ke Dashboard WebGIS internal
8. User Flow Authentication
8.1 Login Flow
Buka /login
→ Input email
→ Input password
→ Klik Masuk
→ API memvalidasi session
→ Sistem mengambil data user aktif
→ Sistem membaca role dan permission
→ Redirect ke /dashboard

Error state:

Credential salah
→ Tampilkan pesan error
→ Tetap di halaman login

Inactive user:

User nonaktif
→ Tampilkan pesan akun tidak aktif
→ Tidak masuk ke dashboard
8.2 Logout Flow
User klik menu profile
→ Klik Logout
→ Sistem menghapus session
→ Redirect ke landing page atau login
8.3 Unauthorized Flow
User membuka halaman tanpa permission
→ Sistem mengecek role/permission
→ Jika tidak berhak
→ Tampilkan halaman 403 Forbidden
→ Berikan tombol kembali ke dashboard
9. User Flow Internal Dashboard WebGIS
9.1 Dashboard Initial Load
User login
→ Redirect ke /dashboard
→ Sistem memuat dashboard summary
→ Sistem memuat analysis run aktif
→ Sistem memuat AOI aktif
→ Sistem memuat hotspot GeoJSON
→ Sistem memuat layer metadata
→ Peta tampil sebagai pusat layar
→ Panel ringkas tampil di sekeliling peta

Komponen utama:

Top bar.
Sidebar/internal navigation.
Map canvas.
Filter panel.
Layer control.
Legend.
Metric strip.
Hotspot drawer ringkas.
9.2 Flow Memilih Analysis Run
User membuka Dashboard
→ User memilih analysis run dari Select
→ Sistem memuat AOI dan hotspot terkait run tersebut
→ Peta diperbarui
→ Metric strip diperbarui
→ Layer list diperbarui

Jika analysis run kosong:

Tidak ada analysis run
→ Tampilkan empty state
→ Admin dapat diarahkan ke halaman Analysis Runs
9.3 Flow Filter Hotspot
User membuka filter panel
→ Pilih priority
→ Pilih validation status
→ Pilih rentang tanggal
→ Input min/max area
→ Sistem memfilter hotspot
→ Peta dan daftar hotspot ikut berubah

Reset filter:

User klik Reset Filter
→ Semua filter kembali default
→ Semua hotspot sesuai analysis run tampil
9.4 Flow Layer Toggle
User membuka Layer Control
→ Toggle AOI layer
→ Toggle hotspot polygon
→ Toggle hotspot centroid
→ Toggle selected hotspot highlight
→ Peta diperbarui tanpa reload halaman

Layer MVP:

AOI.
Hotspot polygon.
Hotspot centroid.
Selected hotspot highlight.
Static map placeholder jika tersedia.

Tile GEE interaktif tidak termasuk MVP.

9.5 Flow Klik Hotspot di Peta
User klik polygon hotspot
→ Popup hotspot muncul
→ Sistem menyimpan selected hotspot
→ Drawer ringkas terbuka
→ Jika perlu, sistem fetch detail hotspot
→ Drawer menampilkan data indeks, lokasi, status, dan aksi shortcut

Data drawer ringkas:

Hotspot ID/kode.
Priority.
Validation status.
Area.
Centroid.
MVI/CMRI/NDVI/NDWI.
Analysis run.
Riwayat validasi ringkas.
Shortcut ke detail hotspot.
Shortcut validasi jika berwenang.
Shortcut generate report jika berwenang.
9.6 Flow Fit to AOI / Fit to All Hotspots
User klik Fit to AOI
→ Map zoom ke batas AOI

User klik Fit to All Hotspots
→ Map zoom ke semua hotspot yang sedang tampil
10. User Flow Hotspot Management
10.1 Flow Melihat Daftar Hotspot
User membuka /hotspots
→ Sistem memuat tabel hotspot
→ User dapat filter berdasarkan analysis run, priority, status, tanggal, dan area
→ User klik salah satu hotspot
→ Masuk ke Hotspot Detail

Komponen halaman:

Page header.
Filter table.
shadcn Table.
Priority badge.
Status badge.
Action dropdown.
Pagination.
10.2 Flow Hotspot Detail
User membuka /hotspots/{id}
→ Sistem memuat detail hotspot
→ Sistem menampilkan ringkasan spasial
→ Sistem menampilkan indeks spektral
→ Sistem menampilkan validation history
→ Sistem menampilkan report terkait
→ User memilih aksi sesuai permission

Aksi yang mungkin:

Lihat peta hotspot.
Update priority.
Update status.
Tambah validasi.
Generate report.
Download report.
Lihat foto validasi.
10.3 Flow Update Status/Priority Hotspot
Admin membuka Hotspot Detail
→ Klik Update Status atau Priority
→ Dialog shadcn terbuka
→ Admin memilih status/priority baru
→ Klik Save
→ API menyimpan perubahan
→ UI menampilkan toast sukses

Jika user tidak berwenang:

Tombol update tidak tampil
11. User Flow AOI Management
11.1 Flow Melihat AOI
Admin membuka /aoi-areas
→ Sistem memuat daftar AOI
→ Admin melihat status, tipe, luas, sumber data, dan verification status
→ Admin klik detail AOI
11.2 Flow Membuat AOI
Admin membuka /aoi-areas
→ Klik Create AOI
→ Isi nama AOI
→ Isi tipe AOI
→ Isi lokasi
→ Isi luas estimasi
→ Pilih sumber data
→ Upload/input GeoJSON
→ Klik Save
→ Sistem validasi geometry
→ AOI tersimpan
→ AOI tampil di peta

Jika GeoJSON invalid:

Sistem menampilkan error validasi
→ Admin memperbaiki file/input
11.3 Flow Import AOI GeoJSON
Admin membuka halaman AOI
→ Klik Import GeoJSON
→ Upload file GeoJSON
→ Sistem validasi FeatureCollection/geometry
→ Sistem menyimpan geometry ke PostGIS
→ Sistem menampilkan preview AOI
→ Admin konfirmasi
12. User Flow Analysis Run
12.1 Flow Melihat Analysis Run
Admin/NGO membuka /analysis-runs
→ Sistem memuat daftar analysis run
→ User melihat AOI, periode before-after, status, total hotspot, total area
→ User klik detail analysis run
12.2 Flow Membuat Analysis Run
Admin membuka /analysis-runs
→ Klik Create Analysis Run
→ Pilih AOI
→ Isi nama analisis
→ Isi periode before
→ Isi periode after
→ Isi parameter cloud cover
→ Isi threshold MVI/CMRI jika tersedia
→ Simpan
→ Analysis run dibuat dengan status draft/created
12.3 Flow Detail Analysis Run
User membuka /analysis-runs/{id}
→ Sistem menampilkan metadata analysis run
→ Sistem menampilkan ringkasan hotspot
→ Sistem menampilkan daftar GEE imports
→ Sistem menampilkan daftar reports
→ Admin dapat lanjut ke Import GEE
13. User Flow GEE Import
13.1 Flow Import Hotspot GeoJSON
Admin membuka /gee-imports
→ Pilih analysis run
→ Klik Import Hotspot GeoJSON
→ Upload file hasil export GEE
→ Sistem validasi FeatureCollection
→ Sistem validasi Polygon/MultiPolygon
→ Sistem membaca properties indeks
→ Sistem menyimpan hotspot ke PostGIS
→ Sistem menyimpan metadata import
→ Sistem update summary analysis run
→ Sistem menampilkan hasil import

Jika import berhasil:

Toast sukses
→ Redirect ke detail analysis run atau daftar hotspot

Jika import gagal:

Tampilkan error
→ Tidak menyimpan data parsial yang rusak
13.2 Flow Melihat Riwayat GEE Import
Admin membuka /gee-imports
→ Sistem menampilkan daftar import
→ Admin melihat nama file, analysis run, jumlah feature, status, dan waktu import
→ Admin klik detail import
14. User Flow Field Validation
14.1 Flow Validator Memilih Hotspot untuk Validasi
Validator login
→ Buka Dashboard atau /hotspots
→ Filter hotspot status detected/needs_recheck
→ Pilih hotspot prioritas
→ Buka Hotspot Detail
→ Klik Tambah Validasi
14.2 Flow Mengisi Validasi Lapangan
Validator klik Tambah Validasi
→ Form validasi terbuka
→ Pilih status validasi
→ Isi observed condition
→ Isi confidence score
→ Isi catatan lapangan
→ Isi visited_at
→ Pilih sensitivity level
→ Input koordinat manual atau klik Ambil Lokasi Browser
→ Klik Simpan Validasi
→ Sistem menyimpan validasi
→ Status hotspot diperbarui

Field utama:

Validation status.
Observed condition.
Confidence.
Notes.
Visited at.
Sensitivity level.
Latitude.
Longitude.
14.3 Flow Update Validasi Existing
Validator membuka Hotspot Detail
→ Sistem menampilkan validasi miliknya
→ Klik Edit Validasi
→ Ubah data validasi
→ Klik Save
→ Sistem update validasi

Batasan:

Validator hanya boleh mengubah validasi miliknya sendiri.
Admin/super admin dapat mengelola validasi sesuai permission.
Public tidak dapat melihat validasi detail.
15. User Flow Validation Photo
15.1 Flow Upload Foto Validasi
Validator membuka validasi
→ Klik Upload Foto
→ Pilih file gambar
→ Sistem menampilkan preview
→ Isi caption jika perlu
→ Isi taken_at jika perlu
→ Isi koordinat foto jika perlu
→ Klik Upload
→ Sistem menyimpan file di private storage
→ Foto tampil di gallery internal

Validasi file:

JPG.
JPEG.
PNG.
WebP.
Maksimal ukuran sesuai aturan backend.
Non-image ditolak.
15.2 Flow Melihat Gallery Foto
User berwenang membuka Hotspot Detail atau Validation Detail
→ Sistem menampilkan gallery foto
→ User klik foto
→ Sistem membuka file melalui endpoint terproteksi

Catatan keamanan:

Frontend hanya menerima file_url.
Frontend tidak menerima storage path mentah.
Public tidak bisa membuka foto.
User tanpa permission tidak bisa membuka foto.
15.3 Flow Delete Foto
Validator/Admin membuka gallery
→ Klik delete pada foto
→ Dialog konfirmasi muncul
→ User konfirmasi
→ Sistem menghapus foto atau menandai terhapus
→ Gallery diperbarui
16. User Flow Report PDF
16.1 Flow Generate Report Hotspot
User berwenang membuka Hotspot Detail
→ Klik Generate Report
→ Dialog report terbuka
→ Pilih include validation photos
→ Pilih include precise coordinates jika memiliki permission
→ Baca disclaimer
→ Klik Generate
→ Sistem membuat PDF
→ Report tersimpan di private storage
→ Report muncul di daftar report terkait hotspot
16.2 Flow Generate Report Analysis Run
Admin/NGO membuka Analysis Run Detail
→ Klik Generate Analysis Run Report
→ Pilih opsi laporan
→ Sistem membuat PDF ringkasan analysis run
→ Report tersimpan
→ User dapat download

Catatan:

Report analysis run boleh dianggap bonus jika report hotspot sudah terpenuhi untuk MVP.

16.3 Flow Download Report
User membuka /reports atau Hotspot Detail
→ Klik Download Report
→ Sistem mengecek permission export_report
→ Jika berwenang, file diunduh melalui endpoint terproteksi
→ Jika tidak berwenang, sistem menolak akses

Data sensitif:

Koordinat presisi hanya masuk report jika user berwenang.
Foto validasi hanya masuk report jika opsi dipilih dan user berwenang.
Disclaimer wajib ada.
17. User Flow User & Role Management
17.1 Flow Melihat User
Admin membuka /users
→ Sistem menampilkan daftar user
→ Admin melihat nama, email, organisasi, role, status aktif
→ Admin dapat filter/search
17.2 Flow Membuat User
Admin klik Create User
→ Isi nama
→ Isi email
→ Isi password awal
→ Isi organisasi jika ada
→ Pilih role
→ Simpan
→ User baru dibuat
17.3 Flow Edit User
Admin membuka User Detail/Edit
→ Ubah data user
→ Ubah role jika perlu
→ Aktif/nonaktifkan user
→ Simpan
17.4 Flow Role Permission
Super Admin membuka /roles
→ Pilih role
→ Lihat permission matrix
→ Centang/hapus permission
→ Simpan
→ Sistem update permission

Catatan:

Permission harus mengikuti prinsip least privilege.

18. User Flow Audit Log
18.1 Flow Melihat Audit Log
Admin membuka /audit-logs
→ Sistem menampilkan log aktivitas penting
→ Admin dapat filter berdasarkan user, action, resource, tanggal
→ Admin membaca detail log

Aktivitas yang perlu tercatat:

Login.
Logout.
Import GEE.
Create/update AOI.
Create/update analysis run.
Update hotspot.
Create/update validation.
Upload/delete validation photo.
Generate/download report.
Update user/role.
Akses file sensitif jika memungkinkan.
19. User Flow Settings/Profile
19.1 Flow Profile
User membuka /settings/profile
→ Sistem menampilkan data profil
→ User mengubah nama/organisasi/kontak jika diizinkan
→ Simpan
→ Sistem update profil
19.2 Flow Password
User membuka pengaturan password
→ Input password lama
→ Input password baru
→ Konfirmasi password baru
→ Simpan
→ Sistem update password
20. Flow Data Sensitif
20.1 Public Data Flow
Public user membuka public dashboard
→ Frontend memanggil /api/v1/public/...
→ Backend mengirim generalized data
→ Frontend menampilkan titik umum
→ Tidak ada data sensitif tampil
20.2 Internal Data Flow
Internal user login
→ Sistem membaca role/permission
→ Frontend meminta data internal
→ Backend memfilter data sesuai permission
→ UI hanya menampilkan field/aksi yang diizinkan
20.3 Protected File Flow
User klik foto/report
→ Frontend membuka file_url/download_url
→ Backend mengecek session dan permission
→ Jika berwenang, file dikirim
→ Jika tidak berwenang, akses ditolak
21. Empty, Loading, dan Error Flow
21.1 Loading State
User membuka halaman
→ Data belum selesai dimuat
→ Sistem menampilkan Skeleton shadcn
→ Data selesai dimuat
→ Konten tampil
21.2 Empty State
Data kosong
→ Sistem menampilkan empty state
→ Jika user berwenang, tampil CTA create/import
→ Jika user tidak berwenang, tampil pesan informatif

Contoh:

Belum ada AOI.
Belum ada analysis run.
Belum ada hotspot.
Belum ada validasi.
Belum ada report.
21.3 Error State
API gagal
→ Sistem menampilkan Alert shadcn
→ Tampilkan pesan error yang jelas
→ Berikan tombol retry jika relevan
22. Flow Responsive
22.1 Desktop

Desktop menggunakan layout penuh:

Sidebar
→ Topbar
→ Content Area
→ Map Canvas / Table / Detail Page

Dashboard WebGIS desktop:

Sidebar
→ Top Bar
→ Left Panel
→ Map Canvas
→ Right Drawer
→ Metric Strip
22.2 Tablet

Tablet menggunakan layout adaptif:

Sidebar collapsible
→ Map tetap dominan
→ Panel bisa menjadi sheet
→ Detail bisa menjadi drawer
22.3 Mobile Browser

Mobile browser digunakan terutama untuk validasi lapangan.

Flow mobile:

Validator login
→ Buka hotspot
→ Buka validasi
→ Ambil lokasi browser
→ Upload foto
→ Simpan validasi

Prinsip mobile:

Jangan memaksa peta besar jika form sedang aktif.
Gunakan bottom sheet untuk detail.
Form harus mudah diisi.
Tombol ambil lokasi harus jelas.
Upload foto harus sederhana.
23. Mermaid Flow Diagram
23.1 Overall User Flow
flowchart TD
    A[Public Visitor] --> B[Landing Page]
    B --> C[Public Dashboard]
    B --> D[Login Page]

    D --> E{Login Valid?}
    E -->|No| D
    E -->|Yes| F[Read Role & Permission]

    F --> G[Internal Dashboard WebGIS]

    G --> H[Hotspots]
    G --> I[AOI Management]
    G --> J[Analysis Runs]
    G --> K[GEE Imports]
    G --> L[Field Validations]
    G --> M[Reports]
    G --> N[Users & Roles]
    G --> O[Audit Logs]

    H --> P[Hotspot Detail]
    P --> L
    P --> M

    J --> K
    K --> H

    L --> Q[Validation Photos]
    M --> R[Download PDF]
23.2 Public Flow
flowchart TD
    A[Open Landing Page] --> B[Read Problem Context]
    B --> C[Read MANGROVE-EYE Solution]
    C --> D[Open Public Dashboard]
    D --> E[View Generalized Hotspots]
    E --> F[Read Disclaimer]
    F --> G{Want Internal Access?}
    G -->|Yes| H[Login]
    G -->|No| I[Exit / Share Information]
23.3 Internal Dashboard Flow
flowchart TD
    A[User Login] --> B[Dashboard WebGIS]
    B --> C[Load Summary]
    B --> D[Load AOI]
    B --> E[Load Hotspot GeoJSON]
    B --> F[Load Layer Metadata]

    E --> G[Filter Hotspots]
    E --> H[Click Hotspot]
    H --> I[Popup]
    H --> J[Detail Drawer]

    J --> K[Open Hotspot Detail]
    J --> L[Create Validation]
    J --> M[Generate Report]
23.4 GEE to Hotspot Flow
flowchart TD
    A[Admin Creates Analysis Run] --> B[Run GEE Script Manually]
    B --> C[Export Hotspot GeoJSON]
    C --> D[Open GEE Import Page]
    D --> E[Upload GeoJSON]
    E --> F[Validate FeatureCollection]
    F --> G[Save Hotspots to PostGIS]
    G --> H[Update Analysis Run Summary]
    H --> I[Show Hotspots on Dashboard]
23.5 Validation Flow
flowchart TD
    A[Validator Opens Hotspot] --> B[Read Hotspot Detail]
    B --> C[Open Validation Form]
    C --> D[Fill Status and Notes]
    D --> E[Use Browser Location or Manual Coordinate]
    E --> F[Save Validation]
    F --> G[Upload Validation Photo]
    G --> H[Photo Stored in Private Storage]
    H --> I[Validation History Updated]
    I --> J[Hotspot Status Updated]
23.6 Report Flow
flowchart TD
    A[Authorized User Opens Hotspot Detail] --> B[Click Generate Report]
    B --> C[Choose Report Options]
    C --> D[Read Disclaimer]
    D --> E[Generate PDF]
    E --> F[Save to Private Storage]
    F --> G[Report Listed in UI]
    G --> H[Download via Protected Endpoint]
23.7 Permission Flow
flowchart TD
    A[User Requests Page or Action] --> B[Check Authentication]
    B -->|Not Logged In| C[Redirect to Login]
    B -->|Logged In| D[Check Role and Permission]
    D -->|Allowed| E[Show Page or Execute Action]
    D -->|Denied| F[Show 403 Forbidden]
24. Acceptance Criteria User Flow

User flow dianggap benar jika:

Public user dapat membuka landing page.
Public user dapat membuka public dashboard.
Public user tidak melihat data sensitif.
User internal dapat login.
Setelah login, user diarahkan ke dashboard internal.
Menu internal muncul sesuai role dan permission.
Dashboard tetap map-first.
Fitur internal dipisah page per page.
Validator dapat melakukan validasi lapangan.
Validator dapat upload foto validasi.
NGO/admin dapat generate dan download report jika berwenang.
Admin dapat mengelola AOI, analysis run, GEE import, hotspot, user, dan audit.
User tanpa permission tidak melihat tombol aksi sensitif.
User tanpa permission tidak dapat mengakses route sensitif secara langsung.
File foto dan report hanya terbuka melalui endpoint terproteksi.
Internal app menggunakan shadcn/ui.
Landing page boleh memakai referensi visual yang sudah ditentukan.
Tidak ada fitur utama yang ditumpuk semuanya di Dashboard.jsx.
25. Kesimpulan

User flow MANGROVE-EYE dirancang untuk memisahkan dengan jelas alur publik dan alur internal.

Public user hanya mendapatkan informasi umum, landing page, dan public dashboard dengan data tergeneralisasi. Internal user mendapatkan akses sesuai role dan permission.

Setelah login, semua fitur harus disusun page per page agar sistem rapi, mudah digunakan, dan tidak menjadi dashboard besar yang penuh fitur. Dashboard internal tetap menjadi pusat monitoring WebGIS, tetapi fitur seperti AOI, analysis run, GEE import, validasi, report, user management, dan audit log harus memiliki halaman masing-masing.

Seluruh internal app wajib menggunakan shadcn/ui agar konsisten, profesional, dan mudah dirawat. Landing page boleh lebih visual menggunakan referensi website/library yang telah ditentukan, tetapi tetap harus menjaga performa, relevansi, dan keamanan data.

Dengan user flow ini, MANGROVE-EYE dapat digunakan sebagai sistem deteksi dini, validasi lapangan, dan pelaporan yang terstruktur, aman, dan layak untuk kebutuhan MVP serta demo lomba nasional.