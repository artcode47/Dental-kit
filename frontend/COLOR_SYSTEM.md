# Color System Documentation

## Overview

This document outlines the comprehensive color system for the DentalKit frontend application. The system is built around the primary teal color `#00b1db` and provides consistent, accessible, and theme-aware color usage across the entire application.

## Primary Color Palette

### Teal Colors (Primary Brand Colors)

The teal color palette is the foundation of our brand identity:

| Shade | Hex Code | Usage |
|-------|----------|-------|
| `teal-50` | `#f0fdfa` | Very light backgrounds, subtle accents |
| `teal-100` | `#ccfbf1` | Light backgrounds, hover states |
| `teal-200` | `#99f6e4` | Border colors, secondary backgrounds |
| `teal-300` | `#5eead4` | Light accents, disabled states |
| `teal-400` | `#2dd4bf` | Secondary actions, lighter text |
| `teal-500` | `#00b1db` | **Main brand color** - primary actions |
| `teal-600` | `#0891b2` | Hover states, active elements |
| `teal-700` | `#0e7490` | Pressed states, darker accents |
| `teal-800` | `#155e75` | Dark backgrounds, borders |
| `teal-900` | `#164e63` | Very dark backgrounds |
| `teal-950` | `#042f2e` | Darkest backgrounds |

### Semantic Colors

#### Success Colors (Green)
- Used for: Success messages, completed actions, positive feedback
- Primary: `success-500` (`#22c55e`)
- Light: `success-50` (`#f0fdf4`)
- Dark: `success-900` (`#14532d`)

#### Warning Colors (Yellow/Orange)
- Used for: Warnings, caution messages, pending states
- Primary: `warning-500` (`#f59e0b`)
- Light: `warning-50` (`#fffbeb`)
- Dark: `warning-900` (`#78350f`)

#### Error Colors (Red)
- Used for: Error messages, destructive actions, validation errors
- Primary: `error-500` (`#ef4444`)
- Light: `error-50` (`#fef2f2`)
- Dark: `error-900` (`#7f1d1d`)

### Neutral Colors (Gray)

Used for text, backgrounds, borders, and other UI elements:

| Shade | Hex Code | Usage |
|-------|----------|-------|
| `gray-50` | `#f8fafc` | Page backgrounds |
| `gray-100` | `#f1f5f9` | Card backgrounds |
| `gray-200` | `#e2e8f0` | Borders, dividers |
| `gray-300` | `#cbd5e1` | Input borders |
| `gray-400` | `#94a3b8` | Placeholder text |
| `gray-500` | `#64748b` | Secondary text |
| `gray-600` | `#475569` | Body text |
| `gray-700` | `#334155` | Headings |
| `gray-800` | `#1e293b` | Dark backgrounds |
| `gray-900` | `#0f172a` | Very dark backgrounds |

## Dark Mode Support

All colors automatically adapt to dark mode using Tailwind's `dark:` prefix. The system provides:

### Light Mode → Dark Mode Mappings

- **Backgrounds**: `bg-white` → `dark:bg-gray-900`
- **Text**: `text-gray-900` → `dark:text-gray-100`
- **Borders**: `border-gray-200` → `dark:border-gray-700`
- **Primary Colors**: `text-teal-600` → `dark:text-teal-400`

### Dark Mode Color Adjustments

- Teal colors are inverted in dark mode for better contrast
- Gray colors are adjusted for optimal readability
- Semantic colors maintain their meaning but adjust brightness

## Component Color Patterns

### Buttons

```jsx
// Primary Button
<button className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-teal">
  Primary Action
</button>

// Secondary Button
<button className="bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500">
  Secondary Action
</button>

// Outline Button
<button className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white">
  Outline Action
</button>
```

### Cards

```jsx
// Default Card
<div className="bg-white border border-gray-200 shadow-sm rounded-lg">
  Card Content
</div>

// Primary Card
<div className="bg-teal-50 border border-teal-200 rounded-lg">
  Primary Card Content
</div>

// Dark Mode Card
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  Dark Mode Card
</div>
```

### Forms

