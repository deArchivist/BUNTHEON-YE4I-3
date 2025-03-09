# BUNTHEON Design System

## Colors

```
Primary: #2563eb (Blue)
- Light: #3b82f6
- Dark: #1d4ed8

Secondary: #8b5cf6 (Violet)
- Light: #a78bfa
- Dark: #7c3aed

Background: #ffffff (Primary background)
- Light: #f8fafc (Secondary background)
- Dark: #f1f5f9 (Tertiary background)

Text: #0f172a (Primary text)
- Secondary: #475569 (Lower contrast text)
- Muted: #94a3b8 (Subtle text)

Border: #e2e8f0
Accent: #10b981 (Success green)
Error: #ef4444
Warning: #f59e0b
```

## Typography

```
Font Family: Inter, system-ui, sans-serif
- Khmer: 'Noto Sans Khmer', sans-serif

Headings:
- h1: 1.875rem (30px), font-weight: 700
- h2: 1.5rem (24px), font-weight: 600
- h3: 1.25rem (20px), font-weight: 600
- h4: 1.125rem (18px), font-weight: 500

Body text:
- Default: 1rem (16px), font-weight: 400
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)
```

## Spacing & Layout

```
Base unit: 4px

Space scale:
- xs: 0.5rem (8px)
- sm: 0.75rem (12px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

Container max-width: 480px (for mobile)
```

## Shadows

```
sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
DEFAULT: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
```

## Border Radius

```
sm: 0.375rem (6px)
DEFAULT: 0.5rem (8px)
md: 0.75rem (12px)
lg: 1rem (16px)
full: 9999px
```

## Component Variations

### Buttons

```jsx
// Primary Button
<Button variant="default">
  Continue
</Button>

// Secondary Button
<Button variant="secondary">
  Settings
</Button>

// Outline Button
<Button variant="outline">
  Cancel
</Button>

// Ghost Button
<Button variant="ghost">
  More options
</Button>

// Destructive Button
<Button variant="destructive">
  Delete
</Button>

// Icon Button
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### Cards

```jsx
<Card>
  <CardHeader>
    <CardTitle>Math Help</CardTitle>
    <CardDescription>Get assistance with algebra, calculus, and more</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Access math tutorials and practice exercises</p>
  </CardContent>
  <CardFooter>
    <Button>Start Learning</Button>
  </CardFooter>
</Card>
```

### Form Elements

```jsx
// Input
<Input placeholder="Search..." />

// Textarea
<Textarea placeholder="Type your message here." />

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="math">Mathematics</SelectItem>
    <SelectItem value="science">Science</SelectItem>
    <SelectItem value="language">Language</SelectItem>
  </SelectContent>
</Select>

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### Navigation

```jsx
<div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around px-4">
  <NavItem icon={<MessageSquare />} label="Chat" active={true} />
  <NavItem icon={<BookOpen />} label="Prompts" />
  <NavItem icon={<BookText />} label="Dictionary" />
  <NavItem icon={<FileText />} label="Exams" />
  <NavItem icon={<Calendar />} label="Reminders" />
</div>
```
