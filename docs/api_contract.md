API Contract MANGROVE-EYE
1. Informasi Dokumen
Item	Keterangan
Nama Sistem	MANGROVE-EYE
Jenis Dokumen	API Contract
Versi	v1.0
Acuan Utama	docs/PRD.md, docs/MVP_SCOPE.md, docs/DATABASE_DESIGN.md, docs/GEE_WORKFLOW.md
Backend	Laravel
Frontend	React + React Leaflet
Database	PostgreSQL/PostGIS
Format API	REST API
Base Path	/api/v1
Target Penyimpanan	docs/API_CONTRACT.md
2. Tujuan Dokumen

Dokumen ini menjelaskan kontrak API untuk sistem MANGROVE-EYE, yaitu endpoint, method, request, response, role access, dan format data yang digunakan antara backend Laravel dan frontend React.

API ini dirancang untuk mendukung MVP:

Auth & RBAC
+ AOI Management
+ Analysis Run
+ GEE Import
+ Hotspot WebGIS
+ Field Validation
+ PDF Report
+ Dashboard Summary
+ Audit Log

API ini belum mencakup:

U-Net production API;
training model AI;
Sentinel-1 SAR workflow;
scheduler otomatis penuh;
notifikasi WhatsApp/Telegram;
aplikasi mobile native;
offline validation;
legal case management.
3. Prinsip API
3.1 RESTful dan Konsisten

API menggunakan pola REST dengan resource utama:

/auth
/users
/roles
/aoi-areas
/analysis-runs
/gee-imports
/hotspots
/field-validations
/reports
/dashboard
/audit-logs
3.2 Public dan Internal API Dipisahkan

Karena MANGROVE-EYE menangani data sensitif, API dibedakan menjadi:

Tipe API	Prefix	Keterangan
Public API	/api/v1/public/...	Data umum, tanpa koordinat presisi
Internal API	/api/v1/...	Data lengkap sesuai role dan permission

Public API tidak boleh mengembalikan:

koordinat presisi hotspot;
polygon detail zona konflik;
foto validasi;
catatan validator;
file PDF internal;
raw GeoJSON sensitif.
3.3 GEE Tetap di Luar Laravel Processing

Laravel tidak menghitung indeks MVI, CMRI, NDVI, dan NDWI dari raster mentah. API hanya menerima hasil dari workflow Google Earth Engine dalam bentuk:

GeoJSON hotspot;
metadata analysis run;
static image path;
tile URL jika tersedia;
nilai indeks before-after.
3.4 Hotspot adalah Indikasi Awal

Semua hotspot dari GEE memiliki status awal:

detected

Hotspot tidak dianggap sebagai bukti hukum final sampai ada validasi lapangan.

3.5 RBAC Wajib Diterapkan

Setiap endpoint internal wajib memeriksa role/permission.

Role awal MVP:

Role	Keterangan
public_viewer	Melihat data publik tergeneralisasi
validator	Melihat hotspot detail dan mengisi validasi
ngo_advocate	Melihat hasil validasi dan export laporan
admin	Mengelola AOI, analysis run, hotspot, import, user, laporan
super_admin	Akses penuh
4. Base URL dan Versioning
4.1 Base URL Development
http://localhost:8000/api/v1
4.2 Base URL Production
https://domain-mangrove-eye.id/api/v1
4.3 Versioning

Semua endpoint MVP menggunakan:

/api/v1

Jika ada perubahan besar di masa depan, gunakan:

/api/v2
5. Authentication
5.1 Mekanisme Auth

Untuk MVP, API dapat menggunakan salah satu pendekatan berikut:

Opsi	Keterangan
Laravel Sanctum Token	Cocok untuk SPA React dan API
Session-based Auth	Cocok jika React berada dalam satu aplikasi Laravel
Bearer Token	Cocok untuk API terpisah

Rekomendasi MVP:

Laravel Sanctum atau session-based auth.
5.2 Header Auth

Untuk endpoint internal:

Authorization: Bearer <token>
Accept: application/json

Untuk upload file:

Authorization: Bearer <token>
Accept: application/json
Content-Type: multipart/form-data
6. Format Response Standar
6.1 Success Response
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": {}
}

Untuk list:

{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
6.2 Error Response
{
  "success": false,
  "message": "Terjadi kesalahan.",
  "errors": {}
}

Contoh validasi:

{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "name": ["Nama wajib diisi."],
    "geom": ["Geometry AOI tidak valid."]
  }
}
6.3 HTTP Status Code
Status	Makna
200	OK
201	Created
400	Bad Request
401	Unauthenticated
403	Forbidden
404	Not Found
422	Validation Error
500	Server Error
7. Format Data Geospasial
7.1 GeoJSON

Semua data spasial yang dikirim ke frontend menggunakan format GeoJSON.

Contoh geometry polygon:

{
  "type": "Polygon",
  "coordinates": [
    [
      [98.455001, 4.011001],
      [98.460002, 4.011001],
      [98.460002, 4.015002],
      [98.455001, 4.015002],
      [98.455001, 4.011001]
    ]
  ]
}

Urutan koordinat wajib:

