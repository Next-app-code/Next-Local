import chalk from 'chalk';
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
      console.log(chalk.yellow(`No nodes found in category: ${options.category}`));
      console.log(chalk.gray('Available categories: ' + Object.keys(categoryInfo).join(', ')));
      return;
    }
  }
  
  console.log(chalk.bold('\nAvailable Nodes:\n'));
  
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
    console.log(chalk.hex(info?.color || '#888888').bold(`  ${info?.label || category}`));
    console.log(chalk.gray(`  ${info?.description || ''}`));
    console.log();
    
    for (const node of categoryNodes) {
      console.log(`    ${chalk.white(node.label)}`);
      console.log(chalk.gray(`    Type: ${node.type}`));
      console.log(chalk.gray(`    ${node.description}`));
      
      if (node.inputs.length > 0) {
        console.log(chalk.gray(`    Inputs: ${node.inputs.map(i => i.name).join(', ')}`));
      }
      if (node.outputs.length > 0) {
        console.log(chalk.gray(`    Outputs: ${node.outputs.map(o => o.name).join(', ')}`));
      }
      console.log();
    }
  }
  
  console.log(chalk.gray(`Total: ${nodes.length} nodes`));
}

