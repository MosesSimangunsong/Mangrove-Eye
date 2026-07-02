<?php

namespace App\Services;

use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class SpatialService
{
    public function isPgsql(): bool
    {
        return Schema::getConnection()->getDriverName() === 'pgsql';
    }

    public function applyGeoJsonSelect(Builder|Relation $query, array $columns): Builder|Relation
    {
        if (! $this->isPgsql()) {
            return $query;
        }

        foreach ($columns as $column) {
            $query->selectRaw("ST_AsGeoJSON({$column}) as {$column}_geojson");
        }

        return $query;
    }

    public function persistGeometry(Model $model, string $column, ?array $geometry): void
    {
        if ($geometry === null) {
            return;
        }

        $value = $this->databaseValue($geometry);

        if (! $this->isPgsql()) {
            $model->forceFill([$column => $value])->save();

            return;
        }

        $table = $model->getTable();
        $idColumn = $model->getKeyName();

        DB::table($table)
            ->where($idColumn, $model->getKey())
            ->update([
                $column => $value,
            ]);

        $model->refresh();
    }

    public function databaseValue(?array $geometry): array|Expression|null
    {
        if ($geometry === null) {
            return null;
        }

        if (! $this->isPgsql()) {
            return $geometry;
        }

        $geometryJson = json_encode($geometry, JSON_THROW_ON_ERROR);

        if (! is_string($geometryJson)) {
            throw new InvalidArgumentException('Invalid geometry payload.');
        }

        $quotedGeometryJson = DB::connection()->getPdo()->quote($geometryJson);

        return DB::raw("ST_SetSRID(ST_GeomFromGeoJSON({$quotedGeometryJson}), 4326)");
    }

    public function geometryFromModel(Model $model, string $column): ?array
    {
        if ($this->isPgsql()) {
            $geoJson = $model->getAttribute("{$column}_geojson");

            return $geoJson ? json_decode($geoJson, true) : null;
        }

        $geometry = $model->getAttribute($column);

        return is_array($geometry) ? $geometry : null;
    }
}
