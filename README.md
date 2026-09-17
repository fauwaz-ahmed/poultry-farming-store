# Poultry Farming E-Commerce Store

Next.js + TypeScript + Tailwind + MongoDB starter based on the supplied poultry-store architecture.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

For MongoDB:
1. Create a free-tier MongoDB Atlas cluster.
2. Put the connection string in `MONGODB_URI`.
3. Run `npm run seed`.

## Important

This repository intentionally separates the storefront foundation from production integrations. Before launch, implement and test:
- Auth.js customer/admin authentication and server-side RBAC
- persistent cart and server-side cart validation
- complete product/category CRUD
- image storage/CDN
- server-calculated checkout totals
- COD order creation
- Razorpay/Cashfree/PhonePe integration with signature + webhook verification
- duplicate webhook/idempotency protection
- inventory reservation/atomic stock updates
- delivery settings and pincode validation
- order history/tracking
- rate limiting
- reviewed legal/poultry-medicine policies
- automated tests
- deployment secrets

Never trust browser-supplied prices, stock, discounts, totals, payment status or admin privileges.
