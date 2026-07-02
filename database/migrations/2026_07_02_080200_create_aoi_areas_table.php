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

        Schema::create('aoi_areas', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 150);
            $table->string('aoi_type', 50);
            $table->text('description')->nullable();
            $table->string('village', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('regency', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->decimal('estimated_area_ha', 12, 4)->nullable();
            $table->string('legal_status', 255)->nullable();
            $table->string('legal_reference', 255)->nullable();
            $table->string('source_type', 50)->nullable();
            $table->string('source_name', 150)->nullable();
            $table->string('source_file_path', 255)->nullable();
            $table->string('verification_status', 50)->default('draft');
            $table->string('sensitivity_level', 50)->default('internal');
            if (! $isPgsql) {
                $table->json('geom');
            }
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('aoi_type', 'aoi_areas_type_idx');
            $table->index('verification_status', 'aoi_areas_verification_idx');
        });

        if ($isPgsql) {
            $this->addGeometryColumn('aoi_areas', 'geom', 'MultiPolygon');
            $this->addSpatialIndex('aoi_areas', 'aoi_areas_geom_gix', 'geom');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('aoi_areas');
    }
};
