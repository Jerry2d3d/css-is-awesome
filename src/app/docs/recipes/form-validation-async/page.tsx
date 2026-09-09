import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("form-validation-async")} — Recipes — css-is-awesome`,
  description: "The debounced, abortable \"is this username taken?\" pattern — loading spinner, success or error state.",
};

export default function FormValidationAsyncPage() {
  const recipe = getRecipe("form-validation-async");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Form validation — Async"}</h1>
      <p className="lead">
        Try it: type a username. The check is simulated (no real network
        call, this site is a static export — see the recipe&rsquo;s
        Pitfalls) but the debounce, cancellation, and loading/success/error
        states are the real, live pattern.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
