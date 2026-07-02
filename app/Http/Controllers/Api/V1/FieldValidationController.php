<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\FieldValidations\StoreFieldValidationRequest;
use App\Http\Requests\Api\V1\FieldValidations\UpdateFieldValidationRequest;
use App\Http\Resources\Api\V1\FieldValidationResource;
use App\Models\FieldValidation;
use App\Models\Hotspot;
use App\Services\AuditLogService;
use App\Services\FieldValidationService;
use App\Services\SpatialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FieldValidationController extends ApiController
{
    public function __construct(
        protected FieldValidationService $fieldValidationService,
        protected SpatialService $spatialService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(Hotspot $hotspot): JsonResponse
    {
        $query = FieldValidation::query()
            ->with([
                'validator:id,name',
                'photos' => function ($photoQuery) {
                    $this->spatialService->applyGeoJsonSelect($photoQuery, ['photo_point']);
                },
            ])
            ->where('hotspot_id', $hotspot->id)
            ->latest('id');

        $this->spatialService->applyGeoJsonSelect($query, ['validation_point']);

        return $this->success(
            data: FieldValidationResource::collection($query->get())->resolve(),
            message: 'Riwayat validasi berhasil diambil.',
        );
    }

    public function store(StoreFieldValidationRequest $request, Hotspot $hotspot): JsonResponse
    {
        $validation = $this->fieldValidationService->create(
            hotspot: $hotspot,
            attributes: $request->validated(),
            validatorId: $request->user()->id,
        );

        $query = FieldValidation::query()
            ->with([
                'validator:id,name',
                'photos' => function ($photoQuery) {
                    $this->spatialService->applyGeoJsonSelect($photoQuery, ['photo_point']);
                },
            ])
            ->whereKey($validation->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['validation_point']);
        $validation = $query->firstOrFail();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'create_field_validation',
            entityType: 'field_validations',
            entityId: $validation->id,
            description: "Validasi lapangan untuk hotspot {$hotspot->hotspot_code} berhasil dibuat.",
            newValues: $validation->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new FieldValidationResource($validation))->resolve(),
            message: 'Validasi lapangan berhasil disimpan.',
            status: 201,
        );
    }

    public function update(UpdateFieldValidationRequest $request, FieldValidation $fieldValidation): JsonResponse
    {
        if (! $this->canManageValidation($request, $fieldValidation)) {
            return $this->error(
                message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                status: 403,
            );
        }

        $oldValues = $fieldValidation->toArray();
        $validation = $this->fieldValidationService->update($fieldValidation, $request->validated());

        $query = FieldValidation::query()
            ->with([
                'validator:id,name',
                'photos' => function ($photoQuery) {
                    $this->spatialService->applyGeoJsonSelect($photoQuery, ['photo_point']);
                },
            ])
            ->whereKey($validation->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['validation_point']);
        $validation = $query->firstOrFail();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_field_validation',
            entityType: 'field_validations',
            entityId: $validation->id,
            description: "Validasi lapangan #{$validation->id} berhasil diperbarui.",
            oldValues: $oldValues,
            newValues: $validation->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new FieldValidationResource($validation))->resolve(),
            message: 'Validasi lapangan berhasil diperbarui.',
        );
    }

    protected function canManageValidation(Request $request, FieldValidation $fieldValidation): bool
    {
        $user = $request->user();

        if ($user === null) {
            return false;
        }

        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $fieldValidation->validator_id === $user->id;
    }
}
