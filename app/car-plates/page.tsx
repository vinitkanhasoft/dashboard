"use client";



import * as React from "react";

import {

  closestCenter,

  DndContext,

  KeyboardSensor,

  MouseSensor,

  TouchSensor,

  useSensor,

  useSensors,

  type DragEndEvent,

  type UniqueIdentifier,

} from "@dnd-kit/core";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {

  arrayMove,

  SortableContext,

  useSortable,

  verticalListSortingStrategy,

} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {

  IconChevronDown,

  IconChevronLeft,

  IconChevronRight,

  IconChevronsLeft,

  IconChevronsRight,

  IconDotsVertical,

  IconGripVertical,

  IconLayoutColumns,

  IconSearch,

  IconDownload,

  IconRefresh,

  IconCheck,

} from "@tabler/icons-react";

import {

  flexRender,

  getCoreRowModel,

  getFacetedRowModel,

  getFacetedUniqueValues,

  getFilteredRowModel,

  getPaginationRowModel,

  getSortedRowModel,

  useReactTable,

  type ColumnDef,

  type ColumnFiltersState,

  type Row,

  type SortingState,

  type VisibilityState,

} from "@tanstack/react-table";

import { toast, Toaster } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";



import { AppSidebar } from "@/components/app-sidebar";

import { SiteHeader } from "@/components/site-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {

  Drawer,

  DrawerClose,

  DrawerContent,

  DrawerDescription,

  DrawerFooter,

  DrawerHeader,

  DrawerTitle,

} from "@/components/ui/drawer";

import {

  DropdownMenu,

  DropdownMenuCheckboxItem,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuLabel,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {

  Eye,

  Calendar,

  Car,

  MapPin,

  Hash,

  User,

  CheckCircle2,

  XCircle,

} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchCarPlates,

  validateCarPlate,

  clearValidationResult,

  type CarPlate,

} from "@/lib/redux/carPlateSlice";

import {

  VEHICLE_TYPE_LABELS,

  VehicleType,

  RTO_STATE_PREFIXES,

} from "@/lib/enums/CarPlateEnums";

import {

  AlertDialog,

  AlertDialogAction,

  AlertDialogCancel,

  AlertDialogContent,

  AlertDialogDescription,

  AlertDialogFooter,

  AlertDialogHeader,

  AlertDialogTitle,

} from "@/components/ui/alert-dialog";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";



// ─── Drag Handle ──────────────────────────────────────────

function DragHandle({ id }: { id: string }) {

  const { attributes, listeners, isDragging } = useSortable({ id });

  return (

    <Button

      {...attributes}

      {...listeners}

      variant="ghost"

      size="icon"

      className={`text-muted-foreground size-7 hover:bg-transparent hover:text-foreground transition-all duration-200 ${

        isDragging ? "cursor-grabbing text-primary scale-110" : "cursor-grab"

      }`}

    >

      <IconGripVertical className="size-3.5" />

      <span className="sr-only">Drag to reorder</span>

    </Button>

  );

}



// ─── Draggable Row ────────────────────────────────────────

function DraggableRow({ row }: { row: Row<CarPlate> }) {

  const { transform, transition, setNodeRef, isDragging } = useSortable({

    id: row.original._id,

  });

  return (

    <TableRow

      data-state={row.getIsSelected() && "selected"}

      data-dragging={isDragging}

      ref={setNodeRef}

      className={`

        relative z-0 transition-all duration-300 group

        data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[dragging=true]:shadow-xl data-[dragging=true]:scale-[1.02] data-[dragging=true]:bg-white dark:data-[dragging=true]:bg-gray-900

        data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10

        hover:bg-linear-to-r hover:from-muted/50 hover:to-muted/30 dark:hover:from-muted/20 dark:hover:to-muted/10

        ${row.index % 2 === 0 ? "bg-white dark:bg-gray-900/50" : "bg-gray-50/30 dark:bg-gray-800/30"}

      `}

      style={{

        transform: CSS.Transform.toString(transform),

        transition: transition,

      }}

    >

      {row.getVisibleCells().map((cell) => (

        <TableCell key={cell.id} className="py-3">

          {flexRender(cell.column.columnDef.cell, cell.getContext())}

        </TableCell>

      ))}

    </TableRow>

  );

}



