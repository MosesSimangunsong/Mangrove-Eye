<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analysis_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aoi_area_id')->constrained('aoi_areas')->cascadeOnDelete();
            $table->string('name', 180);
            $table->text('description')->nullable();
            $table->string('dataset_name', 100)->default('Sentinel-2 Level-2A');
            $table->string('gee_collection_id', 150)->nullable();
            $table->date('before_start_date');
            $table->date('before_end_date');
            $table->date('after_start_date');
            $table->date('after_end_date');
            $table->decimal('cloud_threshold', 5, 2)->nullable();
            $table->json('primary_indices')->nullable();
            $table->json('supporting_indices')->nullable();
            $table->json('threshold_params')->nullable();
            $table->json('processing_params')->nullable();
            $table->unsignedInteger('total_hotspots')->default(0);
            $table->decimal('total_area_ha', 12, 4)->default(0);
            $table->string('status', 50)->default('draft');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('aoi_area_id', 'analysis_runs_aoi_idx');
            $table->index('status', 'analysis_runs_status_idx');
            $table->index(['before_start_date', 'after_end_date'], 'analysis_runs_before_after_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analysis_runs');
    }
};
