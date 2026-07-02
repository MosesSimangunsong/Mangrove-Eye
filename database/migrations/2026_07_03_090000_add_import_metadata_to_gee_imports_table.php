<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gee_imports', function (Blueprint $table) {
            $table->json('metadata')->nullable()->after('error_message');
            $table->json('import_summary')->nullable()->after('metadata');
        });
    }

    public function down(): void
    {
        Schema::table('gee_imports', function (Blueprint $table) {
            $table->dropColumn(['metadata', 'import_summary']);
        });
    }
};
