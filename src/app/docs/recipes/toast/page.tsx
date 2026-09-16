import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("toast")} — Recipes — css-is-awesome`,
  description:
    "Transient notifications — a stacked region of auto-dismissing status messages with pause-on-hover, a close button and an optional action.",
};

export default function ToastPage() {
  const recipe = getRecipe("toast");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Toast"}</h1>
      <p className="lead">
        Live: fire a toast of each severity. Hover or focus one to pause its
        countdown, close it early, or hit Undo on the success toast. The stack
        is capped at three.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
