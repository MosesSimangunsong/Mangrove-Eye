<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SatelliteLayerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_store_satellite_layer_and_internal_user_can_list_layers(): void
    {
        $admin = User::factory()->create()->assignRole('admin');
        $validator = User::factory()->create()->assignRole('validator');
        $analysisRun = AnalysisRun::factory()->create(['created_by' => $admin->id]);

        $this->actingAs($admin)
            ->postJson("/api/v1/analysis-runs/{$analysisRun->id}/satellite-layers", [
                'layer_name' => 'RGB After',
                'layer_type' => 'rgb_after',
                'period_type' => 'after',
                'storage_type' => 'file',
                'file_path' => 'layers/rgb-after.png',
                'visualization_params' => ['opacity' => 0.8],
                'is_public' => false,
            ])
            ->assertCreated()
            ->assertJsonPath('data.layer_name', 'RGB After')
            ->assertJsonMissingPath('data.file_path');

        $this->actingAs($validator)
            ->getJson("/api/v1/dashboard/layers?analysis_run_id={$analysisRun->id}")
            ->assertOk()
            ->assertJsonPath('data.0.layer_type', 'rgb_after')
            ->assertJsonMissingPath('data.0.file_path');
    }
}
