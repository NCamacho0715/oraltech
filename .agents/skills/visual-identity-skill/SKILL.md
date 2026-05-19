# Visual Identity Skill - OralTech Frontend

This skill defines the visual standards, design tokens, and UI patterns for the OralTech platform to ensure consistency across all future developments.

## Design Tokens

### Color Palette (Light Mode)
- **Primary**: `#0077b6` (Deep Teal) - Used for headers, primary buttons, and branding.
- **Primary Light**: `#00b4d8` (Sky Blue) - Hover states and subtle highlights.
- **Secondary**: `#90e0ef` - Border accents and icons.
- **Secondary Soft**: `#caf0f8` - Section backgrounds and subtle badges.
- **Background**: `#f8fbff` - Main page background.
- **Surface**: `#ffffff` - Card and form containers.
- **Text Main**: `#1d3557` - Headers and primary readability.
- **Text Secondary**: `#457b9d` - Supporting labels and metadata.
- **Accent**: `#e63946` (Vibrant Red) - Errors, deletions, and urgent notifications.
- **Success**: `#2a9d8f` (Teal Green) - Confirmation signals and valid states.

### Color Palette (Dark Mode)
- **Background**: `#0f172a` (Slate 900)
- **Surface**: `#1e293b` (Slate 800)
- **Text Main**: `#f1f5f9` (Slate 100)
- **Text Secondary**: `#94a3b8` (Slate 400)

## UI Components & Patterns

### 1. Containers (Cards)
- **Class**: `.auth-card`
- **Background**: `var(--surface)`
- **Border Radius**: `12px`
- **Shadow**: `0 10px 30px rgba(0, 119, 182, 0.08)`
- **Border**: `1px solid var(--border-color)`
- **Animation**: `fadeIn 0.6s ease-out`

### 2. Forms & Inputs
- **Padding**: `0.8rem 1rem`
- **Border**: `1px solid var(--border-color)`
- **Background**: `var(--surface)`
- **Focus State**: `border-color: var(--primary)` with a subtle outer glow.
- **Labels**: Inter Regular/Medium, `0.9rem`, `var(--text-main)`.

### 3. Buttons
- **Primary**: Linear gradient from `var(--primary)` to `var(--primary-light)`.
- **Interactions**:
    - Hover: Translate -2px Y-axis, enhanced shadow.
    - Transitions: `all 0.3s ease`.
- **Destructive (Delete)**: Transparent bg with `var(--accent)` icons/text.

### 4. Navigation (Clinical History)
- **Layout**: Sidebar with vertical tabs (280px width).
- **Active State**: Solid `var(--primary)` background, white text.
- **Inactive State**: `var(--text-secondary)` color, subtle hover background.

## UI Logic & Micro-interactions
- **Success Feedback**: Check icon + "Guardado" text (color `#10b981`) that fades after 3 seconds.
- **Modals**: Backdrop blur (`backdrop-filter: blur(4px)`) and centered card with a deep shadow.
- **Transitions**: Every color/transform change must use `0.3s ease` to maintain a premium "smooth" feel.

## Typography
- **Primary Font**: `Inter`, sans-serif (Google Fonts).
- **Hierarchy**:
    - `H1`: 2.2rem, 700 weight, `var(--text-main)`.
    - `H3`: 1.4rem, 600 weight.
    - `Body`: 1rem, 1.6 line-height.

## Checkpoint for Future Visuals
1. Ensure all colors use CSS variables (eg. `color: var(--primary)`).
2. Maintain `12px` border radius on all main containers.
3. Use `Lucide-React` for icons to match the existing icon set.
4. Always implement both Light and Dark mode variables if adding new tokens.
