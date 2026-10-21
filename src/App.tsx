import { useState } from "react";
import "./App.css";
import { DietForm } from "./components/DietForm";
import { MealPlanResult } from "./components/MealPlanResult";
import { generateWeekPlan, SpoonacularError } from "./services/spoonacular";
import type { DietFormState, PlanBreakdown, SpoonacularWeekResponse } from "./types";

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    plan: SpoonacularWeekResponse;
    breakdown: PlanBreakdown;
    form: DietFormState;
  } | null>(null);

  async function handleSubmit(form: DietFormState) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateWeekPlan(form, API_KEY);
      setResult({ ...data, form });
    } catch (err) {
      setError(
        err instanceof SpoonacularError
          ? err.message
          : "Something went wrong generating your plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="hero no-print">
        <div className="hero-badge">🥗</div>
        <h1>Nirmala Convent School Diet Planner</h1>
        <p>Enter a few details to get a personalized 7-day meal plan.</p>
      </header>

      {!result && <DietForm onSubmit={handleSubmit} loading={loading} />}

      {loading && (
        <div className="loading no-print">
          <div className="spinner" />
          <p>Preparing your 7-day plan...</p>
        </div>
      )}

      {error && <p className="error no-print">{error}</p>}

      {result && (
        <MealPlanResult
          plan={result.plan}
          breakdown={result.breakdown}
          form={result.form}
          onReset={() => setResult(null)}
        />
      )}

      <footer className="no-print">
        <p>Nirmala Convent School · Not medical advice.</p>
      </footer>
    </div>
  );
}

export default App;
