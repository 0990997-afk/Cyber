# 30-photo Claude Vision test plan

Run this against the deployed production URL with `ANTHROPIC_API_KEY` set.
Goal: validate real-world food recognition accuracy, confidence calibration,
and pairing quality across varied conditions — not just happy-path photos.

## How to run

For each photo:
1. Upload via the "📸 Фото" mode in the studio.
2. Record: `engine` (`claude` / `claude+web` / `fallback`),
   `photo.detectedDish`, `photo.confidence`, `photo.ingredients`,
   `photo.cuisineStyle`, `photo.cookingMethod`, and the 3 recommendations'
   `match` scores + `why`.
3. Mark pass/fail against the criteria below.

## Pass criteria

- `engine` is `claude` or `claude+web` (Vision actually ran).
- `detectedDish` plausibly matches the photo (a human reviewer agrees).
- `confidence` is **calibrated**: high (≥0.75) only for clear, common dishes;
  lower (0.3–0.6) for ambiguous/cropped/poorly lit photos or unusual dishes.
- `ingredients`/`cuisineStyle`/`cookingMethod` are reasonable given the image.
- The 3 wine recommendations have **distinct** `match` scores (not all
  95+/identical) and `why` references a concrete pairing mechanism (acidity,
  tannin, fat, sweetness, intensity — not generic "goes well together").
- `avoid` and `alternative` fields are present and sensible.

## Suggested 30-photo set (mix of conditions)

Aim for variety across these axes — doesn't need to be exactly this list,
but cover similar ground:

**Cuisine variety (≈15 dishes, 1 photo each)**
- Ukrainian: borscht, varenyky/pierogi, deruny, salo, chicken Kyiv
- Italian: carbonara, margherita pizza, risotto, lasagna, tiramisu
- Asian: sushi/sashimi, pad thai, ramen, dim sum, Korean BBQ
- Grilled/BBQ: ribeye steak, grilled salmon, lamb chops
- Light/veg: Greek salad, caprese, vegetable soup
- Dessert/cheese: cheese board, chocolate cake, fruit tart

**Edge cases / stress tests (≈10 photos)**
- Blurry or low-light photo of a clear dish
- Extreme close-up (can't see the whole plate)
- Plate with multiple distinct dishes/sharing platter
- Fast food (burger, fries, pizza slice) — tests `honestNote`
- Very spicy dish (e.g. spicy noodles, vindaloo)
- Sweet/dessert-heavy dish
- A photo of a wine bottle label (not food) — tests low-confidence + correct
  `detectedDish` description of a non-food subject
- A photo of a restaurant menu page (text, not food)
- A photo of an empty/mostly-eaten plate
- A non-food photo entirely (e.g. a landscape) — confirm graceful low-confidence
  handling, not a crash

**Regional/uncommon dishes (≈5 photos)**
- Georgian khachapuri, Mexican tacos, Indian curry, Ethiopian injera, Peruvian
  ceviche — tests the web-search-enrichment path for less common pairings.

## Recording results

Use a simple table (spreadsheet or markdown) with columns: `#`, `dish photo
description`, `engine`, `detected_dish`, `confidence`, `pass/fail`, `notes`.
Flag any case where `confidence` is high but `detected_dish` is wrong, or
where recommendations feel generic/templated — these indicate prompt tuning
opportunities in `lib/sommelier.ts`'s `systemRules()`.
