<?php

namespace Database\Factories;

use App\Models\AoiArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AoiArea>
 */
class AoiAreaFactory extends Factory
{
    protected $model = AoiArea::class;

    public function definition(): array
    {
        return [
            'code' => 'AOI-'.fake()->unique()->numerify('###'),
            'name' => 'AOI '.fake()->words(2, true),
            'aoi_type' => 'main_aoi',
            'description' => fake()->sentence(),
            'village' => 'Kwala Serapuh',
            'district' => 'Tanjung Pura',
            'regency' => 'Langkat',
            'province' => 'Sumatera Utara',
            'estimated_area_ha' => 242.0,
            'source_type' => 'digitized',
            'source_name' => 'Manual Digitization',
            'verification_status' => 'draft',
            'sensitivity_level' => 'restricted',
            'geom' => [
                'type' => 'MultiPolygon',
                'coordinates' => [[[
                    [98.455001, 4.011001],
                    [98.460002, 4.011001],
                    [98.460002, 4.015002],
                    [98.455001, 4.015002],
                    [98.455001, 4.011001],
                ]]],
            ],
            'created_by' => User::factory(),
        ];
    }
}
