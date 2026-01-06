import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';
import { Workflow } from '../types/workflow';
import { categoryInfo } from '../data/nodeDefinitions';

export async function showWorkflowInfo(filePath: string): Promise<void> {
  try {
    // Load workflow
    const absolutePath = path.resolve(filePath);
    if (!await fs.pathExists(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const workflow: Workflow = JSON.parse(content);
    
    // Header
    console.log(chalk.bold.white('\n╔══════════════════════════════════════════╗'));
    console.log(chalk.bold.white('║         Workflow Information            ║'));
    console.log(chalk.bold.white('╚══════════════════════════════════════════╝\n'));
    
    // Basic info table
    const infoTable = new Table({
      colWidths: [25, 55],
      style: { head: [], border: ['white'] },
      chars: {
        'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
        'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
        'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
        'right': '│', 'right-mid': '┤', 'middle': '│'
      }
    });
    
    infoTable.push(
      [chalk.gray('Name'), chalk.white(workflow.name || 'Unnamed')],
      [chalk.gray('Description'), chalk.white(workflow.description || 'No description')],
      [chalk.gray('ID'), chalk.gray(workflow.id)],
      [chalk.gray('RPC Endpoint'), chalk.cyan(workflow.rpcEndpoint || 'Not set')],
      [chalk.gray('Created'), chalk.gray(new Date(workflow.createdAt).toLocaleString())],
      [chalk.gray('Updated'), chalk.gray(new Date(workflow.updatedAt).toLocaleString())]
    );
    
    console.log(infoTable.toString());
    
    // Node statistics
    console.log(chalk.bold.white('\n📊 Node Statistics:\n'));
    
    const categoryCount: Record<string, number> = {};
    for (const node of workflow.nodes) {
      const cat = node.data.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
    
    const statsTable = new Table({
      head: [chalk.bold.white('Category'), chalk.bold.white('Count')],
      colWidths: [30, 15],
      style: { head: [], border: ['white'] }
    });
    
    for (const [cat, count] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
      const info = categoryInfo[cat];
      statsTable.push([
        chalk.hex(info?.color || '#888888')(info?.label || cat),
        chalk.white(count.toString())
      ]);
    }
    
    console.log(statsTable.toString());
    
    // Connection info
    console.log(chalk.bold.white('\n🔗 Connections:\n'));
    console.log(chalk.gray(`  Total Edges: ${workflow.edges.length}`));
    console.log(chalk.gray(`  Total Nodes: ${workflow.nodes.length}`));
    console.log(chalk.gray(`  Avg Connections per Node: ${(workflow.edges.length / Math.max(workflow.nodes.length, 1)).toFixed(2)}`));
    
    console.log();
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

