<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        h1, h2, h3 { margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
        .muted { color: #6b7280; }
        .section { margin-bottom: 18px; }
        .disclaimer { font-size: 11px; color: #7c2d12; border: 1px solid #fdba74; background: #fff7ed; padding: 10px; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <p class="muted">Kode Report: {{ $reportCode }}</p>

    <div class="section">
        <h2>Ringkasan Hotspot</h2>
        <table>
            <tr><th>Kode Hotspot</th><td>{{ $hotspot->hotspot_code }}</td></tr>
            <tr><th>Analysis Run</th><td>{{ $hotspot->analysisRun?->name }}</td></tr>
            <tr><th>AOI</th><td>{{ $hotspot->analysisRun?->aoiArea?->name }}</td></tr>
            <tr><th>Luas (ha)</th><td>{{ $hotspot->area_ha }}</td></tr>
            <tr><th>Prioritas</th><td>{{ $hotspot->priority }}</td></tr>
            <tr><th>Status Validasi</th><td>{{ $hotspot->validation_status }}</td></tr>
            @if($metadata['include_precise_coordinates'] ?? false)
                <tr><th>Centroid</th><td>{{ json_encode($hotspot->centroid) }}</td></tr>
            @endif
        </table>
    </div>

    <div class="section">
        <h2>Ringkasan Indeks</h2>
        <table>
            <tr><th>MVI Before</th><td>{{ $hotspot->mvi_before }}</td><th>MVI After</th><td>{{ $hotspot->mvi_after }}</td><th>MVI Delta</th><td>{{ $hotspot->mvi_delta }}</td></tr>
            <tr><th>CMRI Before</th><td>{{ $hotspot->cmri_before }}</td><th>CMRI After</th><td>{{ $hotspot->cmri_after }}</td><th>CMRI Delta</th><td>{{ $hotspot->cmri_delta }}</td></tr>
            <tr><th>NDVI Before</th><td>{{ $hotspot->ndvi_before }}</td><th>NDVI After</th><td>{{ $hotspot->ndvi_after }}</td><th>NDVI Delta</th><td>{{ $hotspot->ndvi_delta }}</td></tr>
            <tr><th>NDWI Before</th><td>{{ $hotspot->ndwi_before }}</td><th>NDWI After</th><td>{{ $hotspot->ndwi_after }}</td><th>NDWI Delta</th><td>{{ $hotspot->ndwi_delta }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Riwayat Validasi Lapangan</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Validator</th>
                    <th>Observed Condition</th>
                    <th>Confidence</th>
                    <th>Catatan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($hotspot->validations as $validation)
                    <tr>
                        <td>{{ $validation->validation_status }}</td>
                        <td>{{ $validation->validator?->name }}</td>
                        <td>{{ $validation->observed_condition }}</td>
                        <td>{{ $validation->confidence_level }}</td>
                        <td>{{ $validation->validation_note }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5">Belum ada validasi lapangan.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($metadata['include_validation_photos'] ?? false)
        <div class="section">
            <h2>Foto Validasi</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nama File</th>
                        <th>Caption</th>
                        <th>Taken At</th>
                    </tr>
                </thead>
                <tbody>
                    @php($photos = $hotspot->validations->flatMap->photos)
                    @forelse($photos as $photo)
                        <tr>
                            <td>{{ $photo->file_name }}</td>
                            <td>{{ $photo->caption }}</td>
                            <td>{{ $photo->taken_at?->toISOString() }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="3">Tidak ada foto validasi.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    <div class="disclaimer">
        {{ $disclaimer }}
    </div>
</body>
</html>
