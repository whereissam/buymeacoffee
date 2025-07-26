# ☕ Coffee Widget Factory - Blockchain Donation Platform

A complete no-code platform for creating "Buy Me Coffee" widgets powered by blockchain technology. Deploy your own smart contract and start receiving crypto donations in minutes!

[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen)](http://localhost:5174)
[![Blockchain](https://img.shields.io/badge/blockchain-Base-blue)](https://base.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 What Is This?

The **Coffee Widget Factory** is a complete platform that lets anyone create their own cryptocurrency donation widget without any coding knowledge. It's like "Stripe for crypto coffee" - simple, powerful, and completely decentralized.

### ✨ Key Features

- 🎯 **No-Code Widget Creation** - Visual wizard, no programming required
- 🚀 **One-Click Smart Contract Deployment** - Deploy to Base blockchain instantly
- 🎨 **Fully Customizable** - 4 themes, custom colors, donation amounts
- 🌐 **Embed Anywhere** - Copy/paste code works on any website
- ☕ **Magical User Experience** - Animations, sounds, achievements
- 🔒 **You Own Everything** - Your contract, your funds, your control
- ⚡ **Lightning Fast & Cheap** - Base blockchain = $0.01 fees

## 🎯 Perfect For

- **Developers** - Add to GitHub repositories
- **Content Creators** - Blogs, YouTube channels, streams
- **Artists** - Portfolio websites, NFT projects  
- **Educators** - Course platforms, tutorials
- **Open Source Projects** - Fund development
- **Anyone** - Who wants crypto donations!

## 🚀 Quick Start

### For Users (Create a Widget)

1. **Visit**: [http://localhost:5174/factory](http://localhost:5174/factory)
2. **Setup**: Enter your name, description, website
3. **Customize**: Choose theme, features, donation amounts
4. **Deploy**: Connect wallet → one-click deployment
5. **Launch**: Copy embed code → paste anywhere!

### For Developers (Run the Platform)

#### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH ([Get from faucet](https://faucet.quicknode.com/base/sepolia))

#### Installation

```bash
# Clone and install
git clone <repository-url>
cd React-Vite-Tanstack-Starter-Template
npm install

# Start development server
npm run dev

# Visit http://localhost:5174
```

## 🏗️ How It Works

### 🎨 Widget Factory Flow

1. **🛠️ Setup & Customize** - Visual wizard for widget configuration
2. **🚀 One-Click Deploy** - Smart contract deployment to Base blockchain  
3. **📋 Copy & Embed** - Get embed code for any website
4. **💰 Start Earning** - Receive donations and withdraw anytime

### 🎪 User Experience Features

- **☕ Coffee Shop Soundscape** - Realistic coffee shop ambient sounds
- **🏆 Achievement System** - Unlock badges based on donation amounts  
- **✨ Brewing Animations** - Watch coffee get prepared during transactions
- **💌 Message Customization** - 32+ preset messages across 4 categories
- **🎉 Celebration Effects** - Floating particles and reactions on success
- **📱 Mobile Responsive** - Perfect on all devices

## 🧪 Testing with Playwright

We include comprehensive E2E tests to ensure everything works perfectly:

```bash
# Install Playwright
npx playwright install

# Run all tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/widget-factory.spec.ts
```

### Test Coverage

- ✅ **Widget Factory Flow** - Complete user journey from setup to deployment
- ✅ **Form Validation** - Input handling and data persistence  
- ✅ **Theme Selection** - All 4 themes and customization options
- ✅ **Navigation** - Step-by-step wizard navigation
- ✅ **Responsive Design** - Mobile and desktop viewports
- ✅ **Accessibility** - ARIA labels, keyboard navigation
- ✅ **Error Handling** - Edge cases and error states

## 📁 Project Architecture

```
src/
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── FunCoffeeWidget.tsx      # Main magical donation widget
│   ├── CoffeeSoundscape.tsx     # Web Audio API soundscape
│   └── MessageCustomizer.tsx    # Message customization interface
├── contexts/
│   └── Web3Context.tsx          # Web3 wallet integration
├── pages/
│   ├── Home.tsx                 # Landing page with factory CTA
│   ├── WidgetFactory.tsx        # No-code widget creation wizard
│   └── Coffee.tsx               # Demo magical coffee experience
├── routes/                      # TanStack Router file-based routes
├── utils/
│   └── contractDeployer.ts      # Smart contract deployment logic
├── contracts/
│   └── GiveMeCoffee.sol         # Solidity smart contract
├── scripts/                     # Hardhat deployment scripts
└── tests/                       # Playwright E2E tests
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning fast build tool
- **TanStack Router** - Type-safe file-based routing
- **TailwindCSS v4** - Utility-first CSS framework
- **Web Audio API** - Coffee shop soundscape generation

### Blockchain
- **Solidity 0.8.27** - Smart contract language
- **Hardhat** - Development environment
- **Ethers.js v6** - Blockchain interaction
- **Base Blockchain** - L2 for fast, cheap transactions

### Testing
- **Playwright** - End-to-end testing framework
- **Chai** - Smart contract testing assertions
- **Cross-browser testing** - Chrome, Firefox, Safari, Mobile

## 🎨 Available Themes

| Theme | Description | Colors |
|-------|-------------|---------|
| ☕ **Coffee Shop** | Warm, cozy coffee shop vibes | Amber to Orange |
| 🎨 **Modern** | Clean, professional design | Blue to Purple |
| ⚪ **Minimal** | Simple, elegant interface | Gray tones |
| 🎉 **Fun & Colorful** | Bright, playful experience | Pink to Yellow |

## 💰 Smart Contract Features

The `GiveMeCoffee.sol` contract includes:

```solidity
// Core functionality
function donate(string memory _message) external payable
function withdraw() external onlyOwner
function getBalance() external view returns (uint256)

// Advanced features  
function getRecentDonations(uint256 count) external view
function getDonationCount() external view returns (uint256)

// Events for transparency
event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp)
event WithdrawalMade(address indexed recipient, uint256 amount, uint256 timestamp)
```

## 🌐 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production  
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Blockchain
npx hardhat test        # Run smart contract tests
npx hardhat run scripts/deploy.cjs --network baseSepolia  # Deploy to testnet
npx hardhat run scripts/demo-deploy.cjs                   # Local deployment

# Testing  
npx playwright test     # Run E2E tests
npx playwright test --ui # Run tests with UI
```

## 🚀 Deployment Options

### Smart Contract Deployment

```bash
# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.cjs --network baseSepolia

# Deploy to Base Mainnet (production)  
npx hardhat run scripts/deploy.cjs --network base
```

### Frontend Deployment

The platform can be deployed to:
- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy` 
- **GitHub Pages** - Static hosting
- **IPFS** - Decentralized hosting
- **Your own server** - Standard Node.js hosting

## 🎁 Widget Embedding

Once you create a widget, you get simple embed code:

```html
<!-- Give Me Coffee Widget -->
<div id="give-me-coffee-widget"></div>
<script>
  window.coffeeWidgetConfig = {
    contractAddress: "0x...",
    title: "Support My Project! ☕",
    theme: "coffee",
    features: {
      soundscape: true,
      achievements: true,
      customMessages: true,
      animations: true
    }
  };
</script>
<script src="https://your-domain.com/widget.js"></script>
```

## 📊 Analytics & Insights

### Built-in Tracking
- **Total Donations** - Lifetime donation amount
- **Recent Supporters** - Latest donors with messages
- **Achievement Progress** - Milestone tracking
- **Contract Balance** - Available funds to withdraw

### Blockchain Transparency
- All transactions visible on [BaseScan](https://basescan.org)
- Complete donation history on-chain
- No hidden fees or intermediaries
- Full ownership and control

## 🔐 Security Features

- ✅ **Audited Smart Contract** - Secure donation handling
- ✅ **Owner-Only Withdrawals** - Only you can access funds
- ✅ **Input Validation** - Prevent malicious transactions
- ✅ **Network Validation** - Ensure correct blockchain
- ✅ **Error Handling** - Graceful failure management

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Run tests**: `npm run test && npx playwright test`
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Maintain accessibility standards
- Update documentation
- Test on multiple browsers

## 📄 License

MIT License - Feel free to use this for your own projects!

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord**: [Community Server](https://discord.gg/your-server)

## 🎊 What's Next?

### Upcoming Features
- 📊 **Creator Dashboard** - Analytics and management interface
- 🎨 **Advanced Customization** - Custom CSS, branding options
- 🌍 **Multi-Chain Support** - Ethereum, Polygon, Arbitrum
- 🎁 **NFT Rewards** - Send thank-you NFTs to donors
- 📱 **Mobile App** - Native iOS/Android apps
- 🔔 **Webhook Integration** - Real-time donation notifications

### Community Goals
- 🎯 **1,000+ Widgets Created**
- 💰 **$100K+ Total Donations Processed**  
- 🌟 **50+ Contributors**
- 🚀 **Mainnet Launch**

---

**Built with ❤️ for creators, by creators. Start your coffee shop today!** ☕✨

[![Deploy Now](https://img.shields.io/badge/🚀_Deploy_Now-Factory-orange?style=for-the-badge)](http://localhost:5174/factory)
[![Try Demo](https://img.shields.io/badge/👀_Try_Demo-Coffee-green?style=for-the-badge)](http://localhost:5174/coffee)