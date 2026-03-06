# Give Me Coffee - MVP Implementation Checklist

## Phase 1: Foundation (Week 1)

### Smart Contract
- [x] Write `GiveMeCoffee.sol` shared protocol contract
  - [x] `donate(address creator, string calldata message)` with 64-byte cap
  - [x] `withdraw()` with ReentrancyGuard, low-level `call`
  - [x] `balances` mapping (withdrawable) separate from `totalDonatedLifetime`
  - [x] `receive()` reverts to force `donate()` usage
  - [x] Events: `DonationReceived` (indexed creator + donor), `WithdrawalMade`
  - [x] View functions: `getBalance()`, `getLifetimeTotal()`
- [x] Write Foundry unit tests (14/14 passing)
  - [x] Donate with valid message
  - [x] Donate with empty message
  - [x] Donate rejects 0 ETH
  - [x] Donate rejects message > 64 bytes
  - [x] Donate accepts exactly 64 bytes
  - [x] Donate rejects zero address creator
  - [x] Withdraw full balance
  - [x] Withdraw with 0 balance reverts
  - [x] Reentrancy attack test
  - [x] Multiple creators, correct balance tracking
  - [x] `receive()` reverts
  - [x] Events emitted correctly
  - [x] Withdraw does not affect other creators
- [x] Deploy script for Base Sepolia (`script/Deploy.s.sol`)
- [x] Local Anvil node integration test (deploy + donate + withdraw + reverts)

### Dev Environment
- [x] Configure Foundry for Base Sepolia + Base Mainnet (`foundry.toml`)
- [x] Removed Hardhat (replaced with Foundry)
- [x] OpenZeppelin contracts installed via `forge install`
- [x] Set up wagmi + viem (replace ethers.js)
- [x] Configure WalletConnect / Reown AppKit
- [x] Verify existing Vite + React + TailwindCSS v4 setup works

## Phase 2: Frontend Core (Week 2-3)

### Creator Setup Flow
- [x] Creator connects wallet (proves ownership)
- [x] Creator configuration form
  - [x] Display name
  - [x] Description
  - [x] Suggested donation amounts (preset or custom)
  - [x] Theme selection
- [x] Generate creator ID / slug
- [x] Output: hosted page URL, iframe embed code, GitHub badge markdown
- [x] Store widget config (localStorage for MVP, backend later)

### Hosted Donation Page (`/tip/:creatorId`)
- [x] Display creator info (name, description)
- [x] Wallet connect button (wagmi)
- [x] Network detection + auto-switch prompt to Base
- [x] Preset amount buttons + custom amount input
- [x] Optional message input (64 char limit shown in UI)
- [x] Transaction state machine UI:
  - [x] Idle
  - [x] Connecting wallet
  - [x] Wrong network (with switch button)
  - [x] Awaiting signature
  - [x] Pending (with tx hash link to BaseScan)
  - [x] Success (with confirmation)
  - [x] Failed (with error message)
- [x] Mobile responsive

### Iframe Embed Version
- [x] `/embed/:creatorId` route - minimal chrome, iframe-friendly
- [x] Same functionality as hosted page
- [x] Proper iframe sizing and styling

## Phase 3: Polish & Integration (Week 4)

### Themes
- [x] Coffee Shop (amber/orange)
- [x] Modern (blue/purple)
- [x] Minimal (gray tones)
- [x] Fun & Colorful (pink/yellow)

### GitHub README Integration
- [x] Badge image generation or hosted badge URL
- [x] Markdown snippet for creators to copy

### UX Polish
- [x] Loading states and skeleton UI
- [x] Error messages are clear and actionable
- [x] Mobile wallet deep-link handling
- [x] Haptic/visual feedback on successful tip

## Phase 4: Testing & Security (Week 5)

### E2E Tests (Playwright)
- [x] Creator setup flow end-to-end
- [x] Donation page renders correctly
- [x] Wallet connection UI states
- [x] Network switch prompt
- [x] Form validation (amounts, message length)
- [x] Responsive design (mobile + desktop viewports)
- [x] Iframe embed renders correctly
- [x] Theme switching

### Security
- [x] Smart contract security review
  - [x] Reentrancy protection verified
  - [x] No integer overflow (Solidity 0.8+ built-in)
  - [x] No front-running concerns
  - [x] withdraw() only sends to msg.sender
- [x] Frontend security
  - [x] No XSS in message display
  - [x] Input sanitization
  - [x] No sensitive data in localStorage

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
