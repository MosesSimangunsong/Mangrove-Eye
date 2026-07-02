UI Dashboard Plan MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	UI Dashboard Plan
Versi	v1.0
Acuan Utama	docs/PRD.md, docs/MVP_SCOPE.md, docs/API_CONTRACT.md, motion.md
Frontend	React
WebGIS Library	React Leaflet
Styling	Tailwind CSS
Motion	Tailwind CSS + Motion for React
Target Penyimpanan	docs/UI_DASHBOARD_PLAN.md
2. Tujuan Dokumen

Dokumen ini menjelaskan rencana UI dashboard MANGROVE-EYE untuk MVP. Fokus utama UI adalah membangun dashboard WebGIS yang rapi, profesional, ringan, dan mudah digunakan untuk membaca hasil deteksi dini dugaan deforestasi mangrove.

UI MANGROVE-EYE tidak diarahkan menjadi landing page penuh card, gradient berlebihan, atau tampilan generik yang terlihat seperti template AI. Sistem ini harus terasa seperti spatial intelligence dashboard: peta menjadi pusat analisis, data muncul sebagai panel pendukung, dan animasi hanya digunakan untuk membantu pemahaman status.

3. Prinsip Utama UI
3.1 Map-First, Not Card-First

Peta WebGIS adalah elemen utama dashboard. Statistik, filter, layer, dan detail hotspot tidak boleh mendominasi layar dalam bentuk banyak card besar.

Prioritas tampilan:

Peta WebGIS
→ Hotspot
→ Layer dan filter
→ Detail hotspot
→ Statistik ringkas
→ Validasi dan laporan

Dashboard tidak boleh terlihat seperti:

[Card] [Card] [Card] [Card]
[Card] [Card] [Card] [Card]
[Card] [Card] [Card] [Card]

Dashboard lebih cocok menggunakan pola:

Top Bar
Left Layer Panel
Map Canvas
Right Detail Drawer
Floating Legend
Compact Metric Strip
Bottom Timeline
3.2 Calm by Default, Urgent by Signal

Tampilan dasar harus tenang, bersih, dan tidak bising. Namun, hotspot yang benar-benar penting boleh diberi sinyal visual yang lebih tegas.

Prinsip:

UI normal harus tenang.
Hotspot prioritas tinggi boleh diberi penanda kuat.
Tidak semua marker boleh bergerak.
Animasi hanya dipakai untuk perubahan status, fokus hotspot, dan loading.
Tidak ada animasi dekoratif yang berulang tanpa fungsi.
3.3 Data-Driven, Not Decorative

Setiap elemen UI harus menjawab kebutuhan operasional:

Elemen	Fungsi
Peta	Melihat lokasi dan sebaran hotspot
Layer control	Mengatur tampilan AOI, hotspot, before-after
Filter	Menyaring hotspot berdasarkan status, prioritas, periode
Detail drawer	Membaca detail satu hotspot
Metric strip	Melihat ringkasan cepat
Validation form	Mengisi hasil lapangan
Report action	Membuat laporan PDF

Elemen yang hanya mempercantik tanpa fungsi harus dihindari.

3.4 Sensitive Data Aware

UI harus membedakan tampilan publik dan internal.

Public viewer tidak boleh melihat:

koordinat presisi;
polygon zona konflik detail;
foto validasi;
catatan validator;
laporan PDF internal;
raw GeoJSON.

Internal user dapat melihat data sesuai role.

3.5 Smooth but Subtle Motion

Animasi harus:

cepat;
halus;
tidak bouncy;
tidak terlalu lambat;
tidak mengganggu peta;
tidak menahan interaksi user;
mengikuti prefers-reduced-motion.

Durasi standar:

Interaksi	Durasi
Hover / micro interaction	150–200 ms
Panel reveal	250–300 ms
Modal / drawer	250–300 ms
Page transition ringan	250–300 ms
Skeleton loading	Perlahan dan netral
Marker urgent pulse	2 detik, hanya untuk prioritas tinggi
4. Karakter Visual MANGROVE-EYE
4.1 Kesan yang Diinginkan

UI harus memberi kesan:

