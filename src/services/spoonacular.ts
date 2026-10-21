import type { DietFormState, PlanBreakdown, SpoonacularWeekResponse } from "../types";
import { buildPlanBreakdown } from "../utils/calories";

export class SpoonacularError extends Error {}

export async function generateWeekPlan(
  form: DietFormState,
  apiKey: string
): Promise<{ plan: SpoonacularWeekResponse; breakdown: PlanBreakdown }> {
  const breakdown = buildPlanBreakdown(form);
  const targetCalories = breakdown.targetCalories;

  const exclude = [...form.intolerances, form.excludeIngredients]
    .filter(Boolean)
    .join(",");

  const params = new URLSearchParams({
    timeFrame: "week",
    targetCalories: String(targetCalories),
    apiKey,
  });
  if (form.diet) params.set("diet", form.diet);
  if (exclude) params.set("exclude", exclude);

  const res = await fetch(
    `https://api.spoonacular.com/mealplanner/generate?${params.toString()}`
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new SpoonacularError("Invalid Spoonacular API key.");
    }
    if (res.status === 402) {
      throw new SpoonacularError(
        "Daily free quota for your Spoonacular API key is used up. Try again tomorrow."
      );
    }
    throw new SpoonacularError(
      `Spoonacular request failed (${res.status}). Please try again.`
    );
  }

  const data: SpoonacularWeekResponse = await res.json();
  return { plan: data, breakdown };
}

export function recipeImageUrl(id: number, imageType: string): string {
  return `https://img.spoonacular.com/recipes/${id}-312x231.${imageType}`;
}
