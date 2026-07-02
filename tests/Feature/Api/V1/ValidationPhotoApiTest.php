<?php

namespace Tests\Feature\Api\V1;

use App\Models\FieldValidation;
use App\Models\Hotspot;
use App\Models\User;
use App\Models\ValidationPhoto;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ValidationPhotoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_validator_can_upload_and_list_validation_photos(): void
    {
        Storage::fake('local');

        $validator = User::factory()->create()->assignRole('validator');
        $ngo = User::factory()->create()->assignRole('ngo_advocate');
        $hotspot = Hotspot::factory()->create();
        $fieldValidation = FieldValidation::query()->create([
            'hotspot_id' => $hotspot->id,
            'validator_id' => $validator->id,
            'validation_status' => 'validated',
            'validation_note' => 'Validasi lapangan selesai.',
            'confidence_level' => 'high',
            'is_geotagged' => true,
            'sensitivity_level' => 'restricted',
        ]);

        $photo = UploadedFile::fake()->image('mangrove-proof.jpg')->size(1024);

        $response = $this->actingAs($validator)->post(
            "/api/v1/field-validations/{$fieldValidation->id}/photos",
            [
                'photo' => $photo,
                'caption' => 'Bekas pembukaan lahan terlihat jelas.',
                'taken_at' => '2026-07-02T10:00:00Z',
                'is_primary' => true,
                'photo_lat' => 4.012345,
                'photo_lng' => 98.456789,
            ],
            ['Accept' => 'application/json']
        );

        $validationPhotoId = $response->json('data.id');
        $storedPath = $response->json('data.stored_path');

        $response
            ->assertCreated()
            ->assertJsonPath('data.field_validation_id', $fieldValidation->id)
            ->assertJsonPath('data.original_filename', 'mangrove-proof.jpg')
            ->assertJsonPath('data.caption', 'Bekas pembukaan lahan terlihat jelas.')
            ->assertJsonPath('data.is_primary', true)
            ->assertJsonPath('data.photo_point.type', 'Point');

        Storage::disk('local')->assertExists($storedPath);

        $this->assertDatabaseHas('validation_photos', [
            'id' => $validationPhotoId,
            'field_validation_id' => $fieldValidation->id,
            'file_name' => 'mangrove-proof.jpg',
            'caption' => 'Bekas pembukaan lahan terlihat jelas.',
            'is_primary' => 1,
        ]);

        $this->actingAs($ngo)
            ->getJson("/api/v1/field-validations/{$fieldValidation->id}/photos")
            ->assertOk()
            ->assertJsonPath('data.0.id', $validationPhotoId);

        $this->actingAs($ngo)
            ->get("/api/v1/validation-photos/{$validationPhotoId}")
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg');
    }

    public function test_non_image_validation_photo_is_rejected_with_422(): void
    {
        Storage::fake('local');

        $validator = User::factory()->create()->assignRole('validator');
        $fieldValidation = FieldValidation::query()->create([
            'hotspot_id' => Hotspot::factory()->create()->id,
            'validator_id' => $validator->id,
            'validation_status' => 'under_review',
            'is_geotagged' => false,
            'sensitivity_level' => 'restricted',
        ]);

        $file = UploadedFile::fake()->createWithContent('not-image.txt', 'plain text');

        $this->actingAs($validator)->post(
            "/api/v1/field-validations/{$fieldValidation->id}/photos",
            ['photo' => $file],
            ['Accept' => 'application/json']
        )
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Validasi gagal.');
    }

    public function test_validation_photo_larger_than_five_mb_is_rejected(): void
    {
        Storage::fake('local');

        $validator = User::factory()->create()->assignRole('validator');
        $fieldValidation = FieldValidation::query()->create([
            'hotspot_id' => Hotspot::factory()->create()->id,
            'validator_id' => $validator->id,
            'validation_status' => 'under_review',
            'is_geotagged' => false,
            'sensitivity_level' => 'restricted',
        ]);

        $file = UploadedFile::fake()->image('too-large.jpg')->size(6000);

        $this->actingAs($validator)->post(
            "/api/v1/field-validations/{$fieldValidation->id}/photos",
            ['photo' => $file],
            ['Accept' => 'application/json']
        )
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Validasi gagal.');
    }

    public function test_owner_and_admin_can_delete_validation_photo_but_other_validator_cannot(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create()->assignRole('validator');
        $otherValidator = User::factory()->create()->assignRole('validator');
        $admin = User::factory()->create()->assignRole('admin');
        $fieldValidation = FieldValidation::query()->create([
            'hotspot_id' => Hotspot::factory()->create()->id,
            'validator_id' => $owner->id,
            'validation_status' => 'validated',
            'is_geotagged' => true,
            'sensitivity_level' => 'restricted',
        ]);

        $photo = ValidationPhoto::query()->create([
            'field_validation_id' => $fieldValidation->id,
            'file_path' => 'validation-photos/field-validations/'.$fieldValidation->id.'/proof.jpg',
            'file_name' => 'proof.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 102400,
            'caption' => 'Foto bukti',
            'is_primary' => true,
            'sensitivity_level' => 'restricted',
        ]);

        Storage::disk('local')->put($photo->file_path, 'image-content');

        $this->actingAs($otherValidator)
            ->deleteJson("/api/v1/validation-photos/{$photo->id}")
            ->assertForbidden();

        $this->actingAs($owner)
            ->deleteJson("/api/v1/validation-photos/{$photo->id}")
            ->assertOk();

        Storage::disk('local')->assertMissing($photo->file_path);
        $this->assertDatabaseMissing('validation_photos', ['id' => $photo->id]);

        $photoTwo = ValidationPhoto::query()->create([
            'field_validation_id' => $fieldValidation->id,
            'file_path' => 'validation-photos/field-validations/'.$fieldValidation->id.'/proof-2.jpg',
            'file_name' => 'proof-2.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 120400,
            'caption' => 'Foto bukti kedua',
            'is_primary' => true,
            'sensitivity_level' => 'restricted',
        ]);

        Storage::disk('local')->put($photoTwo->file_path, 'image-content-2');

        $this->actingAs($admin)
            ->deleteJson("/api/v1/validation-photos/{$photoTwo->id}")
            ->assertOk();

        Storage::disk('local')->assertMissing($photoTwo->file_path);
        $this->assertDatabaseMissing('validation_photos', ['id' => $photoTwo->id]);
    }

    public function test_guest_cannot_view_validation_photo_file(): void
    {
        Storage::fake('local');

        $validator = User::factory()->create()->assignRole('validator');
        $fieldValidation = FieldValidation::query()->create([
            'hotspot_id' => Hotspot::factory()->create()->id,
            'validator_id' => $validator->id,
            'validation_status' => 'validated',
            'is_geotagged' => true,
            'sensitivity_level' => 'restricted',
        ]);

        $photo = ValidationPhoto::query()->create([
            'field_validation_id' => $fieldValidation->id,
            'file_path' => 'validation-photos/field-validations/'.$fieldValidation->id.'/proof.jpg',
            'file_name' => 'proof.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 102400,
            'caption' => 'Foto bukti',
            'is_primary' => true,
            'sensitivity_level' => 'restricted',
        ]);

        Storage::disk('local')->put($photo->file_path, 'image-content');

        $this->get("/api/v1/validation-photos/{$photo->id}")
            ->assertUnauthorized();
    }
}