profesional;
bersih;
tenang;
spasial;
ilmiah;
dapat dipercaya;
tidak berlebihan;
cocok untuk advokasi lingkungan;
cocok untuk pengguna teknis dan non-teknis.
4.2 Kesan yang Harus Dihindari

UI tidak boleh terasa seperti:

dashboard AI generik;
landing page SaaS yang terlalu banyak card;
aplikasi game;
peta penuh animasi berdenyut;
desain terlalu glassmorphism;
gradient terlalu ramai;
efek shimmer mencolok;
halaman terlalu penuh statistik besar;
hero section terlalu promosi.
5. Layout Utama Dashboard
5.1 Struktur Layout Desktop

Rekomendasi layout utama:

┌─────────────────────────────────────────────────────────────┐
│ Top Bar: Logo, AOI, Analysis Run, Period, User              │
├───────────────┬─────────────────────────────┬───────────────┤
│ Left Panel    │                             │ Right Drawer  │
│ Layer         │        WebGIS Map           │ Hotspot Detail│
│ Filter        │        Main Canvas          │ Validation    │
│ Legend        │                             │ Report Action │
├───────────────┴─────────────────────────────┴───────────────┤
│ Bottom Timeline / Compact Metric Strip                       │
└─────────────────────────────────────────────────────────────┘
Keterangan
Area	Fungsi
Top Bar	Memilih AOI, analysis run, periode before-after
Left Panel	Layer, filter, legend, status visibility
Map Canvas	Peta utama React Leaflet
Right Drawer	Detail hotspot, validasi, laporan
Bottom Strip	Statistik ringkas dan timeline analisis
5.2 Struktur Layout Mobile / Tablet

Pada layar kecil, layout berubah menjadi:

┌───────────────────────────────┐
│ Top Bar Compact               │
├───────────────────────────────┤
│ WebGIS Map                    │
│                               │
│ Floating Layer Button         │
│ Floating Filter Button        │
├───────────────────────────────┤
│ Bottom Sheet: Detail/Filter   │
└───────────────────────────────┘

Prinsip mobile:

peta tetap menjadi pusat;
panel kiri berubah menjadi bottom sheet;
detail hotspot muncul sebagai bottom sheet;
metric strip dipadatkan;
hover diganti tap state;
animasi dibuat lebih sederhana.
6. Halaman dan Komponen UI
6.1 Public Dashboard
Tujuan

Memberikan informasi umum kepada publik tanpa membuka data sensitif.

Komponen
Komponen	Keterangan
Public Map	Peta umum dengan hotspot tergeneralisasi
Public Summary	Ringkasan jumlah hotspot dan estimasi area
Disclaimer Box	Penjelasan bahwa data adalah indikasi awal
Generalized Hotspot	Titik umum, bukan koordinat presisi
Public Legend	Keterangan status umum
Latest Analysis Info	Tanggal analisis terakhir
Layout

Public dashboard tetap map-first.

Top Bar
Map Canvas
Floating Public Summary
Floating Legend
Disclaimer Strip
Catatan

Public dashboard tidak perlu banyak card. Cukup ringkasan kecil yang menempel di atas peta.

6.2 Internal WebGIS Dashboard
Tujuan

Menjadi pusat kerja internal untuk membaca hasil analisis, memfilter hotspot, dan membuka detail hotspot.

Komponen
Komponen	Keterangan
AOI Selector	Memilih AOI Kwala Serapuh / zona konflik
Analysis Run Selector	Memilih hasil analisis
Period Display	Menampilkan before-after
Layer Control	Mengaktifkan AOI, hotspot, CMRI/MVI, before-after
Hotspot Filter	Filter status dan prioritas
Map Canvas	Peta utama
Hotspot Popup	Ringkasan hotspot
Detail Drawer	Detail lengkap hotspot
Metric Strip	Statistik ringkas
Legend	Warna prioritas dan status
6.3 Analysis Run Page
Tujuan

Menampilkan daftar dan detail proses analisis GEE yang pernah dilakukan.

Tampilan

Gunakan tabel ringkas atau list compact, bukan grid card besar.

Kolom utama:

Kolom	Keterangan
Nama Analysis Run	Nama proses analisis
AOI	Area yang dianalisis
Periode Before	Tanggal awal
Periode After	Tanggal akhir
Indeks	MVI, CMRI, NDVI, NDWI
Jumlah Hotspot	Total hotspot
Status	Draft / processed / published
Aksi	Detail / Import / Publish
Detail Analysis Run

