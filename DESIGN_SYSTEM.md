# 🎨 Calorie Tracker Design System

## Color Palette

### Primary Colors (Diet & Health)

```css
--emerald-50: #ecfdf5    /* Light background accent */
--emerald-100: #d1fae5   /* Subtle highlights */
--emerald-200: #a7f3d0   /* Light interactive states */
--emerald-500: #10b981   /* Primary brand color */
--emerald-600: #059669   /* Primary hover */
--emerald-700: #047857   /* Primary active */

--teal-50: #f0fdfa       /* Secondary light accent */
--teal-500: #14b8a6      /* Secondary accent */
--teal-600: #0d9488      /* Secondary hover */
```

### Supporting Colors

```css
--orange-50: #fff7ed     /* Warm accent background */
--orange-400: #fb923c    /* Calories indicator */
--orange-500: #f97316    /* Warning states */

--blue-50: #eff6ff       /* Cool accent background */
--blue-400: #60a5fa      /* Protein indicator */
--blue-500: #3b82f6      /* Info states */

--green-50: #f0fdf4      /* Success background */
--green-400: #4ade80     /* Carbs indicator */
--green-500: #22c55e     /* Success states */

--yellow-50: #fefce8     /* Light warning background */
--yellow-400: #facc15    /* Fats indicator */
--yellow-500: #eab308    /* Attention states */

--purple-50: #faf5ff     /* Premium accent background */
--purple-500: #a855f7    /* Premium features */
--purple-600: #9333ea    /* Premium hover */
```

### Neutral Palette

```css
--slate-50: #f8fafc      /* Page background */
--slate-100: #f1f5f9     /* Subtle backgrounds */
--slate-200: #e2e8f0     /* Borders light */
--slate-300: #cbd5e1     /* Borders */
--slate-400: #94a3b8     /* Disabled text */
--slate-500: #64748b     /* Secondary text */
--slate-600: #475569     /* Body text */
--slate-700: #334155     /* Heading text */
--slate-800: #1e293b     /* Dark text */
--slate-900: #0f172a     /* Hero text */

--white: #ffffff
--black: #000000
```

### Gradients

```css
--gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%)
--gradient-hero: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)
--gradient-warm: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)
--gradient-cool: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
--gradient-success: linear-gradient(135deg, #22c55e 0%, #16a34a 100%)
--gradient-premium: linear-gradient(135deg, #a855f7 0%, #9333ea 100%)
--gradient-subtle: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)
--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)
```

## Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', sans-serif;
```

### Font Scales

```css
/* Hero */
--text-hero: 3.75rem (60px)     /* font-size: 3.75rem; line-height: 1; font-weight: 800; */

/* Headings */
--text-4xl: 2.25rem (36px)      /* font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; */
--text-3xl: 1.875rem (30px)     /* font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; */
--text-2xl: 1.5rem (24px)       /* font-size: 1.5rem; line-height: 2rem; font-weight: 600; */
--text-xl: 1.25rem (20px)       /* font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; */
--text-lg: 1.125rem (18px)      /* font-size: 1.125rem; line-height: 1.75rem; font-weight: 500; */

/* Body */
--text-base: 1rem (16px)        /* font-size: 1rem; line-height: 1.5rem; font-weight: 400; */
--text-sm: 0.875rem (14px)      /* font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; */
--text-xs: 0.75rem (12px)       /* font-size: 0.75rem; line-height: 1rem; font-weight: 400; */
```

## Spacing Scale

### Base Unit: 4px (0.25rem)

```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-5: 1.25rem (20px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
--space-20: 5rem (80px)
--space-24: 6rem (96px)
```

### Layout Spacing

```css
--container-mobile: 24px padding
--container-tablet: 32px padding
--container-desktop: 48px padding
--max-width: 1280px
--max-width-content: 896px
--max-width-mobile: 480px
```

## Border Radius

```css
--radius-sm: 0.5rem (8px)       /* Small elements */
--radius-md: 0.75rem (12px)     /* Buttons, inputs */
--radius-lg: 1rem (16px)        /* Cards */
--radius-xl: 1.5rem (24px)      /* Large cards, modals */
--radius-2xl: 2rem (32px)       /* Hero sections */
--radius-full: 9999px           /* Pills, badges */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)

