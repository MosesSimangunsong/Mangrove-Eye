Database Design MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	Database Design / ERD
Versi	v1.0
Acuan Utama	docs/PRD.md, docs/MVP_SCOPE.md
Database Utama	PostgreSQL
Spatial Extension	PostGIS
Target Penyimpanan	docs/DATABASE_DESIGN.md
2. Ringkasan Desain Database

Database MANGROVE-EYE dirancang untuk menyimpan data inti sistem peringatan dini deforestasi mangrove berbasis WebGIS.

Fokus utama database adalah menyimpan:

data pengguna dan role;
Area of Interest atau AOI;
riwayat analisis citra satelit atau analysis run;
hasil import dari Google Earth Engine;
hotspot dugaan perubahan tutupan mangrove;
nilai indeks spektral MVI, CMRI, NDVI, dan NDWI;
validasi lapangan;
foto/bukti validasi;
laporan PDF;
audit log aktivitas penting.

Database menggunakan PostgreSQL + PostGIS karena sistem perlu menyimpan dan melakukan query terhadap data geospasial seperti polygon AOI, polygon hotspot, centroid hotspot, dan titik validasi lapangan.

3. Prinsip Desain Database
3.1 PostGIS sebagai Basis Data Spasial

Data geospasial tidak disimpan sebagai teks biasa saja. Geometry utama disimpan menggunakan tipe PostGIS seperti:

POINT
POLYGON
MULTIPOLYGON
GEOMETRY

Semua geometry utama menggunakan sistem koordinat:

SRID 4326 / WGS 84

SRID 4326 dipilih karena umum digunakan oleh GeoJSON, Google Earth Engine, dan Leaflet.

3.2 Laravel Tidak Menghitung Raster Mentah

Laravel tidak bertugas menghitung NDVI, NDWI, MVI, atau CMRI dari citra mentah. Perhitungan dilakukan di Google Earth Engine.

Database hanya menyimpan:

metadata analisis;
parameter analisis;
hasil ringkasan;
hotspot hasil deteksi;
nilai indeks before-after;
path/URL layer hasil export;
hasil validasi.
3.3 Data Satelit Bukan Vonis Final

Tabel hotspot tidak boleh dianggap sebagai bukti final. Hotspot hanya menyimpan indikasi awal yang masih perlu divalidasi.

Karena itu, desain database memisahkan:

hotspots

dari:

field_validations

Dengan pemisahan ini, sistem dapat membedakan antara:

hasil deteksi satelit;
hasil pengecekan lapangan;
laporan PDF yang sudah dibuat.
3.4 Data Sensitif Harus Dibatasi

Beberapa data dianggap sensitif:

koordinat presisi hotspot;
polygon zona konflik;
foto bukti lapangan;
catatan validator;
laporan PDF internal.

Pembatasan akses dilakukan pada level aplikasi/API melalui RBAC. Namun, database tetap menyediakan field pendukung seperti:

sensitivity_level

untuk membantu sistem membedakan data publik, internal, dan terbatas.

3.5 MVP Harus Tetap Sederhana

Database ini dirancang cukup kuat untuk MVP, tetapi tidak terlalu kompleks. Tabel U-Net, training dataset, model AI, dan Sentinel-1 tidak dimasukkan ke MVP awal.

Fitur tersebut dapat ditambahkan pada roadmap lanjutan.

4. Daftar Tabel MVP
No	Tabel	Fungsi
1	users	Menyimpan akun pengguna
2	roles	Menyimpan daftar role
3	permissions	Menyimpan daftar permission
4	user_roles	Relasi user dan role
5	role_permissions	Relasi role dan permission
6	aoi_areas	Menyimpan Area of Interest
7	analysis_runs	Menyimpan riwayat proses analisis
8	gee_imports	Menyimpan metadata import hasil GEE
9	satellite_layers	Menyimpan layer hasil analisis
10	hotspots	Menyimpan hotspot dugaan perubahan
11	field_validations	Menyimpan hasil validasi lapangan
12	validation_photos	Menyimpan foto/bukti validasi
13	reports	Menyimpan metadata laporan PDF
14	audit_logs	Menyimpan log aktivitas penting
5. Entity Relationship Diagram
6. Desain Tabel Detail
6.1 users
Fungsi

Menyimpan akun pengguna sistem.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
name	varchar(150)	Nama pengguna
email	varchar(150)	Email login
password	varchar(255)	Password hash
organization	varchar(150)	Organisasi pengguna, opsional
phone	varchar(30)	Nomor kontak, opsional
is_active	boolean	Status aktif akun
last_login_at	timestamp	Waktu login terakhir
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Catatan

Role pengguna tidak disimpan langsung di tabel users, tetapi melalui tabel pivot user_roles.

6.2 roles
Fungsi