Detail ditampilkan dalam panel atau page sederhana:

metadata analisis;
parameter cloud threshold;
threshold MVI/CMRI;
jumlah hotspot;
total estimasi luas;
daftar layer;
tombol import hasil GEE;
tombol buka di map.
6.4 Hotspot Detail Drawer
Tujuan

Menampilkan informasi lengkap satu hotspot tanpa membuat user keluar dari peta.

Posisi

Right drawer pada desktop, bottom sheet pada mobile.

Isi Detail
Section	Isi
Header	Kode hotspot, prioritas, status
Location	Koordinat, AOI, estimasi luas
Index Summary	MVI/CMRI before-after dan delta
Supporting Index	NDVI/NDWI
Map Preview	Mini map atau highlight area
Validation Summary	Status validasi terakhir
Actions	Validasi, export PDF, ubah status
Prinsip
Detail drawer tidak boleh terlalu penuh di bagian awal.
Gunakan collapsible section untuk data teknis.
Informasi paling penting diletakkan di atas:
prioritas;
status;
luas;
delta MVI/CMRI;
tombol validasi.
6.5 Field Validation Page / Panel
Tujuan

Memungkinkan validator mengisi hasil pengecekan lapangan.

Bentuk UI

Untuk MVP, validasi dapat berupa form dalam drawer atau halaman detail.

Field utama:

Field	Tipe
Status validasi	Select
Kondisi lapangan	Select
Catatan	Textarea
Koordinat validasi	Map picker / auto input
Upload foto	File upload
Tanggal kunjungan	Date/time
Tingkat keyakinan	Select
Status Validasi
under_review
validated
rejected
needs_recheck
Prinsip UI Validasi
Form harus pendek.
Upload foto jelas.
Status harus mudah dipilih.
Jangan terlalu banyak input wajib.
Catatan lapangan harus terlihat penting.
Tombol submit harus jelas.
6.6 Report Page / Report Action
Tujuan

Membuat dan mengakses laporan PDF dari hotspot.

MVP

PDF per hotspot adalah wajib. PDF per analysis run opsional.

UI

Pada detail hotspot:

[Generate PDF Report]
[Download Latest Report]

Sebelum generate PDF, tampilkan modal konfirmasi:

Laporan ini merupakan indikasi awal, bukan vonis hukum final.
Isi Ringkasan di UI
kode hotspot;
AOI;
periode analisis;
estimasi luas;
status validasi;
apakah foto validasi akan disertakan;
apakah koordinat presisi akan disertakan.
6.7 Admin Data Management
Tujuan

Mengelola data sistem seperti user, role, AOI, analysis run, import GEE, dan audit log.

Tampilan

Gunakan tabel dan form sederhana.

Hindari:

card grid besar untuk data administratif;
animasi row-by-row;
icon terlalu banyak;
action button warna-warni berlebihan.

Gunakan:

compact table;
filter ringkas;
badge status;
drawer form;
modal konfirmasi;
empty state sederhana.
7. Komponen UI Utama
7.1 Top Bar
Fungsi

Navigasi utama dan kontrol konteks analisis.

Isi
Elemen	Keterangan
Logo MANGROVE-EYE	Kiri
AOI Selector	Pilih AOI
Analysis Run Selector	Pilih analisis
Period Info	Before-after
User Menu	Role, logout
Prinsip

Top bar harus tipis dan tidak mengambil terlalu banyak ruang peta.

7.2 Left Control Panel
Fungsi

Kontrol layer, filter, dan legend.

Section
Layer
Filter
Legend
Basemap
Analysis Info
Behavior
Collapsible.
Default terbuka pada desktop.
Default tertutup pada mobile.
Bisa diperkecil menjadi icon-only.
7.3 Map Canvas
Fungsi

Pusat visualisasi spasial.

