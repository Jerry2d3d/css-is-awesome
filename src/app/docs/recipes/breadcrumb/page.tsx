import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("breadcrumb")} — Recipes — css-is-awesome`,
  description:
    "An accessible breadcrumb trail — labelled nav, ordered list, aria-current on the current page, CSS-drawn separators.",
};

export default function BreadcrumbPage() {
  const recipe = getRecipe("breadcrumb");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Breadcrumb"}</h1>
      <p className="lead">
        Live: a plain four-level trail, and a deep seven-level trail collapsed
        to first + … + last two. Press the ellipsis to reveal the middle.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
