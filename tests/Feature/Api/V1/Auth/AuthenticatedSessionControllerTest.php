<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticatedSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_via_api_v1_session_auth(): void
    {
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);

        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login berhasil.')
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonPath('data.user.roles.0', 'admin');

        $this->assertAuthenticatedAs($user);
    }

    public function test_api_login_uses_standard_validation_error_shape(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validasi gagal.')
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['email', 'password'],
            ]);
    }

    public function test_authenticated_user_can_fetch_current_user_from_api(): void
    {
        $role = Role::create(['name' => 'validator', 'guard_name' => 'web']);

        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.roles.0', 'validator');
    }

    public function test_authenticated_user_can_logout_via_api(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/auth/logout');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Logout berhasil.');

        $this->assertGuest();
    }
}