Layer MVP
Layer	Status
Basemap	Wajib
AOI utama	Wajib
Zona konflik	Jika tersedia
Hotspot polygon	Wajib
Hotspot centroid	Wajib
Before image	Opsional
After image	Opsional
MVI/CMRI layer	Opsional
Delta layer	Opsional
Interaksi
Klik hotspot membuka popup.
Klik detail membuka right drawer.
Hover hotspot memberi highlight ringan.
Filter mengubah layer hotspot.
Zoom/pan tetap natural dari Leaflet.
7.4 Right Detail Drawer
Fungsi

Menampilkan detail entitas terpilih.

Entitas yang Didukung
Hotspot.
AOI.
Analysis Run.
Validation record.
Behavior
Slide dari kanan.
Lebar desktop sekitar 380–460 px.
Bisa ditutup.
Pada mobile menjadi bottom sheet.
7.5 Compact Metric Strip
Fungsi

Menampilkan statistik singkat tanpa banyak card.

Posisi
Desktop: bawah peta atau di atas peta sebagai strip tipis.
Mobile: collapsible summary.
Isi
Total Hotspot | High Priority | Validated | Needs Recheck | Total Area
Visual

Gunakan angka ringkas, icon minimal, dan divider tipis.

7.6 Floating Legend
Fungsi

Menjelaskan warna dan simbol pada peta.

Isi
Simbol	Makna
Merah	High priority
Kuning	Medium priority
Hijau/Biru	Low/validated
Outline putus	Needs recheck
Abu-abu	Rejected

Legend harus kecil, bisa collapse, dan tidak menutupi peta.

7.7 Filter Panel
Filter MVP
Filter	Tipe
Analysis run	Select
Status validasi	Multi-select
Prioritas	Multi-select
Rentang tanggal	Date range
AOI	Select
Minimum luas	Number / slider sederhana

Filter tidak perlu banyak card. Gunakan panel compact.

8. Visual Style Guide
8.1 Warna

Rekomendasi karakter warna:

Kategori	Arah Warna
Background utama	netral gelap lembut atau putih bersih
Panel	putih/off-white atau dark slate
Primary	hijau mangrove / teal
Warning	amber
Danger	red muted
Validated	green
Rejected	gray
Map highlight	warna tegas tapi tidak neon

Catatan:

Warna tidak boleh terlalu neon karena dapat membuat dashboard terlihat seperti game atau template AI.

8.2 Typography

Gunakan font sans-serif modern dan bersih.

Prinsip:

heading tidak terlalu besar;
body mudah dibaca;
label peta jelas;
angka statistik ringkas;
jangan terlalu banyak variasi font weight.
8.3 Spacing

Gunakan spacing rapat tetapi lega.

Prinsip:

dashboard tidak boleh terasa kosong;
tetapi juga tidak boleh sesak;
panel harus compact;
card besar hanya digunakan bila benar-benar perlu.
8.4 Card Usage

Card tetap boleh digunakan, tetapi terbatas.

Gunakan card untuk:

ringkasan detail hotspot;
form validasi;
modal konfirmasi;
info penting.

Hindari card untuk:

semua statistik;
semua menu;
semua fitur;
semua section dashboard.

Alternatif card:

strip;
panel;
drawer;
table;
collapsible;
inline badge;
map overlay.
9. Motion Design Plan
9.1 Motion Stack

Rekomendasi stack:

Tailwind CSS
+ Motion for React
+ React CountUp opsional

Install opsional:

npm install motion react-countup react-intersection-observer

Hindari:

GSAP
Animate.css
Lottie
React Spring
9.2 Motion Preset

Buat file:

resources/js/lib/motionPresets.js

Isi konsep:

export const mangroveEasing = [0.16, 1, 0.3, 1];

export const smoothTransition = {
  duration: 0.3,
  ease: mangroveEasing,
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const drawerMotion = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.2 },
  },
};

Catatan:

Offset cukup 12–16 px. Jangan memakai pergeseran terlalu jauh.

