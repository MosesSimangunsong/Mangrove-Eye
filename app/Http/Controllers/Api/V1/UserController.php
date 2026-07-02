<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Users\IndexUserRequest;
use App\Http\Requests\Api\V1\Users\StoreUserRequest;
use App\Http\Requests\Api\V1\Users\UpdateUserRolesRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;

class UserController extends ApiController
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(IndexUserRequest $request): JsonResponse
    {
        $query = User::query()
            ->with(['roles', 'permissions'])
            ->latest('id');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('role')) {
            $query->role($request->string('role')->toString());
        }

        $paginator = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            data: UserResource::collection($paginator->items())->resolve(),
            message: 'Data user berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'organization' => $validated['organization'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $user->syncRoles($validated['roles']);
        $user->load(['roles', 'permissions']);

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'create_user',
            entityType: 'users',
            entityId: $user->id,
            description: "User {$user->email} berhasil dibuat.",
            newValues: $user->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new UserResource($user))->resolve(),
            message: 'User berhasil dibuat.',
            status: 201,
        );
    }

    public function updateRoles(UpdateUserRolesRequest $request, User $user): JsonResponse
    {
        $oldValues = [
            'roles' => $user->getRoleNames()->values()->all(),
        ];

        $user->syncRoles($request->validated('roles'));
        $user->load(['roles', 'permissions']);

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_user_role',
            entityType: 'users',
            entityId: $user->id,
            description: "Role user {$user->email} berhasil diperbarui.",
            oldValues: $oldValues,
            newValues: ['roles' => $user->getRoleNames()->values()->all()],
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new UserResource($user))->resolve(),
            message: 'Role user berhasil diperbarui.',
        );
    }
}
