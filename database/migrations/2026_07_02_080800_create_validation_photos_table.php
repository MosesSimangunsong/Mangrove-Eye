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

        Schema::create('validation_photos', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->foreignId('field_validation_id')->constrained('field_validations')->cascadeOnDelete();
            $table->string('file_path', 255);
            $table->string('file_name', 255);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            if (! $isPgsql) {
                $table->json('photo_point')->nullable();
            }
            $table->timestamp('taken_at')->nullable();
            $table->text('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->string('sensitivity_level', 50)->default('restricted');
            $table->timestamps();

            $table->index('field_validation_id', 'validation_photos_validation_idx');
        });

        if ($isPgsql) {
            $this->addGeometryColumn('validation_photos', 'photo_point', 'Point', nullable: true);
            $this->addSpatialIndex('validation_photos', 'validation_photos_point_gix', 'photo_point');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('validation_photos');
    }
};
