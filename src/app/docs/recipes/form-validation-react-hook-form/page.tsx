import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("form-validation-react-hook-form")} — Recipes — css-is-awesome`,
  description: "Form state and validation with react-hook-form, error styling driven from formState.errors and cia's error tokens.",
};

export default function FormValidationReactHookFormPage() {
  const recipe = getRecipe("form-validation-react-hook-form");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Form validation — react-hook-form"}</h1>
      <p className="lead">
        Try it: blur the email or username field empty, or type an invalid
        value. Error state here comes from <code>formState.errors</code>,
        not a CSS pseudo-class — this is the real recipe running live.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
