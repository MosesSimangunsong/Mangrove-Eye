Development Task List MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	Development Task List
Versi	v1.0
Acuan Utama	PRD.md, MVP_SCOPE.md, DATABASE_DESIGN.md, GEE_WORKFLOW.md, API_CONTRACT.md, UI_DASHBOARD_PLAN.md
Target MVP	Dashboard WebGIS deteksi dini deforestasi mangrove
Target Penyimpanan	docs/DEVELOPMENT_TASK_LIST.md
2. Tujuan Dokumen

Dokumen ini berisi daftar tugas pengembangan sistem MANGROVE-EYE secara bertahap. Tujuannya adalah membantu tim pengembang membangun MVP secara realistis, terstruktur, dan tidak melompat ke fitur yang belum perlu.

Dokumen ini dapat digunakan sebagai:

backlog development;
panduan kerja Codex/AI coding assistant;
checklist implementasi;
dasar pembagian tugas tim;
kontrol agar scope MVP tidak melebar.
3. Prinsip Eksekusi Development
3.1 Fokus pada MVP

MVP hanya mengerjakan fitur inti:

GEE + Sentinel-2 + MVI/CMRI + Hotspot Detection
+ PostgreSQL/PostGIS + Laravel API
+ React Leaflet Dashboard
+ Validasi Lapangan + PDF Report + RBAC
3.2 Jangan Langsung Mengerjakan Non-MVP

Fitur berikut tidak dikerjakan pada fase MVP awal:

U-Net production-ready;
training model AI;
Sentinel-1 SAR;
scheduler otomatis penuh;
notifikasi WhatsApp/Telegram;
mobile native app;
offline validation;
multi-AOI nasional;
legal case management.
3.3 GEE Tetap sebagai Mesin Analisis

Laravel tidak menghitung indeks spektral dari raster mentah. Laravel hanya menerima hasil dari GEE, menyimpannya ke PostGIS, lalu menyajikannya ke React Leaflet.

3.4 Map-First UI

Dashboard harus menjadikan peta sebagai pusat. Hindari tampilan penuh card besar. Gunakan panel, drawer, filter compact, metric strip, dan floating legend agar UI terlihat profesional dan tidak seperti template AI. Prinsip motion juga harus halus, fungsional, dan tidak mengganggu performa Leaflet.

3.5 Keputusan Implementasi Final

Keputusan final berikut menjadi baseline implementasi dan menggantikan opsi yang sebelumnya masih terbuka:

| Area | Keputusan Final |
| --- | --- |
| Arsitektur aplikasi | Laravel + React dalam satu project |
| Autentikasi | Session-based auth |
| RBAC | Spatie Laravel Permission |
| Dashboard publik | Masuk MVP dalam versi minimal: public API + generalized map |
| Role login internal | validator, ngo_advocate, admin, super_admin |
| Akses publik | Tanpa akun dan tanpa role login |
| AOI utama | Jika data resmi belum tersedia, gunakan digitasi sementara dengan status draft / needs_revision |
| Conflict zone | Jika polygon 60-62 ha belum tersedia, gunakan conflict_zone sementara |
| Import hasil GEE | GeoJSON manual |
| Layer MVP | Hotspot GeoJSON + static image untuk PDF |
| Tile interaktif | Ditunda setelah MVP |
| PDF engine | DomPDF |
| Jenis report wajib MVP | PDF per hotspot |
| File sensitif | Local private storage |
| Validasi lapangan | Desktop + mobile browser |
| Geotag foto | Opsional, tetapi disarankan |
| Koordinat publik | Generalized centroid / coarse point |
| Basemap | OpenStreetMap default + Esri Satellite opsional untuk internal |
| Threshold GEE | Baseline eksperimen, belum final |
| Periode before-after | Manual |
| ID database | Bigint auto increment |
| Hosting awal | Local demo |
| Identitas laporan | MANGROVE-EYE Team sementara + disclaimer wajib |

Semua fase, task, dan acceptance criteria di bawah dokumen ini harus mengikuti keputusan final tersebut, kecuali jika ada revisi eksplisit pada dokumen keputusan implementasi.

4. Prioritas Task
Prioritas	Makna
P0	Wajib untuk MVP berjalan
P1	Penting, sebaiknya selesai dalam MVP
P2	Tambahan jika waktu cukup
P3	Roadmap lanjutan / non-MVP
5. Fase Development

Urutan fase pengembangan:

