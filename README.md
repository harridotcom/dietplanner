# 7-Day Diet Plan Generator

A React + Vite + TypeScript app that generates a personalized 7-day meal plan using the [Spoonacular Meal Planner API](https://spoonacular.com/food-api).

## How it works

1. User enters age, sex, height, weight, activity level, and goal (lose/maintain/gain weight).
2. The app calculates a daily calorie target using the Mifflin-St Jeor BMR equation.
3. User picks an optional diet type (vegan, keto, paleo, etc.), allergies/intolerances, and ingredients to avoid.
4. The app calls Spoonacular's `mealplanner/generate` endpoint with `timeFrame=week` to get a full 7-day plan with breakfast/lunch/dinner, real recipes, and nutrient totals per day.

## Setup

```bash
pnpm install
pnpm run dev
```

Open the printed local URL. On first use, paste a free Spoonacular API key (get one at https://spoonacular.com/food-api — free tier gives 150 requests/day). The key is stored only in your browser's localStorage, never sent anywhere except directly to Spoonacular.

## Notes

- No backend/server — this is a pure client-side app that calls Spoonacular directly from the browser.
- "Print / Save PDF" on the results screen uses the browser's native print dialog with print-friendly CSS.
- The free Spoonacular tier is rate-limited; each "Generate" click uses 1 request from your daily quota.
