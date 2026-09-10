import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("confirm-dialog")} — Recipes — css-is-awesome`,
  description: "A small \"are you sure?\" pattern built on the dialog recipe, plus an inline popover variant.",
};

export default function ConfirmDialogPage() {
  const recipe = getRecipe("confirm-dialog");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Confirm dialog"}</h1>
      <p className="lead">
        Live: click a tag pill for the inline popover confirmation, or
        &ldquo;Delete&rdquo; for the full modal variant. Escape or an outside
        click cancels either one.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