9.3 Komponen Motion yang Dibangun
Komponen	Fungsi	Status
<FadeIn>	Reveal elemen sederhana	Wajib
<FadeInUp>	Reveal panel/heading	Wajib
<SlideDrawer>	Right drawer detail hotspot	Wajib
<SectionReveal>	Landing/public info jika ada	Opsional
<SkeletonBlock>	Loading state	Wajib
<KpiCountUp>	Animasi angka statistik	Opsional
<PulseMarker>	Marker prioritas tinggi via CSS/Leaflet	Wajib
<StatusBadge>	Badge status	Wajib
<LayerToggle>	Toggle layer	Wajib
9.4 Motion yang Digunakan
Area	Motion
Right drawer	slide-in halus
Filter panel	fade/slide pendek
Modal report	scale 0.98 → 1
Hotspot popup	fade ringan
Skeleton loading	pulse netral
High priority marker	CSS pulse terbatas
Status change	badge fade/soft color transition
Metric number	count up opsional
9.5 Motion yang Dihindari
Efek	Alasan
Bouncy card	Terlihat tidak profesional
Parallax	Mengganggu dashboard spasial
Heavy 3D tilt	Terlihat seperti template promosi
Banyak marker pulse	Membuat peta kacau
Animate table row satu-satu	Lambat dan mengganggu admin
Shimmer tajam	Terlihat murahan dan memusingkan
Looping decoration	Tidak punya fungsi operasional
10. WebGIS Motion Rules
10.1 Marker Animation

Marker prioritas tinggi boleh memiliki pulse, tetapi hanya pada kondisi tertentu:

priority = high
AND validation_status in detected / under_review / needs_recheck

Marker yang sudah validated atau rejected tidak perlu pulse.

10.2 Implementasi Marker

Gunakan L.divIcon dengan CSS class, bukan animasi React state berulang.

Contoh konsep class:

.urgent-pulse-marker {
  position: relative;
}

.urgent-pulse-marker::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: rgba(220, 38, 38, 0.25);
  animation: urgentPulse 2s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.35);
  }
}
10.3 Aturan Jumlah Marker Pulse

Jika hotspot high priority terlalu banyak, pulse hanya aktif untuk:

10 hotspot teratas;
hotspot terbaru;
hotspot yang sedang dipilih;
atau hotspot yang belum divalidasi lebih dari periode tertentu.
11. RBAC-Based UI
11.1 Public Viewer UI

Public viewer melihat:

dashboard umum;
summary tergeneralisasi;
hotspot generalisasi;
disclaimer;
peta tanpa koordinat presisi.

Public viewer tidak melihat:

drawer detail internal;
foto validasi;
catatan validator;
export PDF;
raw GeoJSON;
polygon konflik detail.
11.2 Validator UI

Validator melihat:

hotspot presisi;
detail hotspot;
koordinat;
form validasi;
upload foto;
riwayat validasi.

Validator tidak perlu melihat:

user management;
audit log penuh;
konfigurasi analysis run;
semua laporan internal jika tidak diberi izin.
11.3 NGO / Advocate UI

NGO melihat:

hotspot detail;
hasil validasi;
laporan PDF;
summary analysis run;
data untuk advokasi.

NGO dapat:

generate/download PDF jika diberi permission;
melihat foto validasi;
membaca catatan validasi.
11.4 Admin UI

Admin melihat dan mengelola:

AOI;
analysis run;
import GEE;
hotspot;
validasi;
laporan;
user;
role;
audit log ringkas.
12. UI State Design
12.1 Loading State

Gunakan skeleton netral.

Contoh:

Loading map layer...
Loading hotspot...
Loading validation...

Hindari spinner besar di tengah dashboard kecuali saat proses penting.

12.2 Empty State

Contoh empty state:

Belum ada hotspot pada analysis run ini.
Coba pilih analysis run lain atau impor hasil GEE terlebih dahulu.
12.3 Error State

Contoh error:

Layer gagal dimuat.
Periksa koneksi atau coba muat ulang layer.
12.4 Permission State

Contoh:

Anda tidak memiliki akses untuk melihat koordinat presisi hotspot ini.
12.5 Sensitive Data State

Untuk public viewer:

