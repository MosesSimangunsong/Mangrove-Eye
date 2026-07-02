<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_code', 80)->unique();
            $table->string('report_type', 50);
            $table->foreignId('hotspot_id')->nullable()->constrained('hotspots')->nullOnDelete();
            $table->foreignId('analysis_run_id')->nullable()->constrained('analysis_runs')->nullOnDelete();
            $table->string('title', 200);
            $table->text('summary')->nullable();
            $table->string('file_path', 255);
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();
            $table->string('status', 50)->default('generated');
            $table->string('sensitivity_level', 50)->default('restricted');
            $table->text('disclaimer_text')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('hotspot_id', 'reports_hotspot_idx');
            $table->index('analysis_run_id', 'reports_analysis_run_idx');
            $table->index('generated_by', 'reports_generated_by_idx');
            $table->index('report_type', 'reports_type_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
