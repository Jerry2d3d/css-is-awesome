import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

import TryInPlayground from "../_components/TryInPlayground";
export const metadata: Metadata = {
  title: `${prettifyRecipeName("data-table")} — Recipes — css-is-awesome`,
  description: "A sortable, paginated data table — click a column header to sort.",
};

export default function DataTablePage() {
  const recipe = getRecipe("data-table");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Data table"}</h1>
      <TryInPlayground slug="data-table" />
      <p className="lead">
        Live: click a column header to sort (three states — ascending,
        descending, then back to original order), and page through the
        result with the pager below. Real state, not a static table.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