```jsx
// Input Field
<input className="border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />

// Error State
<input className="border border-error-300 focus:ring-error-500" />

// Success State
<input className="border border-success-300 focus:ring-success-500" />
```

### Alerts

```jsx
// Info Alert
<div className="bg-teal-50 border border-teal-200 text-teal-800">
  Information message
</div>

// Success Alert
<div className="bg-success-50 border border-success-200 text-success-800">
  Success message
</div>

// Warning Alert
<div className="bg-warning-50 border border-warning-200 text-warning-800">
  Warning message
</div>

// Error Alert
<div className="bg-error-50 border border-error-200 text-error-800">
  Error message
</div>
```

## Usage Guidelines

### 1. Color Hierarchy

1. **Primary Actions**: Use `teal-500` for main CTAs and primary actions
2. **Secondary Actions**: Use `teal-600` for hover states and secondary actions
3. **Accents**: Use `teal-400` for lighter accents and highlights
4. **Backgrounds**: Use `teal-50` for subtle background accents

### 2. Accessibility

- Maintain a minimum contrast ratio of 4.5:1 for normal text
- Use `teal-600` or darker for text on light backgrounds
- Use `teal-400` or lighter for text on dark backgrounds
- Test color combinations with color blindness simulators

### 3. Consistency

- Always use the predefined color classes from the system
- Avoid hardcoding hex values in components
- Use semantic color names (success, warning, error) for their intended purposes
- Maintain consistent color usage across similar components

### 4. Dark Mode Best Practices

- Always include dark mode variants using `dark:` prefix
- Test both light and dark modes during development
- Ensure sufficient contrast in both themes
- Use the `useThemeColors()` hook for dynamic color selection

## Implementation Examples

### Using the Color System Hook

```jsx
import { useThemeColors } from '../components/ui/ColorSystem';

const MyComponent = () => {
  const { colors, classes, components } = useThemeColors();
  
  return (
    <div className={components.card.default}>
      <h2 className={classes.text.primary}>Title</h2>
      <button className={components.button.primary}>
        Action
      </button>
    </div>
  );
};
```

### Custom Color Combinations

```jsx
// Custom gradient background
<div className="bg-gradient-to-r from-teal-500 to-teal-600">
  Gradient Content
</div>

// Custom shadow with teal color
<div className="shadow-teal">
  Shadowed Content
</div>

// Custom focus ring
<input className="focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
```

## CSS Variables

The system also provides CSS variables for advanced customization:

```css
:root {
  --teal-500: #00b1db;
  --teal-600: #0891b2;
  --primary-500: #00b1db;
  --primary-600: #0891b2;
}

[data-theme="dark"] {
  --teal-500: #00b1db; /* Main color stays the same */
  --teal-600: #2dd4bf; /* Adjusted for dark mode */
}
```

## Migration Guide

### From Old Color System

1. Replace `primary-*` classes with `teal-*` classes
2. Update hardcoded colors to use the new palette
3. Add dark mode variants where missing
4. Test accessibility and contrast ratios
5. Update any custom CSS that references old colors

### Example Migration

```jsx
// Before
<div className="bg-blue-500 text-white">
  Old Blue Button
</div>

// After
<div className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500">
  New Teal Button
</div>
```

## Testing

### Color Contrast Testing

Use tools like:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark Contrast Checker](https://www.getstark.co/)
- Browser DevTools accessibility features

### Dark Mode Testing

1. Toggle between light and dark modes
2. Check all color combinations
3. Verify text readability
4. Test interactive elements
5. Ensure proper contrast ratios

## Resources

- [Tailwind CSS Color Documentation](https://tailwindcss.com/docs/customizing-colors)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Theory for Designers](https://www.smashingmagazine.com/2010/02/color-theory-for-designers-part-1-the-meaning-of-color/)

## Support

For questions about the color system or to request new color additions:

1. Check the `ColorSystem` component for examples
2. Review existing component implementations
3. Consult the design team for brand consistency
4. Test thoroughly in both light and dark modes

---

*This color system is designed to be scalable, maintainable, and accessible while maintaining the DentalKit brand identity.* 