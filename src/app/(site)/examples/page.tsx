import Link from "next/link";
import { examplesNav, exampleHref } from "./nav.config";

export default function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p className="lead">Small pages built with the system. Copy, fork, break, rebuild.</p>

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