Phase 0 — Project Preparation
Phase 1 — Backend Foundation
Phase 2 — Database & PostGIS
Phase 3 — GEE Prototype
Phase 4 — API Implementation
Phase 5 — WebGIS Dashboard
Phase 6 — Field Validation
Phase 7 — PDF Report
Phase 8 — Security & RBAC Hardening
Phase 9 — UI Polish & Motion
Phase 10 — Testing, QA, and Demo Preparation
Phase 11 — Deployment Preparation
Phase 12 — Future Roadmap
Phase 0 — Project Preparation
0.1 Repository dan Struktur Awal
ID	Task	Prioritas	Output
DEV-0001	Buat repository project MANGROVE-EYE	P0	Repo tersedia
DEV-0002	Setup struktur folder Laravel + React	P0	Struktur project siap
DEV-0003	Buat folder docs/	P0	Folder dokumentasi tersedia
DEV-0004	Simpan dokumen PRD, MVP Scope, Database Design, GEE Workflow, API Contract, UI Plan, Development Task List	P0	Dokumentasi lengkap
DEV-0005	Buat README awal project	P1	README menjelaskan tujuan dan setup
0.2 Environment Development
ID	Task	Prioritas	Output
DEV-0006	Setup Laravel project	P0	Backend Laravel berjalan
DEV-0007	Setup React frontend	P0	Frontend React berjalan
DEV-0008	Setup Tailwind CSS	P0	Styling dasar tersedia
DEV-0009	Setup PostgreSQL lokal	P0	Database tersedia
DEV-0010	Aktifkan PostGIS extension	P0	PostGIS aktif
DEV-0011	Buat .env.example	P0	Template environment tersedia
DEV-0012	Setup storage folder untuk AOI, import GEE, foto validasi, dan reports	P1	Struktur storage siap
Phase 1 — Backend Foundation
1.1 Laravel Base Setup
ID	Task	Prioritas	Output
DEV-0101	Setup route API prefix /api/v1	P0	API versioning tersedia
DEV-0102	Buat response helper standar success/error	P0	Format response konsisten
DEV-0103	Setup validation request class	P0	Validasi request rapi
DEV-0104	Setup exception handling untuk API	P1	Error API konsisten
DEV-0105	Setup file upload service	P1	Upload reusable
DEV-0106	Setup audit log service	P1	Log aktivitas penting tersedia
1.2 Authentication
ID	Task	Prioritas	Output
DEV-0110	Implementasi session-based auth untuk Laravel + React satu project	P0	Keputusan auth diterapkan
DEV-0111	Implementasi login API	P0	User bisa login
DEV-0112	Implementasi logout API	P0	User bisa logout
DEV-0113	Implementasi endpoint /auth/me	P0	Frontend bisa membaca user aktif
DEV-0114	Setup middleware authenticated API	P0	Endpoint internal terlindungi
1.3 RBAC
ID	Task	Prioritas	Output
DEV-0120	Integrasikan Spatie Laravel Permission	P0	Keputusan RBAC diterapkan
DEV-0121	Setup model/konfigurasi Role dan Permission berbasis Spatie	P0	Role/permission tersedia
DEV-0122	Buat seed role awal	P0	Role awal tersedia
DEV-0123	Buat seed permission awal	P0	Permission awal tersedia
DEV-0124	Buat middleware role/permission	P0	Akses bisa dibatasi
DEV-0125	Terapkan permission pada endpoint internal	P0	API aman berdasarkan role

Role awal:

validator
ngo_advocate
admin
super_admin
Phase 2 — Database & PostGIS
2.1 Migration Utama
ID	Task	Prioritas	Output
DEV-0201	Buat migration enable PostGIS	P0	Extension aktif
DEV-0202	Buat migration users	P0	Tabel user
DEV-0203	Buat migration roles	P0	Tabel role
DEV-0204	Buat migration permissions	P0	Tabel permission
DEV-0205	Buat migration user_roles	P0	Relasi user-role
DEV-0206	Buat migration role_permissions	P0	Relasi role-permission
2.2 Migration Spatial Core
ID	Task	Prioritas	Output
DEV-0210	Buat migration aoi_areas dengan geometry MultiPolygon SRID 4326	P0	Tabel AOI
DEV-0211	Buat migration analysis_runs	P0	Tabel analysis run
DEV-0212	Buat migration gee_imports	P0	Tabel import GEE
DEV-0213	Buat migration satellite_layers	P1	Tabel layer
DEV-0214	Buat migration hotspots dengan centroid Point dan geom MultiPolygon	P0	Tabel hotspot
DEV-0215	Buat migration field_validations	P0	Tabel validasi
DEV-0216	Buat migration validation_photos	P0	Tabel foto validasi
DEV-0217	Buat migration reports	P0	Tabel laporan
DEV-0218	Buat migration audit_logs	P1	Tabel audit log
2.3 Index dan Constraint
ID	Task	Prioritas	Output
DEV-0220	Tambahkan GIST index pada aoi_areas.geom	P0	Query AOI cepat
DEV-0221	Tambahkan GIST index pada hotspots.centroid	P0	Query marker cepat
DEV-0222	Tambahkan GIST index pada hotspots.geom	P0	Query polygon cepat
DEV-0223	Tambahkan GIST index pada field_validations.validation_point	P1	Query validasi spasial cepat
DEV-0224	Tambahkan index status dan priority hotspot	P0	Filter dashboard cepat
DEV-0225	Tambahkan index analysis_run_id pada hotspot	P0	Filter analysis run cepat
2.4 Model dan Relasi Laravel
ID	Task	Prioritas	Output
DEV-0230	Buat model AoiArea	P0	Model AOI
DEV-0231	Buat model AnalysisRun	P0	Model analysis
DEV-0232	Buat model GeeImport	P0	Model import
DEV-0233	Buat model SatelliteLayer	P1	Model layer
DEV-0234	Buat model Hotspot	P0	Model hotspot
DEV-0235	Buat model FieldValidation	P0	Model validasi
DEV-0236	Buat model ValidationPhoto	P0	Model foto
DEV-0237	Buat model Report	P0	Model laporan
DEV-0238	Buat model AuditLog	P1	Model audit
Phase 3 — GEE Prototype
3.1 Persiapan GEE
ID	Task	Prioritas	Output
DEV-0301	Pastikan akun Google Earth Engine aktif	P0	Akun siap
DEV-0302	Buat script GEE awal mangrove_eye_mvp_gee.js	P0	Script awal
DEV-0303	Siapkan AOI sementara Kwala Serapuh	P0	AOI bisa dipakai
DEV-0304	Upload AOI ke GEE Asset atau gambar manual di Code Editor	P0	AOI terbaca di GEE
DEV-0305	Dokumentasikan status AOI sebagai draft jika belum resmi	P0	Tidak overclaim
3.2 Sentinel-2 Processing
ID	Task	Prioritas	Output
DEV-0310	Load dataset COPERNICUS/S2_SR_HARMONIZED	P0	Sentinel-2 terbaca
DEV-0311	Filter citra berdasarkan AOI	P0	Citra sesuai area
DEV-0312	Filter citra berdasarkan periode before-after	P0	Citra temporal
DEV-0313	Filter awan dengan CLOUDY_PIXEL_PERCENTAGE	P0	Scene lebih bersih
DEV-0314	Implementasi masking awan sederhana berbasis SCL	P1	Cloud/shadow berkurang
DEV-0315	Buat composite before dengan median()	P0	Before composite
DEV-0316	Buat composite after dengan median()	P0	After composite
3.3 Index Calculation
ID	Task	Prioritas	Output
DEV-0320	Hitung NDVI	P0	Band NDVI
DEV-0321	Hitung NDWI	P0	Band NDWI
DEV-0322	Hitung CMRI	P0	Band CMRI
DEV-0323	Hitung MVI	P0	Band MVI
DEV-0324	Visualisasikan RGB before-after	P0	Layer RGB
DEV-0325	Visualisasikan MVI/CMRI	P0	Layer indeks
3.4 Change Detection
ID	Task	Prioritas	Output
DEV-0330	Hitung delta MVI	P0	delta_MVI
DEV-0331	Hitung delta CMRI	P0	delta_CMRI
DEV-0332	Hitung delta NDVI dan NDWI	P0	Delta pendukung
DEV-0333	Buat baseline threshold sementara	P0	Mask perubahan awal
DEV-0334	Tambahkan NDWI water mask untuk mengurangi false positive	P1	Mask lebih stabil
DEV-0335	Bersihkan noise dengan connected pixel filtering	P1	Hotspot lebih rapi
DEV-0336	Vectorize hotspot menjadi polygon	P0	Hotspot vector
DEV-0337	Hitung luas hotspot	P0	area_ha
DEV-0338	Hitung centroid hotspot	P0	Titik hotspot
DEV-0339	Tambahkan atribut indeks rata-rata per hotspot	P0	Properties lengkap
3.5 Export Hasil GEE
ID	Task	Prioritas	Output
DEV-0340	Export hotspot sebagai GeoJSON	P0	File GeoJSON
DEV-0341	Export static map untuk PDF	P1	PNG/JPG
DEV-0342	Dokumentasikan naming convention export	P1	File rapi
DEV-0343	Uji buka GeoJSON di QGIS/geojson.io	P0	File valid
DEV-0344	Catat parameter analysis run yang digunakan	P0	Metadata siap
Phase 4 — API Implementation
4.1 Auth API
ID	Endpoint	Task	Prioritas
DEV-0401	POST /auth/login	Implementasi login	P0
DEV-0402	POST /auth/logout	Implementasi logout	P0
DEV-0403	GET /auth/me	Ambil user aktif	P0
4.2 AOI API
ID	Endpoint	Task	Prioritas
DEV-0410	GET /aoi-areas	List AOI	P0
DEV-0411	GET /aoi-areas/{id}	Detail AOI	P0
DEV-0412	POST /aoi-areas	Create AOI manual	P0
DEV-0413	PUT /aoi-areas/{id}	Update AOI	P1
DEV-0414	DELETE /aoi-areas/{id}	Soft delete AOI	P1
DEV-0415	POST /aoi-areas/import	Import AOI GeoJSON	P0
4.3 Analysis Run API
ID	Endpoint	Task	Prioritas
DEV-0420	GET /analysis-runs	List analysis run	P0
DEV-0421	GET /analysis-runs/{id}	Detail analysis run	P0
DEV-0422	POST /analysis-runs	Create analysis run	P0
DEV-0423	PUT /analysis-runs/{id}	Update analysis run	P1
DEV-0424	DELETE /analysis-runs/{id}	Soft delete analysis run	P1
4.4 GEE Import API
ID	Endpoint	Task	Prioritas
DEV-0430	POST /analysis-runs/{id}/gee-imports/hotspots	Import hotspot GeoJSON	P0
DEV-0431	GET /analysis-runs/{id}/gee-imports	List import GEE	P1
DEV-0432	POST /analysis-runs/{id}/satellite-layers	Simpan metadata layer	P1
DEV-0433	-	Parse GeoJSON feature menjadi PostGIS geometry	P0
DEV-0434	-	Validasi geometry Polygon/MultiPolygon	P0
DEV-0435	-	Simpan properties indeks ke hotspot	P0
DEV-0436	-	Update summary analysis_runs.total_hotspots dan total_area_ha	P0
4.5 Hotspot API
ID	Endpoint	Task	Prioritas
DEV-0440	GET /hotspots	List hotspot internal	P0
DEV-0441	GET /hotspots?format=geojson	List hotspot sebagai GeoJSON	P0
DEV-0442	GET /hotspots/{id}	Detail hotspot	P0
DEV-0443	PATCH /hotspots/{id}/status	Update status hotspot	P1
DEV-0444	PATCH /hotspots/{id}/priority	Update priority hotspot	P1
DEV-0445	-	Terapkan bbox filter untuk peta	P1
4.6 Dashboard API
ID	Endpoint	Task	Prioritas
DEV-0450	GET /dashboard/summary	Summary internal	P0
DEV-0451	GET /dashboard/layers	List layer map	P1
DEV-0452	GET /public/dashboard/summary	Summary publik	P1
DEV-0453	GET /public/hotspots	Hotspot tergeneralisasi	P1
4.7 Field Validation API
ID	Endpoint	Task	Prioritas
DEV-0460	POST /hotspots/{id}/field-validations	Buat validasi lapangan	P0
DEV-0461	GET /hotspots/{id}/field-validations	Riwayat validasi	P0
DEV-0462	PUT /field-validations/{id}	Update validasi	P1
DEV-0463	POST /field-validations/{id}/photos	Upload foto validasi	P0
DEV-0464	-	Update status hotspot setelah validasi	P0
4.8 Report API
ID	Endpoint	Task	Prioritas
DEV-0470	POST /hotspots/{id}/reports	Generate PDF per hotspot	P0
DEV-0471	GET /reports	List reports	P1
DEV-0472	GET /reports/{id}/download	Download report	P0
DEV-0473	POST /analysis-runs/{id}/reports	Generate PDF analysis run	P2
4.9 User and Audit API
ID	Endpoint	Task	Prioritas
DEV-0480	GET /users	List user	P1
DEV-0481	POST /users	Create user	P1
DEV-0482	PATCH /users/{id}/roles	Update role user	P1
DEV-0483	GET /roles	List role	P1
DEV-0484	GET /audit-logs	List audit log	P1
Phase 5 — WebGIS Dashboard
5.1 Frontend Foundation
ID	Task	Prioritas	Output
DEV-0501	Setup React router/page structure	P0	Halaman siap
DEV-0502	Setup Axios/fetch client	P0	API client
DEV-0503	Setup auth state	P0	User state
DEV-0504	Setup protected route/layout	P0	Halaman internal aman
DEV-0505	Setup global error/loading handler	P1	UX stabil
5.2 Layout Dashboard
ID	Task	Prioritas	Output
DEV-0510	Buat AppShell	P0	Layout utama
DEV-0511	Buat TopBar	P0	Header compact
DEV-0512	Buat LeftPanel	P0	Layer/filter panel
DEV-0513	Buat RightDrawer	P0	Detail drawer
DEV-0514	Buat BottomMetricStrip	P1	Statistik compact
DEV-0515	Buat responsive layout mobile bottom sheet	P1	UI mobile dasar
5.3 React Leaflet Map
ID	Task	Prioritas	Output
DEV-0520	Install dan setup React Leaflet	P0	Map berjalan
DEV-0521	Buat WebGISMap	P0	Canvas peta
DEV-0522	Tambahkan basemap OSM	P0	Basemap awal
DEV-0523	Buat AoiLayer	P0	AOI tampil
DEV-0524	Buat HotspotLayer	P0	Hotspot tampil
DEV-0525	Buat HotspotPopup	P0	Popup hotspot
DEV-0526	Tambahkan highlight saat hotspot dipilih	P1	Fokus visual
DEV-0527	Tambahkan bbox query saat map move/zoom	P2	Optimasi lanjut
5.4 Layer, Filter, dan Legend
ID	Task	Prioritas	Output
DEV-0530	Buat LayerControl	P0	Toggle layer
DEV-0531	Buat HotspotFilter	P0	Filter status/prioritas
DEV-0532	Buat FloatingLegend	P0	Legend peta
DEV-0533	Buat AnalysisRunSelector	P0	Pilih analysis run
DEV-0534	Buat AoiSelector	P0	Pilih AOI
DEV-0535	Tambahkan filter minimum area	P2	Filter lanjutan
5.5 Hotspot Detail UI
ID	Task	Prioritas	Output
DEV-0540	Buat HotspotDetailDrawer	P0	Detail hotspot
DEV-0541	Buat HotspotIndexSummary	P0	MVI/CMRI summary
DEV-0542	Buat HotspotValidationHistory	P0	Riwayat validasi
DEV-0543	Buat HotspotActions	P0	Validasi/report
DEV-0544	Buat collapsible section untuk data teknis	P1	UI tidak penuh
DEV-0545	Tambahkan mini map preview	P2	Preview detail
5.6 Public Dashboard
ID	Task	Prioritas	Output
DEV-0550	Buat halaman Public Dashboard	P1	Dashboard publik
DEV-0551	Ambil public summary	P1	Ringkasan publik
DEV-0552	Tampilkan hotspot tergeneralisasi	P1	Data aman
DEV-0553	Tambahkan disclaimer public	P1	Tidak overclaim
DEV-0554	Pastikan koordinat presisi tidak tampil	P0	Keamanan data
Phase 6 — Field Validation
6.1 Form Validasi
ID	Task	Prioritas	Output
DEV-0601	Buat FieldValidationForm	P0	Form validasi
DEV-0602	Tambahkan select status validasi	P0	Status bisa dipilih
DEV-0603	Tambahkan select observed condition	P0	Kondisi lapangan
DEV-0604	Tambahkan textarea catatan	P0	Catatan tersimpan
DEV-0605	Tambahkan input visited_at	P1	Tanggal kunjungan
DEV-0606	Tambahkan confidence level	P1	Tingkat keyakinan
6.2 Koordinat dan Foto
ID	Task	Prioritas	Output
DEV-0610	Tambahkan input koordinat validasi manual	P0	Titik validasi
DEV-0611	Tambahkan opsi ambil lokasi browser	P1	Geolocation
DEV-0612	Buat ValidationPhotoUpload	P0	Upload foto
DEV-0613	Validasi tipe file JPG/PNG	P0	Upload aman
DEV-0614	Batasi ukuran foto maksimal	P0	Storage aman
DEV-0615	Tampilkan preview foto sebelum upload	P1	UX lebih baik
6.3 Riwayat Validasi
ID	Task	Prioritas	Output
DEV-0620	Tampilkan validation history pada detail hotspot	P0	Riwayat terlihat
DEV-0621	Tampilkan foto validasi internal	P0	Bukti terlihat
DEV-0622	Batasi foto agar tidak muncul pada public viewer	P0	Data sensitif aman
DEV-0623	Update status hotspot otomatis setelah validasi	P0	Status sinkron
Phase 7 — PDF Report
7.1 PDF Template
ID	Task	Prioritas	Output
DEV-0701	Integrasikan DomPDF sebagai engine laporan PDF	P0	Keputusan PDF diterapkan
DEV-0702	Buat template PDF per hotspot	P0	Template laporan
DEV-0703	Tambahkan judul laporan	P0	Header laporan
DEV-0704	Tambahkan metadata AOI dan analysis run	P0	Konteks laporan
DEV-0705	Tambahkan ringkasan indeks MVI/CMRI	P0	Data utama
DEV-0706	Tambahkan estimasi luas	P0	Luas terdampak
DEV-0707	Tambahkan status validasi	P0	Hasil lapangan
DEV-0708	Tambahkan foto validasi jika tersedia	P0	Bukti lapangan
DEV-0709	Tambahkan disclaimer indikasi awal	P0	Tidak overclaim
7.2 Generate dan Download
ID	Task	Prioritas	Output
DEV-0710	Implementasi generate PDF endpoint	P0	PDF dibuat
DEV-0711	Simpan file PDF ke storage private	P0	File tersimpan
DEV-0712	Simpan metadata ke tabel reports	P0	Report tercatat
DEV-0713	Implementasi download report endpoint	P0	PDF bisa diunduh
DEV-0714	Batasi akses download berdasarkan role	P0	Report aman
DEV-0715	Catat audit log generate/download report	P1	Aktivitas tercatat
7.3 Report UI
ID	Task	Prioritas	Output
DEV-0720	Buat ReportGenerateModal	P0	Modal generate
DEV-0721	Tambahkan pilihan include photos	P1	Opsi foto
DEV-0722	Tambahkan pilihan include precise coordinates	P1	Opsi koordinat
DEV-0723	Tampilkan disclaimer sebelum generate	P0	Aman secara etis
DEV-0724	Buat ReportDownloadButton	P0	Download dari UI
Phase 8 — Security & RBAC Hardening
8.1 Public/Internal Data Separation
ID	Task	Prioritas	Output
DEV-0801	Pastikan public endpoint tidak mengirim koordinat presisi	P0	Data aman
DEV-0802	Pastikan public endpoint tidak mengirim polygon detail	P0	Data aman
DEV-0803	Pastikan public endpoint tidak mengirim foto validasi	P0	Data aman
DEV-0804	Pastikan public endpoint tidak mengirim catatan validator	P0	Data aman
DEV-0805	Pastikan public endpoint tidak mengirim raw GeoJSON sensitif	P0	Data aman
DEV-0806	Implementasi generalized location untuk public hotspot	P1	Lokasi aman
8.2 File Security
ID	Task	Prioritas	Output
DEV-0810	Simpan file sensitif di private storage	P0	File tidak publik
DEV-0811	Buat endpoint protected file access	P0	File aman
DEV-0812	Validasi MIME type upload foto	P0	Upload aman
DEV-0813	Validasi ukuran upload	P0	Storage aman
DEV-0814	Cegah path traversal pada file access	P0	Security aman
8.3 Audit Log
ID	Task	Prioritas	Output
DEV-0820	Log create/update AOI	P1	Audit data spasial
DEV-0821	Log import GEE hotspot	P1	Audit import
DEV-0822	Log perubahan status hotspot	P1	Audit status
DEV-0823	Log validasi lapangan	P1	Audit validasi
DEV-0824	Log generate/download report	P1	Audit laporan
DEV-0825	Log update role user	P1	Audit akses
Phase 9 — UI Polish & Motion
9.1 Motion Foundation
ID	Task	Prioritas	Output
DEV-0901	Install motion	P1	Motion tersedia
DEV-0902	Install react-countup opsional	P2	CountUp tersedia
DEV-0903	Install react-intersection-observer opsional	P2	Reveal helper
DEV-0904	Buat motionPresets.js	P1	Preset terpusat
DEV-0905	Buat hook usePrefersReducedMotion	P1	Aksesibilitas motion
DEV-0906	Tambahkan Tailwind easing dan keyframe pulse	P1	Motion CSS tersedia
9.2 Motion Components
ID	Task	Prioritas	Output
DEV-0910	Buat FadeIn	P1	Reveal sederhana
DEV-0911	Buat FadeInUp	P1	Reveal panel
DEV-0912	Buat SlideDrawer	P1	Drawer smooth
DEV-0913	Buat SkeletonBlock	P0	Loading state
DEV-0914	Buat StatusBadge	P0	Badge konsisten
DEV-0915	Buat KpiCountUp opsional	P2	Statistik smooth
DEV-0916	Buat PulseMarker berbasis CSS/Leaflet	P1	Urgent marker aman
9.3 UI Polish Rules
ID	Task	Prioritas	Output
DEV-0920	Kurangi penggunaan card besar	P0	UI lebih profesional
DEV-0921	Gunakan metric strip, bukan KPI card berlebihan	P0	Dashboard lebih rapi
DEV-0922	Pastikan peta mengambil ruang utama	P0	Map-first
DEV-0923	Buat left panel collapsible	P1	Ruang peta lega
DEV-0924	Buat right drawer smooth	P1	Detail tidak mengganggu peta
DEV-0925	Hindari animasi tabel per baris	P0	Admin UI cepat
DEV-0926	Pastikan marker pulse terbatas hanya high priority	P0	Peta tidak ramai
Phase 10 — Testing, QA, and Demo Preparation
10.1 Backend Testing
ID	Task	Prioritas	Output
DEV-1001	Test login/logout	P0	Auth valid
DEV-1002	Test role middleware	P0	RBAC valid
DEV-1003	Test import AOI GeoJSON	P0	AOI tersimpan
DEV-1004	Test create analysis run	P0	Analysis run valid
DEV-1005	Test import hotspot GeoJSON	P0	Hotspot tersimpan
DEV-1006	Test geometry PostGIS valid	P0	Geometry aman
DEV-1007	Test field validation	P0	Validasi tersimpan
DEV-1008	Test photo upload	P0	Foto tersimpan
DEV-1009	Test PDF generation	P0	PDF berhasil
DEV-1010	Test public endpoint tidak bocor data sensitif	P0	Security valid
10.2 Frontend Testing
ID	Task	Prioritas	Output
DEV-1020	Test peta tampil	P0	WebGIS valid
DEV-1021	Test AOI layer tampil	P0	AOI terlihat
DEV-1022	Test hotspot layer tampil	P0	Hotspot terlihat
DEV-1023	Test popup hotspot	P0	Popup valid
DEV-1024	Test detail drawer	P0	Detail valid
DEV-1025	Test filter status/prioritas	P0	Filter valid
DEV-1026	Test form validasi	P0	Validasi UI valid
DEV-1027	Test upload foto dari UI	P0	Upload UI valid
DEV-1028	Test generate/download PDF dari UI	P0	Report UI valid
DEV-1029	Test responsive layout	P1	Mobile/tablet valid
10.3 GEE Output Testing
ID	Task	Prioritas	Output
DEV-1030	Test script GEE dengan AOI kecil	P0	Script aman
DEV-1031	Test hasil MVI/CMRI secara visual	P0	Layer masuk akal
DEV-1032	Test threshold awal	P0	Hotspot muncul
DEV-1033	Test export GeoJSON	P0	File valid
DEV-1034	Test import GeoJSON ke Laravel	P0	Pipeline valid
DEV-1035	Test false positive obvious seperti air/tambak	P1	Risiko diketahui
10.4 Demo Preparation
ID	Task	Prioritas	Output
DEV-1040	Siapkan AOI demo	P0	Data demo
DEV-1041	Siapkan satu analysis run demo	P0	Demo analysis
DEV-1042	Siapkan beberapa hotspot demo	P0	Demo hotspot
DEV-1043	Siapkan satu validasi demo	P0	Demo validasi
DEV-1044	Siapkan satu PDF report demo	P0	Demo laporan
DEV-1045	Siapkan narasi demo sistem untuk esai/presentasi	P1	Demo story
Phase 11 — Deployment Preparation
11.1 Environment Production/Staging
ID	Task	Prioritas	Output
DEV-1101	Tentukan hosting awal: local/VPS/cloud	P0	Target deploy
DEV-1102	Setup PostgreSQL/PostGIS di server	P0	DB server
DEV-1103	Setup environment variables	P0	ENV production
DEV-1104	Setup storage symbolic/private access	P0	File access
DEV-1105	Setup build frontend	P0	Frontend production
DEV-1106	Setup queue jika PDF/import berat	P2	Job async
11.2 Deployment Checklist
ID	Task	Prioritas	Output
DEV-1110	Jalankan migration production	P0	DB siap
DEV-1111	Jalankan seeder role/permission	P0	Role siap
DEV-1112	Buat akun admin awal	P0	Admin bisa login
DEV-1113	Upload AOI awal	P0	Data spasial awal
DEV-1114	Import hotspot demo	P0	Data demo
DEV-1115	Uji akses public/internal	P0	RBAC valid
DEV-1116	Uji PDF report di server	P0	Report valid
DEV-1117	Backup database awal	P1	Backup tersedia
Phase 12 — Future Roadmap / Non-MVP

