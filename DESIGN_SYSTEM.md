# AI Tutor Pro - Design System Documentation

## Overview
This design system provides a comprehensive guide to the visual and interaction design of AI Tutor Pro, ensuring consistency, accessibility, and excellent user experience across all platforms.

## Design Principles

### 1. Clarity & Simplicity
- Clean, uncluttered interfaces that focus on content
- Clear visual hierarchy using typography, spacing, and color
- Intuitive navigation patterns that reduce cognitive load

### 2. Accessibility First
- WCAG 2.1 AA compliance
- High contrast ratios (minimum 4.5:1 for normal text)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for all interactive elements

### 3. Responsive Design
- Mobile-first approach
- Fluid layouts that adapt to any screen size
- Touch-friendly interface elements (minimum 44px touch targets)
- Optimized for both portrait and landscape orientations

### 4. Performance & Delight
- Smooth animations and micro-interactions
- Fast loading states and skeleton screens
- Progressive enhancement
- Meaningful feedback for user actions

## Color Palette

### Primary Colors
- **Brand Blue**: #3182CE (brand.500)
  - Light: #EBF8FF (brand.50)
  - Dark: #1A365D (brand.900)
  - Usage: Primary actions, links, active states

### Secondary Colors
- **Purple**: #805AD5 (purple.500)
  - Usage: Secondary actions, highlights, badges
- **Success Green**: #38A169 (success.500)
  - Usage: Success states, completed items
- **Warning Orange**: #F59E0B (warning.500)
  - Usage: Warnings, pending states
- **Error Red**: #EF4444 (error.500)
  - Usage: Error states, destructive actions

### Neutral Colors
- **Gray Scale**: From #F7FAFC (gray.50) to #171923 (gray.900)
  - Usage: Text, backgrounds, borders, disabled states

### Accessibility
- All color combinations meet WCAG 2.1 AA standards
- Color is never the only way to convey information
- High contrast mode support

## Typography

### Font Family
- **Primary**: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif)
- **Monospace**: JetBrains Mono (fallback: "Fira Code", "Consolas", monospace)

### Type Scale
- **6xl**: 3.75rem (60px) - Hero headings
- **5xl**: 3rem (48px) - Page titles
- **4xl**: 2.25rem (36px) - Section headings
- **3xl**: 1.875rem (30px) - Card titles
- **2xl**: 1.5rem (24px) - Subsection headings
- **xl**: 1.25rem (20px) - Large text
- **lg**: 1.125rem (18px) - Body large
- **md**: 1rem (16px) - Body text
- **sm**: 0.875rem (14px) - Small text
- **xs**: 0.75rem (12px) - Captions, labels

### Line Heights
- **Headings**: 1.2 (120%)
- **Body Text**: 1.6 (160%)
- **UI Text**: 1.4 (140%)

### Font Weights
- **Bold**: 700 - Headings, emphasis
- **Semibold**: 600 - Subheadings, buttons
- **Medium**: 500 - Navigation, labels
- **Regular**: 400 - Body text

## Spacing System

### Base Unit: 4px (0.25rem)
- **0.5**: 2px - Fine adjustments
- **1**: 4px - Minimal spacing
- **2**: 8px - Small spacing
- **3**: 12px - Medium spacing
- **4**: 16px - Standard spacing
- **6**: 24px - Large spacing
- **8**: 32px - Extra large spacing
- **12**: 48px - Section spacing
- **16**: 64px - Page spacing
- **20**: 80px - Hero spacing

### Layout Grid
- **Container Max Width**: 1200px
- **Gutters**: 24px (desktop), 16px (mobile)
- **Columns**: 12-column grid system
- **Breakpoints**:
  - Mobile: 0-767px
  - Tablet: 768-1023px
  - Desktop: 1024px+

## Component Specifications

### Buttons

#### Primary Button
- **Background**: brand.500
- **Text**: white
- **Border Radius**: 8px (lg)
- **Padding**: 12px 24px (md size)
- **Font Weight**: 600 (semibold)
- **Hover**: brand.600 + translateY(-1px) + shadow
- **Focus**: 3px brand.500 outline with 60% opacity
- **Disabled**: 60% opacity

#### Secondary Button
- **Background**: transparent
- **Text**: brand.500
- **Border**: 2px solid brand.500
- **Other properties**: Same as primary

#### Ghost Button
- **Background**: transparent
- **Text**: brand.500
- **Hover**: brand.50 background
- **Other properties**: Same as primary

### Cards
- **Background**: white (light mode), gray.800 (dark mode)
- **Border**: 1px solid gray.200/gray.700
- **Border Radius**: 12px (xl)
- **Shadow**: sm (default), md (hover)
- **Padding**: 24px
- **Hover**: translateY(-2px) + shadow upgrade

