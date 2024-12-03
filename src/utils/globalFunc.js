export function getCompleteUrl(url, porta, uri) {
    const sanitizedUrl = url.replace(/:\d+$/, '');
    const baseUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `http://${sanitizedUrl}:${porta}`;
    return `${baseUrl}/${uri}`;
};

export function hrefTo(url) {
    window.location.href = url;
};

export function emitOpenModal(title, message, action) {
    this.$emit('openModal', {
        title: `${title}`,
        message: `${message}`,
        action: `${action}`
    });
}
