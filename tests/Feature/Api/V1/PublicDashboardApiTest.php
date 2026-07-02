<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\Hotspot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_get_summary_and_generalized_hotspots(): void
    {
        $aoi = AoiArea::factory()->create();
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'processed_at' => now(),
        ]);

        Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
            'priority' => 'high',
            'validation_status' => 'validated',
            'centroid' => [
                'type' => 'Point',
                'coordinates' => [98.456789, 4.012345],
            ],
        ]);

        $this->getJson('/api/v1/public/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.total_hotspots', 1)
            ->assertJsonPath('data.validated_hotspots', 1);

        $this->getJson('/api/v1/public/hotspots')
            ->assertOk()
            ->assertJsonPath('data.type', 'FeatureCollection')
            ->assertJsonPath('data.features.0.properties.is_generalized', true)
            ->assertJsonMissingPath('data.features.0.properties.id')
            ->assertJsonPath('data.features.0.geometry.coordinates.0', 98.46)
            ->assertJsonPath('data.features.0.geometry.coordinates.1', 4.01);
    }
}
