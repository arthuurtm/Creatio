export function getCompleteUrl(url, porta, uri) {
    const sanitizedUrl = url.replace(/:\d+$/, '');
    const baseUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `http://${sanitizedUrl}:${porta}`;
    return `${baseUrl}/${uri}`;
};

export function hrefTo(url) {
    window.location.href = url;
};

export function openOverlayModal(modalData) {
    if (overlayInstance) {
      overlayInstance.openModal(modalData);
    } else {
      console.error('Overlay component is not registered.');
    }
};
