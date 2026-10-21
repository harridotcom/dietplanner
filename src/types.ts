export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";

export type Goal = "lose" | "maintain" | "gain";

export type DietType =
  | ""
  | "gluten free"
  | "ketogenic"
  | "vegetarian"
  | "lacto-vegetarian"
  | "ovo-vegetarian"
  | "vegan"
  | "pescetarian"
  | "paleo"
  | "primal"
  | "low fodmap"
  | "whole30";

export const INTOLERANCES = [
  "Dairy",
  "Egg",
  "Gluten",
  "Grain",
  "Peanut",
  "Seafood",
  "Sesame",
  "Shellfish",
  "Soy",
  "Sulfite",
  "Tree Nut",
  "Wheat",
] as const;

export interface DietFormState {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  diet: DietType;
  intolerances: string[];
  excludeIngredients: string;
}

export interface PlanBreakdown {
  bmi: number;
  bmiCategory: string;
  maintenanceCalories: number;
  targetCalories: number;
  dailyGap: number; // positive = deficit, negative = surplus, 0 = maintain
  weeklyWeightChangeKg: number;
  weeksToGoal: number | null;
  goalDirectionMismatch: boolean;
}

export interface SpoonacularMeal {
  id: number;
  imageType: string;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

export interface SpoonacularDayNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface SpoonacularDay {
  meals: SpoonacularMeal[];
  nutrients: SpoonacularDayNutrients;
}

export interface SpoonacularWeekResponse {
  week: Record<string, SpoonacularDay>;
}
