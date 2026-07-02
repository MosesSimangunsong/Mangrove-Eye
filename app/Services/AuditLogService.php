<?php

namespace App\Services;

use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Facades\Schema;

class AuditLogService
{
    public function __construct(
        protected DatabaseManager $database,
    ) {
    }

    public function log(
        ?int $userId,
        string $action,
        string $entityType,
        string|int|null $entityId = null,
        ?string $description = null,
        array $oldValues = [],
        array $newValues = [],
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): bool {
        if (! Schema::hasTable('audit_logs')) {
            return false;
        }

        $this->database->table('audit_logs')->insert([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId !== null ? (string) $entityId : null,
            'description' => $description,
            'old_values' => $oldValues === [] ? null : json_encode($oldValues, JSON_THROW_ON_ERROR),
            'new_values' => $newValues === [] ? null : json_encode($newValues, JSON_THROW_ON_ERROR),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'created_at' => now(),
        ]);

        return true;
    }
}
