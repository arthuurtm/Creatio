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

export function appTheme(toggle = false) {
    // Obter tema salvo no localStorage
    const savedTheme = localStorage.getItem("data-theme");
    console.log('data-theme', localStorage.getItem("data-theme"));
    let currentTheme;
  
    if (savedTheme) {
      // Respeita o tema salvo
      currentTheme = savedTheme;
    } else {
      // Usa a preferência do sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      currentTheme = prefersDark ? "dark" : "light";
      // Salva o tema inicial no localStorage
      localStorage.setItem("data-theme", currentTheme);
    }
  
    // Alternar o tema se toggle for verdadeiro
    if (toggle) {
        console.log('toggle theme: ', currentTheme);
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem("data-theme", currentTheme);
    }
  
    // Aplicar o tema atual
    document.documentElement.setAttribute("data-theme", currentTheme);
  
    return currentTheme; // Retorna o tema atual aplicado
}

export function updateAppClass(appElement) {
    const isMobile = window.innerWidth <= 768;
  
    // Remove ambas as classes antes de aplicar a nova
    appElement.classList.remove('mobile', 'pc');
  
    if (isMobile) {
      appElement.classList.add('mobile');
    } else {
      appElement.classList.add('pc');
    }
}
  
export function observeResize(appElement) {
    // Atualiza a classe inicial
    updateAppClass(appElement);
  
    // Observa mudanças no tamanho da janela
    window.addEventListener('resize', () => updateAppClass(appElement));
}
  
  
  
  