[longitude, latitude]

SRID yang digunakan:

4326 / WGS 84
7.2 Generalized Geometry untuk Public API

Untuk public viewer, API tidak mengirim polygon detail atau centroid presisi.

Contoh public response:

{
  "hotspot_code": "HS-KS-2026-0001",
  "area_ha": 0.75,
  "priority": "high",
  "validation_status": "detected",
  "generalized_location": {
    "type": "Point",
    "coordinates": [98.46, 4.01]
  }
}
8. Permission Matrix
Resource	Public	Validator	NGO	Admin	Super Admin
Public dashboard	Read	Read	Read	Read	Read
Internal dashboard	No	Read	Read	Read	Read
AOI detail	Limited	Read	Read	CRUD	CRUD
AOI import	No	No	No	CRUD	CRUD
Analysis run	No	Read	Read	CRUD	CRUD
GEE import	No	No	No	CRUD	CRUD
Hotspot public	Read generalized	Read	Read	CRUD	CRUD
Hotspot precise coordinate	No	Read	Read	Read	Read
Field validation	No	Create/Read	Read	CRUD	CRUD
Validation photo	No	Create/Read own	Read	CRUD	CRUD
Report PDF	No	No	Read/Generate	CRUD	CRUD
User management	No	No	No	CRUD	CRUD
Audit log	No	No	No	Read	Read
9. Authentication API
9.1 Login
Endpoint
POST /api/v1/auth/login
Access
Public
Request
{
  "email": "admin@mangrove-eye.id",
  "password": "password"
}
Response 200
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "plain-text-token",
    "user": {
      "id": 1,
      "name": "Admin MANGROVE-EYE",
      "email": "admin@mangrove-eye.id",
      "roles": ["admin"],
      "permissions": [
        "manage_aoi",
        "manage_analysis_runs",
        "import_gee_result",
        "export_report"
      ]
    }
  }
}
9.2 Logout
Endpoint
POST /api/v1/auth/logout
Access
Authenticated
Response 200
{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}
9.3 Current User
Endpoint
GET /api/v1/auth/me
Access
Authenticated
Response 200
{
  "success": true,
  "message": "Data user berhasil diambil.",
  "data": {
    "id": 1,
    "name": "Admin MANGROVE-EYE",
    "email": "admin@mangrove-eye.id",
    "organization": "MANGROVE-EYE Team",
    "roles": ["admin"],
    "permissions": [
      "view_internal_dashboard",
      "manage_aoi",
      "manage_analysis_runs"
    ]
  }
}
10. Public Dashboard API
10.1 Public Summary
Endpoint
GET /api/v1/public/dashboard/summary
Access
Public
Response 200
{
  "success": true,
  "message": "Ringkasan publik berhasil diambil.",
  "data": {
    "location": "Kwala Serapuh, Tanjung Pura, Langkat, Sumatera Utara",
    "total_hotspots": 12,
    "total_estimated_area_ha": 8.35,
    "validated_hotspots": 4,
    "needs_recheck_hotspots": 3,
    "last_analysis_date": "2026-06-30",
    "disclaimer": "Data yang ditampilkan merupakan indikasi awal dan telah digeneralisasi untuk keamanan."
  }
}
10.2 Public Hotspot Map
Endpoint
GET /api/v1/public/hotspots
Access
Public
Query Params
Param	Tipe	Wajib	Keterangan
analysis_run_id	integer	Tidak	Filter analysis run
status	string	Tidak	Filter status validasi
priority	string	Tidak	low, medium, high
bbox	string	Tidak	minLng,minLat,maxLng,maxLat
Response 200
{
  "success": true,
  "message": "Data hotspot publik berhasil diambil.",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "hotspot_code": "HS-KS-2026-0001",
          "area_ha": 0.75,
          "priority": "high",
          "validation_status": "detected",
          "detected_at": "2026-06-30",
          "is_generalized": true
        },
        "geometry": {
          "type": "Point",
          "coordinates": [98.46, 4.01]
        }
      }
    ]
  }
}
Catatan

Endpoint ini tidak boleh mengirim polygon detail hotspot atau koordinat presisi.

