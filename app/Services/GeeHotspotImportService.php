<?php

namespace App\Services;

use App\Models\AnalysisRun;
use App\Models\GeeImport;
use App\Models\Hotspot;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class GeeHotspotImportService
{
    protected const REQUIRED_PROPERTIES = [
        'area_ha',
        'centroid_lon',
        'centroid_lat',
        'mvi_before_mean',
        'mvi_after_mean',
        'mvi_delta_mean',
        'cmri_before_mean',
        'cmri_after_mean',
        'cmri_delta_mean',
        'ndvi_before_mean',
        'ndvi_after_mean',
        'ndvi_delta_mean',
        'ndwi_before_mean',
        'ndwi_after_mean',
        'ndwi_delta_mean',
        'priority',
        'validation_status',
        'hotspot_type',
        'detection_method',
        'source',
        'aoi_name',
    ];

    public function __construct(
        protected FileUploadService $fileUploadService,
        protected SpatialService $spatialService,
    ) {
    }

    public function import(
        AnalysisRun $analysisRun,
        UploadedFile $file,
        ?array $metadata,
        ?array $importSummary,
        ?int $userId,
    ): GeeImport {
        $parsed = $this->parseGeoJson($file);
        $stored = $this->fileUploadService->storePrivate(
            file: $file,
            directory: "gee-imports/analysis-runs/{$analysisRun->id}/hotspots",
        );

        try {
            return DB::transaction(function () use ($analysisRun, $file, $metadata, $importSummary, $userId, $parsed, $stored) {
                $summary = array_merge($parsed['summary'], $importSummary ?? []);

                $geeImport = GeeImport::create([
                    'analysis_run_id' => $analysisRun->id,
                    'import_type' => 'hotspot_geojson',
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $stored['path'],
                    'status' => 'processed',
                    'total_features' => $parsed['summary']['total_features'],
                    'metadata' => array_merge($metadata ?? [], [
                        'disk' => $stored['disk'],
                        'stored_file_name' => $stored['file_name'],
                        'mime_type' => $stored['mime_type'],
                        'file_size' => $stored['file_size'],
                    ]),
                    'import_summary' => $summary,
                    'imported_by' => $userId,
                    'imported_at' => now(),
                ]);

                $nextSequence = Hotspot::query()
                    ->where('analysis_run_id', $analysisRun->id)
                    ->count() + 1;

                foreach ($parsed['features'] as $feature) {
                    $this->createHotspot(
                        analysisRun: $analysisRun,
                        geeImport: $geeImport,
                        feature: $feature,
                        sequence: $nextSequence,
                    );

                    $nextSequence++;
                }

                $this->refreshAnalysisRunSummary($analysisRun);

                return $geeImport->refresh()->load('analysisRun:id,name');
            });
        } catch (\Throwable $exception) {
            $this->fileUploadService->delete($stored['path'], $stored['disk']);

            throw $exception;
        }
    }

    public function parseGeoJson(UploadedFile $file): array
    {
        $content = $file->get();

        if (! is_string($content) || trim($content) === '') {
            throw ValidationException::withMessages([
                'file' => ['File GeoJSON tidak boleh kosong.'],
            ]);
        }

        try {
            $payload = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw ValidationException::withMessages([
                'file' => ['File harus berupa JSON yang valid.'],
            ]);
        }

        if (! is_array($payload) || ($payload['type'] ?? null) !== 'FeatureCollection') {
            throw ValidationException::withMessages([
                'file' => ['GeoJSON wajib bertipe FeatureCollection.'],
            ]);
        }

        if (! isset($payload['features']) || ! is_array($payload['features']) || $payload['features'] === []) {
            throw ValidationException::withMessages([
                'file' => ['GeoJSON wajib memiliki minimal satu feature.'],
            ]);
        }

        $features = [];
        $totalArea = 0.0;
        $priorityCounts = [];

        foreach ($payload['features'] as $index => $feature) {
            if (! is_array($feature)) {
                throw ValidationException::withMessages([
                    "file.features.{$index}" => ['Setiap feature harus berupa object GeoJSON yang valid.'],
                ]);
            }

            $properties = $this->normalizeProperties($feature['properties'] ?? null, $index);
            $geometry = $this->normalizeGeometry($feature['geometry'] ?? null, $index);
            $centroid = $this->resolveCentroid($geometry, $properties);

            $features[] = [
                'geometry' => $geometry,
                'centroid' => $centroid,
                'properties' => $properties,
            ];

            $totalArea += (float) $properties['area_ha'];
            $priorityCounts[$properties['priority']] = ($priorityCounts[$properties['priority']] ?? 0) + 1;
        }

        return [
            'features' => $features,
            'summary' => [
                'total_features' => count($features),
                'imported_hotspots' => count($features),
                'total_area_ha' => round($totalArea, 4),
                'priority_breakdown' => $priorityCounts,
            ],
        ];
    }

    protected function createHotspot(AnalysisRun $analysisRun, GeeImport $geeImport, array $feature, int $sequence): Hotspot
    {
        $properties = $feature['properties'];
        $timestamps = [
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $attributes = [
            'hotspot_code' => $this->buildHotspotCode($analysisRun, $sequence),
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $analysisRun->aoi_area_id,
            'gee_import_id' => $geeImport->id,
            'detected_at' => $this->parseDetectedAt($properties, $analysisRun),
            'area_ha' => (float) $properties['area_ha'],
            'mvi_before' => (float) $properties['mvi_before_mean'],
            'mvi_after' => (float) $properties['mvi_after_mean'],
            'mvi_delta' => (float) $properties['mvi_delta_mean'],
            'cmri_before' => (float) $properties['cmri_before_mean'],
            'cmri_after' => (float) $properties['cmri_after_mean'],
            'cmri_delta' => (float) $properties['cmri_delta_mean'],
            'ndvi_before' => (float) $properties['ndvi_before_mean'],
            'ndvi_after' => (float) $properties['ndvi_after_mean'],
            'ndvi_delta' => (float) $properties['ndvi_delta_mean'],
            'ndwi_before' => (float) $properties['ndwi_before_mean'],
            'ndwi_after' => (float) $properties['ndwi_after_mean'],
            'ndwi_delta' => (float) $properties['ndwi_delta_mean'],
            'priority' => $properties['priority'],
            'validation_status' => $properties['validation_status'] ?: 'detected',
            'sensitivity_level' => $properties['sensitivity_level'] ?? 'restricted',
            'properties' => $properties,
        ];

        if (! $this->spatialService->isPgsql()) {
            return Hotspot::query()->create([
                ...$attributes,
                'centroid' => $feature['centroid'],
                'geom' => $feature['geometry'],
            ]);
        }

        $hotspotId = DB::table('hotspots')->insertGetId([
            ...$attributes,
            'properties' => json_encode($properties, JSON_THROW_ON_ERROR),
            'centroid' => $this->spatialService->databaseValue($feature['centroid']),
            'geom' => $this->spatialService->databaseValue($feature['geometry']),
            ...$timestamps,
        ]);

        return Hotspot::query()->findOrFail($hotspotId);
    }

    protected function refreshAnalysisRunSummary(AnalysisRun $analysisRun): void
    {
        $summary = Hotspot::query()
            ->where('analysis_run_id', $analysisRun->id)
            ->selectRaw('COUNT(*) as total_hotspots, COALESCE(SUM(area_ha), 0) as total_area_ha')
            ->first();

        $analysisRun->forceFill([
            'total_hotspots' => (int) ($summary?->total_hotspots ?? 0),
            'total_area_ha' => round((float) ($summary?->total_area_ha ?? 0), 4),
            'status' => 'processed',
            'processed_at' => $analysisRun->processed_at ?? now(),
        ])->save();
    }

    protected function normalizeProperties(mixed $properties, int $index): array
    {
        if (! is_array($properties)) {
            throw ValidationException::withMessages([
                "file.features.{$index}.properties" => ['Properties wajib tersedia pada setiap feature.'],
            ]);
        }

        $missing = [];

        foreach (self::REQUIRED_PROPERTIES as $property) {
            if (! array_key_exists($property, $properties)) {
                $missing[] = $property;
            }
        }

        if ($missing !== []) {
            throw ValidationException::withMessages([
                "file.features.{$index}.properties" => [
                    'Properties wajib tidak lengkap: '.implode(', ', $missing).'.',
                ],
            ]);
        }

        $validator = Validator::make($properties, [
            'area_ha' => ['required', 'numeric'],
            'mvi_before_mean' => ['required', 'numeric'],
            'mvi_after_mean' => ['required', 'numeric'],
            'mvi_delta_mean' => ['required', 'numeric'],
            'cmri_before_mean' => ['required', 'numeric'],
            'cmri_after_mean' => ['required', 'numeric'],
            'cmri_delta_mean' => ['required', 'numeric'],
            'ndvi_before_mean' => ['required', 'numeric'],
            'ndvi_after_mean' => ['required', 'numeric'],
            'ndvi_delta_mean' => ['required', 'numeric'],
            'ndwi_before_mean' => ['required', 'numeric'],
            'ndwi_after_mean' => ['required', 'numeric'],
            'ndwi_delta_mean' => ['required', 'numeric'],
            'priority' => ['required', 'string'],
            'validation_status' => ['required', 'string'],
            'hotspot_type' => ['required', 'string'],
            'detection_method' => ['required', 'string'],
            'source' => ['required', 'string'],
            'aoi_name' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([
                "file.features.{$index}.properties" => $validator->errors()->all(),
            ]);
        }

        return $properties;
    }

    protected function normalizeGeometry(mixed $geometry, int $index): array
    {
        if (! is_array($geometry) || ! isset($geometry['type'], $geometry['coordinates'])) {
            throw ValidationException::withMessages([
                "file.features.{$index}.geometry" => ['Geometry wajib tersedia dan valid pada setiap feature.'],
            ]);
        }

        return match ($geometry['type']) {
            'Polygon' => [
                'type' => 'MultiPolygon',
                'coordinates' => [$this->validatePolygonCoordinates($geometry['coordinates'], $index)],
            ],
            'MultiPolygon' => [
                'type' => 'MultiPolygon',
                'coordinates' => $this->validateMultiPolygonCoordinates($geometry['coordinates'], $index),
            ],
            default => throw ValidationException::withMessages([
                "file.features.{$index}.geometry.type" => ['Geometry harus Polygon atau MultiPolygon.'],
            ]),
        };
    }

    protected function validatePolygonCoordinates(mixed $coordinates, int $index): array
    {
        if (! is_array($coordinates) || $coordinates === []) {
            throw ValidationException::withMessages([
                "file.features.{$index}.geometry.coordinates" => ['Koordinat Polygon tidak valid.'],
            ]);
        }

        $rings = [];

        foreach ($coordinates as $ringIndex => $ring) {
            $rings[] = $this->validateRing($ring, $index, $ringIndex);
        }

        return $rings;
    }

    protected function validateMultiPolygonCoordinates(mixed $coordinates, int $index): array
    {
        if (! is_array($coordinates) || $coordinates === []) {
            throw ValidationException::withMessages([
                "file.features.{$index}.geometry.coordinates" => ['Koordinat MultiPolygon tidak valid.'],
            ]);
        }

        $polygons = [];

        foreach ($coordinates as $polygonIndex => $polygonCoordinates) {
            $polygons[] = $this->validatePolygonCoordinates($polygonCoordinates, $index);
        }

        return $polygons;
    }

    protected function validateRing(mixed $ring, int $featureIndex, int $ringIndex): array
    {
        if (! is_array($ring) || count($ring) < 4) {
            throw ValidationException::withMessages([
                "file.features.{$featureIndex}.geometry.coordinates.{$ringIndex}" => ['Setiap ring polygon minimal memiliki 4 titik.'],
            ]);
        }

        $validated = [];

        foreach ($ring as $pointIndex => $point) {
            if (! is_array($point) || count($point) < 2 || ! is_numeric($point[0]) || ! is_numeric($point[1])) {
                throw ValidationException::withMessages([
                    "file.features.{$featureIndex}.geometry.coordinates.{$ringIndex}.{$pointIndex}" => ['Koordinat titik polygon tidak valid.'],
                ]);
            }

            $validated[] = [(float) $point[0], (float) $point[1]];
        }

        $firstPoint = $validated[0];
        $lastPoint = $validated[count($validated) - 1];

        if ($firstPoint !== $lastPoint) {
            throw ValidationException::withMessages([
                "file.features.{$featureIndex}.geometry.coordinates.{$ringIndex}" => ['Ring polygon harus tertutup.'],
            ]);
        }

        return $validated;
    }

    protected function resolveCentroid(array $geometry, array $properties): array
    {
        if (
            isset($properties['centroid_lon'], $properties['centroid_lat'])
            && is_numeric($properties['centroid_lon'])
            && is_numeric($properties['centroid_lat'])
        ) {
            return [
                'type' => 'Point',
                'coordinates' => [
                    (float) $properties['centroid_lon'],
                    (float) $properties['centroid_lat'],
                ],
            ];
        }

        return $this->calculateCentroid($geometry);
    }

    protected function calculateCentroid(array $geometry): array
    {
        $weightedX = 0.0;
        $weightedY = 0.0;
        $totalArea = 0.0;

        foreach ($geometry['coordinates'] as $polygon) {
            $ring = $polygon[0] ?? [];
            [$cx, $cy, $area] = $this->calculateRingCentroid($ring);

            if ($area <= 0) {
                continue;
            }

            $weightedX += $cx * $area;
            $weightedY += $cy * $area;
            $totalArea += $area;
        }

        if ($totalArea <= 0) {
            $firstPoint = $geometry['coordinates'][0][0][0];

            return [
                'type' => 'Point',
                'coordinates' => [(float) $firstPoint[0], (float) $firstPoint[1]],
            ];
        }

        return [
            'type' => 'Point',
            'coordinates' => [$weightedX / $totalArea, $weightedY / $totalArea],
        ];
    }

    protected function calculateRingCentroid(array $ring): array
    {
        $twiceArea = 0.0;
        $centroidX = 0.0;
        $centroidY = 0.0;

        for ($i = 0, $max = count($ring) - 1; $i < $max; $i++) {
            $current = $ring[$i];
            $next = $ring[$i + 1];
            $cross = ($current[0] * $next[1]) - ($next[0] * $current[1]);
            $twiceArea += $cross;
            $centroidX += ($current[0] + $next[0]) * $cross;
            $centroidY += ($current[1] + $next[1]) * $cross;
        }

        $area = abs($twiceArea) / 2;

        if ($twiceArea == 0.0) {
            $firstPoint = $ring[0];

            return [(float) $firstPoint[0], (float) $firstPoint[1], 0.0];
        }

        return [
            $centroidX / (3 * $twiceArea),
            $centroidY / (3 * $twiceArea),
            $area,
        ];
    }

    protected function parseDetectedAt(array $properties, AnalysisRun $analysisRun): ?string
    {
        $detectedAt = $properties['detected_at'] ?? $analysisRun->after_end_date?->toDateString();

        if (! is_string($detectedAt) || trim($detectedAt) === '') {
            return null;
        }

        try {
            return Carbon::parse($detectedAt)->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function buildHotspotCode(AnalysisRun $analysisRun, int $sequence): string
    {
        return sprintf(
            'HS-AR%s-%04d',
            str_pad((string) $analysisRun->id, 6, '0', STR_PAD_LEFT),
            $sequence,
        );
    }
}
