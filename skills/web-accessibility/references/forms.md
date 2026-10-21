## Forms

Forms are one of the most common accessibility failure points.

### Labels

Every input needs a visible, associated label. Never use `placeholder` as a label  -  it disappears on input and typically fails contrast requirements:

```html
<!-- Explicit association via for/id -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email" />

<!-- Implicit association (label wraps input) -->
<label>
  Email address
  <input type="email" name="email" autocomplete="email" />
</label>
```

### autocomplete tokens (WCAG 1.3.5  -  Identify Input Purpose)

Add `autocomplete` tokens to personal data fields. This enables password managers, browser autofill, and assistive technology for users with cognitive disabilities:

```html
<input type="text"     name="fname"    autocomplete="given-name" />
<input type="text"     name="lname"    autocomplete="family-name" />
<input type="email"    name="email"    autocomplete="email" />
<input type="tel"      name="phone"    autocomplete="tel" />
<input type="password" name="password" autocomplete="current-password" />
<input type="password" name="new-pw"   autocomplete="new-password" />
```

### Required fields

For native `<input>` elements, the `required` attribute is sufficient  -  it is announced by screen readers and triggers native validation. Add `aria-required="true"` only for custom components that don't use native form elements:

```html
<!-- Native input: required alone is sufficient -->
<label for="name">Full name <span aria-hidden="true">*</span></label>
<input type="text" id="name" required />
<p>Fields marked <span aria-hidden="true">*</span> are required.</p>

<!-- Custom component (e.g. a styled combobox): aria-required needed -->
<div role="combobox" aria-required="true" ...>...</div>
```

### Error messages

Link errors to their input using `aria-describedby`. Set `aria-invalid="true"` when an error exists; remove it when the value becomes valid:

```html
<label for="email">Email</label>
<input type="email" id="email" aria-describedby="email-error" aria-invalid="true" />
<p id="email-error" role="alert">Enter a valid email address.</p>
```

### Fieldsets for grouped inputs

Group related inputs (radio buttons, checkboxes) with `<fieldset>` and `<legend>`  -  the legend is announced before each option, providing essential context:

```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

### Multi-step forms (WCAG 3.3.7)

Don't ask for the same data twice. Pre-populate fields using previously entered values. Show a summary of entered data before the final submit step.