Menyimpan daftar role sistem.

Role Awal
Role	Keterangan
public_viewer	Melihat dashboard umum tanpa koordinat presisi
validator	Mengisi validasi lapangan
ngo_advocate	Mengakses hasil validasi dan laporan
admin	Mengelola data utama sistem
super_admin	Akses penuh sistem
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
name	varchar(100)	Nama role
slug	varchar(100)	Slug unik role
description	text	Deskripsi role
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
6.3 permissions
Fungsi

Menyimpan daftar permission granular.

Contoh Permission
Permission	Fungsi
view_public_dashboard	Melihat dashboard publik
view_internal_dashboard	Melihat dashboard internal
view_precise_coordinates	Melihat koordinat presisi
manage_aoi	Mengelola AOI
manage_analysis_runs	Mengelola analysis run
import_gee_result	Import hasil GEE
validate_hotspot	Mengisi validasi hotspot
export_report	Export laporan PDF
manage_users	Mengelola user
view_audit_logs	Melihat audit log
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
name	varchar(120)	Nama permission
slug	varchar(120)	Slug unik
description	text	Deskripsi permission
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
6.4 user_roles
Fungsi

Menghubungkan user dengan role.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
user_id	foreignId	Relasi ke users.id
role_id	foreignId	Relasi ke roles.id
created_at	timestamp	Waktu dibuat
Constraint
unique(user_id, role_id)
6.5 role_permissions
Fungsi

Menghubungkan role dengan permission.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
role_id	foreignId	Relasi ke roles.id
permission_id	foreignId	Relasi ke permissions.id
created_at	timestamp	Waktu dibuat
Constraint
unique(role_id, permission_id)
6.6 aoi_areas
Fungsi

Menyimpan Area of Interest yang menjadi batas analisis GEE dan visualisasi WebGIS.

AOI utama MVP adalah:

kawasan KTH Nipah ±242 ha;
area konflik ±60–62 ha;
buffer atau zona referensi jika diperlukan.
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
code	varchar(50)	Kode AOI, contoh AOI-KTH-001
name	varchar(150)	Nama AOI
aoi_type	varchar(50)	main_aoi, conflict_zone, buffer, reference
description	text	Deskripsi AOI
village	varchar(100)	Desa
district	varchar(100)	Kecamatan
regency	varchar(100)	Kabupaten
province	varchar(100)	Provinsi
estimated_area_ha	numeric(12,4)	Luas estimasi dalam hektare
legal_status	varchar(255)	Status hukum jika tersedia
legal_reference	varchar(255)	Nomor SK/dokumen jika tersedia
source_type	varchar(50)	official, digitized, osm, manual, other
source_name	varchar(150)	Nama sumber data
source_file_path	varchar(255)	Path file GeoJSON/Shapefile
verification_status	varchar(50)	draft, verified, needs_revision
sensitivity_level	varchar(50)	public, internal, restricted
geom	geometry(MultiPolygon, 4326)	Geometry AOI
created_by	foreignId	User pembuat
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Index
CREATE INDEX aoi_areas_geom_gix ON aoi_areas USING GIST (geom);
CREATE INDEX aoi_areas_type_idx ON aoi_areas (aoi_type);
CREATE INDEX aoi_areas_verification_idx ON aoi_areas (verification_status);
Catatan
geom harus valid secara topologi.
Jika input awal berupa Polygon, sistem dapat menyimpannya sebagai MultiPolygon.
AOI dengan sensitivity_level = restricted tidak boleh ditampilkan detailnya ke publik.
6.7 analysis_runs
Fungsi

Menyimpan metadata setiap proses analisis before-after yang dilakukan pada AOI tertentu.

Satu analysis run merepresentasikan satu proses analisis, misalnya:

Analisis Kwala Serapuh Januari–Juni 2026
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
aoi_area_id	foreignId	Relasi ke aoi_areas.id
name	varchar(180)	Nama analysis run
description	text	Deskripsi analisis
dataset_name	varchar(100)	Contoh: Sentinel-2 Level-2A
gee_collection_id	varchar(150)	Contoh: COPERNICUS/S2_SR_HARMONIZED
before_start_date	date	Awal periode before
before_end_date	date	Akhir periode before
after_start_date	date	Awal periode after
after_end_date	date	Akhir periode after
cloud_threshold	numeric(5,2)	Ambang awan
primary_indices	jsonb	Contoh: ["MVI","CMRI"]
supporting_indices	jsonb	Contoh: ["NDVI","NDWI"]
threshold_params	jsonb	Parameter threshold
processing_params	jsonb	Parameter GEE lain
total_hotspots	integer	Jumlah hotspot
total_area_ha	numeric(12,4)	Total estimasi luas terdampak
status	varchar(50)	draft, processed, published, archived, failed
processed_at	timestamp	Waktu selesai diproses
published_at	timestamp	Waktu dipublikasikan
created_by	foreignId	User pembuat
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Contoh threshold_params
{
  "mvi_delta_min": -1.5,
  "cmri_delta_min": -0.3,
  "min_area_ha": 0.05,
  "priority_high_area_ha": 1.0
}
Index
CREATE INDEX analysis_runs_aoi_idx ON analysis_runs (aoi_area_id);
CREATE INDEX analysis_runs_status_idx ON analysis_runs (status);
CREATE INDEX analysis_runs_before_after_idx ON analysis_runs (before_start_date, after_end_date);
CREATE INDEX analysis_runs_threshold_params_gin ON analysis_runs USING GIN (threshold_params);
6.8 gee_imports
Fungsi