11. Dashboard Internal API
11.1 Internal Dashboard Summary
Endpoint
GET /api/v1/dashboard/summary
Access
validator, ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
analysis_run_id	integer	Tidak	Filter berdasarkan analysis run
aoi_area_id	integer	Tidak	Filter berdasarkan AOI
Response 200
{
  "success": true,
  "message": "Ringkasan dashboard berhasil diambil.",
  "data": {
    "total_hotspots": 12,
    "total_area_ha": 8.35,
    "by_priority": {
      "high": 3,
      "medium": 6,
      "low": 3
    },
    "by_validation_status": {
      "detected": 5,
      "under_review": 1,
      "validated": 4,
      "rejected": 1,
      "needs_recheck": 1
    },
    "latest_analysis_run": {
      "id": 7,
      "name": "Analisis Kwala Serapuh Jan-Jun 2026",
      "processed_at": "2026-06-30T10:00:00Z"
    }
  }
}
11.2 WebGIS Layer List
Endpoint
GET /api/v1/dashboard/layers
Access
validator, ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
analysis_run_id	integer	Ya	ID analysis run
Response 200
{
  "success": true,
  "message": "Layer berhasil diambil.",
  "data": [
    {
      "id": 1,
      "layer_name": "RGB After",
      "layer_type": "rgb_after",
      "period_type": "after",
      "storage_type": "tile_url",
      "tile_url": "https://tiles.example.com/{z}/{x}/{y}.png",
      "is_public": false,
      "visualization_params": {
        "opacity": 0.75
      }
    },
    {
      "id": 2,
      "layer_name": "CMRI After",
      "layer_type": "cmri",
      "period_type": "after",
      "storage_type": "file",
      "file_url": "/storage/mangrove-eye/layers/cmri_after.png",
      "is_public": false
    }
  ]
}
12. AOI API
12.1 List AOI
Endpoint
GET /api/v1/aoi-areas
Access
validator, ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
aoi_type	string	Tidak	main_aoi, conflict_zone, buffer, reference
verification_status	string	Tidak	draft, verified, needs_revision
Response 200
{
  "success": true,
  "message": "Data AOI berhasil diambil.",
  "data": [
    {
      "id": 1,
      "code": "AOI-KTH-001",
      "name": "Kawasan KTH Nipah",
      "aoi_type": "main_aoi",
      "estimated_area_ha": 242.0,
      "verification_status": "draft",
      "sensitivity_level": "restricted"
    }
  ]
}
12.2 Detail AOI
Endpoint
GET /api/v1/aoi-areas/{id}
Access
validator, ngo_advocate, admin, super_admin
Response 200
{
  "success": true,
  "message": "Detail AOI berhasil diambil.",
  "data": {
    "id": 1,
    "code": "AOI-KTH-001",
    "name": "Kawasan KTH Nipah",
    "aoi_type": "main_aoi",
    "description": "AOI utama KTH Nipah.",
    "village": "Kwala Serapuh",
    "district": "Tanjung Pura",
    "regency": "Langkat",
    "province": "Sumatera Utara",
    "estimated_area_ha": 242.0,
    "legal_status": "Perhutanan Sosial",
    "legal_reference": "Perlu dikonfirmasi",
    "source_type": "digitized",
    "verification_status": "draft",
    "sensitivity_level": "restricted",
    "geometry": {
      "type": "MultiPolygon",
      "coordinates": []
    }
  }
}
12.3 Create AOI
Endpoint
POST /api/v1/aoi-areas
Access
admin, super_admin
Request
{
  "code": "AOI-KTH-001",
  "name": "Kawasan KTH Nipah",
  "aoi_type": "main_aoi",
  "description": "AOI utama KTH Nipah.",
  "village": "Kwala Serapuh",
  "district": "Tanjung Pura",
  "regency": "Langkat",
  "province": "Sumatera Utara",
  "estimated_area_ha": 242.0,
  "legal_status": "Perhutanan Sosial",
  "legal_reference": "Perlu dikonfirmasi",
  "source_type": "digitized",
  "verification_status": "draft",
  "sensitivity_level": "restricted",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": []
  }
}
Response 201
{
  "success": true,
  "message": "AOI berhasil dibuat.",
  "data": {
    "id": 1,
    "code": "AOI-KTH-001",
    "name": "Kawasan KTH Nipah"
  }
}
12.4 Update AOI
Endpoint
PUT /api/v1/aoi-areas/{id}
Access
admin, super_admin
Request
{
  "name": "Kawasan Kelola KTH Nipah",
  "verification_status": "needs_revision",
  "estimated_area_ha": 242.0
}
Response 200
{
  "success": true,
  "message": "AOI berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Kawasan Kelola KTH Nipah",
    "verification_status": "needs_revision"
  }
}
12.5 Delete AOI
Endpoint
DELETE /api/v1/aoi-areas/{id}
Access
admin, super_admin
Response 200
{
  "success": true,
  "message": "AOI berhasil dihapus.",
  "data": null
}
12.6 Import AOI GeoJSON
Endpoint
POST /api/v1/aoi-areas/import
Access
admin, super_admin
Content-Type
multipart/form-data
Form Data
Field	Tipe	Wajib	Keterangan
file	file	Ya	GeoJSON
aoi_type	string	Ya	main_aoi, conflict_zone, dll
source_type	string	Ya	official, digitized, osm, dll
sensitivity_level	string	Ya	public, internal, restricted
Response 201
{
  "success": true,
  "message": "AOI berhasil diimpor.",
  "data": {
    "imported_count": 1,
    "aoi_areas": [
      {
        "id": 1,
        "code": "AOI-KTH-001",
        "name": "Kawasan KTH Nipah"
      }
    ]
  }
}
13. Analysis Run API
13.1 List Analysis Runs
Endpoint
GET /api/v1/analysis-runs
Access
validator, ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
aoi_area_id	integer	Tidak	Filter AOI
status	string	Tidak	draft, processed, published, archived, failed
year	integer	Tidak	Tahun analisis
Response 200
{
  "success": true,
  "message": "Analysis run berhasil diambil.",
  "data": [
    {
      "id": 7,
      "name": "Analisis Kwala Serapuh Jan-Jun 2026",
      "aoi_area": {
        "id": 1,
        "name": "Kawasan KTH Nipah"
      },
      "dataset_name": "Sentinel-2 Level-2A",
      "primary_indices": ["MVI", "CMRI"],
      "supporting_indices": ["NDVI", "NDWI"],
      "before_period": {
        "start": "2026-01-01",
        "end": "2026-03-31"
      },
      "after_period": {
        "start": "2026-04-01",
        "end": "2026-06-30"
      },
      "total_hotspots": 12,
      "total_area_ha": 8.35,
      "status": "processed"
    }
  ]
}
13.2 Detail Analysis Run
Endpoint
GET /api/v1/analysis-runs/{id}
Access
validator, ngo_advocate, admin, super_admin
Response 200
{
  "success": true,
  "message": "Detail analysis run berhasil diambil.",
  "data": {
    "id": 7,
    "name": "Analisis Kwala Serapuh Jan-Jun 2026",
    "description": "Analisis before-after Kwala Serapuh.",
    "aoi_area_id": 1,
    "dataset_name": "Sentinel-2 Level-2A",
    "gee_collection_id": "COPERNICUS/S2_SR_HARMONIZED",
    "before_start_date": "2026-01-01",
    "before_end_date": "2026-03-31",
    "after_start_date": "2026-04-01",
    "after_end_date": "2026-06-30",
    "cloud_threshold": 20,
    "primary_indices": ["MVI", "CMRI"],
    "supporting_indices": ["NDVI", "NDWI"],
    "threshold_params": {
      "mvi_delta_min": -1.0,
      "cmri_delta_min": -0.2,
      "min_area_ha": 0.05
    },
    "processing_params": {
      "composite_method": "median",
      "scale": 10
    },
    "total_hotspots": 12,
    "total_area_ha": 8.35,
    "status": "processed"
  }
}
13.3 Create Analysis Run
Endpoint
POST /api/v1/analysis-runs
Access
admin, super_admin
Request
{
  "aoi_area_id": 1,
  "name": "Analisis Kwala Serapuh Jan-Jun 2026",
  "description": "Analisis before-after Kwala Serapuh.",
  "dataset_name": "Sentinel-2 Level-2A",
  "gee_collection_id": "COPERNICUS/S2_SR_HARMONIZED",
  "before_start_date": "2026-01-01",
  "before_end_date": "2026-03-31",
  "after_start_date": "2026-04-01",
  "after_end_date": "2026-06-30",
  "cloud_threshold": 20,
  "primary_indices": ["MVI", "CMRI"],
  "supporting_indices": ["NDVI", "NDWI"],
  "threshold_params": {
    "mvi_delta_min": -1.0,
    "cmri_delta_min": -0.2,
    "min_area_ha": 0.05
  },
  "processing_params": {
    "composite_method": "median",
    "scale": 10
  }
}
Response 201
{
  "success": true,
  "message": "Analysis run berhasil dibuat.",
  "data": {
    "id": 7,
    "name": "Analisis Kwala Serapuh Jan-Jun 2026",
    "status": "draft"
  }
}
13.4 Update Analysis Run
Endpoint
PUT /api/v1/analysis-runs/{id}
Access
admin, super_admin
Request
{
  "status": "published",
  "threshold_params": {
    "mvi_delta_min": -1.0,
    "cmri_delta_min": -0.2,
    "min_area_ha": 0.1
  }
}
Response 200
{
  "success": true,
  "message": "Analysis run berhasil diperbarui.",
  "data": {
    "id": 7,
    "status": "published"
  }
}
13.5 Delete Analysis Run
Endpoint
DELETE /api/v1/analysis-runs/{id}
Access
admin, super_admin
Response 200
{
  "success": true,
  "message": "Analysis run berhasil dihapus.",
  "data": null
}
14. GEE Import API
14.1 Import Hotspot GeoJSON
Endpoint
POST /api/v1/analysis-runs/{analysisRunId}/gee-imports/hotspots
Access
admin, super_admin
Content-Type
multipart/form-data
Form Data
Field	Tipe	Wajib	Keterangan
file	file	Ya	File GeoJSON hasil GEE
import_type	string	Ya	geojson
sensitivity_level	string	Tidak	Default restricted
Response 201
{
  "success": true,
  "message": "Hotspot hasil GEE berhasil diimpor.",
  "data": {
    "gee_import_id": 3,
    "analysis_run_id": 7,
    "total_features": 12,
    "created_hotspots": 12,
    "failed_features": 0
  }
}
14.2 List GEE Imports
Endpoint
GET /api/v1/analysis-runs/{analysisRunId}/gee-imports
Access
admin, super_admin
Response 200
{
  "success": true,
  "message": "Data import GEE berhasil diambil.",
  "data": [
    {
      "id": 3,
      "analysis_run_id": 7,
      "import_type": "geojson",
      "file_name": "mangrove_eye_hotspots_kwala_serapuh_2026.geojson",
      "status": "processed",
      "total_features": 12,
      "imported_at": "2026-06-30T10:00:00Z"
    }
  ]
}
14.3 Upload Satellite Layer Metadata
Endpoint
POST /api/v1/analysis-runs/{analysisRunId}/satellite-layers
Access
admin, super_admin
Request
{
  "layer_name": "CMRI After",
  "layer_type": "cmri",
  "period_type": "after",
  "storage_type": "tile_url",
  "tile_url": "https://tiles.example.com/{z}/{x}/{y}.png",
  "is_public": false,
  "visualization_params": {
    "min": -1,
    "max": 1,
    "palette": ["red", "yellow", "green"],
    "opacity": 0.75
  }
}
Response 201
{
  "success": true,
  "message": "Layer berhasil disimpan.",
  "data": {
    "id": 2,
    "layer_name": "CMRI After",
    "layer_type": "cmri"
  }
}
15. Hotspot API
15.1 List Hotspots Internal
Endpoint
GET /api/v1/hotspots
Access
validator, ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
analysis_run_id	integer	Tidak	Filter analysis run
aoi_area_id	integer	Tidak	Filter AOI
validation_status	string	Tidak	Status validasi
priority	string	Tidak	low, medium, high
bbox	string	Tidak	minLng,minLat,maxLng,maxLat
format	string	Tidak	json atau geojson
Response 200 JSON
{
  "success": true,
  "message": "Data hotspot berhasil diambil.",
  "data": [
    {
      "id": 1,
      "hotspot_code": "HS-KS-2026-0001",
      "analysis_run_id": 7,
      "aoi_area_id": 1,
      "detected_at": "2026-06-30T10:00:00Z",
      "area_ha": 0.75,
      "priority": "high",
      "validation_status": "detected",
      "centroid": {
        "type": "Point",
        "coordinates": [98.456789, 4.012345]
      }
    }
  ]
}
Response 200 GeoJSON
{
  "success": true,
  "message": "GeoJSON hotspot berhasil diambil.",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": 1,
          "hotspot_code": "HS-KS-2026-0001",
          "area_ha": 0.75,
          "priority": "high",
          "validation_status": "detected",
          "mvi_delta": -1.21,
          "cmri_delta": -0.33
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": []
        }
      }
    ]
  }
}
15.2 Detail Hotspot
Endpoint
GET /api/v1/hotspots/{id}
Access
validator, ngo_advocate, admin, super_admin
Response 200
{
  "success": true,
  "message": "Detail hotspot berhasil diambil.",
  "data": {
    "id": 1,
    "hotspot_code": "HS-KS-2026-0001",
    "analysis_run": {
      "id": 7,
      "name": "Analisis Kwala Serapuh Jan-Jun 2026"
    },
    "aoi_area": {
      "id": 1,
      "name": "Kawasan KTH Nipah"
    },
    "detected_at": "2026-06-30T10:00:00Z",
    "area_ha": 0.75,
    "priority": "high",
    "validation_status": "detected",
    "indices": {
      "mvi_before": 2.145,
      "mvi_after": 0.934,
      "mvi_delta": -1.211,
      "cmri_before": 0.642,
      "cmri_after": 0.311,
      "cmri_delta": -0.331,
      "ndvi_before": 0.782,
      "ndvi_after": 0.512,
      "ndvi_delta": -0.27,
      "ndwi_before": 0.14,
      "ndwi_after": 0.201,
      "ndwi_delta": 0.061
    },
    "centroid": {
      "type": "Point",
      "coordinates": [98.456789, 4.012345]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": []
    },
    "validations": []
  }
}
15.3 Update Hotspot Status
Endpoint
PATCH /api/v1/hotspots/{id}/status
Access
admin, super_admin
Request
{
  "validation_status": "needs_recheck",
  "false_positive_reason": null
}
Response 200
{
  "success": true,
  "message": "Status hotspot berhasil diperbarui.",
  "data": {
    "id": 1,
    "hotspot_code": "HS-KS-2026-0001",
    "validation_status": "needs_recheck"
  }
}
15.4 Update Hotspot Priority
Endpoint
PATCH /api/v1/hotspots/{id}/priority
Access
admin, super_admin
Request
{
  "priority": "high"
}
Response 200
{
  "success": true,
  "message": "Prioritas hotspot berhasil diperbarui.",
  "data": {
    "id": 1,
    "priority": "high"
  }
}
16. Field Validation API
16.1 Create Field Validation
Endpoint
POST /api/v1/hotspots/{hotspotId}/field-validations
Access
validator, admin, super_admin
Request
{
  "validation_status": "validated",
  "validation_note": "Ditemukan bekas pembukaan lahan dan sisa batang mangrove.",
  "observed_condition": "mangrove_cut",
  "confidence_level": "high",
  "validation_point": {
    "type": "Point",
    "coordinates": [98.456789, 4.012345]
  },
  "visited_at": "2026-07-01T09:00:00Z",
  "is_geotagged": true
}
Response 201
{
  "success": true,
  "message": "Validasi lapangan berhasil disimpan.",
  "data": {
    "id": 5,
    "hotspot_id": 1,
    "validation_status": "validated",
    "validator": {
      "id": 4,
      "name": "Validator Lapangan"
    }
  }
}
16.2 Upload Validation Photo
Endpoint
POST /api/v1/field-validations/{validationId}/photos
Access
validator, admin, super_admin
Content-Type
multipart/form-data
Form Data
Field	Tipe	Wajib	Keterangan
photo	file	Ya	JPG/PNG
caption	string	Tidak	Keterangan foto
is_primary	boolean	Tidak	Foto utama
photo_lat	decimal	Tidak	Latitude foto
photo_lng	decimal	Tidak	Longitude foto
taken_at	datetime	Tidak	Waktu foto diambil
Response 201
{
  "success": true,
  "message": "Foto validasi berhasil diunggah.",
  "data": {
    "id": 10,
    "field_validation_id": 5,
    "file_url": "/storage/mangrove-eye/validation-photos/photo-001.jpg",
    "caption": "Bekas pembukaan lahan.",
    "is_primary": true
  }
}
16.3 List Validations by Hotspot
Endpoint
GET /api/v1/hotspots/{hotspotId}/field-validations
Access
validator, ngo_advocate, admin, super_admin
Response 200
{
  "success": true,
  "message": "Riwayat validasi berhasil diambil.",
  "data": [
    {
      "id": 5,
      "validation_status": "validated",
      "validation_note": "Ditemukan bekas pembukaan lahan.",
      "observed_condition": "mangrove_cut",
      "confidence_level": "high",
      "visited_at": "2026-07-01T09:00:00Z",
      "validator": {
        "id": 4,
        "name": "Validator Lapangan"
      },
      "photos": [
        {
          "id": 10,
          "file_url": "/storage/mangrove-eye/validation-photos/photo-001.jpg",
          "caption": "Bekas pembukaan lahan.",
          "is_primary": true
        }
      ]
    }
  ]
}
16.4 Update Field Validation
Endpoint
PUT /api/v1/field-validations/{id}
Access
validator owner, admin, super_admin
Request
{
  "validation_status": "needs_recheck",
  "validation_note": "Foto kurang jelas, perlu kunjungan ulang.",
  "confidence_level": "medium"
}
Response 200
{
  "success": true,
  "message": "Validasi lapangan berhasil diperbarui.",
  "data": {
    "id": 5,
    "validation_status": "needs_recheck"
  }
}
17. Report API
17.1 Generate Hotspot PDF Report
Endpoint
POST /api/v1/hotspots/{hotspotId}/reports
Access
ngo_advocate, admin, super_admin
Request
{
  "title": "Laporan Indikasi Awal Deforestasi Mangrove HS-KS-2026-0001",
  "include_validation_photos": true,
  "include_precise_coordinates": true
}
Response 201
{
  "success": true,
  "message": "Laporan PDF berhasil dibuat.",
  "data": {
    "id": 8,
    "report_code": "RPT-HS-KS-2026-0001",
    "report_type": "hotspot",
    "title": "Laporan Indikasi Awal Deforestasi Mangrove HS-KS-2026-0001",
    "file_url": "/storage/mangrove-eye/reports/RPT-HS-KS-2026-0001.pdf",
    "generated_at": "2026-07-01T12:00:00Z",
    "disclaimer_text": "Laporan ini merupakan hasil indikasi awal berbasis analisis citra satelit dan/atau validasi lapangan awal. Laporan ini tidak dimaksudkan sebagai vonis hukum final dan tetap memerlukan verifikasi lanjutan oleh pihak berwenang."
  }
}
17.2 List Reports
Endpoint
GET /api/v1/reports
Access
ngo_advocate, admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
report_type	string	Tidak	hotspot, analysis_run
hotspot_id	integer	Tidak	Filter hotspot
analysis_run_id	integer	Tidak	Filter analysis run
Response 200
{
  "success": true,
  "message": "Data laporan berhasil diambil.",
  "data": [
    {
      "id": 8,
      "report_code": "RPT-HS-KS-2026-0001",
      "report_type": "hotspot",
      "title": "Laporan Indikasi Awal Deforestasi Mangrove HS-KS-2026-0001",
      "file_url": "/storage/mangrove-eye/reports/RPT-HS-KS-2026-0001.pdf",
      "generated_at": "2026-07-01T12:00:00Z"
    }
  ]
}
17.3 Download Report
Endpoint
GET /api/v1/reports/{id}/download
Access
ngo_advocate, admin, super_admin
Response
PDF file stream
17.4 Generate Analysis Run Report
Endpoint
POST /api/v1/analysis-runs/{analysisRunId}/reports
Access
ngo_advocate, admin, super_admin
Status MVP
Opsional
Request
{
  "title": "Ringkasan Analysis Run Kwala Serapuh Jan-Jun 2026",
  "include_hotspot_summary": true,
  "include_validation_summary": true
}
Response 201
{
  "success": true,
  "message": "Laporan analysis run berhasil dibuat.",
  "data": {
    "id": 9,
    "report_code": "RPT-RUN-KS-2026-001",
    "report_type": "analysis_run",
    "file_url": "/storage/mangrove-eye/reports/RPT-RUN-KS-2026-001.pdf"
  }
}
18. User and Role API
18.1 List Users
Endpoint
GET /api/v1/users
Access
admin, super_admin
Response 200
{
  "success": true,
  "message": "Data user berhasil diambil.",
  "data": [
    {
      "id": 1,
      "name": "Admin MANGROVE-EYE",
      "email": "admin@mangrove-eye.id",
      "organization": "MANGROVE-EYE Team",
      "is_active": true,
      "roles": ["admin"]
    }
  ]
}
18.2 Create User
Endpoint
POST /api/v1/users
Access
admin, super_admin
Request
{
  "name": "Validator Lapangan",
  "email": "validator@mangrove-eye.id",
  "password": "password",
  "organization": "KTH Nipah",
  "roles": ["validator"]
}
Response 201
{
  "success": true,
  "message": "User berhasil dibuat.",
  "data": {
    "id": 4,
    "name": "Validator Lapangan",
    "email": "validator@mangrove-eye.id",
    "roles": ["validator"]
  }
}
18.3 Update User Role
Endpoint
PATCH /api/v1/users/{id}/roles
Access
admin, super_admin
Request
{
  "roles": ["validator", "ngo_advocate"]
}
Response 200
{
  "success": true,
  "message": "Role user berhasil diperbarui.",
  "data": {
    "id": 4,
    "roles": ["validator", "ngo_advocate"]
  }
}
18.4 List Roles
Endpoint
GET /api/v1/roles
Access
admin, super_admin
Response 200
{
  "success": true,
  "message": "Role berhasil diambil.",
  "data": [
    {
      "id": 1,
      "name": "Public Viewer",
      "slug": "public_viewer"
    },
    {
      "id": 2,
      "name": "Validator",
      "slug": "validator"
    }
  ]
}
19. Audit Log API
19.1 List Audit Logs
Endpoint
GET /api/v1/audit-logs
Access
admin, super_admin
Query Params
Param	Tipe	Wajib	Keterangan
user_id	integer	Tidak	Filter user
action	string	Tidak	Filter aksi
entity_type	string	Tidak	Filter entitas
date_from	date	Tidak	Tanggal awal
date_to	date	Tidak	Tanggal akhir
Response 200
{
  "success": true,
  "message": "Audit log berhasil diambil.",
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "Admin MANGROVE-EYE"
      },
      "action": "import_gee_hotspots",
      "entity_type": "analysis_runs",
      "entity_id": "7",
      "description": "Admin mengimpor 12 hotspot dari hasil GEE.",
      "created_at": "2026-06-30T10:00:00Z"
    }
  ]
}
20. Validation Rules
20.1 AOI Validation
Field	Rule
code	required, unique
name	required
aoi_type	required, in main_aoi, conflict_zone, buffer, reference
geometry	required, valid GeoJSON Polygon/MultiPolygon
estimated_area_ha	nullable, numeric
sensitivity_level	required, in public, internal, restricted
20.2 Analysis Run Validation
Field	Rule
aoi_area_id	required, exists
name	required
before_start_date	required, date
before_end_date	required, date, after_or_equal before_start_date
after_start_date	required, date
after_end_date	required, date, after_or_equal after_start_date
primary_indices	required, array, contains MVI and CMRI
supporting_indices	nullable, array
cloud_threshold	nullable, numeric, min 0, max 100
20.3 GEE Hotspot Import Validation
Field	Rule
file	required, file, geojson/json
analysisRunId	required, exists
geometry	valid Polygon/MultiPolygon
area_ha	nullable, numeric
mvi_delta	nullable, numeric
cmri_delta	nullable, numeric
priority	nullable, in low, medium, high
20.4 Field Validation Rules
Field	Rule
validation_status	required, in under_review, validated, rejected, needs_recheck
validation_note	nullable, string
observed_condition	nullable, string
confidence_level	nullable, in low, medium, high
validation_point	nullable, valid GeoJSON Point
visited_at	nullable, datetime
20.5 Photo Upload Rules
Field	Rule
photo	required, image, jpg/png/jpeg
photo size	max 5 MB
caption	nullable, string
photo_lat	nullable, numeric
photo_lng	nullable, numeric
taken_at	nullable, datetime
21. Enum Standar API
21.1 AOI Type
main_aoi
conflict_zone
buffer
reference
21.2 Verification Status
draft
verified
needs_revision
21.3 Analysis Run Status
draft
processed
published
archived
failed
21.4 Priority
low
medium
high
21.5 Hotspot Validation Status
detected
under_review
validated
rejected
needs_recheck
21.6 Sensitivity Level
public
internal
restricted
21.7 Observed Condition
mangrove_cut
oil_palm_planted
open_land
water_tide
pond_or_aquaculture
cloud_shadow
unknown
other
22. API Flow Utama
22.1 Flow Import Hasil GEE
1. Admin login.
2. Admin membuat analysis run.
3. Admin menjalankan script GEE di Code Editor.
4. Admin export hotspot GeoJSON dari GEE.
5. Admin upload GeoJSON ke endpoint import.
6. Backend menyimpan metadata import ke gee_imports.
7. Backend parse setiap feature GeoJSON.
8. Backend menyimpan geometry dan indeks ke hotspots.
9. Backend update summary analysis_runs.
10. Dashboard menampilkan hotspot.
22.2 Flow Validasi Lapangan
1. Validator login.
2. Validator membuka daftar hotspot.
3. Validator membuka detail hotspot.
4. Validator membuat field validation.
5. Validator upload foto validasi.
6. Backend menyimpan catatan, titik, foto, dan status.
7. Backend update status hotspot.
8. Admin/NGO melihat hasil validasi.
9. NGO/Admin generate PDF jika diperlukan.
22.3 Flow Public Dashboard
1. Publik membuka dashboard.
2. Frontend memanggil /public/dashboard/summary.
3. Frontend memanggil /public/hotspots.
4. Backend hanya mengirim data tergeneralisasi.
5. Publik tidak menerima koordinat presisi dan data sensitif.
23. Frontend Integration Notes
23.1 React Leaflet Hotspot Layer