Lokasi telah digeneralisasi demi keamanan data lapangan.
13. Page-by-Page UI Plan
13.1 Public Dashboard
Layout
Top Bar
Full Map
Floating Summary
Floating Legend
Disclaimer Strip
Komponen
public map;
generalized hotspot layer;
summary strip;
latest analysis info;
disclaimer.
Motion
map muncul langsung;
summary fade-in 200ms;
tidak ada animasi marker berlebihan.
13.2 Internal Dashboard
Layout
Top Bar
Left Panel
Map Canvas
Right Drawer
Bottom Metric Strip
Komponen
AOI selector;
analysis run selector;
layer control;
hotspot filter;
map;
detail drawer;
metric strip;
legend.
Motion
left panel collapse smooth;
right drawer slide-in;
hotspot selected highlight;
marker urgent pulse terbatas.
13.3 Analysis Run Management
Layout
Header compact
Filter row
Table list
Detail drawer/modal
Komponen
list analysis run;
create analysis run;
import GEE button;
publish status;
layer metadata.
Motion
table fade cepat;
modal create analysis run scale-in ringan;
tidak ada row animation berlebihan.
13.4 AOI Management
Layout
Split view:
Left table/list
Right map preview
Komponen
AOI list;
import GeoJSON;
map preview;
metadata form;
verification status.
Motion
map preview static;
form drawer slide;
upload progress sederhana.
13.5 Hotspot Detail
Layout
Right Drawer
Header
Index Summary
Location
Validation History
Actions
Komponen
status badge;
priority badge;
index table compact;
mini map;
validation summary;
report action.
Motion
drawer slide-in;
collapsible fade;
status badge color transition.
13.6 Field Validation
Layout
Form Panel
Photo Upload
Map Point Preview
Submit Action
Komponen
validation status select;
observed condition select;
note textarea;
photo upload;
coordinate input;
submit button.
Motion
upload loading skeleton;
success toast fade;
no decorative animation.
13.7 Report
Layout
Report Modal
Summary
Options
Generate Button
Download Result
Komponen
report title;
include photo checkbox;
include coordinate checkbox;
disclaimer;
generate PDF button.
Motion
modal scale-in subtle;
PDF generating loading state;
success state with download button.
14. Component Architecture

Rekomendasi struktur komponen frontend:

resources/js/
  Components/
    Layout/
      AppShell.jsx
      TopBar.jsx
      LeftPanel.jsx
      RightDrawer.jsx
      BottomMetricStrip.jsx

    Map/
      WebGISMap.jsx
      AoiLayer.jsx
      HotspotLayer.jsx
      HotspotPopup.jsx
      LayerControl.jsx
      FloatingLegend.jsx
      PulseMarker.js

    Dashboard/
      DashboardSummary.jsx
      MetricStrip.jsx
      AnalysisRunSelector.jsx
      HotspotFilter.jsx

    Hotspots/
      HotspotDetailDrawer.jsx
      HotspotIndexSummary.jsx
      HotspotValidationHistory.jsx
      HotspotActions.jsx

    Validations/
      FieldValidationForm.jsx
      ValidationPhotoUpload.jsx
      ValidationStatusBadge.jsx

    Reports/
      ReportGenerateModal.jsx
      ReportDownloadButton.jsx

    Motion/
      FadeIn.jsx
      FadeInUp.jsx
      SlideDrawer.jsx
      SkeletonBlock.jsx

  lib/
    motionPresets.js
    mapStyles.js
    statusStyles.js
