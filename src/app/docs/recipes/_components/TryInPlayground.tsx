import Link from "next/link";
import { getRecipePlaygroundPayload } from "@/lib/recipes";
import { hashFromPayload } from "@/lib/playground/hash";

// Server component: the payload is computed at build time from the recipe's
// markdown (src/lib/playground/recipe-link.ts), so the link is a plain
// static href — no client JS on the recipe page for this. Renders nothing
// when the recipe has no extractable starter, never a broken link.
export default function TryInPlayground({ slug }: { slug: string }) {
  const payload = getRecipePlaygroundPayload(slug);
  if (!payload) return null;
  return (
    <p className="recipe-try">
      <Link href={`/playground/${hashFromPayload(payload)}`} prefetch={false} className="recipe-try-link">
        Try in playground →
      </Link>
      <span className="recipe-try-hint">opens this recipe&rsquo;s markup and SCSS, live-compiled</span>
    </p>
  );
}
