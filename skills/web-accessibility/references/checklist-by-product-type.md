## Checklist by Product Type

### All products (universal baseline)

- [ ] `<html lang>` set correctly; `lang` attribute on inline foreign-language content
- [ ] Unique, descriptive `<title>` on every page
- [ ] One `<h1>` per page; no skipped heading levels
- [ ] Landmarks used: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- [ ] All `<img>` have `alt` (empty for decorative)
- [ ] SVGs have `aria-label` or `aria-hidden`
- [ ] Skip navigation link present and functional
- [ ] All interactive elements reachable and operable by keyboard
- [ ] Focus indicator always visible (2.4.7) with 3:1 contrast (1.4.11); 2px+ outline recommended (2.4.13)
- [ ] Focused elements never fully hidden by sticky headers, footers, or banners (2.4.11)
- [ ] No `tabindex` values greater than 0
- [ ] `prefers-reduced-motion` respected
- [ ] Normal text 4.5:1 contrast; large text and UI components 3:1
- [ ] No information conveyed by color alone
- [ ] Automated scan (axe or Lighthouse) with no critical violations
- [ ] Full keyboard navigation tested manually
- [ ] Tested with at least one screen reader

### Online shop / e-commerce (add)

- [ ] All product images have descriptive alt text
- [ ] Form fields have `autocomplete` tokens (name, email, address, card details)
- [ ] Multi-step checkout does not ask for repeated information (WCAG 3.3.7)
- [ ] Login and checkout allow paste and password managers; no transcription CAPTCHA without a non-cognitive alternative (WCAG 3.3.8)
- [ ] Touch targets on product cards and CTAs are at least 44×44px (best practice; 24×24 is the AA minimum)
- [ ] Error recovery: clear error messages linked to specific fields

### Web app / SaaS (add)

- [ ] Modals use `<dialog>` with `showModal()` (or replicate it): focus moves in, background inert, Escape closes, focus returns on close
- [ ] Dynamic content updates announced via `aria-live` or focus management
- [ ] Help/support link in consistent location across all pages (WCAG 3.2.6)
- [ ] Drag-and-drop interactions have a single-pointer alternative (WCAG 2.5.7)
- [ ] Session timeout warning announced with enough time to extend

### Media / video site (add)

- [ ] Captions on all video with speech or meaningful audio
- [ ] Transcripts for audio-only content
- [ ] Video player controls keyboard-operable
- [ ] No autoplay with sound
- [ ] Pause control for any looping animation or auto-advancing content

### Mobile / touch (add when mobile applies)

- [ ] All touch targets at least 44×44px (best practice; 24×24 is the AA minimum)
- [ ] `@media (pointer: coarse)` rules for touchscreen spacing
- [ ] Hover-dependent content has keyboard/focus equivalent
- [ ] Tested with TalkBack (Android) and VoiceOver (iOS)
- [ ] Tested at 200% OS text size
