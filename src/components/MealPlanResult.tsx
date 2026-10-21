import type { DietFormState, PlanBreakdown, SpoonacularWeekResponse } from "../types";
import { recipeImageUrl } from "../services/spoonacular";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MEAL_LABELS = ["🍳 Breakfast", "🥗 Lunch", "🍽️ Dinner"];

interface Props {
  plan: SpoonacularWeekResponse;
  breakdown: PlanBreakdown;
  form: DietFormState;
  onReset: () => void;
}

export function MealPlanResult({ plan, breakdown, form, onReset }: Props) {
  const avg = averageNutrients(plan);

  return (
    <div className="results">
      <div className="results-header no-print">
        <p>
          🎯 Daily Target: <strong>{breakdown.targetCalories} kcal</strong>
        </p>
        <div className="results-actions">
          <button onClick={() => window.print()}>🖨️ Print / Save PDF</button>
          <button onClick={onReset}>↺ Start Over</button>
        </div>
      </div>

      <section className="summary-panel">
        <h2>📊 Your Plan Explained</h2>

        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">
              {breakdown.bmi}
              <small> ({breakdown.bmiCategory})</small>
            </span>
            <span className="stat-label">BMI</span>
          </div>
          <div className="stat">
            <span className="stat-value">{breakdown.maintenanceCalories} kcal</span>
            <span className="stat-label">Maintenance Calories</span>
          </div>
          <div className="stat">
            <span className="stat-value">{breakdown.targetCalories} kcal</span>
            <span className="stat-label">Your Daily Target</span>
          </div>
          <div className={`stat gap-${gapDirection(breakdown)}`}>
            <span className="stat-value">
              {breakdown.dailyGap === 0
                ? "0 kcal"
                : `${Math.abs(breakdown.dailyGap)} kcal`}
            </span>
            <span className="stat-label">
              {gapDirection(breakdown) === "deficit"
                ? "Daily Deficit"
                : gapDirection(breakdown) === "surplus"
                ? "Daily Surplus"
                : "At Maintenance"}
            </span>
          </div>
        </div>

        <p className="explanation">{buildExplanation(form, breakdown, avg)}</p>
      </section>

      {DAY_ORDER.map((dayKey) => {
        const day = plan.week[dayKey];
        if (!day) return null;
        return (
          <section key={dayKey} className="day-card">
            <h2>{capitalize(dayKey)}</h2>
            <div className="nutrients">
              <span className="pill">🔥 {Math.round(day.nutrients.calories)} kcal</span>
              <span className="pill">💪 Protein {Math.round(day.nutrients.protein)}g</span>
              <span className="pill">🥑 Fat {Math.round(day.nutrients.fat)}g</span>
              <span className="pill">🌾 Carbs {Math.round(day.nutrients.carbohydrates)}g</span>
            </div>
            <div className="meals">
              {day.meals.map((meal, i) => (
                <a
                  key={meal.id + "-" + i}
                  className="meal-card"
                  href={meal.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={recipeImageUrl(meal.id, meal.imageType)}
                    alt={meal.title}
                    loading="lazy"
                  />
                  <div className="meal-info">
                    <span className="meal-label">
                      {MEAL_LABELS[i] ?? `Meal ${i + 1}`}
                    </span>
                    <span className="meal-title">{meal.title}</span>
                    <span className="meal-meta">
                      {meal.readyInMinutes} min · {meal.servings} serving(s)
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function gapDirection(b: PlanBreakdown): "deficit" | "surplus" | "none" {
  if (b.dailyGap > 0) return "deficit";
  if (b.dailyGap < 0) return "surplus";
  return "none";
}

function averageNutrients(plan: SpoonacularWeekResponse) {
  const days = DAY_ORDER.map((d) => plan.week[d]).filter(Boolean);
  const totals = days.reduce(
    (acc, day) => ({
      protein: acc.protein + day.nutrients.protein,
      fat: acc.fat + day.nutrients.fat,
      carbohydrates: acc.carbohydrates + day.nutrients.carbohydrates,
    }),
    { protein: 0, fat: 0, carbohydrates: 0 }
  );
  const count = days.length || 1;
  return {
    protein: Math.round(totals.protein / count),
    fat: Math.round(totals.fat / count),
    carbohydrates: Math.round(totals.carbohydrates / count),
  };
}

function buildExplanation(
  form: DietFormState,
  b: PlanBreakdown,
  avg: { protein: number; fat: number; carbohydrates: number }
): string {
  const macros = `This week's plan averages about ${avg.protein}g protein, ${avg.fat}g fat and ${avg.carbohydrates}g carbs per day.`;

  if (form.goal === "maintain") {
    return (
      `You're eating close to your estimated maintenance level of ${b.maintenanceCalories} kcal/day, which should help keep your weight stable over time. ` +
      macros +
      " This balance gives you steady energy throughout the day without pushing you into a calorie deficit or surplus."
    );
  }

  if (b.goalDirectionMismatch) {
    return (
      `Heads up: your target weight (${form.targetWeightKg} kg) doesn't match the direction of your selected goal (${
        form.goal === "lose" ? "Lose Weight" : "Gain Weight"
      }), so we can't estimate a timeline. Update your target weight or goal to see how long it will take. ` +
      macros
    );
  }

  if (form.goal === "lose") {
    const timeline =
      b.weeksToGoal != null
        ? ` At this rate, reaching your goal weight of ${form.targetWeightKg} kg would take roughly ${b.weeksToGoal} week(s).`
        : "";
    return (
      `You're eating about ${b.targetCalories} kcal/day, which is roughly ${b.dailyGap} kcal below your estimated maintenance level of ${b.maintenanceCalories} kcal. ` +
      `Sustained over time, a deficit like this works out to about ${Math.abs(b.weeklyWeightChangeKg)} kg of fat loss per week.${timeline} ` +
      macros +
      " The higher protein share helps preserve muscle while you're in a deficit, and keeping carbs and fat moderate helps you feel fuller for longer."
    );
  }

  // gain
  const timeline =
    b.weeksToGoal != null
      ? ` At this rate, reaching your goal weight of ${form.targetWeightKg} kg would take roughly ${b.weeksToGoal} week(s).`
      : "";
  return (
    `You're eating about ${b.targetCalories} kcal/day, which is roughly ${Math.abs(
      b.dailyGap
    )} kcal above your estimated maintenance level of ${b.maintenanceCalories} kcal. ` +
    `Sustained over time, a surplus like this supports steady weight gain of about ${Math.abs(b.weeklyWeightChangeKg)} kg per week.${timeline} ` +
    macros +
    " The extra protein and carbs support muscle repair, recovery, and growth from your training."
  );
}
