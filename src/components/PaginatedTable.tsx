import React, { useMemo, useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable";
import Pagination from "./Pagination";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  itemsPerPage?: number;
  className?: string;
}

const PaginatedTable = <T,>({ columns, itemsPerPage = 5, data, emptyMessage, className }: DataTableProps<T>) => {
  const [page, setPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [data]);

  return (
    <>
      <DataTable<T> columns={columns} data={paginatedItems} emptyMessage={emptyMessage} className={className} />
      <Pagination
        currentPage={page}
        totalPage={Math.ceil(data.length / itemsPerPage)}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </>
  );
};

export default PaginatedTable;
