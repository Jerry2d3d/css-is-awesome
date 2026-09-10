import type { Metadata } from "next";
import Link from "next/link";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("admin-dashboard-layout")} — Recipes — css-is-awesome`,
  description: "A CSS Grid admin skeleton — sidebar, stats header, content, optional footer — for a fixed back-office frame.",
};

export default function AdminDashboardLayoutPage() {
  const recipe = getRecipe("admin-dashboard-layout");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Admin dashboard layout"}</h1>
      <p className="lead">
        Live: a full-height sidebar next to a stats header and a sortable
        team table — click a column to sort, &ldquo;Remove&rdquo; opens the{" "}
        <Link href="/docs/recipes/confirm-dialog">confirm-dialog</Link> popover
        variant.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
