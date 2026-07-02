<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\FieldValidation;
use App\Models\Hotspot;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FieldValidationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_validator_can_create_list_and_update_own_field_validation(): void
    {
        $validator = User::factory()->create()->assignRole('validator');
        $ngo = User::factory()->create()->assignRole('ngo_advocate');
        $aoi = AoiArea::factory()->create(['created_by' => $validator->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $validator->id,
        ]);
        $hotspot = Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
            'validation_status' => 'detected',
        ]);

        $storeResponse = $this->actingAs($validator)->postJson(
            "/api/v1/hotspots/{$hotspot->id}/field-validations",
            [
                'validation_status' => 'validated',
                'validation_note' => 'Ditemukan bekas pembukaan lahan mangrove.',
                'observed_condition' => 'mangrove_cut',
                'confidence_level' => 'high',
                'validation_point' => [
                    'type' => 'Point',
                    'coordinates' => [98.456789, 4.012345],
                ],
                'visited_at' => '2026-07-01T09:00:00Z',
                'is_geotagged' => true,
            ]
        );

        $validationId = $storeResponse->json('data.id');

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.hotspot_id', $hotspot->id)
            ->assertJsonPath('data.validation_status', 'validated')
            ->assertJsonPath('data.validator.id', $validator->id)
            ->assertJsonPath('data.validation_point.type', 'Point');

        $this->assertDatabaseHas('field_validations', [
            'id' => $validationId,
            'hotspot_id' => $hotspot->id,
            'validator_id' => $validator->id,
            'validation_status' => 'validated',
        ]);

        $hotspot->refresh();
        $this->assertSame('validated', $hotspot->validation_status);

        $this->actingAs($ngo)
            ->getJson("/api/v1/hotspots/{$hotspot->id}/field-validations")
            ->assertOk()
            ->assertJsonPath('data.0.id', $validationId)
            ->assertJsonPath('data.0.validator.id', $validator->id);

        $this->actingAs($validator)
            ->putJson("/api/v1/field-validations/{$validationId}", [
                'validation_status' => 'needs_recheck',
                'validation_note' => 'Perlu kunjungan ulang karena kondisi pasang.',
                'confidence_level' => 'medium',
            ])
            ->assertOk()
            ->assertJsonPath('data.validation_status', 'needs_recheck')
            ->assertJsonPath('data.confidence_level', 'medium');

        $hotspot->refresh();
        $this->assertSame('needs_recheck', $hotspot->validation_status);
    }

    public function test_invalid_field_validation_payload_is_rejected_with_422(): void
    {
        $validator = User::factory()->create()->assignRole('validator');
        $hotspot = Hotspot::factory()->create();

        $this->actingAs($validator)
            ->postJson("/api/v1/hotspots/{$hotspot->id}/field-validations", [
                'validation_status' => 'detected',
                'confidence_level' => 'certain',
                'validation_point' => [
                    'type' => 'Polygon',
                    'coordinates' => [],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Validasi gagal.');
    }

    public function test_other_validator_cannot_update_validation_owned_by_different_validator(): void
    {
        $owner = User::factory()->create()->assignRole('validator');
        $otherValidator = User::factory()->create()->assignRole('validator');
        $hotspot = Hotspot::factory()->create();
        $validation = FieldValidation::query()->create([
            'hotspot_id' => $hotspot->id,
            'validator_id' => $owner->id,
            'validation_status' => 'under_review',
            'validation_note' => 'Observasi awal.',
            'confidence_level' => 'low',
            'is_geotagged' => false,
            'sensitivity_level' => 'restricted',
        ]);

        $this->actingAs($otherValidator)
            ->putJson("/api/v1/field-validations/{$validation->id}", [
                'validation_status' => 'validated',
            ])
            ->assertForbidden();
    }
}
