# Research: UX Design Patterns for "Misleading Name" Problem
Date: 2026-02-15

## Summary
Comprehensive research into UX design patterns that help users discover content they think they know but don't - specifically addressing the problem where game names are misleading (e.g., "ClusterTruck" sounds like a driving game but is actually parkour/agility). This research focuses on desktop web interfaces with low-friction interaction patterns that don't require forced clicks to discover content.

## Prior Research
No directly related research found in AI_RESEARCH/. This is the first research document on game discovery UX patterns for this project.

## Current Findings

---

## Top 5 Design Patterns for Solving the Misleading Name Problem

### 1. **Netflix-Style Hover Preview Cards**

**Description:**
When users hover over a card, it enlarges slightly (typically using CSS transform: scale()) and reveals additional content without affecting document flow. Netflix's implementation auto-plays trailer videos on hover, providing instant context about content.

**Use Cases:**
- Best for visually-driven content where a video/GIF preview instantly clarifies what the game is about
- Ideal for desktop interfaces with ample screen real estate
- Effective when users are browsing and need quick decision-making aids

**Implementation Details:**
- Card animates transform property (scale() function) instead of width to avoid affecting sibling elements
- Auto-plays short preview video/GIF on hover after ~500ms delay
- Expands to show additional metadata (genre tags, one-liner description)
- Neighbouring items push outward as hovered item grows
- Row lengthens to accommodate expanded card (overflow handled gracefully)

**Real-World Example:**
Netflix's content browse interface - hovering over any title triggers expansion and preview playback

**Pros:**
- **Low friction**: Zero clicks required to discover content
- **Rich context**: Video/GIF provides immediate understanding of gameplay
- **Familiar pattern**: Users are accustomed to this from Netflix, Hulu, etc.
- **Scalable**: Works well with large catalogs
- **Progressive disclosure**: Shows only what's needed, when it's needed

**Cons:**
- **Accessibility concerns**: Hover-only interactions exclude keyboard-only users (must provide keyboard focus equivalent)
- **Performance**: Auto-playing video/GIFs can impact performance with many cards
- **Mobile incompatible**: Hover doesn't translate to touch devices
- **Data intensive**: Requires video/GIF assets for all games
- **Distraction**: Auto-play can be overwhelming if multiple cards trigger simultaneously

**Accessibility Requirements (WCAG 1.4.13):**
- Must support keyboard focus trigger (not just hover)
- Content must be **dismissible** (ESC key to close)
- Content must be **hoverable** (pointer can move over expanded content)
- Content must be **persistent** (remains visible until user dismisses or removes focus)

**Data Requirements from RAWG API:**
- **Short video clips** (YouTube videos - available only for business/enterprise API users)
- **Screenshots** (2.1M+ available via free API)
- **GIF alternatives**: Could convert first 3-5 seconds of gameplay video to GIF
- **Genre tags** (available)
- **Short description** or tagline (available)

