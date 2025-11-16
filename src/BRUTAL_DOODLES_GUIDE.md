# Neo-Brutalism Children's Artwork & Visual Elements Guide

This document details all the hand-drawn, sketchy visual elements added to give the platform a more authentic, crafted feel inspired by children's artwork.

## 🎨 Login Page Background - Children's Artwork

### Yellow Square (Top Left) - Stick Figure Family Drawing
- **Style**: Classic child's stick figure drawing
- **Elements**:
  - Smiling sun with rays in corner
  - Three stick figures (adult, child, baby) holding hands
  - Simple line bodies with circular heads
  - Grass line at bottom with wavy pattern
- **Opacity**: 40%
- **Rotation**: 12° clockwise

### Cyan Square (Bottom Right) - Watercolor Painting
- **Style**: Soft watercolor blobs and brushstrokes
- **Elements**:
  - Blue, purple, pink, yellow, green, and orange watercolor circles
  - Overlapping translucent layers (20-35% opacity)
  - Organic elliptical shapes
  - Paint brush stroke effects
- **Overall Opacity**: Varies 15-35% per blob
- **Rotation**: 12° counter-clockwise

### Pink Square (Center Left) - Pete the Cat Book Style
- **Style**: Simple line drawing inspired by Pete the Cat children's books
- **Elements**:
  - Simple blue cat with round head and body
  - Triangle ears
  - Large circular eyes with highlights
  - Whiskers extending from face
  - Four legs with simple lines
  - Curvy tail
  - Buttons on body
  - Smiling mouth
- **Opacity**: 50%
- **Rotation**: 45° clockwise

### Purple Square (Bottom Center) - House Drawing
- **Style**: Classic children's house drawing
- **Elements**:
  - Square house body with triangular roof
  - Rectangular door with doorknob
  - Two windows with crosshairs (4-pane style)
  - Chimney with curly smoke
  - Ground line
  - Small flowers on either side
- **Opacity**: 35%
- **Rotation**: 6° counter-clockwise

## ✨ Title Area Decorations

### Around Logo
- **Top left**: Zigzag line pattern
- **Top right**: Circle with dot (target-like)

### Around "MOSAIC" Title
- **Left sparkle**: Large 8-point star
- **Right sparkle**: Smaller 8-point star
- **Underline**: Hand-drawn curved underline below title

### Yellow Badge ("Celebrating Student Creativity")
- **Arrow**: Pointing arrow on right side
- **Rotation**: 1° counter-clockwise

## 📝 Post-it Notes (Magic Link Success Screen)

### Note 1: "Check your inbox..."
- **Position**: Rotated 1° clockwise
- **Color**: Yellow-300 background
- **Doodle**: Envelope icon (bottom right corner)
- **Opacity**: 40%

### Note 2: "Click the magic link..."
- **Position**: Rotated 2° counter-clockwise
- **Color**: Yellow-300 background
- **Doodles**: 
  - Cursor/pointer icon (bottom right)
  - Arrow pointing inward (top right)
- **Opacity**: 30-40%

### Note 3: "You'll be automatically logged in!"
- **Position**: Rotated 2° clockwise
- **Color**: Yellow-300 background
- **Doodles**:
  - Three celebration stars (bottom right)
  - Checkmark (top right)
  - Underline scribble (under text)
- **Opacity**: 20-40%

## 🎯 Design Principles

1. **Hand-drawn aesthetic**: All SVG paths use rough, imperfect lines
2. **Varied opacity**: 20-40% opacity keeps doodles subtle
3. **Rotation variety**: -12° to +12° for organic feel
4. **Strategic placement**: Corners and edges for balance
5. **Purposeful icons**: Each doodle relates to its context
   - Envelope for email
   - Cursor for clicking
   - Stars for celebration
   - Lightning for energy

## 📐 Implementation Notes

- All doodles use inline SVG for easy customization
- `strokeWidth` of 2-3px for hand-drawn feel
- `strokeLinecap="round"` and `strokeLinejoin="round"` for organic corners
- Positioned with `absolute` positioning relative to parent containers
- Colors use opacity to blend with background

## 🔄 Rotation Angles Used

- **-12°**: Large counter-clockwise tilt (dramatic)
- **-6°**: Medium counter-clockwise tilt
- **-2° to -1°**: Subtle counter-clockwise tilt
- **+1° to +2°**: Subtle clockwise tilt
- **+3° to +6°**: Medium clockwise tilt
- **+12° to +45°**: Large clockwise tilt (dramatic)

## 🌈 Color Palette for Doodles

All doodles use pure black (`stroke="black"` or `fill="black"`) at reduced opacity to blend naturally with the vibrant backgrounds:

- Yellow-300/400 backgrounds
- Cyan-300/400 backgrounds
- Pink-400 backgrounds
- Purple-400 backgrounds

This creates a cohesive, playful aesthetic while maintaining the bold Neo-Brutalism style.
