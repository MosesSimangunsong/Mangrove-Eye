# UI/UX Implementation Status

## 1. Ringkasan Kondisi UI Saat Ini

UI saat ini sudah functional untuk MVP, tetapi masih sangat bertumpu pada custom CSS dan satu halaman dashboard yang sangat besar. Internal app belum mengikuti pola page-per-page, navigasi internal masih minimal, dan belum ada fondasi `shadcn/ui` yang bisa dipakai sebagai standar redesign.

## 2. Fitur UI yang Sudah Terimplementasi

- Landing/public dashboard basic di `resources/js/Pages/Welcome.jsx`
- Internal dashboard map-first di `resources/js/Pages/Dashboard.jsx`
- Auth flow bawaan Inertia/Laravel Breeze: login, register, forgot/reset password, verify email
- Profile edit page
- React Leaflet internal map dengan:
  - AOI layer
  - hotspot polygon
  - centroid marker
  - selected hotspot highlight
  - popup hotspot
- Filter hotspot di dashboard
- Detail hotspot di dashboard
- Field validation form di dashboard
- Upload foto validasi di dashboard
- Riwayat validasi di dashboard
- Generate report hotspot dan analysis run dari dashboard
- Public hotspot map dengan filter publik

## 3. Fitur UI yang Belum Terimplementasi

- Halaman internal page-per-page untuk:
  - Hotspots
  - AOI Management
  - Analysis Runs
  - GEE Imports
  - Field Validations
  - Reports
  - Users
  - Audit Logs
  - Settings
- App shell internal dengan sidebar/topbar yang konsisten
- Komponen reusable dashboard modular di `resources/js/Components/Dashboard`
- Komponen layout reusable di `resources/js/Components/Layout`
- Empty/loading/error states yang konsisten berbasis design system
- Status badge, priority badge, page header, breadcrumb, filter bar, dan data table reusable

## 4. Komponen yang Sudah Ada

- `resources/js/Components/WebGIS/WebGISMap.jsx`
- `resources/js/Components/WebGIS/HotspotPopup.jsx`
- `resources/js/Components/WebGIS/PublicHotspotMap.jsx`
- `resources/js/Components/Modal.jsx`
- `resources/js/Components/Dropdown.jsx`
- `resources/js/Components/ApplicationLogo.jsx`
- `resources/js/Components/Checkbox.jsx`
- `resources/js/Components/DangerButton.jsx`
- `resources/js/Components/InputError.jsx`
- `resources/js/Components/InputLabel.jsx`
- `resources/js/Components/NavLink.jsx`
- `resources/js/Components/PrimaryButton.jsx`
- `resources/js/Components/ResponsiveNavLink.jsx`
- `resources/js/Components/SecondaryButton.jsx`
- `resources/js/Components/TextInput.jsx`

## 5. Komponen yang Perlu Dibuat

- App shell internal:
  - `AppShell`
  - `SidebarNav`
  - `TopBar`
  - `PageHeader`
  - `BreadcrumbBar`
- Dashboard modular:
  - `DashboardMetricStrip`
  - `HotspotFilterPanel`
  - `LayerControlPanel`
  - `FloatingLegend`
  - `HotspotDetailDrawer`
  - `DashboardEmptyState`
  - `DashboardErrorState`
- Reusable UI internal:
  - `DataTable`
  - `StatusBadge`
  - `PriorityBadge`
  - `FilterBar`
  - `EmptyState`
  - `ErrorState`
  - `LoadingSkeleton`
  - `ProtectedDataNotice`

## 6. File yang Terlalu Besar / Perlu Dipecah

- `resources/js/Pages/Dashboard.jsx` sekitar 1798 baris dan memuat terlalu banyak logic fetch, filter, map, validation, photo upload, report, dan modal
- `resources/css/app.css` sekitar 975 baris dan masih menjadi pusat styling untuk public dan internal sekaligus
- `resources/js/Pages/Welcome.jsx` sudah memuat public dashboard sekaligus landing/public framing; aman untuk tetap dipakai sekarang, tetapi ke depan lebih baik dipisah menjadi landing sections dan public dashboard sections

## 7. Status shadcn/ui

- `shadcn/ui` belum terpasang secara proper
- `components.json` belum ada
- folder `resources/js/Components/ui` belum ada sebelum audit ini
- belum ada token CSS `shadcn` seperti `--background`, `--foreground`, `--primary`, dan seterusnya
- belum ada komponen UI internal standar berbasis folder `Components/ui`

## 8. Library UI yang Sudah Terpasang

Berdasarkan `package.json`, library yang saat ini tersedia:

- UI/basic frontend:
  - `@inertiajs/react`
  - `@headlessui/react`
  - `tailwindcss`
  - `@tailwindcss/forms`
- Map:
  - `leaflet`
  - `react-leaflet`
- HTTP:
  - `axios`
- Build:
  - `vite`
  - `laravel-vite-plugin`
  - `@vitejs/plugin-react`

Catatan:

- Belum ada package `shadcn/ui`
- Belum ada Radix UI primitives
- Belum ada helper umum seperti `clsx`, `tailwind-merge`, atau `class-variance-authority`
- Terdapat duplikasi versi `react` dan `react-dom` antara `devDependencies` dan `dependencies`, yang berisiko membingungkan dependency resolution

## 9. Risiko Redesign

- Memecah `Dashboard.jsx` terlalu cepat berisiko memutus alur validasi, upload foto, dan generate report yang saat ini masih terikat di satu halaman
- Mengganti layout internal tanpa audit permission dapat menyebabkan menu sensitif tampil ke role yang salah
- Mengubah public UI tanpa guard dapat membuka data sensitif ke area publik
- Mengganti styling global terlalu agresif dapat merusak tampilan dashboard map dan auth pages
- Menambahkan library UI interaktif terlalu banyak sekaligus berisiko memperbesar scope dan menambah bug sebelum struktur page-per-page siap
- Konflik versi React di `package.json` sebaiknya diperhatikan sebelum redesign lebih besar

## 10. Rekomendasi Urutan Eksekusi Berikutnya

1. Setup fondasi `shadcn/ui` yang aman:
   - `components.json`
   - token warna MANGROVE-EYE
   - folder `resources/js/Components/ui`
   - komponen UI dasar berisiko rendah
2. Buat app shell internal baru tanpa memindahkan logic dashboard dulu
3. Pecah `Dashboard.jsx` menjadi komponen modular sambil mempertahankan perilaku existing
4. Buat halaman `Hotspots` terlebih dahulu karena paling dekat dengan alur dashboard saat ini
5. Lanjutkan ke `AOI`, `Analysis Runs`, dan `GEE Imports`
6. Pindahkan `Field Validations` dan `Reports` ke halaman khusus
7. Setelah internal stabil, baru redesign landing page dan public dashboard secara visual
