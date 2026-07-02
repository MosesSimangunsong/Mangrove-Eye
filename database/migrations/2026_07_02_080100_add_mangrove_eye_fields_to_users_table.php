<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('organization', 150)->nullable()->after('email');
            $table->string('phone', 30)->nullable()->after('organization');
            $table->boolean('is_active')->default(true)->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['organization', 'phone', 'is_active', 'last_login_at']);
        });
    }
};