/* Colored Shadows */
--shadow-emerald: 0 10px 15px -3px rgba(16, 185, 129, 0.3)
--shadow-purple: 0 10px 15px -3px rgba(168, 85, 247, 0.3)
```

## Component Styles

### Buttons

**Primary Button**

```css
background: var(--gradient-primary)
color: white
padding: 0.75rem 1.5rem
border-radius: var(--radius-lg)
font-weight: 600
font-size: 1rem
shadow: var(--shadow-sm)
hover:shadow: var(--shadow-md)
hover:transform: translateY(-1px)
active:transform: translateY(0)
transition: all 0.2s ease
```

**Secondary Button**

```css
background: white
color: var(--emerald-600)
border: 2px solid var(--emerald-600)
padding: 0.75rem 1.5rem
border-radius: var(--radius-lg)
font-weight: 600
hover:background: var(--emerald-50)
```

**Ghost Button**

```css
background: transparent
color: var(--slate-700)
padding: 0.75rem 1.5rem
border-radius: var(--radius-lg)
font-weight: 500
hover:background: var(--slate-100)
```

### Cards

**Default Card**

```css
background: white
border: 1px solid var(--slate-200)
border-radius: var(--radius-lg)
padding: 1.5rem
shadow: var(--shadow-sm)
hover:shadow: var(--shadow-md)
transition: all 0.3s ease
```

**Glass Card**

```css
background: rgba(255, 255, 255, 0.9)
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.3)
border-radius: var(--radius-lg)
padding: 1.5rem
shadow: var(--shadow-lg)
```

**Premium Card**

```css
background: var(--gradient-glass)
border: 2px solid var(--purple-200)
border-radius: var(--radius-xl)
padding: 2rem
shadow: var(--shadow-purple)
```

### Inputs

**Text Input**

```css
background: white
border: 2px solid var(--slate-300)
border-radius: var(--radius-lg)
padding: 0.75rem 1rem
font-size: 1rem
color: var(--slate-700)
focus:border: var(--emerald-500)
focus:ring: 0 0 0 3px var(--emerald-100)
transition: all 0.2s ease
```

## Animations

### Transitions

```css
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease
--transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Common Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shimmer */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px   /* Mobile landscape */
--screen-md: 768px   /* Tablet */
--screen-lg: 1024px  /* Desktop */
--screen-xl: 1280px  /* Large desktop */
--screen-2xl: 1536px /* Extra large desktop */
```

## Icon System

### Using Lucide React

```jsx
import { Heart, Activity, TrendingUp, User, Menu } from 'lucide-react'

/* Icon Sizes */
<Icon size={16} />  /* Small */
<Icon size={20} />  /* Default */
<Icon size={24} />  /* Medium */
<Icon size={32} />  /* Large */
<Icon size={48} />  /* Extra Large */

/* Icon with Color */
<Icon className="text-emerald-500" />
<Icon className="text-slate-600" />
```

## Accessibility

### Focus States

```css
/* Default focus ring */
focus:outline: none
focus:ring-2
focus:ring-emerald-500
focus:ring-offset-2

/* Focus visible only (keyboard navigation) */
focus-visible:ring-2
focus-visible:ring-emerald-500
focus-visible:ring-offset-2
```

### Color Contrast

- Ensure WCAG AA compliance (4.5:1 for normal text)
- Use `--slate-700` or darker for body text on white backgrounds
- Use white text on `--emerald-600` or darker backgrounds

## Usage Examples

### Page Header

```jsx
<header className='bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg bg-white/80'>
  <div className='max-w-7xl mx-auto px-6 lg:px-8 py-4'>
    {/* Header content */}
  </div>
</header>
```

### Section Container

```jsx
<section className='py-12 lg:py-20'>
  <div className='max-w-7xl mx-auto px-6 lg:px-8'>
    <div className='max-w-3xl mx-auto'>{/* Section content */}</div>
  </div>
</section>
```

### Card Grid

```jsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
  {/* Cards */}
</div>
```