Menyimpan metadata proses import hasil dari Google Earth Engine.

Pada MVP, proses GEE dapat dilakukan manual/semi-manual. Tabel ini menjaga agar setiap file hasil export tetap terlacak.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
analysis_run_id	foreignId	Relasi ke analysis_runs.id
import_type	varchar(50)	geojson, csv, static_image, tile_url, json
file_name	varchar(255)	Nama file
file_path	varchar(255)	Path file di storage
source_url	text	URL sumber jika ada
gee_task_id	varchar(150)	ID task GEE jika tersedia
status	varchar(50)	uploaded, processed, failed
total_features	integer	Jumlah fitur terbaca
error_message	text	Pesan error jika gagal
imported_by	foreignId	User pengimpor
imported_at	timestamp	Waktu import
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Index
CREATE INDEX gee_imports_analysis_run_idx ON gee_imports (analysis_run_id);
CREATE INDEX gee_imports_status_idx ON gee_imports (status);
6.9 satellite_layers
Fungsi

Menyimpan metadata layer hasil analisis yang dapat ditampilkan di dashboard atau dimasukkan ke laporan PDF.

Layer dapat berupa:

citra before;
citra after;
MVI before;
MVI after;
CMRI before;
CMRI after;
delta layer;
static image untuk PDF;
tile URL jika tersedia.
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
analysis_run_id	foreignId	Relasi ke analysis_runs.id
layer_name	varchar(150)	Nama layer
layer_type	varchar(50)	rgb_before, rgb_after, mvi, cmri, ndvi, ndwi, delta, static_map
period_type	varchar(50)	before, after, delta, summary
storage_type	varchar(50)	file, tile_url, external_url
file_path	varchar(255)	Path file
tile_url	text	URL tile jika tersedia
bbox	jsonb	Bounding box layer
visualization_params	jsonb	Palette, min, max, opacity
is_public	boolean	Apakah layer boleh tampil publik
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Contoh visualization_params
{
  "min": -1,
  "max": 1,
  "palette": ["red", "yellow", "green"],
  "opacity": 0.75
}
Catatan
Tile raster tidak wajib pada MVP.
Jika tile belum siap, static_map dapat digunakan untuk laporan PDF dan detail analysis run.
6.10 hotspots
Fungsi

Menyimpan hotspot dugaan perubahan tutupan mangrove hasil analisis GEE.

Hotspot adalah output utama dari analisis before-after.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
hotspot_code	varchar(80)	Kode unik hotspot
analysis_run_id	foreignId	Relasi ke analysis_runs.id
aoi_area_id	foreignId	Relasi ke aoi_areas.id
gee_import_id	foreignId	Relasi ke gee_imports.id, nullable
detected_at	timestamp	Waktu deteksi/import
centroid	geometry(Point, 4326)	Titik pusat hotspot
geom	geometry(MultiPolygon, 4326)	Area terdampak
area_ha	numeric(12,4)	Estimasi luas hotspot
mvi_before	numeric(10,6)	Nilai MVI periode before
mvi_after	numeric(10,6)	Nilai MVI periode after
mvi_delta	numeric(10,6)	Selisih MVI
cmri_before	numeric(10,6)	Nilai CMRI periode before
cmri_after	numeric(10,6)	Nilai CMRI periode after
cmri_delta	numeric(10,6)	Selisih CMRI
ndvi_before	numeric(10,6)	Nilai NDVI periode before, nullable
ndvi_after	numeric(10,6)	Nilai NDVI periode after, nullable
ndvi_delta	numeric(10,6)	Selisih NDVI, nullable
ndwi_before	numeric(10,6)	Nilai NDWI periode before, nullable
ndwi_after	numeric(10,6)	Nilai NDWI periode after, nullable
ndwi_delta	numeric(10,6)	Selisih NDWI, nullable
priority	varchar(50)	low, medium, high
validation_status	varchar(50)	detected, under_review, validated, rejected, needs_recheck
confidence_score	numeric(5,2)	Skor keyakinan, opsional
false_positive_reason	text	Alasan jika ditolak
sensitivity_level	varchar(50)	public, internal, restricted
properties	jsonb	Metadata tambahan dari GEE
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Index
CREATE INDEX hotspots_centroid_gix ON hotspots USING GIST (centroid);
CREATE INDEX hotspots_geom_gix ON hotspots USING GIST (geom);
CREATE INDEX hotspots_analysis_run_idx ON hotspots (analysis_run_id);
CREATE INDEX hotspots_aoi_idx ON hotspots (aoi_area_id);
CREATE INDEX hotspots_status_idx ON hotspots (validation_status);
CREATE INDEX hotspots_priority_idx ON hotspots (priority);
CREATE INDEX hotspots_detected_at_idx ON hotspots (detected_at);
CREATE INDEX hotspots_properties_gin ON hotspots USING GIN (properties);
Catatan Penting
centroid digunakan untuk marker pada peta.
geom digunakan untuk polygon area terdampak.
area_ha sebaiknya dihitung dari GEE atau dari PostGIS dengan proyeksi yang sesuai, bukan langsung dari derajat SRID 4326.
Public API tidak boleh mengirim centroid dan geom presisi kepada public viewer jika sensitivity_level bukan public.
6.11 field_validations
Fungsi

