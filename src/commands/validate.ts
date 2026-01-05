import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { Workflow } from '../types/workflow';
import { nodeDefinitions } from '../data/nodeDefinitions';
import { buildExecutionOrder } from '../utils/graph';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateWorkflow(filePath: string): Promise<void> {
  const spinner = ora('Validating workflow...').start();
  
  try {
    // Load file
    const absolutePath = path.resolve(filePath);
    if (!await fs.pathExists(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    
    // Parse JSON
    let workflow: Workflow;
    try {
      workflow = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON format');
    }
    
    // Validate structure
    const result = validateWorkflowStructure(workflow);
    
    if (result.valid) {
      spinner.succeed('Workflow is valid');
    } else {
      spinner.fail('Workflow validation failed');
    }
    
    // Print results
    console.log();
    
    const infoTable = new Table({
      head: [chalk.bold.white('Property'), chalk.bold.white('Value')],
      colWidths: [20, 50],
      style: { head: [], border: ['white'] }
    });
    
    infoTable.push(
      [chalk.gray('Workflow Name'), chalk.white(workflow.name || 'Unnamed')],
      [chalk.gray('Total Nodes'), chalk.white(workflow.nodes?.length || 0)],
      [chalk.gray('Total Edges'), chalk.white(workflow.edges?.length || 0)],
      [chalk.gray('RPC Endpoint'), chalk.cyan(workflow.rpcEndpoint || 'Not set')],
      [chalk.gray('Status'), result.valid ? chalk.green('✓ Valid') : chalk.red('✗ Invalid')]
    );
    
    console.log(infoTable.toString());
    console.log();
    
    if (result.errors.length > 0) {
      console.log(chalk.red.bold('❌ Errors:\n'));
      result.errors.forEach((error, i) => {
        console.log(chalk.red(`  ${i + 1}. ${error}`));
      });
      console.log();
    }
    
    if (result.warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠  Warnings:\n'));
      result.warnings.forEach((warning, i) => {
        console.log(chalk.yellow(`  ${i + 1}. ${warning}`));
      });
      console.log();
    }
    
    if (result.valid) {
      console.log(chalk.green.bold('✓ Workflow is ready to execute!\n'));
    } else {
      console.log(chalk.red.bold('✗ Please fix the errors before running.\n'));
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail('Validation failed');
    throw error;
  }
}

function validateWorkflowStructure(workflow: Workflow): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!workflow.nodes) {
    errors.push('Missing "nodes" array');
  }
  if (!workflow.edges) {
    errors.push('Missing "edges" array');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }
  
  // Check nodes
  const nodeIds = new Set<string>();
  const validNodeTypes = new Set(nodeDefinitions.map(n => n.type));
  
  for (const node of workflow.nodes) {
    // Check for duplicate IDs
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIds.add(node.id);
    
    // Check node type
    if (!node.data?.type) {
      errors.push(`Node ${node.id} is missing type`);
    } else if (!validNodeTypes.has(node.data.type)) {
      errors.push(`Unknown node type: ${node.data.type} (node: ${node.id})`);
    }
    
    // Check position
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      warnings.push(`Node ${node.id} has invalid position`);
    }
  }
  
  // Check edges
  const edgeIds = new Set<string>();
  
  for (const edge of workflow.edges) {
    // Check for duplicate IDs
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);
    
    // Check source exists
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source: ${edge.source}`);
    }
    
    // Check target exists
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target: ${edge.target}`);
    }
  }
  
  // Check for cycles
  try {
    buildExecutionOrder(workflow.nodes, workflow.edges);
  } catch {
    errors.push('Workflow contains cycles');
  }
  
  // Check RPC endpoint
  if (!workflow.rpcEndpoint) {
    warnings.push('No RPC endpoint specified in workflow');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}



