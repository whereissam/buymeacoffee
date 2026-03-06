# Widget Integration Guide

Use this guide to embed Give Me Coffee on your site or add a badge in your README.

## Integration Options

- Iframe widget (recommended for websites)
- Badge link (recommended for GitHub/markdown profiles)

## Iframe Embed

Replace `your-creator-id` with your real creator ID:

```html
<iframe
  src="https://givemecoffee.xyz/embed/your-creator-id"
  width="400"
  height="520"
  style="border:0;border-radius:12px;overflow:hidden"
  loading="lazy"
  title="Tip this creator on Give Me Coffee"
></iframe>
```

## Responsive Iframe

For responsive layouts:

```html
<div style="max-width:400px;width:100%;">
  <iframe
    src="https://givemecoffee.xyz/embed/your-creator-id"
    width="100%"
    height="520"
    style="border:0;border-radius:12px;overflow:hidden"
    loading="lazy"
    title="Tip this creator on Give Me Coffee"
  ></iframe>
</div>
```

## Badge Integration

```markdown
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-Base-blue)](https://givemecoffee.xyz/tip/your-creator-id)
```

## Framework Notes

- React/Next.js: use `iframe` directly in JSX (`frameBorder={0}` if needed).
- Static sites: plain HTML snippet above works.
- CMS platforms: use "Custom HTML" block.

## Security Notes

- Only embed your own creator ID.
- Prefer HTTPS pages only.
- Do not inject untrusted query params into the iframe URL.

## Quick Validation Checklist

- Widget loads without horizontal scroll.
- Connect button is visible.
- Creator name and description render correctly.
- Tip flow opens wallet and transaction prompt.

