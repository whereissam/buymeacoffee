# Give Me Coffee: Lean MVP PRD & Architecture

## 1. Product Thesis

A lightweight, embeddable tipping widget for Base-native creator support.

The MVP enables any creator to generate a hosted donation page and embeddable widget that lets supporters send ETH on Base with minimal friction. The first release prioritizes non-custodial payments, low gas cost, simple integration, and fast wallet-based checkout over dashboards, token support, and advanced analytics.

## 2. Version & Status

- **Version:** 2.0
- **Date:** March 2026
- **Status:** MVP Planning

## 3. MVP Scope

### 3.1. Contract Model: Shared Protocol Contract (Model B)

One deployed contract supports many creators:

- `donate(address creator, string message)` - supporters tip any registered creator
- Creator balances tracked by address inside the contract
- Creators withdraw their own funds independently
- No per-creator deployment required

**Why Model B over per-creator contracts:**
- Drastically simpler onboarding (no deployment step for creators)
- Single contract to audit and maintain
- Better for adoption and distribution
- Creators still have full non-custodial control of their funds

### 3.2. Custody Model

MVP is non-custodial. Funds remain claimable only by the creator through immutable onchain logic. The platform never takes custody. Creators are responsible for their own local compliance and tax reporting.

### 3.3. Core Features

- **Receive ETH on Base** - supporters send ETH to the shared contract, credited to a specific creator
- **Preset donation amounts** - configurable suggested amounts (e.g., 0.001, 0.003, 0.005, 0.01 ETH)
- **Custom amount** - supporters can enter any amount
- **Optional short memo** - max 64 bytes onchain, UTF-8, no moderation in MVP
- **Wallet connection** - wagmi/viem with WalletConnect/Reown AppKit
- **Network detection** - auto-detect and prompt switch to Base
- **Transaction status** - idle > connecting > wrong network > awaiting signature > pending > success > failed

### 3.4. Creator Experience

1. **Sign up** - connect wallet to prove ownership
2. **Configure widget** - set display name, description, suggested amounts, theme
3. **Get distribution assets:**
   - Hosted donation page URL
   - Iframe embed code
   - Badge/link for GitHub README
4. **Withdraw** - claim accumulated tips anytime through the platform or directly onchain

### 3.5. Widget Distribution Model

| Channel | Format | Audience |
|---------|--------|----------|
| Hosted page | `https://yourdomain.com/tip/creator-id` | Everyone |
| Iframe embed | `<iframe src="..."/>` | Website owners |
| Badge + link | Static image linking to hosted page | GitHub READMEs |
| React package | npm package (post-MVP) | Developers |

**GitHub README integration clarification:** GitHub READMEs cannot run interactive React widgets. README integration is limited to:
- A badge image
- A static image/banner
- A link to the hosted donation page

Websites can embed the full interactive widget via iframe or script tag.

## 4. Smart Contract Design

