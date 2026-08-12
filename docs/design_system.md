# Design System MANGROVE-EYE

## 1. Informasi Dokumen

| Item | Keterangan |
| --- | --- |
| Nama Sistem | MANGROVE-EYE |
| Jenis Dokumen | Design System / Visual Standard |
| Versi | v1.1 |
| Status | Revisi untuk MVP + Redesign UI/UX |
| Target Penyimpanan | docs/DESIGN_SYSTEM.md |
| Acuan Utama | PRD.md, USER_FLOW.md, UI_DASHBOARD_PLAN.md, MVP_SCOPE.md |
| Area Desain | Landing Page, Public Dashboard, Internal App, WebGIS Dashboard, Validation UI, Report UI |
| UI Internal | shadcn/ui + Tailwind CSS |
| UI Landing Page | Referensi visual dari ReactBits, Vengence UI, Animate UI, Uiverse, Uilora, AnimMasterLib, dan Skiper UI |
| Prinsip Utama | Map-first, page-per-page, calm by default, urgent by signal, security-aware |

---

## 2. Tujuan Design System

Design system ini dibuat untuk menstandardisasi tampilan visual MANGROVE-EYE agar seluruh halaman terlihat konsisten, profesional, rapi, dan tidak tampak seperti template AI generik.

Dokumen ini menjadi acuan untuk:

1. Menentukan warna utama sistem.
2. Menentukan tipografi.
3. Menentukan spacing, radius, shadow, dan layout.
4. Menentukan gaya komponen internal berbasis shadcn/ui.
5. Menentukan gaya landing page publik.
6. Menentukan gaya WebGIS dashboard.
7. Menentukan gaya form validasi.
8. Menentukan gaya report UI.
9. Menentukan gaya empty/loading/error state.
10. Menjadi pegangan Codex saat merombak UI/UX.

---

## 3. Identitas Visual MANGROVE-EYE

### 3.1 Karakter Visual

MANGROVE-EYE harus terasa seperti:

1. Spatial intelligence dashboard.
2. Sistem pemantauan lingkungan.
3. Platform advokasi berbasis data.
4. Sistem profesional untuk validasi lapangan.
5. Alat bantu early warning, bukan aplikasi dekoratif.

Kesan visual yang harus muncul:

