import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

import TryInPlayground from "../_components/TryInPlayground";
export const metadata: Metadata = {
  title: `${prettifyRecipeName("combobox-multiselect")} — Recipes — css-is-awesome`,
  description:
    "A tag-input combobox — the ARIA combobox pattern extended to multiple selections, each rendered as a removable chip.",
};

export default function ComboboxMultiselectPage() {
  const recipe = getRecipe("combobox-multiselect");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Combobox multiselect"}</h1>
      <TryInPlayground slug="combobox-multiselect" />
      <p className="lead">
        Live: type to filter, Arrow keys to move, Enter to toggle a topping,
        Backspace in an empty field to drop the last chip, or click a chip&apos;s
        × to remove it.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
