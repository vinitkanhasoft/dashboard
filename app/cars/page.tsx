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
  IconPlus,
  IconSearch,
  IconDownload,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconEye,
  IconEdit,
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
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pencil, Trash2, Calendar, Eye,
  Car as CarIcon, Fuel, Gauge,
  Star, MapPin, Shield, ListChecks, DollarSign, User, Cog,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCars,
  fetchCarById,
  updateCar,
  deleteCar,
  bulkDeleteCars,
  searchCars,
  searchCarsByStatus,
  type Car,
} from "@/lib/redux/carSlice";
import { CarStatus } from "@/lib/enums/CarEnums";
import { cn } from "@/lib/utils";
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
function DraggableRow({ row }: { row: Row<Car> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0 transition-all duration-300 group",
        "data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[dragging=true]:shadow-xl data-[dragging=true]:scale-[1.02] data-[dragging=true]:bg-white dark:data-[dragging=true]:bg-gray-900",
        "data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10",
        "hover:bg-linear-to-r hover:from-muted/50 hover:to-muted/30 dark:hover:from-muted/20 dark:hover:to-muted/10",
        row.index % 2 === 0 ? "bg-white dark:bg-gray-900/50" : "bg-gray-50/30 dark:bg-gray-800/30"
      )}
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

// ─── Stats Cards ──────────────────────────────────────────
function CarCards() {
  const { counts } = useAppSelector((s) => s.car);

  return (
    <div className={cn('grid', 'gap-4', 'sm:grid-cols-2', 'lg:grid-cols-4')}>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Total Cars</CardTitle>
          <CarIcon className={cn('h-4', 'w-4', 'text-muted-foreground')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{counts?.total || 0}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>All listed cars</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Available</CardTitle>
          <Eye className={cn('h-4', 'w-4', 'text-muted-foreground')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{counts?.available || 0}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>Ready for sale</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Sold</CardTitle>
          <Star className={cn('h-4', 'w-4', 'text-muted-foreground')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{counts?.sold || 0}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>Sold cars</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Reserved</CardTitle>
          <Calendar className={cn('h-4', 'w-4', 'text-muted-foreground')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{counts?.reserved || 0}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>Reserved cars</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Format price to INR ────────────────────────────────
function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Status badge color ──────────────────────────────────
function getStatusBadge(status: string) {
  switch (status) {
    case CarStatus.AVAILABLE:
      return <Badge className={cn('bg-green-100', 'text-green-700', 'border-green-200', 'dark:bg-green-950/30', 'dark:text-green-400')}>Available</Badge>;
    case CarStatus.SOLD:
      return <Badge className={cn('bg-red-100', 'text-red-700', 'border-red-200', 'dark:bg-red-950/30', 'dark:text-red-400')}>Sold</Badge>;
    case CarStatus.RESERVED:
      return <Badge className={cn('bg-yellow-100', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-950/30', 'dark:text-yellow-400')}>Reserved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Helper Functions ──────────────────────────────────────
function getPageNumbers(table: any, apiPagination: any) {
  const currentPage = apiPagination?.currentPage || 1;
  const totalPages = apiPagination?.totalPages || 1;
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
export default function CarsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const carState = useAppSelector((s) => s.car);
  const { cars, loading, error, pagination: apiPagination, counts } = carState;
  const hasFetched = React.useRef(false);

  // Table state
  const [data, setData] = React.useState<Car[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [carToDelete, setCarToDelete] = React.useState<Car | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  // View drawer state
  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);
  const [viewCar, setViewCar] = React.useState<Car | null>(null);
  const [viewLoading, setViewLoading] = React.useState(false);

  // Status tabs state
  const [activeStatusTab, setActiveStatusTab] = React.useState<string>('all');

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {})
  );

  // Search handler - calls the appropriate API based on active tab
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleSearch = React.useCallback((q: string) => {
    setGlobalFilter(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (q.trim()) {
        // Use general search for text queries
        dispatch(searchCars({
          q,
          page: 1,
          limit: pagination.pageSize,
          sortBy: "relevance",
          sortOrder: "desc",
        }));
        // Switch to "all" tab when searching
        setActiveStatusTab('all');
      } else {
        // Use status-specific API when no search query
        if (activeStatusTab === 'all') {
          // If we're on "all" tab, the useEffect will handle showing existing data
          // No need to manually set data here
        } else {
          // If we're on a status tab, refresh that status
          dispatch(searchCarsByStatus({
            status: activeStatusTab,
            page: 1,
            limit: pagination.pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          }));
        }
      }
    }, 400);
  }, [dispatch, pagination.pageIndex, pagination.pageSize, activeStatusTab, cars]);

  // Handle status tab change
  const handleStatusTabChange = React.useCallback((status: string) => {
    setActiveStatusTab(status);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page
    
    // Only call status API if not "all" and we have counts data
    if (status !== 'all' && counts) {
      dispatch(searchCarsByStatus({
        status,
        page: 1,
        limit: pagination.pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      }));
    }
    // For "all" tab, the useEffect will handle showing all cars
  }, [dispatch, pagination.pageSize, counts]);

  // Handle pagination changes
  React.useEffect(() => {
    if (!globalFilter && hasFetched.current) {
      if (activeStatusTab === 'all') {
        dispatch(fetchCars({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sortBy: "createdAt",
          sortOrder: "desc",
        }));
      } else {
        dispatch(searchCarsByStatus({
          status: activeStatusTab,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sortBy: "createdAt",
          sortOrder: "desc",
        }));
      }
    }
  }, [pagination.pageIndex, pagination.pageSize, dispatch, globalFilter, activeStatusTab]);

  // Initial data fetch and refetch on page focus/visibility
  React.useEffect(() => {
    // Always fetch data when component mounts
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchCars({
        page: 1,
        limit: pagination.pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      }));
    }

    // Handle visibility change for navigation back scenarios
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !hasFetched.current) {
        hasFetched.current = true;
        dispatch(fetchCars({
          page: 1,
          limit: pagination.pageSize,
          sortBy: "createdAt",
          sortOrder: "desc",
        }));
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, pagination.pageSize]);

  // Handle tab changes after initial data is loaded and sync data with table
  React.useEffect(() => {
    if (hasFetched.current) {
      if (activeStatusTab === 'all') {
        // Show all cars data
        setData(cars.filter((c) => c && c._id));
      } else {
        // Filter cars by status
        setData(cars.filter((c) => c && c._id && c.status === activeStatusTab));
      }
    }
  }, [activeStatusTab, cars, counts]);

  // Additional effect to ensure data sync when cars array changes
  React.useEffect(() => {
    if (mounted && cars && cars.length > 0) {
      if (activeStatusTab === 'all') {
        setData(cars.filter((c) => c && c._id));
      } else {
        setData(cars.filter((c) => c && c._id && c.status === activeStatusTab));
      }
    }
  }, [cars, mounted, activeStatusTab]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.filter(Boolean).map(({ _id }) => _id) || [],
    [data]
  );

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenView = React.useCallback(async (car: Car) => {
    setViewCar(car);
    setViewDrawerOpen(true);
    setViewLoading(true);
    const result = await dispatch(fetchCarById(car._id));
    if (fetchCarById.fulfilled.match(result)) {
      setViewCar(result.payload);
    }
    setViewLoading(false);
  }, [dispatch]);

  const handleDeleteCar = (car: Car) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  // ─── Columns ───────────────────────────────────────────
  const columns = React.useMemo<ColumnDef<Car>[]>(
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
          <div className={cn('flex', 'items-center', 'justify-center')}>
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className={cn('border-2', 'data-[state=checked]:bg-primary', 'data-[state=checked]:border-primary', 'transition-colors')}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'justify-center')}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className={cn('border-2', 'data-[state=checked]:bg-primary', 'data-[state=checked]:border-primary', 'transition-colors')}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "primaryImage",
        header: "Image",
        cell: ({ row }) => (
          <div className={cn('relative', 'h-12', 'w-20', 'overflow-hidden', 'rounded-md', 'border', 'group', 'cursor-pointer')}>
            {row.original.primaryImage?.url ? (
              <Image
                src={row.original.primaryImage.url}
                alt={row.original.title}
                fill
                className={cn('object-cover', 'transition-transform', 'duration-300', 'group-hover:scale-110')}
                sizes="80px"
              />
            ) : (
              <div className={cn('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'bg-muted')}>
                <CarIcon className={cn('h-5', 'w-5', 'text-muted-foreground')} />
              </div>
            )}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={cn('hover:bg-transparent', 'font-semibold')}
          >
            Title
            <IconChevronDown className={cn('ml-2', 'h-4', 'w-4')} />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            className={cn('text-foreground', 'hover:text-primary', 'w-fit', 'px-0', 'text-left', 'font-medium')}
            onClick={() => handleOpenView(row.original)}
          >
            <div className={cn('flex', 'items-center', 'gap-2')}>
              <CarIcon className={cn('size-4', 'text-primary/70')} />
              {row.original.title}
            </div>
          </Button>
        ),
        enableHiding: false,
        size: 250,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium">
            {row.original.brand}
          </Badge>
        ),
        size: 120,
      },
      {
        accessorKey: "salePrice",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={cn('hover:bg-transparent', 'font-semibold')}
          >
            Price
            <IconChevronDown className={cn('ml-2', 'h-4', 'w-4')} />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={cn('flex', 'flex-col')}>
            <span className={cn('font-semibold', 'text-sm')}>{formatPrice(row.original.salePrice)}</span>
            {row.original.regularPrice > row.original.salePrice && (
              <span className={cn('text-xs', 'text-muted-foreground', 'line-through')}>
                {formatPrice(row.original.regularPrice)}
              </span>
            )}
          </div>
        ),
        size: 140,
      },
      {
        accessorKey: "year",
        header: "Year",
        cell: ({ row }) => <span className={cn('text-sm', 'font-medium')}>{row.original.year}</span>,
        size: 80,
      },
      {
        accessorKey: "km",
        header: "KM",
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'gap-1.5')}>
            <Gauge className={cn('h-3.5', 'w-3.5', 'text-muted-foreground')} />
            <span className="text-sm">{row.original.km.toLocaleString()} km</span>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "fuelType",
        header: "Fuel",
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'gap-1.5')}>
            <Fuel className={cn('h-3.5', 'w-3.5', 'text-muted-foreground')} />
            <span className={cn('text-sm', 'capitalize')}>{row.original.fuelType}</span>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const [isEditing, setIsEditing] = React.useState(false);
          const [currentStatus, setCurrentStatus] = React.useState(row.original.status);
          const [updating, setUpdating] = React.useState(false);

          const handleStatusChange = async (newStatus: string) => {
            setUpdating(true);
            const formData = new FormData();
            formData.append("status", newStatus);
            
            const result = await dispatch(updateCar({ id: row.original._id, formData }));
            
            if (updateCar.fulfilled.match(result)) {
              setCurrentStatus(newStatus);
              setIsEditing(false);
              toast.success(`Car status updated to ${newStatus}`);
              
              // Refetch data to ensure consistency
              if (globalFilter) {
                // If there's an active search, refresh search results
                dispatch(searchCars({
                  q: globalFilter,
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "relevance",
                  sortOrder: "desc",
                }));
              } else if (activeStatusTab === 'all') {
                // Refresh all cars
                dispatch(fetchCars({
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }));
              } else {
                // Refresh status-specific cars
                dispatch(searchCarsByStatus({
                  status: activeStatusTab,
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }));
              }
            } else {
              toast.error(result.payload ?? "Failed to update status");
            }
            setUpdating(false);
          };

          if (isEditing) {
            return (
              <Select value={currentStatus} onValueChange={handleStatusChange} disabled={updating}>
                <SelectTrigger size="sm" className={cn('h-8', 'w-28')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CarStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={CarStatus.SOLD}>Sold</SelectItem>
                  <SelectItem value={CarStatus.RESERVED}>Reserved</SelectItem>
                </SelectContent>
              </Select>
            );
          }

          return (
            <div 
              className="cursor-pointer" 
              onClick={() => setIsEditing(true)}
            >
              {getStatusBadge(currentStatus)}
            </div>
          );
        },
        size: 110,
      },
      {
        accessorKey: "isFeatured",
        header: () => <div className={cn('w-full', 'text-center', 'font-semibold')}>Featured</div>,
        cell: ({ row }) => {
          const featured = !!row.original.isFeatured;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [toggling, setToggling] = React.useState(false);
          const handleToggle = async () => {
            setToggling(true);
            const newVal = !featured;
            setData((prev) =>
              prev.map((c) => (c._id === row.original._id ? { ...c, isFeatured: newVal } : c))
            );
            const formData = new FormData();
            formData.append("title", row.original.title);
            formData.append("isFeatured", String(newVal));
            const result = await dispatch(
              updateCar({ id: row.original._id, formData })
            );
            setToggling(false);
            if (updateCar.fulfilled.match(result)) {
              toast.success(`Car ${newVal ? "featured" : "unfeatured"}`);
              
              // Refetch data to ensure consistency
              if (globalFilter) {
                // If there's an active search, refresh search results
                dispatch(searchCars({
                  q: globalFilter,
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "relevance",
                  sortOrder: "desc",
                }));
              } else if (activeStatusTab === 'all') {
                // Refresh all cars
                dispatch(fetchCars({
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }));
              } else {
                // Refresh status-specific cars
                dispatch(searchCarsByStatus({
                  status: activeStatusTab,
                  page: pagination.pageIndex + 1,
                  limit: pagination.pageSize,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }));
              }
            } else {
              setData((prev) =>
                prev.map((c) =>
                  c._id === row.original._id ? { ...c, isFeatured: featured } : c
                )
              );
              toast.error(result.payload ?? "Failed to update");
            }
          };
          return (
            <div className={cn('flex', 'justify-center')}>
              <Switch
                checked={featured}
                onCheckedChange={handleToggle}
                disabled={toggling}
                aria-label={featured ? "Unfeature" : "Feature"}
              />
            </div>
          );
        },
        size: 90,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'gap-2')}>
            <Calendar className={cn('size-3.5', 'text-muted-foreground')} />
            <span className="text-sm">
              {new Date(row.original.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn('data-[state=open]:bg-primary/10', 'text-muted-foreground', 'hover:text-foreground', 'flex', 'size-8', 'transition-all', 'duration-200', 'hover:scale-110')}
                size="icon"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions for {row.original.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className={cn('cursor-pointer', 'gap-2')} onClick={() => handleOpenView(row.original)}>
                  <Eye className={cn('h-4', 'w-4')} />
                  <span>View</span>
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className={cn('cursor-pointer', 'gap-2')} onClick={() => handleOpenEdit(row.original)}>
                  <Pencil className={cn('h-4', 'w-4')} />
                  <span>Edit</span>
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className={cn('cursor-pointer', 'gap-2', 'text-red-600', 'focus:text-red-600')}
                onClick={() => handleDeleteCar(row.original)}
              >
                <Trash2 className={cn('h-4', 'w-4')} />
                <span>Delete</span>
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [dispatch, handleOpenView]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
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
    manualPagination: true,
    pageCount: apiPagination?.totalPages || 0,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = apiPagination?.totalCars || 0;

  // ─── Handlers ──────────────────────────────────────────

  const confirmDelete = async () => {
    if (!carToDelete) return;
    setDeleting(true);
    const result = await dispatch(deleteCar(carToDelete._id));
    if (deleteCar.fulfilled.match(result)) {
      toast.success("Car deleted successfully");
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    } else {
      toast.error(result.payload ?? "Failed to delete car");
    }
    setDeleting(false);
  };

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const carIds = selectedRows.map((row) => row.original._id);
    if (carIds.length === 0) return;
    setBulkDeleting(true);
    const result = await dispatch(bulkDeleteCars(carIds));
    if (bulkDeleteCars.fulfilled.match(result)) {
      toast.success(`${carIds.length} car(s) deleted successfully`);
      setBulkDeleteDialogOpen(false);
      table.toggleAllRowsSelected(false);
    } else {
      toast.error(result.payload ?? "Failed to bulk delete cars");
    }
    setBulkDeleting(false);
  };

  const handleOpenAdd = () => {
    router.push("/cars/add");
  };

  const handleOpenEdit = React.useCallback((car: Car) => {
    router.push(`/cars/add?id=${car._id}`);
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchCars({
      page: 1,
      limit: pagination.pageSize,
      sortBy: "createdAt",
      sortOrder: "desc",
    }));
    setIsRefreshing(false);
    toast.success("Cars refreshed successfully");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Cars Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    const rows = table.getFilteredRowModel().rows;
    const tableData = rows.map((row) => {
      const car = row.original;
      return [
        car.brand || "",
        car.carModel || "",
        car.variant || "",
        car.year?.toString() || "",
        car.fuelType || "",
        car.transmission || "",
        car.status || "",
        car.salePrice ? `Rs. ${car.salePrice.toLocaleString()}` : "",
        car.km ? `${car.km.toLocaleString()} km` : "",
        car.isFeatured ? "Yes" : "No",
      ];
    });

    autoTable(doc, {
      head: [["Brand", "Model", "Variant", "Year", "Fuel", "Transmission", "Status", "Price", "KMs Driven", "Featured"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("cars-report.pdf");
    toast.success("PDF downloaded successfully");
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
      toast.success("Cars reordered successfully", {
        icon: <IconCheck className={cn('h-4', 'w-4')} />,
      });
    }
  }

  return (
    <>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className={cn('flex', 'flex-1', 'flex-col', 'overflow-hidden', 'my-5')}>
            <div className={cn('@container/main', 'flex', 'flex-1', 'flex-col', 'gap-2', 'overflow-y-auto')}>
              {/* Stats Cards */}
              <div className={cn('px-4', 'lg:px-6')}>
                <CarCards />
              </div>

              {/* Status Tabs */}
              <div className={cn('px-4', 'lg:px-6', 'mb-4', 'mt-5')}>
                <div className={cn('flex', 'gap-1', 'bg-gray-100', 'p-1', 'rounded-lg')}>
                  <button
                    className={cn(
                      'flex-1', 'px-4', 'py-2', 'text-sm', 'font-medium', 'rounded-md',
                      'transition-all', 'duration-200', 'ease-in-out',
                      activeStatusTab === 'all' 
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    )}
                    onClick={() => handleStatusTabChange('all')}
                  >
                    <div className={cn('flex', 'items-center', 'justify-center', 'gap-2')}>
                      <span className={cn(
                        'text-xs', 'font-semibold',
                        activeStatusTab === 'all' ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        ALL
                      </span>
                      <span className={cn(
                        'px-2', 'py-0.5', 'text-xs', 'rounded-full',
                        activeStatusTab === 'all' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-300 text-gray-700'
                      )}>
                        {counts?.total || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      'flex-1', 'px-4', 'py-2', 'text-sm', 'font-medium', 'rounded-md',
                      'transition-all', 'duration-200', 'ease-in-out',
                      activeStatusTab === CarStatus.AVAILABLE 
                        ? 'bg-white text-green-700 shadow-sm border border-green-200' 
                        : 'text-gray-600 hover:text-green-700 hover:bg-white/50'
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.AVAILABLE)}
                  >
                    <div className={cn('flex', 'items-center', 'justify-center', 'gap-2')}>
                      <span className={cn(
                        'text-xs', 'font-semibold',
                        activeStatusTab === CarStatus.AVAILABLE ? 'text-green-700' : 'text-gray-500'
                      )}>
                        AVAILABLE
                      </span>
                      <span className={cn(
                        'px-2', 'py-0.5', 'text-xs', 'rounded-full',
                        activeStatusTab === CarStatus.AVAILABLE 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-300 text-gray-700'
                      )}>
                        {counts?.available || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      'flex-1', 'px-4', 'py-2', 'text-sm', 'font-medium', 'rounded-md',
                      'transition-all', 'duration-200', 'ease-in-out',
                      activeStatusTab === CarStatus.SOLD 
                        ? 'bg-white text-red-700 shadow-sm border border-red-200' 
                        : 'text-gray-600 hover:text-red-700 hover:bg-white/50'
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.SOLD)}
                  >
                    <div className={cn('flex', 'items-center', 'justify-center', 'gap-2')}>
                      <span className={cn(
                        'text-xs', 'font-semibold',
                        activeStatusTab === CarStatus.SOLD ? 'text-red-700' : 'text-gray-500'
                      )}>
                        SOLD
                      </span>
                      <span className={cn(
                        'px-2', 'py-0.5', 'text-xs', 'rounded-full',
                        activeStatusTab === CarStatus.SOLD 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-gray-300 text-gray-700'
                      )}>
                        {counts?.sold || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      'flex-1', 'px-4', 'py-2', 'text-sm', 'font-medium', 'rounded-md',
                      'transition-all', 'duration-200', 'ease-in-out',
                      activeStatusTab === CarStatus.RESERVED 
                        ? 'bg-white text-yellow-700 shadow-sm border border-yellow-200' 
                        : 'text-gray-600 hover:text-yellow-700 hover:bg-white/50'
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.RESERVED)}
                  >
                    <div className={cn('flex', 'items-center', 'justify-center', 'gap-2')}>
                      <span className={cn(
                        'text-xs', 'font-semibold',
                        activeStatusTab === CarStatus.RESERVED ? 'text-yellow-700' : 'text-gray-500'
                      )}>
                        RESERVED
                      </span>
                      <span className={cn(
                        'px-2', 'py-0.5', 'text-xs', 'rounded-full',
                        activeStatusTab === CarStatus.RESERVED 
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                          : 'bg-gray-300 text-gray-700'
                      )}>
                        {counts?.reserved || 0}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && !loading && data.length === 0 && (
                <div className={cn('px-4', 'lg:px-6')}>
                  <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'py-16', 'text-center', 'border', 'rounded-xl', 'bg-red-50/50', 'dark:bg-red-950/10', 'border-red-200', 'dark:border-red-900/30')}>
                    <div className={cn('rounded-full', 'bg-red-100', 'dark:bg-red-900/30', 'p-4', 'mb-4')}>
                      <IconAlertCircle className={cn('h-8', 'w-8', 'text-red-500')} />
                    </div>
                    <h3 className={cn('text-lg', 'font-semibold', 'text-red-700', 'dark:text-red-400', 'mb-1')}>Failed to load cars</h3>
                    <p className={cn('text-sm', 'text-red-600/80', 'dark:text-red-400/70', 'mb-4', 'max-w-md')}>{error}</p>
                    <Button onClick={handleRefresh} variant="outline" className={cn('gap-2', 'border-red-200', 'text-red-700', 'hover:bg-red-100', 'dark:border-red-800', 'dark:text-red-400', 'dark:hover:bg-red-950/30')}>
                      <IconRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Table Section */}
              <div className={cn('px-4', 'lg:px-6', 'mt-5')}>
                <TooltipProvider>
                  <div className={cn('w-full', 'flex', 'flex-col', 'gap-4')}>
                    {/* Table Toolbar */}
                    <div className={cn('flex', 'items-center', 'justify-between')}>
                      <div className={cn('flex', 'items-center', 'gap-2', 'flex-1')}>
                        <div className={cn('relative', 'flex-1', 'max-w-md')}>
                          <IconSearch className={cn('absolute', 'left-3', 'top-1/2', 'transform', '-translate-y-1/2', 'h-4', 'w-4', 'text-muted-foreground')} />
                          <Input
                            placeholder="Search cars..."
                            value={globalFilter ?? ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={cn('h-9', 'pl-9', 'pr-4', 'w-full', 'bg-muted/50', 'border-muted', 'focus:bg-background', 'transition-all', 'duration-200')}
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={cn('h-9', 'gap-2', 'border-muted', 'hover:bg-muted/50')}>
                              <IconLayoutColumns className="size-3.5" />
                              <span className={cn('hidden', 'lg:inline')}>Columns</span>
                              <IconChevronDown className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                              .getAllColumns()
                              .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                              .map((column) => (
                                <DropdownMenuCheckboxItem
                                  key={column.id}
                                  className={cn('capitalize', 'cursor-pointer')}
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                  {column.id === "primaryImage" ? "Image" :
                                   column.id === "salePrice" ? "Price" :
                                   column.id === "isFeatured" ? "Featured" :
                                   column.id === "createdAt" ? "Created" :
                                   column.id.replace(/([A-Z])/g, " $1").trim()}
                                </DropdownMenuCheckboxItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="default"
                          size="sm"
                          className={cn('h-9', 'gap-2', 'bg-linear-to-r', 'from-primary', 'to-primary/90', 'hover:from-primary/90', 'hover:to-primary', 'shadow-sm')}
                          onClick={handleOpenAdd}
                        >
                          <IconPlus className="size-3.5" />
                          <span className={cn('hidden', 'lg:inline')}>Add Car</span>
                        </Button>
                      </div>

                      <div className={cn('flex', 'items-center', 'gap-2')}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn('h-9', 'w-9')} onClick={handleRefresh} disabled={isRefreshing || loading}>
                              <IconRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Refresh data</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn('h-9', 'w-9')} onClick={handleDownloadPDF}><IconDownload className={cn('h-4', 'w-4')} /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Download PDF</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Table Content */}
                    {loading ? (
                      <div className={cn('rounded-xl', 'border', 'bg-card', 'shadow-lg')}>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className={cn('bg-linear-to-r', 'from-muted/80', 'to-muted/40')}>
                              <TableRow className="hover:bg-transparent">
                                {[40, 40, 100, 250, 120, 140, 80, 120, 100, 110, 90, 120, 50].map((w, i) => (
                                  <TableHead key={i} style={{ width: w }} className="h-11">
                                    <Skeleton className={cn('h-4', 'w-12', 'rounded')} />
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[...Array(apiPagination?.limit || 10)].map((_, i) => (
                                <TableRow key={i} className={i % 2 === 0 ? "bg-white dark:bg-gray-900/50" : "bg-gray-50/30 dark:bg-gray-800/30"}>
                                  {[40, 40, 100, 250, 120, 140, 80, 120, 100, 110, 90, 120, 50].map((w, j) => (
                                    <TableCell key={j} className="py-3" style={{ width: w }}>
                                      <Skeleton className={cn('h-5', 'w-full', 'rounded')} />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : data.length === 0 ? (
                      <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'py-12', 'text-center', 'border', 'rounded-lg')}>
                        <CarIcon className={cn('mb-3', 'h-10', 'w-10', 'text-muted-foreground/50')} />
                        <p className={cn('text-sm', 'text-muted-foreground')}>No cars found. Add your first car.</p>
                        <Button onClick={handleOpenAdd} className="mt-4">
                          <IconPlus className={cn('mr-2', 'h-4', 'w-4')} />Add Car
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedCount > 0 && (
                          <div className={cn('flex', 'items-center', 'justify-between', 'bg-primary/5', 'rounded-lg', 'p-3', 'border', 'border-primary/20')}>
                            <div className={cn('flex', 'items-center', 'gap-2')}>
                              <Badge variant="default" className={cn('bg-primary', 'text-primary-foreground')}>{selectedCount} selected</Badge>
                              <span className={cn('text-sm', 'text-muted-foreground')}>{selectedCount} of {totalCount} rows selected</span>
                            </div>
                            <div className={cn('flex', 'items-center', 'gap-2')}>
                              <Button
                                variant="destructive"
                                size="sm"
                                className={cn('h-8', 'gap-1.5')}
                                onClick={handleBulkDelete}
                              >
                                <Trash2 className={cn('h-3.5', 'w-3.5')} />
                                Delete ({selectedCount})
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8" onClick={() => table.toggleAllPageRowsSelected(false)}>Clear</Button>
                            </div>
                          </div>
                        )}

                        <div className={cn('rounded-xl', 'border', 'bg-card', 'shadow-lg')}>
                          <div className="overflow-x-auto">
                            <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd} sensors={sensors} id={sortableId}>
                              <Table>
                                <TableHeader className={cn('bg-linear-to-r', 'from-muted/80', 'to-muted/40')}>
                                  {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                      {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }} className={cn('h-11', 'font-semibold', 'text-foreground/80')}>
                                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableHeader>
                                <TableBody>
                                  {table.getRowModel().rows?.length ? (
                                    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                      {table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} />
                                      ))}
                                    </SortableContext>
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={columns.length} className={cn('h-32', 'text-center')}>
                                        <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'gap-2')}>
                                          <IconAlertCircle className={cn('h-8', 'w-8', 'text-muted-foreground/50')} />
                                          <p className="text-muted-foreground">No results found.</p>
                                          <Button variant="link" className="text-primary" onClick={() => handleSearch("")}>Clear filters</Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </DndContext>
                          </div>
                        </div>

                        {/* Pagination */}
                        <div className={cn('flex', 'flex-col', 'gap-4', 'sm:flex-row', 'sm:items-center', 'sm:justify-between', 'mt-4')}>
                          <div className={cn('flex', 'items-center', 'gap-4', 'text-sm', 'text-muted-foreground')}>
                            <span>
                              Showing{" "}
                              <span className={cn('font-medium', 'text-foreground')}>
                                {apiPagination ? (apiPagination.currentPage - 1) * apiPagination.limit + 1 : 0}
                              </span>
                              {" "}-
                              <span className={cn('font-medium', 'text-foreground')}>
                                {apiPagination ? Math.min(apiPagination.currentPage * apiPagination.limit, apiPagination.totalCars) : 0}
                              </span>
                              {" "}of{" "}
                              <span className={cn('font-medium', 'text-foreground')}>{apiPagination?.totalCars || 0}</span> results
                            </span>
                          </div>
                          <div className={cn('flex', 'items-center', 'gap-6')}>
                            <div className={cn('flex', 'items-center', 'gap-2')}>
                              <Label htmlFor="rows-per-page" className={cn('text-sm', 'text-muted-foreground', 'whitespace-nowrap')}>Rows per page</Label>
                              <Select 
                                value={`${table.getState().pagination.pageSize}`} 
                                onValueChange={(value) => table.setPageSize(Number(value))}
                              >
                                <SelectTrigger size="sm" className={cn('w-[70px]', 'h-8')} id="rows-per-page">
                                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                  {[5, 10, 20, 30, 40, 50].map((ps) => (
                                    <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className={cn('flex', 'items-center', 'gap-1')}>
                              <span className={cn('text-sm', 'font-medium', 'whitespace-nowrap')}>
                                Page {apiPagination?.currentPage || 1} of {apiPagination?.totalPages || 1}
                              </span>
                            </div>
                            <div className={cn('flex', 'items-center', 'gap-1')}>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn('h-8', 'w-8')} 
                                onClick={() => table.setPageIndex(0)} 
                                disabled={!apiPagination?.hasPrevPage}
                              >
                                <span className="sr-only">First page</span>
                                <IconChevronsLeft className="size-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn('h-8', 'w-8')} 
                                onClick={() => table.previousPage()} 
                                disabled={!apiPagination?.hasPrevPage}
                              >
                                <span className="sr-only">Previous page</span>
                                <IconChevronLeft className="size-4" />
                              </Button>
                              
                              {/* Page Numbers */}
                              <div className={cn('flex', 'items-center', 'gap-1')}>
                                {getPageNumbers(table, apiPagination).map((pageNum, index) => (
                                  <React.Fragment key={index}>
                                    {pageNum === '...' ? (
                                      <span className={cn('px-2', 'py-1', 'text-sm', 'text-muted-foreground')}>...</span>
                                    ) : (
                                      <Button
                                        variant={pageNum === (apiPagination?.currentPage || 1) ? "default" : "outline"}
                                        size="sm"
                                        className={cn('h-8', 'w-8', 'p-0')}
                                        onClick={() => table.setPageIndex(pageNum - 1)}
                                        disabled={pageNum === (apiPagination?.currentPage || 1)}
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
                                className={cn('h-8', 'w-8')} 
                                onClick={() => table.nextPage()} 
                                disabled={!apiPagination?.hasNextPage}
                              >
                                <span className="sr-only">Next page</span>
                                <IconChevronRight className="size-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn('h-8', 'w-8')} 
                                onClick={() => table.setPageIndex((apiPagination?.totalPages || 1) - 1)} 
                                disabled={!apiPagination?.hasNextPage}
                              >
                                <span className="sr-only">Last page</span>
                                <IconChevronsRight className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TooltipProvider>
              </div>
            </div>

            {/* ─── Delete Car Dialog ───────────────────────── */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the car "{carToDelete?.title}" from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn('bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/90')}
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? <IconRefresh className={cn('mr-2', 'h-4', 'w-4', 'animate-spin')} /> : <Trash2 className={cn('mr-2', 'h-4', 'w-4')} />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* ─── Bulk Delete Dialog ──────────────────────── */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedCount} cars?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected {selectedCount} cars from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmBulkDelete}
                    className={cn('bg-black', 'hover:bg-black/80')}
                    disabled={bulkDeleting}
                  >
                    {bulkDeleting ? "Deleting..." : "Delete All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet open={viewDrawerOpen} onOpenChange={setViewDrawerOpen}>
              <SheetContent className={cn('w-full', 'sm:max-w-3xl', 'overflow-y-auto', 'bg-white', 'dark:bg-slate-900', 'border-slate-200', 'dark:border-slate-700')}>
                {/* Required accessibility components - hidden from view */}
                <SheetTitle className="sr-only">Car Details</SheetTitle>
                <SheetDescription className="sr-only">Complete information about the selected vehicle</SheetDescription>
                
                <SheetHeader className={cn('border-b', 'border-slate-200', 'dark:border-slate-700', 'pb-4')}>
                  <div className={cn('flex', 'items-center', 'justify-between', 'w-full')}>
                    <div className={cn('flex', 'items-center', 'gap-3')}>
                      <div className={cn('p-2', 'bg-slate-100', 'dark:bg-slate-800', 'rounded-lg')}>
                        <CarIcon className={cn('h-6', 'w-6', 'text-slate-700', 'dark:text-slate-300')} />
                      </div>
                      <div>
                        <div className={cn('font-bold', 'text-xl', 'text-slate-900', 'dark:text-slate-100')}>Car Details</div>
                        <div className={cn('text-sm', 'font-normal', 'text-slate-500', 'dark:text-slate-400')}>Complete vehicle information</div>
                      </div>
                    </div>
                   
                  </div>
                </SheetHeader>
                
                {viewLoading ? (
                  <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'py-16')}>
                    <IconRefresh className={cn('h-8', 'w-8', 'animate-spin', 'text-slate-400', 'mb-4')} />
                    <p className={cn('text-slate-500', 'dark:text-slate-400')}>Loading car details...</p>
                  </div>
                ) : viewCar ? (
                  <div className={cn('mt-6', 'space-y-8')}>
                    {/* Car Summary Card */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'p-6', 'shadow-sm')}>
                      <div className={cn('flex', 'items-start', 'gap-6')}>
                        <div className={cn('relative', 'h-32', 'w-32', 'flex-shrink-0')}>
                          {viewCar.primaryImage?.url ? (
                            <Image
                              src={viewCar.primaryImage.url}
                              alt={viewCar.title}
                              fill
                              className={cn('object-cover', 'rounded-lg', 'border', 'border-gray-200')}
                              sizes="128px"
                            />
                          ) : (
                            <div className={cn('h-full', 'w-full', 'bg-gray-100', 'rounded-lg', 'border', 'border-gray-200', 'flex', 'items-center', 'justify-center')}>
                              <CarIcon className={cn('h-12', 'w-12', 'text-gray-400')} />
                            </div>
                          )}
                          <div className={cn('absolute', '-top-2', '-right-2')}>
                            {getStatusBadge(viewCar.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h2 className={cn('text-2xl', 'font-bold', 'mb-2', 'text-gray-900')}>{viewCar.title}</h2>
                          <div className={cn('flex', 'items-center', 'gap-4', 'text-sm', 'text-gray-600', 'mb-3')}>
                            <span className={cn('flex', 'items-center', 'gap-1')}>
                              <Calendar className={cn('h-4', 'w-4')} />
                              {viewCar.year}
                            </span>
                            <span className={cn('flex', 'items-center', 'gap-1')}>
                              <Fuel className={cn('h-4', 'w-4')} />
                              {viewCar.fuelType}
                            </span>
                            <span className={cn('flex', 'items-center', 'gap-1')}>
                              <Gauge className={cn('h-4', 'w-4')} />
                              {viewCar.km.toLocaleString()} km
                            </span>
                          </div>
                          <div className={cn('flex', 'items-center', 'gap-6')}>
                            <div>
                              <div className={cn('text-3xl', 'font-bold', 'text-gray-900')}>{formatPrice(viewCar.salePrice)}</div>
                              <div className={cn('text-sm', 'text-gray-500')}>Sale Price</div>
                            </div>
                            {viewCar.discountPercentage && viewCar.discountPercentage > 0 && (
                              <div className={cn('bg-gray-100', 'px-3', 'py-1', 'rounded-full', 'border', 'border-gray-200')}>
                                <span className={cn('text-gray-700', 'font-semibold')}>{viewCar.discountPercentage}% OFF</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Car Images Gallery */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-4', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-50', 'rounded')}>
                          <Eye className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Gallery
                      </h3>
                      
                      {/* Main Image */}
                      <div className={cn('relative', 'group', 'mb-4')}>
                        <div className={cn('relative', 'h-80', 'w-full', 'overflow-hidden', 'rounded-lg', 'border', 'border-gray-200', 'bg-gray-50')}>
                          {viewCar.primaryImage?.url ? (
                            <>
                              <Image
                                src={viewCar.primaryImage.url}
                                alt={viewCar.title}
                                fill
                                className={cn('object-cover', 'transition-transform', 'duration-500', 'group-hover:scale-105')}
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              {/* Overlay with replace/remove buttons */}
                              <div className={cn('absolute', 'inset-0', 'bg-black/0', 'group-hover:bg-black/60', 'transition-all', 'duration-300', 'flex', 'items-center', 'justify-center', 'opacity-0', 'group-hover:opacity-100')}>
                                <div className={cn('flex', 'gap-3')}>
                                  <Button size="sm" variant="secondary" className={cn('h-9', 'px-4', 'gap-2', 'bg-white', 'hover:bg-gray-50', 'text-gray-900', 'shadow-lg')}>
                                    <Pencil className={cn('h-4', 'w-4')} />
                                    Replace
                                  </Button>
                                  <Button size="sm" variant="destructive" className={cn('h-9', 'px-4', 'gap-2', 'bg-black', 'hover:bg-gray-800', 'text-white', 'shadow-lg')}>
                                    <Trash2 className={cn('h-4', 'w-4')} />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className={cn('flex', 'h-full', 'w-full', 'items-center', 'justify-center')}>
                              <div className="text-center">
                                <CarIcon className={cn('h-16', 'w-16', 'text-gray-400', 'mx-auto', 'mb-3')} />
                                <p className={cn('text-gray-500', 'mb-3')}>No primary image</p>
                                <Button size="sm" variant="outline" className={cn('gap-2', 'border-gray-300', 'text-gray-700', 'hover:bg-gray-50')}>
                                  <IconPlus className={cn('h-4', 'w-4')} />
                                  Add Main Image
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Thumbnail Gallery */}
                      {viewCar.images && viewCar.images.length > 0 && (
                        <div className="space-y-3">
                          <p className={cn('text-sm', 'font-medium', 'text-gray-600')}>Additional Images ({viewCar.images.length})</p>
                          <div className={cn('grid', 'grid-cols-4', 'sm:grid-cols-6', 'gap-3')}>
                            {viewCar.images.slice(0, 12).map((image, index) => (
                              <div key={index} className={cn('relative', 'group')}>
                                <div className={cn('relative', 'h-20', 'w-full', 'overflow-hidden', 'rounded-lg', 'border', 'border-gray-200', 'bg-gray-50')}>
                                  <Image
                                    src={image.url}
                                    alt={`${viewCar.title} - Image ${index + 1}`}
                                    fill
                                    className={cn('object-cover', 'transition-transform', 'duration-300', 'group-hover:scale-110')}
                                    sizes="80px"
                                  />
                                  {/* Hover overlay */}
                                  <div className={cn('absolute', 'inset-0', 'bg-black/0', 'group-hover:bg-black/60', 'transition-all', 'duration-300', 'flex', 'items-center', 'justify-center', 'opacity-0', 'group-hover:opacity-100')}>
                                    <div className={cn('flex', 'gap-1')}>
                                      <Button size="sm" variant="secondary" className={cn('h-6', 'w-6', 'p-0', 'bg-white', 'hover:bg-gray-50')}>
                                        <Pencil className={cn('h-3', 'w-3')} />
                                      </Button>
                                      <Button size="sm" variant="destructive" className={cn('h-6', 'w-6', 'p-0', 'bg-black', 'hover:bg-gray-800')}>
                                        <Trash2 className={cn('h-3', 'w-3')} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {viewCar.images.length > 12 && (
                              <div className={cn('relative', 'h-20', 'w-full', 'overflow-hidden', 'rounded-lg', 'border', 'border-gray-200', 'bg-gray-50', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'hover:bg-gray-100')}>
                                <div className="text-center">
                                  <span className={cn('text-sm', 'font-medium', 'text-gray-600')}>+{viewCar.images.length - 12}</span>
                                  <p className={cn('text-xs', 'text-gray-500')}>More</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Basic Information */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-50', 'rounded')}>
                          <CarIcon className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Basic Information
                      </h3>
                      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Title</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'text-gray-900')}>{viewCar.title}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Brand</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'text-gray-900')}>{viewCar.brand}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Model</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'text-gray-900')}>{viewCar.carModel}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Variant</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'text-gray-900')}>{viewCar.variant || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Year</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'text-gray-900')}>{viewCar.year}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Fuel Type</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'capitalize', 'text-gray-900')}>{viewCar.fuelType}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Transmission</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'capitalize', 'text-gray-900')}>{viewCar.transmission}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Body Type</Label>
                          <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('font-medium', 'capitalize', 'text-gray-900')}>{viewCar.bodyType}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className={cn('bg-gray-50', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-100', 'rounded')}>
                          <DollarSign className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Pricing Information
                      </h3>
                      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-6')}>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-600', 'uppercase', 'tracking-wider')}>Sale Price</Label>
                          <div className={cn('p-4', 'bg-white', 'rounded-lg', 'border-2', 'border-gray-300')}>
                            <p className={cn('text-2xl', 'font-bold', 'text-gray-900')}>{formatPrice(viewCar.salePrice)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Regular Price</Label>
                          <div className={cn('p-4', 'bg-white', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('text-lg', 'font-medium', 'text-gray-900')}>{formatPrice(viewCar.regularPrice)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>On Road Price</Label>
                          <div className={cn('p-4', 'bg-white', 'rounded-lg', 'border', 'border-gray-200')}>
                            <p className={cn('text-lg', 'font-medium', 'text-gray-900')}>{formatPrice(viewCar.onRoadPrice)}</p>
                          </div>
                        </div>
                      </div>
                      {viewCar.discountPercentage && viewCar.discountPercentage > 0 && (
                        <div className={cn('mt-4', 'p-3', 'bg-gray-100', 'rounded-lg', 'border', 'border-gray-300')}>
                          <div className={cn('flex', 'items-center', 'gap-2')}>
                            <Star className={cn('h-5', 'w-5', 'text-gray-600')} />
                            <div>
                              <p className={cn('font-semibold', 'text-gray-700')}>
                                {viewCar.discountPercentage}% discount applied
                              </p>
                              <p className={cn('text-sm', 'text-gray-600')}>
                                You save {formatPrice(viewCar.regularPrice - viewCar.salePrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Technical Specifications */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-50', 'rounded')}>
                          <Cog className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Technical Specifications
                      </h3>
                      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Kilometers</Label>
                          <div className={cn('flex', 'items-center', 'gap-3', 'p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <Gauge className={cn('h-5', 'w-5', 'text-gray-500')} />
                            <p className={cn('font-semibold', 'text-gray-900')}>{viewCar.km.toLocaleString()} km</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Fuel Type</Label>
                          <div className={cn('flex', 'items-center', 'gap-3', 'p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                            <Fuel className={cn('h-5', 'w-5', 'text-gray-500')} />
                            <p className={cn('font-semibold', 'capitalize', 'text-gray-900')}>{viewCar.fuelType}</p>
                          </div>
                        </div>
                        {viewCar.engine && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Engine</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>{viewCar.engine}</p>
                            </div>
                          </div>
                        )}
                        {viewCar.mileage && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Mileage</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>{viewCar.mileage}</p>
                            </div>
                          </div>
                        )}
                        {viewCar.seats && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Seats</Label>
                            <div className={cn('flex', 'items-center', 'gap-3', 'p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <User className={cn('h-5', 'w-5', 'text-gray-500')} />
                              <p className={cn('font-semibold', 'text-gray-900')}>{viewCar.seats} seats</p>
                            </div>
                          </div>
                        )}
                        {viewCar.driveType && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Drive Type</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'capitalize', 'text-gray-900')}>{viewCar.driveType}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-50', 'rounded')}>
                          <Shield className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Status & Availability
                      </h3>
                      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-6')}>
                        <div className="space-y-4">
                          <div>
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider', 'mb-3', 'block')}>Current Status</Label>
                            <div className={cn('p-4', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              {getStatusBadge(viewCar.status)}
                            </div>
                          </div>
                          <div>
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider', 'mb-3', 'block')}>Featured Status</Label>
                            <div className={cn('flex', 'items-center', 'gap-3', 'p-4', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <Switch
                                checked={!!viewCar.isFeatured}
                                className={cn('data-[state=checked]:bg-black', 'data-[state=unchecked]:bg-gray-300')}
                                disabled
                              />
                              <span className={cn('font-medium', 'text-gray-900')}>
                                {viewCar.isFeatured ? "Featured Car" : "Standard Listing"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                      <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                        <div className={cn('p-1.5', 'bg-gray-50', 'rounded')}>
                          <ListChecks className={cn('h-4', 'w-4', 'text-gray-600')} />
                        </div>
                        Additional Information
                      </h3>
                      <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6')}>
                        {viewCar.description && (
                          <div className={cn('col-span-full', 'space-y-2')}>
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Description</Label>
                            <div className={cn('p-4', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('text-sm', 'leading-relaxed', 'text-gray-700')}>{viewCar.description}</p>
                            </div>
                          </div>
                        )}
                        {viewCar.color && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Color</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'capitalize', 'text-gray-900')}>{viewCar.color}</p>
                            </div>
                          </div>
                        )}
                        {viewCar.ownership && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Ownership</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>{viewCar.ownership} owner(s)</p>
                            </div>
                          </div>
                        )}
                        {viewCar.registrationCity && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Registration</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>
                                {viewCar.registrationCity}
                                {viewCar.registrationState && `, ${viewCar.registrationState}`}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewCar.insurance && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>Insurance</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>{viewCar.insurance}</p>
                            </div>
                          </div>
                        )}
                        {viewCar.emiStartingFrom && (
                          <div className="space-y-2">
                            <Label className={cn('text-xs', 'font-semibold', 'text-gray-500', 'uppercase', 'tracking-wider')}>EMI Starting From</Label>
                            <div className={cn('p-3', 'bg-gray-50', 'rounded-lg', 'border', 'border-gray-200')}>
                              <p className={cn('font-medium', 'text-gray-900')}>{formatPrice(viewCar.emiStartingFrom)}/month</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    {viewCar.features && viewCar.features.length > 0 && (
                      <div className={cn('bg-gray-50', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm', 'p-6')}>
                        <h3 className={cn('text-lg', 'font-bold', 'mb-6', 'flex', 'items-center', 'gap-2', 'text-gray-900')}>
                          <div className={cn('p-1.5', 'bg-gray-100', 'rounded')}>
                            <Star className={cn('h-4', 'w-4', 'text-gray-600')} />
                          </div>
                          Car Features ({viewCar.features.length})
                        </h3>
                        <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4')}>
                          {viewCar.features.map((feature, index) => (
                            <div key={index} className={cn('flex', 'items-center', 'gap-3', 'p-3', 'bg-white', 'rounded-lg', 'border', 'border-gray-200')}>
                              <Switch
                                checked={feature.available}
                                className={cn('data-[state=checked]:bg-black', 'data-[state=unchecked]:bg-gray-300')}
                                disabled
                              />
                              <div className="flex-1">
                                <p className={`font-medium text-sm ${feature.available ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {feature.name}
                                </p>
                                <p className={cn('text-xs', 'text-gray-500')}>
                                  {feature.available ? 'Available' : 'Not Available'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className={cn('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'p-6', 'shadow-sm')}>
                      <div className={cn('flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-between', 'gap-4')}>
                        <div className={cn('flex', 'items-center', 'gap-4')}>
                          <div className="text-sm">
                            <span className="text-gray-500">Last updated:</span>
                            <span className={cn('ml-2', 'font-medium', 'text-gray-900')}>{new Date(viewCar.updatedAt).toLocaleDateString()}</span>
                          </div>
                          {viewCar.isFeatured && (
                            <Badge className={cn('bg-gray-100', 'text-gray-700', 'border', 'border-gray-300')}>
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                        <div className={cn('flex', 'gap-3')}>
                          <Button onClick={() => handleOpenEdit(viewCar)} className={cn('h-10', 'px-6', 'gap-2', 'bg-black', 'hover:bg-gray-800', 'text-white')}>
                            <Pencil className={cn('h-4', 'w-4')} />
                            Update
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setViewDrawerOpen(false)}
                            className={cn('h-10', 'px-6', 'gap-2', 'border-gray-300', 'text-gray-700', 'hover:bg-gray-50')}
                          >
                            <IconX className={cn('h-4', 'w-4')} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'py-16')}>
                    <div className={cn('p-4', 'bg-slate-100', 'dark:bg-slate-800', 'rounded-full', 'mb-4')}>
                      <CarIcon className={cn('h-12', 'w-12', 'text-slate-400')} />
                    </div>
                    <p className={cn('text-slate-500', 'dark:text-slate-400')}>No car data available</p>
                    <Button variant="outline" className={cn('mt-4', 'border-slate-300', 'text-slate-700', 'hover:bg-slate-50')} onClick={() => setViewDrawerOpen(false)}>
                      Close
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
