<?php

namespace Tests\Feature\Api\V1;

use App\Models\AoiArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
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
            ->assertJsonPath('data.code', 'AOI-KTH-001')
            ->assertJsonPath('data.geometry.type', 'MultiPolygon')
            ->assertJsonPath('data.geometry.coordinates.0.0.0', [98.455001, 4.011001]);

        $this->actingAs($admin)
            ->getJson('/api/v1/aoi-areas')
            ->assertOk()
            ->assertJsonPath('data.0.code', 'AOI-KTH-001');

        $this->actingAs($admin)
            ->getJson("/api/v1/aoi-areas/{$aoiId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Kawasan KTH Nipah')
            ->assertJsonPath('data.geometry.type', 'MultiPolygon')
            ->assertJsonPath('data.geometry.coordinates.0.0.0', [98.455001, 4.011001]);

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
            ->assertJsonPath('data.imported_count', 1)
            ->assertJsonPath('data.aoi_areas.0.geometry.type', 'Polygon')
            ->assertJsonPath('data.aoi_areas.0.geometry.coordinates.0.0', [98.465001, 4.021001]);

        $this->actingAs($admin)
            ->deleteJson("/api/v1/aoi-areas/{$aoiId}")
            ->assertOk();

        $this->assertSoftDeleted('aoi_areas', ['id' => $aoiId]);
        $this->assertDatabaseHas('aoi_areas', ['code' => 'AOI-KONFLIK-001']);
    }

    public function test_admin_can_store_aoi_area_with_geometry_on_pgsql(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            $this->markTestSkipped('PostgreSQL-specific store regression test.');
        }

        $admin = User::factory()->create()->assignRole('admin');

        $response = $this->actingAs($admin)->postJson('/api/v1/aoi-areas', [
            'code' => 'AOI-PGSQL-001',
            'name' => 'Kwala Serapuh Draft AOI',
            'aoi_type' => 'main_aoi',
            'estimated_area_ha' => 0.9600,
            'source_type' => 'other',
            'source_name' => 'Mangrove-Eye Phase 3 GEE Draft AOI',
            'verification_status' => 'draft',
            'sensitivity_level' => 'internal',
            'geometry' => [
                'type' => 'Polygon',
                'coordinates' => [[
                    [98.435, 4.005],
                    [98.475, 4.005],
                    [98.475, 4.035],
                    [98.435, 4.035],
                    [98.435, 4.005],
                ]],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'AOI-PGSQL-001')
            ->assertJsonPath('data.geometry.type', 'Polygon')
            ->assertJsonPath('data.geometry.coordinates.0.0', [98.435, 4.005]);

        $aoiId = $response->json('data.id');

        $this->actingAs($admin)
            ->getJson("/api/v1/aoi-areas/{$aoiId}")
            ->assertOk()
            ->assertJsonPath('data.code', 'AOI-PGSQL-001')
            ->assertJsonPath('data.geometry.type', 'Polygon')
            ->assertJsonPath('data.geometry.coordinates.0.0.0', 98.435)
            ->assertJsonPath('data.geometry.coordinates.0.0.1', 4.005);

        $this->assertDatabaseHas('aoi_areas', ['code' => 'AOI-PGSQL-001', 'name' => 'Kwala Serapuh Draft AOI']);
    }
}
