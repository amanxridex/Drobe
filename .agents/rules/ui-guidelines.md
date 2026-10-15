# UI Design & Styling Guidelines

## CRITICAL PERMANENT RULES: NO GLOWS, NO GRADIENT COLORING, NO PILLS, APPLE FONTS & NATIVE APP TACTILITY

### 1. NO GLOWS & NO GRADIENTS COLORING (SIMPLE & SOBER)
- Absolutely NEVER use neon glow effects, radial gradient blur glows behind cards, glowing drop-shadows, or rainbow/candy gradient coloring.
- Keep the aesthetic simple, sober, matte, and monochromatic luxury.
- Backgrounds must use clean solid dark tones (e.g. `#000000`, `#09090b`, `#121214`, cards `#18181b` / `#1c1c22`, borders `1px solid #272730`).
- Accent colors should be purposeful, solid, and restrained (e.g. pure white `#ffffff`, lime accent `#d2f831`, or emerald `#00d26a`), never multi-color gradient sweeps.

### 2. NO DECORATIVE FLOATING PILL BADGES & NO PILLS
- Avoid AI-generated cliché pill tags like `rounded-full text-[10px] uppercase font-black tracking-wider px-3 py-1 bg-purple-500/10 border border-purple-500/20` floating above titles or inside modal headers.
- Do NOT add small pill banners above modals (e.g., no "✨ WIPA SERVICE PROVIDER OPTIONS" or similar floating badge pills).
- Use clean typographic hierarchy, elegant subheadings, and clear semantic layout containers instead of pill wrappers.

### 3. NO SPARKLES
- Absolutely NEVER import or render `Sparkles`, `Sparkle`, or AI magic sparkle stars in any UI components, headers, modals, cards, or buttons.
- Do NOT use sparkles to signify premium tiers, AI features, or highlights.
- Use contextual, professional icons instead (e.g., `Crown` for premium, `CheckCircle2` for verified/features, `Zap` for speed/performance, or clean typography without decorative icons).

### 4. APPLE SYSTEM FONTS (SF PRO HIERARCHY)
- Always use the Apple system font hierarchy:
  `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif`
- Typography should be clean, sober, with balanced kerning (`letterSpacing: '-0.01em'` to `'-0.02em'` for headings, clean readability for body text).

### 5. NATIVE MOBILE APP TACTILE TOUCH & TAP MICRO-ANIMATIONS ("FEEL THE CLICK")
- Every interactive element (buttons, tabs, list rows, toggle switches, cards, navigation items) MUST feel like a native iOS/Android mobile app.
- Provide physical tactile feedback on tap/click:
  - Buttons & Cards: `whileTap={{ scale: 0.96 }}` with spring transition (`transition={{ type: 'spring', stiffness: 450, damping: 25 }}`).
  - Icon Buttons & Small Controls: `whileTap={{ scale: 0.90 }}`.
  - Interactive List Items: `whileTap={{ scale: 0.98, backgroundColor: '#22222a' }}`.
  - Toggle Switches: Smooth spring sliding animation for the knob with haptic feel.
- Ensure `-webkit-tap-highlight-color: transparent` and `cursor: pointer` are applied.
- The user must immediately feel a satisfying, responsive click response.

### 6. SOBER APPLE/FIGMA GROUPED CARD ARCHITECTURE (AS IN REFERENCE)
- Profile Screen:
  - Clean top header with "My profile" on left and action controls (activity score / settings gear) on right.
  - Large centered circular avatar with subtle 1px border.
  - Bold name with green verified checkmark badge (`CheckCircle2`).
  - Minimal stats row (e.g. `Ahmedabad Darkstore Hub · 4 Orders · 2 Saved Fits`).
  - Tactile segmented tabs (e.g. `[Feed]` `[Orders]` `[Addresses]` or `[Activity]` `[Try & Buy]` `[Saved]`) where the active tab has a solid sober accent and inactive tabs have dark bordered surfaces.
  - Feed / activity cards with creator row, photo/media preview, and comment/like engagement counters.
- Settings Screen:
  - Centered "Settings" header with back arrow.
  - Profile banner row linking to Edit Profile.
  - Grouped table-view cards (`borderRadius: 16px`) with 1px row dividers (`#24242e`), icons, clean labels, and right-aligned chevrons `>` or native toggle switches.
  - Standalone rounded "Log Out" button with red text.
- Edit Profile Screen:
  - Centered avatar with camera button badge overlay.
  - Grouped input card with labels on the left (`Full name`, `Phone number`, `Email`, `Username`) and inputs on the right.
  - Solid sober "Save Changes" button with tactile tap feedback.

### 7. NEVER USE UI MARKETING ASSETS, BANNERS, OR CATEGORY CARDS AS PRODUCTS
- UI assets (such as lookbook marketing banners, category cards, subcategory promo graphics, and banners with text overlays like "SHOP NOW LIVE" or "SALE") are marketing assets, NOT products.
- Absolutely NEVER add or mock these asset images as items in the product catalog (`PRODUCTS` array in `data/catalog.ts`).
- Products in the catalog must ONLY use authentic product photography (e.g., actual angle item photos stored under `/assets/real/products/{id}/`).
