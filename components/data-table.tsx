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
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUpload,
  IconSettings,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
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
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Copy, Pencil, Star, Trash2, Calendar, Tag } from "lucide-react";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners, isDragging } = useSortable({
    id,
  });

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

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800";
    case "low":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
};

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "header",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent font-semibold"
        >
          Header
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original.header}</span>
      );
    },
    enableHiding: false,
    size: 300,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-44">
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:text-blue-400 dark:border-blue-800 px-3 py-1 text-xs font-medium rounded-full shadow-sm"
        >
          <Tag className="w-3 h-3 mr-1 inline-block" />
          {row.original.type}
        </Badge>
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority || "Medium";
      return (
        <Badge
          variant="outline"
          className={`${getPriorityColor(priority)} px-3 py-1 text-xs font-medium rounded-full`}
        >
          {priority}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isDone = status === "Done";
      const isInProgress = status === "In Progress";

      return (
        <Badge
          variant="outline"
          className={`
            flex items-center gap-1.5 px-3 py-1 text-xs font-medium w-fit rounded-full shadow-sm
            ${
              isDone
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 dark:from-green-950/30 dark:to-emerald-950/30 dark:text-green-400 dark:border-green-800"
                : isInProgress
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200 dark:from-yellow-950/30 dark:to-amber-950/30 dark:text-yellow-400 dark:border-yellow-800"
                  : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400 dark:border-gray-700"
            }
          `}
        >
          {isDone ? (
            <IconCircleCheckFilled className="size-3.5 fill-green-500 dark:fill-green-400" />
          ) : isInProgress ? (
            <IconLoader className="size-3.5 animate-spin text-yellow-500 dark:text-yellow-400" />
          ) : (
            <IconX className="size-3.5 text-gray-400 dark:text-gray-600" />
          )}
          {status}
        </Badge>
      );
    },
    size: 120,
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right font-semibold">Target</div>,
    cell: ({ row }) => (
      <div className="relative group">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const value = formData.get("target");
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Updating target for ${row.original.header}...`,
              success: `Target updated to ${value}`,
              error: "Failed to update target",
            });
          }}
        >
          <Label htmlFor={`target-${row.original.id}`} className="sr-only">
            Target
          </Label>
          <Input
            name="target"
            className="h-8 w-20 text-right bg-transparent border-transparent hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md group-hover:border-primary/30"
            defaultValue={row.original.target}
            id={`target-${row.original.id}`}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            suppressHydrationWarning
          />
        </form>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right font-semibold">Limit</div>,
    cell: ({ row }) => (
      <div className="relative group">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const value = formData.get("limit");
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Updating limit for ${row.original.header}...`,
              success: `Limit updated to ${value}`,
              error: "Failed to update limit",
            });
          }}
        >
          <Label htmlFor={`limit-${row.original.id}`} className="sr-only">
            Limit
          </Label>
          <Input
            name="limit"
            className="h-8 w-20 text-right bg-transparent border-transparent hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md group-hover:border-primary/30"
            defaultValue={row.original.limit}
            id={`limit-${row.original.id}`}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            suppressHydrationWarning
          />
        </form>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "reviewer",
    header: () => <div className="font-semibold">Reviewer</div>,
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";

      if (isAssigned) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Avatar className="size-6 border-2 border-primary/20">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      {row.original.reviewer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{row.original.reviewer}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assigned reviewer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <>
          <Label htmlFor={`reviewer-${row.original.id}`} className="sr-only">
            Reviewer
          </Label>
          <Select>
            <SelectTrigger
              className="w-40 h-8 text-sm border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-200"
              size="sm"
              id={`reviewer-${row.original.id}`}
              suppressHydrationWarning
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[200px]">
              <SelectItem value="Eddie Lake" className="cursor-pointer hover:bg-primary/5">
                <div className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-xs">EL</AvatarFallback>
                  </Avatar>
                  <span>Eddie Lake</span>
                </div>
              </SelectItem>
              <SelectItem value="Jamik Tashpulatov" className="cursor-pointer hover:bg-primary/5">
                <div className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-xs">JT</AvatarFallback>
                  </Avatar>
                  <span>Jamik Tashpulatov</span>
                </div>
              </SelectItem>
              <SelectItem value="Emily Whalen" className="cursor-pointer hover:bg-primary/5">
                <div className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-xs">EW</AvatarFallback>
                  </Avatar>
                  <span>Emily Whalen</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
    size: 180,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      if (!dueDate) return <span className="text-muted-foreground text-sm">—</span>;
      
      const isOverdue = new Date(dueDate) < new Date();
      return (
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className={`text-sm ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : ""}`}>
            {dueDate}
            {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
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
            className="data-[state=open]:bg-primary/10 text-muted-foreground hover:text-foreground flex size-8 transition-all duration-200 hover:scale-110"
            size="icon"
            suppressHydrationWarning
          >
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions for {row.original.header}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Copy className="h-4 w-4" />
              <span>Make a copy</span>
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Star className="h-4 w-4" />
              <span>Favorite</span>
              <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the section
                  "{row.original.header}" and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    toast.success(`${row.original.header} deleted successfully`);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    size: 50,
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
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
        hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 dark:hover:from-muted/20 dark:hover:to-muted/10
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

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const sortableId = React.useId();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {}),
  );

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
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
    getRowId: (row) => row.id.toString(),
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
      toast.success("Rows reordered successfully", {
        icon: <IconCheck className="h-4 w-4" />,
      });
    }
  }

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Data refreshed successfully");
    }, 1500);
  };

  // Don't render until after hydration to prevent mismatch
  if (!mounted) {
    return null;
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <TooltipProvider>
      <div className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6 py-2 border-b">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"
                suppressHydrationWarning
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-muted hover:bg-muted/50"
                  suppressHydrationWarning
                >
                  <IconFilter className="size-3.5" />
                  <span className="hidden lg:inline">Filter</span>
                  {columnFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {columnFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Type
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Reviewer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-muted hover:bg-muted/50"
                  suppressHydrationWarning
                >
                  <IconLayoutColumns className="size-3.5" />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === "drag" ? "Drag Handle" : column.id.replace(/([A-Z])/g, ' $1').trim()}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              size="sm"
              className="h-9 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
              suppressHydrationWarning
            >
              <IconPlus className="size-3.5" />
              <span className="hidden lg:inline">Add Section</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <IconDownload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <IconUpload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <IconSettings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Table settings</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          {selectedCount > 0 && (
            <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {selectedCount} selected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {totalCount} rows selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => table.toggleAllPageRowsSelected(false)}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border bg-card shadow-lg transition-all duration-200 hover:shadow-xl mt-5">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{ width: header.getSize() }}
                            className="h-11 font-semibold text-foreground/80"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <IconAlertCircle className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-muted-foreground">No results found.</p>
                          <Button variant="link" className="text-primary">
                            Clear filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {selectedCount} of {totalCount} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label
                  htmlFor="rows-per-page"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-20 h-8 border-muted"
                    id="rows-per-page"
                    suppressHydrationWarning
                  >
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  suppressHydrationWarning
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  suppressHydrationWarning
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  suppressHydrationWarning
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  suppressHydrationWarning
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}