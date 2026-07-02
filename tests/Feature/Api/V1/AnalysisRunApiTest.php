<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalysisRunApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_authorized_user_can_crud_analysis_run(): void
    {
        $admin = User::factory()->create()->assignRole('admin');
        $aoi = AoiArea::factory()->create(['created_by' => $admin->id]);

        $storeResponse = $this->actingAs($admin)->postJson('/api/v1/analysis-runs', [
            'aoi_area_id' => $aoi->id,
            'name' => 'Analisis Kwala Serapuh Jan-Jun 2026',
            'before_start_date' => '2026-01-01',
            'before_end_date' => '2026-03-31',
            'after_start_date' => '2026-04-01',
            'after_end_date' => '2026-06-30',
            'cloud_threshold' => 20,
            'primary_indices' => ['MVI', 'CMRI'],
            'supporting_indices' => ['NDVI', 'NDWI'],
            'threshold_params' => ['mvi_delta_min' => -1.0],
            'processing_params' => ['composite_method' => 'median'],
        ]);

        $analysisRunId = $storeResponse->json('data.id');

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Analisis Kwala Serapuh Jan-Jun 2026')
            ->assertJsonPath('data.status', 'draft');

        $this->actingAs($admin)
            ->getJson('/api/v1/analysis-runs')
            ->assertOk()
            ->assertJsonPath('data.0.id', $analysisRunId);

        $this->actingAs($admin)
            ->getJson("/api/v1/analysis-runs/{$analysisRunId}")
            ->assertOk()
            ->assertJsonPath('data.aoi_area.id', $aoi->id);

        $this->actingAs($admin)
            ->putJson("/api/v1/analysis-runs/{$analysisRunId}", [
                'status' => 'processed',
                'total_hotspots' => 5,
                'total_area_ha' => 3.75,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'processed');

        $this->actingAs($admin)
            ->deleteJson("/api/v1/analysis-runs/{$analysisRunId}")
            ->assertOk();

        $this->assertSoftDeleted('analysis_runs', ['id' => $analysisRunId]);
    }

    public function test_internal_user_can_read_analysis_runs(): void
    {
        $user = User::factory()->create()->assignRole('validator');
        $analysisRun = AnalysisRun::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/analysis-runs')
            ->assertOk()
            ->assertJsonFragment(['id' => $analysisRun->id]);
    }
}