Fase ini tidak dikerjakan pada MVP awal, tetapi disiapkan sebagai arah pengembangan lanjutan.

12.1 Advanced GEE
ID	Task	Prioritas
DEV-1201	Integrasi s2cloudless untuk cloud masking lebih baik	P3
DEV-1202	Integrasi data pasang surut	P3
DEV-1203	Integrasi Sentinel-1 SAR	P3
DEV-1204	Otomasi GEE dengan Earth Engine Python API	P3
DEV-1205	Scheduler analisis bulanan/triwulan	P3
12.2 AI / U-Net
ID	Task	Prioritas
DEV-1210	Export tile Sentinel-2 untuk dataset training	P3
DEV-1211	Buat label/mask mangrove awal	P3
DEV-1212	Eksperimen U-Net di Google Colab	P3
DEV-1213	Evaluasi IoU/F1-score model	P3
DEV-1214	Simpan metadata model AI	P3
DEV-1215	Integrasi hasil segmentasi ke dashboard	P3
12.3 Notification and Expansion
ID	Task	Prioritas
DEV-1220	Notifikasi WhatsApp/Telegram untuk hotspot baru	P3
DEV-1221	Multi-AOI pesisir Langkat	P3
DEV-1222	Multi-region Sumatera Utara	P3
DEV-1223	Public transparency portal penuh	P3
DEV-1224	Legal case management	P3
DEV-1225	Mobile/offline field validation	P3
13. MVP Completion Criteria