Menyimpan hasil validasi lapangan terhadap hotspot.

Satu hotspot dapat memiliki banyak validasi, misalnya validasi awal, validasi ulang, atau validasi oleh pihak berbeda.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
hotspot_id	foreignId	Relasi ke hotspots.id
validator_id	foreignId	Relasi ke users.id
validation_status	varchar(50)	under_review, validated, rejected, needs_recheck
validation_note	text	Catatan lapangan
observed_condition	varchar(100)	Contoh: mangrove_cut, oil_palm_planted, water_tide, cloud_shadow, unknown
confidence_level	varchar(50)	low, medium, high
validation_point	geometry(Point, 4326)	Titik validasi jika tersedia
visited_at	timestamp	Waktu pengecekan lapangan
is_geotagged	boolean	Apakah foto/validasi memiliki geotag
sensitivity_level	varchar(50)	internal, restricted
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
deleted_at	timestamp	Soft delete
Index
CREATE INDEX field_validations_hotspot_idx ON field_validations (hotspot_id);
CREATE INDEX field_validations_validator_idx ON field_validations (validator_id);
CREATE INDEX field_validations_status_idx ON field_validations (validation_status);
CREATE INDEX field_validations_point_gix ON field_validations USING GIST (validation_point);
Catatan

Setelah validasi dibuat, sistem dapat memperbarui hotspots.validation_status mengikuti validasi terbaru.

6.12 validation_photos
Fungsi

Menyimpan metadata foto validasi lapangan.

File foto tidak disimpan langsung sebagai blob di database. Database hanya menyimpan metadata dan path file.

Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
field_validation_id	foreignId	Relasi ke field_validations.id
file_path	varchar(255)	Path foto
file_name	varchar(255)	Nama file
mime_type	varchar(100)	Contoh: image/jpeg
file_size	integer	Ukuran file byte
taken_at	timestamp	Waktu foto diambil jika tersedia
photo_point	geometry(Point, 4326)	Koordinat EXIF/geotag jika tersedia
caption	text	Keterangan foto
is_primary	boolean	Foto utama validasi
sensitivity_level	varchar(50)	internal, restricted
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Index
CREATE INDEX validation_photos_validation_idx ON validation_photos (field_validation_id);
CREATE INDEX validation_photos_point_gix ON validation_photos USING GIST (photo_point);
Catatan
Foto validasi tidak boleh ditampilkan ke publik tanpa izin.
Jika foto memiliki EXIF location, sistem dapat menyimpan titiknya pada photo_point.
6.13 reports
Fungsi

Menyimpan metadata laporan PDF.

Laporan pada MVP minimal mendukung:

PDF per hotspot;
PDF per analysis run sebagai opsional.
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
report_code	varchar(80)	Kode laporan
report_type	varchar(50)	hotspot, analysis_run
hotspot_id	foreignId	Relasi ke hotspots.id, nullable
analysis_run_id	foreignId	Relasi ke analysis_runs.id, nullable
title	varchar(200)	Judul laporan
summary	text	Ringkasan laporan
file_path	varchar(255)	Path PDF
generated_by	foreignId	User pembuat laporan
generated_at	timestamp	Waktu dibuat
status	varchar(50)	generated, archived, failed
sensitivity_level	varchar(50)	internal, restricted
disclaimer_text	text	Disclaimer indikasi awal
metadata	jsonb	Metadata tambahan
created_at	timestamp	Waktu dibuat
updated_at	timestamp	Waktu diubah
Constraint

