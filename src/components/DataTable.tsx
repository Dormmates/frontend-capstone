import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  emptyMessage?: string;
  className?: string;

  selectable?: boolean;
  getRowId?: (item: T, index?: number) => string | number;
  onSelectionChange?: (selectedItems: T[]) => void;
}

export function DataTable<T>({
  columns,
  data = [],
  emptyMessage = "No data found.",
  className,
  selectable = false,
  getRowId,
  onSelectionChange,
}: DataTableProps<T>) {
  // Fallback ID getter (index-based string)
  const getId = getRowId ?? ((_: T, idx: number) => idx.toString());

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? data.map(getId) : [];
    setSelectedIds(newSelectedIds);

    const selectedItems = checked ? [...data] : [];
    onSelectionChange?.(selectedItems);
  };

  const handleRowSelect = (item: T, checked: boolean, idx: number) => {
    const id = getId(item, idx);
    const newSelectedIds = checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id);
    setSelectedIds(newSelectedIds);

    const selectedItems = data.filter((d, i) => newSelectedIds.includes(getId(d, i)));
    onSelectionChange?.(selectedItems);
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className={className}>
        <TableHeader className="bg-muted">
          <TableRow>
            {selectable && (
              <TableHead className="w-[40px] text-center">
                <Checkbox checked={allSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={`${col.headerClassName || ""} text-muted-foreground py-5`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-10 text-gray-400">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => {
              const id = getId(item, idx);
              const isSelected = selectedIds.includes(id);

              return (
                <TableRow key={id}>
                  {selectable && (
                    <TableCell className="text-center">
                      <Checkbox checked={isSelected} onCheckedChange={(checked) => handleRowSelect(item, Boolean(checked), idx)} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render ? col.render(item, idx) : (item as any)[col.key]}</TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
