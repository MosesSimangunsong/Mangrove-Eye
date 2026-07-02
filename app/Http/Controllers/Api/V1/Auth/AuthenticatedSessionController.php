<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends ApiController
{
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user()->loadMissing('roles', 'permissions');

        return $this->success(
            data: [
                'user' => $this->transformUser($user),
            ],
            message: 'Login berhasil.',
        );
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()?->loadMissing('roles', 'permissions');

        return $this->success(
            data: $this->transformUser($user),
            message: 'Data user berhasil diambil.',
        );
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success(
            data: null,
            message: 'Logout berhasil.',
        );
    }

    protected function transformUser(?object $user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }
}
