# 🎨 Design System Visual Reference

## Color Palette

### Primary Colors

```
Emerald 500: #10b981 ███████ Main brand color
Emerald 600: #059669 ███████ Hover states
Teal 500:    #14b8a6 ███████ Accent color
```

### Nutrient Colors

```
Orange 500: #f97316 ███████ Calories
Blue 500:   #3b82f6 ███████ Protein
Green 500:  #22c55e ███████ Carbs
Yellow 500: #eab308 ███████ Fats
```

### Gradients

```css
/* Primary Gradient */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Hero Gradient */
background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);

/* Warm Gradient (Calories) */
background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);

/* Cool Gradient (Protein) */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

## Component Examples

### Button Variants

**Primary Button**

```jsx
<Button variant='primary'>Submit</Button>
```

- Background: Emerald gradient
- Text: White
- Shadow: Emerald glow on hover
- Transform: Slightly scales down on click

**Secondary Button**

```jsx
<Button variant='secondary'>Cancel</Button>
```

- Background: White
- Text: Emerald
- Border: 2px Emerald
- Hover: Light emerald background

**Ghost Button**

```jsx
<Button variant='ghost'>Skip</Button>
```

- Background: Transparent
- Text: Slate
- Hover: Light slate background

### Card Variants

**Default Card**

```jsx
<Card variant='default' padding='md'>
  Content
</Card>
```

- Background: White
- Border: 1px Slate-200
- Shadow: Subtle
- Hover: Enhanced shadow

**Glass Card**

```jsx
<Card variant='glass' padding='md'>
  Content
</Card>
```

- Background: Semi-transparent white
- Backdrop filter: Blur
- Border: Semi-transparent white
- Shadow: Larger

**Premium Card**

```jsx
<Card variant='premium' padding='lg'>
  Content
</Card>
```

- Background: White to Slate gradient
- Border: 2px Purple-200
- Shadow: Purple glow

**Gradient Card**

```jsx
<Card variant='gradient' padding='md'>
  Content
</Card>
```

- Background: Emerald to Teal gradient (subtle)
- Border: Emerald-200
- Shadow: Subtle

### Input States

**Default State**

```jsx
<Input label='Email' placeholder='Enter your email' />
```

- Border: 2px Slate-200
- Focus: 2px Emerald-500 + Ring
- Text: Slate-700

**Error State**

```jsx
<Input label='Email' error='Invalid email' />
```

- Border: 2px Red-300
- Focus: 2px Red-500 + Red ring
- Error icon and message below

**With Icon & Unit**

```jsx
<Input icon={<Icon />} unit='kg' placeholder='Enter weight' />
```

- Icon: Left side, Slate-400
- Unit: Right side, Slate-500

## Layout Patterns

### Page Header

```jsx
<header className='sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm'>
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
    <div className='flex items-center justify-between h-16 lg:h-20'>
      {/* Header content */}
    </div>
  </div>
</header>
```

### Content Container

```jsx
<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
    {/* Content */}
  </div>
</main>
```

### Card Grid

```jsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
  {/* Cards */}
</div>
```

## Icon Usage

### Lucide React Icons

**Common Icons**

```jsx
import {
  // Navigation
  ChevronLeft,
  ChevronRight,
  Menu,
  X,

  // Actions
  Plus,
  Trash2,
  Edit,
  Save,
  Check,

  // Food & Nutrition
  Apple,
  UtensilsCrossed,
  Salad,
  Sparkles,

  // Health & Fitness
  Heart,
  Activity,
  TrendingUp,
  Target,
  Flame,

  // Data
  BarChart3,
  PieChart,
  Calendar,
  Clock,

  // User
  User,
  UserCircle2,
  Settings,
  Bell,

  // Misc
  Droplet,
  Scale,
  Ruler,
  Info,
} from 'lucide-react';
```

**Icon in Button**

```jsx
<Button icon={<Apple className='w-5 h-5' />} variant='primary'>
  Log Food
</Button>
```

**Icon in Card**

```jsx
<div className='p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500'>
  <Apple className='w-6 h-6 text-white' />
