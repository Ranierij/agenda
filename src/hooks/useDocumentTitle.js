import { useEffect } from 'react';

/**
 * Atualiza document.title enquanto o componente está montado e restaura ao desmontar.
 */
export function useDocumentTitle(title) {
    useEffect(() => {
        if (!title) return;
        const prev = document.title;
        document.title = title;
        return () => { document.title = prev; };
    }, [title]);
}