<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Hotspots\IndexPublicHotspotRequest;
use App\Models\AnalysisRun;
use App\Models\Hotspot;
use App\Services\SpatialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicDashboardController extends ApiController
{
    public function __construct(
        protected SpatialService $spatialService,
    ) {
    }

    public function summary(Request $request): JsonResponse
    {
        $query = Hotspot::query();

        if ($request->filled('analysis_run_id')) {
            $query->where('analysis_run_id', (int) $request->input('analysis_run_id'));
        }

        $hotspots = $query->get();
        $latestAnalysisRun = AnalysisRun::query()->latest('processed_at')->latest('id')->first();

        return $this->success(
            data: [
                'location' => 'Kwala Serapuh, Tanjung Pura, Langkat, Sumatera Utara',
                'total_hotspots' => $hotspots->count(),
                'total_estimated_area_ha' => round((float) $hotspots->sum('area_ha'), 4),
                'validated_hotspots' => $hotspots->where('validation_status', 'validated')->count(),
                'needs_recheck_hotspots' => $hotspots->where('validation_status', 'needs_recheck')->count(),
                'last_analysis_date' => $latestAnalysisRun?->processed_at?->toDateString(),
                'disclaimer' => 'Data yang ditampilkan merupakan indikasi awal dan telah digeneralisasi untuk keamanan.',
            ],
            message: 'Ringkasan publik berhasil diambil.',
        );
    }

    public function hotspots(IndexPublicHotspotRequest $request): JsonResponse
    {
        $query = Hotspot::query()->latest('id');
        $this->spatialService->applyGeoJsonSelect($query, ['centroid']);

        if ($request->filled('analysis_run_id')) {
            $query->where('analysis_run_id', $request->integer('analysis_run_id'));
        }

        if ($request->filled('status')) {
            $query->where('validation_status', $request->string('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority'));
        }

        $hotspots = $query->get();
        $bbox = $this->parseBbox($request->input('bbox'));

        if ($bbox !== null) {
            $hotspots = $hotspots->filter(fn ($hotspot) => $this->pointWithinBbox(
                $this->spatialService->geometryFromModel($hotspot, 'centroid'),
                $bbox,
            ))->values();
        }

        return $this->success(
            data: [
                'type' => 'FeatureCollection',
                'features' => $hotspots->map(fn ($hotspot) => [
                    'type' => 'Feature',
                    'properties' => [
                        'hotspot_code' => $hotspot->hotspot_code,
                        'area_ha' => $hotspot->area_ha !== null ? (float) $hotspot->area_ha : null,
                        'priority' => $hotspot->priority,
                        'validation_status' => $hotspot->validation_status,
                        'detected_at' => $hotspot->detected_at?->toDateString(),
                        'is_generalized' => true,
                    ],
                    'geometry' => $this->generalizePoint($this->spatialService->geometryFromModel($hotspot, 'centroid')),
                ])->values()->all(),
            ],
            message: 'Data hotspot publik berhasil diambil.',
        );
    }

    protected function generalizePoint(?array $point): ?array
    {
        if (($point['type'] ?? null) !== 'Point') {
            return null;
        }

        return [
            'type' => 'Point',
            'coordinates' => [
                round((float) $point['coordinates'][0], 2),
                round((float) $point['coordinates'][1], 2),
            ],
        ];
    }

    protected function parseBbox(?string $bbox): ?array
    {
        if (! is_string($bbox) || trim($bbox) === '') {
            return null;
        }

        $parts = array_map('trim', explode(',', $bbox));

        if (count($parts) !== 4 || collect($parts)->contains(fn ($part) => ! is_numeric($part))) {
            return null;
        }

        return array_map('floatval', $parts);
    }

    protected function pointWithinBbox(?array $point, array $bbox): bool
    {
        if (($point['type'] ?? null) !== 'Point') {
            return false;
        }

        [$lng, $lat] = $point['coordinates'];

        return $lng >= $bbox[0] && $lng <= $bbox[2] && $lat >= $bbox[1] && $lat <= $bbox[3];
    }
}
