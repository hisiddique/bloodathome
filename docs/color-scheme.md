# Color Scheme

BloodAtHome uses an OKLCH-based color system with support for light and dark modes. All colors are defined as CSS custom properties for consistency, accessibility, and ease of maintenance.

## OKLCH Format

OKLCH (Lightness, Chroma, Hue) is a perceptually uniform color model that ensures colors maintain consistent brightness and saturation across the color wheel. This makes it ideal for creating accessible, professional interfaces.

**Structure:** `oklch(lightness chroma hue)`
- **Lightness** (0-1): How light or dark the color is
- **Chroma** (0-0.4): Color saturation/intensity
- **Hue** (0-360): Position on the color wheel

## Light Mode Palette

### Semantic Colors

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--primary` | `oklch(0.55 0.12 210)` | `#3B9EBF` | Primary buttons, links, focus rings |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary backgrounds |
| `--accent` | `oklch(0.95 0.03 210)` | `#EDF5F8` | Hover states, highlights |
| `--accent-foreground` | `oklch(0.4 0.1 210)` | `#2D6B88` | Text on accent backgrounds |
| `--secondary` | `oklch(0.97 0 0)` | `#F7F7F7` | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.2 0 0)` | `#1A1A1A` | Text on secondary backgrounds |
| `--background` | `oklch(0.99 0 0)` | `#FCFCFC` | Page background |
| `--foreground` | `oklch(0.2 0 0)` | `#1A1A1A` | Primary text |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `oklch(0.2 0 0)` | `#1A1A1A` | Text in cards |
| `--muted` | `oklch(0.95 0 0)` | `#F0F0F0` | Disabled states, muted backgrounds |
| `--muted-foreground` | `oklch(0.5 0 0)` | `#7F7F7F` | Disabled text |
| `--border` | `oklch(0.92 0 0)` | `#EBEBEB` | Borders, dividers |
| `--input` | `oklch(0.92 0 0)` | `#EBEBEB` | Input field backgrounds |
| `--ring` | `oklch(0.7 0.15 210)` | `#66B8D9` | Focus ring outlines |
| `--destructive` | `oklch(0.6 0.2 25)` | `#D94040` | Error messages, delete actions |
| `--destructive-foreground` | `oklch(0.98 0 0)` | `#FAF9F9` | Text on destructive backgrounds |
| `--chat-button` | `oklch(0.85 0.05 190)` | `#C5E0E5` | Chat CTA button |
| `--chat-button-foreground` | `oklch(0.2 0 0)` | `#1A1A1A` | Text on chat button |

### Sidebar Colors

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--sidebar` | `oklch(0.99 0 0)` | `#FCFCFC` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.3 0 0)` | `#4D4D4D` | Sidebar text |
| `--sidebar-primary` | `oklch(0.15 0 0)` | `#262626` | Active sidebar items |
| `--sidebar-primary-foreground` | `oklch(0.99 0 0)` | `#FCFCFC` | Text on active items |
| `--sidebar-accent` | `oklch(0.96 0 0)` | `#F5F5F5` | Sidebar hover states |
| `--sidebar-accent-foreground` | `oklch(0.15 0 0)` | `#262626` | Text on accent sidebar items |
| `--sidebar-border` | `oklch(0.92 0 0)` | `#EBEBEB` | Sidebar borders |
| `--sidebar-ring` | `oklch(0.6 0.12 210)` | `#5FA9D0` | Sidebar focus ring |

### Chart Colors

| Token | OKLCH | Usage |
|-------|-------|-------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | Orange accent |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | Teal accent |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | Blue-gray accent |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | Yellow accent |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | Gold accent |

### Design Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--radius` | `1rem` | Border radius for rounded corners |
| `--popover` | `oklch(1 0 0)` | Popover/tooltip backgrounds |
| `--popover-foreground` | `oklch(0.2 0 0)` | Text in popovers |

## Dark Mode Palette

Dark mode is activated when the `.dark` class is applied to the root element or a parent container.

