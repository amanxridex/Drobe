# UI Design & Styling Guidelines

## CRITICAL PERMANENT RULES: NO SPARKLES, NO FLOATING PILL BADGES & STRICT CATALOG INTEGRITY

1. **NEVER USE SPARKLE ICONS (`Sparkles` from `lucide-react` or similar)**:
   - Absolutely NEVER import or render `Sparkles`, `Sparkle`, or AI magic sparkle stars in any UI components, headers, modals, cards, or buttons.
   - Do NOT use sparkles to signify premium tiers, AI features, or highlights.
   - Use contextual, professional icons instead (e.g., `Crown` for premium, `CheckCircle2` for verified/features, `Zap` for speed/performance, or clean typography without decorative icons).

2. **NEVER USE DECORATIVE FLOATING PILL BADGES**:
   - Avoid AI-generated cliché pill tags like `rounded-full text-[10px] uppercase font-black tracking-wider px-3 py-1 bg-purple-500/10 border border-purple-500/20` floating above titles or inside modal headers.
   - Do NOT add small pill banners above modals (e.g., no "✨ WIPA SERVICE PROVIDER OPTIONS" or similar floating badge pills).
   - Use clean typographic hierarchy, elegant subheadings, and clear semantic layout containers instead of pill wrappers.

3. **NEVER USE UI MARKETING ASSETS, BANNERS, OR CATEGORY CARDS AS PRODUCTS**:
   - UI assets (such as lookbook marketing banners, category cards, subcategory promo graphics, and banners with text overlays like "SHOP NOW LIVE" or "SALE") are marketing assets, NOT products.
   - Absolutely NEVER add or mock these asset images as items in the product catalog (`PRODUCTS` array in `data/catalog.ts`).
   - Products in the catalog must ONLY use authentic product photography (e.g., actual angle item photos stored under `/assets/real/products/{id}/`).
