import type { Metadata } from "next";
import Link from "next/link";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("app-shell")} — Recipes — css-is-awesome`,
  description: "A top navbar, a sidebar-and-content control panel, and a footer, assembled from cia's existing layout mixins.",
};

export default function AppShellPage() {
  const recipe = getRecipe("app-shell");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "App shell"}</h1>
      <p className="lead">
        Live: a real navbar, sidebar/control-panel split, footer, and a
        working Settings button that opens the actual{" "}
        <Link href="/docs/recipes/dialog">dialog recipe</Link> — one page,
        every piece wired together, not a static screenshot.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
