import ComponentDoc from "../_registry/ComponentDoc";
import { tabsEntry } from "../_entries/tabs";

// The page is data: the template lives in _registry/ComponentDoc, the
// content in _entries/tabs. Adding a component = adding an entry.
export default function TabsDocsPage() {
  return <ComponentDoc entry={tabsEntry} />;
}
