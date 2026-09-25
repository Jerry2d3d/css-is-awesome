import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthoringGuide } from "@/lib/recipes";

export const metadata: Metadata = {
  title: "Writing a recipe — Recipes — css-is-awesome",
  description:
    "The recipe format: file naming, required frontmatter, the H2 sections every recipe must carry in order, import conventions, code-block standards, and what is forbidden.",
};

export default function RecipeAuthoringPage() {
  // Rendered from scss/recipes/README.md — the same guide that ships inside
  // the npm package and that an author finds when they open the folder. One
  // source, so the page cannot drift from the rules the validator enforces.
  const guide = getAuthoringGuide();
  if (!guide) notFound();

  return (
    <div className="recipe-body">
      <p className="recipe-breadcrumb">
        <Link href="/docs/recipes">Recipes</Link>
      </p>

      <h1>{guide.title}</h1>
      <p className="lead">
        Every recipe in the book follows one shape, and{" "}
        <code>npm run validate-recipes</code> fails the build when one does
        not. This page is that shape. It is rendered from{" "}
        <code>scss/recipes/README.md</code>, so it is the same text shipped
        inside the package rather than a second copy of it.
      </p>

      <div dangerouslySetInnerHTML={{ __html: guide.html }} />
    </div>
  );
}
