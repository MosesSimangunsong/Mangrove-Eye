<?php

namespace Database\Factories;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\Hotspot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hotspot>
 */
class HotspotFactory extends Factory
{
    protected $model = Hotspot::class;

    public function definition(): array
    {
        return [
            'hotspot_code' => 'HS-KS-'.fake()->unique()->numerify('####'),
            'analysis_run_id' => AnalysisRun::factory(),
            'aoi_area_id' => AoiArea::factory(),
            'detected_at' => now(),
            'centroid' => [
                'type' => 'Point',
                'coordinates' => [98.456789, 4.012345],
            ],
            'geom' => [
                'type' => 'Polygon',
                'coordinates' => [[
                    [98.455001, 4.011001],
                    [98.460002, 4.011001],
                    [98.460002, 4.015002],
                    [98.455001, 4.015002],
                    [98.455001, 4.011001],
                ]],
            ],
            'area_ha' => 0.75,
            'mvi_before' => 2.145,
            'mvi_after' => 0.934,
            'mvi_delta' => -1.211,
            'cmri_before' => 0.642,
            'cmri_after' => 0.311,
            'cmri_delta' => -0.331,
            'ndvi_before' => 0.782,
            'ndvi_after' => 0.512,
            'ndvi_delta' => -0.270,
            'ndwi_before' => 0.140,
            'ndwi_after' => 0.201,
            'ndwi_delta' => 0.061,
            'priority' => 'high',
            'validation_status' => 'detected',
            'sensitivity_level' => 'restricted',
            'properties' => ['source' => 'manual-test'],
        ];
    }
}
