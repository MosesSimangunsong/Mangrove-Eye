<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\Hotspot;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotspotApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_internal_user_can_list_detail_and_read_geojson_hotspots(): void
    {
        $validator = User::factory()->create()->assignRole('validator');
        $aoi = AoiArea::factory()->create(['created_by' => $validator->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $validator->id,
        ]);
        $hotspot = Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
        ]);

        $this->actingAs($validator)
            ->getJson('/api/v1/hotspots')
            ->assertOk()
            ->assertJsonPath('data.0.hotspot_code', $hotspot->hotspot_code);

        $this->actingAs($validator)
            ->getJson('/api/v1/hotspots?format=geojson')
            ->assertOk()
            ->assertJsonPath('data.type', 'FeatureCollection')
            ->assertJsonPath('data.features.0.properties.hotspot_code', $hotspot->hotspot_code);

        $this->actingAs($validator)
            ->getJson("/api/v1/hotspots/{$hotspot->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $hotspot->id);
    }

    public function test_admin_can_update_hotspot_status_and_priority(): void
    {
        $admin = User::factory()->create()->assignRole('admin');
        $aoi = AoiArea::factory()->create(['created_by' => $admin->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $admin->id,
        ]);
        $hotspot = Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
            'priority' => 'medium',
            'validation_status' => 'detected',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/v1/hotspots/{$hotspot->id}/status", [
                'validation_status' => 'needs_recheck',
            ])
            ->assertOk()
            ->assertJsonPath('data.validation_status', 'needs_recheck');

        $this->actingAs($admin)
            ->patchJson("/api/v1/hotspots/{$hotspot->id}/priority", [
                'priority' => 'high',
            ])
            ->assertOk()
            ->assertJsonPath('data.priority', 'high');
    }
}
