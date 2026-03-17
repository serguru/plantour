# SEO-Friendly Bot Protection Plan For Plantour

This document has been split into two separate planning documents:

- [SEO-friendly-bot-protect-code-changes.md](c:\Projects\plantour\documents\SEO-friendly-bot-protect-code-changes.md): future application and website code changes
- [SEO-friendly-bot-protect-manage-actions.md](c:\Projects\plantour\documents\SEO-friendly-bot-protect-manage-actions.md): Cloudflare, Render, SEO operations, rollout, and other management actions

## How To Use The Split

Use the code document when planning:

- form protection
- server-side verification
- ASP.NET throttling
- SSR-safe behavior
- anti-enumeration changes
- public response handling

Use the management document when planning:

- Cloudflare DNS and WAF setup
- route-specific rate limits
- Render and infrastructure behavior
- verified bot handling
- `robots.txt` policy decisions
- Search Console validation and rollout steps

## Why It Was Split

The original document mixed two different workstreams:

- engineering implementation tasks
- platform, SEO, and operational decisions

Splitting them makes ownership clearer and should be easier to execute.