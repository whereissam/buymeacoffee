import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { useWeb3 } from '../hooks/useWeb3';

// Network configurations
const NETWORKS = {
  mainnet: {
    name: 'Base Mainnet',
    chainId: 8453,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || "0x98e6660178EB04D2de2687e7a61b082d81A5BFdf",
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org',
    description: 'Production network with real ETH'
  },
  testnet: {
    name: 'Base Sepolia',
    chainId: 84532,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_TESTNET || "0x98e6660178EB04D2de2687e7a61b082d81A5BFdf",
    explorerUrl: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org',
    description: 'Test network with free test ETH'
  }
} as const;

type NetworkType = keyof typeof NETWORKS;

const CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract GiveMeCoffee {
    address public owner;
    uint256 public totalDonations;
    
    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
    }
    
    Donation[] public donations;
    
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    
    event WithdrawalMade(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    receive() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: "",
            timestamp: block.timestamp
        }));
        
        emit DonationReceived(msg.sender, msg.value, "", block.timestamp);
    }
    
    function donate(string memory _message) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));
        
        emit DonationReceived(msg.sender, msg.value, _message, block.timestamp);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalMade(owner, balance, block.timestamp);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
    
    function getDonation(uint256 index) external view returns (
        address donor,
        uint256 amount,
        string memory message,
        uint256 timestamp
    ) {
        require(index < donations.length, "Donation index out of bounds");
        Donation memory donation = donations[index];
        return (donation.donor, donation.amount, donation.message, donation.timestamp);
    }
    
    function getRecentDonations(uint256 count) external view returns (
        address[] memory donors,
        uint256[] memory amounts,
        string[] memory messages,
        uint256[] memory timestamps
    ) {
        uint256 totalCount = donations.length;
        uint256 returnCount = count > totalCount ? totalCount : count;
        
        if (returnCount == 0) {
            return (new address[](0), new uint256[](0), new string[](0), new uint256[](0));
        }
        
        donors = new address[](returnCount);
        amounts = new uint256[](returnCount);
        messages = new string[](returnCount);
        timestamps = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 donationIndex = totalCount - 1 - i;
            Donation memory donation = donations[donationIndex];
            donors[i] = donation.donor;
            amounts[i] = donation.amount;
            messages[i] = donation.message;
            timestamps[i] = donation.timestamp;
        }
    }
}`;

const SECURITY_FEATURES = [
  {
    title: "🔒 Owner-Only Withdrawals",
    description: "Only the contract deployer can withdraw funds",
    code: "modifier onlyOwner()"
  },
  {
    title: "💰 Safe Fund Handling",
    description: "Uses secure withdrawal patterns and prevents reentrancy",
    code: "(bool success, ) = payable(owner).call{value: balance}(\"\");"
  },
  {
    title: "✅ Input Validation",
    description: "Requires donations to be greater than 0",
    code: "require(msg.value > 0, \"Donation must be greater than 0\");"
  },
  {
    title: "📊 Transparent Records",
    description: "All donations are publicly viewable on the blockchain",
    code: "Donation[] public donations;"
  }
];

const CONTRACT_FUNCTIONS = [
  {
    name: "donate(string message)",
    type: "payable",
    description: "Send ETH with a custom message",
    emoji: "☕"
  },
  {
    name: "withdraw()",
    type: "owner",
    description: "Owner can withdraw all donated funds",
    emoji: "💰"
  },
  {
    name: "getBalance()",
    type: "view",
    description: "Check current contract balance",
    emoji: "📊"
  },
  {
    name: "getRecentDonations()",
    type: "view",
    description: "Get list of recent donations",
    emoji: "📜"
  }
];

export const ContractPreview = () => {
  const { chainId, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'functions' | 'code'>('overview');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('testnet');

  // Get current network info
  const getCurrentNetwork = (): NetworkType | null => {
    if (!chainId) return null;
    if (chainId === NETWORKS.mainnet.chainId) return 'mainnet';
    if (chainId === NETWORKS.testnet.chainId) return 'testnet';
    return null;
  };
  
  const currentUserNetwork = getCurrentNetwork();
  const currentConfig = NETWORKS[selectedNetwork];

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
            ☕ GiveMeCoffee Smart Contract
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 px-4">
            A secure, transparent smart contract for receiving coffee donations on Base network.
            {selectedNetwork === 'testnet' 
              ? ' Currently viewing testnet version for safe testing with free test ETH.'
              : ' Currently viewing mainnet version for production use with real ETH.'
            }
          </p>
          
          {/* Network Status & User Info */}
          {isConnected && currentUserNetwork && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 mx-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-primary font-medium">
                  🔗 Connected to {NETWORKS[currentUserNetwork].name}
                </span>
                {currentUserNetwork !== selectedNetwork && (
                  <span className="text-muted-foreground">
                    (Viewing {currentConfig.name} contracts)
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Network Selector */}
          <div className="mb-6 flex justify-center px-4">
            <div className="bg-card border border-border rounded-lg p-1 flex gap-1 w-full max-w-md sm:w-auto">
              {Object.entries(NETWORKS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedNetwork(key as NetworkType)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    selectedNetwork === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="sm:hidden">{key === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 mb-6">
            <div className="bg-accent/20 border border-accent/40 rounded-lg px-4 py-3 sm:py-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-foreground block mb-1">Contract Address:</span>
              <div className="font-mono text-xs text-primary break-all">{currentConfig.contractAddress}</div>
            </div>
            <div className="bg-secondary/20 border border-secondary/40 rounded-lg px-4 py-3 sm:py-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-foreground block mb-1">Network:</span>
              <div className="text-sm text-foreground">{currentConfig.name}</div>
              <div className="text-xs text-muted-foreground">{currentConfig.description}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/coffee" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 sm:px-8 py-3 text-base sm:text-lg font-bold rounded-xl shadow-lg">
                ☕ Try the Coffee Widget
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.open(`${currentConfig.explorerUrl}/address/${currentConfig.contractAddress}`, '_blank')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-bold rounded-xl"
            >
              🔍 View on {selectedNetwork === 'mainnet' ? 'BaseScan' : 'BaseScan Testnet'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card border border-border rounded-2xl shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-wrap border-b border-border overflow-x-auto">
            {[
              { id: 'overview', label: '📋 Overview', emoji: '📋', shortLabel: 'Overview' },
              { id: 'security', label: '🔒 Security', emoji: '🔒', shortLabel: 'Security' },
              { id: 'functions', label: '⚙️ Functions', emoji: '⚙️', shortLabel: 'Functions' },
              { id: 'code', label: '📝 Source Code', emoji: '📝', shortLabel: 'Code' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.emoji} {tab.shortLabel}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    ☕ What is GiveMeCoffee?
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2 mb-4">
                    A simple, secure smart contract that allows supporters to send you cryptocurrency donations 
                    with personalized messages. Think of it as a decentralized tip jar for the Web3 era!
                  </p>
                  
                  {/* Network-specific info */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                    selectedNetwork === 'mainnet' 
                      ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                      : 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                  }`}>
                    <span className="text-lg">
                      {selectedNetwork === 'mainnet' ? '🟢' : '🟡'}
                    </span>
                    <span className="font-medium">
                      {selectedNetwork === 'mainnet' ? 'Production Ready' : 'Test Environment'}
                    </span>
                    <span className="text-xs opacity-75">
                      {selectedNetwork === 'mainnet' ? '• Real ETH' : '• Free Test ETH'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-muted border border-border rounded-xl p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">🎯 Key Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✅</span>
                        <div>
                          <strong>Instant Donations:</strong> Supporters can send ETH instantly
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✅</span>
                        <div>
                          <strong>Custom Messages:</strong> Each donation can include a personal message
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✅</span>
                        <div>
                          <strong>Full Control:</strong> You own the contract and can withdraw anytime
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✅</span>
                        <div>
                          <strong>Transparent:</strong> All donations are publicly visible
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">💰 How to Claim Donations</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <strong>Deploy Contract:</strong> You become the owner automatically
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <strong>Receive Donations:</strong> ETH accumulates in the contract
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <strong>Click "Collect Tips":</strong> Withdraws all ETH to your wallet
                        </div>
                      </div>
                      <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 mt-4">
                        <p className="text-sm text-foreground">
                          <strong>💡 Note:</strong> Only the contract deployer (owner) can withdraw funds. All donations go directly to your wallet address when you claim them.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted border border-border rounded-xl p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">💡 How It Works</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <strong>Deploy:</strong> Contract is already deployed on Base network
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <strong>Share:</strong> Share your coffee page with supporters
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <strong>Receive:</strong> Supporters send donations with messages
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                        <div>
                          <strong>Withdraw:</strong> You can withdraw funds anytime
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network Comparison */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center">🌐 Network Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 transition-all ${
                      selectedNetwork === 'testnet' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-border bg-muted'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🟡</span>
                        <h4 className="font-bold text-foreground">Base Sepolia (Testnet)</h4>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Free test ETH for experimentation</li>
                        <li>• Perfect for learning and development</li>
                        <li>• No real monetary value</li>
                        <li>• Faster for testing iterations</li>
                      </ul>
                    </div>

                    <div className={`p-4 rounded-lg border-2 transition-all ${
                      selectedNetwork === 'mainnet' 
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'border-border bg-muted'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🟢</span>
                        <h4 className="font-bold text-foreground">Base Mainnet (Production)</h4>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Real ETH with monetary value</li>
                        <li>• Production-ready for live donations</li>
                        <li>• Higher security standards</li>
                        <li>• Permanent transaction records</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-accent/20 border border-accent/40 rounded-lg">
                    <p className="text-sm text-foreground text-center">
                      💡 <strong>Recommendation:</strong> Start with Testnet to familiarize yourself, then switch to Mainnet for real donations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    🔒 Security Features
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
                    This contract has been designed with security best practices to protect your funds and ensure transparency.
                  </p>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  {SECURITY_FEATURES.map((feature, index) => (
                    <div key={index} className="bg-muted border border-border rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{feature.title.split(' ')[0]}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {feature.title.substring(2)}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {feature.description}
                          </p>
                          <div className="bg-background border border-border rounded-lg p-3 font-mono text-sm text-foreground overflow-x-auto">
                            {feature.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-accent/20 border border-accent/40 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">🛡️ Additional Security Notes</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Contract is verified and immutable once deployed</li>
                    <li>• No hidden functions or backdoors</li>
                    <li>• Uses Solidity 0.8.27 with built-in overflow protection</li>
                    <li>• Follows OpenZeppelin security patterns</li>
                    <li>• All transactions are recorded on-chain for transparency</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Functions Tab */}
            {activeTab === 'functions' && (
              <div className="space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    ⚙️ Contract Functions
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
                    Here are all the functions available in the GiveMeCoffee smart contract.
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {CONTRACT_FUNCTIONS.map((func, index) => (
                    <div key={index} className="bg-muted border border-border rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl">{func.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{func.name}</h3>
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            func.type === 'payable' ? 'bg-primary/20 text-primary-foreground' :
                            func.type === 'owner' ? 'bg-destructive/20 text-destructive-foreground' :
                            'bg-secondary/20 text-secondary-foreground'
                          }`}>
                            {func.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{func.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">💡 Function Types Explained</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-primary">Payable:</strong> Can receive ETH when called
                    </div>
                    <div>
                      <strong className="text-destructive">Owner:</strong> Only contract owner can call
                    </div>
                    <div>
                      <strong className="text-secondary">View:</strong> Read-only, no gas cost
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    📝 Smart Contract Source Code
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
                    Complete source code of the GiveMeCoffee smart contract. This is exactly what's deployed on Base network.
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted border-b border-border px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <span className="text-sm font-medium text-foreground">GiveMeCoffee.sol</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(CONTRACT_SOURCE)}
                      className="w-full sm:w-auto"
                    >
                      📋 Copy Code
                    </Button>
                  </div>
                  <div className="p-3 sm:p-6 overflow-x-auto">
                    <pre className="text-xs sm:text-sm text-foreground font-mono whitespace-pre-wrap">
                      {CONTRACT_SOURCE}
                    </pre>
                  </div>
                </div>

                <div className="bg-accent/20 border border-accent/40 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">🔍 Code Verification</h3>
                  <p className="text-muted-foreground mb-4">
                    You can verify this contract source code on BaseScan to ensure it matches exactly what's deployed.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`${currentConfig.explorerUrl}/address/${currentConfig.contractAddress}#code`, '_blank')}
                  >
                    🔍 Verify on {selectedNetwork === 'mainnet' ? 'BaseScan' : 'BaseScan Testnet'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Start Receiving Coffee Donations? ☕
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto px-2">
            The contract is already deployed and ready to use. Connect your wallet to start receiving donations!
          </p>
          <Link to="/coffee" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl shadow-lg">
              🚀 Start Using Contract
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};