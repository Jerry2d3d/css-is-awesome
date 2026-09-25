import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

import TryInPlayground from "../_components/TryInPlayground";
export const metadata: Metadata = {
  title: `${prettifyRecipeName("form-validation-zod")} — Recipes — css-is-awesome`,
  description: "Validate a form against a Zod schema on submit, map issues to fields by path.",
};

export default function FormValidationZodPage() {
  const recipe = getRecipe("form-validation-zod");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Form validation — Zod"}</h1>
      <TryInPlayground slug="form-validation-zod" />
      <p className="lead">
        Try it: type a bad email, or a non-numeric / too-young age. The
        schema below runs on submit and the errors come straight from its
        parsed issues — live, not staged.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
