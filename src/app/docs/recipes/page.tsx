"use client";
import Example from "@/components/Example";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import FormField from "@/components/FormField";
import Checkbox from "@/components/Checkbox";
import Alert from "@/components/Alert";
import StatChip from "@/components/StatChip";
import Tabs from "@/components/Tabs";
import DataTable, { type Column } from "@/components/DataTable";

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

// Shared inline styles used by a few recipes. Every value references a token
// so re-skinning via ThemePicker works without touching this file.
const navLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "var(--space-xs) var(--space-sm)",
  borderRadius: "6px",
  color: "var(--ink-soft)",
  textDecoration: "none",
  fontSize: "0.9rem",
};
const navLinkActiveStyle: React.CSSProperties = {
  ...navLinkStyle,
  background: "var(--paper-sunk)",
  color: "var(--ink)",
  fontWeight: 600,
};

export default function RecipesPage() {
  return (
    <>
      <h1>Recipes</h1>
      <p className="lead">
        Copy-paste compositions of components, tokens, and mixins for the patterns you build most.
      </p>

      <h2 id="settings-form">Settings form</h2>
      <p>
        Stack <code>FormField</code> wrappers around <code>Input</code> and{" "}
        <code>Checkbox</code> controls; close with a primary <code>Button</code>.
        The labels, hints, and error ids are wired automatically.
      </p>
      <Example>
        <Example.Preview>
          <form
            style={{
              display: "grid",
              gap: "var(--space-md)",
              maxWidth: "360px",
            }}
            action="#"
          >
            <FormField label="Email" hint="We only use this for sign-in.">
              <Input type="email" placeholder="you@studio.com" autoComplete="email" />
            </FormField>
            <FormField label="Password">
              <Input type="password" placeholder="At least 8 characters" autoComplete="current-password" />
            </FormField>
            <Checkbox label="Remember me on this device" defaultChecked />
            <div>
              <Button variant="primary">Sign in</Button>
            </div>
          </form>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<FormField"}</span> <span className="tok-prop">label</span>=<span className="tok-val">"Email"</span> <span className="tok-prop">hint</span>=<span className="tok-val">"We only use this for sign-in."</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<Input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"email"</span> <span className="tok-prop">placeholder</span>=<span className="tok-val">"you@studio.com"</span> <span className="tok-sel">{"/>"}</span>
{"\n"}<span className="tok-sel">{"</FormField>"}</span>
{"\n"}<span className="tok-sel">{"<FormField"}</span> <span className="tok-prop">label</span>=<span className="tok-val">"Password"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<Input"}</span> <span className="tok-prop">type</span>=<span className="tok-val">"password"</span> <span className="tok-sel">{"/>"}</span>
{"\n"}<span className="tok-sel">{"</FormField>"}</span>
{"\n"}<span className="tok-sel">{"<Checkbox"}</span> <span className="tok-prop">label</span>=<span className="tok-val">"Remember me on this device"</span> <span className="tok-sel">{"/>"}</span>
{"\n"}<span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"primary"</span><span className="tok-sel">{">"}</span>Sign in<span className="tok-sel">{"</Button>"}</span></Example.Code>
      </Example>
      <p>
        Form spacing uses <code>--space-md</code> between controls. Swap themes
        and the input chrome, focus ring, and checkmark follow.
      </p>

      <h2 id="pricing-card-grid">Pricing card grid</h2>
      <p>
        A responsive three-tier pricing grid using <code>Card</code> with{" "}
        <code>bodyAs=&quot;none&quot;</code> so each card can hold a price,
        feature list, and call-to-action.
      </p>
      <Example>
        <Example.Preview>
          <div
            style={{
              display: "grid",
              gap: "var(--space-md)",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            }}
          >
            <Card title="Starter" bodyAs="none">
              <p style={{ margin: "0 0 var(--space-sm)", fontFamily: "var(--font-display)", fontSize: "2rem" }}>
                $0<span style={{ fontSize: "1rem", color: "var(--ink-soft)" }}> /mo</span>
              </p>
              <ul style={{ margin: "0 0 var(--space-md)", paddingLeft: "1.2em", color: "var(--ink-soft)" }}>
                <li>1 project</li>
                <li>Community support</li>
                <li>Public themes</li>
              </ul>
              <Button variant="outline">Start free</Button>
            </Card>
            <Card title="Studio" bodyAs="none">
              <p style={{ margin: "0 0 var(--space-sm)", fontFamily: "var(--font-display)", fontSize: "2rem" }}>
                $24<span style={{ fontSize: "1rem", color: "var(--ink-soft)" }}> /mo</span>
              </p>
              <ul style={{ margin: "0 0 var(--space-md)", paddingLeft: "1.2em", color: "var(--ink-soft)" }}>
                <li>Unlimited projects</li>
                <li>Priority email</li>
                <li>Private themes</li>
              </ul>
              <Button variant="primary">Choose Studio</Button>
            </Card>
            <Card title="Atelier" bodyAs="none">
              <p style={{ margin: "0 0 var(--space-sm)", fontFamily: "var(--font-display)", fontSize: "2rem" }}>
                $96<span style={{ fontSize: "1rem", color: "var(--ink-soft)" }}> /mo</span>
              </p>
              <ul style={{ margin: "0 0 var(--space-md)", paddingLeft: "1.2em", color: "var(--ink-soft)" }}>
                <li>Team seats</li>
                <li>Design review calls</li>
                <li>Custom brand kit</li>
              </ul>
              <Button variant="outline">Contact sales</Button>
            </Card>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">display</span>: <span className="tok-val">&quot;grid&quot;</span>, <span className="tok-prop">gap</span>: <span className="tok-val">&quot;var(--space-md)&quot;</span>,
{"\n"}             <span className="tok-prop">gridTemplateColumns</span>: <span className="tok-val">&quot;repeat(auto-fit,minmax(240px,1fr))&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<Card"}</span> <span className="tok-prop">title</span>=<span className="tok-val">"Starter"</span> <span className="tok-prop">bodyAs</span>=<span className="tok-val">"none"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-com">{"/* price, feature list, button */"}</span>
{"\n"}    <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"outline"</span><span className="tok-sel">{">"}</span>Start free<span className="tok-sel">{"</Button>"}</span>
{"\n"}  <span className="tok-sel">{"</Card>"}</span>
{"\n"}  <span className="tok-com">{"/* Studio, Atelier… */"}</span>
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <p>
        <code>auto-fit</code> with <code>minmax(240px,1fr)</code> collapses the grid
        to one column on narrow viewports without a media query.
      </p>

      <h2 id="hero-section">Hero section</h2>
      <p>
        Display-font headline, soft deck paragraph, and a paired button row.
        Every value pulls from tokens so the hero re-skins with the theme.
      </p>
      <Example>
        <Example.Preview>
          <section
            style={{
              padding: "var(--space-xl) var(--space-lg)",
              background: "var(--paper-raised)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                margin: "0 0 var(--space-sm)",
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              Paint the page with one stylesheet.
            </h3>
            <p
              style={{
                margin: "0 auto var(--space-lg)",
                maxWidth: "36ch",
                color: "var(--ink-soft)",
                fontSize: "1.05rem",
              }}
            >
              css-is-awesome is a mixin-first design system. Swap the theme link and
              the whole site re-skins — no markup changes, no rebuild.
            </p>
            <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="primary" href="/docs">Get started</Button>
              <Button variant="outline" href="/showcase">See examples</Button>
            </div>
          </section>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<section"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">padding</span>: <span className="tok-val">&quot;var(--space-xl) var(--space-lg)&quot;</span>,
{"\n"}                    <span className="tok-prop">background</span>: <span className="tok-val">&quot;var(--paper-raised)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<h1"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">fontFamily</span>: <span className="tok-val">&quot;var(--font-display)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}    Paint the page with one stylesheet.
{"\n"}  <span className="tok-sel">{"</h1>"}</span>
{"\n"}  <span className="tok-sel">{"<p"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">color</span>: <span className="tok-val">&quot;var(--ink-soft)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>Deck copy…<span className="tok-sel">{"</p>"}</span>
{"\n"}  <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"primary"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/docs"</span><span className="tok-sel">{">"}</span>Get started<span className="tok-sel">{"</Button>"}</span>
{"\n"}  <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"outline"</span> <span className="tok-prop">href</span>=<span className="tok-val">"/showcase"</span><span className="tok-sel">{">"}</span>See examples<span className="tok-sel">{"</Button>"}</span>
{"\n"}<span className="tok-sel">{"</section>"}</span></Example.Code>
      </Example>
      <p>
        Type scale uses <code>--font-display</code>; the soft deck colour pulls from{" "}
        <code>--ink-soft</code>. Spacing steps through <code>--space-sm</code>,{" "}
        <code>--space-lg</code>, and <code>--space-xl</code>.
      </p>

      <h2 id="dashboard-shell">Dashboard shell</h2>
      <p>
        A two-column app shell: sticky sidebar nav plus a main content region
        with a KPI row and a stack of cards. The grid collapses to one column
        on narrow viewports via <code>auto-fit</code>.
      </p>
      <Example>
        <Example.Preview>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 200px) 1fr",
              gap: "var(--space-md)",
              alignItems: "start",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              padding: "var(--space-md)",
              background: "var(--paper-raised)",
            }}
          >
            <nav style={{ display: "grid", gap: "2px" }} aria-label="Dashboard">
              <a href="#" style={navLinkActiveStyle}>Overview</a>
              <a href="#" style={navLinkStyle}>Projects</a>
              <a href="#" style={navLinkStyle}>Team</a>
              <a href="#" style={navLinkStyle}>Billing</a>
              <a href="#" style={navLinkStyle}>Settings</a>
            </nav>
            <div style={{ display: "grid", gap: "var(--space-md)" }}>
              <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
                <StatChip value="12,487" label="active users" />
                <StatChip value="+4.2%" label="this week" />
                <StatChip value="$84.2k" label="MRR" />
              </div>
              <Card title="Recent activity" bodyAs="none">
                <ul style={{ margin: 0, paddingLeft: "1.2em", color: "var(--ink-soft)" }}>
                  <li>Avery published the Sketchbook landing</li>
                  <li>Jordan shipped the Brutalist theme</li>
                  <li>Priya drafted the Recipes page</li>
                </ul>
              </Card>
              <Card title="Upcoming">
                Design review on Friday covers the Icon authoring spec and the
                Token audit follow-ups.
              </Card>
            </div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<div"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">display</span>: <span className="tok-val">&quot;grid&quot;</span>,
{"\n"}             <span className="tok-prop">gridTemplateColumns</span>: <span className="tok-val">&quot;minmax(0, 200px) 1fr&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<nav"}</span> <span className="tok-prop">aria-label</span>=<span className="tok-val">"Dashboard"</span><span className="tok-sel">{">"}</span>
{"\n"}    <span className="tok-sel">{"<a"}</span> <span className="tok-prop">href</span>=<span className="tok-val">"#"</span><span className="tok-sel">{">"}</span>Overview<span className="tok-sel">{"</a>"}</span>
{"\n"}    <span className="tok-com">{"/* more links… */"}</span>
{"\n"}  <span className="tok-sel">{"</nav>"}</span>
{"\n"}  <span className="tok-sel">{"<main>"}</span>
{"\n"}    <span className="tok-sel">{"<StatChip"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"12,487"</span> <span className="tok-prop">label</span>=<span className="tok-val">"active users"</span> <span className="tok-sel">{"/>"}</span>
{"\n"}    <span className="tok-sel">{"<Card"}</span> <span className="tok-prop">title</span>=<span className="tok-val">"Recent activity"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Card>"}</span>
{"\n"}  <span className="tok-sel">{"</main>"}</span>
{"\n"}<span className="tok-sel">{"</div>"}</span></Example.Code>
      </Example>
      <p>
        The active nav link uses <code>--paper-sunk</code> plus{" "}
        <code>--ink</code> to indicate state; inactive links fall back to{" "}
        <code>--ink-soft</code>.
      </p>

      <h2 id="empty-state">Empty state</h2>
      <p>
        A focused empty-state panel centred inside a <code>Card</code>. Use it
        when a list is empty on first visit — a single primary action is enough.
      </p>
      <Example>
        <Example.Preview>
          <Card title="" bodyAs="none" style={{ textAlign: "center", padding: "var(--space-xl) var(--space-lg)" }}>
            <p
              style={{
                margin: "0 0 var(--space-sm)",
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: "var(--ink)",
              }}
            >
              No projects yet
            </p>
            <p style={{ margin: "0 auto var(--space-lg)", maxWidth: "40ch", color: "var(--ink-soft)" }}>
              Projects are where you collect themes, components, and copy. Start
              one and invite a teammate when you are ready.
            </p>
            <Button variant="primary">Create your first project</Button>
          </Card>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<Card"}</span> <span className="tok-prop">title</span>=<span className="tok-val">""</span> <span className="tok-prop">bodyAs</span>=<span className="tok-val">"none"</span>
{"\n"}      <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">textAlign</span>: <span className="tok-val">&quot;center&quot;</span>,
{"\n"}               <span className="tok-prop">padding</span>: <span className="tok-val">&quot;var(--space-xl) var(--space-lg)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<p"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">fontFamily</span>: <span className="tok-val">&quot;var(--font-display)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>No projects yet<span className="tok-sel">{"</p>"}</span>
{"\n"}  <span className="tok-sel">{"<p"}</span> <span className="tok-prop">style</span>={"{{"} <span className="tok-prop">color</span>: <span className="tok-val">&quot;var(--ink-soft)&quot;</span> {"}}"}<span className="tok-sel">{">"}</span>Prose explanation…<span className="tok-sel">{"</p>"}</span>
{"\n"}  <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"primary"</span><span className="tok-sel">{">"}</span>Create your first project<span className="tok-sel">{"</Button>"}</span>
{"\n"}<span className="tok-sel">{"</Card>"}</span></Example.Code>
      </Example>

      <h2 id="notification-toast-row">Notification / toast row</h2>
      <p>
        All four <code>Alert</code> status variants. Note that <code>Alert</code>{" "}
        uses <code>status=&quot;…&quot;</code>, not <code>variant</code>.
      </p>
      <Example>
        <Example.Preview>
          <div style={{ display: "grid", gap: "var(--space-sm)" }}>
            <Alert status="success" title="Theme saved">
              Your theme &quot;Studio Warm&quot; was published to the CDN.
            </Alert>
            <Alert status="info" title="Heads up">
              Next release adds a new token group for motion.
            </Alert>
            <Alert status="warning" title="Cache expiring">
              Your preview theme link expires in two hours.
            </Alert>
            <Alert status="error" title="Publish failed">
              The theme file is missing a required token, <code>--paper</code>.
            </Alert>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">"success"</span> <span className="tok-prop">title</span>=<span className="tok-val">"Theme saved"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Alert>"}</span>
{"\n"}<span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">"info"</span> <span className="tok-prop">title</span>=<span className="tok-val">"Heads up"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Alert>"}</span>
{"\n"}<span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">"warning"</span> <span className="tok-prop">title</span>=<span className="tok-val">"Cache expiring"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Alert>"}</span>
{"\n"}<span className="tok-sel">{"<Alert"}</span> <span className="tok-prop">status</span>=<span className="tok-val">"error"</span> <span className="tok-prop">title</span>=<span className="tok-val">"Publish failed"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Alert>"}</span></Example.Code>
      </Example>

      <h2 id="data-table-basic">Data table</h2>
      <p>
        A small, sortable, hoverable <code>DataTable</code>. Click the{" "}
        <em>Project</em> or <em>Updated</em> header to toggle sort. Data is
        declared inline in the page — no fake API.
      </p>
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
      <p>
        <code>DataTable</code> is a client component under the hood — importing
        it from this server page works because Next.js inserts the client
        boundary automatically.
      </p>

      <h2 id="tabs-panel">Tabs panel</h2>
      <p>
        A three-panel <code>Tabs</code> group. Switch tabs with a click or the
        arrow keys; only the active panel is mounted.
      </p>
      <Example>
        <Example.Preview>
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="tokens">Tokens</Tabs.Trigger>
              <Tabs.Trigger value="changelog">Changelog</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>
                A short summary of the project: goals, scope, and status at a glance.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="tokens">
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>
                The theme publishes <code>--paper</code>, <code>--ink</code>,
                and a full spacing scale. Nothing is hard-coded.
              </p>
            </Tabs.Panel>
            <Tabs.Panel value="changelog">
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>
                v0.4.0 adds utility classes; v0.5.0 ships the Sketchbook theme template.
              </p>
            </Tabs.Panel>
          </Tabs>
        </Example.Preview>
        <Example.Code><span className="tok-sel">{"<Tabs"}</span> <span className="tok-prop">defaultValue</span>=<span className="tok-val">"overview"</span><span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<Tabs.List>"}</span>
{"\n"}    <span className="tok-sel">{"<Tabs.Trigger"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"overview"</span><span className="tok-sel">{">"}</span>Overview<span className="tok-sel">{"</Tabs.Trigger>"}</span>
{"\n"}    <span className="tok-sel">{"<Tabs.Trigger"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"tokens"</span><span className="tok-sel">{">"}</span>Tokens<span className="tok-sel">{"</Tabs.Trigger>"}</span>
{"\n"}    <span className="tok-sel">{"<Tabs.Trigger"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"changelog"</span><span className="tok-sel">{">"}</span>Changelog<span className="tok-sel">{"</Tabs.Trigger>"}</span>
{"\n"}  <span className="tok-sel">{"</Tabs.List>"}</span>
{"\n"}  <span className="tok-sel">{"<Tabs.Panel"}</span> <span className="tok-prop">value</span>=<span className="tok-val">"overview"</span><span className="tok-sel">{">"}</span>…<span className="tok-sel">{"</Tabs.Panel>"}</span>
{"\n"}  <span className="tok-com">{"/* more panels… */"}</span>
{"\n"}<span className="tok-sel">{"</Tabs>"}</span></Example.Code>
      </Example>

      <h2 id="modal-trigger">Modal trigger</h2>
      <p>
        <code>Modal</code> is portal-rendered and always client-side, so the
        preview below shows the trigger plus a static rendering of the dialog
        shell. The live interactive version is on the components gallery — this
        recipe is the copy-paste wiring.
      </p>
      <Example>
        <Example.Preview>
          <div style={{ display: "grid", gap: "var(--space-md)" }}>
            <div>
              <Button variant="primary">Open dialog</Button>
            </div>
            {/* The static modal demo below is a non-interactive preview of the
                dialog shell — the live, portal-rendered version is on the
                components gallery. We use `inert` (React 19, native HTML)
                instead of `aria-hidden`: it removes the focusable Cancel /
                Delete buttons from the tab order AND hides the subtree from
                assistive tech, which is exactly what axe's `aria-hidden-focus`
                rule wants. */}
            <div
              inert
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                background: "var(--paper-raised)",
                padding: "var(--space-md)",
                maxWidth: "440px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
              }}
            >
              <p
                style={{
                  margin: "0 0 var(--space-sm)",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  color: "var(--ink)",
                }}
              >
                Delete project?
              </p>
              <p style={{ margin: "0 0 var(--space-md)", color: "var(--ink-soft)" }}>
                This removes the project and all of its themes. You cannot undo this.
              </p>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Delete</Button>
              </div>
            </div>
          </div>
        </Example.Preview>
        <Example.Code><span className="tok-com">{"// in a client component"}</span>
{"\n"}<span className="tok-sel">{"const"}</span> [open, setOpen] = <span className="tok-val">useState</span>(false);
{"\n"}
{"\n"}<span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"primary"</span> <span className="tok-prop">onClick</span>={"{() => setOpen(true)}"}<span className="tok-sel">{">"}</span>
{"\n"}  Open dialog
{"\n"}<span className="tok-sel">{"</Button>"}</span>
{"\n"}
{"\n"}<span className="tok-sel">{"<Modal"}</span> <span className="tok-prop">open</span>={"{open}"} <span className="tok-prop">onClose</span>={"{() => setOpen(false)}"}<span className="tok-sel">{">"}</span>
{"\n"}  <span className="tok-sel">{"<Modal.Header>"}</span>Delete project?<span className="tok-sel">{"</Modal.Header>"}</span>
{"\n"}  <span className="tok-sel">{"<Modal.Body>"}</span>
{"\n"}    This removes the project and all of its themes.
{"\n"}  <span className="tok-sel">{"</Modal.Body>"}</span>
{"\n"}  <span className="tok-sel">{"<Modal.Footer>"}</span>
{"\n"}    <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"ghost"</span> <span className="tok-prop">onClick</span>={"{() => setOpen(false)}"}<span className="tok-sel">{">"}</span>Cancel<span className="tok-sel">{"</Button>"}</span>
{"\n"}    <span className="tok-sel">{"<Button"}</span> <span className="tok-prop">variant</span>=<span className="tok-val">"primary"</span><span className="tok-sel">{">"}</span>Delete<span className="tok-sel">{"</Button>"}</span>
{"\n"}  <span className="tok-sel">{"</Modal.Footer>"}</span>
{"\n"}<span className="tok-sel">{"</Modal>"}</span></Example.Code>
      </Example>
      <p>
        <code>Modal</code> accepts <code>open</code> and <code>onClose</code> —
        state lives in the parent client component. Keyboard focus is trapped
        while the dialog is open and returned on close.
      </p>
    </>
  );
}
