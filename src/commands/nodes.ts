import chalk from 'chalk';
import Table from 'cli-table3';
import { nodeDefinitions, categoryInfo } from '../data/nodeDefinitions';

interface NodesOptions {
  category?: string;
}

export function listNodes(options: NodesOptions): void {
  let nodes = nodeDefinitions;
  
  if (options.category) {
    const category = options.category.toLowerCase();
    nodes = nodes.filter(n => n.category === category);
    
    if (nodes.length === 0) {
      console.log(chalk.yellow(`\n⚠ No nodes found in category: ${options.category}\n`));
      console.log(chalk.gray('Available categories:'));
      Object.entries(categoryInfo).forEach(([key, info]) => {
        console.log(chalk.hex(info.color)(`  • ${info.label}`) + chalk.gray(` - ${info.description}`));
      });
      return;
    }
  }
  
  console.log(chalk.bold.white('\n╔══════════════════════════════════════════╗'));
  console.log(chalk.bold.white('║       NEXT - Available Nodes            ║'));
  console.log(chalk.bold.white('╚══════════════════════════════════════════╝\n'));
  
  // Group by category
  const grouped: Record<string, typeof nodeDefinitions> = {};
  for (const node of nodes) {
    if (!grouped[node.category]) {
      grouped[node.category] = [];
    }
    grouped[node.category].push(node);
  }
  
  for (const [category, categoryNodes] of Object.entries(grouped)) {
    const info = categoryInfo[category];
    
    console.log(chalk.hex(info?.color || '#888888').bold(`\n▶ ${info?.label || category.toUpperCase()}`));
    console.log(chalk.gray(`  ${info?.description || ''}\n`));
    
    const table = new Table({
      head: [
        chalk.white('Node'),
        chalk.white('Type'),
        chalk.white('Inputs'),
        chalk.white('Outputs')
      ],
      colWidths: [25, 25, 20, 20],
      style: {
        head: [],
        border: ['gray'],
      },
      chars: {
        'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
        'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
        'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
        'right': '│', 'right-mid': '┤', 'middle': '│'
      }
    });
    
    for (const node of categoryNodes) {
      table.push([
        chalk.white(node.label),
        chalk.gray(node.type),
        chalk.cyan(node.inputs.length.toString()),
        chalk.green(node.outputs.length.toString())
      ]);
    }
    
    console.log(table.toString());
  }
  
  console.log(chalk.bold.white(`\n📦 Total: ${nodes.length} nodes available\n`));
  
  if (!options.category) {
    console.log(chalk.gray('💡 Tip: Use --category to filter by category'));
    console.log(chalk.gray('   Example: next-local nodes --category rpc\n'));
  }
}



