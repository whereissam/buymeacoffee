import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { ethers } from 'ethers';
import { ContractDeployer, DeploymentResult, DeploymentConfig } from '../utils/contractDeployer';

interface WidgetConfig {
  title: string;
  description: string;
  creatorName: string;
  website: string;
  theme: 'coffee' | 'modern' | 'minimal' | 'fun';
  primaryColor: string;
  amounts: Array<{value: string, label: string, emoji: string}>;
  features: {
    soundscape: boolean;
    achievements: boolean;
    customMessages: boolean;
    animations: boolean;
  };
}

const DEFAULT_AMOUNTS = [
  { value: "0.001", label: "Small Coffee", emoji: "☕" },
  { value: "0.003", label: "Medium Coffee", emoji: "☕☕" },
  { value: "0.005", label: "Large Coffee", emoji: "☕☕☕" },
  { value: "0.01", label: "Coffee & Snack", emoji: "🍰" }
];

const THEMES = {
  coffee: {
    name: "☕ Coffee Shop",
    colors: "from-amber-400 to-orange-500",
    description: "Warm, cozy coffee shop vibes"
  },
  modern: {
    name: "🎨 Modern",
    colors: "from-blue-500 to-purple-600",
    description: "Clean, professional design"
  },  
  minimal: {
    name: "⚪ Minimal",
    colors: "from-gray-600 to-gray-800",
    description: "Simple, elegant interface"
  },
  fun: {
    name: "🎉 Fun & Colorful",
    colors: "from-pink-500 to-yellow-500",
    description: "Bright, playful experience"
  }
};

