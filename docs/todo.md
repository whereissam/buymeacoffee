# Give Me Coffee - MVP Implementation Checklist

## Phase 1: Foundation (Week 1)

### Smart Contract
- [ ] Write `GiveMeCoffee.sol` shared protocol contract
  - [ ] `donate(address creator, string calldata message)` with 64-byte cap
  - [ ] `withdraw()` with ReentrancyGuard, low-level `call`
  - [ ] `balances` mapping (withdrawable) separate from `totalDonatedLifetime`
  - [ ] `receive()` reverts to force `donate()` usage
  - [ ] Events: `DonationReceived` (indexed creator + donor), `WithdrawalMade`
  - [ ] View functions: `getBalance()`, `getLifetimeTotal()`
- [ ] Write Hardhat unit tests
  - [ ] Donate with valid message
  - [ ] Donate with empty message
  - [ ] Donate rejects 0 ETH
  - [ ] Donate rejects message > 64 bytes
  - [ ] Withdraw full balance
  - [ ] Withdraw with 0 balance reverts
  - [ ] Reentrancy attack test
  - [ ] Multiple creators, correct balance tracking
  - [ ] `receive()` reverts
  - [ ] Events emitted correctly
- [ ] Deploy script for Base Sepolia

### Dev Environment
- [ ] Configure Hardhat for Base Sepolia + Base Mainnet
- [ ] Set up wagmi + viem (replace ethers.js)
- [ ] Configure WalletConnect / Reown AppKit
- [ ] Verify existing Vite + React + TailwindCSS v4 setup works

## Phase 2: Frontend Core (Week 2-3)

### Creator Setup Flow
- [ ] Creator connects wallet (proves ownership)
- [ ] Creator configuration form
  - [ ] Display name
  - [ ] Description
  - [ ] Suggested donation amounts (preset or custom)
  - [ ] Theme selection
- [ ] Generate creator ID / slug
- [ ] Output: hosted page URL, iframe embed code, GitHub badge markdown
- [ ] Store widget config (localStorage for MVP, backend later)

### Hosted Donation Page (`/tip/:creatorId`)
- [ ] Display creator info (name, description)
- [ ] Wallet connect button (wagmi)
- [ ] Network detection + auto-switch prompt to Base
- [ ] Preset amount buttons + custom amount input
- [ ] Optional message input (64 char limit shown in UI)
- [ ] Transaction state machine UI:
  - [ ] Idle
  - [ ] Connecting wallet
  - [ ] Wrong network (with switch button)
  - [ ] Awaiting signature
  - [ ] Pending (with tx hash link to BaseScan)
  - [ ] Success (with confirmation)
  - [ ] Failed (with error message)
- [ ] Mobile responsive

### Iframe Embed Version
- [ ] `/embed/:creatorId` route - minimal chrome, iframe-friendly
- [ ] Same functionality as hosted page
- [ ] Proper iframe sizing and styling

## Phase 3: Polish & Integration (Week 4)

### Themes
- [ ] Coffee Shop (amber/orange)
- [ ] Modern (blue/purple)
- [ ] Minimal (gray tones)
- [ ] Fun & Colorful (pink/yellow)

### GitHub README Integration
- [ ] Badge image generation or hosted badge URL
- [ ] Markdown snippet for creators to copy

### UX Polish
- [ ] Loading states and skeleton UI
- [ ] Error messages are clear and actionable
- [ ] Mobile wallet deep-link handling
- [ ] Haptic/visual feedback on successful tip

## Phase 4: Testing & Security (Week 5)

### E2E Tests (Playwright)
- [ ] Creator setup flow end-to-end
- [ ] Donation page renders correctly
- [ ] Wallet connection UI states
- [ ] Network switch prompt
- [ ] Form validation (amounts, message length)
- [ ] Responsive design (mobile + desktop viewports)
- [ ] Iframe embed renders correctly
- [ ] Theme switching

### Security
- [ ] Smart contract security review
  - [ ] Reentrancy protection verified
  - [ ] No integer overflow (Solidity 0.8+ built-in)
  - [ ] No front-running concerns
  - [ ] withdraw() only sends to msg.sender
- [ ] Frontend security
  - [ ] No XSS in message display
  - [ ] Input sanitization
  - [ ] No sensitive data in localStorage

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Phase 5: Mainnet Launch (Week 6)

### Deployment
- [ ] Deploy contract to Base Mainnet
- [ ] Verify contract on BaseScan
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set up custom domain
- [ ] Update contract address in frontend config

### Documentation
- [ ] Creator onboarding guide
- [ ] Widget integration guide (iframe, badge)
- [ ] FAQ: gas costs, withdrawal, security
- [ ] Troubleshooting: wrong network, failed tx, wallet issues

### Launch
- [ ] Smoke test on mainnet with small amounts
- [ ] Share with initial creators for feedback
- [ ] Public announcement

---

## Post-MVP Backlog (not for v1)

- [ ] Light backend (Supabase) for creator profiles and offchain messages
- [ ] Creator dashboard with analytics
- [ ] ERC-20 support (USDC on Base)
- [ ] Advanced widget CSS customization
- [ ] npm React package
- [ ] Multi-chain support
- [ ] NFT thank-you rewards
- [ ] Gasless transactions via paymaster
- [ ] Script tag embed (`<script src="...">`) in addition to iframe
