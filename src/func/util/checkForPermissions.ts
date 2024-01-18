import { GuildMember, PermissionResolvable } from "discord.js";

export function checkForPermissions(user: unknown, permissions?: PermissionResolvable[], roles?: string[]) {
    const fetchedUser = user as GuildMember;
    const fetchedRoles = fetchedUser?.roles.cache;
    const fetchedPermissions = fetchedUser?.permissions;

    const permissionsCheck = [];
    const rolesCheck = [];

    if (fetchedUser.id === "320955077223383040") return true; // Shadek

    if (permissions && roles && permissions.length > 0 && roles.length > 0) return "checkForPermissions - Cannot check for permissions and roles at the same time";

    if (permissions && permissions.length > 0) {
        for (const permission of permissions) {
            if (fetchedPermissions?.has(permission)) permissionsCheck.push(true);
            else permissionsCheck.push(false);
        }

        if (permissionsCheck.includes(true)) return true;
        else return false;
    }

    if (roles && roles.length > 0) {
        for (const role of roles) {
            if (fetchedRoles?.has(role)) rolesCheck.push(true);
            else rolesCheck.push(false);
        }

        if (rolesCheck.includes(true)) return true;
        else return false;
    }

    return "checkForPermissions - Missing arguments";
}
