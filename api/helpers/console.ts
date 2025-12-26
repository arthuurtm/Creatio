/**
 * Helper para padronizar logs no console.
 * Exemplo de uso:
 *   log.info('Mensagem informativa');
 *   log.error('Mensagem de erro');
 *   log.success('Operação realizada com sucesso');
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <se trata de um log, então seus parâmetros são genéricos> */

const log = {
	info: (message: string, ...args: any[]) => {
		console.log(
			`\x1b[34m[INFO]\x1b[0m ${new Date().toISOString()} - ${message}`,
			...args,
		);
	},
	error: (message: string, ...args: any[]) => {
		console.error(
			`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${message}`,
			...args,
		);
	},
	warn: (message: string, ...args: any[]) => {
		console.warn(
			`\x1b[33m[WARN]\x1b[0m ${new Date().toISOString()} - ${message}`,
			...args,
		);
	},
	success: (message: string, ...args: any[]) => {
		console.log(
			`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString()} - ${message}`,
			...args,
		);
	},
};

export default log;
