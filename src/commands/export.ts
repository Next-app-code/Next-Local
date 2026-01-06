import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { Workflow } from '../types/workflow';

interface ExportOptions {
  output?: string;
  pretty?: boolean;
}

export async function exportWorkflow(filePath: string, options: ExportOptions): Promise<void> {
  const spinner = ora('Loading workflow...').start();
  
  try {
    // Load workflow
    const absolutePath = path.resolve(filePath);
    if (!await fs.pathExists(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const workflow: Workflow = JSON.parse(content);
    
    spinner.succeed(`Loaded: ${workflow.name}`);
    
    // Determine output path
    const outputPath = options.output 
      ? path.resolve(options.output)
      : path.resolve(`${workflow.name.replace(/\s+/g, '_').toLowerCase()}_export.json`);
    
    // Export with or without formatting
    const exportData = {
      version: '1.0',
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      rpcEndpoint: workflow.rpcEndpoint,
      exportedAt: new Date().toISOString(),
    };
    
    const json = options.pretty 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);
    
    await fs.writeFile(outputPath, json, 'utf-8');
    
    const stats = await fs.stat(outputPath);
    
    console.log();
    console.log(chalk.green.bold('✓ Export successful!\n'));
    console.log(chalk.gray('Output:     ') + chalk.cyan(outputPath));
    console.log(chalk.gray('Size:       ') + chalk.white(`${(stats.size / 1024).toFixed(2)} KB`));
    console.log(chalk.gray('Nodes:      ') + chalk.white(workflow.nodes.length));
    console.log(chalk.gray('Edges:      ') + chalk.white(workflow.edges.length));
    console.log();
    
  } catch (error) {
    spinner.fail('Export failed');
    throw error;
  }
}

