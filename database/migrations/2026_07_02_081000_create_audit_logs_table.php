<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 120);
            $table->string('entity_type', 120);
            $table->string('entity_id', 80)->nullable();
            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('user_id', 'audit_logs_user_idx');
            $table->index(['entity_type', 'entity_id'], 'audit_logs_entity_idx');
            $table->index('action', 'audit_logs_action_idx');
            $table->index('created_at', 'audit_logs_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
