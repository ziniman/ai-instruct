## Color & Contrast

Color alone must never be the only way to convey information  -  always pair color with text, icons, or patterns.

### Contrast ratios (WCAG 2.2 AA)

| Text type | Minimum ratio |
|---|---|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / ≥ 14pt bold) | 3:1 |
| UI components and graphics | 3:1 |
| Decorative text, disabled UI | No requirement |

```html
<!-- Wrong: color alone marks the error -->
<label for="email-1">Email</label>
<input type="email" id="email-1" style="border-color: red" />

<!-- Correct: color + icon + text -->
<label for="email-2">Email</label>
<input type="email" id="email-2" style="border-color: red" aria-invalid="true" aria-describedby="err" />
<p id="err"><span aria-hidden="true">⚠</span> Email is required.</p>
```

### Warning: semi-transparent rgba() text

Semi-transparent colors for text are unreliable for contrast compliance. The effective contrast of `rgba(R,G,B,0.5)` depends on every background layer beneath it, including parent elements, stacked components, and page backgrounds. You cannot evaluate the contrast of a semi-transparent color in isolation.

**The problem:** `rgba(16,185,129,0.5)` (50% emerald-500) on white resolves to approximately `#88DCC0`, which has a contrast ratio of about 1.6:1 against white. On a dark background the same token may pass. The color looks "present" visually but fails silently.

**Rule:** Never use semi-transparent rgba() values for text content. Use fully opaque color tokens instead. If you need a "muted" appearance, pick a specific opaque value and measure its contrast directly.

```css
/* Wrong: contrast is unpredictable across backgrounds */
color: rgba(16, 185, 129, 0.5);
color: rgba(239, 68, 68, 0.5);

/* Correct: fully opaque, measurable value */
color: #047857;   /* emerald-700, 5.48:1 on white */
color: #dc2626;   /* red-600, 4.83:1 on white */
```

### Context-dependent contrast: the same color token can pass or fail

A color that passes contrast on one background will fail on another. This is the most common real-world failure pattern in multi-section layouts where sections use different background colors.

**Example:** `slate-500` (#64748B)
- On white (#FFFFFF): 4.76:1  -  passes AA
- On slate-50 (#F8FAFC): 4.55:1  -  passes AA (barely)
- On slate-100 (#F1F5F9): 4.34:1  -  fails AA for normal text

**Rule:** When a color token is used in more than one context, verify contrast against each background it appears on. Do not assume a token that passes on white will pass on tinted section backgrounds.

### Tailwind slate palette contrast reference

Contrast ratios for slate shades against common backgrounds, calculated with the WCAG 2 relative luminance formula. AA requires 4.5:1 for normal text, 3:1 for large text and UI components. Hex values are Tailwind v3; Tailwind v4 defines the palette in OKLCH, and its rendered values give ratios within about 0.1 of these.

| Slate shade | Hex value | On white #FFFFFF | On slate-50 #F8FAFC | On slate-100 #F1F5F9 |
|---|---|---|---|---|
| slate-400 | #94A3B8 | 2.56:1  -  FAIL | 2.45:1  -  FAIL | 2.34:1  -  FAIL |
| slate-500 | #64748B | 4.76:1  -  PASS | 4.55:1  -  PASS (barely) | 4.34:1  -  FAIL |
| slate-600 | #475569 | 7.58:1  -  PASS | 7.24:1  -  PASS | 6.92:1  -  PASS |
| slate-700 | #334155 | 10.35:1  -  PASS | 9.90:1  -  PASS | 9.45:1  -  PASS |
| slate-800 | #1E293B | 14.63:1  -  PASS | 13.98:1  -  PASS | 13.35:1  -  PASS |
| slate-900 | #0F172A | 17.85:1  -  PASS | 17.06:1  -  PASS | 16.30:1  -  PASS |

**Key takeaways:**
- `slate-400` fails AA for normal text on every common background, and even fails the 3:1 large-text threshold. Use it only for decorative, non-informational content.
- `slate-500` passes on white but has almost no margin: it fails on slate-100, and any tinted or semi-transparent background can push it under 4.5:1. Treat it as "verify every use".
- `slate-600` is the safe default for secondary text on white and light tinted backgrounds.
- Each step from white to slate-50 to slate-100 costs about 5% of contrast, which is enough to flip a borderline color from pass to fail.

### Brand color accessibility: decorative vs. text tokens

Bright brand colors are optimized for visual identity, not readability. Saturated greens, teals, and ambers that look bold and confident often fail AA contrast for normal-sized text, particularly on light backgrounds.

**Example:** `emerald-500` (#10B981)
- On white: 2.54:1  -  FAIL for normal text, large text, and UI components
- On slate-100: 2.32:1  -  FAIL
- Even `emerald-600` (#059669) is only 3.77:1 on white: fine for large text and UI components, not for normal text. `emerald-700` (#047857, 5.48:1) is the first shade that passes for body text.

**Pattern: two tokens for one brand color**

Define separate tokens for text use and decorative use. Never use the decorative/icon token on body-size text without checking contrast.

```css
/* Token pair for a brand green */
--color-brand-decorative: #10B981;  /* emerald-500: decorative fills and illustrations only (2.54:1 on white) */
--color-brand-text:       #047857;  /* emerald-700: inline text, small labels  -  5.48:1 on white */
```

```tsx
// Wrong: brand green on small text
<span className="text-emerald-500">Status: Active</span>   {/* 2.54:1 on white  -  FAIL */}

// Correct: darker shade for text use
<span className="text-emerald-700">Status: Active</span>   {/* 5.48:1 on white  -  PASS */}

// Badge: white text on emerald-500 is only 2.54:1, so use a darker fill
<span className="bg-emerald-700 text-white rounded px-2">Active</span>   {/* 5.48:1  -  PASS */}
```

Check every brand color at the size and background where it actually appears. "It looks bold" is not a contrast measurement.

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop, eyedropper tool)
- Chrome/Firefox DevTools color picker  -  shows contrast ratio inline