</div>
```

**Icon Sizes**

- `w-4 h-4` (16px) - Small, inline with text
- `w-5 h-5` (20px) - Default, buttons
- `w-6 h-6` (24px) - Medium, cards
- `w-8 h-8` (32px) - Large, headers
- `w-10 h-10` (40px) - Extra large, hero sections

## Spacing Scale

```
space-1: 4px   ▌
space-2: 8px   ▌▌
space-3: 12px  ▌▌▌
space-4: 16px  ▌▌▌▌
space-5: 20px  ▌▌▌▌▌
space-6: 24px  ▌▌▌▌▌▌
space-8: 32px  ▌▌▌▌▌▌▌▌
space-12: 48px ▌▌▌▌▌▌▌▌▌▌▌▌
```

**Common Uses**

- `gap-2` - Between small items (8px)
- `gap-4` - Between cards (16px)
- `gap-6` - Between sections (24px)
- `p-4` - Card padding (16px)
- `p-6` - Large card padding (24px)
- `mb-3` - Small margin bottom (12px)
- `mb-6` - Section margin (24px)

## Typography Scale

```
text-xs:   12px - Labels, captions
text-sm:   14px - Small text, descriptions
text-base: 16px - Body text
text-lg:   18px - Large body, subtitles
text-xl:   20px - Small headings
text-2xl:  24px - Medium headings
text-3xl:  30px - Large headings
text-4xl:  36px - Hero text
```

**Font Weights**

```
font-normal:   400 - Body text
font-medium:   500 - Emphasized text
font-semibold: 600 - Subheadings
font-bold:     700 - Headings
font-extrabold: 800 - Hero text
```

## Border Radius

```
rounded-lg:   16px - Buttons, inputs
rounded-xl:   24px - Cards
rounded-2xl:  32px - Large cards
rounded-3xl:  48px - Hero sections
rounded-full: 9999px - Pills, badges, circular elements
```

## Shadows

```css
/* Subtle */
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)

/* Default */
shadow-md: 0 4px 6px rgba(0,0,0,0.1)

/* Elevated */
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)

/* Hero */
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)

/* Colored Glow */
shadow-emerald-500/30: Emerald glow at 30% opacity
shadow-purple-500/20: Purple glow at 20% opacity
```

## Animation Guidelines

### Transitions

```css
/* Fast interactions (hover, clicks) */
transition: all 150ms ease

/* Default (most UI changes) */
transition: all 200ms ease

/* Smooth (page transitions) */
transition: all 300ms ease
```

### Hover Effects

```jsx
{/* Scale up slightly */}
<div className='hover:scale-105 transition-transform'>

{/* Lift up */}
<div className='hover:-translate-y-1 transition-transform'>

{/* Color change */}
<div className='hover:bg-emerald-50 transition-colors'>

{/* Shadow */}
<div className='hover:shadow-lg transition-shadow'>
```

## Responsive Breakpoints

```
Mobile:  < 640px  (default, mobile-first)
Tablet:  ≥ 640px  (sm:)
Desktop: ≥ 1024px (lg:)
Large:   ≥ 1280px (xl:)
```

**Responsive Pattern**

```jsx
<div className='
  text-base     /* Mobile: 16px */
  sm:text-lg    /* Tablet: 18px */
  lg:text-xl    /* Desktop: 20px */

  p-4           /* Mobile: 16px padding */
  sm:p-6        /* Tablet: 24px padding */
  lg:p-8        /* Desktop: 32px padding */

  grid-cols-1       /* Mobile: 1 column */
  sm:grid-cols-2    /* Tablet: 2 columns */
  lg:grid-cols-3    /* Desktop: 3 columns */
'>
```

## Accessibility

### Focus States

```jsx
{/* All interactive elements should have focus states */}
<button className='
  focus:outline-none
  focus:ring-2
  focus:ring-emerald-500
  focus:ring-offset-2
'>
```

### Color Contrast

- Body text (Slate-700) on white: 7:1 (AAA)
- Secondary text (Slate-600) on white: 5:1 (AA)
- White text on Emerald-600: 4.5:1 (AA)

### Interactive Elements

- Minimum touch target: 44x44px (h-11 or h-12)
- Visible hover states
- Clear focus indicators
- Descriptive button text
