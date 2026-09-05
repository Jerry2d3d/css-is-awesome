import ComponentDoc from "../_registry/ComponentDoc";
import { tooltipEntry } from "../_entries/tooltip";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/tooltip. Adding a component = adding an entry.
export default function TooltipDocsPage() {
  return <ComponentDoc entry={tooltipEntry} />;
}
