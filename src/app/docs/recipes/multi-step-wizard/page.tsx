import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("multi-step-wizard")} — Recipes — css-is-awesome`,
  description: "Step orchestration — current step, per-step validation gating, error summary — built on cia's stepper mixin.",
};

export default function MultiStepWizardPage() {
  const recipe = getRecipe("multi-step-wizard");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Multi-step wizard"}</h1>
      <p className="lead">
        Live: a 3-step form. Step 1 requires an email and a 6+ character
        password before Next is allowed; Back never re-validates the step
        you&apos;re leaving.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
