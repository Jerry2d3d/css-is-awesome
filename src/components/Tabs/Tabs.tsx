import { createContext, forwardRef, useContext, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tabs.module.scss";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
};

const TabsContext = createContext<TabsContextValue | null>(null);
function useTabs(label: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${label} must be rendered inside <Tabs>`);
  return ctx;
}

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue, onValueChange, orientation = "horizontal", className, children, ...rest }, ref) => {
    const [internal, setInternal] = useState(defaultValue);
    const controlled = value !== undefined;
    const current = controlled ? value : internal;
    const baseId = useId();

    const setValue = (v: string) => {
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    };

    const classes = [styles.tabs, orientation === "vertical" && styles.vertical, className].filter(Boolean).join(" ");

    return (
      <TabsContext.Provider value={{ value: current, setValue, baseId, orientation }}>
        <div ref={ref} data-orientation={orientation} className={classes} {...rest}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...rest }, ref) => {
    const { orientation } = useTabs("<Tabs.List>");
    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={[styles.list, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
TabList.displayName = "Tabs.List";

export type TabTriggerProps = Omit<HTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
  disabled?: boolean;
};
const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ value: v, disabled, className, children, onKeyDown, ...rest }, ref) => {
    const { value, setValue, baseId, orientation } = useTabs("<Tabs.Trigger>");
    const active = value === v;

    const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const isHoriz = orientation === "horizontal";
      const next = isHoriz ? "ArrowRight" : "ArrowDown";
      const prev = isHoriz ? "ArrowLeft" : "ArrowUp";
      const list = (e.currentTarget.closest('[role="tablist"]') as HTMLElement | null);
      if (!list) return;
      const triggers = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
      const idx = triggers.indexOf(e.currentTarget);

      if (e.key === next) {
        e.preventDefault();
        triggers[(idx + 1) % triggers.length]?.focus();
      } else if (e.key === prev) {
        e.preventDefault();
        triggers[(idx - 1 + triggers.length) % triggers.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        triggers[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        triggers[triggers.length - 1]?.focus();
      }

      onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${baseId}-trigger-${v}`}
        aria-controls={`${baseId}-panel-${v}`}
        aria-selected={active}
        data-state={active ? "active" : "inactive"}
        tabIndex={active ? 0 : -1}
        disabled={disabled}
        className={[styles.trigger, active && styles.active, className].filter(Boolean).join(" ")}
        onClick={() => setValue(v)}
        onKeyDown={handleKey}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
TabTrigger.displayName = "Tabs.Trigger";

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & { value: string };
const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value: v, className, children, ...rest }, ref) => {
    const { value, baseId } = useTabs("<Tabs.Panel>");
    const active = value === v;
    if (!active) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${v}`}
        aria-labelledby={`${baseId}-trigger-${v}`}
        tabIndex={0}
        className={[styles.panel, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
TabPanel.displayName = "Tabs.Panel";

type TabsCompound = typeof Tabs & {
  List: typeof TabList;
  Trigger: typeof TabTrigger;
  Panel: typeof TabPanel;
};
const TabsWithSub = Tabs as TabsCompound;
TabsWithSub.List = TabList;
TabsWithSub.Trigger = TabTrigger;
TabsWithSub.Panel = TabPanel;

export default TabsWithSub;
