import React, { useState } from 'react';
import { Play, ShieldCheck, Cpu, Wallet, Send, Terminal as TermIcon, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Transaction {
  hash: string;
  block: number;
  type: 'DEPLOY' | 'MINT' | 'TRANSFER';
  details: string;
  status: 'pending' | 'confirmed';
}

export const Web3Simulator: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(100);
  const [contractBalance, setContractBalance] = useState(0);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'compiled' | 'deploying' | 'deployed'>('idle');
  const [gasPrice, setGasPrice] = useState<'low' | 'standard' | 'fast'>('standard');
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  
  // Wallet states
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('10');
  const [mintAmount, setMintAmount] = useState('50');
  
  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'System ready. Select a contract action to begin...',
    'Compiler Version: solc-v0.8.20+commit.a1b2c3d4'
  ]);
  const [blockHeight, setBlockHeight] = useState(12940251);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCompile = () => {
    if (status !== 'idle') return;
    setStatus('compiling');
    addLog('Starting solc compilation for SunnyToken.sol...');
    
    setTimeout(() => {
      addLog('Parser: AST generated successfully.');
    }, 400);

    setTimeout(() => {
      addLog('Optimizer: Runs configured to 200. EVM target: shanghai.');
    }, 800);

    setTimeout(() => {
      setStatus('compiled');
      addLog('Compilation SUCCESS: SunnyToken.json ABI & Bytecode built.');
    }, 1200);
  };

  const handleDeploy = () => {
    if (status !== 'compiled') return;
    setStatus('deploying');
    addLog(`Initiating deployment transaction with ${gasPrice} gas settings...`);

    const gasCost = gasPrice === 'low' ? 2 : gasPrice === 'standard' ? 5 : 12;
    if (walletBalance < gasCost) {
      addLog('TRANSACTION FAILED: Insufficient gas funds in wallet.');
      setStatus('compiled');
      return;
    }

    setTimeout(() => {
      const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const nextBlock = blockHeight + 1;
      
      setBlockHeight(nextBlock);
      setWalletBalance(prev => prev - gasCost);
      setContractAddress(mockAddress);
      setContractBalance(1000); // Initial supply minted on constructor
      setStatus('deployed');
      
      setTransactions(prev => [
        {
          hash: txHash,
          block: nextBlock,
          type: 'DEPLOY',
          details: `Contract deployed at: ${mockAddress.substring(0, 10)}... (Constructor: minted 1000 SUNNY)`,
          status: 'confirmed'
        },
        ...prev
      ]);
      
      addLog(`Mined Block #${nextBlock} | Transaction Hash: ${txHash.substring(0, 12)}...`);
      addLog(`SunnyToken deployed successfully at address: ${mockAddress}`);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#a855f7', '#06b6d4', '#ec4899']
      });
    }, 1500);
  };

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'deployed' || !contractAddress) return;
    
    const amount = parseInt(mintAmount);
    if (isNaN(amount) || amount <= 0) return;

    addLog(`Broadcasting mint transaction: mint ${amount} SUNNY...`);
    const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const nextBlock = blockHeight + 1;

    setTransactions(prev => [
      {
        hash: txHash,
        block: nextBlock,
        type: 'MINT',
        details: `Minted ${amount} SUNNY to Owner wallet`,
        status: 'pending'
      },
      ...prev
    ]);

    setTimeout(() => {
      setBlockHeight(nextBlock);
      setContractBalance(prev => prev + amount);
      setWalletBalance(prev => prev + amount); // Owner gets the minted token
      
      setTransactions(prev => 
        prev.map(tx => tx.hash === txHash ? { ...tx, status: 'confirmed' } : tx)
      );

      addLog(`Tx Confirmed! Block #${nextBlock} | Minted ${amount} SUNNY to Owner wallet.`);
    }, 1200);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'deployed' || !contractAddress) return;
    
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      addLog('TRANSACTION ERROR: Invalid Ethereum recipient address.');
      return;
    }
    if (walletBalance < amount) {
      addLog('TRANSACTION FAILED: Insufficient balance to transfer.');
      return;
    }

    addLog(`Initiating token transfer: ${amount} SUNNY to ${recipientAddress.substring(0, 8)}...`);
    const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const nextBlock = blockHeight + 1;

    setTransactions(prev => [
      {
        hash: txHash,
        block: nextBlock,
        type: 'TRANSFER',
        details: `Transferred ${amount} SUNNY to ${recipientAddress.substring(0, 10)}...`,
        status: 'pending'
      },
      ...prev
    ]);

    setTimeout(() => {
      setBlockHeight(nextBlock);
      setWalletBalance(prev => prev - amount);
      
      setTransactions(prev => 
        prev.map(tx => tx.hash === txHash ? { ...tx, status: 'confirmed' } : tx)
      );

      addLog(`Tx Confirmed! Block #${nextBlock} | Sent ${amount} SUNNY to ${recipientAddress.substring(0, 10)}...`);
    }, 1200);
  };

  const handleReset = () => {
    setStatus('idle');
    setWalletBalance(100);
    setContractBalance(0);
    setContractAddress(null);
    setTransactions([]);
    setTerminalLogs([
      'Playground reset successfully. Compile contract to start...',
      'Compiler Version: solc-v0.8.20+commit.a1b2c3d4'
    ]);
  };

  // Solidity code preview
  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SunnyToken {
    string public name = "SunnyToken";
    string public symbol = "SUNNY";
    uint256 public totalSupply;
    address public owner;
    
    mapping(address => uint256) public balanceOf;

    constructor() {
        owner = msg.sender;
        mint(msg.sender, 1000);
    }

    function mint(address to, uint256 value) public {
        require(msg.sender == owner, "Only owner");
        totalSupply += value;
        balanceOf[to] += value;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }
}`;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
      {/* Code Editor Panel - Col 5 */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-4 border-r border-white/5 pr-0 lg:pr-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-violet-400" />
                SunnyToken.sol
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono">Solidity Smart Contract Source</p>
            </div>
            
            {status === 'idle' && (
              <button
                onClick={handleCompile}
                className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-semibold cursor-pointer transition-all"
              >
                <Play size={12} />
                Compile
              </button>
            )}

            {status === 'compiling' && (
              <span className="text-xs text-violet-400 font-semibold animate-pulse flex items-center gap-1.5">
                <Cpu size={12} className="animate-spin" />
                Compiling...
              </span>
            )}

            {status !== 'idle' && status !== 'compiling' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                  Compiled
                </span>
                <button
                  onClick={handleReset}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Reset Playground"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}
          </div>
          
          <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed p-4 h-[280px] lg:h-[350px] overflow-y-auto scrollbar-thin text-zinc-400">
            <pre className="whitespace-pre">{solidityCode}</pre>
          </div>
        </div>
      </div>

      {/* Simulator Control Panel - Col 7 */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Solidity Compiler & VM Simulator</h4>
              <p className="text-[10px] text-zinc-500 font-mono">Test execution and transactions locally</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulated Ethereum EVM</span>
            </div>
          </div>

          {/* Compilation State Dashboard */}
          {status === 'compiled' && (
            <div className="p-4 rounded-xl bg-violet-600/5 border border-violet-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-zinc-200">Contract Bytecode Ready</span>
                <p className="text-[10px] text-zinc-500 mt-1">Configure gas price below to deploy your smart contract onto the simulator ledger.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={gasPrice}
                  onChange={(e: any) => setGasPrice(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-300 outline-none"
                >
                  <option value="low">Low (2 Gas)</option>
                  <option value="standard">Standard (5 Gas)</option>
                  <option value="fast">Fast (12 Gas)</option>
                </select>

                <button
                  onClick={handleDeploy}
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send size={12} />
                  Deploy
                </button>
              </div>
            </div>
          )}

          {status === 'deploying' && (
            <div className="p-5 text-center bg-zinc-950/40 rounded-xl border border-white/5 flex flex-col items-center gap-2">
              <Cpu size={24} className="text-violet-400 animate-spin" />
              <span className="text-xs font-mono text-zinc-400">Mining deployment transaction into blockchain...</span>
            </div>
          )}

          {/* Interactive Live Dashboard */}
          {status === 'deployed' && contractAddress && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wallet balances */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col justify-between gap-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Wallet size={13} className="text-cyan-400" />
                  EVM Account Balances
                </span>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Deployer (You):</span>
                    <span className="text-zinc-100 font-bold">{walletBalance} SUNNY</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Contract Supply:</span>
                    <span className="text-zinc-100 font-bold">{contractBalance} SUNNY</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono truncate mt-2">
                    Address: {contractAddress.substring(0, 16)}...
                  </div>
                </div>
              </div>

              {/* Transactions actions */}
              <div className="flex flex-col gap-3">
                {/* Transfer Action */}
                <form onSubmit={handleTransfer} className="flex gap-2">
                  <div className="flex flex-col gap-1.5 flex-grow">
                    <input
                      type="text"
                      placeholder="Recipient 0xAddress..."
                      required
                      value={recipientAddress}
                      onChange={e => setRecipientAddress(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-zinc-300 outline-none placeholder-zinc-600 focus:border-violet-500/50"
                    />
                    <input
                      type="number"
                      placeholder="SUNNY amount"
                      required
                      value={transferAmount}
                      onChange={e => setTransferAmount(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-zinc-300 outline-none placeholder-zinc-600 focus:border-violet-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center"
                    title="Transfer tokens"
                  >
                    <Send size={14} />
                  </button>
                </form>
                
                {/* Mint Action */}
                <form onSubmit={handleMint} className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mint amount"
                    required
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                    className="px-2.5 py-1.5 bg-zinc-950 border border-white/10 rounded-lg text-xs text-zinc-300 outline-none placeholder-zinc-600 focus:border-violet-500/50 flex-grow"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center whitespace-nowrap"
                  >
                    Mint (Owner)
                  </button>
                </form>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
              <Cpu size={32} className="text-zinc-600 animate-pulse" />
              <div>
                <span className="block text-xs font-bold text-zinc-400">Compile Contract to Start</span>
                <p className="text-[10px] text-zinc-500 mt-1">Use the Compile button on the Solidity file to load bytecode into the virtual environment.</p>
              </div>
            </div>
          )}

          {/* Terminal Console Logs */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <TermIcon size={12} className="text-violet-400" />
              Simulator VM Logs
            </span>
            <div className="rounded-xl bg-black border border-white/5 p-4 font-mono text-[10px] leading-relaxed text-zinc-400 h-[100px] overflow-y-auto scrollbar-thin">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={log.includes('SUCCESS') || log.includes('Confirmed') ? 'text-emerald-400' : log.includes('FAILED') || log.includes('ERROR') ? 'text-rose-400' : 'text-zinc-400'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Ledger Section */}
        {transactions.length > 0 && (
          <div className="border-t border-white/5 pt-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              Simulated Block Ledger (Mined Blocks)
            </span>
            
            <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto scrollbar-thin">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="px-3.5 py-2 bg-zinc-900/60 border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                    <span className="text-zinc-300 font-bold">{tx.type}</span>
                    <span className="text-zinc-500 truncate max-w-[220px] sm:max-w-none">{tx.details}</span>
                  </div>
                  
                  <div className="text-[10px] text-zinc-500 text-right flex flex-col shrink-0">
                    <span className="text-violet-400">Block #{tx.block}</span>
                    <span className="text-[9px] opacity-75">{tx.hash.substring(0, 10)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Web3Simulator;
