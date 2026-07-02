<?php

namespace Database\Factories;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalysisRun>
 */
class AnalysisRunFactory extends Factory
{
    protected $model = AnalysisRun::class;

    public function definition(): array
    {
        return [
            'aoi_area_id' => AoiArea::factory(),
            'name' => 'Analisis '.fake()->words(3, true),
            'description' => fake()->sentence(),
            'dataset_name' => 'Sentinel-2 Level-2A',
            'gee_collection_id' => 'COPERNICUS/S2_SR_HARMONIZED',
            'before_start_date' => '2026-01-01',
            'before_end_date' => '2026-03-31',
            'after_start_date' => '2026-04-01',
            'after_end_date' => '2026-06-30',
            'cloud_threshold' => 20,
            'primary_indices' => ['MVI', 'CMRI'],
            'supporting_indices' => ['NDVI', 'NDWI'],
            'threshold_params' => [
                'mvi_delta_min' => -1.0,
                'cmri_delta_min' => -0.2,
            ],
            'processing_params' => ['composite_method' => 'median'],
            'total_hotspots' => 0,
            'total_area_ha' => 0,
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