### 4.1. MVP Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GiveMeCoffee is ReentrancyGuard {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public totalDonatedLifetime;

    event DonationReceived(
        address indexed creator,
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    event WithdrawalMade(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    function donate(address creator, string calldata message) external payable {
        require(msg.value > 0, "Must send ETH");
        require(bytes(message).length <= 64, "Message too long");

        balances[creator] += msg.value;
        totalDonatedLifetime[creator] += msg.value;

        emit DonationReceived(creator, msg.sender, msg.value, message, block.timestamp);
    }

    receive() external payable {
        revert("Use donate() function");
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        balances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit WithdrawalMade(msg.sender, amount, block.timestamp);
    }

    function getBalance(address creator) external view returns (uint256) {
        return balances[creator];
    }

    function getLifetimeTotal(address creator) external view returns (uint256) {
        return totalDonatedLifetime[creator];
    }
}
```

### 4.2. Key Design Decisions

- **ReentrancyGuard** on withdraw to prevent reentrancy attacks
- **Low-level `call`** instead of `transfer` for ETH sends (forward-compatible with gas changes)
- **Separate `balances` vs `totalDonatedLifetime`** - balance is withdrawable, lifetime is analytics
- **64-byte message cap** - keeps gas reasonable, prevents abuse
- **`receive()` reverts** - forces use of `donate()` to ensure proper event emission and creator attribution
- **Immutable, non-upgradeable** - simpler trust model for MVP
- **No donations refundable** - tips are final
- **0% protocol fee** in MVP - can add later if needed
- **No owner/admin** on the contract itself - each creator controls only their own balance

## 5. Frontend Architecture

### 5.1. Technology Stack

- **React 19** + TypeScript
- **Vite** - build tooling
- **TailwindCSS v4** - styling
- **wagmi + viem** - blockchain interaction (modern React ergonomics, better chain/wallet handling)
- **WalletConnect / Reown AppKit** - broad wallet support
- **TanStack Router** - type-safe routing

### 5.2. Key Pages

- **Landing page** - product pitch, creator CTA
- **Creator setup** - wallet connect, configure widget, get embed code
- **Hosted donation page** - `/tip/:creatorId` - the actual tipping experience
- **Widget embed** - iframe-compatible version of donation page

### 5.3. Transaction State Machine

```
idle -> connecting -> wrong_network -> awaiting_signature -> pending -> success
                                                                    -> failed
```

Each state has clear UI feedback for the supporter.

## 6. Light Backend (Optional but Recommended)

Even a non-custodial app benefits from a light backend for:

- Creator profiles and display names
- Widget configuration storage
- Offchain message storage (if messages exceed 64 bytes or moderation is needed)
- Transaction indexing cache (faster than querying RPC every time)
- Analytics

**Options:** Supabase, Firebase, or simple API server. This does not affect custody - funds always flow through the smart contract.

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time from landing to first donation page created | < 2 minutes |
| Wallet connection success rate | > 90% |
| Donation completion rate (after wallet connect) | > 70% |
| Wrong network recovery rate | > 80% |
| Average donation amount | Track, no target |
| Embed install completion rate | > 60% |

## 8. Risks

- **Low mainstream wallet penetration** - most people don't have crypto wallets
- **Users not on Base** - bridging friction, need clear network switch UX
- **Mobile wallet friction** - in-app browsers vary in quality
- **Gas volatility** - L2 gas is cheap but not zero
- **Phishing/spoof widget risk** - someone could clone the widget pointing to their own address
- **Smart contract bugs** - audit before mainnet with real funds
- **Regulatory uncertainty** - tipping may have tax implications in some jurisdictions

## 9. Explicitly Out of Scope (MVP)

- Multi-chain support (Ethereum, Polygon, Arbitrum)
- ERC-20 token tipping (USDC, etc.)
- NFT rewards for donors
- Creator analytics dashboard
- Gasless/meta-transactions
- Social feed / public comment wall
- Content moderation system
- Per-creator contract deployment
- Mobile native app

## 10. Phase Plan

### Phase 1: Foundation (Week 1)
- Dev environment setup (Hardhat, wagmi, viem)
- Shared protocol smart contract development
- Unit tests for contract

### Phase 2: Contract Deployment & Frontend Core (Week 2-3)
- Deploy to Base Sepolia
- Creator setup flow (connect wallet, configure, get embed code)
- Hosted donation page with full transaction state machine
- Iframe embed version

### Phase 3: Polish & Integration (Week 4)
- Badge generation for GitHub READMEs
- Theme customization (coffee, modern, minimal, fun)
- Mobile responsive polish
- Cross-browser testing

### Phase 4: Testing & Launch Prep (Week 5)
- E2E tests (Playwright)
- Security review of smart contract
- Testnet user acceptance testing
- Documentation for creators

### Phase 5: Mainnet Launch (Week 6)
- Deploy contract to Base Mainnet
- Host frontend (Vercel/Netlify)
- Creator onboarding documentation
- Launch announcement

## 11. Future Roadmap (Post-MVP)

Once MVP is validated:
1. Creator dashboard with analytics
2. ERC-20 support (USDC on Base)
3. Advanced widget customization (CSS, branding)
4. React npm package for developer integration
5. Multi-chain expansion
6. NFT thank-you rewards
7. Gasless transactions via paymaster
8. Light backend for offchain messages and analytics
