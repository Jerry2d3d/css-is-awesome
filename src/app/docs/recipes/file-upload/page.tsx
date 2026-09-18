import type { Metadata } from "next";
import { getRecipe, prettifyRecipeName } from "@/lib/recipes";
import Demo from "./Demo";

import TryInPlayground from "../_components/TryInPlayground";
export const metadata: Metadata = {
  title: `${prettifyRecipeName("file-upload")} — Recipes — css-is-awesome`,
  description:
    "A drag-and-drop file picker built around the native file input — drop zone, validation, per-file progress and remove buttons.",
};

export default function FileUploadPage() {
  const recipe = getRecipe("file-upload");

  return (
    <div className="recipe-body">
      <h1>{recipe ? prettifyRecipeName(recipe.name) : "File upload"}</h1>
      <TryInPlayground slug="file-upload" />
      <p className="lead">
        Live: drop files onto the zone or press Enter/Space on it to browse.
        Images and PDFs only, up to 3 files, 2 MB each — anything else stays in
        the list with an error. Nothing is sent anywhere; the progress bars
        are simulated.
      </p>

      <Demo />

      {recipe && <div dangerouslySetInnerHTML={{ __html: recipe.html }} />}
    </div>
  );
}
