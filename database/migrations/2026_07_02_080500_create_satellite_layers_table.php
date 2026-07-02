<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('satellite_layers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_run_id')->constrained('analysis_runs')->cascadeOnDelete();
            $table->string('layer_name', 150);
            $table->string('layer_type', 50);
            $table->string('period_type', 50);
            $table->string('storage_type', 50);
            $table->string('file_path', 255)->nullable();
            $table->text('tile_url')->nullable();
            $table->json('bbox')->nullable();
            $table->json('visualization_params')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('satellite_layers');
    }
};
