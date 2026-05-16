import { supabaseApi } from "@/api/supabaseApi";

// Cache simples em memória do AppConfig
let _appConfigCache = null;
let _appConfigPromise = null;

async function loadAppConfig() {
    if (_appConfigCache) return _appConfigCache;
    if (_appConfigPromise) return _appConfigPromise;

    _appConfigPromise = supabaseApi.entities.AppConfig.list()
        .then((list) => {
            _appConfigCache = list?.[0] || null;
            return _appConfigCache;
        })
        .catch(() => null)
        .finally(() => {
            _appConfigPromise = null;
        });

    return _appConfigPromise;
}

export function clearAppConfigCache() {
    _appConfigCache = null;
    _appConfigPromise = null;
}

/**
 * Retorna true se o usuário é super admin.
 * Critério: user.role === 'admin' OU user.email está em AppConfig.super_admin_emails.
 */
export async function isSuperAdmin(user) {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const config = await loadAppConfig();
    const emails = config?.super_admin_emails || [];
    return emails.includes(user.email);
}