MVP dianggap selesai apabila seluruh poin berikut terpenuhi:

13.1 Data dan GEE
AOI dapat dimuat.
Sentinel-2 dapat dianalisis di GEE.
MVI, CMRI, NDVI, dan NDWI berhasil dihitung.
Before-after berhasil dibandingkan.
Hotspot berhasil diekspor sebagai GeoJSON.
GeoJSON berhasil diimpor ke Laravel.
Hotspot tersimpan di PostGIS.
13.2 Backend dan API
Auth berjalan.
RBAC berjalan.
AOI API berjalan.
Analysis Run API berjalan.
GEE Import API berjalan.
Hotspot API berjalan.
Field Validation API berjalan.
Report API berjalan.
Public API tidak membocorkan data sensitif.
13.3 Dashboard
Peta tampil sebagai pusat dashboard.
AOI tampil di peta.
Hotspot tampil di peta.
Filter hotspot berjalan.
Popup hotspot berjalan.
Detail drawer berjalan.
Statistik ringkas tampil.
UI tidak dipenuhi banyak card besar.
13.4 Validasi dan Laporan
Validator dapat mengisi validasi lapangan.
Validator dapat upload foto.
Status hotspot berubah setelah validasi.
Admin/NGO dapat generate PDF per hotspot.
Laporan PDF memuat disclaimer indikasi awal.
13.5 Security
Public viewer tidak melihat koordinat presisi.
Public viewer tidak melihat foto validasi.
Public viewer tidak mengakses laporan internal.
Internal user melihat data sesuai role.
File sensitif dilindungi.
Audit log mencatat aksi penting.
14. Suggested Sprint Plan
Sprint 1 — Foundation

