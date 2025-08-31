import chalk from "chalk";

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

export const consoleBuffer: string[] = [];
const MAX_BUFFER_SIZE = 1000;

function addToBuffer(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${formattedArgs}`;
    consoleBuffer.push(logEntry);
    
    if (consoleBuffer.length > MAX_BUFFER_SIZE) {
        consoleBuffer.shift();
    }
}

console.log = (...args) => {
    addToBuffer('log', ...args);
    originalLog(chalk.blue(...args.map(arg => typeof arg === 'string' ? arg : String(arg)))
    );
};

console.error = (...args) => {
    addToBuffer('error', ...args);
    originalError(chalk.red.bold('Error:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.red(arg) : chalk.red(String(arg)))
    );
};

console.warn = (...args) => {
    addToBuffer('warn', ...args);
    originalWarn(chalk.yellow.bold('Warning:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.yellow(arg) : chalk.yellow(String(arg)))
    );
};

console.info = (...args) => {
    addToBuffer('info', ...args);
    originalInfo(chalk.cyan.bold('Info:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.cyan(arg) : chalk.cyan(String(arg)))
    );
};

(console as any).success = (...args: any[]) => {
    addToBuffer('success', ...args);
    originalLog(chalk.green.bold('Success:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.green(arg) : chalk.green(String(arg)))
    );
};

export function getConsoleOutput(): string {
    return consoleBuffer.join('\n') || 'No console output captured yet';
}

export function clearConsoleBuffer(): void {
    consoleBuffer.length = 0;
}