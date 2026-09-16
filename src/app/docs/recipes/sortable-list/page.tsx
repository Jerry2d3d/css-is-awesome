import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("sortable-list")} — Recipes — css-is-awesome`,
  description:
    "A re-orderable list — native HTML5 drag-and-drop for the pointer, a grab/move/drop keyboard alternative on the handle, every move announced.",
};

export default function SortableListPage() {
  const recipe = getRecipe("sortable-list");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Sortable list"}</h1>
      <p className="lead">
        Live: drag a row by its grip, or tab to a grip and press Space to
        grab, arrow keys to move, Space to drop, Escape to cancel. Every move
        is announced to screen readers.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
