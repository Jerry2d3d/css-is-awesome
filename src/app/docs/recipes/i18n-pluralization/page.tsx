import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("i18n-pluralization")} — Recipes — css-is-awesome`,
  description: "Locale-correct pluralization with native Intl.PluralRules — English's one/other split isn't universal.",
};

export default function I18nPluralizationPage() {
  const recipe = getRecipe("i18n-pluralization");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "i18n pluralization"}</h1>
      <p className="lead">
        Live: drag the count slider across locales — English has 2 plural
        forms, Polish has 4, Arabic has 6. Watch which{" "}
        <code>Intl.PluralRules</code> category gets picked at each count.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
