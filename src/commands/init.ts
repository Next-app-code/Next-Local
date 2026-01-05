import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Workflow } from '../types/workflow';
import { v4 as uuidv4 } from 'uuid';

interface InitOptions {
  name?: string;
}

export async function initConfig(options: InitOptions): Promise<void> {
  console.log(chalk.bold.white('\n╔══════════════════════════════════════════╗'));
  console.log(chalk.bold.white('║     Initialize New Workflow             ║'));
  console.log(chalk.bold.white('╚══════════════════════════════════════════╝\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Workflow name:',
      default: options.name || 'my-workflow',
      validate: (input: string) => input.trim().length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):',
    },
    {
      type: 'input',
      name: 'rpcEndpoint',
      message: 'Solana RPC endpoint:',
      default: 'https://api.mainnet-beta.solana.com',
    },
    {
      type: 'input',
      name: 'filename',
      message: 'Output filename:',
      default: (answers: { name: string }) => `${answers.name.toLowerCase().replace(/\s+/g, '-')}.json`,
    },
  ]);
  
  const workflow: Workflow = {
    id: uuidv4(),
    name: answers.name,
    description: answers.description || undefined,
    nodes: [],
    edges: [],
    rpcEndpoint: answers.rpcEndpoint,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const outputPath = path.resolve(answers.filename);
  
  if (await fs.pathExists(outputPath)) {
    const overwrite = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `File ${answers.filename} already exists. Overwrite?`,
        default: false,
      },
    ]);
    
    if (!overwrite.confirm) {
      console.log(chalk.yellow('\nAborted.'));
      return;
    }
  }
  
  await fs.writeJSON(outputPath, workflow, { spaces: 2 });
  
  console.log();
  console.log(chalk.green.bold('✓ Workflow created successfully!\n'));
  console.log(chalk.white(`📁 Location: ${chalk.cyan(outputPath)}\n`));
  console.log(chalk.bold.white('Next steps:\n'));
  console.log(chalk.gray('  1. ') + chalk.white('Edit in web:  ') + chalk.cyan('https://app.nextlabs.work'));
  console.log(chalk.gray('  2. ') + chalk.white('Add nodes and connect them visually'));
  console.log(chalk.gray('  3. ') + chalk.white('Export and run: ') + chalk.cyan(`next-local run ${answers.filename}`));
  console.log(chalk.gray('  4. ') + chalk.white('Or validate: ') + chalk.cyan(`next-local validate ${answers.filename}\n`));
}



