import UAParser from 'ua-parser-js';

const parser = new UAParser();
const browser = parser.getBrowser();
const name = browser.name;
const version = parseInt(browser.version, 10);

if (
  (name === 'Chrome' && version < 90) ||
  (name === 'Firefox' && version < 85) ||
  (name === 'Safari' && version < 14) ||
  (name === 'IE' || 'UC Browser') 
) {
  alert(`Seu navegador (${name} ${version}) não é compatível. Por favor, atualize-o.`);
}

