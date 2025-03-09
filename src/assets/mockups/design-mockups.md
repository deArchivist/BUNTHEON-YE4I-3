# BUNTHEON UI Mockups

## Home Page
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  BUNTHEON                                        │
│  Your Educational Companion                      │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  │
│  │ ◎                  │  │ ◎                  │  │
│  │ AI Chat            │  │ Prompts            │  │
│  │                    │  │                    │  │
│  │ Get homework help  │  │ Access study guides│  │
│  │ from our AI tutor  │  │ & question prompts │  │
│  └────────────────────┘  └────────────────────┘  │
│                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  │
│  │ ◎                  │  │ ◎                  │  │
│  │ Dictionary         │  │ Exam Papers        │  │
│  │                    │  │                    │  │
│  │ English-Khmer      │  │ Access previous    │  │
│  │ academic terms     │  │ exam papers        │  │
│  └────────────────────┘  └────────────────────┘  │
│                                                  │
│  ┌────────────────────┐                          │
│  │ ◎                  │                          │
│  │ Reminders          │                          │
│  │                    │                          │
│  │ Track homework &   │                          │
│  │ exam deadlines     │                          │
│  └────────────────────┘                          │
│                                                  │
└──────────────────────────────────────────────────┘
 [Chat]  [Prompts]  [Dict]  [Exams]  [Reminders]
```

## AI Chat Interface
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  AI Chat                              [☰] [↺]   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │Tutor                                    ▼  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│                 ┌──────────────────────────────┐ │
│                 │                              │ │
│                 │ Hi there! I'm your personal  │ │
│                 │ tutor. How can I help you    │ │
│                 │ today with your studies?     │ │
│                 │                              │ │
│                 └──────────────────────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  │ Can you explain the water cycle in a     │    │
│  │ simple way?                              │    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│                 ┌──────────────────────────────┐ │
│                 │                              │ │
│                 │ The water cycle has four     │ │
│                 │ main stages:                 │ │
│                 │                              │ │
│                 │ 1. Evaporation: Water from   │ │
│                 │    oceans, lakes, and rivers │ │
│                 │    turns into water vapor    │ │
│                 │    when heated by the sun    │ │
│                 │                              │ │
│                 │ 2. Condensation: Water vapor │ │
│                 │    cools and forms clouds    │ │
│                 │                              │ │
│                 │ 3. Precipitation: Water      │ │
│                 │    falls from clouds as      │ │
│                 │    rain, snow, or hail       │ │
│                 │                              │ │
│                 │ 4. Collection: Water returns │ │
│                 │    to oceans, lakes, and     │ │
│                 │    rivers                    │ │
│                 │                              │ │
│                 └──────────────────────────────┘ │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────┐  [▶]     │
│  │ Ask Bun Theon AI...                │          │
│  └────────────────────────────────────┘          │
│                                                  │
└──────────────────────────────────────────────────┘
 [Chat]  [Prompts]  [Dict]  [Exams]  [Reminders]
```

## Chat Sidebar
```
┌───────────────────────────────────────┐
│                                       │
│  Chat History          [✕]            │
│                                       │
├───────────────────────────────────────┤
│                                       │
│  ┌───────────────────────────────┐    │
│  │ Tutor                     [+] │    │
│  │ General education help        │    │
│  └───────────────────────────────┘    │
│                                       │
│  ▸ Active chats                       │
│  ┌───────────────────────────────┐    │
│  │ Water cycle explanation       │    │
│  │ May 15, 3:45 PM · 3 msgs     │    │
│  └───────────────────────────────┘    │
│                                       │
│  ┌───────────────────────────────┐    │
│  │ Homework help                 │    │
│  │ May 14, 7:20 PM · 8 msgs     │    │
│  └───────────────────────────────┘    │
│                                       │
│  ▸ Previous chats                     │
│  ┌───────────────────────────────┐    │
│  │ Study planning                │    │
│  │ May 10, 4:15 PM              │    │
│  └───────────────────────────────┘    │
│                                       │
└───────────────────────────────────────┘
```

## Chat Interactions - Loading State
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  │ What's the formula for the area of a     │    │
│  │ circle?                                  │    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│                 ┌──────────────────────────────┐ │
│                 │                              │ │
│                 │ ● ○ ○                        │ │
│                 │                              │ │
│                 └──────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Component Detailed Views

### Message Bubbles - User
```
┌──────────────────────────────────────────┐
│                                          │
│ Can you explain the water cycle in a     │
│ simple way?                              │
│                                          │
└──────────────────────────────────────────┘

Style:
- Background: #e0f2fe (Light blue)
- Text color: #0f172a
- Border radius: 0.75rem
- Right-aligned
- Max width: 80%
- Subtle shadow
- Padding: 0.75rem
```

### Message Bubbles - AI Assistant
```
┌──────────────────────────────────────┐
│                                      │
│ The water cycle has four main stages:│
│                                      │
│ 1. Evaporation: Water from oceans,   │
│    lakes, and rivers turns into      │
│    water vapor when heated by the sun│
│                                      │
│ 2. Condensation: Water vapor cools   │
│    and forms clouds                  │
│                                      │
└──────────────────────────────────────┘

Style:
- Background: White
- Border: 1px solid #e2e8f0
- Text color: #0f172a
- Border radius: 0.75rem
- Left-aligned
- Max width: 80%
- Shadow: sm
- Padding: 1rem
```

