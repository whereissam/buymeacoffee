# FAQ

## Gas Costs

### How much does a tip transaction cost?
On Base, gas is usually low. Exact cost depends on network conditions at the time of transaction.

### Who pays gas?
The sender pays gas for `donate()`. The creator pays gas when calling `withdraw()`.

## Withdrawals

### Are funds custodial?
No. Funds are tracked onchain and withdrawn by the creator wallet directly.

### Can anyone withdraw my funds?
No. Only the wallet associated with your creator account can withdraw its own balance.

### Is there a minimum withdrawal?
No protocol-enforced minimum in this MVP. Practical minimum is based on gas economics.

## Security

### Is the contract audited?
This MVP includes internal security review and tests. Treat it as pre-audit production software unless a formal external audit is published.

### Is there reentrancy protection?
Yes. Withdraw flow includes reentrancy protection and checks-effects-interactions pattern.

### Is supporter message data private?
No. Onchain message data is public. Do not submit sensitive information.

## Token Support

### Which assets are supported?
Current flow supports native ETH tips on Base.

### Does it support USDC/USDT?
Not in the current MVP tip flow. ERC-20 support (for example USDC) is tracked as a backlog item.

