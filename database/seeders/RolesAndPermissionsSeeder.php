<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'view_public_dashboard',
            'view_internal_dashboard',
            'view_precise_coordinates',
            'manage_aoi',
            'manage_analysis_runs',
            'import_gee_result',
            'view_hotspot',
            'validate_hotspot',
            'view_validation',
            'export_report',
            'manage_users',
            'view_audit_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $roles = [
            'validator' => [
                'view_internal_dashboard',
                'view_precise_coordinates',
                'view_hotspot',
                'validate_hotspot',
                'view_validation',
            ],
            'ngo_advocate' => [
                'view_internal_dashboard',
                'view_precise_coordinates',
                'view_hotspot',
                'view_validation',
                'export_report',
            ],
            'admin' => [
                'view_internal_dashboard',
                'view_precise_coordinates',
                'manage_aoi',
                'manage_analysis_runs',
                'import_gee_result',
                'view_hotspot',
                'validate_hotspot',
                'view_validation',
                'export_report',
                'manage_users',
                'view_audit_logs',
            ],
            'super_admin' => $permissions,
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }
    }
}
