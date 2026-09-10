import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("i18n-number-currency")} — Recipes — css-is-awesome`,
  description: "Locale-aware number, percent, currency and compact formatting with native Intl.NumberFormat.",
};

export default function I18nNumberCurrencyPage() {
  const recipe = getRecipe("i18n-number-currency");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "i18n number & currency"}</h1>
      <p className="lead">
        Live: switch locales and watch the same number reformat — decimal,
        percent, currency (with the matching currency per locale), compact,
        signed, and accounting-style negative.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
