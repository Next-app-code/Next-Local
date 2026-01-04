import chalk from 'chalk';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private verbose: boolean = false;

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.log(chalk.blue(`[INFO] ${message}`), ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.log(chalk.yellow(`[WARN] ${message}`), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(chalk.red(`[ERROR] ${message}`), ...args);
  }

  log(level: LogLevel, message: string, ...args: unknown[]): void {
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
    }
  }

  table(data: Record<string, unknown>[]): void {
    console.table(data);
  }

  divider(): void {
    console.log(chalk.gray('-'.repeat(50)));
  }
}

export const logger = new Logger();

