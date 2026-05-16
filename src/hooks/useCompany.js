import { useState, useEffect } from 'react';
import { isSuperAdmin } from '@/lib/isSuperAdmin';
import { supabaseApi } from "@/api/supabaseApi";

// company_id = ID do Salao do tenant — chave de isolamento multi-tenant
let cachedUser = null;

export function clearCompanyCache() {
    cachedUser = null;
}

/**
 * Carrega o Salao do tenant atual.
 * - Se o user logado é super admin E houver ?slug=<x> na URL → carrega o Salao com esse slug (impersonação).
 * - Caso contrário → carrega pelo owner_email do user logado.
 *
 * Retorna { user, salao, company_id, nome_salao, slug, cor_primaria, cor_secundaria, logo_url, loading, isImpersonating }.
 * company_id = salao.id (chave de isolamento multi-tenant).
 */
export function useCompany() {
    const [user, setUser] = useState(cachedUser);
    const [salao, setSalao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const u = cachedUser || await supabaseApi.auth.me();
                cachedUser = u;
                if (cancelled) return;
                setUser(u);

                const params = new URLSearchParams(window.location.search);
                const slugParam = params.get('slug');
                const superAdmin = await isSuperAdmin(u);

                let salaoRecord = null;

                if (superAdmin && slugParam) {
                    const [s] = await supabaseApi.entities.Salao.filter({ slug: slugParam }, '-created_date', 1).catch(() => []);
                    salaoRecord = s || null;
                    if (!cancelled) setIsImpersonating(true);
                } else {
                    const [s] = await supabaseApi.entities.Salao.filter({ owner_email: u.email }, '-created_date', 1).catch(() => []);
                    salaoRecord = s || null;
                    if (!cancelled) setIsImpersonating(false);
                }

                if (!cancelled) {
                    setSalao(salaoRecord);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    const company_id = salao?.id || null;
    const nome_salao = salao?.nome_salao || null;
    const slug = salao?.slug || null;
    const cor_primaria = salao?.cor_primaria || '#f43f5e';
    const cor_secundaria = salao?.cor_secundaria || '#fda4af';
    const logo_url = salao?.logo_url || null;

    return {
        user,
        salao,
        company_id,
        nome_salao,
        slug,
        cor_primaria,
        cor_secundaria,
        logo_url,
        loading,
        isImpersonating,
    };
}