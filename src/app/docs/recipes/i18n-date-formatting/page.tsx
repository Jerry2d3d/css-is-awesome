import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("i18n-date-formatting")} — Recipes — css-is-awesome`,
  description: "Locale-aware date and relative-time formatting with native Intl.DateTimeFormat and Intl.RelativeTimeFormat.",
};

export default function I18nDateFormattingPage() {
  const recipe = getRecipe("i18n-date-formatting");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "i18n date formatting"}</h1>
      <p className="lead">
        Live: switch locales and watch the same instant reformat — short,
        long, date+time, a fixed Tokyo timezone, and a relative-time
        phrase.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
