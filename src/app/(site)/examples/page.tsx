import Link from "next/link";
import { examplesNav, exampleHref } from "./nav.config";

export default function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p className="lead">Small pages built with the system. Copy, fork, break, rebuild.</p>

      <p>
        Want all of it on one page instead of eight?{" "}
        <Link href="/showcase">The showcase</Link> puts a marketing hero, a
        blog card, a dashboard and a 404 side by side, every block built from
        the same components — switch the theme and watch the whole page
        re-skin without a line of code changing.
      </p>

      <ul>
        {examplesNav.map((item) => (
          <li key={item.slug}>
            <Link href={exampleHref(item.slug)}>{item.label}</Link> — {item.description}
          </li>
        ))}
      </ul>
    </>
  );
}
