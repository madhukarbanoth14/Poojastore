# Handoff: Pooja Store — Customer App

## Overview
A mobile marketplace app for Hindu pooja needs: festival/occasion pooja kits, individual pooja items, priest (poojari) booking (home visit & online consultation), panchang/zodiac guidance, puja vidhi (ritual procedures), prasad ordering & vrat tracking, and bundled puja packages.

## About the Design Files
The files in this bundle (`Pooja Panchang App.dc.html`, `Pooja Store.dc.html`) are **design references built in HTML** — interactive prototypes showing intended look, content, and navigation behavior. They are not production code to copy directly. The task is to **recreate these designs in your target codebase's environment** (React Native, Flutter, SwiftUI/Kotlin, or web React — whichever this project already uses, or the best fit if none exists yet), using that environment's own component patterns, navigation stack, and state management.

Open the `.dc.html` files directly in a browser to click through the live prototype.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and screen content are final/representative. Recreate pixel-close using your platform's layout system; icons are simple placeholder shapes (circles/diamonds) standing in for a real icon set — swap in your icon library.

## Design Tokens

### Colors
- Background (cream/ivory): `#FFF7EA`
- Card surface (warm blush): `#FCEBE1`
- Card border: `#F0D2C0`
- Maroon (primary dark): `#4A0F1D`
- Maroon gradient top: `#6E1423`
- Saffron/terracotta accent (CTAs): `#B5563B`
- Orange accent: `#E85D04`
- Gold: `#C9A227`
- Light gold: `#E9CE6E`
- Pale gold chip bg: `#F3DCC0`
- Cream text on maroon: `#FBF0DC`
- Muted text (brown-grey): `#8A6B63`
- Body text: `#5A4038`
- Divider: `#EFDBB8`

### Typography
- Headings/Titles: `Poppins`, weight 700 (600–800 range), sizes 14.5–24px
- Body/UI text: `Inter`, weight 400–600, sizes 11.5–14px
- Small labels/tags: 10.5–12px, weight 600–700, letter-spacing ~0.3–0.5px

### Shape & Spacing
- Card border radius: 14–18px
- Pill/chip/button radius: 10–20px (full pill for tags/filters)
- Screen horizontal padding: 20px
- Card internal padding: 13–16px
- Gaps between stacked cards: 8–14px

### Shadows
- Cards mostly use flat 1px borders (`#F0D2C0`) rather than heavy shadow, keeping a flat/premium temple-card look. Add soft shadow (`0 8px 20px rgba(74,15,29,0.08)`) if your platform needs elevation cues.

## Screens / Views

### 1. Home
- Header: maroon gradient (`#6E1423` → `#4A0F1D`) rounded-bottom panel containing: app logo mark (circular gold gradient with a small maroon diamond/flame glyph), app name "Pooja Panchang", user avatar circle (top right), a decorative marigold-garland dot strip (10 alternating gold/orange dots), greeting "Namaste, {name}", and a tappable "Today's Panchang" summary card (date, tithi, nakshatra, chevron to open Panchang).
- Below header: **Upcoming Festivals** horizontal scroll row of cards (168px wide) — each shows a "days to" pill badge, festival name, date. Tapping opens Festival Detail.
- **Pooja Kits** section: highlighted grid/row of kit cards (image placeholder, name, price) — tapping opens kit/product detail (add-to-cart CTA).
- Menu list (secondary): Panchang & Zodiac, Puja Vidhi, Book a Priest, Prasad & Vrat, Puja Packages, plus disabled "Coming Soon" rows (Kids Corner, Puja Kits catalog, Pooja Samagri) shown at reduced opacity (0.6) with a "SOON" pill — each row is a rounded card with a circular icon badge, title, description, chevron.

> Per latest direction: Home should foreground three things above the fold — **Pooja Kits**, **Upcoming Festivals**, and **Today's Panchang** — with everything else (Vidhi, Priest, Prasad/Vrat, Packages) reachable via the secondary menu list below or a "More" section/tab.

