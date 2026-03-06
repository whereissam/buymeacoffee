# Troubleshooting

## Wrong Network

### Symptom
Wallet is connected but tipping is blocked or shows "wrong network."

### Fix
1. Switch wallet network to Base.
2. Refresh the page.
3. Retry the action.

If auto-switch fails, add Base network manually in wallet settings.

## Failed Transaction

### Symptom
Transaction rejected or reverted.

### Checks
1. Confirm wallet has enough ETH for tip amount plus gas.
2. Verify you are on Base, not Base Sepolia/Mainnet mismatch.
3. Retry with a smaller amount.
4. Check wallet activity tab for detailed error.

### Common Causes
- User rejected signature
- Insufficient funds for value + gas
- RPC/provider temporary error

## Wallet Connection Issues

### Symptom
`Connect Wallet` does nothing or reconnect loops.

### Fix
1. Reload page.
2. Disconnect/reconnect wallet in wallet extension/app.
3. Clear site connection permissions in wallet.
4. Disable conflicting wallet extensions.
5. Try a different browser profile.

## Embed Widget Not Loading

### Symptom
Iframe is blank or clipped.

### Fix
1. Verify embed URL uses valid creator ID.
2. Ensure iframe uses enough height (`>= 500px` recommended).
3. Confirm parent site allows third-party iframes.
4. Check browser console for CSP/frame policy errors.

## Local Development Test Failures

### Symptom
Playwright tests fail to start app.

### Fix
1. Ensure Bun is installed (`bun --version`).
2. Start app with `bun run dev`.
3. Confirm app is reachable at `http://localhost:5174`.
4. Re-run tests.

