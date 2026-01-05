export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    category: string;
    type: string;
    inputs: NodePort[];
    outputs: NodePort[];
    values: Record<string, unknown>;
    color: string;
  };
}

export interface NodePort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: string;
  required?: boolean;
  defaultValue?: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  rpcEndpoint: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionContext {
  rpcEndpoint: string;
  keypairPath?: string;
  dryRun: boolean;
  verbose: boolean;
  nodeResults: Map<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  results: Map<string, unknown>;
  errors: string[];
  duration: number;
}


