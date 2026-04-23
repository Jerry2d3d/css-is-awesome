"use client";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Checkbox from "@/components/Checkbox";
import Pagination from "@/components/Pagination";
import Skeleton from "@/components/Skeleton";
import styles from "./DataTable.module.scss";

export type ColumnAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";

export type Column<T> = {
  id: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  width?: string;
  align?: ColumnAlign;
  cell?: (row: T, rowIndex: number) => ReactNode;
};

export type SortState = { columnId: string; direction: SortDirection } | null;

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;

  // Sorting
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;

  // Pagination
  pagination?: { pageSize: number; page?: number; onPageChange?: (page: number) => void };

  // Selection
  selection?: "none" | "single" | "multiple";
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (selected: string[]) => void;

  // Row click
  onRowClick?: (row: T, rowIndex: number) => void;

  // Loading / empty
  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;

  // Styling
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;

  className?: string;
};

function defaultAccessorValue<T>(row: T, accessor: Column<T>["accessor"]): unknown {
  if (typeof accessor === "function") return (accessor as (r: T) => unknown)(row);
  if (accessor !== undefined) return (row as Record<string, unknown>)[accessor as string];
  return undefined;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    rowKey,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    pagination,
    selection = "none",
    selected: selectedProp,
    defaultSelected = [],
    onSelectedChange,
    onRowClick,
    loading,
    loadingRows = 5,
    emptyState = "No results",
    striped,
    hoverable = true,
    bordered,
    compact,
    stickyHeader,
    className,
  } = props;

  // Sort state
  const [internalSort, setInternalSort] = useState<SortState>(defaultSort);
  const isSortControlled = sortProp !== undefined;
  const sort = isSortControlled ? (sortProp as SortState) : internalSort;
  const setSort = (next: SortState) => {
    if (!isSortControlled) setInternalSort(next);
    onSortChange?.(next);
  };

  // Selection state
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected);
  const isSelControlled = selectedProp !== undefined;
  const selected = isSelControlled ? (selectedProp as string[]) : internalSelected;
  const setSelected = (next: string[]) => {
    if (!isSelControlled) setInternalSelected(next);
    onSelectedChange?.(next);
  };

  // Page state (if pagination given but uncontrolled)
  const [internalPage, setInternalPage] = useState(1);
  const pageControlled = pagination?.page !== undefined;
  const currentPage = pagination ? (pageControlled ? (pagination.page as number) : internalPage) : 1;
  const setPage = (p: number) => {
    if (!pagination) return;
    if (!pageControlled) setInternalPage(p);
    pagination.onPageChange?.(p);
  };

  // Sort + paginate
  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return data;
    const sorted = [...data].sort((a, b) => {
      const cmp = col.sortFn
        ? col.sortFn(a, b)
        : compareValues(defaultAccessorValue(a, col.accessor), defaultAccessorValue(b, col.accessor));
      return sort.direction === "desc" ? -cmp : cmp;
    });
    return sorted;
  }, [data, sort, columns]);

  const pagedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination, currentPage]);

  const totalPages = pagination ? Math.max(1, Math.ceil(sortedData.length / pagination.pageSize)) : 1;

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sort?.columnId === col.id) {
      setSort(sort.direction === "asc" ? { columnId: col.id, direction: "desc" } : null);
    } else {
      setSort({ columnId: col.id, direction: "asc" });
    }
  };

  const toggleRowSelect = (key: string, checked: boolean) => {
    if (selection === "none") return;
    if (selection === "single") {
      setSelected(checked ? [key] : []);
      return;
    }
    const set = new Set(selected);
    if (checked) set.add(key);
    else set.delete(key);
    setSelected(Array.from(set));
  };

  const allVisibleKeys = pagedData.map(rowKey);
  const allChecked =
    selection === "multiple" &&
    allVisibleKeys.length > 0 &&
    allVisibleKeys.every((k) => selected.includes(k));
  const someChecked =
    selection === "multiple" &&
    allVisibleKeys.some((k) => selected.includes(k)) &&
    !allChecked;

  const toggleAll = (checked: boolean) => {
    if (selection !== "multiple") return;
    if (checked) {
      setSelected(Array.from(new Set([...selected, ...allVisibleKeys])));
    } else {
      setSelected(selected.filter((k) => !allVisibleKeys.includes(k)));
    }
  };

  const wrapperClasses = [styles.wrapper, stickyHeader && styles.stickyHeader, className]
    .filter(Boolean)
    .join(" ");

  const tableClasses = [
    styles.table,
    striped && styles.striped,
    hoverable && styles.hoverable,
    bordered && styles.bordered,
    compact && styles.compact,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={styles.scroll}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {selection === "multiple" && (
                <th scope="col" className={styles.selectCol}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {selection === "single" && <th scope="col" className={styles.selectCol} />}
              {columns.map((col) => {
                const active = sort?.columnId === col.id;
                const indicator = active ? (sort.direction === "asc" ? " \u25B2" : " \u25BC") : "";
                const ariaSort: "ascending" | "descending" | undefined = active
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      styles.headerCell,
                      col.align && styles[`align-${col.align}`],
                      col.sortable && styles.sortable,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {col.sortable ? (
                      <button type="button" className={styles.sortButton} onClick={() => toggleSort(col)}>
                        {col.header}
                        <span aria-hidden="true">{indicator}</span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skel-${i}`} aria-busy="true">
                  {selection !== "none" && (
                    <td>
                      <Skeleton width={16} height={16} shape="rect" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id}>
                      <Skeleton shape="text" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && pagedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selection !== "none" ? 1 : 0)}
                  className={styles.empty}
                >
                  {emptyState}
                </td>
              </tr>
            )}

            {!loading &&
              pagedData.map((row, i) => {
                const key = rowKey(row);
                const isSelected = selected.includes(key);
                return (
                  <tr
                    key={key}
                    data-selected={isSelected || undefined}
                    onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                    className={[onRowClick && styles.clickable, isSelected && styles.selected]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {selection === "multiple" && (
                      <td className={styles.selectCol} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleRowSelect(key, e.target.checked)}
                          aria-label={`Select row ${i + 1}`}
                        />
                      </td>
                    )}
                    {selection === "single" && (
                      <td className={styles.selectCol} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="cia-datatable-select"
                          checked={isSelected}
                          onChange={(e) => toggleRowSelect(key, e.target.checked)}
                          aria-label={`Select row ${i + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={[col.align && styles[`align-${col.align}`]]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {col.cell
                          ? col.cell(row, i)
                          : String(defaultAccessorValue(row, col.accessor) ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {pagination && !loading && sortedData.length > pagination.pageSize && (
        <div className={styles.paginationBar}>
          <span className={styles.count}>
            {`Showing ${(currentPage - 1) * pagination.pageSize + 1}\u2013${Math.min(
              currentPage * pagination.pageSize,
              sortedData.length
            )} of ${sortedData.length}`}
          </span>
          <Pagination current={currentPage} total={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";

export default DataTable;
