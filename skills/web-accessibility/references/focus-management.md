## Focus Management

### Visible focus indicator

Never remove focus outlines without a replacement. WCAG 2.4.7 Focus Visible (AA) requires a visible indicator, 1.4.11 Non-text Contrast (AA) requires a custom indicator to reach 3:1 against adjacent colors, and 2.4.11 Focus Not Obscured (AA) requires that sticky content never covers it completely. Aim for 2.4.13 Focus Appearance (AAA): a 2px-thick perimeter with 3:1 contrast between focused and unfocused states.

```css
/* Wrong: removes indicator for everyone */
* { outline: none; }

/* Correct: styled focus that meets 2.4.7 and 1.4.11, and the 2.4.13 target */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}
```

Use `:focus-visible` rather than `:focus`  -  it shows the indicator for keyboard users but suppresses it for mouse clicks, matching user expectations.

### Dialogs and modals

A modal dialog must move focus into itself when it opens, keep focus and the screen reader inside while open, close on Escape, and return focus to the trigger when it closes. Use the native `<dialog>` element opened with `showModal()` (Baseline widely available): the browser makes the rest of the page inert, closes on Escape, exposes `aria-modal="true"`, and the HTML spec restores focus to the previously focused element on close.

```html
<button type="button" id="delete-btn" commandfor="confirm-dialog" command="show-modal">
  Delete project
</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this project?</h2>
  <p>This cannot be undone.</p>
  <form method="dialog">
    <!-- autofocus sets initial focus; put it on the least destructive action -->
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```javascript
const trigger = document.getElementById('delete-btn');
const dialog = document.getElementById('confirm-dialog');

// Invoker commands (command/commandfor) became Baseline in December 2025.
// Fall back to showModal() for older browsers.
if (!('command' in HTMLButtonElement.prototype)) {
  trigger.addEventListener('click', () => dialog.showModal());
}

dialog.addEventListener('close', () => {
  const result = dialog.returnValue;
  // showModal() does not reset returnValue and Escape leaves it unchanged,
  // so reset it or a later Escape would repeat the last action
  dialog.returnValue = '';
  // Safari does not focus buttons on click, so the browser may have nothing
  // to restore focus to; send it back to the trigger
  if (document.activeElement === document.body) trigger.focus();
  if (result === 'delete') {
    // YOUR_DELETE_ACTION
  }
});
```

Always include a visible close or cancel button; do not rely on Escape alone. Opening a `<dialog>` with `show()` or the `open` attribute makes it non-modal, with no inert background.

If you cannot use `<dialog>` (for example, a legacy component library), replicate the behavior: `role="dialog"`, `aria-modal="true"`, an accessible name, `inert` on the rest of the page, an Escape handler, and focus returned to the trigger on close.

### Dynamic content

When content updates dynamically (search results, filtered lists, notifications), announce it or move focus:

```javascript
// Option A: announce via live region (no focus move  -  least disruptive)
statusEl.textContent = `${results.length} results found.`;  // aria-live="polite" on statusEl

// Option B: move focus to the new content region
resultsContainer.setAttribute('tabindex', '-1');
resultsContainer.focus();
```
