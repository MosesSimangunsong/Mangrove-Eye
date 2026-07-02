<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends ApiController
{
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->with('permissions')
            ->orderBy('id')
            ->get();

        return $this->success(
            data: RoleResource::collection($roles)->resolve(),
            message: 'Role berhasil diambil.',
        );
    }
}