Target:

Laravel + React setup;
PostgreSQL/PostGIS;
Auth;
RBAC dasar;
migration utama.

Deliverable:

Backend foundation + database core siap.
Sprint 2 — AOI, Analysis Run, GEE Prototype

Target:

AOI import;
analysis run;
script GEE awal;
export hotspot GeoJSON.

Deliverable:

Pipeline awal GEE → GeoJSON tersedia.
Sprint 3 — GEE Import and Hotspot API

Target:

import GeoJSON;
simpan hotspot ke PostGIS;
hotspot API;
dashboard summary API.

Deliverable:

Hotspot hasil GEE masuk database dan bisa diambil API.
Sprint 4 — WebGIS Dashboard

Target:

React Leaflet map;
AOI layer;
hotspot layer;
popup;
filter;
detail drawer.

Deliverable:

Dashboard WebGIS MVP berjalan.
Sprint 5 — Validation and Report

Target:

field validation;
upload foto;
PDF report;
RBAC data sensitif.

Deliverable:

Hotspot bisa divalidasi dan dijadikan laporan PDF.
Sprint 6 — UI Polish, QA, Demo

Target:

map-first UI polish;
motion subtle;
testing;
demo data;
bug fixing.

Deliverable:

MVP siap demo dan siap dijelaskan dalam esai.
15. Checklist Final sebelum Demo
[ ] Admin bisa login
[ ] Role validator/NGO/admin berjalan
[ ] AOI Kwala Serapuh tampil di peta
[ ] Analysis run demo tersedia
[ ] Hotspot demo tampil di peta
[ ] Popup hotspot tampil
[ ] Detail drawer hotspot tampil
[ ] MVI/CMRI before-after tampil di detail
[ ] Filter status/prioritas berjalan
[ ] Validasi lapangan bisa dibuat
[ ] Foto validasi bisa diupload
[ ] PDF report bisa dibuat
[ ] Public viewer tidak melihat koordinat presisi
[ ] UI tidak penuh card besar
[ ] Peta menjadi pusat dashboard
[ ] Disclaimer indikasi awal tampil di laporan
[ ] Dokumentasi teknis lengkap di folder docs/
16. Perlu Dikonfirmasi

