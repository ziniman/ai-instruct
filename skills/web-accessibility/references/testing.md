## Testing

No single tool catches everything. Use this order  -  each layer catches what the previous misses.

### 1. Automated scan

Run first  -  fast and catches obvious violations. Automated tools catch approximately 30 - 40% of WCAG issues.

- **axe DevTools** (browser extension)  -  WCAG violations, ARIA errors
- **Lighthouse** (Chrome DevTools > Lighthouse tab)  -  accessibility score from a subset of axe-core rules. A score of 100 does not mean the page conforms to WCAG; Lighthouse itself says automatic detection finds only a subset of issues.
- **WAVE** (browser extension)  -  visual overlay showing errors, warnings, and structural info
- **IBM Equal Access** (browser extension)  -  WCAG 2.2 coverage

**Accessibility tree inspection:** Chrome DevTools > Elements panel > Accessibility tab shows the computed accessible name, role, and state for any element. Firefox has a dedicated Accessibility Inspector panel. Use these to debug unexpected announcements  -  more diagnostic than running axe alone.

### 2. Keyboard-only

Tab through every interactive flow without a mouse:
- Every interactive element must be reachable and operable
- Focus indicator must always be visible
- Test dialogs, dropdowns, date pickers, and all dynamic content
- Verify Escape closes modals and dropdowns

### 3. Screen reader

Pairings to test, based on the WebAIM Screen Reader User Survey #11 (published September 2026). The most common combinations were JAWS with Chrome (31%), NVDA with Chrome (17%), JAWS with Edge (17%), and NVDA with Firefox (9%). On mobile, VoiceOver on iOS dominates (about 73% of respondents' primary mobile platform is Apple).

| Screen reader | Platform | Browser | Free? |
|---|---|---|---|
| NVDA | Windows | Chrome (primary), Firefox | Yes |
| JAWS | Windows | Chrome, Edge | No  -  most common primary desktop screen reader |
| VoiceOver | iOS / iPadOS | Safari | Yes (built-in)  -  most important mobile test |
| VoiceOver | macOS | Safari | Yes (built-in) |
| TalkBack | Android | Chrome | Yes (built-in) |
| Narrator | Windows | Edge | Yes (built-in)  -  rarely a primary screen reader; optional |

Minimum for most projects: NVDA + Chrome on Windows and VoiceOver + Safari on iOS. Add JAWS for enterprise or government audiences.

Basic test: navigate by headings (H in NVDA/JAWS), by landmarks (D), and by form elements (F). Verify every announcement makes sense without visual context.

### 4. Zoom

- 200%  -  no content should overflow or become inaccessible
- 400%  -  content must reflow to a single column without horizontal scrolling (WCAG 1.4.10 Reflow)

### 5. Text spacing

Apply the WCAG 1.4.12 text spacing bookmarklet (sets `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, and spacing after paragraphs of 2 times the font size). No content should overlap or be clipped.

Bookmarklet source: [stevefaulkner's text spacing bookmarklet](https://www.html5accessibility.com/tests/tsbookmarklet.html)

### 6. Color and vision

- Grayscale filter: Chrome DevTools > Rendering > Emulate vision deficiencies > Achromatopsia  -  verify no information is lost
- Also test: Deuteranopia (red/green), Protanopia
- Verify no information relies on color alone
