import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("form-validation-success-states")} — Recipes — css-is-awesome`,
  description: "Three success-feedback patterns after a form validates or submits, live: an inline checkmark, a summary banner, and an optimistic toggle.",
};

export default function FormValidationSuccessStatesPage() {
  const recipe = getRecipe("form-validation-success-states");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Form validation — Success states"}</h1>
      <p className="lead">
        Three of this recipe&rsquo;s four patterns, live: an inline
        checkmark, a submit summary banner, and an optimistic toggle that
        occasionally rolls back (deterministically — every other toggle —
        so the rollback is reliably demoable).
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
