import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("command-palette")} — Recipes — css-is-awesome`,
  description:
    "A Cmd+K command palette on native <dialog> — the browser's focus trap, plus the combobox input layer over a grouped, filterable command list.",
};

export default function CommandPalettePage() {
  const recipe = getRecipe("command-palette");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Command palette"}</h1>
      <p className="lead">
        Live: press <kbd>Ctrl</kbd>+<kbd>K</kbd> (or <kbd>⌘</kbd>+<kbd>K</kbd>) anywhere
        on this page, or click the trigger. Type to filter, arrow through the groups,
        Enter to run, Esc to close. Focus returns to the trigger — the browser does
        that, not a library.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
