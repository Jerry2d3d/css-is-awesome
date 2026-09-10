import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("datepicker")} — Recipes — css-is-awesome`,
  description: "A formatted date field with an inline calendar-grid popup, built on native Date and Intl.",
};

export default function DatePickerPage() {
  const recipe = getRecipe("datepicker");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Datepicker"}</h1>
      <p className="lead">
        Live: click the field to open the calendar, navigate months, pick a
        date. Click outside or press Escape to close. No date library —
        native <code>Date</code> and <code>Intl.DateTimeFormat</code> only.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
