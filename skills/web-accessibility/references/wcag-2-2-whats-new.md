## WCAG 2.2: What's New

WCAG 2.2 was published October 2023 (republished with corrections December 2024). Older checklists and AI training data often stop at WCAG 2.1, and many still mislabel these criteria, so use the numbers and levels below. The AA criteria are the highest-value additions to implement.

### 2.4.11 Focus Not Obscured (Minimum) (AA)

When an element receives keyboard focus, it must not be entirely hidden by author-created content. The usual failures are sticky headers and footers, cookie banners, and chat widgets that cover the focused element as the user tabs down the page.

```css
/* Reserve space for a 64px sticky header and a 48px sticky footer
   so focused elements scroll into view clear of them */
html {
  scroll-padding-top: 64px;    /* match your sticky header height */
  scroll-padding-bottom: 48px; /* match your sticky footer or banner height */
}
```

For cookie banners and non-modal overlays, either make them modal (focus moves into them and stays until dismissed) or close them when focus leaves. 2.4.12 Focus Not Obscured (Enhanced) is the AAA version: no part of the focused element may be hidden.

### 2.4.13 Focus Appearance (AAA, recommended)

Focus Appearance is **Level AAA**, even though many articles still list it as "2.4.11 (AA)". At AA, you need 2.4.7 Focus Visible (an indicator is visible) and 1.4.11 Non-text Contrast (visual information that identifies a focused state needs 3:1 against adjacent colors). 2.4.13 is still the best measurable target for a focus style:

1. **Area:** The focus indicator area must be at least as large as a 2 CSS pixel thick perimeter around the unfocused component.
2. **Contrast:** The change between focused and unfocused states must have a contrast ratio of at least 3:1.

A 1px dotted grey outline fails both.

```css
/* Fails 2.4.13  -  thin, low-contrast */
:focus {
  outline: 1px dotted #999;
}

/* Passes 2.4.13  -  thick, high-contrast */
:focus-visible {
  outline: 3px solid #005fcc;  /* 5.98:1 on white; check every background it appears on */
  outline-offset: 2px;
}
```

### 2.5.7 Dragging Movements (AA)

Any interaction that uses drag-and-drop, slider, or map pan must have a single-pointer (click/tap) alternative. Drag is not a safe assumption  -  users with motor disabilities cannot rely on it.

```html
<!-- Sortable list: provide up/down buttons alongside drag handles -->
<li>
  <span class="drag-handle" aria-hidden="true">⠿</span>
  Item label
  <button aria-label="Move item up">↑</button>
  <button aria-label="Move item down">↓</button>
</li>
```

### 2.5.8 Target Size Minimum (AA)

Interactive targets must be at least **24×24 CSS pixels**, unless an exception applies:

- **Spacing:** an undersized target passes if a 24px-diameter circle centered on it does not overlap another target or another undersized target's circle.
- **Inline:** links inside a sentence or paragraph are exempt.
- **Equivalent:** another control on the same page does the same thing and meets the size.
- **User agent control:** the browser draws the control and you have not restyled it (for example a default checkbox).
- **Essential:** the size is essential or legally required (for example pins on a map).

Do not flag inline text links for target size. Best practice: 44×44px (WCAG 2.5.5 Target Size (Enhanced), Level AAA, and the Apple Human Interface Guidelines (HIG)), 48×48px (Material Design).

```css
/* Minimum compliant  -  24×24px */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
}

/* Best practice  -  44×44px tap target */
.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 3.3.8 Accessible Authentication (AA)

No step of a login or signup flow may require a cognitive function test (remembering a password, transcribing characters, solving a puzzle) unless the step offers an alternative method or a mechanism that helps. Ways to pass:

- **Let password managers work:** use `autocomplete="username"` and `autocomplete="current-password"`, and allow paste. Paste and password manager support count as an assisting mechanism.
- **Offer a non-cognitive method:** passkeys or other WebAuthn (Web Authentication API) sign-in (device biometrics or PIN), or an email magic link.
- **One-time codes:** allow paste, and add `autocomplete="one-time-code"` so the browser can fill SMS codes.
- **CAPTCHAs:** text transcription CAPTCHAs fail, and an audio CAPTCHA that requires typing what you hear is still transcription, so it does not count as the alternative. Object-recognition CAPTCHAs ("select the images with buses") are allowed at AA, but not at AAA (3.3.9). Prefer non-interactive bot detection.

Do not block clipboard paste in password or code fields  -  this breaks password managers and fails this criterion.

### 3.3.7 Redundant Entry (AA)

Multi-step forms must not ask for the same information twice unless it is essential to re-enter. Auto-populate or display previously entered data.

```html
<!-- Step 2: shipping address  -  if billing address was entered in step 1 -->
<label>
  <input type="checkbox" id="same-as-billing" />
  Same as billing address
</label>
```

### 3.2.6 Consistent Help (AA)

If a help mechanism (chat widget, phone number, help link, contact form) appears on more than one page, it must appear in the same relative location on every page.

### 4.1.1 Parsing  -  Removed in WCAG 2.2

WCAG 2.2 removed criterion 4.1.1 Parsing. Browsers handle malformed HTML in a standardized way and assistive technology no longer parses HTML directly, so it no longer represents an accessibility barrier. W3C also added a note to WCAG 2.1 that 4.1.1 "should be considered as always satisfied" for HTML or XML content, so this applies even when a law cites WCAG 2.1. Automated tools that still report 4.1.1 violations are reporting against an obsolete criterion; remove it from test baselines. Duplicate IDs still matter when they break `aria-labelledby`, `for`, or `aria-describedby` references, because a broken reference can fail 1.3.1 Info and Relationships or 4.1.2 Name, Role, Value.
