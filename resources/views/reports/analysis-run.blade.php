<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        h1, h2 { margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
        .muted { color: #6b7280; }
        .disclaimer { font-size: 11px; color: #7c2d12; border: 1px solid #fdba74; background: #fff7ed; padding: 10px; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <p class="muted">Kode Report: {{ $reportCode }}</p>

    <h2>Metadata Analysis Run</h2>
    <table>
        <tr><th>Nama</th><td>{{ $analysisRun->name }}</td></tr>
        <tr><th>AOI</th><td>{{ $analysisRun->aoiArea?->name }}</td></tr>
        <tr><th>Total Hotspot</th><td>{{ $analysisRun->total_hotspots }}</td></tr>
        <tr><th>Total Area (ha)</th><td>{{ $analysisRun->total_area_ha }}</td></tr>
        <tr><th>Status</th><td>{{ $analysisRun->status }}</td></tr>
    </table>

    @if($metadata['include_hotspot_summary'] ?? true)
        <h2>Ringkasan Hotspot</h2>
        <table>
            <thead>
                <tr>
                    <th>Kode</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Luas (ha)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($analysisRun->hotspots as $hotspot)
                    <tr>
                        <td>{{ $hotspot->hotspot_code }}</td>
                        <td>{{ $hotspot->priority }}</td>
                        <td>{{ $hotspot->validation_status }}</td>
                        <td>{{ $hotspot->area_ha }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4">Belum ada hotspot.</td></tr>
                @endforelse
            </tbody>
        </table>
    @endif

    <div class="disclaimer">{{ $disclaimer }}</div>
</body>
</html>