Minimal salah satu harus terisi:

hotspot_id atau analysis_run_id
Index
CREATE INDEX reports_hotspot_idx ON reports (hotspot_id);
CREATE INDEX reports_analysis_run_idx ON reports (analysis_run_id);
CREATE INDEX reports_generated_by_idx ON reports (generated_by);
CREATE INDEX reports_type_idx ON reports (report_type);
6.14 audit_logs
Fungsi

Menyimpan catatan aktivitas penting dalam sistem.

Audit log penting karena sistem mengelola data sensitif dan perubahan status hotspot.

Aktivitas yang Dicatat
login admin;
import AOI;
import hasil GEE;
perubahan status hotspot;
pembuatan validasi;
upload foto validasi;
export PDF;
perubahan role user;
penghapusan data penting.
Kolom
Kolom	Tipe	Keterangan
id	bigint / uuid	Primary key
user_id	foreignId	User pelaku, nullable untuk sistem
action	varchar(120)	Nama aksi
entity_type	varchar(120)	Nama tabel/model
entity_id	varchar(80)	ID entitas
description	text	Deskripsi aktivitas
old_values	jsonb	Data lama
new_values	jsonb	Data baru
ip_address	varchar(45)	IP pengguna
user_agent	text	User agent
created_at	timestamp	Waktu aktivitas
Index
CREATE INDEX audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_action_idx ON audit_logs (action);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at);
7. Enum dan Nilai Standar
7.1 aoi_type
Nilai	Keterangan
main_aoi	AOI utama, misalnya KTH Nipah ±242 ha
conflict_zone	Zona konflik ±60–62 ha
buffer	Zona penyangga
reference	Area referensi
7.2 verification_status
Nilai	Keterangan
draft	Data sementara
verified	Data sudah diverifikasi
needs_revision	Data perlu diperbaiki
7.3 analysis_status
Nilai	Keterangan
draft	Baru dibuat
processed	Sudah diproses/import
published	Ditampilkan ke dashboard
archived	Diarsipkan
failed	Gagal diproses
7.4 hotspot_validation_status
Nilai	Keterangan
detected	Baru terdeteksi dari GEE
under_review	Sedang diperiksa
validated	Terbukti sesuai kondisi lapangan
rejected	Tidak terbukti / false positive
needs_recheck	Perlu pemeriksaan ulang
7.5 priority
Nilai	Keterangan
low	Prioritas rendah
medium	Prioritas sedang
high	Prioritas tinggi
7.6 sensitivity_level
Nilai	Keterangan
public	Aman ditampilkan publik
internal	Hanya untuk user login tertentu
restricted	Hanya untuk role berwenang
8. Relasi Antar Tabel
8.1 Relasi User dan Role
users
  └── user_roles
        └── roles
              └── role_permissions
                    └── permissions

Satu user dapat memiliki lebih dari satu role jika diperlukan.

8.2 Relasi AOI dan Analysis Run
aoi_areas
  └── analysis_runs

Satu AOI dapat memiliki banyak analysis run. Contoh:

Analisis Januari–Maret 2026;
Analisis April–Juni 2026;
Analisis sebelum-sesudah kejadian tertentu.
8.3 Relasi Analysis Run dan Hotspot
analysis_runs
  └── hotspots

Satu analysis run menghasilkan banyak hotspot.

8.4 Relasi GEE Import dan Hotspot
analysis_runs
  └── gee_imports
        └── hotspots

Satu file import dari GEE dapat menghasilkan banyak hotspot.

8.5 Relasi Hotspot dan Validasi
hotspots
  └── field_validations
        └── validation_photos

Satu hotspot dapat divalidasi berkali-kali.

8.6 Relasi Report
reports
  ├── hotspot_id
  └── analysis_run_id

Laporan dapat dibuat untuk satu hotspot atau satu analysis run.

9. Rekomendasi Migration Order

Urutan pembuatan migration disarankan sebagai berikut:

1. enable_postgis_extension
2. create_users_table
3. create_roles_table
4. create_permissions_table
5. create_user_roles_table
6. create_role_permissions_table
7. create_aoi_areas_table
8. create_analysis_runs_table
9. create_gee_imports_table
10. create_satellite_layers_table
11. create_hotspots_table
12. create_field_validations_table
13. create_validation_photos_table
14. create_reports_table
15. create_audit_logs_table
10. PostGIS Extension

Sebelum membuat tabel spasial, aktifkan PostGIS.

CREATE EXTENSION IF NOT EXISTS postgis;

Opsional jika menggunakan UUID:

CREATE EXTENSION IF NOT EXISTS pgcrypto;
11. Contoh Struktur SQL Inti