### Persona Selector
```
┌────────────────────────────────────────────┐
│Tutor                                    ▼  │
└────────────────────────────────────────────┘

Dropdown opened:
┌────────────────────────────────────────────┐
│Tutor                                    ▲  │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ ✓ Tutor                                    │
│   Math Expert                              │
│   Science Guide                            │
│   Writing Coach                            │
└────────────────────────────────────────────┘

Style:
- Background: White
- Border: 1px solid #e2e8f0
- Text: #0f172a
- Hover state: Light gray background
- Selected: With checkmark
- Border radius: 0.5rem
- Animation: Subtle slide transition
```

### Input Box
```
┌────────────────────────────────────┐  [▶]
│ Ask Bun Theon AI...                │
└────────────────────────────────────┘

Active State:
┌────────────────────────────────────┐  [▶]
│ How do plants make their own food? │
└────────────────────────────────────┘

Style:
- Background: White
- Border: 1px solid #e2e8f0
- Focus state: Border 2px solid #2563eb, subtle glow effect
- Border radius: 0.5rem
- Send button: Icon only, primary color
- Animation: Slight grow effect on focus
```

### Navigation Bar
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    [Chat]   │  [Prompts]  │   [Dict]    │   [Exams]   │ [Reminders] │
│             │             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘

Style:
- Active tab: Primary color (Icon and label)
- Indicator: Small dot above active icon
- Inactive: Gray (Icon and label)
- Animation: Subtle scale and fade when switching
- Background: White with subtle top border
- Elevation: sm shadow
```

### Error Messages
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⚠️  Error                                      │
│                                                 │
│  Failed to connect to the AI service.           │
│  Please check your connection and try again.    │
│                                                 │
│                                      [Retry]    │
│                                                 │
└─────────────────────────────────────────────────┘

Style:
- Background: #fef2f2 (Light red)
- Border: 1px solid #fee2e2
- Text color: #b91c1c
- Border radius: 0.5rem
- Icon: Warning triangle
- Retry button: Ghost style with red text
- Padding: 1rem
- Shadow: sm
```

### Notifications
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ✓  Success                                     │
│  Your reminder has been saved                   │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                                                 │
│  ℹ️  Info                                       │
│  New exam papers are available                  │
│                                                 │
└─────────────────────────────────────────────────┘

Style:
- Success: #f0fdf4 background, #22c55e icon and border
- Info: #eff6ff background, #3b82f6 icon and border
- Warning: #fefce8 background, #eab308 icon and border
- Border radius: 0.5rem
- Duration: Fades after 4 seconds
- Animation: Slides in from top, fades out
- Height: Auto-adjusting to content
```

### Feature Cards on Home Screen
```
┌────────────────────────────────────┐
│                                    │
│  ◎ AI Chat                         │
│                                    │
│  Get homework help from our        │
│  AI tutor and practice assistant   │
│                                    │
└────────────────────────────────────┘

Standard State:
- Background: White
- Border: 1px solid #e2e8f0
- Border radius: 0.75rem
- Shadow: sm
- Padding: 1rem
- Icon: Primary color with light background circle

Hover State:
- Slightly elevated (shadow-md)
- Subtle background tint (#f8fafc)
- Smooth transition (150ms ease-in-out)

Active State:
- Pressed in feeling (transform: translateY(1px))
- Darker background tint
```

### Dictionary Search Interface
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Dictionary                                      │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ 🔍 Search for a term...                    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Recent Searches:                                │
│                                                  │
│  • Photosynthesis                                │
│  • Mitochondria                                  │
│  • Quadratic equation                            │
│                                                  │
│  Dictionary Categories:                          │
│                                                  │
│  ┌───────────────────┐  ┌───────────────────┐    │
│  │ Biology           │  │ Chemistry         │    │
│  └───────────────────┘  └───────────────────┘    │
│                                                  │
│  ┌───────────────────┐  ┌───────────────────┐    │
│  │ Physics           │  │ Mathematics       │    │
│  └───────────────────┘  └───────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Animation Guidelines

1. **Transitions Between Screens:**
   - Use slide transitions (left-to-right for backward, right-to-left for forward)
   - Duration: 200-300ms
   - Easing: ease-in-out

2. **Button Feedback:**
   - Subtle scale effect (transform: scale(0.98))
   - Color transition (150ms)
   - Ripple effect on touch/click

3. **Loading States:**
   - Soft pulsing animation for skeleton loaders
   - Bouncing dots for message loading (staggered animation)
   - Circular progress for uploads/downloads

4. **Hover Effects:**
   - Gentle elevation (increased shadow)
   - Subtle background color shifts
   - Scale: 1.01-1.02 maximum

5. **Microinteractions:**
   - Success checkmark animation (draw-in)
   - Error shake animation (subtle, 2-3 shakes)
   - Notification slide-in and fade

### Accessibility Considerations

1. **Color Contrast:**
   - All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
   - Interactive elements have sufficient contrast against backgrounds
   - Don't rely on color alone to convey meaning

2. **Touch Targets:**
   - Minimum 44x44px for all interactive elements
   - Adequate spacing between clickable elements (8px minimum)

3. **Motion and Animation:**
   - Respect user preferences for reduced motion
   - Essential animations are subtle and brief
   - No rapidly flashing content

4. **Text Legibility:**
   - Minimum text size of 14px for body text
   - Line height of at least 1.5 for optimal readability
   - Sufficient spacing between text blocks

5. **Keyboard Navigation:**
   - Clear focus indicators for all interactive elements
   - Logical tab order through the interface
   - Skip-to-content link for screen readers
