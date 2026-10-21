## User Properties & Custom Dimensions

User properties describe the user and persist across sessions. Limits: 25 user properties per property, names max 24 characters, values max 36 characters.

### Set User Properties

```javascript
// Call after the user authenticates or their profile is known
gtag('set', 'user_properties', {
  plan_type: 'pro',       // e.g. free / pro / enterprise
  user_role: 'admin',
  account_age_days: 42,
});
```

### Set User ID for Cross-Device Tracking

```javascript
// After login: applies to all subsequent events on the page.
// Use your internal user ID, never PII (personally identifiable information: email, name, phone). Max 256 characters.
gtag('set', { user_id: 'internal-user-id-123' });

// On logout: clear it with null (not '', 'null', or undefined)
gtag('set', { user_id: null });
```

If the user ID is already known when the page loads, pass it in the config instead: `gtag('config', 'G-XXXXXXXXXX', { user_id: 'internal-user-id-123' })`. Never send `user_id` for users who have not signed in, and do not also send it as a user property or custom dimension  -  it is a reserved field.

Register user properties as User-scoped Custom Dimensions in GA4 Admin before expecting to see them in reports (see [Critical First-Time Setup](critical-first-time-setup.md)).
