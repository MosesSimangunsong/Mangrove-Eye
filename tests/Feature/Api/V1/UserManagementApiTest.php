<?php

namespace Tests\Feature\Api\V1;

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_manage_users_roles_and_view_audit_logs(): void
    {
        $admin = User::factory()->create()->assignRole('admin');

        $createResponse = $this->actingAs($admin)
            ->postJson('/api/v1/users', [
                'name' => 'Validator Lapangan',
                'email' => 'validator@example.com',
                'password' => 'password123',
                'organization' => 'KTH Nipah',
                'roles' => ['validator'],
            ]);

        $userId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.email', 'validator@example.com')
            ->assertJsonPath('data.roles.0', 'validator');

        $this->actingAs($admin)
            ->patchJson("/api/v1/users/{$userId}/roles", [
                'roles' => ['validator', 'ngo_advocate'],
            ])
            ->assertOk()
            ->assertJsonFragment(['ngo_advocate']);

        $this->actingAs($admin)
            ->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonPath('data.0.id', $userId);

        $this->actingAs($admin)
            ->getJson('/api/v1/roles')
            ->assertOk()
            ->assertJsonFragment(['name' => 'admin']);

        AuditLog::query()->create([
            'user_id' => $admin->id,
            'action' => 'custom_audit',
            'entity_type' => 'reports',
            'entity_id' => '1',
            'description' => 'Audit test entry',
            'created_at' => now(),
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/audit-logs')
            ->assertOk()
            ->assertJsonFragment(['action' => 'custom_audit']);
    }
}
