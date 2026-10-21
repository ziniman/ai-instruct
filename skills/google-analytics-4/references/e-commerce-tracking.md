## E-commerce Tracking

Skip this section if the user has not confirmed they need purchase or sales tracking.

GA4 e-commerce uses standard event names and an `items` array. Fire events in sequence as the user moves through the funnel. Each item needs `item_id` or `item_name`, and you can add up to 27 custom item-level parameters. Set `value` to the sum of `price * quantity` across items (excluding tax and shipping), and always send `currency` with `value`.

### Product Viewed

```javascript
gtag('event', 'view_item', {
  currency: 'USD',
  value: 29.99,
  items: [{
    item_id: 'PLAN_PRO',
    item_name: 'Pro Plan',
    item_category: 'Subscription',
    price: 29.99,
    quantity: 1,
  }],
});
```

### Add to Cart / Begin Checkout

```javascript
gtag('event', 'add_to_cart', {
  currency: 'USD',
  value: 29.99,
  items: [{ item_id: 'PLAN_PRO', item_name: 'Pro Plan', price: 29.99, quantity: 1 }],
});

gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: 29.99,
  items: [{ item_id: 'PLAN_PRO', item_name: 'Pro Plan', price: 29.99, quantity: 1 }],
});
```

### Purchase (fire on confirmation page or after payment confirmed)

```javascript
gtag('event', 'purchase', {
  transaction_id: 'TXN-20260101-001',  // Must be unique per transaction  -  GA4 deduplicates by this field
  currency: 'USD',
  value: 29.99,
  tax: 0,
  shipping: 0,
  customer_type: 'new',  // Optional: 'new' or 'returning'. Omit if unknown (e.g. guest checkout)
  items: [{
    item_id: 'PLAN_PRO',
    item_name: 'Pro Plan',
    item_category: 'Subscription',
    price: 29.99,
    quantity: 1,
  }],
});
```

Mark the `purchase` event as a key event in GA4 Admin (see [Critical First-Time Setup](critical-first-time-setup.md)).
