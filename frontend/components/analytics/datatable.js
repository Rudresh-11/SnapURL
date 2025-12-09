"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUpDown, MoreHorizontal } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { formatIST } from "@/lib/timeconverter";

export function ClicksTable({ data = [] }) {
  // ----------------------------------------------------------------
  // 1️⃣ LOCAL STATE
  // ----------------------------------------------------------------
  const [globalFilter, setGlobalFilter] = React.useState(""); // global search
  const [sorting, setSorting] = React.useState([{ id: "clicked_at", desc: true }]);
  const [filters, setFilters] = React.useState([]);
  const [visibility, setVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  // ----------------------------------------------------------------
  // 2️⃣ COLUMNS
  // ----------------------------------------------------------------
  const columns = [
    // SERIAL NO
    {
      id: "sr_no",
      header: "Sr No",
      cell: ({ row }) => Number(row.id) + 1,
      enableSorting: false,
    },

    // SELECTION CHECKBOX
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    { accessorKey: "ip_address", header: "IP Address" },
    { accessorKey: "country", header: "Country" },

    {
      accessorKey: "device_type",
      header: "Device",
      cell: ({ row }) => row.getValue("device_type")?.toUpperCase(),
    },

    {
      accessorKey: "referrer",
      header: "Referrer",
    },

    {
      accessorKey: "clicked_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Clicked at <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      ),
      cell: ({ row }) => {
        const raw = row.getValue("clicked_at"); // original date string
        return formatIST(raw);
      },
      enableSorting:true,
    },

    // ACTIONS MENU
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.ip_address)}
              >
                Copy IP
              </DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ----------------------------------------------------------------
  // 3️⃣ TABLE INSTANCE
  // ----------------------------------------------------------------
  const table = useReactTable({
    data,
    columns,
    globalFilter,
    onGlobalFilterChange: setGlobalFilter,

    state: {
      globalFilter,
      sorting,
      columnFilters: filters,
      columnVisibility: visibility,
      rowSelection,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    // Enable global filtering on ALL fields
    globalFilterFn: (row, _, value) => {
      if (!value) return true;
      return Object.values(row.original)
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  });

  // ----------------------------------------------------------------
  // 4️⃣ EXPORT SELECTED ROWS HANDLER
  // ----------------------------------------------------------------
  function handleExport() {
    const rows = table.getSelectedRowModel().rows.map((r) => r.original);
    console.log("EXPORTING ROWS:", rows);

    // You can replace with CSV, Excel, or API export
    alert(`Exported ${rows.length} rows (check console).`);
  }

  // ----------------------------------------------------------------
  // 5️⃣ RENDER UI
  // ----------------------------------------------------------------
  return (
    <div className="w-full mt-8">

      {/* GLOBAL SEARCH */}
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search anything..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* EXPORT BUTTON WHEN ROWS SELECTED */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="default"
            className="bg-blue-600 text-white"
            onClick={handleExport}
          >
            Export {table.getSelectedRowModel().rows.length} rows
          </Button>
        )}

        {/* COLUMN SELECTOR */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getSelectedRowModel().rows.length} row(s) selected out of {table.getFilteredRowModel().rows.length}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
