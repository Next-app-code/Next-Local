#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { runWorkflow } from './commands/run';
import { validateWorkflow } from './commands/validate';
import { listNodes } from './commands/nodes';
import { initConfig } from './commands/init';

// Display banner
console.log(
  chalk.white(
    figlet.textSync('NEXT', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
    })
  )
);
console.log(chalk.gray('  Solana Visual Workflow Execution - Local CLI\n'));
console.log(chalk.gray('  CA: HZ2vrUNo4xVfF85oVyodRLFG1WCnZCRGe3qBcAUZpump'));
console.log(chalk.gray('  https://app.nextlabs.work\n'));

const program = new Command();

program
  .name('next-local')
  .description(chalk.white('Execute Solana workflows from the command line'))
  .version('1.0.0', '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help information');

program
  .command('run <file>')
  .description('Execute a workflow from a JSON file')
  .option('-r, --rpc <endpoint>', 'Solana RPC endpoint')
  .option('-k, --keypair <path>', 'Path to keypair file')
  .option('-d, --dry-run', 'Simulate execution without sending transactions')
  .option('-v, --verbose', 'Show detailed execution logs')
  .action(async (file, options) => {
    try {
      await runWorkflow(file, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('validate <file>')
  .description('Validate a workflow file without executing')
  .action(async (file) => {
    try {
      await validateWorkflow(file);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('nodes')
  .description('List all available node types')
  .option('-c, --category <category>', 'Filter by category')
  .action((options) => {
    listNodes(options);
  });

program
  .command('init')
  .description('Initialize a new workflow configuration')
  .option('-n, --name <name>', 'Workflow name')
  .action(async (options) => {
    try {
      await initConfig(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();



