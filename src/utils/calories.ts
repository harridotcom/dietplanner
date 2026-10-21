import type { ActivityLevel, DietFormState, Goal, PlanBreakdown } from "../types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
};

// ~7700 kcal of energy balance corresponds to roughly 1kg of body weight
const KCAL_PER_KG = 7700;

// Mifflin-St Jeor equation
function bmr(form: DietFormState): number {
  const base = 10 * form.weightKg + 6.25 * form.heightCm - 5 * form.age;
  return form.sex === "male" ? base + 5 : base - 161;
}

export function calculateMaintenanceCalories(form: DietFormState): number {
  return Math.round(bmr(form) * ACTIVITY_MULTIPLIERS[form.activityLevel]);
}

export function calculateTargetCalories(form: DietFormState): number {
  const maintenance = calculateMaintenanceCalories(form);
  const target = maintenance + GOAL_ADJUSTMENTS[form.goal];
  const floor = form.sex === "male" ? 1500 : 1200;
  return Math.round(Math.min(Math.max(target, floor), 4000));
}

export function calculateBMI(form: DietFormState): number {
  const heightM = form.heightCm / 100;
  return Math.round((form.weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function buildPlanBreakdown(form: DietFormState): PlanBreakdown {
  const maintenanceCalories = calculateMaintenanceCalories(form);
  const targetCalories = calculateTargetCalories(form);
  const dailyGap = maintenanceCalories - targetCalories; // positive = deficit
  const weeklyWeightChangeKg =
    Math.round(((dailyGap * 7) / KCAL_PER_KG) * 100) / 100;

  const bmi = calculateBMI(form);

  const goalDirectionMismatch =
    (form.goal === "lose" && form.targetWeightKg >= form.weightKg) ||
    (form.goal === "gain" && form.targetWeightKg <= form.weightKg);

  let weeksToGoal: number | null = null;
  if (
    form.goal !== "maintain" &&
    !goalDirectionMismatch &&
    dailyGap !== 0 &&
    form.targetWeightKg !== form.weightKg
  ) {
    const diffKg = Math.abs(form.targetWeightKg - form.weightKg);
    const weeklyGapKg = Math.abs((dailyGap * 7) / KCAL_PER_KG);
    weeksToGoal = weeklyGapKg > 0 ? Math.round(diffKg / weeklyGapKg) : null;
  }

  return {
    bmi,
    bmiCategory: bmiCategory(bmi),
    maintenanceCalories,
    targetCalories,
    dailyGap,
    weeklyWeightChangeKg,
    weeksToGoal,
    goalDirectionMismatch,
  };
}
