<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnalysisRun;
use App\Models\AoiArea;
use App\Models\FieldValidation;
use App\Models\Hotspot;
use App\Models\Report;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_generate_list_and_download_hotspot_report(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create()->assignRole('admin');
        $aoi = AoiArea::factory()->create(['created_by' => $admin->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $admin->id,
            'processed_at' => now(),
        ]);
        $hotspot = Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
        ]);
        FieldValidation::query()->create([
            'hotspot_id' => $hotspot->id,
            'validator_id' => $admin->id,
            'validation_status' => 'validated',
            'validation_note' => 'Validasi lapangan tersedia.',
            'confidence_level' => 'high',
            'is_geotagged' => true,
            'sensitivity_level' => 'restricted',
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/api/v1/hotspots/{$hotspot->id}/reports", [
                'title' => 'Laporan Hotspot MVP',
                'include_validation_photos' => false,
                'include_precise_coordinates' => true,
            ]);

        $reportId = $response->json('data.id');

        $response
            ->assertCreated()
            ->assertJsonPath('data.report_type', 'hotspot')
            ->assertJsonPath('data.hotspot_id', $hotspot->id)
            ->assertJsonMissingPath('data.file_path');

        $filePath = Report::query()->findOrFail($reportId)->file_path;
        Storage::disk('local')->assertExists($filePath);

        $this->actingAs($admin)
            ->getJson('/api/v1/reports')
            ->assertOk()
            ->assertJsonPath('data.0.id', $reportId);

        $this->actingAs($admin)
            ->get("/api/v1/reports/{$reportId}/download")
            ->assertOk();
    }

    public function test_user_without_export_permission_cannot_list_or_download_reports(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create()->assignRole('admin');
        $validator = User::factory()->create()->assignRole('validator');
        $aoi = AoiArea::factory()->create(['created_by' => $admin->id]);
        $analysisRun = AnalysisRun::factory()->create([
            'aoi_area_id' => $aoi->id,
            'created_by' => $admin->id,
        ]);
        $hotspot = Hotspot::factory()->create([
            'analysis_run_id' => $analysisRun->id,
            'aoi_area_id' => $aoi->id,
        ]);

        $report = Report::query()->create([
            'report_code' => 'RPT-HS-1-TEST',
            'report_type' => 'hotspot',
            'hotspot_id' => $hotspot->id,
            'analysis_run_id' => $analysisRun->id,
            'title' => 'Protected report',
            'summary' => 'Report terlindungi',
            'file_path' => 'reports/hotspots/protected.pdf',
            'generated_by' => $admin->id,
            'generated_at' => now(),
            'status' => 'generated',
            'sensitivity_level' => 'restricted',
            'disclaimer_text' => 'Internal only',
            'metadata' => [],
        ]);

        Storage::disk('local')->put($report->file_path, 'protected-pdf-content');

        $this->actingAs($validator)
            ->getJson('/api/v1/reports')
            ->assertForbidden();

        $this->actingAs($validator)
            ->get("/api/v1/reports/{$report->id}/download")
            ->assertForbidden();
    }
}
