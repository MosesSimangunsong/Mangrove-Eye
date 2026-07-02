<?php

namespace App\Services;

use App\Models\FieldValidation;
use App\Models\ValidationPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ValidationPhotoService
{
    public function __construct(
        protected FileUploadService $fileUploadService,
        protected SpatialService $spatialService,
    ) {
    }

    public function create(FieldValidation $fieldValidation, UploadedFile $photo, array $attributes): ValidationPhoto
    {
        $stored = $this->fileUploadService->storePrivate(
            file: $photo,
            directory: "validation-photos/field-validations/{$fieldValidation->id}",
        );

        try {
            return DB::transaction(function () use ($fieldValidation, $photo, $attributes, $stored) {
                $geometry = $this->buildPhotoPoint($attributes);
                $payload = [
                    'field_validation_id' => $fieldValidation->id,
                    'file_path' => $stored['path'],
                    'file_name' => $photo->getClientOriginalName(),
                    'mime_type' => $stored['mime_type'],
                    'file_size' => $stored['file_size'],
                    'taken_at' => $attributes['taken_at'] ?? null,
                    'caption' => $attributes['caption'] ?? null,
                    'is_primary' => (bool) ($attributes['is_primary'] ?? false),
                    'sensitivity_level' => $attributes['sensitivity_level'] ?? 'restricted',
                ];

                if (($payload['is_primary'] ?? false) === true) {
                    ValidationPhoto::query()
                        ->where('field_validation_id', $fieldValidation->id)
                        ->update(['is_primary' => false]);
                }

                if (! $this->spatialService->isPgsql()) {
                    return ValidationPhoto::query()->create([
                        ...$payload,
                        'photo_point' => $geometry,
                    ]);
                }

                $validationPhotoId = DB::table('validation_photos')->insertGetId([
                    ...$payload,
                    'photo_point' => $this->spatialService->databaseValue($geometry),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return ValidationPhoto::query()->findOrFail($validationPhotoId);
            });
        } catch (\Throwable $exception) {
            $this->fileUploadService->delete($stored['path'], $stored['disk']);

            throw $exception;
        }
    }

    public function delete(ValidationPhoto $validationPhoto): void
    {
        DB::transaction(function () use ($validationPhoto): void {
            $path = $validationPhoto->file_path;
            $fieldValidationId = $validationPhoto->field_validation_id;
            $wasPrimary = (bool) $validationPhoto->is_primary;

            $validationPhoto->delete();
            $this->fileUploadService->delete($path);

            if (! $wasPrimary) {
                return;
            }

            ValidationPhoto::query()
                ->where('field_validation_id', $fieldValidationId)
                ->oldest('id')
                ->limit(1)
                ->update(['is_primary' => true]);
        });
    }

    protected function buildPhotoPoint(array $attributes): ?array
    {
        if (! array_key_exists('photo_lat', $attributes) || ! array_key_exists('photo_lng', $attributes)) {
            return null;
        }

        return [
            'type' => 'Point',
            'coordinates' => [
                (float) $attributes['photo_lng'],
                (float) $attributes['photo_lat'],
            ],
        ];
    }
}
