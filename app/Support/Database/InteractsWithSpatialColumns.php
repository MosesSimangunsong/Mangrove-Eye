<?php

namespace App\Support\Database;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

trait InteractsWithSpatialColumns
{
    protected function isPgsql(): bool
    {
        return Schema::getConnection()->getDriverName() === 'pgsql';
    }

    protected function addGeometryColumn(string $table, string $column, string $type, int $srid = 4326, bool $nullable = false): void
    {
        if (! $this->isPgsql()) {
            return;
        }

        DB::statement(sprintf(
            'ALTER TABLE %s ADD COLUMN %s geometry(%s, %d)%s',
            $table,
            $column,
            $type,
            $srid,
            $nullable ? '' : ' NOT NULL'
        ));
    }

    protected function addSpatialIndex(string $table, string $indexName, string $column): void
    {
        if (! $this->isPgsql()) {
            return;
        }

        DB::statement(sprintf(
            'CREATE INDEX %s ON %s USING GIST (%s)',
            $indexName,
            $table,
            $column
        ));
    }
}
