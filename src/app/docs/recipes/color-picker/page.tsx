import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("color-picker")} — Recipes — css-is-awesome`,
  description:
    "A colour input that starts at native <input type=color> and upgrades to a custom OKLCH picker with hue, chroma, lightness and alpha sliders.",
};

export default function ColorPickerPage() {
  const recipe = getRecipe("color-picker");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "Color picker"}</h1>
      <p className="lead">
        Live: the native picker with its hex twin, then the custom OKLCH
        picker — drag the sliders, or type a hex / oklch() value and watch
        them sync. Real state, real colour math.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
