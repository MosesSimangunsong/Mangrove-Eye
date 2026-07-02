<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Hotspots\IndexHotspotRequest;
use App\Http\Requests\Api\V1\Hotspots\UpdateHotspotPriorityRequest;
use App\Http\Requests\Api\V1\Hotspots\UpdateHotspotStatusRequest;
use App\Http\Resources\Api\V1\HotspotResource;
use App\Models\Hotspot;
use App\Services\AuditLogService;
use App\Services\SpatialService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

class HotspotController extends ApiController
{
    public function __construct(
        protected SpatialService $spatialService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(IndexHotspotRequest $request): JsonResponse
    {
        $query = Hotspot::query()
            ->with(['analysisRun:id,name', 'aoiArea:id,name'])
            ->latest('id');

        $this->spatialService->applyGeoJsonSelect($query, ['centroid', 'geom']);

        if ($request->filled('analysis_run_id')) {
            $query->where('analysis_run_id', $request->integer('analysis_run_id'));
        }

        if ($request->filled('aoi_area_id')) {
            $query->where('aoi_area_id', $request->integer('aoi_area_id'));
        }

        if ($request->filled('validation_status')) {
            $query->where('validation_status', $request->string('validation_status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority'));
        }

        if ($request->filled('bbox') && $this->spatialService->isPgsql()) {
            $bbox = $this->parseBbox($request->string('bbox')->toString());

            if ($bbox !== null) {
                $query->whereRaw(
                    "ST_Intersects(centroid, ST_MakeEnvelope(?, ?, ?, ?, 4326))",
                    $bbox,
                );
            }
        }

        if ($request->string('format')->toString() === 'geojson') {
            $hotspots = $query->get();

            if ($request->filled('bbox') && ! $this->spatialService->isPgsql()) {
                $bbox = $this->parseBbox($request->string('bbox')->toString());
                $hotspots = $this->filterByBbox($hotspots, $bbox);
            }

            return $this->success(
                data: $this->toGeoJson($hotspots),
                message: 'GeoJSON hotspot berhasil diambil.',
            );
        }

        if ($request->filled('bbox') && ! $this->spatialService->isPgsql()) {
            $bbox = $this->parseBbox($request->string('bbox')->toString());
            $collection = $this->filterByBbox($query->get(), $bbox)->values();
            $perPage = $request->integer('per_page', 15);
            $currentPage = LengthAwarePaginator::resolveCurrentPage();
            $items = $collection->forPage($currentPage, $perPage)->values();
            $paginator = new LengthAwarePaginator(
                $items,
                $collection->count(),
                $perPage,
                $currentPage,
            );
        } else {
            $paginator = $query->paginate($request->integer('per_page', 15));
        }

        return $this->success(
            data: HotspotResource::collection($paginator->items())->resolve(),
            message: 'Data hotspot berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(Hotspot $hotspot): JsonResponse
    {
        $query = Hotspot::query()
            ->with([
                'analysisRun:id,name',
                'aoiArea:id,name',
                'validations' => function ($validationQuery) {
                    $validationQuery
                        ->with([
                            'validator:id,name',
                            'photos' => function ($photoQuery) {
                                $this->spatialService->applyGeoJsonSelect($photoQuery, ['photo_point']);
                            },
                        ])
                        ->latest('id');

                    $this->spatialService->applyGeoJsonSelect($validationQuery, ['validation_point']);
                },
            ])
            ->whereKey($hotspot->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['centroid', 'geom']);
        $hotspot = $query->firstOrFail();

        return $this->success(
            data: (new HotspotResource($hotspot))->resolve(),
            message: 'Detail hotspot berhasil diambil.',
        );
    }

    public function updateStatus(UpdateHotspotStatusRequest $request, Hotspot $hotspot): JsonResponse
    {
        $oldValues = $hotspot->toArray();
        $hotspot->fill($request->validated())->save();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_hotspot_status',
            entityType: 'hotspots',
            entityId: $hotspot->id,
            description: "Status hotspot {$hotspot->hotspot_code} diperbarui.",
            oldValues: $oldValues,
            newValues: $hotspot->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        $query = Hotspot::query()->whereKey($hotspot->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['centroid', 'geom']);
        $hotspot = $query->firstOrFail();

        return $this->success(
            data: (new HotspotResource($hotspot))->resolve(),
            message: 'Status hotspot berhasil diperbarui.',
        );
    }

    public function updatePriority(UpdateHotspotPriorityRequest $request, Hotspot $hotspot): JsonResponse
    {
        $oldValues = $hotspot->toArray();
        $hotspot->fill($request->validated())->save();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_hotspot_priority',
            entityType: 'hotspots',
            entityId: $hotspot->id,
            description: "Prioritas hotspot {$hotspot->hotspot_code} diperbarui.",
            oldValues: $oldValues,
            newValues: $hotspot->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        $query = Hotspot::query()->whereKey($hotspot->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['centroid', 'geom']);
        $hotspot = $query->firstOrFail();

        return $this->success(
            data: (new HotspotResource($hotspot))->resolve(),
            message: 'Prioritas hotspot berhasil diperbarui.',
        );
    }

    protected function toGeoJson(iterable $hotspots): array
    {
        $features = [];

        foreach ($hotspots as $hotspot) {
            $features[] = [
                'type' => 'Feature',
                'properties' => [
                    'id' => $hotspot->id,
                    'hotspot_code' => $hotspot->hotspot_code,
                    'area_ha' => $hotspot->area_ha !== null ? (float) $hotspot->area_ha : null,
                    'priority' => $hotspot->priority,
                    'validation_status' => $hotspot->validation_status,
                    'detected_at' => $hotspot->detected_at?->toDateString(),
                    'mvi_delta' => $hotspot->mvi_delta !== null ? (float) $hotspot->mvi_delta : null,
                    'cmri_delta' => $hotspot->cmri_delta !== null ? (float) $hotspot->cmri_delta : null,
                    'centroid' => $this->spatialService->geometryFromModel($hotspot, 'centroid'),
                ],
                'geometry' => $this->spatialService->geometryFromModel($hotspot, 'geom'),
            ];
        }

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
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

    protected function filterByBbox(iterable $hotspots, ?array $bbox): \Illuminate\Support\Collection
    {
        return collect($hotspots)->filter(function ($hotspot) use ($bbox) {
            if ($bbox === null) {
                return true;
            }

            $centroid = $this->spatialService->geometryFromModel($hotspot, 'centroid');

            if (($centroid['type'] ?? null) !== 'Point') {
                return false;
            }

            [$lng, $lat] = $centroid['coordinates'];

            return $lng >= $bbox[0] && $lng <= $bbox[2] && $lat >= $bbox[1] && $lat <= $bbox[3];
        });
    }
}