// ─── Helper Functions ──────────────────────────────────────

function getPageNumbers(table: any) {

  const currentPage = table.getState().pagination.pageIndex + 1;

  const totalPages = table.getPageCount();

  const maxVisiblePages = 5;

  

  if (totalPages <= maxVisiblePages) {

    return Array.from({ length: totalPages }, (_, i) => i + 1);

  }

  

  const pages = [];

  const halfVisible = Math.floor(maxVisiblePages / 2);

  

  if (currentPage <= halfVisible + 1) {

    // Show first pages

    for (let i = 1; i <= maxVisiblePages - 1; i++) {

      pages.push(i);

    }

    pages.push('...');

    pages.push(totalPages);

  } else if (currentPage >= totalPages - halfVisible) {

    // Show last pages

    pages.push(1);

    pages.push('...');

    for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) {

      pages.push(i);

    }

  } else {

    // Show middle pages

    pages.push(1);

    pages.push('...');

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {

      pages.push(i);

    }

    pages.push('...');

    pages.push(totalPages);

  }

  

  return pages;

}



// ─── Main Page ────────────────────────────────────────────

export default function CarPlatesPage() {

  const dispatch = useAppDispatch();

  const { carPlates, loading, validating, validationResult } = useAppSelector(

    (s) => s.carPlate

  );



  const hasFetched = React.useRef(false);



  const [data, setData] = React.useState<CarPlate[]>([]);

  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] =

    React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] =

    React.useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] = React.useState({

    pageIndex: 0,

    pageSize: 10,

  });

  const [globalFilter, setGlobalFilter] = React.useState("");



  const [mounted, setMounted] = React.useState(false);

  const [isRefreshing, setIsRefreshing] = React.useState(false);



  // View drawer

  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);

  const [viewPlate, setViewPlate] = React.useState<CarPlate | null>(null);



  // Validate dialog

  const [validateDialogOpen, setValidateDialogOpen] = React.useState(false);

  const [validateInput, setValidateInput] = React.useState("");



  const sortableId = React.useId();

  const sensors = useSensors(

    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),

    useSensor(TouchSensor, {

      activationConstraint: { delay: 200, tolerance: 8 },

    }),

    useSensor(KeyboardSensor, {})

  );



  React.useEffect(() => {

    if (!hasFetched.current) {

      hasFetched.current = true;

      dispatch(fetchCarPlates());

    }

  }, [dispatch]);



  React.useEffect(() => {

    if (carPlates) setData(carPlates.filter((p) => p && p._id));

  }, [carPlates]);



  React.useEffect(() => {

    setMounted(true);

  }, []);



  const dataIds = React.useMemo<UniqueIdentifier[]>(

    () => data?.map(({ _id }) => _id) || [],

    [data]

  );



  // Stats

  const totalPlates = data.length;

  const validPlates = data.filter((p) => p.isValid).length;

  const uniqueStates = new Set(data.map((p) => p.state)).size;

  const uniqueRto = new Set(data.map((p) => p.rtoCode)).size;



  const handleRefresh = async () => {

    setIsRefreshing(true);

    await dispatch(fetchCarPlates());

    setIsRefreshing(false);

    toast.success("Data refreshed successfully");

  };



  const handleValidate = async () => {

    if (!validateInput.trim()) {

      toast.error("Enter a plate number to validate");

      return;

    }

    await dispatch(validateCarPlate(validateInput.trim().toUpperCase()));

  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);

    doc.text("Car Plates Report", 14, 18);

    doc.setFontSize(10);

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);



    const rows = table.getFilteredRowModel().rows;

    const tableData = rows.map((row) => {

      const p = row.original;

      return [

        p.plateNumber,

        p.state,

        p.rtoCode,

        VEHICLE_TYPE_LABELS[p.vehicleType as VehicleType] || p.vehicleType,

        p.ownerName || "—",

        p.isValid ? "Valid" : "Invalid",

        new Date(p.createdAt).toLocaleDateString(),

      ];

    });



    autoTable(doc, {

      head: [

        [

          "Plate Number",

          "State",

          "RTO Code",

          "Vehicle Type",

          "Owner",

          "Status",

          "Created",

        ],

      ],

      body: tableData,

      startY: 30,

      styles: { fontSize: 8 },

      headStyles: { fillColor: [41, 128, 185] },

    });



    doc.save("car-plates.pdf");

    toast.success("PDF downloaded successfully");

  };



  function handleDragEnd(event: DragEndEvent) {

    const { active, over } = event;

    if (active && over && active.id !== over.id) {

      setData((d) => {

        const oldIndex = dataIds.indexOf(active.id);

        const newIndex = dataIds.indexOf(over.id);

        return arrayMove(d, oldIndex, newIndex);

      });

      toast.success("Reordered successfully", {

        icon: <IconCheck className="h-4 w-4" />,

      });

    }

  }



  // ─── Columns ───────────────────────────────────────────

  const columns = React.useMemo<ColumnDef<CarPlate>[]>(

    () => [

      {

        id: "drag",

        header: () => null,

        cell: ({ row }) => <DragHandle id={row.original._id} />,

        size: 40,

      },

      {

        id: "select",

        header: ({ table }) => (

          <div className="flex items-center justify-center">

            <Checkbox

              checked={

                table.getIsAllPageRowsSelected() ||

                (table.getIsSomePageRowsSelected() && "indeterminate")

              }

              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}

              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"

            />

          </div>

        ),

        cell: ({ row }) => (

          <div className="flex items-center justify-center">

            <Checkbox

              checked={row.getIsSelected()}

              onCheckedChange={(v) => row.toggleSelected(!!v)}

              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"

            />

          </div>

        ),

        enableSorting: false,

        enableHiding: false,

        size: 40,

      },

      {

        accessorKey: "plateNumber",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() =>

              column.toggleSorting(column.getIsSorted() === "asc")

            }

            className="hover:bg-transparent font-semibold"

          >

            Plate Number

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => (

          <Button

            variant="link"

            className="text-foreground hover:text-primary w-fit px-0 text-left font-mono font-semibold"

            onClick={() => {

              setViewPlate(row.original);

              setViewDrawerOpen(true);

            }}

          >

            {row.original.plateNumber}

          </Button>

        ),

        enableGlobalFilter: true,

        size: 160,

      },

      {

        accessorKey: "state",

        header: "State",

        cell: ({ row }) => (

          <div className="flex items-center gap-2">

            <MapPin className="size-3.5 text-muted-foreground shrink-0" />

            <span className="text-sm">{row.original.state}</span>

          </div>

        ),

        size: 160,

      },

      {

        accessorKey: "rtoCode",

        header: "RTO Code",

        cell: ({ row }) => (

          <Badge variant="secondary">{row.original.rtoCode}</Badge>

        ),

        size: 100,

      },

      {

        accessorKey: "vehicleType",

        header: "Vehicle Type",

        cell: ({ row }) => (

          <div className="flex items-center gap-2">

            <Car className="size-3.5 text-muted-foreground" />

            <span className="text-sm">

              {VEHICLE_TYPE_LABELS[row.original.vehicleType as VehicleType] ||

                row.original.vehicleType}

            </span>

          </div>

        ),

        filterFn: (row, _columnId, filterValue) => {

          if (!filterValue || filterValue === "all") return true;

          return row.original.vehicleType === filterValue;

        },

        size: 130,

      },

      {

        accessorKey: "ownerName",

        header: "Owner",

        cell: ({ row }) => (

          <div className="flex items-center gap-2">

            <User className="size-3.5 text-muted-foreground" />

            <span className="text-sm">{row.original.ownerName || "—"}</span>

          </div>

        ),

        size: 150,

      },

      {

        accessorKey: "isValid",

        header: "Status",

        cell: ({ row }) =>

          row.original.isValid ? (

            <Badge variant="outline" className="gap-1">

              <CheckCircle2 className="size-3" /> Valid

            </Badge>

          ) : (

            <Badge variant="outline" className="gap-1 text-muted-foreground">

              <XCircle className="size-3" /> Invalid

            </Badge>

          ),

        size: 100,

      },

      {

        accessorKey: "createdAt",

        header: "Created",

        cell: ({ row }) => {

          const date = new Date(row.original.createdAt);

          return (

            <div className="flex items-center gap-2">

              <Calendar className="size-3.5 text-muted-foreground" />

              <span className="text-sm">

                {date.toLocaleDateString("en-US", {

                  month: "short",

                  day: "numeric",

                  year: "numeric",

                })}

              </span>

            </div>

          );

        },

        size: 130,

      },

      {

        id: "actions",

        cell: ({ row }) => (

          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button

                variant="ghost"

                className="data-[state=open]:bg-primary/10 text-muted-foreground hover:text-foreground flex size-8"

                size="icon"

              >

                <IconDotsVertical className="size-4" />

              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">

              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                className="cursor-pointer gap-2"

                onClick={() => {

                  setViewPlate(row.original);

                  setViewDrawerOpen(true);

                }}

              >

                <Eye className="h-4 w-4" />

                <span>View Details</span>

              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        ),

        size: 50,

      },

    ],

    []

  );



  const table = useReactTable({

    data,

    columns,

    state: {

      sorting,

      columnVisibility,

      rowSelection,

      columnFilters,

      pagination,

      globalFilter,

    },

    getRowId: (row) => row._id,

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,

    onSortingChange: setSorting,

    onColumnFiltersChange: setColumnFilters,

    onColumnVisibilityChange: setColumnVisibility,

    onPaginationChange: setPagination,

    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),

    getFacetedUniqueValues: getFacetedUniqueValues(),

  });



  if (!mounted) return null;



  return (

    <SidebarProvider>

      <AppSidebar variant="inset" />

      <SidebarInset>

        <SiteHeader />

        <div className="flex flex-1 flex-col overflow-hidden">

          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

              {/* Header */}

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-2xl font-bold tracking-tight">

                    Car Plates

                  </h1>

                  <p className="text-muted-foreground">

                    View registered vehicle plate numbers

                  </p>

                </div>

                <Button

                  variant="outline"

                  size="sm"

                  className="h-9 gap-2"

                  onClick={() => {

                    setValidateInput("");

                    dispatch(clearValidationResult());

                    setValidateDialogOpen(true);

                  }}

                >

                  <CheckCircle2 className="size-3.5" />

                  <span className="hidden lg:inline">Validate Plate</span>

                </Button>

              </div>



              {/* Stats */}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Card>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                    <CardTitle className="text-sm font-medium">

                      Total Plates

                    </CardTitle>

                    <Hash className="h-4 w-4 text-muted-foreground" />

                  </CardHeader>

                  <CardContent>

                    <div className="text-2xl font-bold">{totalPlates}</div>

                    <p className="text-xs text-muted-foreground">

                      Registered plates

                    </p>

                  </CardContent>

                </Card>

                <Card>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                    <CardTitle className="text-sm font-medium">

                      Valid Plates

                    </CardTitle>

                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />

                  </CardHeader>

                  <CardContent>

                    <div className="text-2xl font-bold">{validPlates}</div>

                    <p className="text-xs text-muted-foreground">

                      {totalPlates > 0

                        ? ((validPlates / totalPlates) * 100).toFixed(0)

                        : 0}

                      % of total

                    </p>

                  </CardContent>

                </Card>

                <Card>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                    <CardTitle className="text-sm font-medium">

                      States Covered

                    </CardTitle>

                    <MapPin className="h-4 w-4 text-muted-foreground" />

                  </CardHeader>

                  <CardContent>

                    <div className="text-2xl font-bold">{uniqueStates}</div>

                    <p className="text-xs text-muted-foreground">

                      Unique states

                    </p>

                  </CardContent>

                </Card>

                <Card>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                    <CardTitle className="text-sm font-medium">

                      RTO Codes

                    </CardTitle>

                    <Car className="h-4 w-4 text-muted-foreground" />

                  </CardHeader>

                  <CardContent>

                    <div className="text-2xl font-bold">{uniqueRto}</div>

                    <p className="text-xs text-muted-foreground">

                      Unique RTO codes

                    </p>

                  </CardContent>

                </Card>

              </div>



              {/* Toolbar */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 flex-1">

                  <div className="relative flex-1 max-w-md">

                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input

                      placeholder="Search plate number, state, owner..."

                      value={globalFilter ?? ""}

                      onChange={(e) => setGlobalFilter(e.target.value)}

                      className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"

                    />

                  </div>

                  <Select

                    value={

                      (columnFilters.find((f) => f.id === "vehicleType")

                        ?.value as string) || "all"

                    }

                    onValueChange={(v) => {

                      if (v === "all") {

                        setColumnFilters((prev) =>

                          prev.filter((f) => f.id !== "vehicleType")

                        );

                      } else {

                        setColumnFilters((prev) => {

                          const rest = prev.filter(

                            (f) => f.id !== "vehicleType"

                          );

                          return [...rest, { id: "vehicleType", value: v }];

                        });

                      }

                    }}

                  >

                    <SelectTrigger className="h-9 w-40">

                      <SelectValue placeholder="Vehicle type" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">All Types</SelectItem>

                      {Object.values(VehicleType).map((vt) => (

                        <SelectItem key={vt} value={vt}>

                          {VEHICLE_TYPE_LABELS[vt]}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                  <DropdownMenu>

                    <DropdownMenuTrigger asChild>

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-9 gap-2 border-muted hover:bg-muted/50"

                      >

                        <IconLayoutColumns className="size-3.5" />

                        <span className="hidden lg:inline">Columns</span>

                        <IconChevronDown className="size-3.5" />

                      </Button>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-48">

                      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      {table

                        .getAllColumns()

                        .filter(

                          (col) =>

                            typeof col.accessorFn !== "undefined" &&

                            col.getCanHide()

                        )

                        .map((col) => (

                          <DropdownMenuCheckboxItem

                            key={col.id}

                            className="capitalize cursor-pointer"

                            checked={col.getIsVisible()}

                            onCheckedChange={(v) => col.toggleVisibility(!!v)}

                          >

                            {col.id === "plateNumber"

                              ? "Plate Number"

                              : col.id === "rtoCode"

                                ? "RTO Code"

                                : col.id === "vehicleType"

                                  ? "Vehicle Type"

                                  : col.id === "ownerName"

                                    ? "Owner"

                                    : col.id === "isValid"

                                      ? "Status"

                                      : col.id === "createdAt"

                                        ? "Created"

                                        : col.id}

                          </DropdownMenuCheckboxItem>

                        ))}

                    </DropdownMenuContent>

                  </DropdownMenu>

                </div>

                <div className="flex items-center gap-2">

                  <Button

                    variant="ghost"

                    size="icon"

                    className="h-9 w-9"

                    onClick={handleRefresh}

                    disabled={isRefreshing || loading}

                  >

                    <IconRefresh

                      className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}

                    />

                  </Button>

                  <Button

                    variant="ghost"

                    size="icon"

                    className="h-9 w-9"

                    onClick={handleDownloadPDF}

                  >

                    <IconDownload className="h-4 w-4" />

                  </Button>

                </div>

              </div>



              {/* Data Table */}

              {loading ? (

                <div className="rounded-xl border bg-card shadow-lg">

                  <div className="overflow-x-auto">

                    <Table>

                      <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">

                        <TableRow className="hover:bg-transparent">

                          {[40, 40, 160, 160, 100, 130, 150, 100, 130, 50].map(

                            (w, i) => (

                              <TableHead

                                key={i}

                                style={{ width: w }}

                                className="h-11"

                              >

                                <Skeleton className="h-4 w-12 rounded" />

                              </TableHead>

                            )

                          )}

                        </TableRow>

                      </TableHeader>

                      <TableBody>

                        {Array.from({ length: 5 }).map((_, i) => (

                          <TableRow key={i}>

                            {[

                              40, 40, 160, 160, 100, 130, 150, 100, 130, 50,

                            ].map((w, j) => (

                              <TableCell key={j} style={{ width: w }}>

                                <Skeleton className="h-4 w-full rounded" />

                              </TableCell>

                            ))}

                          </TableRow>

                        ))}

                      </TableBody>

                    </Table>

                  </div>

                </div>

              ) : table.getFilteredRowModel().rows.length === 0 ? (

                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card shadow-lg">

                  <div className="rounded-full bg-muted p-4 mb-4">

                    <Car className="h-12 w-12 text-muted-foreground/50" />

                  </div>

                  <h3 className="text-lg font-semibold">

                    No car plates found

                  </h3>

                  <p className="text-muted-foreground mt-1 max-w-sm">

                    No plates match your search criteria. Try adjusting your

                    filters.

                  </p>

                </div>

              ) : (

                <div className="rounded-xl border bg-card shadow-lg">

                  <div className="overflow-x-auto">

                    <DndContext

                      collisionDetection={closestCenter}

                      modifiers={[restrictToVerticalAxis]}

                      onDragEnd={handleDragEnd}

                      sensors={sensors}

                      id={sortableId}

                    >

                      <Table>

                        <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40 sticky top-0 z-10">

                          {table.getHeaderGroups().map((headerGroup) => (

                            <TableRow

                              key={headerGroup.id}

                              className="hover:bg-transparent"

                            >

                              {headerGroup.headers.map((header) => (

                                <TableHead

                                  key={header.id}

                                  colSpan={header.colSpan}

                                  className="h-11 text-xs font-semibold uppercase tracking-wider text-muted-foreground"

                                  style={{ width: header.getSize() }}

                                >

                                  {header.isPlaceholder

                                    ? null

                                    : flexRender(

                                        header.column.columnDef.header,

                                        header.getContext()

                                      )}

                                </TableHead>

                              ))}

                            </TableRow>

                          ))}

                        </TableHeader>

                        <TableBody>

                          <SortableContext

                            items={dataIds}

                            strategy={verticalListSortingStrategy}

                          >

                            {table.getRowModel().rows.map((row) => (

                              <DraggableRow key={row.id} row={row} />

                            ))}

                          </SortableContext>

                        </TableBody>

                      </Table>

                    </DndContext>

                  </div>



                  {/* Pagination */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t px-4 py-4">

                    <div className="text-sm text-muted-foreground">

                      Showing{" "}

                      {table.getState().pagination.pageIndex *

                        table.getState().pagination.pageSize +

                        1}{" "}

                      -{" "}

                      {Math.min(

                        (table.getState().pagination.pageIndex + 1) *

                          table.getState().pagination.pageSize,

                        table.getFilteredRowModel().rows.length

                      )}{" "}

                      of {table.getFilteredRowModel().rows.length} plates

                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

                      <div className="flex items-center gap-2">

                        <Label className="text-sm whitespace-nowrap">

                          Rows per page

                        </Label>

                        <Select

                          value={`${table.getState().pagination.pageSize}`}

                          onValueChange={(v) => table.setPageSize(Number(v))}

                        >

                          <SelectTrigger size="sm" className="w-[70px] h-8">

                            <SelectValue

                              placeholder={

                                table.getState().pagination.pageSize

                              }

                            />

                          </SelectTrigger>

                          <SelectContent side="top">

                            {[5, 10, 20, 30, 40, 50].map((ps) => (

                              <SelectItem key={ps} value={`${ps}`}>

                                {ps}

                              </SelectItem>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="text-sm whitespace-nowrap">

                          Page{" "}

                          {table.getState().pagination.pageIndex + 1} of{" "}

                          {table.getPageCount()}

                        </span>

                        <div className="flex items-center gap-1">

                          <Button

                            variant="outline"

                            size="icon"

                            className="h-8 w-8"

                            onClick={() => table.setPageIndex(0)}

                            disabled={!table.getCanPreviousPage()}

                          >

                            <span className="sr-only">First page</span>

                            <IconChevronsLeft className="h-4 w-4" />

                          </Button>

                          <Button

                            variant="outline"

                            size="icon"

                            className="h-8 w-8"

                            onClick={() => table.previousPage()}

                            disabled={!table.getCanPreviousPage()}

                          >

                            <span className="sr-only">Previous page</span>

                            <IconChevronLeft className="h-4 w-4" />

                          </Button>

                          

                          {/* Page Numbers */}

                          <div className="flex items-center gap-1">

                            {getPageNumbers(table).map((pageNum, index) => (

                              <React.Fragment key={index}>

                                {pageNum === '...' ? (

                                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>

                                ) : (

                                  <Button

                                    variant={pageNum === table.getState().pagination.pageIndex + 1 ? "default" : "outline"}

                                    size="sm"

                                    className="h-8 w-8 p-0"

                                    onClick={() => table.setPageIndex(pageNum - 1)}

                                    disabled={pageNum === table.getState().pagination.pageIndex + 1}

                                  >

                                    {pageNum}

                                  </Button>

                                )}

                              </React.Fragment>

                            ))}

                          </div>

                          

                          <Button

                            variant="outline"

                            size="icon"

                            className="h-8 w-8"

                            onClick={() => table.nextPage()}

                            disabled={!table.getCanNextPage()}

                          >

                            <span className="sr-only">Next page</span>

                            <IconChevronRight className="h-4 w-4" />

                          </Button>

                          <Button

                            variant="outline"

                            size="icon"

                            className="h-8 w-8"

                            onClick={() =>

                              table.setPageIndex(table.getPageCount() - 1)

                            }

                            disabled={!table.getCanNextPage()}

                          >

                            <span className="sr-only">Last page</span>

                            <IconChevronsRight className="h-4 w-4" />

                          </Button>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>



        {/* ═══════ VIEW DRAWER (RIGHT SIDE) ═══════ */}

        <Drawer

          open={viewDrawerOpen}

          onOpenChange={setViewDrawerOpen}

          direction="right"

        >

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Plate Details</DrawerTitle>

              <DrawerDescription>

                Vehicle registration information

              </DrawerDescription>

            </DrawerHeader>

            {viewPlate && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  {/* Plate badge */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">

                      <Car className="h-6 w-6" />

                    </div>

                    <div>

                      <h3 className="text-lg font-bold font-mono">

                        {viewPlate.plateNumber}

                      </h3>

                      <Badge variant="outline" className="gap-1 mt-1">

                        {viewPlate.isValid ? (

                          <>

                            <CheckCircle2 className="size-3" /> Valid

                          </>

                        ) : (

                          <>

                            <XCircle className="size-3" /> Invalid

                          </>

                        )}

                      </Badge>

                    </div>

                  </div>



                  <div className="grid gap-4">

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        State

                      </span>

                      <span className="text-sm font-medium">

                        {viewPlate.state}

                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        District

                      </span>

                      <span className="text-sm">

                        {viewPlate.district || "—"}

                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        RTO Code

                      </span>

                      <Badge variant="secondary">{viewPlate.rtoCode}</Badge>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        RTO State

                      </span>

                      <span className="text-sm">

                        {RTO_STATE_PREFIXES[

                          viewPlate.rtoCode?.substring(0, 2)

                        ] || "—"}

                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        Vehicle Type

                      </span>

                      <span className="text-sm">

                        {VEHICLE_TYPE_LABELS[

                          viewPlate.vehicleType as VehicleType

                        ] || viewPlate.vehicleType}

                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        Owner

                      </span>

                      <span className="text-sm">

                        {viewPlate.ownerName || "—"}

                      </span>

                    </div>

                    {viewPlate.registrationDate && (

                      <div className="flex justify-between border-b pb-2">

                        <span className="text-sm text-muted-foreground">

                          Registration Date

                        </span>

                        <span className="text-sm">

                          {new Date(

                            viewPlate.registrationDate

                          ).toLocaleDateString("en-US", {

                            month: "long",

                            day: "numeric",

                            year: "numeric",

                          })}

                        </span>

                      </div>

                    )}

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">

                        Created

                      </span>

                      <span className="text-sm">

                        {new Date(viewPlate.createdAt).toLocaleDateString(

                          "en-US",

                          {

                            month: "long",

                            day: "numeric",

                            year: "numeric",

                          }

                        )}

                      </span>

                    </div>

                  </div>

                </div>

              </div>

            )}

            <DrawerFooter className="border-t px-6 py-4">

              <DrawerClose asChild>

                <Button variant="outline" className="w-full">

                  Close

                </Button>

              </DrawerClose>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* ═══════ VALIDATE DIALOG ═══════ */}

        <AlertDialog

          open={validateDialogOpen}

          onOpenChange={setValidateDialogOpen}

        >

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Validate Plate Number</AlertDialogTitle>

              <AlertDialogDescription>

                Enter a plate number to check if it&apos;s valid.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <div className="space-y-4 py-2">

              <Input

                placeholder="e.g., MH02AB1234"

                value={validateInput}

                onChange={(e) =>

                  setValidateInput(e.target.value.toUpperCase())

                }

                className="font-mono"

              />

              {validationResult && (

                <div className="rounded-lg border p-4 space-y-2">

                  <div className="flex justify-between">

                    <span className="text-sm text-muted-foreground">

                      Plate

                    </span>

                    <span className="text-sm font-mono font-medium">

                      {validationResult.plateNumber}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-sm text-muted-foreground">

                      Format

                    </span>

                    <Badge variant="outline" className="gap-1">

                      {validationResult.isValidFormat ? (

                        <>

                          <CheckCircle2 className="size-3" /> Valid

                        </>

                      ) : (

                        <>

                          <XCircle className="size-3" /> Invalid

                        </>

                      )}

                    </Badge>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-sm text-muted-foreground">

                      RTO Code

                    </span>

                    <span className="text-sm">

                      {validationResult.rtoCode || "—"}

                    </span>

                  </div>

                  {validationResult.state && (

                    <div className="flex justify-between">

                      <span className="text-sm text-muted-foreground">

                        State

                      </span>

                      <span className="text-sm">

                        {validationResult.state}

                      </span>

                    </div>

                  )}

                </div>

              )}

            </div>

            <AlertDialogFooter>

              <AlertDialogCancel>Close</AlertDialogCancel>

              <AlertDialogAction

                onClick={(e) => {

                  e.preventDefault();

                  handleValidate();

                }}

                disabled={validating}

              >

                {validating ? "Validating..." : "Validate"}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



      </SidebarInset>

    </SidebarProvider>

  );

}

