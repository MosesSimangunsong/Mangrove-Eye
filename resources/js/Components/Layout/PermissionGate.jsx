export function hasPermission(permissions = [], permission) {
    if (!permission) {
        return true;
    }

    return Array.isArray(permissions) && permissions.includes(permission);
}

export function hasAnyPermission(permissions = [], requiredPermissions = []) {
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    return requiredPermissions.some((permission) => hasPermission(permissions, permission));
}

export function hasRoute(name) {
    try {
        return route().has(name);
    } catch {
        return false;
    }
}

export function isCurrentRoute(name) {
    try {
        return route().current(name);
    } catch {
        return false;
    }
}