export const WidgetFactory = () => {
  const { isConnected, connectWallet, signer, userAddress, network, isCorrectNetwork, switchToBase, disconnect } = useWeb3();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [deploymentCost, setDeploymentCost] = useState<string>('0.001');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    title: "Buy Me a Coffee! ☕",
    description: "Support my work with a coffee!",
    creatorName: "",
    website: "",
    theme: 'coffee',
    primaryColor: "#F59E0B",
    amounts: DEFAULT_AMOUNTS,
    features: {
      soundscape: true,
      achievements: true,
      customMessages: true,
      animations: true
    }
  });

  const totalSteps = 4;

  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem('coffeeWidgetProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setWidgetConfig(parsed.widgetConfig || widgetConfig);
        if (parsed.deploymentResult) {
          setDeploymentResult(parsed.deploymentResult);
        }
        return parsed.currentStep || 1;
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
    return 1;
  };

  // Save progress to localStorage
  const saveProgress = (step: number, config: WidgetConfig, result?: DeploymentResult) => {
    try {
      const progressData = {
        currentStep: step,
        widgetConfig: config,
        deploymentResult: result,
        timestamp: Date.now()
      };
      localStorage.setItem('coffeeWidgetProgress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Update step and save progress
  const updateStep = (step: number) => {
    setCurrentStep(step);
    const stepNames = ['', 'setup', 'customize', 'deploy', 'launch'];
    navigate({ to: `/factory/${stepNames[step]}` });
    saveProgress(step, widgetConfig, deploymentResult);
  };

  const getNetworkName = (chainId: bigint | undefined): string => {
    if (!chainId) return 'Unknown';
    switch (Number(chainId)) {
      case 8453: return 'Base Mainnet';
      case 84532: return 'Base Sepolia';
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia';
      case 137: return 'Polygon';
      default: return `Chain ${chainId}`;
    }
  };

  // Initialize step from URL or saved progress
  useEffect(() => {
    const stepNames = ['', 'setup', 'customize', 'deploy', 'launch'];
    const stepName = params.step as string;
    const urlStep = stepNames.indexOf(stepName);
    const savedStep = loadSavedProgress();
    
    if (urlStep >= 1 && urlStep <= totalSteps) {
      setCurrentStep(urlStep);
      saveProgress(urlStep, widgetConfig, deploymentResult);
    } else {
      setCurrentStep(savedStep);
      const savedStepName = stepNames[savedStep];
      navigate({ to: `/factory/${savedStepName}` });
    }
  }, [params.step]);

  // Save progress whenever widgetConfig changes
  useEffect(() => {
    saveProgress(currentStep, widgetConfig, deploymentResult);
  }, [widgetConfig]);

  const deployContract = async () => {
    if (!signer) return;

    try {
      setIsDeploying(true);
      
      // Validate network first
      const isValidNetwork = await ContractDeployer.validateNetwork(signer);
      if (!isValidNetwork) {
        throw new Error('Please switch to Base Sepolia network');
      }
      
      // Prepare deployment configuration
      const deploymentConfig: DeploymentConfig = {
        creatorName: widgetConfig.creatorName,
        title: widgetConfig.title,
        description: widgetConfig.description,
        website: widgetConfig.website
      };
      
      // Deploy the contract
      const deployer = new ContractDeployer(signer);
      const result = await deployer.deployGiveMeCoffeeContract(deploymentConfig);
      
      setDeploymentResult(result);
      
      // Show success notification
      alert('🎉 Deployment successful! Your coffee shop is now live on Base blockchain!');
      
      // Save deployment result and move to final step
      saveProgress(4, widgetConfig, result);
      updateStep(4);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // Load deployment cost estimate when signer is available
  useEffect(() => {
    if (signer) {
      ContractDeployer.estimateDeploymentCost(signer).then(setDeploymentCost);
    }
  }, [signer]);

  const generateEmbedCode = () => {
    if (!deploymentResult) return '';
    
    const embedCode = `<!-- Give Me Coffee Widget -->
<div id="give-me-coffee-widget"></div>
<script>
  window.coffeeWidgetConfig = {
    contractAddress: "${deploymentResult.contractAddress}",
    title: "${widgetConfig.title}",
    theme: "${widgetConfig.theme}",
    features: ${JSON.stringify(widgetConfig.features)}
  };
</script>
<script src="https://your-domain.com/widget.js"></script>`;

    return embedCode;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    alert('Embed code copied to clipboard!');
  };

  const clearProgress = () => {
    if (confirm('Are you sure you want to clear all progress and start over?')) {
      localStorage.removeItem('coffeeWidgetProgress');
      setWidgetConfig({
        title: "Buy Me a Coffee! ☕",
        description: "Support my work with a coffee!",
        creatorName: "",
        website: "",
        theme: 'coffee',
        primaryColor: "#F59E0B",
        amounts: DEFAULT_AMOUNTS,
        features: {
          soundscape: true,
          achievements: true,
          customMessages: true,
          animations: true
        }
      });
      setDeploymentResult(null);
      updateStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-3">
            ☕ Coffee Widget Factory
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your own "Buy Me Coffee" widget in minutes! No coding required. ✨
          </p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1 rounded-lg">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span className="text-muted-foreground">Progress auto-saved</span>
            </div>
            <button
              onClick={clearProgress}
              className="text-muted-foreground hover:text-destructive underline transition-colors cursor-pointer"
            >
              Clear progress
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-border text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-3 px-2">
            <span className="font-medium">Setup</span>
            <span className="font-medium">Customize</span>
            <span className="font-medium">Deploy</span>
            <span className="font-medium">Launch</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-lg overflow-hidden mb-8">
          
          {/* Step 1: Basic Setup */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-2">🎯 Basic Setup</h2>
                <p className="text-muted-foreground">Tell us about your coffee shop</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    value={widgetConfig.title}
                    onChange={(e) => setWidgetConfig({...widgetConfig, title: e.target.value})}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring transition-all bg-input text-foreground"
                    placeholder="Buy Me a Coffee! ☕"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={widgetConfig.description}
                    onChange={(e) => setWidgetConfig({...widgetConfig, description: e.target.value})}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring transition-all resize-none bg-input text-foreground"
                    rows={3}
                    placeholder="Support my work with a coffee!"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={widgetConfig.creatorName}
                      onChange={(e) => setWidgetConfig({...widgetConfig, creatorName: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring transition-all bg-input text-foreground"
                      placeholder="Creator Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Website <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={widgetConfig.website}
                      onChange={(e) => setWidgetConfig({...widgetConfig, website: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring transition-all bg-input text-foreground"
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => updateStep(2)}
                    className="w-full bg-primary hover:bg-accent text-primary-foreground py-4 text-lg font-semibold rounded-lg shadow-md border border-border"
                  >
                    Continue to Customization →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customize */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-2">🎨 Customize Your Widget</h2>
                <p className="text-muted-foreground">Make it uniquely yours</p>
              </div>
              
              <div className="space-y-8">
                
                {/* Theme Selection */}
                <div>
                  <label className="block text-lg font-semibold text-foreground mb-4">
                    Choose Theme
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Theme clicked:', key);
                          setWidgetConfig({...widgetConfig, theme: key as any});
                        }}
                        className={`group p-4 rounded-lg text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring border hover:scale-[1.02] active:scale-[0.98] ${
                          widgetConfig.theme === key
                            ? 'bg-secondary border-primary shadow-inner'
                            : 'bg-card border-border hover:shadow-md'
                        }`}
                      >
                        <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${theme.colors} mb-3 shadow-sm pointer-events-none`}></div>
                        <div className="font-semibold text-foreground pointer-events-none">{theme.name}</div>
                        <div className="text-sm text-muted-foreground pointer-events-none">{theme.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-lg font-semibold text-foreground mb-4">
                    Widget Features
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(widgetConfig.features).map(([key, enabled]) => (
                      <label 
                        key={key} 
                        className={`flex items-start p-5 rounded-lg cursor-pointer transition-all duration-200 border ${
                          enabled 
                            ? 'bg-primary/5 border-primary shadow-inner' 
                            : 'bg-secondary border-border hover:shadow-md'
                        }`}
                      >
                        <Checkbox
                          checked={enabled}
                          onCheckedChange={(checked) => setWidgetConfig({
                            ...widgetConfig,
                            features: {...widgetConfig.features, [key]: checked === true}
                          })}
                          className="mr-4 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className={`font-semibold capitalize text-lg mb-1 ${enabled ? 'text-primary' : 'text-foreground'}`}>
                            {key.replace(/([A-Z])/g, ' $1')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {key === 'soundscape' && 'Coffee shop background sounds'}
                            {key === 'achievements' && 'Donation milestone badges'}
                            {key === 'customMessages' && 'Message customization tools'}
                            {key === 'animations' && 'Fun animations and effects'}
                          </div>
                          <div className={`text-xs mt-2 font-medium ${enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                            {enabled ? '✓ Enabled' : 'Click to enable'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button
                    onClick={() => updateStep(1)}
                    variant="outline"
                    className="flex-1 py-3 rounded-lg text-foreground shadow-md bg-card border border-border"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => updateStep(3)}
                    className="flex-1 bg-primary hover:bg-accent text-primary-foreground py-3 rounded-lg shadow-md border border-border"
                  >
                    Continue to Deploy →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Deploy */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-2">🚀 Deploy Your Coffee Shop</h2>
                <p className="text-muted-foreground">Launch your smart contract on Base blockchain</p>
              </div>
              
              {!isConnected ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 rounded-xl p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-primary/30 border border-primary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔗</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Connect Your Wallet</h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      Connect your wallet to deploy your coffee shop smart contract on Base network.
                    </p>
                    <Button
                      onClick={connectWallet}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium shadow-lg"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  {isCorrectNetwork ? (
                    <>
                      {/* Ready to Deploy Card */}
                      <div className="bg-gradient-to-br from-accent/25 to-primary/15 border-2 border-accent/40 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-accent/40 border border-accent/60 rounded-full flex items-center justify-center">
                            <span className="text-xl">✅</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">Ready to Deploy!</h3>
                            <p className="text-muted-foreground text-sm">
                              Your contract will be deployed to {getNetworkName(network?.chainId)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Connection Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          <div className="bg-card border-2 border-border rounded-lg p-4 text-center shadow-sm relative group">
                            <div className="text-primary font-semibold text-sm mb-1">Wallet</div>
                            <div className="font-mono text-xs text-foreground">{userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</div>
                            <button
                              onClick={disconnect}
                              className="absolute top-2 right-2 text-destructive hover:text-destructive/80 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 bg-card border border-destructive/20 rounded px-2 py-1 cursor-pointer hover:bg-destructive/10"
                              title="Change wallet"
                            >
                              Change
                            </button>
                          </div>
                          <div className="bg-card border-2 border-border rounded-lg p-4 text-center shadow-sm">
                            <div className="text-primary font-semibold text-sm mb-1">Network</div>
                            <div className="text-xs text-foreground">{getNetworkName(network?.chainId)}</div>
                          </div>
                          <div className="bg-card border-2 border-border rounded-lg p-4 text-center shadow-sm">
                            <div className="text-primary font-semibold text-sm mb-1">Gas Cost</div>
                            <div className="text-xs text-foreground">~{deploymentCost} ETH</div>
                          </div>
                        </div>
                      </div>

                      {/* Deployment Info */}
                      <div className="bg-muted/80 border-2 border-muted rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-primary text-lg">ℹ️</span>
                          <div className="text-sm">
                            <p className="text-foreground font-semibold mb-2">What happens next:</p>
                            <ul className="text-muted-foreground space-y-1 text-xs">
                              <li>• MetaMask will open to confirm the transaction</li>
                              <li>• Your coffee shop contract will be deployed to Base</li>
                              <li>• You'll receive a unique contract address</li>
                              <li>• You can then embed the widget on your website</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-destructive/15 border-2 border-destructive/40 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-destructive/30 border border-destructive/50 rounded-full flex items-center justify-center">
                          <span className="text-xl">⚠️</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-destructive">Wrong Network</h3>
                          <p className="text-muted-foreground text-sm">
                            Please switch to Base network to continue
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="bg-card border-2 border-border rounded-lg p-4 text-center shadow-sm relative group">
                          <div className="text-destructive font-semibold text-sm mb-1">Current Wallet</div>
                          <div className="text-xs text-foreground">{userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</div>
                          <div className="text-xs text-muted-foreground mt-1">{getNetworkName(network?.chainId)}</div>
                          <button
                            onClick={disconnect}
                            className="absolute top-2 right-2 text-destructive hover:text-destructive/80 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 bg-card border border-destructive/20 rounded px-2 py-1 cursor-pointer hover:bg-destructive/10"
                            title="Change wallet"
                          >
                            Change
                          </button>
                        </div>
                        <div className="bg-card border-2 border-border rounded-lg p-4 text-center shadow-sm">
                          <div className="text-primary font-semibold text-sm mb-1">Required</div>
                          <div className="text-xs text-foreground">Base Network</div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={switchToBase}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium"
                      >
                        Switch to Base Network
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={() => updateStep(2)}
                      variant="outline"
                      className="flex-1 py-3 text-foreground bg-card border border-border hover:bg-muted"
                    >
                      ← Back to Customize
                    </Button>
                    {isCorrectNetwork && (
                      <Button
                        onClick={deployContract}
                        disabled={isDeploying}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeploying ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Deploying...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            🚀 Deploy Coffee Shop
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Launch */}
          {currentStep === 4 && (
            <div className="p-8">
              {deploymentResult ? (
                <>
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-card-foreground mb-2">Your Coffee Shop is Live!</h2>
                    <p className="text-muted-foreground">Successfully deployed to Base blockchain</p>
                  </div>
                  
                  <div className="space-y-6">
                <div className="bg-gradient-to-br from-accent/20 to-primary/10 border-2 border-accent/40 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center">🎊 Congratulations!</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-card border-2 border-border rounded-lg p-4 shadow-sm">
                      <div className="text-primary font-semibold mb-2">Contract Address</div>
                      <div className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded border">{deploymentResult.contractAddress}</div>
                    </div>
                    <div className="bg-card border-2 border-border rounded-lg p-4 shadow-sm">
                      <div className="text-primary font-semibold mb-2">Transaction Hash</div>
                      <div className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded border">{deploymentResult.transactionHash}</div>
                    </div>
                    <div className="bg-card border-2 border-border rounded-lg p-4 shadow-sm">
                      <div className="text-primary font-semibold mb-2">Gas Used</div>
                      <div className="font-mono text-sm text-foreground bg-muted/50 p-2 rounded border">{deploymentResult.gasUsed}</div>
                    </div>
                    <div className="bg-card border-2 border-border rounded-lg p-4 shadow-sm">
                      <div className="text-primary font-semibold mb-2">Total Cost</div>
                      <div className="font-mono text-sm text-foreground bg-muted/50 p-2 rounded border">{deploymentResult.deploymentCost} ETH</div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <a
                      href={`https://sepolia.basescan.org/address/${deploymentResult.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-6 py-3 shadow-lg transition-all hover:shadow-xl"
                    >
                      🔍 View on BaseScan →
                    </a>
                  </div>
                </div>

                <div className="bg-card border-2 border-border rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-center text-foreground">📋 Embed Code</h4>
                  <div className="bg-muted/80 border-2 border-muted rounded-lg text-foreground p-4 text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{generateEmbedCode()}</pre>
                  </div>
                  <div className="text-center mt-6">
                    <Button
                      onClick={copyEmbedCode}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg shadow-lg font-medium"
                    >
                      📋 Copy Embed Code
                    </Button>
                  </div>
                </div>

                {/* Fund Management Info */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/5 border-2 border-primary/20 rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-3 text-center text-foreground">💰 Fund Management</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg">✅</span>
                      <div>
                        <p className="text-foreground font-medium">Donations go directly to your contract</p>
                        <p className="text-muted-foreground text-xs">All ETH donations are stored in your deployed contract</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg">🔐</span>
                      <div>
                        <p className="text-foreground font-medium">Only you can withdraw funds</p>
                        <p className="text-muted-foreground text-xs">Use the coffee widget or call the withdraw() function</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg">📍</span>
                      <div>
                        <p className="text-foreground font-medium">Owner address: <span className="font-mono text-xs">{deploymentResult.owner}</span></p>
                        <p className="text-muted-foreground text-xs">Funds will be sent to this address when withdrawn</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => window.open(`/coffee?contract=${deploymentResult.contractAddress}`, '_blank')}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground py-4 rounded-lg shadow-lg font-medium border-2 border-accent/40"
                  >
                    🔍 Preview Widget
                  </Button>
                  <Button
                    onClick={() => alert('Dashboard coming soon!')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-lg shadow-lg font-medium border-2 border-primary/40"
                  >
                    📊 Open Dashboard
                  </Button>
                </div>
              </div>
                </>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-destructive/15 to-muted/10 border-2 border-destructive/30 rounded-xl p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-destructive/20 border border-destructive/40 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">No Deployment Found</h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      You need to complete the deployment step first. Go back to step 3 to deploy your contract.
                    </p>
                    <Button
                      onClick={() => updateStep(3)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium shadow-lg"
                    >
                      ← Back to Deploy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="text-center text-muted-foreground bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
          <div className="flex justify-center items-center gap-6 mb-3 text-sm font-medium">
            <span className="flex items-center gap-1">🔒 Secure</span>
            <span className="flex items-center gap-1">⚡ Fast</span>
            <span className="flex items-center gap-1">🌍 Decentralized</span>
          </div>
          <p className="text-sm">
            Built on Base blockchain for low fees and fast transactions
          </p>
        </div>
      </div>
    </div>
  );
};