### Semantic Colors

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--primary` | `oklch(0.7 0.15 210)` | `#5FBAD9` | Primary buttons, links, focus rings |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary backgrounds |
| `--accent` | `oklch(0.25 0.08 210)` | `#2A3A42` | Hover states, highlights |
| `--accent-foreground` | `oklch(0.9 0.05 210)` | `#E0EBEC` | Text on accent backgrounds |
| `--secondary` | `oklch(0.25 0 0)` | `#3F3F3F` | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text on secondary backgrounds |
| `--background` | `oklch(0.15 0 0)` | `#1F1F1F` | Page background |
| `--foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Primary text |
| `--card` | `oklch(0.18 0 0)` | `#2D2D2D` | Card backgrounds |
| `--card-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text in cards |
| `--muted` | `oklch(0.25 0 0)` | `#3F3F3F` | Disabled states, muted backgrounds |
| `--muted-foreground` | `oklch(0.65 0 0)` | `#A6A6A6` | Disabled text |
| `--border` | `oklch(0.25 0 0)` | `#3F3F3F` | Borders, dividers |
| `--input` | `oklch(0.25 0 0)` | `#3F3F3F` | Input field backgrounds |
| `--ring` | `oklch(0.7 0.15 210)` | `#5FBAD9` | Focus ring outlines |
| `--destructive` | `oklch(0.45 0.18 25)` | `#8B3030` | Error messages, delete actions |
| `--destructive-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text on destructive backgrounds |
| `--chat-button` | `oklch(0.35 0.08 190)` | `#3A5055` | Chat CTA button |
| `--chat-button-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text on chat button |

### Sidebar Colors

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--sidebar` | `oklch(0.2 0 0)` | `#333333` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Sidebar text |
| `--sidebar-primary` | `oklch(0.95 0 0)` | `#F0F0F0` | Active sidebar items |
| `--sidebar-primary-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text on active items |
| `--sidebar-accent` | `oklch(0.27 0 0)` | `#454545` | Sidebar hover states |
| `--sidebar-accent-foreground` | `oklch(0.95 0 0)` | `#F0F0F0` | Text on accent sidebar items |
| `--sidebar-border` | `oklch(0.27 0 0)` | `#454545` | Sidebar borders |
| `--sidebar-ring` | `oklch(0.7 0.12 210)` | `#5FA9D0` | Sidebar focus ring |

### Chart Colors

| Token | OKLCH | Usage |
|-------|-------|-------|
| `--chart-1` | `oklch(0.488 0.243 264.376)` | Purple accent |
| `--chart-2` | `oklch(0.696 0.17 162.48)` | Cyan accent |
| `--chart-3` | `oklch(0.769 0.188 70.08)` | Gold accent |
| `--chart-4` | `oklch(0.627 0.265 303.9)` | Magenta accent |
| `--chart-5` | `oklch(0.645 0.246 16.439)` | Red accent |

## Usage Guide

### In Tailwind Classes

All color tokens are available as Tailwind classes:

```html
<!-- Background colors -->
<div class="bg-background">Page background</div>
<div class="bg-card">Card container</div>
<div class="bg-primary">Primary button</div>

<!-- Text colors -->
<p class="text-foreground">Primary text</p>
<p class="text-muted-foreground">Muted text</p>
<span class="text-destructive">Error message</span>

<!-- Border colors -->
<div class="border border-border">Bordered element</div>
<input class="border border-input" />

<!-- Focus rings -->
<button class="focus:ring-2 ring-ring">Focus ring</button>

<!-- Sidebar specific -->
<nav class="bg-sidebar text-sidebar-foreground">
  <div class="bg-sidebar-primary text-sidebar-primary-foreground">
    Active item
  </div>
</nav>

<!-- Chart colors -->
<div class="bg-chart-1">Chart series 1</div>
<div class="bg-chart-2">Chart series 2</div>
```

### In CSS Custom Properties

Access color tokens directly in CSS:

```css
.custom-element {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid var(--border);
}

.custom-button:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

## Adding New Colors

To add a new semantic color to the system:

1. **Define in `:root` (light mode)** in `/resources/css/app.css`:
   ```css
   :root {
     --new-color: oklch(0.xx x.xx xxx);
     --new-color-foreground: oklch(0.xx x.xx xxx);
   }
   ```

2. **Add dark mode variant** in `.dark` block:
   ```css
   .dark {
     --new-color: oklch(0.xx x.xx xxx);
     --new-color-foreground: oklch(0.xx x.xx xxx);
   }
   ```

3. **Register in `@theme` block** to expose to Tailwind:
   ```css
   @theme {
     --color-new-color: var(--new-color);
     --color-new-color-foreground: var(--new-color-foreground);
   }
   ```

4. **Update this documentation** with the new color and its purpose.

## Color Accessibility

- **Contrast Ratios**: All text colors maintain WCAG AA compliance (4.5:1 minimum for normal text)
- **Perceptual Uniformity**: OKLCH ensures perceived brightness is consistent across hues
- **Dark Mode Support**: Chart colors are specifically adjusted for dark mode readability
- **Colorblind Safe**: Primary and accent colors avoid common colorblind confusions

## Theming Implementation

The application supports theme switching through CSS class toggling:

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Set light mode
document.documentElement.classList.remove('dark');

// Set dark mode
document.documentElement.classList.add('dark');
```

Color changes apply automatically to all components using the CSS custom properties.

## Related Files

- **CSS Definitions**: `/resources/css/app.css`
- **Tailwind Config**: `tailwind.config.js` (if applicable)
- **Component Examples**: Check individual component documentation