Frontend dapat mengambil hotspot internal dalam format GeoJSON:

GET /api/v1/hotspots?analysis_run_id=7&format=geojson

Lalu ditampilkan sebagai:

GeoJSON Layer
→ Polygon hotspot
→ Popup detail
→ Link detail hotspot
23.2 Popup Minimal Hotspot

Isi popup internal:

Kode Hotspot
Prioritas
Status Validasi
Estimasi Luas
Delta MVI
Delta CMRI
Tombol Detail

Isi popup publik:

Prioritas
Status Umum
Estimasi Luas
Disclaimer data digeneralisasi
23.3 Before-After Layer

Frontend mengambil daftar layer:

GET /api/v1/dashboard/layers?analysis_run_id=7

Jika tile_url tersedia, tampilkan sebagai tile layer.

Jika hanya file_url tersedia, tampilkan sebagai static overlay atau di halaman detail analysis run.

24. Security Notes
24.1 API Tidak Boleh Membocorkan Data Sensitif

Endpoint public tidak boleh mengirim:

centroid presisi
polygon konflik detail
foto validasi
catatan validator
raw GeoJSON
PDF internal
user internal
audit log
24.2 File Access

File sensitif tidak boleh disimpan dalam folder publik tanpa kontrol akses.

Rekomendasi:

