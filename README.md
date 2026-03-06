# Give Me Coffee - Base-Native Tipping Widget

A lightweight, embeddable tipping widget that lets supporters send ETH on Base to creators with minimal friction. Non-custodial, low fees, simple integration.

## What Is This?

Give Me Coffee is a tipping platform for creators. One shared smart contract handles all creators - no deployment needed. Connect your wallet, configure your widget, share the link or embed it, and start receiving tips.

**Key decisions:**
- **Shared contract model** - one contract for all creators, no per-creator deployment
- **Non-custodial** - the platform never holds your funds; withdraw anytime directly onchain
- **Base chain** - fast transactions, ~$0.01 fees
- **wagmi + viem** - modern Web3 stack with clean React ergonomics

## For Creators

1. Connect wallet on the platform
2. Set display name, description, suggested tip amounts
3. Get your assets:
   - **Hosted page** - shareable link like `https://givemecoffee.xyz/tip/you`
   - **Iframe embed** - paste into any website
   - **Badge** - static image + link for GitHub READMEs
4. Withdraw accumulated tips anytime

## For Supporters

1. Visit a creator's tip page or embedded widget
2. Connect wallet (MetaMask, WalletConnect, etc.)
3. Pick an amount or enter custom
4. Optionally add a short message (max 64 bytes)
5. Confirm transaction - done

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20+, OpenZeppelin, Hardhat |
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4 |
| Web3 | wagmi, viem, WalletConnect / Reown AppKit |
| Routing | TanStack Router |
| Testing | Playwright (E2E), Hardhat (contract) |
| Chain | Base (L2) |

## Development

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- Web3 wallet (MetaMask, etc.)
- Base Sepolia testnet ETH ([faucet](https://faucet.quicknode.com/base/sepolia))

### Setup

```bash
git clone <repository-url>
cd buymeacoffee
npm install
npm run dev
```

### Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint

# Smart contract
npx hardhat test                                              # Contract tests
npx hardhat run scripts/deploy.cjs --network baseSepolia      # Deploy to testnet
npx hardhat run scripts/deploy.cjs --network base             # Deploy to mainnet

# E2E tests
npx playwright install
npx playwright test
npx playwright test --ui
```

## Smart Contract

Shared protocol contract - one deployment serves all creators.

```solidity
// Core functions
function donate(address creator, string calldata message) external payable
function withdraw() external  // creators withdraw their own balance
function getBalance(address creator) external view returns (uint256)
function getLifetimeTotal(address creator) external view returns (uint256)

// Events
event DonationReceived(address indexed creator, address indexed donor, uint256 amount, string message, uint256 timestamp)
event WithdrawalMade(address indexed creator, uint256 amount, uint256 timestamp)
```

Security: ReentrancyGuard, low-level `call` for ETH transfer, 64-byte message cap, immutable contract.

## Project Structure

```
src/
  components/        # UI components
  contexts/          # Web3 context (wagmi)
  pages/
    Home.tsx         # Landing page
    CreatorSetup.tsx # Widget configuration wizard
    TipPage.tsx      # Hosted donation page
  routes/            # TanStack Router file-based routes
  utils/             # Contract interaction helpers
contracts/
  GiveMeCoffee.sol   # Shared protocol contract
scripts/             # Hardhat deployment scripts
tests/               # Playwright E2E tests
docs/
  plan.md            # Full PRD & architecture spec
  todo.md            # Implementation checklist
```

## Widget Integration

### GitHub README (badge + link)
```markdown
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-Base-blue)](https://givemecoffee.xyz/tip/your-id)
```

### Website (iframe)
```html
<iframe src="https://givemecoffee.xyz/embed/your-id" width="400" height="500" frameborder="0"></iframe>
```

## Deployment

- **Frontend:** Vercel, Netlify, or GitHub Pages
- **Contract:** Base Sepolia (testnet) -> Base Mainnet (production)

## License

MIT