15. Design Tokens
15.1 Status Color Token
export const hotspotPriorityStyles = {
  high: {
    label: "High",
    className: "bg-red-100 text-red-700 border-red-200",
    mapColor: "#dc2626",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    mapColor: "#d97706",
  },
  low: {
    label: "Low",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    mapColor: "#059669",
  },
};
15.2 Validation Status Token
export const validationStatusStyles = {
  detected: {
    label: "Detected",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  validated: {
    label: "Validated",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  needs_recheck: {
    label: "Needs Recheck",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};
16. UX Copywriting

Gunakan bahasa yang jelas, tidak terlalu teknis, dan tidak overclaim.

16.1 Label yang Direkomendasikan
Konteks	Label
Hotspot baru	Indikasi Awal
Area berubah	Dugaan Perubahan
Laporan PDF	Laporan Indikasi Awal
Validated	Tervalidasi Lapangan
Rejected	Tidak Terbukti
Needs Recheck	Perlu Cek Ulang
Public map	Lokasi Digeneralisasi
Export PDF	Buat Laporan PDF
16.2 Disclaimer Pendek
Data ini merupakan indikasi awal berbasis citra satelit dan tetap memerlukan validasi lapangan.
16.3 Disclaimer Public
Sebagian lokasi ditampilkan secara umum untuk melindungi data sensitif dan keselamatan lapangan.
17. Accessibility
17.1 Reduced Motion

Semua motion harus menghormati:

prefers-reduced-motion: reduce

Jika aktif:

drawer langsung muncul;
pulse marker diganti border statis;
transition dipersingkat;
count-up dimatikan;
scroll reveal dimatikan.
17.2 Keyboard Navigation

Minimal:

drawer bisa ditutup dengan Esc;
modal report bisa ditutup dengan Esc;
semua button bisa difokuskan;
filter bisa diakses keyboard;
popup peta punya alternatif detail list.
17.3 Color Accessibility

Jangan mengandalkan warna saja.

Status harus memiliki:

warna;
label;
icon kecil jika perlu;
tooltip/legend.
18. Performance Guidelines
18.1 Leaflet Performance
Jangan animasikan marker lewat state React berulang.
Gunakan CSS class untuk pulse marker.
Jangan render semua popup terbuka.
Gunakan clustering jika hotspot banyak.
Gunakan bbox query jika data bertambah.
Hindari GeoJSON terlalu besar.
18.2 Motion Performance

Animasi hanya pada:

transform
opacity
box-shadow ringan

Hindari animasi:

width
height
margin
padding
top
left
18.3 Data Loading
Muat peta terlebih dahulu.
Hotspot layer bisa dimuat setelah peta siap.
Detail drawer fetch data saat hotspot dipilih.
Foto validasi lazy load.
PDF tidak dibuat otomatis saat buka detail.
19. UI Acceptance Criteria

UI Dashboard dianggap siap untuk MVP apabila:

Peta menjadi elemen utama dashboard.
Dashboard tidak dipenuhi banyak card besar.
AOI dapat ditampilkan di peta.
Hotspot dapat ditampilkan sebagai marker/polygon.
Hotspot dapat difilter berdasarkan status dan prioritas.
Klik hotspot membuka popup.
Tombol detail membuka right drawer.
Detail drawer menampilkan indeks MVI/CMRI before-after.
Validator dapat membuka form validasi.
Admin/NGO dapat membuka aksi generate PDF.
Public viewer tidak melihat data sensitif.
Internal user melihat data sesuai role.
Loading state tersedia.
Empty state tersedia.
Error state tersedia.
Marker pulse hanya aktif pada hotspot prioritas tinggi.
Animasi tetap halus dan tidak mengganggu Leaflet.
UI tetap dapat digunakan saat reduced motion aktif.
Layout desktop dan mobile dapat digunakan.
Tampilan terasa profesional, bukan template AI generik.
20. Perlu Dikonfirmasi

Hal yang perlu dikonfirmasi sebelum implementasi UI final:

Apakah dashboard publik benar-benar masuk MVP pertama.
Apakah tema UI menggunakan light mode, dark mode, atau hybrid.
Apakah peta internal menggunakan basemap OSM, Esri, atau Carto.
Apakah before-after memakai slider interaktif atau toggle layer sederhana.
Apakah tile MVI/CMRI tersedia pada MVP atau cukup static image.
Apakah detail hotspot dibuka via drawer atau full page.
Apakah validasi lapangan dilakukan di desktop saja atau mobile browser juga.
Apakah public viewer boleh melihat estimasi luas per hotspot.
Apakah PDF report action tersedia untuk NGO saja atau admin juga.
Apakah logo/identitas visual MANGROVE-EYE sudah final.
21. Kesimpulan

UI MANGROVE-EYE harus diarahkan sebagai spatial intelligence dashboard yang profesional, ringan, dan operasional.

Arah utama UI:

Map-first
Panel-based
Minimal card
Subtle motion
RBAC-aware
Performance-safe for Leaflet
Sensitive-data protected

Dashboard tidak boleh terlihat seperti template AI yang penuh card, gradient, animasi bouncy, dan efek dekoratif. Peta harus menjadi pusat sistem, sedangkan statistik, filter, detail, validasi, dan laporan muncul sebagai panel pendukung yang ringkas.

Dengan UI plan ini, MANGROVE-EYE dapat tampil sebagai sistem pemantauan mangrove yang serius, smooth, dan siap digunakan sebagai dasar MVP maupun narasi esai lomba nasional.