**Sources:**
- [Netflix Style Card Hover Animation - CodeMyUI](https://codemyui.com/netflix-style-card-hover-animation/)
- [How to Re-Create a Nifty Netflix Animation in CSS - CSS-Tricks](https://css-tricks.com/how-to-re-create-a-nifty-netflix-animation-in-css/)
- [Netflix UX Case Study - Medium](https://medium.com/@pixelplasmadesigns/netflix-ux-case-study-the-psychology-design-and-experience-afecb135470f)
- [WCAG 1.4.13: Content on Hover or Focus - W3C](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)

---

### 2. **Progressive Disclosure with Expandable Accordions**

**Description:**
Cards initially show minimal information (name, status, basic tags). Clicking an expand icon reveals full details inline without navigating away. Only one or multiple cards can be expanded simultaneously depending on implementation.

**Use Cases:**
- Best when users need to compare multiple games side-by-side
- Ideal for spec-driven content where text descriptions are more valuable than visuals
- Effective for mobile-responsive designs (unlike hover patterns)
- Works well when detailed information (features, requirements, full descriptions) is needed

**Implementation Details:**
- Chevron icon (pointing right = collapsed, pointing down = expanded)
- Smooth height animation (CSS transitions)
- Expanded state shows: full description, genre tags, platform details, links, screenshots
- Option for "Expand All" / "Collapse All" buttons
- Maintains position in list (doesn't navigate away)

**Real-World Examples:**
- FAQ sections (Stripe, Apple, Airbnb)
- Product specification sections (Amazon)
- Filter panels on e-commerce sites
- Board Game Geek game feature lists

**Pros:**
- **Click-based**: More explicit interaction (users choose what to explore)
- **Mobile-friendly**: Works equally well on touch and desktop
- **Accessible**: Naturally keyboard navigable with proper ARIA roles
- **Comparison-friendly**: Multiple cards can be expanded for side-by-side comparison
- **No performance hit**: No media assets required until expanded
- **Content-rich**: Can display extensive information without overwhelming initial view

**Cons:**
- **Requires click**: Higher friction than hover patterns (one additional interaction)
- **Visual clutter**: Many expanded cards can create a long, disjointed page
- **Discoverability**: Users may not realize cards are expandable without clear affordances
- **State management**: Complexity increases with "expand all" features and URL state sync

**Accessibility Requirements:**
- Use semantic `<details>` / `<summary>` HTML or proper ARIA roles (`role="button"`, `aria-expanded`, `aria-controls`)
- Ensure keyboard navigation (Enter/Space to toggle)
- Use focus indicators that meet WCAG contrast requirements
- Large enough touch targets (min 44x44px) for mobile

**Data Requirements from RAWG API:**
- **Full game description** (available)
- **Genre and tag lists** (58,000+ tags available)
- **Screenshots** (2.1M+ available)
- **Store links** (available)
- **Platform information** (available)
- **Ratings and reviews** (1.1M+ ratings available)
- **Metacritic scores** (available)
- **Average playtime** (available)

**Sources:**
- [Designing The Perfect Accordion - Smashing Magazine](https://www.smashingmagazine.com/2017/06/designing-perfect-accordion-checklist/)
- [Accordion UI Design Best Practices - Mobbin](https://mobbin.com/glossary/accordion)
- [Accordion UI Examples - Eleken](https://www.eleken.co/blog-posts/accordion-ui)
- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)

---

### 3. **Steam-Inspired 3D Card Tilt with Overlay**

**Description:**
A sophisticated hover effect where cards respond to cursor position with 3D rotation (tilt toward cursor) and reveal an overlay with quick-view information. Dynamic lighting follows cursor movement creating a "spotlight" effect.

**Use Cases:**
- Best for creating a premium, polished interface
- Ideal when you want to differentiate from generic card grids
- Effective for games where visual appeal is a key selling point
- Works well for smaller catalogs where each item gets attention

**Implementation Details:**
- `transform: rotate3d()` CSS property tilts card based on cursor position
- Dynamic lighting via `filter: brightness()` changes with cursor vertical position
- Card scales up (~1.1-1.5x) on hover
- Overlay appears with genre tags, short description, and call-to-action button
- Drop shadow enhances 3D effect
- JavaScript tracks cursor position and calculates rotation angles
- Blur effect applied to non-hovered cards for focus

**Real-World Example:**
Steam's trading card hover effect and game library hover interactions

**Pros:**
- **Visual delight**: Creates memorable, premium experience
- **Attention-grabbing**: Parallax effect naturally draws eye
- **Differentiation**: Stands out from standard card grids
- **Low friction**: Information appears on hover without clicks
- **Contextual focus**: Blur effect on other cards reduces distraction

**Cons:**
- **Complex implementation**: Requires JavaScript for cursor tracking and calculations
- **Performance intensive**: Many simultaneous 3D transforms can cause jank
- **Accessibility barriers**: Difficult to replicate with keyboard navigation
- **Overkill for simple tasks**: May be too flashy for utilitarian game directories
- **Mobile incompatible**: No hover on touch devices

**Accessibility Considerations:**
- Must provide keyboard focus alternative
- Consider motion preferences (prefers-reduced-motion CSS)
- Ensure overlay text has sufficient contrast
- Provide clear focus indicators

**Data Requirements from RAWG API:**
- **Background images** or hero screenshots (available)
- **Genre tags** (available)
- **Short description** (available)
- **Rating information** (available)

**Sources:**
- [Steam Inspired Game Card Hover Effect - GitHub Gist](https://gist.github.com/eric-otto/873c75a102f7dc7289db05705b90f1d7)
- [Recreating the Steam Trading Card Hover Effect - Constantinos.dev](https://constantinos.dev/posts/recreating-the-steam-trading-card-hover-effect-using-html-css-and-javascript/)
- [CSS Card Hover Effects - Subframe](https://www.subframe.com/tips/css-card-hover-effect-examples)

---

### 4. **Descriptive Tooltips with Rich Content**

**Description:**
Traditional tooltip pattern enhanced with rich content: genre tags, one-liner description, and visual icon indicators. Appears on hover over game name or info icon with 300-500ms delay.

**Use Cases:**
- Best for maintaining compact layouts while providing quick context
- Ideal as a lightweight supplement to other patterns
- Effective when space is constrained (dense tables or grids)
- Works well for power users who need quick reference

**Implementation Details:**
- Tooltip triggers on hover over game name or dedicated info icon (ⓘ)
- 300-500ms delay before appearance (prevents accidental triggers)
- Contains: genre tags, one-liner description, maybe a small thumbnail
- Arrow points to triggering element
- Positioned to avoid obscuring related content
- High contrast background (dark tooltip on light background or vice versa)
- Max-width constraint (200-300px) for readability

**Real-World Examples:**
- GitHub's issue/PR tooltips showing preview information
- Twitter's profile preview cards on hover
- LinkedIn's quick-view profiles

**Pros:**
- **Minimal layout impact**: Doesn't change existing card structure
- **Lightweight**: Easy to implement with CSS and minimal JavaScript
- **Familiar pattern**: Users understand tooltip interactions
- **Low performance cost**: No heavy media assets required
- **Stackable**: Can combine with other patterns (e.g., tooltip + accordion)

**Cons:**
- **Limited content**: Space constraints limit what you can show
- **Hard to discover**: Users may not know tooltips exist without visual cues
- **Hover-only limitation**: Same accessibility concerns as other hover patterns
- **Fleeting**: Content disappears when hover is removed
- **Not for essential info**: Should never contain critical information per NN/g guidelines

**Critical NN/g Guidelines:**
- **Never use for essential information**: "Users shouldn't need to find a tooltip in order to complete their task"
- **Keep content concise**: Brief, valuable content only - avoid redundancy
- **Support keyboard navigation**: Must trigger on keyboard focus, not just hover
- **Don't duplicate visible text**: Tooltips repeating button labels are not beneficial
- **Ensure discoverability**: Inconsistent tooltip implementation prevents users from discovering the feature

**Accessibility Requirements (WCAG 1.4.13):**
- Dismissible via ESC key
- Hoverable (pointer can move over tooltip content)
- Persistent until user dismisses or removes trigger
- Keyboard accessible (focus trigger)
- Sufficient contrast (4.5:1 for normal text)

**Data Requirements from RAWG API:**
- **Genre tags** (available)
- **Short description** or tagline (available via description field - would need to extract first sentence)
- **Thumbnail image** (screenshots available)
- **Rating score** (available)

**Sources:**
- [Tooltip Guidelines - Nielsen Norman Group](https://www.nngroup.com/articles/tooltip-guidelines/)
- [Tooltip Best Practices - CSS-Tricks](https://css-tricks.com/tooltip-best-practices/)
- [WCAG 1.4.13: Content on Hover or Focus - W3C](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
- [Designing Better Tooltips - LogRocket](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)

---

### 5. **Quick View Modal (E-commerce Pattern)**

**Description:**
Clicking a "Quick View" button or game card opens a modal overlay with detailed preview information (description, screenshots, genre, platform) without navigating away from the list. Users can close modal and continue browsing.

**Use Cases:**
- Best for visually-driven products where images/screenshots tell the story
- Ideal when users want deep-dive information without losing their place
- Effective for game discovery where users are exploring multiple options
- Works well when conversion/action is goal (e.g., "Add to favorites", "Learn more")

**Implementation Details:**
- Button/card click triggers modal overlay
- Modal contains: large screenshots carousel, full description, genre tags, ratings, store links, call-to-action buttons
- Semi-transparent backdrop dims background content
- ESC key or X button closes modal
- Modal is centered and responsive
- Previous/Next buttons to navigate between games without closing modal
- Focus trap within modal (keyboard navigation stays inside)

**Real-World Examples:**
- Product Quick View on e-commerce sites (though research shows mixed effectiveness)
- Steam's detail overlay when clicking games in search results
- App store preview modals (iOS App Store, Google Play)

**Pros:**
- **Comprehensive information**: Room for extensive details, multiple screenshots, videos
- **Maintains context**: Users stay on browse page, don't lose position
- **Action-oriented**: Clear call-to-action buttons (Learn More, Add to Library, etc.)
- **Keyboard accessible**: Can be fully navigable with keyboard
- **Gallery support**: Image carousels show multiple screenshots
- **Sequential browsing**: Next/Previous buttons enable quick comparison

**Cons:**
- **Higher friction**: Requires explicit click (not hover)
- **Modal fatigue**: Users may find frequent modal opening/closing tedious
- **Context-dependent effectiveness**: Baymard research shows Quick View works better for visually-driven products than spec-driven ones
- **Implementation complexity**: Focus management, accessibility, and state management are complex
- **Mobile challenges**: Modals can be awkward on small screens

**When to Use / When to Avoid (per Baymard Institute research):**
- **Use for visually-driven products**: Quick Views help users stay anchored in the product list
- **Avoid for spec-driven products**: Testing on spec-driven sites (Newegg, Grainger) revealed Quick Views add friction without substantial UX benefits
- Games are **visually-driven**, so this pattern is appropriate

**Accessibility Requirements:**
- Focus trap (Tab navigation stays within modal)
- ESC key dismisses modal
- Focus returns to triggering element on close
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Close button is keyboard accessible
- Sufficient contrast for modal content
- Backdrop prevents interaction with background elements

**Data Requirements from RAWG API:**
- **Full game description** (available)
- **Multiple screenshots** (2.1M+ available, can fetch game-specific collection)
- **Genre and tags** (available)
- **Platform information** (available)
- **Ratings and Metacritic score** (available)
- **Store links** (available)
- **Videos** (available for business/enterprise API users)
- **Developer/publisher info** (220K developers, 45K publishers available)

**Sources:**
- [Product Quick View in CSS and jQuery - CodyHouse](https://codyhouse.co/gem/css-product-quick-view/)
- [Avoid "Quick Views" for Spec-Driven Product Types - Baymard Institute](https://baymard.com/blog/ecommerce-quick-views)
- [Provide "Quick Views" for Visually Driven Products - Baymard Institute](https://baymard.com/blog/mobile-desktop-quick-views)
- [How to Optimize eCommerce Conversion Rates by Replacing 'Quick View' - Prototypr](https://blog.prototypr.io/how-to-optimize-ecommerce-conversion-rates-by-replacing-quick-view-fa75dfd5ac93)

---

## Additional Pattern: Tag-Based Visual Taxonomy (Supplementary)

**Description:**
Not a standalone pattern, but a critical foundation for all above patterns. Display genre/mechanic tags visibly on cards using a clear visual taxonomy (color-coding, icons, or standardized labels).

**Research Background:**
Research on video game visual style taxonomy found that "discovery and retrieval of video games depends on limited descriptive metadata, with classifications of visual style noticeably missing." Modern taxonomies assign genres based on gameplay rather than story/theme/setting.

Steam uses seven "capital tags": Multiplayer, Singleplayer, Action, Casual, Adventure, Strategy, and Anime. Tags are divided into taxa: Genres, Visual Properties, Themes & Moods, Features, Players.

**Implementation Recommendations:**
- Display 3-5 most relevant genre/mechanic tags on each card
- Use consistent color scheme for tag categories (e.g., blue for genre, green for mechanics)
- Consider icon system for common tags (multiplayer icon, puzzle icon, etc.)
- Tags should be clickable filters
- Use sentence-case labels ("Parkour" not "PARKOUR")

**Data Requirements from RAWG API:**
- **58,000+ tags available** via RAWG API
- **Genre classifications** (available)
- **Tag metadata** (available)

**Sources:**
- [Art in an algorithm: A taxonomy for describing video game visual styles - Wiley](https://asistdl.onlinelibrary.wiley.com/doi/abs/10.1002/asi.23988)
- [Data-Driven Classifications of Video Game Vocabulary - arXiv](https://arxiv.org/pdf/2303.07179)
- [Game Taxonomies: Framework for Game Analysis - Gamedeveloper.com](https://www.gamedeveloper.com/design/game-taxonomies-a-high-level-framework-for-game-analysis-and-design)

---

## Cross-Pattern Accessibility Considerations

All hover-based patterns must comply with WCAG 2.1 Level AA Success Criterion 1.4.13:

### Three Required Conditions:
1. **Dismissible**: User can dismiss additional content without moving focus (ESC key)
2. **Hoverable**: Pointer can move over the additional content without it disappearing
3. **Persistent**: Content remains visible until trigger is removed, user dismisses it, or information becomes invalid

### Keyboard Navigation:
- All hover interactions must also be triggerable via keyboard focus
- Use `:focus` pseudo-class alongside `:hover`
- Ensure focus indicators meet contrast requirements
- Never rely solely on hover for menu visibility

### Motion Preferences:
- Respect `prefers-reduced-motion` media query
- Disable animations/auto-play for users who request reduced motion
- Provide static alternatives for video/GIF content

### Additional Best Practices:
- Don't automatically open menus on hover alone; offer focus or click-based activation
- Any hover and focus behaviors must be dismissible, hoverable, and persistent
- Consider using focus instead of hover, with visual focus indicators meeting WCAG contrast requirements

**Sources:**
- [WCAG 1.4.13: Content on Hover or Focus - W3C](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
- [Hover Actions and Accessibility - BOIA](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation)
- [Use Hover and Focus Best Practices - Access Guide](https://www.accessguide.io/guide/hover-and-focus)
- [Accessible Navigation Menus - Level Access](https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/)

---

## RAWG API Data Availability Summary

Based on official RAWG API documentation and resources:

### Available via Free API (with attribution):
- **2,100,000 screenshots**
- **1,100,000 ratings**
- **500,000+ games**
- **58,000 tags**
- **45,000 publishers**
- **220,000 developers**
- **24,000 people**
- Game descriptions
- Genres and tags
- Platform information
- Store links
- Metacritic ratings
- Average playtime
- Official websites
- System requirements
- DLCs and franchises

### Available ONLY for Business/Enterprise API Users:
- **Videos from YouTube** associated with games
- **Twitch streams** associated with games

### API Usage Limits:
- **Free tier**: Personal use with RAWG attribution, or commercial use for startups/hobby projects with <100K monthly active users or <500K page views/month
- **API key required**: Must include with every request

### Key Endpoints:
- `/games/{id}/screenshots` - Get game screenshots
- `/games/{id}/movies` - Get YouTube videos (business/enterprise only)
- `/games/{id}` - Get full game details
- `/games` - Search/filter games

**Sources:**
- [RAWG Video Games Database API Documentation](https://api.rawg.io/docs/)
- [Explore RAWG API - RAWG](https://rawg.io/apidocs)
- [Launching Public API for the Largest Video Game Database - Medium](https://medium.com/rawg/launching-public-api-for-the-largest-video-game-database-in-the-world-fa260a336079)

---

## Recommended Pattern Combinations

### Option A: Hybrid Hover + Click (Recommended for ARCHIE)
**Pattern:** Netflix-style hover preview (Pattern #1) + Quick View Modal (Pattern #5)
- Hover reveals: small expansion with genre tags, one-line description, and first screenshot
- Click opens: full modal with complete description, screenshot gallery, ratings, links
- **Benefits**: Low-friction discovery (hover) + deep-dive option (modal) for interested users
- **Data needs**: Screenshots, descriptions, genres, tags, ratings, store links (all available in free RAWG API)

### Option B: Progressive Accordion (Mobile-First)
**Pattern:** Expandable accordions (Pattern #2) + Tag taxonomy
- Default state: Game name, status, basic genre tags
- Expanded state: Full description, multiple screenshots, ratings, links
- **Benefits**: Works on all devices, comparison-friendly, accessible
- **Data needs**: Same as Option A (all available in free RAWG API)

### Option C: Premium Experience
**Pattern:** Steam 3D tilt (Pattern #3) + Tooltips (Pattern #4)
- Hover triggers: 3D card tilt with tooltip overlay showing genres and one-liner
- Click opens: Full detail modal or navigates to dedicated game page
- **Benefits**: Visually distinctive, premium feel, memorable
- **Data needs**: Screenshots, descriptions, genres (all available in free RAWG API)
- **Caveat**: Higher implementation complexity, accessibility challenges

---

## Key Takeaways

1. **Hover patterns are effective BUT require keyboard alternatives**: All hover interactions must support keyboard focus for WCAG compliance

2. **Video/GIF previews are powerful but restricted**: RAWG's video API is business/enterprise only. Screenshots (2.1M+ available in free API) are the best alternative

3. **Games are visually-driven products**: Baymard research confirms Quick View modals are appropriate for games (unlike spec-driven products)

4. **Progressive disclosure is essential**: Show name + basic tags initially, reveal more on interaction

5. **Tag taxonomy is foundational**: Visible genre/mechanic tags are critical for "at-a-glance" understanding, regardless of which pattern is chosen

6. **Mobile compatibility matters**: Consider accordion or modal patterns if mobile support is needed (hover patterns don't translate to touch)

7. **Performance considerations**: Auto-playing video/GIFs on hover can impact performance at scale. Screenshots + CSS transforms are more performant

8. **Accessibility is non-negotiable**: WCAG 1.4.13 compliance (dismissible, hoverable, persistent) and keyboard navigation are required

---

## Implementation Priority for ARCHIE

### Immediate (Low-hanging fruit):
1. **Add visible genre tags to cards** - Use RAWG API genres/tags data
2. **Implement rich tooltips** - Show genre + one-line description on hover over game name
3. **Ensure keyboard accessibility** - Add `:focus` styles matching `:hover` styles

### Short-term (Next iteration):
4. **Add hover preview expansion** - Netflix-style card expansion showing first screenshot + tags + description snippet
5. **Implement "Quick View" modal** - Full detail modal with screenshot gallery, complete description, ratings

### Long-term (Future enhancement):
6. **Video/GIF preview on hover** - If budget allows for RAWG business/enterprise API, add auto-play video previews
7. **3D tilt effect** - Polish hover interactions with Steam-style 3D tilt for premium feel

---

## Sources

### Progressive Disclosure & Interaction Design:
- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- [What is Progressive Disclosure? - Interaction Design Foundation](https://www.interaction-design.org/literature/topics/progressive-disclosure)
- [Progressive Disclosure - UI Patterns](https://ui-patterns.com/patterns/ProgressiveDisclosure)

### Hover Effects & Card Interactions:
- [CSS Card Hover Effect Examples - Subframe](https://www.subframe.com/tips/css-card-hover-effect-examples)
- [38 CSS Card Hover Effects - Free Frontend](https://freefrontend.com/css-card-hover-effects/)
- [CSS Hover Effects: 40 Engaging Animations - Prismic](https://prismic.io/blog/css-hover-effects)

### Steam-Inspired Patterns:
- [Steam Inspired Game Card Hover Effect - GitHub](https://gist.github.com/eric-otto/873c75a102f7dc7289db05705b90f1d7)
- [Recreating the Steam Trading Card Hover Effect - Constantinos.dev](https://constantinos.dev/posts/recreating-the-steam-trading-card-hover-effect-using-html-css-and-javascript/)
- [Steam Style Card Hover Animation - CodeMyUI](https://codemyui.com/netflix-style-card-hover-animation/)

### Netflix Patterns:
- [How to Re-Create a Nifty Netflix Animation in CSS - CSS-Tricks](https://css-tricks.com/how-to-re-create-a-nifty-netflix-animation-in-css/)
- [Netflix UX Case Study - Medium](https://medium.com/@pixelplasmadesigns/netflix-ux-case-study-the-psychology-design-and-experience-afecb135470f)
- [Netflix Task Flow and Design Patterns - Medium](https://nicole-yuen.medium.com/netflix-task-flow-and-design-patterns-e37d4a4c14e9)

### Tooltips:
- [Tooltip Guidelines - Nielsen Norman Group](https://www.nngroup.com/articles/tooltip-guidelines/)
- [Tooltip Guidelines Best Practices - UX Design World](https://uxdworld.com/tooltip-guidelines/)
- [Tooltip Best Practices - CSS-Tricks](https://css-tricks.com/tooltip-best-practices/)
- [Designing Better Tooltips - LogRocket](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)

### Quick View Modals:
- [Product Quick View - CodyHouse](https://codyhouse.co/gem/css-product-quick-view/)
- [Avoid "Quick Views" for Spec-Driven Products - Baymard Institute](https://baymard.com/blog/ecommerce-quick-views)
- [Provide "Quick Views" for Visually Driven Products - Baymard Institute](https://baymard.com/blog/mobile-desktop-quick-views)
- [How to Optimize eCommerce Conversion by Replacing Quick View - Prototypr](https://blog.prototypr.io/how-to-optimize-ecommerce-conversion-rates-by-replacing-quick-view-fa75dfd5ac93)

### Accordions:
- [Designing The Perfect Accordion - Smashing Magazine](https://www.smashingmagazine.com/2017/06/designing-perfect-accordion-checklist/)
- [Accordion UI Design Best Practices - Mobbin](https://mobbin.com/glossary/accordion)
- [Accordion UI Examples - Eleken](https://www.eleken.co/blog-posts/accordion-ui)

### Accessibility (WCAG):
- [WCAG 1.4.13: Content on Hover or Focus - W3C](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
- [Hover Actions and Accessibility - BOIA](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation)
- [Use Hover and Focus Best Practices - Access Guide](https://www.accessguide.io/guide/hover-and-focus)
- [Accessible Navigation Menus - Level Access](https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/)

### Video/GIF Previews:
- [Autoplay Video on Hover React.js - GitHub Gist](https://gist.github.com/Chuloo/115717b9474676deff93e54f236caf70)
- [CSS Hover Effects - Prismic](https://prismic.io/blog/css-hover-effects)
- [Card UI Hover Effects - Speckyboy](https://speckyboy.com/css-javascript-card-ui-hover-effects/)

### Game Taxonomy & Discovery:
- [Art in an algorithm: Taxonomy for Video Game Visual Styles - Wiley](https://asistdl.onlinelibrary.wiley.com/doi/abs/10.1002/asi.23988)
- [Data-Driven Classifications of Video Game Vocabulary - arXiv](https://arxiv.org/pdf/2303.07179)
- [Game Taxonomies Framework - Gamedeveloper.com](https://www.gamedeveloper.com/design/game-taxonomies-a-high-level-framework-for-game-analysis-and-design)
- [Genre Taxonomy Powers Game Discovery - Gameopedia](https://www.gameopedia.com/revolutionize-gaming-our-genre-taxonomy-explained/)

### RAWG API:
- [RAWG Video Games Database API Documentation](https://api.rawg.io/docs/)
- [Explore RAWG API - RAWG](https://rawg.io/apidocs)
- [RAWG API GitHub Documentation](https://github.com/uburuntu/rawg/blob/master/docs/GamesApi.md)
- [Launching Public API - Medium](https://medium.com/rawg/launching-public-api-for-the-largest-video-game-database-in-the-world-fa260a336079)
