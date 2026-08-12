<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\AoiAreas\ImportAoiAreaRequest;
use App\Http\Requests\Api\V1\AoiAreas\IndexAoiAreaRequest;
use App\Http\Requests\Api\V1\AoiAreas\StoreAoiAreaRequest;
use App\Http\Requests\Api\V1\AoiAreas\UpdateAoiAreaRequest;
use App\Http\Resources\Api\V1\AoiAreaResource;
use App\Models\AoiArea;
use App\Services\AuditLogService;
use App\Services\FileUploadService;
use App\Services\SpatialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AoiAreaController extends ApiController
{
    public function __construct(
        protected SpatialService $spatialService,
        protected FileUploadService $fileUploadService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(IndexAoiAreaRequest $request): JsonResponse
    {
        $query = AoiArea::query()->latest('id');
        $this->spatialService->applyGeoJsonSelect($query, ['geom']);

        if ($request->filled('aoi_type')) {
            $query->where('aoi_type', $request->string('aoi_type'));
        }

        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->string('verification_status'));
        }

        $paginator = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            data: AoiAreaResource::collection($paginator->items())->resolve(),
            message: 'Data AOI berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(AoiArea $aoiArea): JsonResponse
    {
        $query = AoiArea::query()->whereKey($aoiArea->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['geom']);
        $aoiArea = $query->firstOrFail();

        return $this->success(
            data: (new AoiAreaResource($aoiArea))->resolve(),
            message: 'Detail AOI berhasil diambil.',
        );
    }

    public function store(StoreAoiAreaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $aoiArea = DB::transaction(function () use ($validated, $request) {
            $geometry = $validated['geometry'];
            $attributes = Arr::except($validated, ['geometry']);
            $attributes['created_by'] = $request->user()->id;

            return $this->createAoiArea($attributes, $geometry);
        });

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'create_aoi',
            entityType: 'aoi_areas',
            entityId: $aoiArea->id,
            description: "AOI {$aoiArea->code} dibuat.",
            newValues: $aoiArea->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        $query = AoiArea::query()->whereKey($aoiArea->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['geom']);
        $aoiArea = $query->firstOrFail();

        return $this->success(
            data: (new AoiAreaResource($aoiArea))->resolve(),
            message: 'AOI berhasil dibuat.',
            status: 201,
        );
    }

    public function update(UpdateAoiAreaRequest $request, AoiArea $aoiArea): JsonResponse
    {
        $validated = $request->validated();
        $oldValues = $aoiArea->toArray();

        DB::transaction(function () use ($validated, $aoiArea) {
            $geometry = $validated['geometry'] ?? null;
            $attributes = Arr::except($validated, ['geometry']);

            if ($attributes !== []) {
                $aoiArea->fill($attributes)->save();
            }

            if ($geometry !== null) {
                $this->spatialService->persistGeometry($aoiArea, 'geom', $geometry);
            }
        });

        $query = $aoiArea->newQuery()->whereKey($aoiArea->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['geom']);
        $aoiArea = $query->firstOrFail();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_aoi',
            entityType: 'aoi_areas',
            entityId: $aoiArea->id,
            description: "AOI {$aoiArea->code} diperbarui.",
            oldValues: $oldValues,
            newValues: $aoiArea->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new AoiAreaResource($aoiArea))->resolve(),
            message: 'AOI berhasil diperbarui.',
        );
    }

    public function destroy(AoiArea $aoiArea): JsonResponse
    {
        $aoiArea->delete();

        return $this->success(
            data: null,
            message: 'AOI berhasil dihapus.',
        );
    }

    public function import(ImportAoiAreaRequest $request): JsonResponse
    {
        $validated = $request->validated();
        /** @var UploadedFile $file */
        $file = $validated['file'];

        $fileMeta = $this->fileUploadService->storePrivate($file, 'mangrove-eye/aoi');
        $payload = json_decode($file->getContent(), true, flags: JSON_THROW_ON_ERROR);

        $features = $this->extractFeatures($payload);
        $imported = [];

        DB::transaction(function () use (&$imported, $features, $validated, $request, $fileMeta) {
            foreach ($features as $index => $feature) {
                $geometry = $feature['geometry'] ?? $feature;

                // Prepare common attributes for insertion
                $attributes = [
                    'code' => $this->resolveAoiCode($feature, $index),
                    'name' => data_get($feature, 'properties.name', 'Imported AOI '.($index + 1)),
                    'aoi_type' => $validated['aoi_type'],
                    'description' => data_get($feature, 'properties.description'),
                    'estimated_area_ha' => data_get($feature, 'properties.estimated_area_ha'),
                    'source_type' => $validated['source_type'],
                    'source_name' => $validated['source_name'] ?? data_get($feature, 'properties.source_name'),
                    'source_file_path' => $fileMeta['path'],
                    'verification_status' => $validated['verification_status'] ?? 'draft',
                    'sensitivity_level' => $validated['sensitivity_level'],
                    'created_by' => $request->user()->id,
                ];

                $imported[] = $this->createAoiArea($attributes, $geometry)->fresh();
            }
        });

        $reloaded = AoiArea::query()->whereIn('id', collect($imported)->pluck('id')->all());
        $this->spatialService->applyGeoJsonSelect($reloaded, ['geom']);

        return $this->success(
            data: [
                'imported_count' => count($imported),
                'aoi_areas' => AoiAreaResource::collection($reloaded->get())->resolve(),
            ],
            message: 'AOI berhasil diimpor.',
            status: 201,
        );
    }

    protected function extractFeatures(array $payload): array
    {
        return match ($payload['type'] ?? null) {
            'FeatureCollection' => $payload['features'] ?? [],
            'Feature' => [$payload],
            'Polygon', 'MultiPolygon' => [$payload],
            default => [],
        };
    }

    protected function resolveAoiCode(array $feature, int $index): string
    {
        $code = data_get($feature, 'properties.code');

        if (is_string($code) && $code !== '') {
            return $code;
        }

        return sprintf('AOI-IMP-%s-%03d', now()->format('YmdHis'), $index + 1);
    }

    private function createAoiArea(array $attributes, array $geometry): AoiArea
    {
        if (! $this->spatialService->isPgsql()) {
            $attributes['geom'] = $geometry;

            return AoiArea::create($attributes);
        }

        $insertData = $attributes;
        $insertData['geom'] = $this->spatialService->databaseValue($geometry);
        $insertData['created_at'] = now();
        $insertData['updated_at'] = now();

        $id = DB::table('aoi_areas')->insertGetId($insertData);

        return AoiArea::query()->findOrFail($id);
    }
}
