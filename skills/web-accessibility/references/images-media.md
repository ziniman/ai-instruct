## Images & Media

### Alt text

Every `<img>` must have an `alt` attribute:

```html
<!-- Informative: describe what the image conveys -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q4 sales" />

<!-- Decorative: empty alt so screen readers skip it -->
<img src="divider.png" alt="" />

<!-- Functional (inside a link or button): describe the action -->
<a href="/home"><img src="logo.svg" alt="Go to homepage" /></a>

<!-- Never omit alt  -  screen readers fall back to the filename -->
<img src="hero-image-v2-final.jpg" />  <!-- Wrong -->
```

### SVG

```html
<!-- Decorative -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Meaningful -->
<svg role="img" aria-label="Upload file">...</svg>
```

### Video & audio

- Add captions to all video with speech or meaningful sound (`<track kind="captions">`)
- Provide transcripts for audio-only content
- Do not autoplay audio or video with sound

```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default />
</video>
```