### Form Elements

#### Input Fields
- **Height**: 40px (md), 48px (lg)
- **Border**: 1px solid gray.300
- **Border Radius**: 8px (lg)
- **Padding**: 12px 16px
- **Focus**: brand.500 border + shadow
- **Placeholder**: gray.500

#### Labels
- **Font Weight**: 500 (medium)
- **Margin Bottom**: 8px
- **Color**: gray.700 (light), gray.300 (dark)

### Navigation

#### Navbar
- **Height**: 72px
- **Background**: white with backdrop blur
- **Border Bottom**: 1px solid gray.200
- **Shadow**: sm
- **Padding**: 16px 32px

#### Sidebar
- **Width**: 280px (desktop)
- **Background**: white
- **Border Right**: 1px solid gray.200
- **Padding**: 24px 16px

#### Navigation Items
- **Padding**: 12px
- **Border Radius**: 8px (lg)
- **Active State**: brand.50 background + brand.600 text
- **Hover**: gray.50 background + translateX(2px)

## Responsive Breakpoints

### Mobile First Approach
```css
/* Mobile: 0-767px (base styles) */
/* Tablet: 768px+ */
@media (min-width: 768px) { ... }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { ... }

/* Large Desktop: 1200px+ */
@media (min-width: 1200px) { ... }
```

### Layout Adaptations
- **Mobile**: Single column, collapsible navigation, touch-optimized
- **Tablet**: Two columns, persistent navigation, hybrid interaction
- **Desktop**: Multi-column, full navigation, mouse-optimized

## Animations & Micro-interactions

### Timing Functions
- **Standard**: cubic-bezier(0.4, 0, 0.2, 1) - Most UI elements
- **Decelerate**: cubic-bezier(0, 0, 0.2, 1) - Entering elements
- **Accelerate**: cubic-bezier(0.4, 0, 1, 1) - Exiting elements

### Durations
- **Fast**: 150ms - Hover states, focus
- **Standard**: 200ms - Most transitions
- **Slow**: 300ms - Complex animations
- **Page Transitions**: 400ms

### Common Animations
- **Button Hover**: translateY(-1px) + shadow increase
- **Card Hover**: translateY(-2px) + shadow upgrade
- **Loading**: Skeleton screens with shimmer effect
- **Page Transitions**: Fade in/out with slight scale

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order throughout the interface
- Visible focus indicators (3px outline with brand color)
- Skip links for main content areas

### Screen Readers
- Semantic HTML structure
- ARIA labels for complex interactions
- Alt text for all images
- Form labels properly associated

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Color never used as the only indicator
- High contrast mode support

### Touch Targets
- Minimum 44px × 44px for touch targets
- Adequate spacing between interactive elements
- Gesture alternatives for complex interactions

## Dark Mode Support

### Implementation
- Automatic system preference detection
- Manual toggle option
- Consistent color mapping between modes
- Proper contrast maintenance

### Color Adaptations
- **Backgrounds**: Inverted hierarchy (dark becomes light)
- **Text**: High contrast maintained
- **Borders**: Subtle but visible
- **Shadows**: Adapted for dark backgrounds

## Performance Considerations

### Loading States
- Skeleton screens for content loading
- Progressive image loading
- Optimistic UI updates
- Clear loading indicators

### Optimization
- Lazy loading for images and components
- Code splitting for route-based chunks
- Efficient re-rendering strategies
- Minimal bundle sizes

## Usage Guidelines

### Do's
- ✅ Use consistent spacing from the scale
- ✅ Maintain proper contrast ratios
- ✅ Follow the established visual hierarchy
- ✅ Test with keyboard navigation
- ✅ Provide clear feedback for actions

### Don'ts
- ❌ Use arbitrary spacing values
- ❌ Rely solely on color to convey information
- ❌ Create overly complex animations
- ❌ Ignore mobile experience
- ❌ Skip accessibility testing

## Component Library

### Available Components
- Buttons (Primary, Secondary, Ghost)
- Form Elements (Input, Textarea, Select, Checkbox)
- Navigation (Navbar, Sidebar, Breadcrumbs)
- Cards (Basic, Interactive, Feature)
- Feedback (Alerts, Toasts, Loading)
- Layout (Container, Grid, Stack)

### Usage Examples
Each component includes:
- Props documentation
- Accessibility features
- Responsive behavior
- Theme integration
- Usage examples

This design system ensures that AI Tutor Pro delivers a consistent, accessible, and delightful user experience across all touchpoints while maintaining scalability and maintainability for the development team.