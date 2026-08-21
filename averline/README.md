# Averline corporate product-site prototype

This folder is a standalone static product-site concept. It does not replace the
existing Buni homepage or any Buni industry demo route.

## Working brand

`Averline` is a temporary product name. The site uses only relative local asset
paths, so the name, domain, and deployment target can be replaced later without
rewriting the page structure.

## Safe checkout configuration

Public, non-secret settings are centralized in `config.js`:

- `contactEmail`
- `legalCompany`
- `demoBaseUrl`
- `checkoutUrls`

All checkout URLs intentionally begin empty. Until real Stripe products and the
complete post-payment workflow are tested, pricing buttons fall back to a pilot
inquiry email. Do not paste Stripe secret keys, Retell keys, webhook secrets, or
provider agent IDs into this folder.

Before enabling a Stripe URL, verify all of the following end to end:

1. Successful subscription checkout.
2. Signed and idempotent webhook processing.
3. Customer account and onboarding creation.
4. Agent and knowledge-base draft provisioning.
5. Automated simulations and a human approval gate.
6. Customer approval before phone routing is activated.
7. Usage metering and overage reporting.
8. Failed-payment, cancellation, refund, and data-retention behavior.
9. Stripe Customer Portal access.
10. Confirmation emails and support escalation.

## Current working examples

The industry cards use `demoBaseUrl` to reach the existing, separately deployed
Buni fictional demonstrations. They do not claim that a new Averline customer
already has booking, texting, CRM updates, dispatching, or other integrations.

## Preview locally

Serve the repository root and open `/averline/`. The page is marked
`noindex,nofollow` while it is a prototype. Remove that directive only after the
final domain, legal pages, production checkout, support process, accessibility,
mobile behavior, and launch workflow have been approved and verified.