storage/app/private/mangrove-eye/

Lalu file diakses melalui endpoint terproteksi.

24.3 Audit Log

Aksi berikut wajib dicatat:

create_aoi
update_aoi
import_gee_hotspots
update_hotspot_status
create_field_validation
upload_validation_photo
generate_report
download_report
update_user_role
delete_sensitive_data
25. Acceptance Criteria API

API dianggap siap untuk MVP apabila:

User dapat login dan logout.
Backend dapat membedakan role.
Admin dapat membuat dan mengelola AOI.
AOI dapat dikirim sebagai GeoJSON ke frontend.
Admin dapat membuat analysis run.
Admin dapat import GeoJSON hotspot dari GEE.
Hotspot dapat disimpan dengan geometry PostGIS.
Frontend dapat mengambil hotspot sebagai GeoJSON.
Frontend dapat mengambil dashboard summary.
Validator dapat membuat validasi lapangan.
Validator dapat upload foto validasi.
Status hotspot dapat berubah setelah validasi.
NGO/Admin dapat generate PDF per hotspot.
Public API tidak mengirim koordinat presisi.
Internal API hanya mengirim data sesuai permission.
Audit log mencatat aksi penting.
26. Perlu Dikonfirmasi

Hal yang masih perlu dikonfirmasi sebelum implementasi final API:

