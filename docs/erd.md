# ERD MANGROVE-EYE

## 1. Informasi Dokumen

| Item | Keterangan |
| --- | --- |
| Nama Sistem | MANGROVE-EYE |
| Jenis Dokumen | ERD / Database Architecture |
| Versi | v1.1 |
| Status | Revisi untuk MVP + Redesign UI/UX |
| Target Penyimpanan | docs/ERD.md |
| Database Utama | PostgreSQL |
| Spatial Extension | PostGIS |
| Backend | Laravel |
| Frontend | React + React Leaflet |
| Auth | Session-based auth |
| RBAC | Spatie Laravel Permission |
| Prinsip Utama | Data spasial aman, public/internal terpisah, hotspot bukan vonis final |

---

## 2. Tujuan Dokumen

Dokumen ini menjelaskan rancangan arsitektur data MANGROVE-EYE, yaitu ke mana data user, data spasial, data analisis, data validasi, foto, laporan PDF, dan audit log akan disimpan.

ERD ini menjadi acuan untuk:

1. Merancang migration database.
2. Menentukan relasi antar tabel.
3. Menentukan lokasi penyimpanan data user dan role.
4. Menentukan lokasi penyimpanan data AOI dan hotspot.
5. Menentukan struktur data hasil Google Earth Engine.
6. Menentukan struktur data validasi lapangan.
7. Menentukan struktur data report PDF.
8. Menentukan data mana yang bersifat sensitif.
9. Menjaga agar public dashboard tidak membocorkan data internal.
10. Menjadi pegangan Codex saat implementasi atau refactor backend.

---

## 3. Ringkasan Arsitektur Data

Database MANGROVE-EYE menyimpan data utama sistem dalam beberapa kelompok besar:

```text
User & RBAC
→ users
→ roles
→ permissions
→ model_has_roles
→ model_has_permissions
→ role_has_permissions

Spatial Core
→ aoi_areas
→ analysis_runs
→ gee_imports
→ satellite_layers
→ hotspots

Field Evidence
→ field_validations
→ validation_photos

Reporting
→ reports

Security & Traceability
→ audit_logs

Public user tidak disimpan sebagai akun khusus. Public visitor hanya mengakses landing page dan public dashboard tanpa login.

User yang disimpan di database hanya user internal, yaitu:

Validator.
NGO Advocate.
Admin.
Super Admin.
4. Prinsip Desain Database
4.1 PostgreSQL + PostGIS

Database menggunakan PostgreSQL + PostGIS karena sistem menyimpan data spasial seperti:

Polygon AOI.
Polygon hotspot.
Centroid hotspot.
Titik validasi lapangan.
Titik foto validasi jika tersedia.

Semua geometry menggunakan:

SRID 4326 / WGS 84

Alasan:

Cocok dengan GeoJSON.
Cocok dengan Google Earth Engine.
Cocok dengan Leaflet.
Cocok untuk data koordinat longitude-latitude.
4.2 Laravel Tidak Menghitung Raster Mentah

Laravel tidak menghitung NDVI, NDWI, MVI, dan CMRI dari citra satelit mentah.

Perhitungan dilakukan di Google Earth Engine.

Laravel hanya menyimpan:

Metadata analysis run.
Metadata import GEE.
GeoJSON hotspot.
Nilai indeks before-after.
Geometry hotspot.
Ringkasan total area.
Hasil validasi lapangan.
Report PDF.
4.3 Hotspot Bukan Bukti Final

Tabel hotspots hanya menyimpan indikasi awal hasil deteksi satelit.

Validasi lapangan disimpan di tabel terpisah:

field_validations

Dengan pemisahan ini, sistem dapat membedakan:

Hasil analisis satelit
≠
Hasil validasi lapangan
≠
Laporan akhir untuk advokasi
4.4 Data Sensitif Harus Dibatasi

Data berikut dianggap sensitif:

Koordinat presisi hotspot.
Polygon detail zona konflik.
Foto validasi lapangan.
Catatan validator.
Laporan PDF internal.
Raw properties hasil GEE.
Path storage file.
Audit log.

Pembatasan akses dilakukan melalui:

RBAC.
Permission API.
Resource response filtering.
Protected file endpoint.
Public API generalized data.
4.5 Internal App Page per Page Tidak Selalu Membutuhkan Tabel Baru

Keputusan UI internal page per page tidak otomatis membuat banyak tabel baru.

Halaman internal seperti:

Dashboard.
Hotspots.
AOI.
Analysis Runs.
GEE Imports.
Field Validations.
Reports.
Users & Roles.
Audit Logs.
Settings/Profile.

tetap menggunakan tabel inti yang sama.

Jika nanti dibutuhkan preferensi user seperti dark mode, default AOI, atau default filter, dapat ditambahkan tabel opsional user_preferences. Namun untuk MVP, preferensi UI belum wajib.

5. Daftar Tabel MVP
No	Tabel	Fungsi
1	users	Menyimpan akun user internal
2	roles	Menyimpan role dari Spatie Permission
3	permissions	Menyimpan permission granular
4	model_has_roles	Relasi user dengan role
5	model_has_permissions	Relasi user dengan permission langsung jika diperlukan
6	role_has_permissions	Relasi role dengan permission
7	aoi_areas	Menyimpan Area of Interest
8	analysis_runs	Menyimpan riwayat proses analisis
9	gee_imports	Menyimpan metadata import hasil GEE
10	satellite_layers	Menyimpan metadata layer hasil analisis
11	hotspots	Menyimpan hotspot dugaan perubahan mangrove
12	field_validations	Menyimpan hasil validasi lapangan
13	validation_photos	Menyimpan metadata foto validasi
14	reports	Menyimpan metadata laporan PDF
15	audit_logs	Menyimpan log aktivitas penting
16	user_preferences	Opsional untuk pengaturan UI user internal
6. Diagram ERD Utama
erDiagram
    users {
        bigint id PK
        string name
        string email
        string password
        string organization
        string phone
        boolean is_active
        timestamp last_login_at
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    roles {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
    }

    permissions {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
    }

    model_has_roles {
        bigint role_id FK
        string model_type
        bigint model_id
    }

    model_has_permissions {
        bigint permission_id FK
        string model_type
        bigint model_id
    }

    role_has_permissions {
        bigint permission_id FK
        bigint role_id FK
    }

    aoi_areas {
        bigint id PK
        string name
        string code
        string type
        string province
        string regency
        string district
        string village
        decimal estimated_area_ha
        string legal_status
        string data_source
        string verification_status
        string sensitivity_level
        geometry geom
        json metadata
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    analysis_runs {
        bigint id PK
        bigint aoi_area_id FK
        string name
        string code
        date before_start_date
        date before_end_date
        date after_start_date
        date after_end_date
        decimal cloud_cover_threshold
        decimal mvi_threshold
        decimal cmri_threshold
        string status
        integer total_hotspots
        decimal total_area_ha
        json parameters
        json summary
        bigint created_by FK
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    gee_imports {
        bigint id PK
        bigint analysis_run_id FK
        string import_type
        string source_file_name
        string file_path
        string status
        integer feature_count
        json metadata
        json import_summary
        bigint imported_by FK
        timestamp imported_at
        timestamp created_at
        timestamp updated_at
    }

    satellite_layers {
        bigint id PK
        bigint analysis_run_id FK
        bigint gee_import_id FK
        string layer_type
        string name
        string file_path
        string tile_url
        string thumbnail_url
        string visibility
        string sensitivity_level
        json metadata
        timestamp created_at
        timestamp updated_at
    }

    hotspots {
        bigint id PK
        bigint analysis_run_id FK
        bigint aoi_area_id FK
        bigint gee_import_id FK
        string hotspot_code
        geometry geom
        geometry centroid
        decimal area_ha
        decimal centroid_lat
        decimal centroid_lng
        string priority
        string validation_status
        string hotspot_type
        string detection_method
        string source
        decimal mvi_before_mean
        decimal mvi_after_mean
        decimal mvi_delta_mean
        decimal cmri_before_mean
        decimal cmri_after_mean
        decimal cmri_delta_mean
        decimal ndvi_before_mean
        decimal ndvi_after_mean
        decimal ndvi_delta_mean
        decimal ndwi_before_mean
        decimal ndwi_after_mean
        decimal ndwi_delta_mean
        string sensitivity_level
        json raw_properties
        timestamp detected_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    field_validations {
        bigint id PK
        bigint hotspot_id FK
        bigint validator_id FK
        string validation_status
        string observed_condition
        integer confidence_score
        text notes
        geometry validation_point
        decimal latitude
        decimal longitude
        string sensitivity_level
        timestamp visited_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    validation_photos {
        bigint id PK
        bigint field_validation_id FK
        string file_path
        string file_name
        string mime_type
        integer file_size
        text caption
        boolean is_primary
        geometry photo_point
        decimal latitude
        decimal longitude
        timestamp taken_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    reports {
        bigint id PK
        string report_code
        string report_type
        bigint hotspot_id FK
        bigint analysis_run_id FK
        string title
        string file_path
        string file_name
        string mime_type
        integer file_size
        boolean include_validation_photos
        boolean include_precise_coordinates
        string sensitivity_level
        string status
        bigint generated_by FK
        timestamp generated_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    audit_logs {
        bigint id PK
        bigint user_id FK
        string action
        string resource_type
        bigint resource_id
        string ip_address
        text user_agent
        json old_values
        json new_values
        json metadata
        timestamp created_at
    }

    user_preferences {
        bigint id PK
        bigint user_id FK
        string default_theme
        bigint default_aoi_id FK
        bigint default_analysis_run_id FK
        json dashboard_filters
        json ui_state
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ model_has_roles : has
    roles ||--o{ model_has_roles : assigned_to

    users ||--o{ model_has_permissions : has
    permissions ||--o{ model_has_permissions : assigned_to

    roles ||--o{ role_has_permissions : has
    permissions ||--o{ role_has_permissions : belongs_to

    users ||--o{ aoi_areas : creates
    users ||--o{ analysis_runs : creates
    users ||--o{ gee_imports : imports
    users ||--o{ field_validations : validates
    users ||--o{ reports : generates
    users ||--o{ audit_logs : performs
    users ||--o{ user_preferences : owns

    aoi_areas ||--o{ analysis_runs : has
    aoi_areas ||--o{ hotspots : contains

    analysis_runs ||--o{ gee_imports : has
    analysis_runs ||--o{ satellite_layers : has
    analysis_runs ||--o{ hotspots : produces
    analysis_runs ||--o{ reports : summarized_by

    gee_imports ||--o{ satellite_layers : provides
    gee_imports ||--o{ hotspots : imports

    hotspots ||--o{ field_validations : has
    hotspots ||--o{ reports : reported_by

    field_validations ||--o{ validation_photos : has
7. Desain Tabel Detail
7.1 users
Fungsi

Menyimpan akun pengguna internal.

Public visitor tidak disimpan di tabel users.

Digunakan oleh Halaman
Login.
Profile.
Users & Roles.
Field Validation.
Reports.
Audit Logs.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
name	varchar	Nama user
email	varchar	Email login
password	varchar	Password hash
organization	varchar nullable	Organisasi user
phone	varchar nullable	Nomor kontak
is_active	boolean	Status aktif akun
last_login_at	timestamp nullable	Login terakhir
email_verified_at	timestamp nullable	Verifikasi email jika digunakan
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp nullable	Soft delete
Catatan

Role tidak disimpan langsung di tabel users.

Role dan permission dikelola melalui tabel Spatie:

roles
permissions
model_has_roles
model_has_permissions
role_has_permissions
7.2 roles
Fungsi

Menyimpan role internal sistem.

Role MVP
Role	Keterangan
validator	Mengisi validasi lapangan
ngo_advocate	Mengakses hasil validasi dan laporan
admin	Mengelola data utama sistem
super_admin	Akses penuh sistem
Catatan

Tidak ada role login untuk public visitor.

Public visitor mengakses public page tanpa akun.

7.3 permissions
Fungsi

Menyimpan permission granular.

Permission Utama
Permission	Fungsi
view_internal_dashboard	Melihat dashboard internal
view_precise_coordinates	Melihat koordinat presisi
manage_aoi	Mengelola AOI
manage_analysis_runs	Mengelola analysis run
import_gee_result	Import hasil GEE
view_hotspot	Melihat hotspot internal
update_hotspot_status	Mengubah status/priority hotspot
validate_hotspot	Mengisi validasi lapangan
upload_validation_photo	Upload foto validasi
view_validation_photo	Melihat foto validasi
export_report	Generate dan download report
manage_users	Mengelola user
view_audit_logs	Melihat audit log
7.4 aoi_areas
Fungsi

Menyimpan Area of Interest yang menjadi batas analisis GEE dan visualisasi WebGIS.

AOI utama MVP:

Kawasan KTH Nipah ±242 ha.
Area konflik ±60–62 ha.
Buffer atau zona referensi jika diperlukan.
Digunakan oleh Halaman
Dashboard WebGIS.
AOI Management.
Analysis Runs.
Public Dashboard dalam bentuk tergeneralisasi jika aman.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
name	varchar	Nama AOI
code	varchar nullable	Kode AOI
type	varchar	main_aoi, conflict_zone, buffer, reference
province	varchar	Provinsi
regency	varchar	Kabupaten
district	varchar	Kecamatan
village	varchar nullable	Desa
estimated_area_ha	decimal nullable	Luas estimasi
legal_status	varchar nullable	Status hukum jika tersedia
data_source	varchar	official, manual_digitization, osm, other
verification_status	varchar	draft, verified, needs_revision
sensitivity_level	varchar	public, internal, restricted
geom	MultiPolygon/Geometry	Geometry AOI
metadata	json nullable	Metadata tambahan
created_by	foreignId	User pembuat
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Index
GIST index pada geom.
Index pada type.
Index pada verification_status.
Index pada sensitivity_level.
7.5 analysis_runs
Fungsi

Menyimpan catatan setiap proses analisis before-after yang dilakukan pada AOI.

Pada MVP, proses GEE bisa dilakukan manual atau semi-manual, tetapi hasilnya tetap dicatat di sistem.

Digunakan oleh Halaman
Dashboard WebGIS.
Analysis Runs.
GEE Imports.
Reports.
Hotspots.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
aoi_area_id	foreignId	Relasi ke AOI
name	varchar	Nama analysis run
code	varchar nullable	Kode run
before_start_date	date	Awal periode before
before_end_date	date	Akhir periode before
after_start_date	date	Awal periode after
after_end_date	date	Akhir periode after
cloud_cover_threshold	decimal nullable	Batas cloud cover
mvi_threshold	decimal nullable	Threshold MVI
cmri_threshold	decimal nullable	Threshold CMRI
status	varchar	draft, processing, processed, failed
total_hotspots	integer	Jumlah hotspot
total_area_ha	decimal	Total area hotspot
parameters	json nullable	Parameter analisis
summary	json nullable	Ringkasan hasil
created_by	foreignId	User pembuat
processed_at	timestamp nullable	Waktu selesai diproses
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Relasi
analysis_runs belongs to aoi_areas.
analysis_runs has many gee_imports.
analysis_runs has many satellite_layers.
analysis_runs has many hotspots.
analysis_runs has many reports.
7.6 gee_imports
Fungsi

Menyimpan metadata import hasil Google Earth Engine.

GEE import menerima hasil seperti:

Hotspot GeoJSON.
Metadata analysis.
Static image path jika tersedia.
Ringkasan import.
Digunakan oleh Halaman
GEE Imports.
Analysis Run Detail.
Dashboard WebGIS.
Audit Logs.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
analysis_run_id	foreignId	Relasi ke analysis run
import_type	varchar	hotspots, layer, metadata
source_file_name	varchar nullable	Nama file asli
file_path	varchar nullable	Path private/internal file
status	varchar	pending, imported, failed
feature_count	integer nullable	Jumlah feature
metadata	json nullable	Metadata import
import_summary	json nullable	Ringkasan import
imported_by	foreignId	User pengimport
imported_at	timestamp nullable	Waktu import
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Catatan Keamanan

file_path tidak boleh dikirim mentah ke frontend public.

Untuk frontend internal, lebih aman menggunakan endpoint download/view terproteksi jika file perlu dibuka.

7.7 satellite_layers
Fungsi

Menyimpan metadata layer hasil analisis.

Layer dapat berupa:

RGB before.
RGB after.
MVI before.
MVI after.
CMRI before.
CMRI after.
Delta layer.
Static map.
Thumbnail.
Digunakan oleh Halaman
Dashboard WebGIS.
Analysis Run Detail.
Report PDF.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
analysis_run_id	foreignId	Relasi ke analysis run
gee_import_id	foreignId nullable	Relasi ke import
layer_type	varchar	before_rgb, after_rgb, mvi, cmri, delta, static_map
name	varchar	Nama layer
file_path	varchar nullable	Path file internal
tile_url	text nullable	URL tile jika tersedia
thumbnail_url	text nullable	Thumbnail jika tersedia
visibility	varchar	internal, public_generalized, hidden
sensitivity_level	varchar	public, internal, restricted
metadata	json nullable	Metadata layer
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Catatan

Tile interaktif GEE ditunda setelah MVP.

Untuk MVP, layer utama adalah:

Hotspot GeoJSON.
Static map untuk PDF.
7.8 hotspots
Fungsi

Menyimpan hotspot dugaan perubahan tutupan mangrove hasil GEE.

Hotspot adalah indikasi awal, bukan vonis final.

Digunakan oleh Halaman
Dashboard WebGIS.
Hotspots.
Hotspot Detail.
Field Validations.
Reports.
Public Dashboard dalam bentuk tergeneralisasi.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
analysis_run_id	foreignId	Relasi ke analysis run
aoi_area_id	foreignId	Relasi ke AOI
gee_import_id	foreignId nullable	Relasi ke import
hotspot_code	varchar	Kode hotspot
geom	MultiPolygon/Geometry	Polygon hotspot
centroid	Point/Geometry	Titik centroid
area_ha	decimal	Luas hotspot
centroid_lat	decimal nullable	Latitude centroid
centroid_lng	decimal nullable	Longitude centroid
priority	varchar	low, medium, high
validation_status	varchar	detected, under_review, validated, rejected, needs_recheck
hotspot_type	varchar nullable	mangrove_loss_indication, other
detection_method	varchar nullable	sentinel2_mvi_cmri_change_detection
source	varchar nullable	gee_sentinel2_mvp
mvi_before_mean	decimal nullable	Rata-rata MVI before
mvi_after_mean	decimal nullable	Rata-rata MVI after
mvi_delta_mean	decimal nullable	Delta MVI
cmri_before_mean	decimal nullable	Rata-rata CMRI before
cmri_after_mean	decimal nullable	Rata-rata CMRI after
cmri_delta_mean	decimal nullable	Delta CMRI
ndvi_before_mean	decimal nullable	Rata-rata NDVI before
ndvi_after_mean	decimal nullable	Rata-rata NDVI after
ndvi_delta_mean	decimal nullable	Delta NDVI
ndwi_before_mean	decimal nullable	Rata-rata NDWI before
ndwi_after_mean	decimal nullable	Rata-rata NDWI after
ndwi_delta_mean	decimal nullable	Delta NDWI
sensitivity_level	varchar	public, internal, restricted
raw_properties	json nullable	Properti mentah dari GEE
detected_at	timestamp nullable	Waktu deteksi
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Index
GIST index pada geom.
GIST index pada centroid.
Index pada analysis_run_id.
Index pada aoi_area_id.
Index pada priority.
Index pada validation_status.
Index pada detected_at.
Index pada sensitivity_level.
Catatan Public API

Public API tidak boleh mengirim:

geom lengkap.
centroid presisi.
centroid_lat presisi.
centroid_lng presisi.
raw_properties.
Catatan validasi.
Foto validasi.

Public API hanya boleh mengirim generalized location.

7.9 field_validations
Fungsi

Menyimpan hasil validasi lapangan oleh validator.

Digunakan oleh Halaman
Field Validations.
Hotspot Detail.
Dashboard drawer.
Report PDF.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
hotspot_id	foreignId	Relasi ke hotspot
validator_id	foreignId	Relasi ke user validator
validation_status	varchar	validated, rejected, needs_recheck, under_review
observed_condition	varchar/text	Kondisi lapangan
confidence_score	integer	Tingkat keyakinan 0-100
notes	text nullable	Catatan validator
validation_point	Point/Geometry nullable	Titik validasi
latitude	decimal nullable	Latitude
longitude	decimal nullable	Longitude
sensitivity_level	varchar	internal, restricted
visited_at	timestamp nullable	Waktu kunjungan
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Relasi
field_validations belongs to hotspots.
field_validations belongs to users sebagai validator.
field_validations has many validation_photos.
Catatan Keamanan

Catatan validator tidak boleh muncul di public dashboard.

7.10 validation_photos
Fungsi

Menyimpan metadata foto validasi lapangan.

File fisik disimpan di private storage, bukan langsung di database.

Database hanya menyimpan metadata file.

Digunakan oleh Halaman
Validation Detail.
Hotspot Detail.
Validation Photo Gallery.
Report PDF jika dipilih.
Protected File Endpoint.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
field_validation_id	foreignId	Relasi ke field validation
file_path	varchar	Path file private storage
file_name	varchar	Nama file
mime_type	varchar	MIME type
file_size	integer	Ukuran file
caption	text nullable	Caption foto
is_primary	boolean	Foto utama atau bukan
photo_point	Point/Geometry nullable	Titik foto
latitude	decimal nullable	Latitude foto
longitude	decimal nullable	Longitude foto
taken_at	timestamp nullable	Waktu foto diambil
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp nullable	Soft delete
Catatan Keamanan

Frontend tidak boleh menerima file_path mentah.

Frontend hanya menerima:

file_url

File dibuka melalui endpoint terproteksi.

7.11 reports
Fungsi

Menyimpan metadata laporan PDF.

File PDF disimpan di private storage.

Jenis Report
Hotspot report.
Analysis run report.
Digunakan oleh Halaman
Reports.
Hotspot Detail.
Analysis Run Detail.
Dashboard drawer.
Protected Download Endpoint.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
report_code	varchar	Kode report
report_type	varchar	hotspot, analysis_run
hotspot_id	foreignId nullable	Relasi ke hotspot
analysis_run_id	foreignId nullable	Relasi ke analysis run
title	varchar	Judul report
file_path	varchar	Path file private storage
file_name	varchar	Nama file
mime_type	varchar	MIME type
file_size	integer	Ukuran file
include_validation_photos	boolean	Apakah foto dimasukkan
include_precise_coordinates	boolean	Apakah koordinat presisi dimasukkan
sensitivity_level	varchar	internal, restricted
status	varchar	generated, failed, archived
generated_by	foreignId	User pembuat report
generated_at	timestamp	Waktu generate
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp nullable	Soft delete
Catatan Keamanan

Frontend tidak boleh menerima file_path mentah.

Frontend hanya menerima:

download_url

Download harus melalui endpoint terproteksi.

7.12 audit_logs
Fungsi

Menyimpan jejak aktivitas penting.

Digunakan oleh Halaman
Audit Logs.
Security review.
Admin monitoring.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
user_id	foreignId nullable	User yang melakukan aksi
action	varchar	Nama aksi
resource_type	varchar nullable	Tipe resource
resource_id	bigint nullable	ID resource
ip_address	varchar nullable	IP user
user_agent	text nullable	Browser/device
old_values	json nullable	Data sebelum perubahan
new_values	json nullable	Data setelah perubahan
metadata	json nullable	Metadata tambahan
created_at	timestamp	Waktu log
Aktivitas yang Dicatat
Login.
Logout.
Create/update/delete AOI.
Create/update analysis run.
Import GEE.
Update hotspot.
Create/update field validation.
Upload/delete validation photo.
Generate/download report.
Create/update user.
Update role/permission.
Akses file sensitif jika memungkinkan.
7.13 user_preferences
Status

Opsional / P2.

Fungsi

Menyimpan preferensi UI user internal jika dibutuhkan.

Digunakan oleh Halaman
Settings/Profile.
Dashboard.
Internal app layout.
Kolom
Kolom	Tipe	Keterangan
id	bigint	Primary key
user_id	foreignId	Relasi ke user
default_theme	varchar nullable	light, dark, system
default_aoi_id	foreignId nullable	AOI default
default_analysis_run_id	foreignId nullable	Analysis run default
dashboard_filters	json nullable	Filter dashboard terakhir
ui_state	json nullable	State UI ringan
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Catatan

Tabel ini tidak wajib untuk MVP jika ingin menjaga sistem tetap sederhana.

8. Relasi Data Utama
8.1 User dan RBAC
users
→ model_has_roles
→ roles
→ role_has_permissions
→ permissions

Satu user bisa memiliki satu atau beberapa role.

Role menentukan permission.

Permission menentukan menu, tombol, field, dan endpoint yang boleh diakses.

8.2 AOI dan Analysis Run
aoi_areas
→ analysis_runs

Satu AOI dapat memiliki banyak analysis run.

Contoh:

AOI KTH Nipah
→ Analysis Run Januari-April 2024 vs Januari-April 2025
→ Analysis Run Mei-Juni 2025 vs Juli-Agustus 2025
8.3 Analysis Run dan GEE Import
analysis_runs
→ gee_imports

Satu analysis run dapat memiliki beberapa import.

Contoh:

Import hotspot GeoJSON.
Import metadata.
Import static layer.
8.4 GEE Import dan Hotspot
gee_imports
→ hotspots

Satu GEE import dapat menghasilkan banyak hotspot.

8.5 Hotspot dan Field Validation
hotspots
→ field_validations

Satu hotspot dapat memiliki banyak validasi.

Hal ini memungkinkan:

Validasi ulang.
Validasi oleh beberapa validator.
Perubahan status dari waktu ke waktu.
8.6 Field Validation dan Validation Photo
field_validations
→ validation_photos

Satu validasi dapat memiliki banyak foto.

8.7 Hotspot / Analysis Run dan Report
hotspots
→ reports

analysis_runs
→ reports

Report dapat dibuat untuk:

Satu hotspot.
Satu analysis run.
9. Data User Disimpan di Mana?
9.1 Data Akun User

Data akun user internal disimpan di:

users

Berisi:

Nama.
Email.
Password hash.
Organisasi.
Nomor kontak.
Status aktif.
Waktu login terakhir.
9.2 Data Role User

Data role user disimpan melalui tabel Spatie:

roles
model_has_roles

Contoh:

Moses → admin
Validator A → validator
NGO B → ngo_advocate
9.3 Data Permission User

Data permission disimpan melalui:

permissions
role_has_permissions
model_has_permissions

Permission dipakai untuk membatasi:

Menu yang terlihat.
Halaman yang bisa dibuka.
Tombol aksi.
Endpoint API.
Field sensitif.
File foto/report.
9.4 Data Aktivitas User

Aktivitas penting user disimpan di:

audit_logs

Contoh:

User login.
User import GeoJSON.
User upload foto validasi.
User generate report.
User download report.
User update status hotspot.
9.5 Data Validasi User

Jika user berperan sebagai validator, hasil validasinya disimpan di:

field_validations

Foto validasinya disimpan sebagai metadata di:

validation_photos

File foto aslinya disimpan di:

private storage
9.6 Data Report yang Dibuat User

Jika user membuat report, metadatanya disimpan di:

reports

File PDF aslinya disimpan di:

private storage
10. Public Data dan Internal Data
10.1 Public Data

Public data berasal dari tabel internal, tetapi harus disaring sebelum dikirim.

Public dashboard dapat membaca ringkasan dari:

analysis_runs
hotspots

Namun hanya mengirim:

Jumlah hotspot.
Estimasi total area.
Status umum.
Priority umum.
Generalized centroid.
Latest analysis info.
Disclaimer.
10.2 Internal Data

Internal data dapat membaca tabel lengkap sesuai permission.

Contoh:

Validator dapat melihat hotspot detail.
NGO dapat melihat hasil validasi dan report.
Admin dapat mengelola AOI dan analysis run.
Super admin dapat mengelola semua.
11. Data Sensitif per Tabel
Tabel	Data Sensitif	Perlindungan
users	Email, phone, status akun	Internal only
aoi_areas	Geometry konflik, legal status	RBAC
analysis_runs	Parameter analisis tertentu	Internal
gee_imports	File import, metadata mentah	Internal
satellite_layers	File path, tile URL internal	RBAC
hotspots	Geometry, centroid presisi, raw properties	Generalized untuk public
field_validations	Catatan, titik validasi	Internal/restricted
validation_photos	Foto, file path, geotag	Protected endpoint
reports	PDF, koordinat presisi, foto	Protected download
audit_logs	Aktivitas user, IP, metadata	Admin only
12. Storage File

Database tidak menyimpan file asli dalam bentuk binary.

Database hanya menyimpan metadata file.

12.1 File yang Disimpan di Private Storage
Jenis File	Tabel Metadata	Storage
GeoJSON import GEE	gee_imports	private
Static map	satellite_layers	private/internal
Foto validasi	validation_photos	private
PDF report	reports	private
12.2 Prinsip Akses File

File tidak boleh diakses langsung melalui public URL.

Akses file harus melalui endpoint seperti:

/api/v1/validation-photos/{photo}/file
/api/v1/reports/{report}/download

Endpoint harus mengecek:

User login.
Role.
Permission.
Ownership jika diperlukan.
Sensitivity level.
13. Status dan Enum Utama
13.1 aoi_areas.type
main_aoi
conflict_zone
buffer
reference
13.2 aoi_areas.verification_status
draft
verified
needs_revision
13.3 analysis_runs.status
draft
processing
processed
failed
archived
13.4 gee_imports.status
pending
imported
failed
13.5 hotspots.priority
low
medium
high
13.6 hotspots.validation_status
detected
under_review
validated
rejected
needs_recheck
13.7 field_validations.validation_status
under_review
validated
rejected
needs_recheck
13.8 reports.report_type
hotspot
analysis_run
13.9 sensitivity_level
public
internal
restricted
14. Index dan Optimasi
14.1 Index Spasial

Gunakan GIST index untuk:

aoi_areas.geom
hotspots.geom
hotspots.centroid
field_validations.validation_point
validation_photos.photo_point
14.2 Index Non-Spasial

Gunakan index untuk:

analysis_runs.aoi_area_id
analysis_runs.status
gee_imports.analysis_run_id
hotspots.analysis_run_id
hotspots.aoi_area_id
hotspots.priority
hotspots.validation_status
field_validations.hotspot_id
field_validations.validator_id
reports.hotspot_id
reports.analysis_run_id
reports.generated_by
audit_logs.user_id
audit_logs.action
audit_logs.resource_type
15. Cascade dan Delete Policy
15.1 Soft Delete

Tabel yang sebaiknya memakai soft delete:

users
aoi_areas
analysis_runs
hotspots
field_validations
validation_photos
reports
15.2 Hard Delete

Tabel yang boleh hard delete atau mengikuti default:

role_has_permissions
model_has_roles
model_has_permissions
audit_logs, sebaiknya tidak dihapus sembarangan.
15.3 Delete Rule
Relasi	Aturan
AOI dihapus	Analysis run tidak langsung hard delete, gunakan soft delete
Analysis run dihapus	Hotspot sebaiknya tetap soft delete
Hotspot dihapus	Validasi dan report tidak hilang permanen
Validation dihapus	Foto validasi soft delete
User dihapus	Data validasi/report tetap menyimpan jejak user jika memungkinkan
Report dihapus	File dapat dihapus atau diarsipkan sesuai kebijakan
16. ERD per Modul
16.1 Modul Auth dan RBAC
erDiagram
    users {
        bigint id PK
        string name
        string email
        string password
        boolean is_active
    }

    roles {
        bigint id PK
        string name
        string guard_name
    }

    permissions {
        bigint id PK
        string name
        string guard_name
    }

    model_has_roles {
        bigint role_id FK
        string model_type
        bigint model_id
    }

    model_has_permissions {
        bigint permission_id FK
        string model_type
        bigint model_id
    }

    role_has_permissions {
        bigint permission_id FK
        bigint role_id FK
    }

    users ||--o{ model_has_roles : has
    roles ||--o{ model_has_roles : assigned
    roles ||--o{ role_has_permissions : has
    permissions ||--o{ role_has_permissions : granted
    users ||--o{ model_has_permissions : direct_permission
16.2 Modul GEE dan Hotspot
erDiagram
    aoi_areas {
        bigint id PK
        string name
        geometry geom
    }

    analysis_runs {
        bigint id PK
        bigint aoi_area_id FK
        date before_start_date
        date after_start_date
        string status
    }

    gee_imports {
        bigint id PK
        bigint analysis_run_id FK
        string status
        integer feature_count
    }

    hotspots {
        bigint id PK
        bigint analysis_run_id FK
        bigint aoi_area_id FK
        bigint gee_import_id FK
        geometry geom
        geometry centroid
        decimal area_ha
        string priority
        string validation_status
    }

    aoi_areas ||--o{ analysis_runs : has
    analysis_runs ||--o{ gee_imports : has
    gee_imports ||--o{ hotspots : creates
    analysis_runs ||--o{ hotspots : produces
    aoi_areas ||--o{ hotspots : contains
16.3 Modul Validasi Lapangan
erDiagram
    users {
        bigint id PK
        string name
        string email
    }

    hotspots {
        bigint id PK
        string hotspot_code
        string validation_status
    }

    field_validations {
        bigint id PK
        bigint hotspot_id FK
        bigint validator_id FK
        string validation_status
        integer confidence_score
        geometry validation_point
    }

    validation_photos {
        bigint id PK
        bigint field_validation_id FK
        string file_path
        string file_name
        string mime_type
    }

    users ||--o{ field_validations : validates
    hotspots ||--o{ field_validations : has
    field_validations ||--o{ validation_photos : has
16.4 Modul Report
erDiagram
    users {
        bigint id PK
        string name
    }

    hotspots {
        bigint id PK
        string hotspot_code
    }

    analysis_runs {
        bigint id PK
        string name
    }

    reports {
        bigint id PK
        string report_code
        string report_type
        bigint hotspot_id FK
        bigint analysis_run_id FK
        bigint generated_by FK
        string file_path
    }

    users ||--o{ reports : generates
    hotspots ||--o{ reports : has
    analysis_runs ||--o{ reports : has
17. Catatan untuk Implementasi Laravel Migration
17.1 Spatial Column

Untuk PostgreSQL/PostGIS, kolom geometry sebaiknya dibuat sebagai:

$table->geometry('geom', subtype: 'MULTIPOLYGON', srid: 4326);
$table->geometry('centroid', subtype: 'POINT', srid: 4326);

Jika library migration tidak mendukung langsung, gunakan raw SQL:

ALTER TABLE hotspots
ADD COLUMN geom geometry(MultiPolygon, 4326);

CREATE INDEX hotspots_geom_gist
ON hotspots
USING GIST (geom);
17.2 SQLite Testing Fallback

Jika test memakai SQLite, geometry dapat disimpan sebagai JSON/text fallback.

Namun untuk production, tetap wajib PostGIS.

17.3 Spatie Permission

Gunakan migration bawaan Spatie untuk:

roles
permissions
model_has_roles
model_has_permissions
role_has_permissions

Jangan membuat tabel role custom jika Spatie sudah dipakai.

18. Aturan Public API Berdasarkan ERD

Public API boleh mengambil data dari tabel:

analysis_runs
hotspots

Namun response harus dibatasi.

18.1 Field yang Boleh Dikirim ke Public
hotspot_code atau public_code
area_ha rounded
priority
validation_status
generalized_location
latest_analysis_run
summary count
disclaimer
18.2 Field yang Tidak Boleh Dikirim ke Public
geom
centroid presisi
centroid_lat presisi
centroid_lng presisi
raw_properties
field_validations.notes
validation_photos
reports.file_path
gee_imports.file_path
satellite_layers.file_path internal
audit_logs
users
19. Hubungan ERD dengan Page per Page

Struktur halaman internal menggunakan tabel berikut:

Halaman	Tabel Utama	Tabel Pendukung
Dashboard	analysis_runs, aoi_areas, hotspots	satellite_layers
Hotspots	hotspots	analysis_runs, aoi_areas, field_validations, reports
AOI Management	aoi_areas	analysis_runs
Analysis Runs	analysis_runs	aoi_areas, gee_imports, hotspots, reports
GEE Imports	gee_imports	analysis_runs, hotspots
Field Validations	field_validations	hotspots, users, validation_photos
Validation Photos	validation_photos	field_validations
Reports	reports	hotspots, analysis_runs, users
Users & Roles	users, roles, permissions	model_has_roles, role_has_permissions
Audit Logs	audit_logs	users
Settings/Profile	users	user_preferences opsional
20. Kesimpulan

ERD MANGROVE-EYE dirancang untuk mendukung alur utama MVP:

User internal login
→ Admin mengelola AOI
→ Admin membuat analysis run
→ GEE menghasilkan hotspot GeoJSON
→ Admin import hasil GEE
→ Hotspot tersimpan di PostGIS
→ Dashboard menampilkan hotspot
→ Validator melakukan validasi lapangan
→ Validator upload foto bukti
→ NGO/Admin generate report PDF
→ Aktivitas penting tercatat di audit log

Data user internal disimpan di tabel users, sedangkan role dan permission disimpan melalui tabel Spatie Permission. Data spasial utama disimpan di aoi_areas dan hotspots menggunakan PostGIS. Data hasil pengecekan lapangan disimpan di field_validations dan validation_photos. Data laporan disimpan di reports, sementara jejak aktivitas disimpan di audit_logs.