### 2. Festival Detail
- Maroon gradient header: back button, "days to" pill, festival name (large, Poppins 700), date.
- Body sections in order: **About** (description paragraph), **Speciality** (paragraph), **How to do the Pooja** (numbered steps, each a circular number badge + text), **Required Items** (wrapped pill chips), **Complete Pooja Kit** (card: image placeholder, kit name, price, Add to Cart button).
- Bottom action row: "Book Priest" (outlined maroon button) + "Add to Cart" (solid maroon button), 50/50 width.

### 3. Panchang & Zodiac
- Sub-header with 3 tabs: Today / Guidance / Calendar (active tab: maroon text + maroon underline).
- **Today**: date/location line, disclaimer note box (dashed gold border), stat rows (Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Moonrise, Moonset), Muhurats list (colored dot + name + time range, red dots for inauspicious Rahu Kalam/Yamagandam/Gulika, gold dots for auspicious Abhijit/Amrit Kalam).
- **Guidance**: horizontal scroll of 12 zodiac sign chips (selected = maroon fill); selected sign detail: name, theme sentence, 2x2 stat grid (Recommended puja, Lucky color, Direction, Number), then 4 category blurbs (Career/Finance/Health/Travel).
- **Calendar**: vertical list of days, each with date/day, tithi/nakshatra, left accent border (gold) + "TODAY" pill on current day.

### 4. Puja Vidhi
- Horizontal filter chips: All / Occasion / Festival / Daily / Vrat.
- List of vidhi cards: tag pill (FESTIVAL/OCCASION/DAILY/VRAT), reading-time, title, description.

### 5. Book a Priest
- List of priest cards: circular gold-gradient avatar with initials, name, experience + languages, star rating + review count, specialization pill, fee, "Book" button (maroon solid, pill).

### 6. Prasad & Vrat
- Tabs: Vrat / Prasad.
- **Vrat**: "Upcoming" highlighted maroon-gradient card (days-to, vrat name, date), then full vrat list (name, rule, date).
- **Prasad**: list of item rows — image placeholder (rounded-bottom shape), name, description, price, outlined "Add" button.

### 7. Puja Packages
- Intro line. Package cards: "SAVE X%" pill (top-right), title, included-items chips (Kit/Priest/Prasad/etc.), price + struck-through MRP, "View Package" button.

### 8. Login (build if not already present)
- Mobile number entry → OTP verification (4–6 digit input) → Google Sign-In and Apple Sign-In (iOS) buttons. Match the maroon/gold/cream palette; logo mark centered top.

## Interactions & Behavior
- All navigation is client-side screen swapping (single-page state machine in the prototype) — implement as your platform's native navigation stack/router.
- Tab switches (Panchang: Today/Guidance/Calendar; Prasad & Vrat: Vrat/Prasad) are local screen state, not full navigation.
- Zodiac chip selection updates the guidance detail panel in place.
- Vidhi filter chips filter the list client-side.
- Tapping an Upcoming Festival card, a menu row, or a priest "Book" button navigates forward; back buttons return to Home (or the previous tab context).
- Disabled/"Coming Soon" menu rows are non-interactive (no navigation), shown at 60% opacity.

## State Management
- Screen state: `screen` (home | festivalDetail | panchang | vidhi | priest | prasad | packages | login | ...)
- Sub-tab state: `pTab` (today/guidance/calendar), `rTab` (vrat/prasad), `vidhiFilter`, `zodiac` (selected sign)
- Selected festival id (`festival`) drives Festival Detail content
- Cart/order state and priest-booking state should be added per your backend's data model — the prototype only demonstrates UI, no real persistence.

## Assets
No real photography/icons used — all avatars, kit images, and icons are placeholder shapes (CSS circles, gradients, simple geometric glyphs). Replace with real product photography, priest photos, and a proper icon set (e.g. a temple/ritual-themed icon family) before shipping.

## Files
- `Pooja Panchang App.dc.html` — Home, Festival Detail, Panchang & Zodiac, Puja Vidhi, Book a Priest, Prasad & Vrat, Puja Packages (primary reference, most current)
- `Pooja Store.dc.html` — earlier full marketplace exploration (splash, onboarding, login, categories, cart, checkout, order tracking, priest profile/booking, video consultation, user profile) — useful for additional screen references beyond the 8 above
