export function getCompleteUrl(url, porta, uri) {
    console.log('Iniciando getCompleteUrl...');
    console.log('Parâmetros:', { url, porta, uri });

    // Verifica se window está disponível
    const protocol = (typeof window !== 'undefined' && window.location?.protocol.replace(':', '')) || 'http';
    console.log('Protocolo detectado:', protocol);

    const sanitizedUrl = url.replace(/:\d+$/, '');
    console.log('URL sanitizada:', sanitizedUrl);

    const baseUrl = sanitizedUrl.startsWith('http://') || sanitizedUrl.startsWith('https://')
        ? sanitizedUrl
        : `${protocol}://${sanitizedUrl}:${porta}`;
    
    const result = `${baseUrl}/${uri}`;
    console.log('URL completa:', result);

    return result;
}

export function getApiUrl(type, route) {
    const origin = window.location.origin;
    if (!type || !route) {
        console.error('Tipo ou rota não fornecidos.');
        return null;
    }
    switch(type) {
        case 'database':
            return `${origin}/api/database/${route}`;
        case 'email':
            return `${origin}/api/email/${route}`;
        case 'gameData':
            return `${origin}/api/gameData/${route}`;
        default:
            return null;
    }
}

export function hrefTo(url, args = {}) {
    const queryString = new URLSearchParams(args).toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    window.location.href = finalUrl;
}

export function openOverlayModal(modalData) {
    if (overlayInstance) {
        overlayInstance.openModal(modalData);
    } else {
        console.error('Overlay component is not registered.');
    }
};
