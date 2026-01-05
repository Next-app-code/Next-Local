import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ExecutionContext } from '../types/workflow';

type NodeExecutor = (
  inputs: Record<string, unknown>,
  context: ExecutionContext,
  connection: Connection
) => Promise<unknown>;

export const nodeExecutors: Record<string, NodeExecutor> = {
  // RPC Nodes
  'rpc-connection': async (inputs, context, connection) => {
    return { connection: true, endpoint: context.rpcEndpoint };
  },

  'get-balance': async (inputs, context, connection) => {
    const publicKey = new PublicKey(inputs.publicKey as string);
    const lamports = await connection.getBalance(publicKey);
    const balance = lamports / LAMPORTS_PER_SOL;
    return { balance, lamports };
  },

  'get-account-info': async (inputs, context, connection) => {
    const publicKey = new PublicKey(inputs.publicKey as string);
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      return { accountInfo: null, owner: null, lamports: 0 };
    }
    
    return {
      accountInfo: {
        executable: accountInfo.executable,
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        rentEpoch: accountInfo.rentEpoch,
      },
      owner: accountInfo.owner.toBase58(),
      lamports: accountInfo.lamports,
    };
  },

  'get-slot': async (inputs, context, connection) => {
    const slot = await connection.getSlot();
    return { slot };
  },

  'get-block-height': async (inputs, context, connection) => {
    const blockHeight = await connection.getBlockHeight();
    return { blockHeight };
  },

  'get-recent-blockhash': async (inputs, context, connection) => {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    return { blockhash, lastValidBlockHeight };
  },

  // Wallet Nodes
  'wallet-connect': async (inputs, context, connection) => {
    // In CLI mode, we return keypair info if available
    if (context.keypairPath) {
      return { publicKey: 'keypair-provided', connected: true };
    }
    return { publicKey: null, connected: false };
  },

  // Math Nodes
  'math-add': async (inputs) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    return { result: a + b };
  },

  'math-subtract': async (inputs) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    return { result: a - b };
  },

  'math-multiply': async (inputs) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    return { result: a * b };
  },

  'math-divide': async (inputs) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 1;
    if (b === 0) throw new Error('Division by zero');
    return { result: a / b };
  },

  'lamports-to-sol': async (inputs) => {
    const lamports = Number(inputs.lamports) || 0;
    return { sol: lamports / LAMPORTS_PER_SOL };
  },

  'sol-to-lamports': async (inputs) => {
    const sol = Number(inputs.sol) || 0;
    return { lamports: sol * LAMPORTS_PER_SOL };
  },

  // Logic Nodes
  'logic-compare': async (inputs) => {
    const a = inputs.a;
    const b = inputs.b;
    return {
      equal: a === b,
      greater: Number(a) > Number(b),
      less: Number(a) < Number(b),
    };
  },

  'logic-and': async (inputs) => {
    return { result: Boolean(inputs.a) && Boolean(inputs.b) };
  },

  'logic-or': async (inputs) => {
    return { result: Boolean(inputs.a) || Boolean(inputs.b) };
  },

  'logic-not': async (inputs) => {
    return { result: !Boolean(inputs.a) };
  },

  'logic-switch': async (inputs) => {
    return { result: inputs.condition ? inputs.trueValue : inputs.falseValue };
  },

  // Input Nodes
  'input-string': async (inputs) => {
    return { value: String(inputs.value || '') };
  },

  'input-number': async (inputs) => {
    return { value: Number(inputs.value) || 0 };
  },

  'input-publickey': async (inputs) => {
    const key = inputs.value as string;
    // Validate public key
    try {
      new PublicKey(key);
      return { publicKey: key };
    } catch {
      throw new Error('Invalid public key');
    }
  },

  'input-boolean': async (inputs) => {
    return { value: Boolean(inputs.value) };
  },

  // Output Nodes
  'output-display': async (inputs) => {
    console.log('Display:', inputs.value);
    return inputs.value;
  },

  'output-log': async (inputs) => {
    const label = inputs.label || 'Log';
    console.log(`${label}:`, inputs.value);
    return inputs.value;
  },

  // Utility Nodes
  'utility-delay': async (inputs) => {
    const ms = Number(inputs.ms) || 1000;
    await new Promise(resolve => setTimeout(resolve, ms));
    return { output: inputs.input };
  },

  'utility-json-parse': async (inputs) => {
    const json = inputs.json as string;
    return { object: JSON.parse(json) };
  },

  'utility-json-stringify': async (inputs) => {
    return { json: JSON.stringify(inputs.object) };
  },

  'utility-get-property': async (inputs) => {
    const obj = inputs.object as Record<string, unknown>;
    const key = inputs.key as string;
    return { value: obj?.[key] };
  },
};


