import { useState } from "react";
import type { DietFormState, DietType } from "../types";
import { INTOLERANCES } from "../types";
import { bmiCategory, calculateBMI } from "../utils/calories";

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "", label: "Balanced (no restriction)" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "lacto-vegetarian", label: "Lacto-Vegetarian" },
  { value: "ovo-vegetarian", label: "Ovo-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescetarian", label: "Pescetarian" },
  { value: "paleo", label: "Paleo" },
  { value: "primal", label: "Primal" },
  { value: "ketogenic", label: "Ketogenic" },
  { value: "gluten free", label: "Gluten Free" },
  { value: "low fodmap", label: "Low FODMAP" },
  { value: "whole30", label: "Whole30" },
];

const DEFAULT_STATE: DietFormState = {
  age: 25,
  sex: "male",
  heightCm: 170,
  weightKg: 70,
  targetWeightKg: 70,
  activityLevel: "moderate",
  goal: "maintain",
  diet: "",
  intolerances: [],
  excludeIngredients: "",
};

interface Props {
  onSubmit: (form: DietFormState) => void;
  loading: boolean;
}

export function DietForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<DietFormState>(DEFAULT_STATE);

  function update<K extends keyof DietFormState>(
    key: K,
    value: DietFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleIntolerance(name: string) {
    setForm((prev) => ({
      ...prev,
      intolerances: prev.intolerances.includes(name)
        ? prev.intolerances.filter((i) => i !== name)
        : [...prev.intolerances, name],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="diet-form" onSubmit={handleSubmit}>
      <h2>About You</h2>
      <div className="grid">
        <label>
          Age
          <input
            type="number"
            min={10}
            max={100}
            required
            value={form.age}
            onChange={(e) => update("age", Number(e.target.value))}
          />
        </label>

        <label>
          Sex
          <select
            value={form.sex}
            onChange={(e) => update("sex", e.target.value as DietFormState["sex"])}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label>
          Height (cm)
          <input
            type="number"
            min={100}
            max={250}
            required
            value={form.heightCm}
            onChange={(e) => update("heightCm", Number(e.target.value))}
          />
        </label>

        <label>
          Current Weight (kg)
          <input
            type="number"
            min={30}
            max={300}
            required
            value={form.weightKg}
            onChange={(e) => update("weightKg", Number(e.target.value))}
          />
        </label>

        <label>
          Target Weight (kg)
          <input
            type="number"
            min={30}
            max={300}
            required
            value={form.targetWeightKg}
            onChange={(e) => update("targetWeightKg", Number(e.target.value))}
          />
        </label>

        <label>
          Activity Level
          <select
            value={form.activityLevel}
            onChange={(e) =>
              update("activityLevel", e.target.value as DietFormState["activityLevel"])
            }
          >
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="veryActive">Very Active (hard exercise daily)</option>
          </select>
        </label>

        <label>
          Goal
          <select
            value={form.goal}
            onChange={(e) => update("goal", e.target.value as DietFormState["goal"])}
          >
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
        </label>

        <label className="full">
          Diet Type
          <select
            value={form.diet}
            onChange={(e) => update("diet", e.target.value as DietType)}
          >
            {DIET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bmi-showcase">
        <div className="bmi-value">
          <span className="bmi-number">{calculateBMI(form)}</span>
          <span className="bmi-label">BMI · {bmiCategory(calculateBMI(form))}</span>
        </div>
        <p className="bmi-note">
          Body Mass Index is shown for your reference only — it is not used to
          generate your meal plan.
        </p>
      </div>

      {goalMismatchWarning(form) && (
        <p className="warning">{goalMismatchWarning(form)}</p>
      )}

      <h2>Preferences</h2>
      <fieldset>
        <legend>🚫 Allergies / Intolerances</legend>
        <div className="checkbox-grid">
          {INTOLERANCES.map((name) => (
            <label key={name} className="checkbox">
              <input
                type="checkbox"
                checked={form.intolerances.includes(name)}
                onChange={() => toggleIntolerance(name)}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="full">
        Other ingredients to avoid (comma separated)
        <input
          type="text"
          placeholder="e.g. cilantro, mushrooms, olives"
          value={form.excludeIngredients}
          onChange={(e) => update("excludeIngredients", e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Generating your plan..." : "✨ Generate My 7-Day Diet Plan"}
      </button>
    </form>
  );
}

function goalMismatchWarning(form: DietFormState): string | null {
  if (form.goal === "lose" && form.targetWeightKg >= form.weightKg) {
    return "⚠️ Your target weight should be lower than your current weight for a 'Lose Weight' goal — the timeline estimate will be skipped otherwise.";
  }
  if (form.goal === "gain" && form.targetWeightKg <= form.weightKg) {
    return "⚠️ Your target weight should be higher than your current weight for a 'Gain Weight' goal — the timeline estimate will be skipped otherwise.";
  }
  return null;
}
