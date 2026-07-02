<?php

namespace App\Services;

use App\Models\FieldValidation;
use App\Models\Hotspot;
use Illuminate\Support\Facades\DB;

class FieldValidationService
{
    public function __construct(
        protected SpatialService $spatialService,
    ) {
    }

    public function create(Hotspot $hotspot, array $attributes, int $validatorId): FieldValidation
    {
        return DB::transaction(function () use ($hotspot, $attributes, $validatorId) {
            $geometry = $this->normalizePoint($attributes['validation_point'] ?? null);
            $payload = [
                'hotspot_id' => $hotspot->id,
                'validator_id' => $validatorId,
                'validation_status' => $attributes['validation_status'],
                'validation_note' => $attributes['validation_note'] ?? null,
                'observed_condition' => $attributes['observed_condition'] ?? null,
                'confidence_level' => $attributes['confidence_level'] ?? null,
                'visited_at' => $attributes['visited_at'] ?? null,
                'is_geotagged' => (bool) ($attributes['is_geotagged'] ?? false),
                'sensitivity_level' => $attributes['sensitivity_level'] ?? 'restricted',
            ];

            $validation = $this->storeValidation($payload, $geometry);
            $this->syncHotspotStatus($hotspot, $validation->validation_status);

            return $validation;
        });
    }

    public function update(FieldValidation $fieldValidation, array $attributes): FieldValidation
    {
        return DB::transaction(function () use ($fieldValidation, $attributes) {
            $geometry = array_key_exists('validation_point', $attributes)
                ? $this->normalizePoint($attributes['validation_point'])
                : null;

            $payload = [];

            foreach ([
                'validation_status',
                'validation_note',
                'observed_condition',
                'confidence_level',
                'visited_at',
                'is_geotagged',
                'sensitivity_level',
            ] as $field) {
                if (array_key_exists($field, $attributes)) {
                    $payload[$field] = $attributes[$field];
                }
            }

            if ($payload !== []) {
                $fieldValidation->fill($payload)->save();
            }

            if (array_key_exists('validation_point', $attributes)) {
                if ($this->spatialService->isPgsql()) {
                    DB::table('field_validations')
                        ->where('id', $fieldValidation->getKey())
                        ->update([
                            'validation_point' => $this->spatialService->databaseValue($geometry),
                        ]);

                    $fieldValidation->refresh();
                } else {
                    $fieldValidation->forceFill([
                        'validation_point' => $geometry,
                    ])->save();
                }
            }

            if (array_key_exists('validation_status', $attributes)) {
                $this->syncHotspotStatus($fieldValidation->hotspot, $fieldValidation->validation_status);
            }

            return $fieldValidation->refresh();
        });
    }

    protected function storeValidation(array $payload, ?array $geometry): FieldValidation
    {
        if (! $this->spatialService->isPgsql()) {
            return FieldValidation::query()->create([
                ...$payload,
                'validation_point' => $geometry,
            ]);
        }

        $validationId = DB::table('field_validations')->insertGetId([
            ...$payload,
            'validation_point' => $this->spatialService->databaseValue($geometry),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return FieldValidation::query()->findOrFail($validationId);
    }

    protected function syncHotspotStatus(Hotspot $hotspot, string $status): void
    {
        $hotspot->forceFill([
            'validation_status' => $status,
        ])->save();
    }

    protected function normalizePoint(?array $point): ?array
    {
        if ($point === null) {
            return null;
        }

        return [
            'type' => 'Point',
            'coordinates' => [
                (float) $point['coordinates'][0],
                (float) $point['coordinates'][1],
            ],
        ];
    }
}
