import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("auth-flow")} — Recipes — css-is-awesome`,
  description: "The submit → loading → success/error flow around a login or register form.",
};

export default function AuthFlowPage() {
  const recipe = getRecipe("auth-flow");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Auth flow"}</h1>
      <p className="lead">
        Live: a simulated login (no real backend — this is a static site).
        Wrong credentials show an error banner; the button shows what
        arriving from a registration redirect looks like.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