```text
Tenang
Ilmiah
Spasial
Profesional
Bersih
Terpercaya
Tegas saat ada risiko
Tidak berlebihan
3.2 Kesan yang Harus Dihindari

UI MANGROVE-EYE tidak boleh terasa seperti:

Template AI generik.
Dashboard SaaS penuh card besar.
Landing page crypto.
Aplikasi game.
Glassmorphism berlebihan.
Gradient terlalu ramai.
Peta penuh animasi berdenyut.
UI yang terlalu gelap tanpa kontras.
UI yang terlalu banyak efek tanpa fungsi.
Semua fitur ditumpuk dalam satu halaman.
4. Prinsip Desain Utama
4.1 Map-First, Not Card-First

Peta adalah pusat interaksi utama pada WebGIS dashboard.

Urutan prioritas visual:

Map Canvas
→ Hotspot
→ AOI
→ Layer Control
→ Filter
→ Detail Drawer
→ Metric Strip
→ Validation Shortcut
→ Report Shortcut

Dashboard tidak boleh menggunakan pola:

Card Card Card Card
Card Card Card Card
Card Card Card Card

Dashboard harus menggunakan pola:

Sidebar / Topbar
+ Map Canvas
+ Floating Controls
+ Compact Panel
+ Drawer
+ Metric Strip
4.2 Calm by Default, Urgent by Signal

Tampilan default harus tenang.

Namun, hotspot prioritas tinggi boleh diberi sinyal visual lebih tegas.

Contoh:

Priority low: warna tenang.
Priority medium: warna perhatian.
Priority high: warna tegas.
Animasi pulse hanya untuk priority high dan dibatasi.
Tidak semua marker boleh bergerak.
4.3 Data-Driven, Not Decorative

Setiap elemen UI harus punya fungsi.

Contoh elemen yang boleh ada:

Elemen	Fungsi
Peta	Membaca lokasi dan sebaran hotspot
Layer control	Mengatur AOI, hotspot, centroid, static map
Filter	Menyaring hotspot berdasarkan status, prioritas, tanggal, area
Badge	Membaca status cepat
Drawer	Membaca detail hotspot
Metric strip	Membaca ringkasan cepat
Form validation	Input validasi lapangan
Report modal	Generate laporan PDF

Elemen yang hanya mempercantik tanpa fungsi harus dihindari.

4.4 Sensitive-Data-Aware UI

UI harus membedakan area publik dan internal.

Public UI tidak boleh menampilkan:

Koordinat presisi.
Polygon detail hotspot.
Polygon zona konflik.
Raw GeoJSON.
Foto validasi.
Catatan validator.
Report PDF internal.
Path storage.
Data user internal.
Audit log.

Internal UI dapat menampilkan data sesuai role dan permission.

4.5 Page per Page untuk Internal App

Setelah login, fitur harus dibuat page per page.

Dashboard tidak boleh memuat semua fitur.

Struktur internal minimal:

Dashboard WebGIS
Hotspots
AOI Management
Analysis Runs
GEE Imports
Field Validations
Reports
Users & Roles
Audit Logs
Settings / Profile
5. Pembagian Gaya Visual Berdasarkan Area
5.1 Landing Page

Landing page boleh lebih visual, modern, dan interaktif.

Boleh menggunakan referensi dari:

ReactBits.
Vengence UI.
Animate UI.
Uiverse.
Uilora.
AnimMasterLib.
Skiper UI.

Namun tetap harus:

Tidak berat.
Tidak terlalu ramai.
Tidak seperti website crypto.
Tidak membocorkan data sensitif.
Tetap cocok dengan tema lingkungan.
Tetap cocok untuk presentasi lomba nasional.
5.2 Public Dashboard

Public dashboard harus map-first tetapi sederhana.

Gaya visual:

Clean.
Informatif.
Minim detail sensitif.
Banyak disclaimer.
Tidak terlalu teknis.
Tidak menampilkan polygon presisi.
5.3 Internal App

Internal app wajib menggunakan shadcn/ui.

Tidak boleh menggunakan:

ReactBits.
Vengence UI.
Animate UI sebagai library utama.
Uiverse.
Uilora.
AnimMasterLib.
Skiper UI.

Internal app harus terlihat seperti aplikasi operasional serius, bukan landing page promosi.

6. Design Tokens
6.1 Color Palette

Palet warna MANGROVE-EYE mengambil inspirasi dari ekosistem mangrove, pesisir, satelit, dan data spasial.

Primary Colors
Token	Hex	Fungsi
--me-primary	#0F766E	Warna utama, tombol utama, active state
--me-primary-dark	#115E59	Hover primary, header gelap
--me-primary-soft	#CCFBF1	Background ringan primary
--me-primary-muted	#F0FDFA	Panel sangat ringan
Environmental Greens
Token	Hex	Fungsi
--me-mangrove	#166534	Vegetasi/mangrove sehat
--me-mangrove-soft	#DCFCE7	Background status aman
--me-forest	#14532D	Aksen gelap lingkungan
--me-leaf	#22C55E	Indikator positif
Coastal Blues
Token	Hex	Fungsi
--me-coast	#0369A1	Data spasial, link, map info
--me-coast-soft	#E0F2FE	Background info
--me-water	#0284C7	Layer air / NDWI
--me-satellite	#1E3A8A	Aksen teknis/satelit
Warning and Risk Colors
Token	Hex	Fungsi
--me-risk-low	#16A34A	Priority low
--me-risk-medium	#D97706	Priority medium
--me-risk-high	#DC2626	Priority high
--me-risk-critical	#991B1B	Risiko sangat tinggi
--me-warning-soft	#FEF3C7	Background warning
--me-danger-soft	#FEE2E2	Background danger
Neutral Colors
Token	Hex	Fungsi
--me-background	#F8FAFC	Background app
--me-surface	#FFFFFF	Card/panel
--me-surface-muted	#F1F5F9	Panel ringan
--me-border	#E2E8F0	Border
--me-border-strong	#CBD5E1	Border tegas
--me-text	#0F172A	Teks utama
--me-text-muted	#64748B	Teks sekunder
--me-text-soft	#94A3B8	Teks placeholder
6.2 Tailwind Token Recommendation

Gunakan konfigurasi warna seperti ini sebagai acuan.

const mangroveEyeColors = {
  me: {
    primary: '#0F766E',
    'primary-dark': '#115E59',
    'primary-soft': '#CCFBF1',
    'primary-muted': '#F0FDFA',

    mangrove: '#166534',
    'mangrove-soft': '#DCFCE7',
    forest: '#14532D',
    leaf: '#22C55E',

    coast: '#0369A1',
    'coast-soft': '#E0F2FE',
    water: '#0284C7',
    satellite: '#1E3A8A',

    'risk-low': '#16A34A',
    'risk-medium': '#D97706',
    'risk-high': '#DC2626',
    'risk-critical': '#991B1B',
    'warning-soft': '#FEF3C7',
    'danger-soft': '#FEE2E2',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-muted': '#F1F5F9',
    border: '#E2E8F0',
    'border-strong': '#CBD5E1',
    text: '#0F172A',
    'text-muted': '#64748B',
    'text-soft': '#94A3B8',
  },
}
7. Typography
7.1 Font Family

Rekomendasi font:

Area	Font
Internal App	Inter
Dashboard Data	Inter
Landing Page	Inter / Plus Jakarta Sans
Code / Coordinate	JetBrains Mono / ui-monospace

Jika tidak ingin menambah banyak font, gunakan:

Inter untuk semua UI
ui-monospace untuk koordinat, kode hotspot, dan data teknis
7.2 Type Scale
Token	Size	Line Height	Fungsi
text-xs	12px	16px	Label kecil, metadata
text-sm	14px	20px	Teks UI normal
text-base	16px	24px	Body text
text-lg	18px	28px	Section title kecil
text-xl	20px	28px	Page title
text-2xl	24px	32px	Dashboard title
text-3xl	30px	36px	Landing section title
text-4xl	36px	40px	Landing hero
text-5xl	48px	56px	Hero utama jika perlu
7.3 Typography Rules
Jangan gunakan terlalu banyak ukuran font.
Dashboard harus padat tetapi tetap terbaca.
Data numerik harus mudah dipindai.
Koordinat dan kode hotspot gunakan monospace.
Judul internal tidak perlu terlalu besar.
Landing page boleh lebih ekspresif, tetapi tetap profesional.
8. Spacing System

Gunakan spacing berbasis Tailwind.

Token	Nilai	Penggunaan
1	4px	Gap kecil
2	8px	Gap antar label
3	12px	Padding compact
4	16px	Padding standar
5	20px	Padding panel
6	24px	Section internal
8	32px	Section besar
10	40px	Landing section
12	48px	Landing spacing besar
16	64px	Hero/section besar
20	80px	Landing page block

Prinsip:

Internal app harus lebih compact.
Landing page boleh lebih lega.
Dashboard map-first harus menghindari panel terlalu tebal.
Table dan form harus rapi dengan padding konsisten.
9. Border Radius
Token	Tailwind	Penggunaan
Small	rounded-md	Input, badge, small button
Medium	rounded-lg	Card, panel, dropdown
Large	rounded-xl	Drawer, modal, metric card
Extra Large	rounded-2xl	Landing page visual block
Full	rounded-full	Badge, pill, marker

Aturan:

Internal app dominan rounded-lg dan rounded-xl.
Landing page boleh menggunakan rounded-2xl.
Jangan mencampur radius terlalu banyak di satu halaman.
Map controls gunakan rounded-lg.
10. Shadow and Elevation
10.1 Shadow Tokens
Token	Style	Penggunaan
shadow-xs	Sangat halus	Border substitute
shadow-sm	Ringan	Card kecil
shadow-md	Sedang	Dropdown, floating control
shadow-lg	Kuat	Drawer, dialog
shadow-map	Custom	Panel di atas peta

Rekomendasi custom shadow:

.shadow-map {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.12),
    0 2px 8px rgba(15, 23, 42, 0.08);
}

Aturan:

Jangan gunakan shadow terlalu gelap.
Panel map harus terlihat mengambang tetapi tetap ringan.
Dialog dan sheet boleh lebih tinggi elevation-nya.
Table dan card cukup border + shadow halus.
11. Layout System
11.1 Landing Page Layout

Landing page menggunakan struktur:

Navbar
→ Hero Section
→ Problem Section
→ Solution Overview
→ How It Works
→ Feature Showcase
→ Technology Stack
→ Impact Section
→ Public Dashboard CTA
→ Login CTA
→ Footer

Gaya landing page:

Lebih visual.
Lebih storytelling.
Boleh memakai motion.
Boleh memakai komponen dari library referensi.
Tetap tidak boleh menampilkan data sensitif.
11.2 Public Dashboard Layout

Struktur:

Top Public Bar
→ Map Canvas
→ Floating Summary Panel
→ Public Legend
→ Disclaimer Strip
→ Latest Analysis Info

Prinsip:

Peta tetap dominan.
Hotspot hanya generalized point.
Panel ringkas.
Disclaimer harus terlihat.
Tidak ada drawer detail sensitif.
11.3 Internal App Layout

Internal app menggunakan AppShell berbasis shadcn/ui.

Struktur umum:

Sidebar
→ Topbar
→ Page Header
→ Page Content

Elemen tetap:

Sidebar navigation.
Topbar dengan user menu.
Breadcrumb.
Page title.
Page description.
Action button.
Content area.
11.4 Internal Dashboard WebGIS Layout

Dashboard WebGIS berbeda dari halaman CRUD biasa.

Struktur desktop:

Sidebar
→ Topbar
→ WebGIS Workspace
   ├── Left Control Panel
   ├── Map Canvas
   ├── Right Detail Drawer
   ├── Floating Legend
   └── Bottom Metric Strip

Struktur mobile:

Topbar Compact
→ Map Canvas
→ Floating Layer Button
→ Floating Filter Button
→ Bottom Sheet Detail
12. shadcn/ui Component Standard

Internal app wajib menggunakan shadcn/ui.

12.1 Button

Gunakan Button untuk semua aksi.

Varian:

Variant	Fungsi
default	Aksi utama
secondary	Aksi sekunder
outline	Aksi netral
ghost	Navigasi ringan
destructive	Delete atau aksi berbahaya
link	Link ringan

Contoh penggunaan:

Generate Report → default
Reset Filter → outline
Delete Photo → destructive
Open Detail → secondary
Sidebar item → ghost
12.2 Badge

Badge digunakan untuk status dan priority.

Priority Badge
Priority	Style
Low	Green soft
Medium	Amber soft
High	Red soft
Critical	Dark red
Validation Status Badge
Status	Style
detected	Slate/blue soft
under_review	Amber
validated	Green
rejected	Red
needs_recheck	Orange
12.3 Card

Card dipakai untuk halaman CRUD, bukan untuk memenuhi dashboard map-first.

Gunakan card untuk:

Form section.
Summary kecil.
Detail metadata.
Report item.
User profile.

Jangan gunakan card-grid besar di dashboard.

12.4 Sheet

Sheet digunakan untuk:

Hotspot detail drawer.
Filter panel mobile.
Layer control mobile.
Validation form mobile.
Report options.

Sheet harus:

Tidak terlalu lebar.
Scrollable.
Punya header jelas.
Punya action footer jika form.
12.5 Dialog

Dialog digunakan untuk:

Generate report confirmation.
Delete confirmation.
Update status.
Import confirmation.
Permission warning.

Dialog tidak boleh digunakan untuk form besar yang panjang. Form panjang lebih cocok memakai dedicated page atau sheet.

12.6 Table

Table digunakan untuk halaman:

Hotspots.
AOI.
Analysis Runs.
GEE Imports.
Field Validations.
Reports.
Users.
Audit Logs.

Table harus memiliki:

Search.
Filter.
Status badge.
Action dropdown.
Pagination.
Empty state.
Loading skeleton.
12.7 Tabs

Tabs digunakan jika data detail terlalu banyak.

Contoh Hotspot Detail:

Overview
Indices
Validations
Photos
Reports
Audit

Contoh Analysis Run Detail:

Overview
Hotspots
Imports
Layers
Reports
12.8 Form

Form menggunakan pola shadcn/ui.

Setiap form harus punya:

Label.
Description jika field teknis.
Error message.
Required indicator.
Submit loading state.
Cancel button.
Toast success/error.
12.9 Toast

Toast digunakan untuk feedback singkat:

Data berhasil disimpan.
Import berhasil.
Upload foto berhasil.
Report berhasil dibuat.
Akses ditolak.
Error API.

Toast tidak boleh menggantikan error detail di form.

12.10 Skeleton

Skeleton digunakan saat loading.

Gunakan skeleton untuk:

Table loading.
Dashboard metric loading.
Detail drawer loading.
Gallery loading.
Report list loading.
13. WebGIS Visual Standard
13.1 Map Canvas

Map canvas harus dominan.

Rekomendasi style:

Full height dalam workspace.
Border halus.
Rounded pada container jika tidak fullscreen.
Layer controls mengambang.
Tidak terlalu banyak overlay.
Tidak menutup hotspot utama.
13.2 AOI Layer

AOI layer style:

Property	Value
Stroke	Teal dark
Stroke width	2
Fill	Teal soft
Fill opacity	0.08 - 0.12
Dash array	Optional untuk draft AOI

AOI draft:

stroke dashed
opacity lebih rendah
badge: Draft AOI

AOI verified:

stroke solid
badge: Verified AOI
13.3 Hotspot Polygon

Hotspot polygon berdasarkan priority:

Priority	Stroke	Fill	Fill Opacity
Low	Green	Green soft	0.25
Medium	Amber	Amber soft	0.30
High	Red	Red soft	0.35

Selected hotspot:

stroke lebih tebal
fill opacity sedikit lebih tinggi
outline putih tipis jika memungkinkan
13.4 Hotspot Centroid

Centroid marker:

Priority	Marker
Low	small green dot
Medium	amber dot
High	red dot

High priority boleh memiliki pulse ringan, tetapi:

Durasi lambat.
Tidak terlalu besar.
Tidak semua marker bergerak.
Respect prefers-reduced-motion.
13.5 Map Popup

Popup harus ringkas.

Isi popup:

Hotspot code.
Priority.
Validation status.
Area.
Detected at.
Button View Detail.

Popup tidak boleh menampilkan seluruh indeks teknis.

Detail teknis berada di drawer atau halaman detail.

13.6 Floating Legend

Legend harus kecil tetapi jelas.

Isi legend:

Priority low.
Priority medium.
Priority high.
Detected.
Validated.
Rejected.
Disclaimer kecil.

Posisi:

bottom-left atau bottom-right

Jangan menutup layer control atau tombol zoom.

13.7 Layer Control

Layer control menggunakan panel compact.

Isi:

AOI.
Hotspot polygon.
Hotspot centroid.
Selected highlight.
Static map jika tersedia.
Basemap OSM / Satellite internal jika tersedia.

Gunakan shadcn Switch atau Checkbox.

14. Status Visual Standard
14.1 Priority
Priority	Label	Color
low	Low	Green
medium	Medium	Amber
high	High	Red
14.2 Validation Status
Status	Label	Color
detected	Detected	Slate/Blue
under_review	Under Review	Amber
validated	Validated	Green
rejected	Rejected	Red
needs_recheck	Needs Recheck	Orange
14.3 Analysis Run Status
Status	Label	Color
draft	Draft	Slate
processing	Processing	Blue
processed	Processed	Green
failed	Failed	Red
archived	Archived	Muted
14.4 Sensitivity Level
Sensitivity	Label	Color
public	Public	Green
internal	Internal	Blue
restricted	Restricted	Red
15. Page Design Standard
15.1 Page Header

Setiap halaman internal harus memiliki Page Header.

Isi:

Breadcrumb.
Page title.
Page description.
Primary action button jika ada.
Secondary action jika perlu.

Contoh:

Hotspots
Pantau dan kelola indikasi awal perubahan tutupan mangrove dari hasil analisis GEE.
[Import GEE Result] [Export]
15.2 Dashboard Page

Dashboard hanya berisi:

Peta.
Summary compact.
Filter penting.
Layer control.
Hotspot selected drawer.
Shortcut ke halaman detail.

Dashboard tidak berisi:

Full user management.
Full report list.
Full validation management.
Full AOI CRUD.
Full audit log.
15.3 List Page

List page menggunakan struktur:

Page Header
→ Filter Bar
→ Data Table
→ Pagination

Komponen:

shadcn Table.
shadcn Input.
shadcn Select.
shadcn Badge.
shadcn Dropdown Menu.
shadcn Pagination jika tersedia atau custom Tailwind.
15.4 Detail Page

Detail page menggunakan struktur:

Page Header
→ Summary Section
→ Tabs
   ├── Overview
   ├── Technical Data
   ├── Related Data
   └── Audit/History

Detail page harus lebih lengkap daripada drawer.

Drawer hanya ringkasan.

15.5 Form Page

Form page menggunakan struktur:

Page Header
→ Form Card
→ Section Group
→ Submit Footer

Form panjang tidak dimasukkan ke dialog kecil.

16. Landing Page Design Standard
16.1 Landing Page Personality

Landing page harus terasa:

Modern.
Visual.
Berenergi.
Cocok untuk lomba.
Tetap kredibel.
Tidak terlalu formal seperti dashboard internal.
16.2 Landing Page Section

Struktur wajib:

Navbar
Hero
Problem
Why It Matters
Solution
How It Works
Feature Highlights
Technology Stack
Impact
Public Dashboard Preview
CTA
Footer
16.3 Landing Page Visual Rules

Boleh:

Animated background ringan.
Scroll reveal.
Gradient halus.
Interactive card secukupnya.
Visual map preview.
Step timeline.
Floating icon.
Micro animation.

Tidak boleh:

Efek terlalu berat.
Animasi berlebihan.
Cursor effect yang mengganggu.
Terlalu banyak gradient warna-warni.
Komponen yang tidak relevan dengan sistem.
Menampilkan koordinat presisi.
Menampilkan data internal.
16.4 Landing Page Library Usage

Library referensi boleh dipakai hanya untuk landing page.

Aturan:

Jangan install semua library sekaligus.
Pilih hanya library yang benar-benar diperlukan.
Jika hanya butuh inspirasi visual, cukup tiru pola dengan Tailwind.
Jangan membawa komponen landing page ke internal app.
Jangan membuat landing page mengganggu build React/Laravel.
17. Public Dashboard Design Standard

Public dashboard harus aman dan sederhana.

17.1 Public Map

Public map menampilkan:

Generalized hotspot.
Public summary.
Latest analysis info.
Disclaimer.
Legend umum.

Tidak menampilkan:

Polygon detail.
Koordinat presisi.
Foto.
Catatan validasi.
Report internal.
Raw properties.
17.2 Public Disclaimer

Disclaimer harus selalu terlihat.

Contoh teks:

Data yang ditampilkan merupakan indikasi awal berbasis analisis satelit dan telah digeneralisasi untuk melindungi data sensitif. Informasi ini bukan vonis hukum dan tetap memerlukan validasi lapangan.
18. Field Validation UI Standard
18.1 Validation Form

Form validasi harus mudah digunakan di desktop dan mobile browser.

Field utama:

Validation status.
Observed condition.
Confidence score.
Notes.
Visited at.
Sensitivity level.
Latitude.
Longitude.
Ambil lokasi browser.

Gunakan:

shadcn Form.
shadcn Select.
shadcn Textarea.
shadcn Input.
shadcn Button.
shadcn Alert untuk permission/geolocation warning.
18.2 Geolocation Button

Tombol ambil lokasi:

Style:

Button outline + icon location

State:

Idle.
Loading.
Success.
Error.
Permission denied.

Pesan harus jelas.

18.3 Photo Upload

Photo upload harus punya:

Dropzone atau input file.
Preview gambar.
Caption.
Upload progress.
Error jika file tidak valid.
Gallery setelah upload.

Gunakan internal shadcn + Tailwind, bukan library dekoratif.

18.4 Photo Gallery

Gallery internal:

Grid sederhana.
Preview modal/sheet.
Caption.
Taken at.
Delete action jika berwenang.
Tidak menampilkan file path.
19. Report UI Standard
19.1 Generate Report Modal

Gunakan shadcn Dialog atau Sheet.

Isi:

Report type.
Include validation photos.
Include precise coordinates.
Disclaimer.
Generate button.
Cancel button.

Tombol generate harus loading saat proses.

19.2 Report List

Report list menampilkan:

Report code.
Report type.
Title.
Generated by.
Generated at.
Sensitivity level.
Download action.

Tidak menampilkan:

file_path.
storage path.
lokasi file internal.
19.3 Download State

Saat download:

Tampilkan loading.
Jika sukses, file terunduh.
Jika forbidden, tampilkan error permission.
Jika file hilang, tampilkan error not found.
20. Empty State

Empty state harus membantu user memahami langkah berikutnya.

20.1 Empty AOI
Belum ada AOI.
Tambahkan Area of Interest untuk mulai menjalankan analisis.
[Create AOI]
20.2 Empty Analysis Run
Belum ada analysis run.
Buat analysis run untuk mencatat periode before-after yang akan dianalisis.
[Create Analysis Run]
20.3 Empty Hotspot
Belum ada hotspot.
Import hasil GeoJSON dari Google Earth Engine untuk menampilkan hotspot.
[Import GEE Result]
20.4 Empty Validation
Belum ada validasi lapangan.
Pilih hotspot dan tambahkan validasi untuk memperkuat hasil deteksi.
20.5 Empty Report
Belum ada report.
Generate laporan PDF dari hotspot atau analysis run.
21. Loading State

Gunakan Skeleton shadcn.

21.1 Dashboard Loading

Tampilkan:

Skeleton metric strip.
Map loading overlay.
Skeleton filter panel.
Skeleton detail drawer jika selected hotspot dimuat.
21.2 Table Loading

Tampilkan:

Skeleton row.
Skeleton filter.
Skeleton pagination.
21.3 Form Submit Loading

Tampilkan:

Button disabled.
Spinner kecil.
Teks "Menyimpan..." atau "Memproses...".
22. Error State

Gunakan shadcn Alert.

Jenis error:

API gagal.
Permission denied.
File gagal diupload.
GeoJSON invalid.
Report gagal dibuat.
Geolocation ditolak.
Data tidak ditemukan.

Contoh:

Gagal memuat hotspot.
Periksa koneksi atau coba lagi.
[Retry]
23. Motion Standard

Motion harus halus dan fungsional.

23.1 Durasi
Interaksi	Durasi
Hover	150ms
Button press	100ms
Panel reveal	250ms
Drawer/Sheet	250-300ms
Dialog	200-250ms
Page transition ringan	200-300ms
High priority pulse	2s, terbatas
23.2 Motion Rules

Boleh:

Hover halus.
Drawer slide.
Dialog fade/scale ringan.
Skeleton pulse.
Marker pulse hanya priority high.
Scroll reveal ringan di landing page.

Tidak boleh:

Animasi terus-menerus tanpa fungsi.
Banyak marker bergerak bersamaan.
Animasi besar di atas Leaflet map.
Efek bouncy berlebihan.
Motion yang memperlambat input form.
23.3 Reduced Motion

Harus menghormati:

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
24. Accessibility Standard
24.1 Contrast
Teks utama harus memiliki kontras tinggi.
Badge warna harus tetap terbaca.
Jangan mengandalkan warna saja.
Gunakan label teks bersama warna.
24.2 Keyboard Navigation

Elemen yang harus bisa diakses keyboard:

Sidebar menu.
Dropdown.
Dialog.
Sheet.
Form.
Table action.
Report button.
Upload button.
24.3 ARIA

Gunakan aria-label untuk:

Map controls.
Close drawer.
Toggle layer.
Filter button.
Delete photo.
Download report.
24.4 Focus State

Focus state harus jelas.

Gunakan ring sesuai shadcn default.

Jangan menghapus outline tanpa pengganti.

25. Responsive Standard
25.1 Desktop

Desktop adalah mode utama untuk admin dan NGO.

Layout:

Sidebar
Topbar
Content

Dashboard:

Left panel + Map + Drawer
25.2 Tablet

Tablet menggunakan:

Sidebar collapsible.
Panel menjadi sheet.
Drawer tetap bisa muncul.
Peta tetap dominan.
25.3 Mobile Browser

Mobile browser terutama untuk validator lapangan.

Prioritas mobile:

Login mudah.
Hotspot list mudah dibuka.
Detail hotspot terbaca.
Form validasi nyaman.
Tombol ambil lokasi jelas.
Upload foto sederhana.

Dashboard map lengkap boleh disederhanakan.

26. Iconography

Gunakan lucide-react untuk internal app.

Rekomendasi ikon:

Fungsi	Icon
Dashboard	LayoutDashboard
Map	Map
Hotspot	MapPin
AOI	Scan
Analysis Run	Activity
GEE Import	UploadCloud
Validation	ClipboardCheck
Photo	Image
Report	FileText
Users	Users
Roles	Shield
Audit Log	History
Settings	Settings
Logout	LogOut
Download	Download
Alert	AlertTriangle

Aturan:

Ikon internal harus konsisten.
Jangan campur banyak icon library.
Ukuran ikon standar 16px atau 18px.
Sidebar icon 18px.
Button icon 16px.
27. Component Inventory
27.1 Layout Components
Component	Fungsi	Basis
AppShell	Layout internal utama	shadcn + Tailwind
SidebarNav	Navigasi internal	shadcn/sidebar atau custom Tailwind
TopBar	User menu dan title area	shadcn Dropdown
PageHeader	Judul halaman	Custom + shadcn Button
BreadcrumbBar	Navigasi lokasi halaman	shadcn Breadcrumb
ContentContainer	Pembungkus konten	Tailwind
27.2 WebGIS Components
Component	Fungsi	Basis
WebGISMap	Peta internal	React Leaflet
PublicHotspotMap	Peta publik	React Leaflet
LayerControlPanel	Toggle layer	shadcn Switch/Checkbox
HotspotFilterPanel	Filter hotspot	shadcn Select/Input
FloatingLegend	Legend peta	Tailwind + Badge
MetricStrip	Ringkasan cepat	shadcn Card compact
HotspotPopup	Popup peta	Leaflet popup + Tailwind
HotspotDetailDrawer	Detail hotspot ringkas	shadcn Sheet
27.3 Data Management Components
Component	Fungsi	Basis
DataTable	Tabel reusable	shadcn Table
StatusBadge	Status visual	shadcn Badge
PriorityBadge	Priority visual	shadcn Badge
ActionDropdown	Aksi row table	shadcn Dropdown
FilterBar	Filter list page	shadcn Input/Select
PaginationBar	Navigasi halaman	Custom/shadcn
27.4 Validation Components
Component	Fungsi	Basis
FieldValidationForm	Form validasi	shadcn Form
GeolocationButton	Ambil lokasi browser	shadcn Button
ValidationHistory	Riwayat validasi	shadcn Card/Accordion
ValidationPhotoUploader	Upload foto	shadcn + Tailwind
ValidationPhotoGallery	Gallery foto	shadcn Dialog/Sheet
27.5 Report Components
Component	Fungsi	Basis
ReportGenerateDialog	Generate PDF	shadcn Dialog
ReportOptionsForm	Opsi report	shadcn Checkbox
ReportList	Daftar report	shadcn Table/Card
ReportDownloadButton	Download report	shadcn Button
DisclaimerBox	Peringatan legal/etik	shadcn Alert
27.6 Feedback Components
Component	Fungsi	Basis
EmptyState	Data kosong	shadcn Card/Alert
ErrorState	Error API	shadcn Alert
LoadingSkeleton	Loading	shadcn Skeleton
PermissionDeniedState	Akses ditolak	shadcn Alert
ProtectedDataNotice	Penjelasan data sensitif	shadcn Alert
28. Internal Page Standard
28.1 Dashboard

Visual target:

Map-first
Compact panel
Minimal card
Floating control
Right drawer

Jangan:

Menaruh semua validasi di dashboard.
Menaruh full report table di dashboard.
Menaruh user management di dashboard.
Membuat dashboard jadi halaman CRUD besar.
28.2 Hotspots Page

Visual target:

PageHeader
FilterBar
DataTable
ActionDropdown
Pagination

Aksi:

View detail.
Update status jika berwenang.
Open map.
Generate report jika berwenang.
28.3 AOI Page

Visual target:

AOI table
Map preview
Create/Edit form
Verification badge
28.4 Analysis Runs Page

Visual target:

Run table
Status badge
Summary metric
Detail tabs
Import shortcut
28.5 GEE Imports Page

Visual target:

Upload panel
Import history table
Validation result
Error report
28.6 Field Validations Page

Visual target:

Validation table
Status badge
Validator info
Photo count
Detail drawer/page
28.7 Reports Page

Visual target:

Report table
Generate action
Download button
Sensitivity badge
Disclaimer
28.8 Users & Roles Page

Visual target:

User table
Role badge
Permission matrix
Status active/inactive
28.9 Audit Logs Page

Visual target:

Audit table
Filter by action/user/date
JSON detail collapsible
29. CSS Variable Recommendation

Gunakan CSS variable untuk menyatukan design token.

:root {
  --me-primary: #0F766E;
  --me-primary-dark: #115E59;
  --me-primary-soft: #CCFBF1;
  --me-primary-muted: #F0FDFA;

  --me-mangrove: #166534;
  --me-mangrove-soft: #DCFCE7;
  --me-forest: #14532D;
  --me-leaf: #22C55E;

  --me-coast: #0369A1;
  --me-coast-soft: #E0F2FE;
  --me-water: #0284C7;
  --me-satellite: #1E3A8A;

  --me-risk-low: #16A34A;
  --me-risk-medium: #D97706;
  --me-risk-high: #DC2626;
  --me-risk-critical: #991B1B;

  --me-background: #F8FAFC;
  --me-surface: #FFFFFF;
  --me-surface-muted: #F1F5F9;
  --me-border: #E2E8F0;
  --me-border-strong: #CBD5E1;
  --me-text: #0F172A;
  --me-text-muted: #64748B;
  --me-text-soft: #94A3B8;
}

Jika shadcn menggunakan token default seperti --background, --foreground, --primary, dan --muted, mapping-nya dapat diarahkan ke warna MANGROVE-EYE.

30. Do and Don't
30.1 Do
Gunakan shadcn/ui untuk internal app.
Pisahkan fitur page per page.
Jadikan peta sebagai pusat dashboard.
Gunakan badge untuk status.
Gunakan drawer untuk detail ringkas.
Gunakan dedicated page untuk detail lengkap.
Gunakan alert untuk disclaimer.
Gunakan protected file URL.
Gunakan skeleton untuk loading.
Gunakan empty state yang informatif.
Gunakan motion halus dan fungsional.
30.2 Don't
Jangan gunakan ReactBits/Vengence/Animate UI/Uiverse/Uilora/AnimMasterLib/Skiper UI di internal app.
Jangan tumpuk semua fitur di Dashboard.jsx.
Jangan tampilkan data sensitif di public dashboard.
Jangan kirim storage path mentah ke frontend.
Jangan gunakan animasi berat di peta.
Jangan gunakan card-grid besar di dashboard.
Jangan gunakan gradient berlebihan.
Jangan membuat UI seperti crypto/AI landing page.
Jangan hilangkan focus state.
Jangan membuat form panjang dalam dialog kecil.
31. Acceptance Criteria Design System

Design system dianggap berhasil jika:

Internal app memakai shadcn/ui secara konsisten.
Landing page terlihat modern tetapi tetap relevan.
Dashboard internal tetap map-first.
Fitur internal dipisah page per page.
Public dashboard tidak membocorkan data sensitif.
Warna status dan priority konsisten.
Semua form memiliki error state.
Semua list page memiliki loading, empty, dan error state.
File foto/report tidak menampilkan path mentah.
Motion tidak mengganggu Leaflet map.
UI tidak terlihat seperti template AI generik.
Build frontend tetap lulus.
Tampilan nyaman di desktop, tablet, dan mobile browser.
Validator bisa menggunakan form validasi di mobile.
Report generation mudah dipahami dan memiliki disclaimer.
32. Kesimpulan

Design system MANGROVE-EYE mengarahkan visual sistem menjadi platform WebGIS yang profesional, rapi, dan terpercaya.

Internal app menggunakan shadcn/ui sebagai standar utama agar konsisten, modular, dan mudah dirawat. Semua fitur setelah login harus disusun page per page, bukan ditumpuk dalam satu dashboard besar.

Dashboard internal tetap map-first karena fungsi utama sistem adalah membaca sebaran hotspot dan perubahan spasial. Fitur operasional seperti AOI, analysis run, GEE import, validation, report, user management, dan audit log ditempatkan pada halaman khusus.

Landing page boleh lebih visual dan interaktif menggunakan referensi website/library yang telah ditentukan, tetapi tetap harus menjaga konteks lingkungan, performa, dan keamanan data.