Bagian ini bukan migration final, tetapi gambaran struktur teknis untuk tabel spasial utama.

11.1 aoi_areas
CREATE TABLE aoi_areas (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    aoi_type VARCHAR(50) NOT NULL,
    description TEXT,
    village VARCHAR(100),
    district VARCHAR(100),
    regency VARCHAR(100),
    province VARCHAR(100),
    estimated_area_ha NUMERIC(12,4),
    legal_status VARCHAR(255),
    legal_reference VARCHAR(255),
    source_type VARCHAR(50),
    source_name VARCHAR(150),
    source_file_path VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'draft',
    sensitivity_level VARCHAR(50) DEFAULT 'internal',
    geom geometry(MultiPolygon, 4326) NOT NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX aoi_areas_geom_gix ON aoi_areas USING GIST (geom);
11.2 analysis_runs
CREATE TABLE analysis_runs (
    id BIGSERIAL PRIMARY KEY,
    aoi_area_id BIGINT NOT NULL REFERENCES aoi_areas(id),
    name VARCHAR(180) NOT NULL,
    description TEXT,
    dataset_name VARCHAR(100) DEFAULT 'Sentinel-2 Level-2A',
    gee_collection_id VARCHAR(150),
    before_start_date DATE NOT NULL,
    before_end_date DATE NOT NULL,
    after_start_date DATE NOT NULL,
    after_end_date DATE NOT NULL,
    cloud_threshold NUMERIC(5,2),
    primary_indices JSONB,
    supporting_indices JSONB,
    threshold_params JSONB,
    processing_params JSONB,
    total_hotspots INTEGER DEFAULT 0,
    total_area_ha NUMERIC(12,4) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    processed_at TIMESTAMP,
    published_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
11.3 hotspots
CREATE TABLE hotspots (
    id BIGSERIAL PRIMARY KEY,
    hotspot_code VARCHAR(80) UNIQUE NOT NULL,
    analysis_run_id BIGINT NOT NULL REFERENCES analysis_runs(id),
    aoi_area_id BIGINT NOT NULL REFERENCES aoi_areas(id),
    gee_import_id BIGINT REFERENCES gee_imports(id),
    detected_at TIMESTAMP,
    centroid geometry(Point, 4326) NOT NULL,
    geom geometry(MultiPolygon, 4326),
    area_ha NUMERIC(12,4),

    mvi_before NUMERIC(10,6),
    mvi_after NUMERIC(10,6),
    mvi_delta NUMERIC(10,6),

    cmri_before NUMERIC(10,6),
    cmri_after NUMERIC(10,6),
    cmri_delta NUMERIC(10,6),

    ndvi_before NUMERIC(10,6),
    ndvi_after NUMERIC(10,6),
    ndvi_delta NUMERIC(10,6),

    ndwi_before NUMERIC(10,6),
    ndwi_after NUMERIC(10,6),
    ndwi_delta NUMERIC(10,6),

    priority VARCHAR(50) DEFAULT 'medium',
    validation_status VARCHAR(50) DEFAULT 'detected',
    confidence_score NUMERIC(5,2),
    false_positive_reason TEXT,
    sensitivity_level VARCHAR(50) DEFAULT 'restricted',
    properties JSONB,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX hotspots_centroid_gix ON hotspots USING GIST (centroid);
CREATE INDEX hotspots_geom_gix ON hotspots USING GIST (geom);
11.4 field_validations
CREATE TABLE field_validations (
    id BIGSERIAL PRIMARY KEY,
    hotspot_id BIGINT NOT NULL REFERENCES hotspots(id),
    validator_id BIGINT NOT NULL REFERENCES users(id),
    validation_status VARCHAR(50) NOT NULL,
    validation_note TEXT,
    observed_condition VARCHAR(100),
    confidence_level VARCHAR(50),
    validation_point geometry(Point, 4326),
    visited_at TIMESTAMP,
    is_geotagged BOOLEAN DEFAULT false,
    sensitivity_level VARCHAR(50) DEFAULT 'restricted',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX field_validations_point_gix
ON field_validations USING GIST (validation_point);
12. Data Flow ke Database
12.1 Flow AOI
GeoJSON/Shapefile AOI
→ Import oleh Admin
→ Validasi geometry
→ Simpan ke aoi_areas.geom
→ Tampilkan di React Leaflet
12.2 Flow Analysis Run
Admin membuat analysis run
→ Menentukan AOI
→ Menentukan periode before-after
→ Menentukan parameter threshold
→ Menjalankan GEE manual/semi-manual
→ Menyimpan metadata analysis run
12.3 Flow Import Hotspot
Export GEE GeoJSON
→ Upload ke Laravel
→ Simpan metadata ke gee_imports
→ Parse features GeoJSON
→ Simpan centroid dan polygon ke hotspots
→ Simpan nilai MVI/CMRI/NDVI/NDWI
→ Update summary analysis_runs
12.4 Flow Validasi Lapangan
Validator membuka hotspot
→ Mengisi status validasi
→ Mengisi catatan
→ Upload foto
→ Simpan field_validations
→ Simpan validation_photos
→ Update hotspots.validation_status
→ Catat audit_logs
12.5 Flow Report PDF
Admin/NGO memilih hotspot
→ Generate PDF
→ Simpan file PDF
→ Simpan metadata ke reports
→ Catat audit_logs
13. Strategi Query Geospasial
13.1 Menampilkan Hotspot dalam AOI
SELECT h.*
FROM hotspots h
JOIN aoi_areas a ON ST_Intersects(h.geom, a.geom)
WHERE a.id = :aoi_id;
13.2 Menampilkan Hotspot dalam Viewport Peta
SELECT *
FROM hotspots
WHERE ST_Intersects(
    geom,
    ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326)
);
13.3 Menghitung Luas Hotspot

Untuk perhitungan luas yang lebih akurat, jangan langsung menghitung area pada derajat WGS84. Gunakan transformasi ke proyeksi meter.

Contoh pendekatan:

SELECT
    id,
    ST_Area(ST_Transform(geom, 3857)) / 10000 AS area_ha
FROM hotspots;

Catatan:

Untuk hasil akhir, area_ha sebaiknya disimpan dari hasil kalkulasi GEE atau dihitung dengan proyeksi lokal yang sesuai.
13.4 Menyembunyikan Koordinat Presisi untuk Publik

Pendekatan di level API:

Jika role = public_viewer:
  - jangan kirim centroid presisi;
  - jangan kirim polygon detail;
  - kirim hanya ringkasan area dan status umum;
  - opsional kirim titik yang sudah digeneralisasi.

Pendekatan SQL opsional:

SELECT
    id,
    hotspot_code,
    priority,
    validation_status,
    area_ha,
    ST_AsGeoJSON(ST_SnapToGrid(centroid, 0.01)) AS generalized_centroid
FROM hotspots
WHERE sensitivity_level IN ('public', 'internal');
14. Strategi Penyimpanan File

File tidak disimpan langsung dalam database.

Database hanya menyimpan:

file_path
file_name
mime_type
file_size
metadata

File yang disimpan di storage:

GeoJSON AOI;
hasil export GEE;
static map;
foto validasi;
laporan PDF.

Struktur folder yang disarankan:

storage/app/
  mangrove-eye/
    aoi/
    gee-imports/
    layers/
    validation-photos/
    reports/
15. Data Sensitif dan Akses
15.1 Tabel yang Mengandung Data Sensitif
Tabel	Data Sensitif
aoi_areas	Polygon zona konflik
hotspots	Centroid dan polygon hotspot
field_validations	Titik validasi dan catatan
validation_photos	Foto dan geotag
reports	PDF internal
audit_logs	Riwayat aktivitas user
15.2 Aturan Akses Database melalui API
Role	Akses Data
public_viewer	Ringkasan dan visualisasi umum
validator	Hotspot detail dan form validasi
ngo_advocate	Hasil validasi dan laporan
admin	Kelola data sistem
super_admin	Akses penuh
15.3 Prinsip Response API

Untuk public viewer:

Tidak kirim:
- koordinat presisi;
- polygon konflik detail;
- foto validasi;
- catatan validator;
- file PDF internal;
- raw GeoJSON.

Untuk internal user:

Kirim data sesuai permission.
16. Seed Data Awal
16.1 Role Seed
public_viewer
validator
ngo_advocate
admin
super_admin
16.2 Permission Seed
view_public_dashboard
view_internal_dashboard
view_precise_coordinates
manage_aoi
manage_analysis_runs
import_gee_result
view_hotspot
validate_hotspot
view_validation
export_report
manage_users
view_audit_logs
16.3 AOI Seed Sementara
Field	Nilai Awal
code	AOI-KTH-001
name	Kawasan KTH Nipah
aoi_type	main_aoi
estimated_area_ha	242.0
verification_status	draft
sensitivity_level	restricted
16.4 Analysis Run Seed Contoh
Field	Nilai Contoh
name	Analisis Awal Kwala Serapuh
dataset_name	Sentinel-2 Level-2A
primary_indices	["MVI", "CMRI"]
supporting_indices	["NDVI", "NDWI"]
status	draft
17. Future Extension / Non-MVP Tables

Tabel berikut tidak dibuat pada MVP awal, tetapi dapat ditambahkan pada tahap lanjutan.

17.1 ai_models

Untuk menyimpan metadata model U-Net atau model AI lain.

Kolom	Keterangan
model_name	Nama model
model_type	U-Net, SegFormer, Random Forest, dll
version	Versi model
metrics	IoU, F1-score, precision, recall
file_path	Path model
status	active/inactive
17.2 training_tiles

Untuk menyimpan dataset tile Sentinel-2 yang digunakan dalam training AI.

Kolom	Keterangan
tile_path	Path citra tile
mask_path	Path mask label
aoi_area_id	AOI sumber
label_source	manual/pseudo-label
quality_status	draft/verified/rejected
17.3 segmentation_results

Untuk menyimpan hasil segmentasi AI/U-Net.

Kolom	Keterangan
ai_model_id	Model yang digunakan
analysis_run_id	Analysis run
result_geom	Polygon hasil segmentasi
class_name	mangrove/sawit/air/lahan terbuka
confidence_score	Skor keyakinan
17.4 notifications

Untuk notifikasi WhatsApp/Telegram/email pada tahap lanjutan.

Kolom	Keterangan
recipient	Penerima
channel	whatsapp/telegram/email
message	Isi pesan
status	sent/failed/pending
18. Catatan Implementasi Laravel
18.1 Model yang Disarankan
User
Role
Permission
AoiArea
AnalysisRun
GeeImport
SatelliteLayer
Hotspot
FieldValidation
ValidationPhoto
Report
AuditLog
18.2 Relasi Model Laravel
AoiArea
public function analysisRuns()
{
    return $this->hasMany(AnalysisRun::class);
}

public function hotspots()
{
    return $this->hasMany(Hotspot::class);
}
AnalysisRun
public function aoiArea()
{
    return $this->belongsTo(AoiArea::class);
}

public function hotspots()
{
    return $this->hasMany(Hotspot::class);
}

public function satelliteLayers()
{
    return $this->hasMany(SatelliteLayer::class);
}
Hotspot
public function analysisRun()
{
    return $this->belongsTo(AnalysisRun::class);
}

public function aoiArea()
{
    return $this->belongsTo(AoiArea::class);
}

public function validations()
{
    return $this->hasMany(FieldValidation::class);
}
FieldValidation
public function hotspot()
{
    return $this->belongsTo(Hotspot::class);
}

public function photos()
{
    return $this->hasMany(ValidationPhoto::class);
}
19. Acceptance Criteria Database

Database dianggap siap untuk MVP apabila:

PostGIS aktif.
AOI dapat disimpan sebagai MultiPolygon.
Hotspot dapat disimpan sebagai Point dan MultiPolygon.
Analysis run dapat menyimpan periode before-after.
Analysis run dapat menyimpan parameter MVI/CMRI.
Hasil import GEE dapat dilacak.
Hotspot dapat dikaitkan dengan analysis run.
Hotspot dapat memiliki status validasi.
Validasi lapangan dapat menyimpan catatan, foto, dan titik validasi.
Laporan PDF dapat dikaitkan dengan hotspot atau analysis run.
Public/internal access dapat dibedakan melalui role dan permission.
Data sensitif memiliki sensitivity_level.
Query peta dapat menggunakan index GIST.
Audit log mencatat aktivitas penting.
20. Perlu Dikonfirmasi

Hal yang masih perlu dikonfirmasi sebelum implementasi database final:

Apakah ID tabel menggunakan bigint auto-increment atau uuid.
Apakah role management menggunakan Spatie Laravel Permission atau custom RBAC.
Apakah public dashboard benar-benar aktif pada MVP.
Apakah reports wajib mendukung PDF per analysis run sejak awal.
Apakah satellite_layers wajib menyimpan tile URL atau cukup static image.
Apakah foto validasi wajib memiliki geotag.
Apakah AOI resmi KTH Nipah sudah tersedia dalam GeoJSON/Shapefile.
Apakah area konflik ±60–62 ha dapat dipisahkan sebagai AOI conflict_zone.
Apakah threshold MVI/CMRI disimpan sebagai JSON atau kolom eksplisit.
Apakah file storage awal menggunakan local storage atau object storage.
21. Kesimpulan

Desain database MANGROVE-EYE untuk MVP difokuskan pada kebutuhan inti sistem:

User & RBAC
+ AOI PostGIS
+ Analysis Run
+ GEE Import
+ Satellite Layers
+ Hotspot Detection Result
+ Field Validation
+ Validation Photos
+ PDF Reports
+ Audit Logs

Struktur ini cukup realistis untuk dibangun oleh tim kecil, tetapi tetap siap dikembangkan ke tahap lanjutan seperti U-Net, Sentinel-1, notifikasi otomatis, dan multi-AOI.

Database ini menjaga prinsip utama MANGROVE-EYE: hasil satelit adalah indikasi awal, hotspot harus dapat diverifikasi, data spasial harus disimpan dengan benar, dan koordinat sensitif harus dilindungi.