Apakah auth memakai Laravel Sanctum token atau session auth.
Apakah RBAC memakai Spatie Laravel Permission atau custom.
Apakah public dashboard benar-benar aktif di MVP pertama.
Apakah endpoint public hotspot cukup menampilkan generalized point atau cukup summary tanpa peta.
Apakah PDF per analysis run masuk MVP atau tetap opsional.
Apakah tile URL dari GEE akan dipakai sejak MVP.
Apakah foto validasi wajib memiliki geotag.
Apakah file sensitif disimpan di local private storage atau object storage.
Apakah import GEE cukup GeoJSON manual atau perlu endpoint semi-otomatis tambahan.
Apakah API perlu mendukung export GeoJSON internal untuk admin.
27. Kesimpulan

API Contract MANGROVE-EYE dirancang untuk mendukung MVP yang realistis dan aman:

Laravel API
+ RBAC
+ AOI GeoJSON
+ Analysis Run
+ GEE Import
+ Hotspot GeoJSON
+ Field Validation
+ Validation Photo
+ PDF Report
+ Public/Internal Dashboard

Kontrak API ini menjaga prinsip utama sistem:

GEE adalah mesin analisis citra satelit.
Laravel menyimpan dan menyajikan hasil.
Hotspot adalah indikasi awal, bukan vonis hukum final.
Validasi lapangan tetap wajib.
Koordinat dan data sensitif harus dilindungi.
MVP tidak memaksakan U-Net, Sentinel-1, notifikasi, scheduler otomatis, atau multi-wilayah.