Hal yang masih perlu dikonfirmasi sebelum development final:

Catatan:
Daftar keputusan berikut sudah final dan tidak lagi dianggap sebagai pertanyaan terbuka:
- arsitektur aplikasi: Laravel + React dalam satu project;
- autentikasi: session-based auth;
- RBAC: Spatie Laravel Permission;
- public dashboard: masuk MVP dalam versi minimal;
- import GEE: GeoJSON manual;
- layer MVP: hotspot GeoJSON + static image untuk PDF;
- PDF engine: DomPDF;
- validasi lapangan: desktop + mobile browser;
- hosting awal: local demo.

Sisa pertanyaan yang benar-benar masih terbuka seharusnya hanya menyangkut finalisasi data lapangan, baseline GEE, dan redaksi disclaimer. Daftar lama di bawah ini perlu dibaca dengan catatan tersebut sampai dibersihkan penuh pada revisi dokumentasi berikutnya.

Keputusan sudah final: project memakai Laravel + React dalam satu project.
Keputusan sudah final: auth memakai session-based auth.
Keputusan sudah final: RBAC memakai Spatie Laravel Permission.
Keputusan sudah final: public dashboard masuk MVP pertama dalam versi minimal.
Apakah AOI resmi KTH Nipah ±242 ha sudah tersedia.
Apakah area konflik ±60–62 ha dapat dibuat sebagai AOI terpisah.
Keputusan sudah final: tile MVI/CMRI tidak masuk MVP; gunakan hotspot GeoJSON + static image.
Keputusan sudah final: PDF menggunakan DomPDF.
Keputusan sudah final: validasi lapangan dilakukan via desktop dan mobile browser.
Keputusan sudah final: hosting awal menggunakan local demo.
17. Kesimpulan

Development Task List ini membagi pembangunan MANGROVE-EYE menjadi tahapan yang realistis, mulai dari setup proyek, database PostGIS, workflow GEE, API Laravel, dashboard React Leaflet, validasi lapangan, laporan PDF, hingga security hardening.

Fokus utama MVP adalah membuktikan alur inti:

Citra Sentinel-2
→ Analisis MVI/CMRI di GEE
→ Hotspot GeoJSON
→ PostgreSQL/PostGIS
→ Dashboard WebGIS
→ Validasi Lapangan
→ Laporan PDF

Dengan task list ini, pengembangan MANGROVE-EYE dapat dilakukan secara bertahap tanpa melebar ke fitur yang belum perlu, sambil tetap menjaga kualitas teknis, keamanan data sensitif, dan tampilan UI yang profesional.
