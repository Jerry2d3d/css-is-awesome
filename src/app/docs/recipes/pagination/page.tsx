import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

import TryInPlayground from "../_components/TryInPlayground";
export const metadata: Metadata = {
  title: `${prettifyRecipeName("pagination")} — Recipes — css-is-awesome`,
  description:
    "A keyboard-accessible pager — first/prev/next/last plus a windowed page range with ellipses, collapsing to prev / page count / next on phones.",
};

export default function PaginationPage() {
  const recipe = getRecipe("pagination");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Pagination"}</h1>
      <TryInPlayground slug="pagination" />
      <p className="lead">
        Live: 12 pages. Jump with the numbers, step with the arrows, or go
        straight to the ends. The range windows around the current page with
        ellipses, the edges disable in place, and a polite live region
        announces each change. Narrow the window and it collapses to
        prev / page count / next — CSS only, same markup.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
