import inquirer from 'inquirer';
import chalk from 'chalk';
import { Connection } from '@solana/web3.js';
import ora from 'ora';

export async function interactiveMode(): Promise<void> {
  console.log(chalk.bold.white('\n╔══════════════════════════════════════════╗'));
  console.log(chalk.bold.white('║       Interactive Workflow Builder      ║'));
  console.log(chalk.bold.white('╚══════════════════════════════════════════╝\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🆕 Create new workflow', value: 'create' },
        { name: '▶️  Run existing workflow', value: 'run' },
        { name: '✓  Validate workflow', value: 'validate' },
        { name: 'ℹ️  View workflow info', value: 'info' },
        { name: '📋 List available nodes', value: 'nodes' },
        { name: '🧪 Test RPC connection', value: 'test-rpc' },
        { name: '🚪 Exit', value: 'exit' },
      ],
    },
  ]);

  switch (answers.action) {
    case 'test-rpc':
      await testRpcConnection();
      break;
    case 'exit':
      console.log(chalk.gray('\nGoodbye! 👋\n'));
      process.exit(0);
    default:
      console.log(chalk.yellow(`\n⚠ Command "${answers.action}" not yet implemented in interactive mode`));
      console.log(chalk.gray(`Use: next-local ${answers.action}\n`));
  }
}

async function testRpcConnection(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'endpoint',
      message: 'RPC Endpoint:',
      default: 'https://api.devnet.solana.com',
    },
  ]);

  const spinner = ora('Testing connection...').start();

  try {
    const connection = new Connection(answers.endpoint, 'confirmed');
    const slot = await connection.getSlot();
    const version = await connection.getVersion();
    const blockHeight = await connection.getBlockHeight();

    spinner.succeed('Connected successfully!\n');

    console.log(chalk.gray('Endpoint:     ') + chalk.cyan(answers.endpoint));
    console.log(chalk.gray('Current Slot: ') + chalk.white(slot));
    console.log(chalk.gray('Block Height: ') + chalk.white(blockHeight));
    console.log(chalk.gray('Version:      ') + chalk.white(version['solana-core']));
    console.log();
  } catch (error) {
    spinner.fail('Connection failed');
    console.log(chalk.red('\nError: ') + chalk.white(error instanceof Error ? error.message : 'Unknown error'));
    console.log();
  }
}

