<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\Hotspot;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardSummaryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_internal_user_can_get_dashboard_summary(): void
    {
        $ngo = User::factory()->create()->assignRole('ngo_advocate');
        $aoi = AoiArea::factory()->create(['created_by' => $ngo->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $ngo->id,
            'processed_at' => now(),
        ]);

        Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
            'priority' => 'high',
            'validation_status' => 'validated',
            'area_ha' => 1.5,
        ]);

        Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
            'priority' => 'medium',
            'validation_status' => 'detected',
            'area_ha' => 2.25,
        ]);

        $this->actingAs($ngo)
            ->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.total_hotspots', 2)
            ->assertJsonPath('data.total_area_ha', 3.75)
            ->assertJsonPath('data.by_priority.high', 1)
            ->assertJsonPath('data.by_validation_status.validated', 1)
            ->assertJsonPath('data.latest_analysis_run.id', $analysisRun->id);
    }
}
