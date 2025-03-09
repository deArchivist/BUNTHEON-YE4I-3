# UI Redesign Mockups with Mantine UI Theme

Main goal of this UI design is to achieve a subtle modern, clean, beautiful, seamless, smooth, and intuitive user experience.

## Color Palette

```
Primary:rgb(172, 184, 247) (Soft lavender blue)
Secondary:rgb(219, 193, 247) (Soft lilac)
Accent:rgb(153, 183, 240) 
Neutral:    #f5f5f4 (Soft cream)
Base:       #ffffff (White)
Error:rgb(253, 164, 164) (Soft coral)
Warning:rgb(252, 147, 77) 
Success:rgb(150, 255, 150) 
```

## Navigation Bar Mockup

```
┌──────────────────────────────────────────────────────┐
│                                                      │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│                                                      │
│                     Content Area                     │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  ⚪────────────⚪────────────⚪────────────⚪─────────  │
│  │            │            │            │            │
│ 🧠          📖          📚          📋          🗓  │
│ Chat      Prompts     Dict        Exams     Reminders│
└──────────────────────────────────────────────────────┘
```

- Bottom navigation with soft-rounded square indicators in primary color (#a5b4fc)
- Active tab has a soft gradient background and deeper color
- Icons have a flat and modern look (not emoji as shown in the mockup, replace them with appropriate icons)
- Light shadow for subtle elevation
- Pure white background with clean separation

## AI Chat Interface Mockup

```
┌──────────────────────────────────────────────────────┐
│ Bun Theon AI Chat                         🎭    🔄  │
└──────────────────────────────────────────────────────┘
│ ✨ Tutor                                           ▼ │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                                                      │
│                       ┌──────────────────┐           │
│                       │ Hello! How can I │           │
│                       │ help you today?  │           │
│                       └──────────────────┘           │
│                                                      │
│ ┌────────────────────────┐                           │
│ │ Can you explain        │                           │
│ │ photosynthesis?        │                           │
│ └────────────────────────┘                           │
│                                                      │
│                       ┌──────────────────┐           │
│                       │ Photosynthesis   │           │
│                       │ is the process   │           │
│                       │ where plants...  │           │
│                       └──────────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────┐  📤   │
│ │ Ask Bun Theon AI...                        │       │
│ └────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

- User bubbles: Soft blue (#a5b4fc) with slight gradient
- AI bubbles: White with soft lilac (#d8b4fe) border
- Loading animation: Bouncing dots in white colors
- Persona selector with soft rounded rectangular design
- Input bar with soft rounded rectangular and subtle shadow
- Send button with a gentle hover effect

## Home Page Card Layout

```
┌──────────────────────────────────────────────────────┐
│ BUNTHEON                                             │
│ Your Educational Companion                           │
└──────────────────────────────────────────────────────┘

Hello,  {USERNAME}! What would you like to learn today?



#a reminder card/block showing 2-3 most recent list of reminders


┌─────────────────────┐  ┌─────────────────────┐
│   ┌───┐             │  │   ┌───┐             │
│   │🧠│ AI CHAT      │  │   │📖│ PROMPT       │
│   └───┘             │  │   └───┘ LIBRARY     │
│                     │  │                     │
│ Chat with our AI    │  │ Browse educational  │
│ tutor for help      │  │ prompt collections  │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   ┌───┐             │  │   ┌───┐             │
│   │📚│ DICTIONARY   │  │   │📋│ EXAM         │
│   └───┘             │  │   └───┘ PAPERS      │
│                     │  │                     │
│ English-Khmer       │  │ Access previous     │
│ academic terms      │  │ exam papers         │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   ┌───┐             │  │   ┌───┐             │
│   │🗓│ REMINDERS    │  │    ⏲️   POMODORO    │
│   └───┘             │  │   └───┘             │
│                     │  │                     │
│ English-Khmer       │  │ Access previous     │
│ academic terms      │  │ exam papers         │
└─────────────────────┘  └─────────────────────┘

```

- Cards with soft rounded corners (radius: 1rem)
- Each card has a subtle smooth background and a depth shadow matching its category
- Subtle shadow effect on cards (box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1))
- Icon with rounded pastel background
- Hover effect: Slight elevation with deeper shadow

## Component Styles

### Buttons

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│    Primary     │  │   Secondary    │  │     Ghost      │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│     Accent     │  │    Outline     │  │      Link      │
└────────────────┘  └────────────────┘  └────────────────┘
```

Primary:rgb(167, 181, 250) (Soft lavender blue)
Secondary:rgb(213, 179, 250) (Soft lilac)
Accent:rgb(153, 183, 240) 
Neutral:    #f5f5f4 (Soft cream)
Base:       #ffffff (White)
Error:rgb(253, 164, 164) (Soft coral)
Warning:rgb(252, 147, 77) 
Success:rgb(150, 255, 150) 
- All buttons have rounded corners (border-radius: 1rem)
- Gentle hover effects (slight darkening, subtle shadow)
- Consistent padding (0.75rem 1.25rem)
- No harsh transitions - all smooth and soft

