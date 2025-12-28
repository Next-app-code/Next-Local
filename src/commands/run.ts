import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Workflow, WorkflowNode, ExecutionContext } from '../types/workflow';
import { buildExecutionOrder } from '../utils/graph';
import { nodeExecutors } from '../executors';

interface RunOptions {
  rpc?: string;
  keypair?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export async function runWorkflow(filePath: string, options: RunOptions): Promise<void> {
  const spinner = ora('Loading workflow...').start();
  
  try {
    // Load and parse workflow
    const absolutePath = path.resolve(filePath);
    if (!await fs.pathExists(absolutePath)) {
      throw new Error(`Workflow file not found: ${absolutePath}`);
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const workflow: Workflow = JSON.parse(content);
    
    spinner.succeed(`Loaded workflow: ${workflow.name}`);
    
    // Determine RPC endpoint
    const rpcEndpoint = options.rpc || workflow.rpcEndpoint;
    if (!rpcEndpoint) {
      throw new Error('No RPC endpoint specified. Use --rpc flag or set in workflow.');
    }
    
    console.log(chalk.gray(`RPC: ${rpcEndpoint}`));
    console.log(chalk.gray(`Nodes: ${workflow.nodes.length}`));
    console.log(chalk.gray(`Edges: ${workflow.edges.length}`));
    console.log();
    
    // Create execution context
    const context: ExecutionContext = {
      rpcEndpoint,
      keypairPath: options.keypair,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      nodeResults: new Map(),
    };
    
    // Test connection
    spinner.start('Testing RPC connection...');
    const connection = new Connection(rpcEndpoint, 'confirmed');
    const slot = await connection.getSlot();
    spinner.succeed(`Connected to RPC (slot: ${slot})`);
    
    // Build execution order
    spinner.start('Building execution order...');
    const executionOrder = buildExecutionOrder(workflow.nodes, workflow.edges);
    spinner.succeed(`Execution order determined (${executionOrder.length} steps)`);
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n[DRY RUN] No transactions will be sent\n'));
    }
    
    // Execute nodes
    console.log(chalk.bold('\nExecuting workflow:\n'));
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    for (const nodeId of executionOrder) {
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      const nodeSpinner = ora({
        text: `${node.data.label}`,
        prefixText: `  ${chalk.gray(`[${successCount + errorCount + 1}/${executionOrder.length}]`)}`,
      }).start();
      
      try {
        const result = await executeNode(node, workflow, context, connection);
        context.nodeResults.set(nodeId, result);
        
        nodeSpinner.succeed(`${node.data.label}`);
        
        if (options.verbose && result !== undefined) {
          console.log(chalk.gray(`     Result: ${formatResult(result)}`));
        }
        
        successCount++;
      } catch (error) {
        nodeSpinner.fail(`${node.data.label}`);
        console.log(chalk.red(`     Error: ${error instanceof Error ? error.message : error}`));
        errorCount++;
        
        if (!options.dryRun) {
          throw new Error(`Workflow execution stopped due to error in node: ${node.data.label}`);
        }
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log();
    console.log(chalk.bold('Execution complete:'));
    console.log(chalk.green(`  Success: ${successCount}`));
    if (errorCount > 0) {
      console.log(chalk.red(`  Failed: ${errorCount}`));
    }
    console.log(chalk.gray(`  Duration: ${duration}ms`));
    
  } catch (error) {
    spinner.fail('Workflow execution failed');
    throw error;
  }
}

async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  context: ExecutionContext,
  connection: Connection
): Promise<unknown> {
  const nodeType = node.data.type;
  const executor = nodeExecutors[nodeType];
  
  if (!executor) {
    throw new Error(`No executor found for node type: ${nodeType}`);
  }
  
  // Gather inputs from connected nodes
  const inputs: Record<string, unknown> = { ...node.data.values };
  
  for (const edge of workflow.edges) {
    if (edge.target === node.id && edge.targetHandle && edge.sourceHandle) {
      const sourceResult = context.nodeResults.get(edge.source);
      if (sourceResult !== undefined) {
        // Map source output to target input
        if (typeof sourceResult === 'object' && sourceResult !== null) {
          const sourceOutput = (sourceResult as Record<string, unknown>)[edge.sourceHandle];
          if (sourceOutput !== undefined) {
            inputs[edge.targetHandle] = sourceOutput;
          }
        } else {
          inputs[edge.targetHandle] = sourceResult;
        }
      }
    }
  }
  
  return executor(inputs, context, connection);
}

function formatResult(result: unknown): string {
  if (result === null || result === undefined) {
    return 'null';
  }
  if (typeof result === 'object') {
    const str = JSON.stringify(result);
    return str.length > 80 ? str.slice(0, 77) + '...' : str;
  }
  return String(result);
}

