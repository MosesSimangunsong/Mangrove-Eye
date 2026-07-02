<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ValidationPhotos\StoreValidationPhotoRequest;
use App\Http\Resources\Api\V1\ValidationPhotoResource;
use App\Models\FieldValidation;
use App\Models\ValidationPhoto;
use App\Services\AuditLogService;
use App\Services\SpatialService;
use App\Services\ValidationPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ValidationPhotoController extends ApiController
{
    public function __construct(
        protected ValidationPhotoService $validationPhotoService,
        protected SpatialService $spatialService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(FieldValidation $fieldValidation): JsonResponse
    {
        $query = ValidationPhoto::query()
            ->where('field_validation_id', $fieldValidation->id)
            ->latest('id');

        $this->spatialService->applyGeoJsonSelect($query, ['photo_point']);

        return $this->success(
            data: ValidationPhotoResource::collection($query->get())->resolve(),
            message: 'Daftar foto validasi berhasil diambil.',
        );
    }

    public function show(Request $request, ValidationPhoto $validationPhoto): StreamedResponse|JsonResponse
    {
        $validationPhoto->load('fieldValidation');

        if (! $this->canViewValidation($request->user(), $validationPhoto->fieldValidation)) {
            return $this->error(
                message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                status: 403,
            );
        }

        return Storage::disk('local')->response(
            $validationPhoto->file_path,
            $validationPhoto->file_name,
            [
                'Content-Type' => $validationPhoto->mime_type,
                'Content-Disposition' => 'inline; filename="'.$validationPhoto->file_name.'"',
            ],
        );
    }

    public function store(StoreValidationPhotoRequest $request, FieldValidation $fieldValidation): JsonResponse
    {
        if (! $this->canManageValidation($request->user(), $fieldValidation)) {
            return $this->error(
                message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                status: 403,
            );
        }

        $validationPhoto = $this->validationPhotoService->create(
            fieldValidation: $fieldValidation,
            photo: $request->file('photo'),
            attributes: $request->validated(),
        );

        $query = ValidationPhoto::query()->whereKey($validationPhoto->getKey());
        $this->spatialService->applyGeoJsonSelect($query, ['photo_point']);
        $validationPhoto = $query->firstOrFail();

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'upload_validation_photo',
            entityType: 'validation_photos',
            entityId: $validationPhoto->id,
            description: "Foto validasi untuk field validation #{$fieldValidation->id} berhasil diunggah.",
            newValues: $validationPhoto->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new ValidationPhotoResource($validationPhoto))->resolve(),
            message: 'Foto validasi berhasil diunggah.',
            status: 201,
        );
    }

    public function destroy(Request $request, ValidationPhoto $validationPhoto): JsonResponse
    {
        $validationPhoto->load('fieldValidation');

        if (! $this->canManageValidation($request->user(), $validationPhoto->fieldValidation)) {
            return $this->error(
                message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                status: 403,
            );
        }

        $oldValues = $validationPhoto->toArray();
        $validationPhotoId = $validationPhoto->id;
        $this->validationPhotoService->delete($validationPhoto);

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'delete_validation_photo',
            entityType: 'validation_photos',
            entityId: $validationPhotoId,
            description: "Foto validasi #{$validationPhotoId} berhasil dihapus.",
            oldValues: $oldValues,
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: null,
            message: 'Foto validasi berhasil dihapus.',
        );
    }

    protected function canManageValidation($user, FieldValidation $fieldValidation): bool
    {
        if ($user === null) {
            return false;
        }

        if ($user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return $fieldValidation->validator_id === $user->id;
    }

    protected function canViewValidation($user, FieldValidation $fieldValidation): bool
    {
        return $user !== null;
    }
}
