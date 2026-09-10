import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: `${prettifyRecipeName("otp-input")} — Recipes — css-is-awesome`,
  description: "A segmented one-time-code entry field with auto-advance, backspace-retreat, arrow navigation and paste distribution.",
};

export default function OtpInputPage() {
  const recipe = getRecipe("otp-input");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "OTP input"}</h1>
      <p className="lead">
        Live: type digits, backspace, arrow between cells, or paste a full
        code.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
