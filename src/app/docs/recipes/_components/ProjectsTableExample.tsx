"use client";

import Example from "@/components/Example";
import DataTable, { type Column } from "@/components/DataTable";

// Extracted to its own client component so the recipes index page can stay a
// Server Component (it reads the markdown recipe list at build time). The
// `rowKey` function prop below can't cross the server→client boundary, so the
// table — and the data/columns it closes over — lives entirely client-side.

type Project = {
  id: string;
  name: string;
  owner: string;
  stage: "draft" | "review" | "shipped";
  updated: string;
};

const projectRows: Project[] = [
  { id: "p-01", name: "Sketchbook landing", owner: "Avery Chen", stage: "shipped", updated: "2026-04-21" },
  { id: "p-02", name: "Brutalist theme", owner: "Jordan Ito", stage: "review", updated: "2026-04-20" },
  { id: "p-03", name: "Docs recipes", owner: "Priya Patel", stage: "draft", updated: "2026-04-23" },
  { id: "p-04", name: "Icon authoring", owner: "Mateo Silva", stage: "review", updated: "2026-04-19" },
  { id: "p-05", name: "Token audit", owner: "Sasha Kim", stage: "shipped", updated: "2026-04-15" },
];

const projectColumns: Column<Project>[] = [
  { id: "name", header: "Project", accessor: "name", sortable: true },
  { id: "owner", header: "Owner", accessor: "owner" },
  { id: "stage", header: "Stage", accessor: "stage" },
  { id: "updated", header: "Updated", accessor: "updated", sortable: true, align: "end" },
];

export default function ProjectsTableExample() {
  return (
    <Example>
      <Example.Preview>
        <DataTable
          data={projectRows}
          columns={projectColumns}
          rowKey={(r) => r.id}
          defaultSort={{ columnId: "updated", direction: "desc" }}
          hoverable
        />
      </Example.Preview>
      <Example.Code><span className="tok-com">{"// columns declared once, reused across pages"}</span>
{"\n"}<span className="tok-sel">{"<DataTable"}</span>
{"\n"}  <span className="tok-prop">data</span>={"{projectRows}"}
{"\n"}  <span className="tok-prop">columns</span>={"{projectColumns}"}
{"\n"}  <span className="tok-prop">rowKey</span>={"{(r) => r.id}"}
{"\n"}  <span className="tok-prop">defaultSort</span>={"{{ columnId: 'updated', direction: 'desc' }}"}
{"\n"}  <span className="tok-prop">hoverable</span>
{"\n"}<span className="tok-sel">{"/>"}</span></Example.Code>
    </Example>
  );
}
