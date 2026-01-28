type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
    private isDev = (import.meta as any).env.DEV;

    private log(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const color = {
            DEBUG: '\x1b[36m',
            INFO: '\x1b[32m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m'
        }[level];

        if (this.isDev || level === 'ERROR' || level === 'WARN') {
            console.groupCollapsed(`%c[${level}] ${timestamp}: ${message}`, `color: ${color === '\x1b[31m' ? 'red' : 'inherit'}; font-weight: bold;`);
            if (data) console.log('Payload:', data);
            console.groupEnd();
        }
    }

    debug(msg: string, data?: any) { this.log('DEBUG', msg, data); }
    info(msg: string, data?: any) { this.log('INFO', msg, data); }
    warn(msg: string, data?: any) { this.log('WARN', msg, data); }
    error(msg: string, data?: any) { this.log('ERROR', msg, data); }
}

export const logger = new Logger();