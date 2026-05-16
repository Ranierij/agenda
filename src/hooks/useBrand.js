import { useEffect } from 'react';

// Aplica as CSS variables da marca no :root dinamicamente
// Deve ser chamado no AppLayout para que todo o painel herde as cores
export function applyBrandVars(primary, secondary) {
    const root = document.documentElement;
    if (primary) {
        root.style.setProperty('--company-primary', primary);
        root.style.setProperty('--company-primary-rgb', hexToRgb(primary));
    } else {
        root.style.setProperty('--company-primary', '#f43f5e');
        root.style.setProperty('--company-primary-rgb', '244,63,94');
    }
    if (secondary) {
        root.style.setProperty('--company-secondary', secondary);
    } else {
        root.style.setProperty('--company-secondary', '#fda4af');
    }
}

export function useBrand(user) {
    useEffect(() => {
        if (!user) return;
        applyBrandVars(user.cor_primaria, user.cor_secundaria);
        return () => {
            // Reset ao sair do painel
            document.documentElement.style.removeProperty('--company-primary');
            document.documentElement.style.removeProperty('--company-primary-rgb');
            document.documentElement.style.removeProperty('--company-secondary');
        };
    }, [user?.cor_primaria, user?.cor_secundaria]);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}