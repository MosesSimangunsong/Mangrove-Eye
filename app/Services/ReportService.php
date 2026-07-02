<?php

namespace App\Services;

use App\Models\AnalysisRun;
use App\Models\Hotspot;
use App\Models\Report;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportService
{
    protected const DISCLAIMER = 'Laporan ini merupakan hasil indikasi awal berbasis analisis citra satelit dan/atau validasi lapangan awal. Laporan ini tidak dimaksudkan sebagai vonis hukum final dan tetap memerlukan verifikasi lanjutan oleh pihak berwenang.';

    public function createHotspotReport(Hotspot $hotspot, array $attributes, ?int $userId): Report
    {
        $hotspot->loadMissing([
            'analysisRun.aoiArea',
            'validations.validator',
            'validations.photos',
        ]);

        $metadata = [
            'include_validation_photos' => (bool) ($attributes['include_validation_photos'] ?? false),
            'include_precise_coordinates' => (bool) ($attributes['include_precise_coordinates'] ?? false),
        ];

        $reportCode = 'RPT-HS-'.$hotspot->id.'-'.now()->format('YmdHis');
        $pdf = Pdf::loadView('reports.hotspot', [
            'reportCode' => $reportCode,
            'title' => $attributes['title'],
            'hotspot' => $hotspot,
            'metadata' => $metadata,
            'disclaimer' => self::DISCLAIMER,
        ]);

        $path = 'reports/hotspots/'.Str::slug($reportCode).'.pdf';
        Storage::disk(config('filesystems.default'))->put($path, $pdf->output());

        return Report::create([
            'report_code' => $reportCode,
            'report_type' => 'hotspot',
            'hotspot_id' => $hotspot->id,
            'analysis_run_id' => $hotspot->analysis_run_id,
            'title' => $attributes['title'],
            'summary' => 'Laporan hotspot '.$hotspot->hotspot_code,
            'file_path' => $path,
            'generated_by' => $userId,
            'generated_at' => now(),
            'status' => 'generated',
            'sensitivity_level' => 'restricted',
            'disclaimer_text' => self::DISCLAIMER,
            'metadata' => $metadata,
        ]);
    }

    public function createAnalysisRunReport(AnalysisRun $analysisRun, array $attributes, ?int $userId): Report
    {
        $analysisRun->loadMissing(['aoiArea', 'hotspots']);
        $metadata = [
            'include_hotspot_summary' => (bool) ($attributes['include_hotspot_summary'] ?? true),
            'include_validation_summary' => (bool) ($attributes['include_validation_summary'] ?? true),
        ];

        $reportCode = 'RPT-RUN-'.$analysisRun->id.'-'.now()->format('YmdHis');
        $pdf = Pdf::loadView('reports.analysis-run', [
            'reportCode' => $reportCode,
            'title' => $attributes['title'],
            'analysisRun' => $analysisRun,
            'metadata' => $metadata,
            'disclaimer' => self::DISCLAIMER,
        ]);

        $path = 'reports/analysis-runs/'.Str::slug($reportCode).'.pdf';
        Storage::disk(config('filesystems.default'))->put($path, $pdf->output());

        return Report::create([
            'report_code' => $reportCode,
            'report_type' => 'analysis_run',
            'analysis_run_id' => $analysisRun->id,
            'title' => $attributes['title'],
            'summary' => 'Laporan analysis run '.$analysisRun->name,
            'file_path' => $path,
            'generated_by' => $userId,
            'generated_at' => now(),
            'status' => 'generated',
            'sensitivity_level' => 'restricted',
            'disclaimer_text' => self::DISCLAIMER,
            'metadata' => $metadata,
        ]);
    }
}
