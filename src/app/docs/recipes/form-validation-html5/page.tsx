import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("form-validation-html5")} — Recipes — css-is-awesome`,
  description: "Zero-JS form validation with native HTML5 constraints and :user-invalid/:user-valid.",
};

export default function FormValidationHtml5Page() {
  const recipe = getRecipe("form-validation-html5");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Form validation — HTML5"}</h1>
      <p className="lead">
        Try it: leave a field empty and blur it, or type an invalid value.
        The error styling and the submit-time summary below are both live —
        this is the real recipe, not a screenshot of it.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
