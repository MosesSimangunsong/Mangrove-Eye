<?php

use App\Support\Database\InteractsWithSpatialColumns;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use InteractsWithSpatialColumns;

    public function up(): void
    {
        $isPgsql = $this->isPgsql();

        Schema::create('hotspots', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->string('hotspot_code', 80)->unique();
            $table->foreignId('analysis_run_id')->constrained('analysis_runs')->cascadeOnDelete();
            $table->foreignId('aoi_area_id')->constrained('aoi_areas')->cascadeOnDelete();
            $table->foreignId('gee_import_id')->nullable()->constrained('gee_imports')->nullOnDelete();
            $table->timestamp('detected_at')->nullable();
            if (! $isPgsql) {
                $table->json('centroid');
                $table->json('geom')->nullable();
            }
            $table->decimal('area_ha', 12, 4)->nullable();
            $table->decimal('mvi_before', 10, 6)->nullable();
            $table->decimal('mvi_after', 10, 6)->nullable();
            $table->decimal('mvi_delta', 10, 6)->nullable();
            $table->decimal('cmri_before', 10, 6)->nullable();
            $table->decimal('cmri_after', 10, 6)->nullable();
            $table->decimal('cmri_delta', 10, 6)->nullable();
            $table->decimal('ndvi_before', 10, 6)->nullable();
            $table->decimal('ndvi_after', 10, 6)->nullable();
            $table->decimal('ndvi_delta', 10, 6)->nullable();
            $table->decimal('ndwi_before', 10, 6)->nullable();
            $table->decimal('ndwi_after', 10, 6)->nullable();
            $table->decimal('ndwi_delta', 10, 6)->nullable();
            $table->string('priority', 50)->default('medium');
            $table->string('validation_status', 50)->default('detected');
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->text('false_positive_reason')->nullable();
            $table->string('sensitivity_level', 50)->default('restricted');
            $table->json('properties')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('analysis_run_id', 'hotspots_analysis_run_idx');
            $table->index('aoi_area_id', 'hotspots_aoi_idx');
            $table->index('validation_status', 'hotspots_status_idx');
            $table->index('priority', 'hotspots_priority_idx');
            $table->index('detected_at', 'hotspots_detected_at_idx');
        });

        if ($isPgsql) {
            $this->addGeometryColumn('hotspots', 'centroid', 'Point');
            $this->addGeometryColumn('hotspots', 'geom', 'MultiPolygon', nullable: true);
            $this->addSpatialIndex('hotspots', 'hotspots_centroid_gix', 'centroid');
            $this->addSpatialIndex('hotspots', 'hotspots_geom_gix', 'geom');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('hotspots');
    }
};
