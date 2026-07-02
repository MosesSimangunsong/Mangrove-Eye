<?php

namespace Tests\Feature\Api\V1;

use App\Models\AoiArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AoiAreaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_authorized_user_can_crud_aoi_area_and_import_geojson(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create()->assignRole('admin');

        $storeResponse = $this->actingAs($admin)->postJson('/api/v1/aoi-areas', [
            'code' => 'AOI-KTH-001',
            'name' => 'Kawasan KTH Nipah',
            'aoi_type' => 'main_aoi',
            'estimated_area_ha' => 242.0,
            'source_type' => 'digitized',
            'verification_status' => 'draft',
            'sensitivity_level' => 'restricted',
            'geometry' => [
                'type' => 'MultiPolygon',
                'coordinates' => [[[
                    [98.455001, 4.011001],
                    [98.460002, 4.011001],
                    [98.460002, 4.015002],
                    [98.455001, 4.015002],
                    [98.455001, 4.011001],
                ]]],
            ],
        ]);

        $aoiId = $storeResponse->json('data.id');

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'AOI-KTH-001');

        $this->actingAs($admin)
            ->getJson('/api/v1/aoi-areas')
            ->assertOk()
            ->assertJsonPath('data.0.code', 'AOI-KTH-001');

        $this->actingAs($admin)
            ->getJson("/api/v1/aoi-areas/{$aoiId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Kawasan KTH Nipah');

        $this->actingAs($admin)
            ->putJson("/api/v1/aoi-areas/{$aoiId}", [
                'name' => 'Kawasan Kelola KTH Nipah',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Kawasan Kelola KTH Nipah');

        $geoJson = json_encode([
            'type' => 'FeatureCollection',
            'features' => [[
                'type' => 'Feature',
                'properties' => [
                    'code' => 'AOI-KONFLIK-001',
                    'name' => 'Zona Konflik',
                ],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [98.465001, 4.021001],
                        [98.470002, 4.021001],
                        [98.470002, 4.025002],
                        [98.465001, 4.025002],
                        [98.465001, 4.021001],
                    ]],
                ],
            ]],
        ], JSON_THROW_ON_ERROR);

        $file = UploadedFile::fake()->createWithContent('aoi-conflict.geojson', $geoJson);

        $this->actingAs($admin)
            ->post('/api/v1/aoi-areas/import', [
                'file' => $file,
                'aoi_type' => 'conflict_zone',
                'source_type' => 'digitized',
                'sensitivity_level' => 'restricted',
                'verification_status' => 'draft',
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.imported_count', 1);

        $this->actingAs($admin)
            ->deleteJson("/api/v1/aoi-areas/{$aoiId}")
            ->assertOk();

        $this->assertSoftDeleted('aoi_areas', ['id' => $aoiId]);
        $this->assertDatabaseHas('aoi_areas', ['code' => 'AOI-KONFLIK-001']);
    }
}
