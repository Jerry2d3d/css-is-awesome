import { getRecipeIndex, prettifyRecipeName } from "@/lib/recipes";
import RecipesGallery, { type RecipeCard } from "./RecipesGallery";

// Server component: reads the markdown recipe index (scss/recipes/*.md) at
// build time and hands the serializable list to the client gallery. The
// fs/markdown read stays server-side; the gallery owns all the interactive
// example components.
export default function RecipesPage() {
  const recipes: RecipeCard[] = getRecipeIndex().map((r) => ({
    slug: r.slug,
    title: prettifyRecipeName(r.name),
    description: r.description,
    category: r.category,
    complexity: r.complexity,
  }));

  return <RecipesGallery recipes={recipes} />;
}
