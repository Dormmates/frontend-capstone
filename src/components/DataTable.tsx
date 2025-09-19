import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = "No data found.", className }: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg border`}>
      <Table className={className}>
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((col) => (
              <TableHead className={`${col.headerClassName || ""} text-muted-foreground py-5`} key={col.key}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-10 text-gray-400">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data?.map((item, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.render ? col.render(item) : (item as any)[col.key]}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
