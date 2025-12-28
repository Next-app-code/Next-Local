import { WorkflowNode, WorkflowEdge } from '../types/workflow';

export function buildExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  for (const node of nodes) {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  
  // Build graph
  for (const edge of edges) {
    const neighbors = graph.get(edge.source);
    if (neighbors) {
      neighbors.push(edge.target);
    }
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }
  
  // Topological sort using Kahn's algorithm
  const queue: string[] = [];
  const result: string[] = [];
  
  // Find nodes with no incoming edges
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    
    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains cycles - cannot determine execution order');
  }
  
  return result;
}

export function getNodeInputSources(
  nodeId: string,
  edges: WorkflowEdge[]
): Map<string, { nodeId: string; outputId: string }> {
  const sources = new Map<string, { nodeId: string; outputId: string }>();
  
  for (const edge of edges) {
    if (edge.target === nodeId && edge.targetHandle && edge.sourceHandle) {
      sources.set(edge.targetHandle, {
        nodeId: edge.source,
        outputId: edge.sourceHandle,
      });
    }
  }
  
  return sources;
}

