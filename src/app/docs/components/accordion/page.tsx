import ComponentDoc from "../_registry/ComponentDoc";
import { accordionEntry } from "../_entries/accordion";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/accordion. Adding a component = adding an entry.
export default function AccordionDocsPage() {
  return <ComponentDoc entry={accordionEntry} />;
}
