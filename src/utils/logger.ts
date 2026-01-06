import chalk from 'chalk';

export class Logger {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  info(message: string) {
    console.log(chalk.blue('ℹ'), chalk.white(message));
  }

  success(message: string) {
    console.log(chalk.green('✓'), chalk.white(message));
  }

  error(message: string) {
    console.log(chalk.red('✗'), chalk.white(message));
  }

  warn(message: string) {
    console.log(chalk.yellow('⚠'), chalk.white(message));
  }

  debug(message: string, data?: any) {
    if (this.verbose) {
      console.log(chalk.gray('→'), chalk.gray(message));
      if (data !== undefined) {
        console.log(chalk.gray('  '), chalk.gray(JSON.stringify(data, null, 2)));
      }
    }
  }

  section(title: string) {
    console.log();
    console.log(chalk.bold.white(`▶ ${title}`));
    console.log();
  }

  box(title: string, content?: string[]) {
    const width = 50;
    console.log();
    console.log(chalk.white('┌' + '─'.repeat(width - 2) + '┐'));
    console.log(chalk.white('│') + chalk.bold.white(title.padEnd(width - 2)) + chalk.white('│'));
    
    if (content && content.length > 0) {
      console.log(chalk.white('├' + '─'.repeat(width - 2) + '┤'));
      content.forEach(line => {
        console.log(chalk.white('│') + chalk.gray(line.padEnd(width - 2)) + chalk.white('│'));
      });
    }
    
    console.log(chalk.white('└' + '─'.repeat(width - 2) + '┘'));
    console.log();
  }

  progress(current: number, total: number, message: string) {
    const percentage = Math.floor((current / total) * 100);
    const barLength = 30;
    const filled = Math.floor((current / total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    console.log(
      chalk.gray(`[${current}/${total}]`),
      chalk.white(bar),
      chalk.cyan(`${percentage}%`),
      chalk.gray(message)
    );
  }
}

export const logger = new Logger();
