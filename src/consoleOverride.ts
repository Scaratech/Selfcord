import chalk from "chalk";

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = (...args) => {
    originalLog(chalk.blue(...args.map(arg => typeof arg === 'string' ? arg : String(arg)))
    );
};

console.error = (...args) => {
    originalError(chalk.red.bold('Error:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.red(arg) : chalk.red(String(arg)))
    );
};

console.warn = (...args) => {
    originalWarn(chalk.yellow.bold('Warning:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.yellow(arg) : chalk.yellow(String(arg)))
    );
};

console.info = (...args) => {
    originalInfo(chalk.cyan.bold('Info:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.cyan(arg) : chalk.cyan(String(arg)))
    );
};

(console as any).success = (...args: any[]) => {
    originalLog(chalk.green.bold('Success:'),
        ...args.map(arg => typeof arg === 'string' ? chalk.green(arg) : chalk.green(String(arg)))
    );
};