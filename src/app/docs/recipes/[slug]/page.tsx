import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe, getRecipeSlugs, prettifyRecipeName } from "@/lib/recipes";
import RecipeCopyButtons from "./RecipeCopyButtons";

// Statically generate one page per `.md` recipe at build time. New recipes
// (e.g. print-to-pdf once its PR merges) appear automatically — no route edits.
export function generateStaticParams() {
  return getRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return { title: "Recipe not found" };
  const title = prettifyRecipeName(recipe.name);
  return {
    title: `${title} — Recipes — css-is-awesome`,
    description: recipe.description,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const title = prettifyRecipeName(recipe.name);

  return (
    <div className="recipe-body">
      <p className="recipe-breadcrumb">
        <Link href="/docs/recipes">Recipes</Link>
      </p>
      <h1>{title}</h1>
      <p className="lead">{recipe.description}</p>
      <div className="recipe-meta">
        {recipe.category && <span className="recipe-chip">{recipe.category}</span>}
        {recipe.complexity && (
          <span className="recipe-chip" data-complexity={recipe.complexity}>
            {recipe.complexity}
          </span>
        )}
        {recipe.ciaVersion && (
          <span className="recipe-chip recipe-chip-version">cia {recipe.ciaVersion}</span>
        )}
      </div>

      {/* Body is build-time HTML from marked — no client JS for the content. */}
      <div dangerouslySetInnerHTML={{ __html: recipe.html }} />

      <RecipeCopyButtons />
    </div>
  );
}
