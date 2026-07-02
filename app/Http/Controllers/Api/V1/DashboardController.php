<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Dashboard\IndexDashboardLayerRequest;
use App\Models\AnalysisRun;
use App\Models\Hotspot;
use App\Models\SatelliteLayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends ApiController
{
    public function summary(Request $request): JsonResponse
    {
        $query = Hotspot::query();

        if ($request->filled('analysis_run_id')) {
            $query->where('analysis_run_id', (int) $request->input('analysis_run_id'));
        }

        if ($request->filled('aoi_area_id')) {
            $query->where('aoi_area_id', (int) $request->input('aoi_area_id'));
        }

        $hotspots = (clone $query)->get();
        $latestAnalysisRun = AnalysisRun::query()->latest('processed_at')->latest('id')->first();

        return $this->success(
            data: [
                'total_hotspots' => $hotspots->count(),
                'total_area_ha' => (float) $hotspots->sum('area_ha'),
                'by_priority' => [
                    'high' => $hotspots->where('priority', 'high')->count(),
                    'medium' => $hotspots->where('priority', 'medium')->count(),
                    'low' => $hotspots->where('priority', 'low')->count(),
                ],
                'by_validation_status' => [
                    'detected' => $hotspots->where('validation_status', 'detected')->count(),
                    'under_review' => $hotspots->where('validation_status', 'under_review')->count(),
                    'validated' => $hotspots->where('validation_status', 'validated')->count(),
                    'rejected' => $hotspots->where('validation_status', 'rejected')->count(),
                    'needs_recheck' => $hotspots->where('validation_status', 'needs_recheck')->count(),
                ],
                'latest_analysis_run' => $latestAnalysisRun ? [
                    'id' => $latestAnalysisRun->id,
                    'name' => $latestAnalysisRun->name,
                    'processed_at' => $latestAnalysisRun->processed_at?->toISOString(),
                ] : null,
            ],
            message: 'Ringkasan dashboard berhasil diambil.',
        );
    }

    public function layers(IndexDashboardLayerRequest $request): JsonResponse
    {
        $layers = SatelliteLayer::query()
            ->where('analysis_run_id', (int) $request->input('analysis_run_id'))
            ->latest('id')
            ->get()
            ->map(fn ($layer) => [
                'id' => $layer->id,
                'layer_name' => $layer->layer_name,
                'layer_type' => $layer->layer_type,
                'period_type' => $layer->period_type,
                'storage_type' => $layer->storage_type,
                'file_path' => $layer->file_path,
                'tile_url' => $layer->tile_url,
                'bbox' => $layer->bbox ?? new \stdClass(),
                'visualization_params' => $layer->visualization_params ?? new \stdClass(),
                'is_public' => $layer->is_public,
            ])->all();

        return $this->success(
            data: $layers,
            message: 'Layer berhasil diambil.',
        );
    }
}
