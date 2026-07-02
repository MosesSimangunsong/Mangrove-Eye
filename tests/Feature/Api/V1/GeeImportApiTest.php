<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\Hotspot;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GeeImportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_import_valid_gee_hotspot_geojson_and_update_analysis_summary(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create()->assignRole('admin');
        $aoi = AoiArea::factory()->create(['created_by' => $admin->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $admin->id,
            'status' => 'draft',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'hotspots_kwala_serapuh_run001_fix_geometry.geojson',
            $this->validGeoJsonPayload(),
        );

        $response = $this->actingAs($admin)->post(
            "/api/v1/analysis-runs/{$analysisRun->id}/gee-imports/hotspots",
            [
                'file' => $file,
                'metadata' => [
                    'source_note' => 'Phase 3 run 001',
                ],
            ],
            ['Accept' => 'application/json']
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.import_type', 'hotspot_geojson')
            ->assertJsonPath('data.status', 'processed')
            ->assertJsonPath('data.total_features', 2)
            ->assertJsonPath('data.import_summary.imported_hotspots', 2);

        $storedPath = $response->json('data.stored_path');

        Storage::disk('local')->assertExists($storedPath);

        $this->assertDatabaseHas('gee_imports', [
            'analysis_run_id' => $analysisRun->id,
            'import_type' => 'hotspot_geojson',
            'status' => 'processed',
            'total_features' => 2,
        ]);

        $this->assertSame(2, Hotspot::query()->where('analysis_run_id', $analysisRun->id)->count());

        $hotspot = Hotspot::query()->where('analysis_run_id', $analysisRun->id)->orderBy('id')->firstOrFail();
        $analysisRun->refresh();

        $this->assertSame($aoi->id, $hotspot->aoi_area_id);
        $this->assertNotNull($hotspot->gee_import_id);
        $this->assertSame('MultiPolygon', $hotspot->geom['type']);
        $this->assertSame('Point', $hotspot->centroid['type']);
        $this->assertEquals(2.818925, (float) $hotspot->mvi_before);
        $this->assertEquals(-0.450712, (float) $hotspot->cmri_delta);
        $this->assertSame('low', $hotspot->priority);
        $this->assertSame('detected', $hotspot->validation_status);
        $this->assertSame('gee_sentinel2_mvp', $hotspot->properties['source']);
        $this->assertSame(2, $analysisRun->total_hotspots);
        $this->assertEquals(1.8115, (float) $analysisRun->total_area_ha);
        $this->assertSame('processed', $analysisRun->status);

        $validator = User::factory()->create()->assignRole('validator');

        $this->actingAs($validator)
            ->getJson("/api/v1/analysis-runs/{$analysisRun->id}/gee-imports")
            ->assertOk()
            ->assertJsonPath('data.0.analysis_run_id', $analysisRun->id)
            ->assertJsonPath('data.0.total_features', 2);
    }

    public function test_invalid_gee_hotspot_geojson_is_rejected_with_422(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create()->assignRole('admin');
        $analysisRun = AnalysisRun::factory()->create([
            'created_by' => $admin->id,
        ]);

        $file = UploadedFile::fake()->createWithContent('invalid-hotspots.geojson', json_encode([
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [98.4, 4.0],
            ],
            'properties' => [],
        ], JSON_THROW_ON_ERROR));

        $this->actingAs($admin)->post(
            "/api/v1/analysis-runs/{$analysisRun->id}/gee-imports/hotspots",
            ['file' => $file],
            ['Accept' => 'application/json']
        )
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validasi gagal.');

        $this->assertDatabaseCount('gee_imports', 0);
        $this->assertDatabaseCount('hotspots', 0);
    }

    public function test_permission_middleware_blocks_hotspot_import_for_user_without_import_permission(): void
    {
        Storage::fake('local');

        $validator = User::factory()->create()->assignRole('validator');
        $analysisRun = AnalysisRun::factory()->create();
        $file = UploadedFile::fake()->createWithContent(
            'hotspots.geojson',
            $this->validGeoJsonPayload(),
        );

        $this->actingAs($validator)->post(
            "/api/v1/analysis-runs/{$analysisRun->id}/gee-imports/hotspots",
            ['file' => $file],
            ['Accept' => 'application/json']
        )
            ->assertForbidden();
    }

    protected function validGeoJsonPayload(): string
    {
        return json_encode([
            'type' => 'FeatureCollection',
            'features' => [
                [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [[
                            [98.43604136089098, 4.0293932069181135],
                            [98.43604136089098, 4.028674554690818],
                            [98.43622102394781, 4.028674554690818],
                            [98.43622102394781, 4.0293932069181135],
                            [98.43604136089098, 4.0293932069181135],
                        ]],
                    ],
                    'properties' => [
                        'area_ha' => 0.2289,
                        'centroid_lon' => 98.43619954023018,
                        'centroid_lat' => 4.029000681887155,
                        'mvi_before_mean' => 2.8189252988284275,
                        'mvi_after_mean' => 0.6376441059538159,
                        'mvi_delta_mean' => -2.1812811928746116,
                        'cmri_before_mean' => 0.8899749983911929,
                        'cmri_after_mean' => 0.43926303671753925,
                        'cmri_delta_mean' => -0.4507119616736536,
                        'ndvi_before_mean' => 0.48327816475319735,
                        'ndvi_after_mean' => 0.20527609159723018,
                        'ndvi_delta_mean' => -0.2780020731559672,
                        'ndwi_before_mean' => -0.4066968372127585,
                        'ndwi_after_mean' => -0.23398694824048008,
                        'ndwi_delta_mean' => 0.17270988897227835,
                        'priority' => 'low',
                        'validation_status' => 'detected',
                        'hotspot_type' => 'mangrove_loss_indication',
                        'detection_method' => 'sentinel2_mvi_cmri_change_detection',
                        'source' => 'gee_sentinel2_mvp',
                        'aoi_name' => 'Kwala Serapuh Draft AOI',
                    ],
                ],
                [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'MultiPolygon',
                        'coordinates' => [
                            [[
                                [98.43711933923193, 4.021038874775802],
                                [98.43711933923193, 4.02094904324739],
                                [98.43586169783416, 4.02094904324739],
                                [98.43586169783416, 4.021038874775802],
                                [98.43711933923193, 4.021038874775802],
                            ]],
                        ],
                    ],
                    'properties' => [
                        'area_ha' => 1.5826,
                        'centroid_lon' => 98.43655859831412,
                        'centroid_lat' => 4.020578135128744,
                        'mvi_before_mean' => 3.1275432103223832,
                        'mvi_after_mean' => 0.7892432467654913,
                        'mvi_delta_mean' => -2.338299963556891,
                        'cmri_before_mean' => 1.443822314904171,
                        'cmri_after_mean' => 0.8693573261207005,
                        'cmri_delta_mean' => -0.5744649887834705,
                        'ndvi_before_mean' => 0.7892601594962197,
                        'ndvi_after_mean' => 0.42361436879684844,
                        'ndvi_delta_mean' => -0.36564579069937125,
                        'ndwi_before_mean' => -0.6545621574214198,
                        'ndwi_after_mean' => -0.4457429563683567,
                        'ndwi_delta_mean' => 0.20881920105306298,
                        'priority' => 'medium',
                        'validation_status' => 'detected',
                        'hotspot_type' => 'mangrove_loss_indication',
                        'detection_method' => 'sentinel2_mvi_cmri_change_detection',
                        'source' => 'gee_sentinel2_mvp',
                        'aoi_name' => 'Kwala Serapuh Draft AOI',
                    ],
                ],
            ],
        ], JSON_THROW_ON_ERROR);
    }
}
