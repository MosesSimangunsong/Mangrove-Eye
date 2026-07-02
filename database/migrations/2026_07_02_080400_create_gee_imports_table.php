<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gee_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_run_id')->constrained('analysis_runs')->cascadeOnDelete();
            $table->string('import_type', 50);
            $table->string('file_name', 255);
            $table->string('file_path', 255)->nullable();
            $table->text('source_url')->nullable();
            $table->string('gee_task_id', 150)->nullable();
            $table->string('status', 50)->default('uploaded');
            $table->unsignedInteger('total_features')->default(0);
            $table->text('error_message')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            $table->index('analysis_run_id', 'gee_imports_analysis_run_idx');
            $table->index('status', 'gee_imports_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gee_imports');
    }
};
