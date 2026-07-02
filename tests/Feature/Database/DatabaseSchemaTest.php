<?php

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_mangrove_eye_core_tables_are_created(): void
    {
        $tables = [
            'roles',
            'permissions',
            'aoi_areas',
            'analysis_runs',
            'gee_imports',
            'satellite_layers',
            'hotspots',
            'field_validations',
            'validation_photos',
            'reports',
            'audit_logs',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Expected table [{$table}] to exist.");
        }
    }

    public function test_core_tables_have_expected_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('users', [
            'organization',
            'phone',
            'is_active',
            'last_login_at',
            'deleted_at',
        ]));

        $this->assertTrue(Schema::hasColumns('aoi_areas', [
            'code',
            'aoi_type',
            'verification_status',
            'sensitivity_level',
            'geom',
        ]));

        $this->assertTrue(Schema::hasColumns('analysis_runs', [
            'aoi_area_id',
            'before_start_date',
            'after_end_date',
            'threshold_params',
            'status',
        ]));

        $this->assertTrue(Schema::hasColumns('hotspots', [
            'hotspot_code',
            'analysis_run_id',
            'aoi_area_id',
            'centroid',
            'geom',
            'priority',
            'validation_status',
        ]));

        $this->assertTrue(Schema::hasColumns('field_validations', [
            'hotspot_id',
            'validator_id',
            'validation_point',
            'visited_at',
            'is_geotagged',
        ]));

        $this->assertTrue(Schema::hasColumns('reports', [
            'report_code',
            'report_type',
            'hotspot_id',
            'analysis_run_id',
            'disclaimer_text',
        ]));
    }
}
