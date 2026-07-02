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

        Schema::create('field_validations', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->foreignId('hotspot_id')->constrained('hotspots')->cascadeOnDelete();
            $table->foreignId('validator_id')->constrained('users')->cascadeOnDelete();
            $table->string('validation_status', 50);
            $table->text('validation_note')->nullable();
            $table->string('observed_condition', 100)->nullable();
            $table->string('confidence_level', 50)->nullable();
            if (! $isPgsql) {
                $table->json('validation_point')->nullable();
            }
            $table->timestamp('visited_at')->nullable();
            $table->boolean('is_geotagged')->default(false);
            $table->string('sensitivity_level', 50)->default('restricted');
            $table->timestamps();
            $table->softDeletes();

            $table->index('hotspot_id', 'field_validations_hotspot_idx');
            $table->index('validator_id', 'field_validations_validator_idx');
            $table->index('validation_status', 'field_validations_status_idx');
        });

        if ($isPgsql) {
            $this->addGeometryColumn('field_validations', 'validation_point', 'Point', nullable: true);
            $this->addSpatialIndex('field_validations', 'field_validations_point_gix', 'validation_point');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('field_validations');
    }
};
