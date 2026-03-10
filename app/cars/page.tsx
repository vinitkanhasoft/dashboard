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
  IconLoader,
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
  Pencil,
  Trash2,
  Calendar,
  Eye,
  Car as CarIcon,
  Fuel,
  Gauge,
  Star,
  MapPin,
  Shield,
  ListChecks,
  DollarSign,
  User,
  Cog,
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
        row.index % 2 === 0
          ? "bg-white dark:bg-gray-900/50"
          : "bg-gray-50/30 dark:bg-gray-800/30",
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
    <div className={cn("grid", "gap-4", "sm:grid-cols-2", "lg:grid-cols-4")}>
      <Card>
        <CardHeader
          className={cn(
            "flex",
            "flex-row",
            "items-center",
            "justify-between",
            "space-y-0",
            "pb-2",
          )}
        >
          <CardTitle className={cn("text-sm", "font-medium")}>
            Total Cars
          </CardTitle>
          <CarIcon className={cn("h-4", "w-4", "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl", "font-bold")}>
            {counts?.total || 0}
          </div>
          <p className={cn("text-xs", "text-muted-foreground")}>
            All listed cars
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader
          className={cn(
            "flex",
            "flex-row",
            "items-center",
            "justify-between",
            "space-y-0",
            "pb-2",
          )}
        >
          <CardTitle className={cn("text-sm", "font-medium")}>
            Available
          </CardTitle>
          <Eye className={cn("h-4", "w-4", "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl", "font-bold")}>
            {counts?.available || 0}
          </div>
          <p className={cn("text-xs", "text-muted-foreground")}>
            Ready for sale
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader
          className={cn(
            "flex",
            "flex-row",
            "items-center",
            "justify-between",
            "space-y-0",
            "pb-2",
          )}
        >
          <CardTitle className={cn("text-sm", "font-medium")}>Sold</CardTitle>
          <Star className={cn("h-4", "w-4", "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl", "font-bold")}>{counts?.sold || 0}</div>
          <p className={cn("text-xs", "text-muted-foreground")}>Sold cars</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader
          className={cn(
            "flex",
            "flex-row",
            "items-center",
            "justify-between",
            "space-y-0",
            "pb-2",
          )}
        >
          <CardTitle className={cn("text-sm", "font-medium")}>
            Reserved
          </CardTitle>
          <Calendar className={cn("h-4", "w-4", "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl", "font-bold")}>
            {counts?.reserved || 0}
          </div>
          <p className={cn("text-xs", "text-muted-foreground")}>
            Reserved cars
          </p>
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
      return (
        <Badge
          className={cn(
            "bg-green-100",
            "text-green-700",
            "border-green-200",
            "dark:bg-green-950/30",
            "dark:text-green-400",
          )}
        >
          Available
        </Badge>
      );
    case CarStatus.SOLD:
      return (
        <Badge
          className={cn(
            "bg-red-100",
            "text-red-700",
            "border-red-200",
            "dark:bg-red-950/30",
            "dark:text-red-400",
          )}
        >
          Sold
        </Badge>
      );
    case CarStatus.RESERVED:
      return (
        <Badge
          className={cn(
            "bg-yellow-100",
            "text-yellow-700",
            "border-yellow-200",
            "dark:bg-yellow-950/30",
            "dark:text-yellow-400",
          )}
        >
          Reserved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = React.useState(false);
  const [imageDirection, setImageDirection] = React.useState<'left' | 'right'>('right');

  // Status tabs state
  const [activeStatusTab, setActiveStatusTab] = React.useState<string>("all");

  // Helper function to get all images (primary + additional)
  const getAllImages = React.useCallback((car: Car | null) => {
    if (!car) return [];
    const images = [];
    if (car.primaryImage?.url) {
      images.push({ ...car.primaryImage, isPrimary: true });
    }
    if (car.images && car.images.length > 0) {
      images.push(...car.images.map(img => ({ ...img, isPrimary: false })));
    }
    return images;
  }, []);

  // Helper function to handle image change with animation
  const handleImageChange = React.useCallback((newIndex: number, direction: 'left' | 'right') => {
    const allImages = getAllImages(viewCar);
    if (allImages.length <= 1) return;
    
    setIsImageTransitioning(true);
    setImageDirection(direction);
    
    setTimeout(() => {
      setSelectedImageIndex(newIndex);
      setIsImageTransitioning(false);
    }, 150);
  }, [viewCar, getAllImages]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {}),
  );

  // Search handler - calls the appropriate API based on active tab
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleSearch = React.useCallback(
    (q: string) => {
      setGlobalFilter(q);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        if (q.trim()) {
          // Use general search for text queries
          dispatch(
            searchCars({
              q,
              page: 1,
              limit: pagination.pageSize,
              sortBy: "relevance",
              sortOrder: "desc",
            }),
          );
          // Switch to "all" tab when searching
          setActiveStatusTab("all");
        } else {
          // Use status-specific API when no search query
          if (activeStatusTab === "all") {
            // If we're on "all" tab, the useEffect will handle showing existing data
            // No need to manually set data here
          } else {
            // If we're on a status tab, refresh that status
            dispatch(
              searchCarsByStatus({
                status: activeStatusTab,
                page: 1,
                limit: pagination.pageSize,
                sortBy: "createdAt",
                sortOrder: "desc",
              }),
            );
          }
        }
      }, 400);
    },
    [
      dispatch,
      pagination.pageIndex,
      pagination.pageSize,
      activeStatusTab,
      cars,
    ],
  );

  // Handle status tab change
  const handleStatusTabChange = React.useCallback(
    (status: string) => {
      setActiveStatusTab(status);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page

      // Only call status API if not "all" and we have counts data
      if (status !== "all" && counts) {
        dispatch(
          searchCarsByStatus({
            status,
            page: 1,
            limit: pagination.pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        );
      }
      // For "all" tab, the useEffect will handle showing all cars
    },
    [dispatch, pagination.pageSize, counts],
  );

  // Handle pagination changes
  React.useEffect(() => {
    if (!globalFilter && hasFetched.current) {
      if (activeStatusTab === "all") {
        dispatch(
          fetchCars({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        );
      } else {
        dispatch(
          searchCarsByStatus({
            status: activeStatusTab,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        );
      }
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    dispatch,
    globalFilter,
    activeStatusTab,
  ]);

  // Initial data fetch and refetch on page focus/visibility
  React.useEffect(() => {
    // Always fetch data when component mounts
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(
        fetchCars({
          page: 1,
          limit: pagination.pageSize,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      );
    }

    // Handle visibility change for navigation back scenarios
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !hasFetched.current) {
        hasFetched.current = true;
        dispatch(
          fetchCars({
            page: 1,
            limit: pagination.pageSize,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        );
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, pagination.pageSize]);

  // Handle tab changes after initial data is loaded and sync data with table
  React.useEffect(() => {
    if (hasFetched.current) {
      if (activeStatusTab === "all") {
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
      if (activeStatusTab === "all") {
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
    [data],
  );

  // ─── Handlers ──────────────────────────────────────────
  const handleOpenView = React.useCallback(
    async (car: Car) => {
      setViewCar(car);
      setSelectedImageIndex(0); // Reset to first image
      setViewDrawerOpen(true);
      setViewLoading(true);
      const result = await dispatch(fetchCarById(car._id));
      if (fetchCarById.fulfilled.match(result)) {
        setViewCar(result.payload);
      }
      setViewLoading(false);
    },
    [dispatch],
  );

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
          <div className={cn("flex", "items-center", "justify-center")}>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
              className={cn(
                "border-2",
                "data-[state=checked]:bg-primary",
                "data-[state=checked]:border-primary",
                "transition-colors",
              )}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className={cn("flex", "items-center", "justify-center")}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className={cn(
                "border-2",
                "data-[state=checked]:bg-primary",
                "data-[state=checked]:border-primary",
                "transition-colors",
              )}
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
          <div
            className={cn(
              "relative",
              "h-12",
              "w-20",
              "overflow-hidden",
              "rounded-md",
              "border",
              "group",
              "cursor-pointer",
            )}
          >
            {row.original.primaryImage?.url ? (
              <Image
                src={row.original.primaryImage.url}
                alt={row.original.title}
                fill
                className={cn(
                  "object-cover",
                  "transition-transform",
                  "duration-300",
                  "group-hover:scale-110",
                )}
                sizes="80px"
              />
            ) : (
              <div
                className={cn(
                  "flex",
                  "h-full",
                  "w-full",
                  "items-center",
                  "justify-center",
                  "bg-muted",
                )}
              >
                <CarIcon
                  className={cn("h-5", "w-5", "text-muted-foreground")}
                />
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
            className={cn("hover:bg-transparent", "font-semibold")}
          >
            Title
            <IconChevronDown className={cn("ml-2", "h-4", "w-4")} />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            className={cn(
              "text-foreground",
              "hover:text-primary",
              "w-fit",
              "px-0",
              "text-left",
              "font-medium",
            )}
            onClick={() => handleOpenView(row.original)}
          >
            <div className={cn("flex", "items-center", "gap-2")}>
              <CarIcon className={cn("size-4", "text-primary/70")} />
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
            className={cn("hover:bg-transparent", "font-semibold")}
          >
            Price
            <IconChevronDown className={cn("ml-2", "h-4", "w-4")} />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={cn("flex", "flex-col")}>
            <span className={cn("font-semibold", "text-sm")}>
              {formatPrice(row.original.salePrice)}
            </span>
            {row.original.regularPrice > row.original.salePrice && (
              <span
                className={cn(
                  "text-xs",
                  "text-muted-foreground",
                  "line-through",
                )}
              >
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
        cell: ({ row }) => (
          <span className={cn("text-sm", "font-medium")}>
            {row.original.year}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "km",
        header: "KM",
        cell: ({ row }) => (
          <div className={cn("flex", "items-center", "gap-1.5")}>
            <Gauge className={cn("h-3.5", "w-3.5", "text-muted-foreground")} />
            <span className="text-sm">
              {row.original.km.toLocaleString()} km
            </span>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "fuelType",
        header: "Fuel",
        cell: ({ row }) => (
          <div className={cn("flex", "items-center", "gap-1.5")}>
            <Fuel className={cn("h-3.5", "w-3.5", "text-muted-foreground")} />
            <span className={cn("text-sm", "capitalize")}>
              {row.original.fuelType}
            </span>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const [isEditing, setIsEditing] = React.useState(false);
          const [currentStatus, setCurrentStatus] = React.useState(
            row.original.status,
          );
          const [updating, setUpdating] = React.useState(false);

          const handleStatusChange = async (newStatus: string) => {
            setUpdating(true);
            const formData = new FormData();
            formData.append("status", newStatus);

            const result = await dispatch(
              updateCar({ id: row.original._id, formData }),
            );

            if (updateCar.fulfilled.match(result)) {
              setCurrentStatus(newStatus);
              setIsEditing(false);
              toast.success(`Car status updated to ${newStatus}`);

              // Refetch data to ensure consistency
              if (globalFilter) {
                // If there's an active search, refresh search results
                dispatch(
                  searchCars({
                    q: globalFilter,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "relevance",
                    sortOrder: "desc",
                  }),
                );
              } else if (activeStatusTab === "all") {
                // Refresh all cars
                dispatch(
                  fetchCars({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  }),
                );
              } else {
                // Refresh status-specific cars
                dispatch(
                  searchCarsByStatus({
                    status: activeStatusTab,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  }),
                );
              }
            } else {
              toast.error(result.payload ?? "Failed to update status");
            }
            setUpdating(false);
          };

          if (isEditing) {
            return (
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger size="sm" className={cn("h-8", "w-28")}>
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
            <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
              {getStatusBadge(currentStatus)}
            </div>
          );
        },
        size: 110,
      },
      {
        accessorKey: "isFeatured",
        header: () => (
          <div className={cn("w-full", "text-center", "font-semibold")}>
            Featured
          </div>
        ),
        cell: ({ row }) => {
          const featured = !!row.original.isFeatured;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [toggling, setToggling] = React.useState(false);
          const handleToggle = async () => {
            setToggling(true);
            const newVal = !featured;
            setData((prev) =>
              prev.map((c) =>
                c._id === row.original._id ? { ...c, isFeatured: newVal } : c,
              ),
            );
            const formData = new FormData();
            formData.append("title", row.original.title);
            formData.append("isFeatured", String(newVal));
            const result = await dispatch(
              updateCar({ id: row.original._id, formData }),
            );
            setToggling(false);
            if (updateCar.fulfilled.match(result)) {
              toast.success(`Car ${newVal ? "featured" : "unfeatured"}`);

              // Refetch data to ensure consistency
              if (globalFilter) {
                // If there's an active search, refresh search results
                dispatch(
                  searchCars({
                    q: globalFilter,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "relevance",
                    sortOrder: "desc",
                  }),
                );
              } else if (activeStatusTab === "all") {
                // Refresh all cars
                dispatch(
                  fetchCars({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  }),
                );
              } else {
                // Refresh status-specific cars
                dispatch(
                  searchCarsByStatus({
                    status: activeStatusTab,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  }),
                );
              }
            } else {
              setData((prev) =>
                prev.map((c) =>
                  c._id === row.original._id
                    ? { ...c, isFeatured: featured }
                    : c,
                ),
              );
              toast.error(result.payload ?? "Failed to update");
            }
          };
          return (
            <div className={cn("flex", "justify-center")}>
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
          <div className={cn("flex", "items-center", "gap-2")}>
            <Calendar className={cn("size-3.5", "text-muted-foreground")} />
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
                className={cn(
                  "data-[state=open]:bg-primary/10",
                  "text-muted-foreground",
                  "hover:text-foreground",
                  "flex",
                  "size-8",
                  "transition-all",
                  "duration-200",
                  "hover:scale-110",
                )}
                size="icon"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Actions for {row.original.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn("cursor-pointer", "gap-2")}
                  onClick={() => handleOpenView(row.original)}
                >
                  <Eye className={cn("h-4", "w-4")} />
                  <span>View</span>
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn("cursor-pointer", "gap-2")}
                  onClick={() => handleOpenEdit(row.original)}
                >
                  <Pencil className={cn("h-4", "w-4")} />
                  <span>Edit</span>
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className={cn(
                  "cursor-pointer",
                  "gap-2",
                  "text-red-600",
                  "focus:text-red-600",
                )}
                onClick={() => handleDeleteCar(row.original)}
              >
                <Trash2 className={cn("h-4", "w-4")} />
                <span>Delete</span>
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [dispatch, handleOpenView],
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

  const handleOpenEdit = React.useCallback(
    (car: Car) => {
      router.push(`/cars/add?id=${car._id}`);
    },
    [router],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(
      fetchCars({
        page: 1,
        limit: pagination.pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    );
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
      head: [
        [
          "Brand",
          "Model",
          "Variant",
          "Year",
          "Fuel",
          "Transmission",
          "Status",
          "Price",
          "KMs Driven",
          "Featured",
        ],
      ],
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
        icon: <IconCheck className={cn("h-4", "w-4")} />,
      });
    }
  }

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 56)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div
            className={cn(
              "flex",
              "flex-1",
              "flex-col",
              "overflow-hidden",
              "my-5",
            )}
          >
            <div
              className={cn(
                "@container/main",
                "flex",
                "flex-1",
                "flex-col",
                "gap-2",
                "overflow-y-auto",
              )}
            >
              {/* Stats Cards */}
              <div className={cn("px-4", "lg:px-6")}>
                <CarCards />
              </div>

              {/* Status Tabs */}
              <div className={cn("px-4", "lg:px-6", "mb-4", "mt-5")}>
                <div
                  className={cn(
                    "flex",
                    "gap-1",
                    "bg-gray-100",
                    "p-1",
                    "rounded-lg",
                  )}
                >
                  <button
                    className={cn(
                      "flex-1",
                      "px-4",
                      "py-2",
                      "text-sm",
                      "font-medium",
                      "rounded-md",
                      "transition-all",
                      "duration-200",
                      "ease-in-out",
                      activeStatusTab === "all"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                    )}
                    onClick={() => handleStatusTabChange("all")}
                  >
                    <div
                      className={cn(
                        "flex",
                        "items-center",
                        "justify-center",
                        "gap-2",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs",
                          "font-semibold",
                          activeStatusTab === "all"
                            ? "text-gray-900"
                            : "text-gray-500",
                        )}
                      >
                        ALL
                      </span>
                      <span
                        className={cn(
                          "px-2",
                          "py-0.5",
                          "text-xs",
                          "rounded-full",
                          activeStatusTab === "all"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-300 text-gray-700",
                        )}
                      >
                        {counts?.total || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      "flex-1",
                      "px-4",
                      "py-2",
                      "text-sm",
                      "font-medium",
                      "rounded-md",
                      "transition-all",
                      "duration-200",
                      "ease-in-out",
                      activeStatusTab === CarStatus.AVAILABLE
                        ? "bg-white text-green-700 shadow-sm border border-green-200"
                        : "text-gray-600 hover:text-green-700 hover:bg-white/50",
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.AVAILABLE)}
                  >
                    <div
                      className={cn(
                        "flex",
                        "items-center",
                        "justify-center",
                        "gap-2",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs",
                          "font-semibold",
                          activeStatusTab === CarStatus.AVAILABLE
                            ? "text-green-700"
                            : "text-gray-500",
                        )}
                      >
                        AVAILABLE
                      </span>
                      <span
                        className={cn(
                          "px-2",
                          "py-0.5",
                          "text-xs",
                          "rounded-full",
                          activeStatusTab === CarStatus.AVAILABLE
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-300 text-gray-700",
                        )}
                      >
                        {counts?.available || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      "flex-1",
                      "px-4",
                      "py-2",
                      "text-sm",
                      "font-medium",
                      "rounded-md",
                      "transition-all",
                      "duration-200",
                      "ease-in-out",
                      activeStatusTab === CarStatus.SOLD
                        ? "bg-white text-red-700 shadow-sm border border-red-200"
                        : "text-gray-600 hover:text-red-700 hover:bg-white/50",
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.SOLD)}
                  >
                    <div
                      className={cn(
                        "flex",
                        "items-center",
                        "justify-center",
                        "gap-2",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs",
                          "font-semibold",
                          activeStatusTab === CarStatus.SOLD
                            ? "text-red-700"
                            : "text-gray-500",
                        )}
                      >
                        SOLD
                      </span>
                      <span
                        className={cn(
                          "px-2",
                          "py-0.5",
                          "text-xs",
                          "rounded-full",
                          activeStatusTab === CarStatus.SOLD
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-gray-300 text-gray-700",
                        )}
                      >
                        {counts?.sold || 0}
                      </span>
                    </div>
                  </button>
                  <button
                    className={cn(
                      "flex-1",
                      "px-4",
                      "py-2",
                      "text-sm",
                      "font-medium",
                      "rounded-md",
                      "transition-all",
                      "duration-200",
                      "ease-in-out",
                      activeStatusTab === CarStatus.RESERVED
                        ? "bg-white text-yellow-700 shadow-sm border border-yellow-200"
                        : "text-gray-600 hover:text-yellow-700 hover:bg-white/50",
                    )}
                    onClick={() => handleStatusTabChange(CarStatus.RESERVED)}
                  >
                    <div
                      className={cn(
                        "flex",
                        "items-center",
                        "justify-center",
                        "gap-2",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs",
                          "font-semibold",
                          activeStatusTab === CarStatus.RESERVED
                            ? "text-yellow-700"
                            : "text-gray-500",
                        )}
                      >
                        RESERVED
                      </span>
                      <span
                        className={cn(
                          "px-2",
                          "py-0.5",
                          "text-xs",
                          "rounded-full",
                          activeStatusTab === CarStatus.RESERVED
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-gray-300 text-gray-700",
                        )}
                      >
                        {counts?.reserved || 0}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && !loading && data.length === 0 && (
                <div className={cn("px-4", "lg:px-6")}>
                  <div
                    className={cn(
                      "flex",
                      "flex-col",
                      "items-center",
                      "justify-center",
                      "py-16",
                      "text-center",
                      "border",
                      "rounded-xl",
                      "bg-red-50/50",
                      "dark:bg-red-950/10",
                      "border-red-200",
                      "dark:border-red-900/30",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full",
                        "bg-red-100",
                        "dark:bg-red-900/30",
                        "p-4",
                        "mb-4",
                      )}
                    >
                      <IconAlertCircle
                        className={cn("h-8", "w-8", "text-red-500")}
                      />
                    </div>
                    <h3
                      className={cn(
                        "text-lg",
                        "font-semibold",
                        "text-red-700",
                        "dark:text-red-400",
                        "mb-1",
                      )}
                    >
                      Failed to load cars
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        "text-red-600/80",
                        "dark:text-red-400/70",
                        "mb-4",
                        "max-w-md",
                      )}
                    >
                      {error}
                    </p>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className={cn(
                        "gap-2",
                        "border-red-200",
                        "text-red-700",
                        "hover:bg-red-100",
                        "dark:border-red-800",
                        "dark:text-red-400",
                        "dark:hover:bg-red-950/30",
                      )}
                    >
                      <IconRefresh
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Table Section */}
              <div className={cn("px-4", "lg:px-6", "mt-5")}>
                <TooltipProvider>
                  <div className={cn("w-full", "flex", "flex-col", "gap-4")}>
                    {/* Table Toolbar */}
                    <div
                      className={cn("flex", "items-center", "justify-between")}
                    >
                      <div
                        className={cn(
                          "flex",
                          "items-center",
                          "gap-2",
                          "flex-1",
                        )}
                      >
                        <div className={cn("relative", "flex-1", "max-w-md")}>
                          <IconSearch
                            className={cn(
                              "absolute",
                              "left-3",
                              "top-1/2",
                              "transform",
                              "-translate-y-1/2",
                              "h-4",
                              "w-4",
                              "text-muted-foreground",
                            )}
                          />
                          <Input
                            placeholder="Search cars..."
                            value={globalFilter ?? ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={cn(
                              "h-9",
                              "pl-9",
                              "pr-4",
                              "w-full",
                              "bg-muted/50",
                              "border-muted",
                              "focus:bg-background",
                              "transition-all",
                              "duration-200",
                            )}
                          />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-9",
                                "gap-2",
                                "border-muted",
                                "hover:bg-muted/50",
                              )}
                            >
                              <IconLayoutColumns className="size-3.5" />
                              <span className={cn("hidden", "lg:inline")}>
                                Columns
                              </span>
                              <IconChevronDown className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>
                              Toggle columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                              .getAllColumns()
                              .filter(
                                (column) =>
                                  typeof column.accessorFn !== "undefined" &&
                                  column.getCanHide(),
                              )
                              .map((column) => (
                                <DropdownMenuCheckboxItem
                                  key={column.id}
                                  className={cn("capitalize", "cursor-pointer")}
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                  }
                                >
                                  {column.id === "primaryImage"
                                    ? "Image"
                                    : column.id === "salePrice"
                                      ? "Price"
                                      : column.id === "isFeatured"
                                        ? "Featured"
                                        : column.id === "createdAt"
                                          ? "Created"
                                          : column.id
                                              .replace(/([A-Z])/g, " $1")
                                              .trim()}
                                </DropdownMenuCheckboxItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="default"
                          size="sm"
                          className={cn(
                            "h-9",
                            "gap-2",
                            "bg-linear-to-r",
                            "from-primary",
                            "to-primary/90",
                            "hover:from-primary/90",
                            "hover:to-primary",
                            "shadow-sm",
                          )}
                          onClick={handleOpenAdd}
                        >
                          <IconPlus className="size-3.5" />
                          <span className={cn("hidden", "lg:inline")}>
                            Add Car
                          </span>
                        </Button>
                      </div>

                      <div className={cn("flex", "items-center", "gap-2")}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-9", "w-9")}
                              onClick={handleRefresh}
                              disabled={isRefreshing || loading}
                            >
                              <IconRefresh
                                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Refresh data</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-9", "w-9")}
                              onClick={handleDownloadPDF}
                            >
                              <IconDownload className={cn("h-4", "w-4")} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download PDF</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Table Content */}
                    {loading ? (
                      <div
                        className={cn(
                          "rounded-xl",
                          "border",
                          "bg-card",
                          "shadow-lg",
                        )}
                      >
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader
                              className={cn(
                                "bg-linear-to-r",
                                "from-muted/80",
                                "to-muted/40",
                              )}
                            >
                              <TableRow className="hover:bg-transparent">
                                {[
                                  40, 40, 100, 250, 120, 140, 80, 120, 100, 110,
                                  90, 120, 50,
                                ].map((w, i) => (
                                  <TableHead
                                    key={i}
                                    style={{ width: w }}
                                    className="h-11"
                                  >
                                    <Skeleton
                                      className={cn("h-4", "w-12", "rounded")}
                                    />
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[...Array(apiPagination?.limit || 10)].map(
                                (_, i) => (
                                  <TableRow
                                    key={i}
                                    className={
                                      i % 2 === 0
                                        ? "bg-white dark:bg-gray-900/50"
                                        : "bg-gray-50/30 dark:bg-gray-800/30"
                                    }
                                  >
                                    {[
                                      40, 40, 100, 250, 120, 140, 80, 120, 100,
                                      110, 90, 120, 50,
                                    ].map((w, j) => (
                                      <TableCell
                                        key={j}
                                        className="py-3"
                                        style={{ width: w }}
                                      >
                                        <Skeleton
                                          className={cn(
                                            "h-5",
                                            "w-full",
                                            "rounded",
                                          )}
                                        />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : data.length === 0 ? (
                      <div
                        className={cn(
                          "flex",
                          "flex-col",
                          "items-center",
                          "justify-center",
                          "py-12",
                          "text-center",
                          "border",
                          "rounded-lg",
                        )}
                      >
                        <CarIcon
                          className={cn(
                            "mb-3",
                            "h-10",
                            "w-10",
                            "text-muted-foreground/50",
                          )}
                        />
                        <p className={cn("text-sm", "text-muted-foreground")}>
                          No cars found. Add your first car.
                        </p>
                        <Button onClick={handleOpenAdd} className="mt-4">
                          <IconPlus className={cn("mr-2", "h-4", "w-4")} />
                          Add Car
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedCount > 0 && (
                          <div
                            className={cn(
                              "flex",
                              "items-center",
                              "justify-between",
                              "bg-primary/5",
                              "rounded-lg",
                              "p-3",
                              "border",
                              "border-primary/20",
                            )}
                          >
                            <div
                              className={cn("flex", "items-center", "gap-2")}
                            >
                              <Badge
                                variant="default"
                                className={cn(
                                  "bg-primary",
                                  "text-primary-foreground",
                                )}
                              >
                                {selectedCount} selected
                              </Badge>
                              <span
                                className={cn(
                                  "text-sm",
                                  "text-muted-foreground",
                                )}
                              >
                                {selectedCount} of {totalCount} rows selected
                              </span>
                            </div>
                            <div
                              className={cn("flex", "items-center", "gap-2")}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                className={cn("h-8", "gap-1.5")}
                                onClick={handleBulkDelete}
                              >
                                <Trash2 className={cn("h-3.5", "w-3.5")} />
                                Delete ({selectedCount})
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() =>
                                  table.toggleAllPageRowsSelected(false)
                                }
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "rounded-xl",
                            "border",
                            "bg-card",
                            "shadow-lg",
                          )}
                        >
                          <div className="overflow-x-auto">
                            <DndContext
                              collisionDetection={closestCenter}
                              modifiers={[restrictToVerticalAxis]}
                              onDragEnd={handleDragEnd}
                              sensors={sensors}
                              id={sortableId}
                            >
                              <Table>
                                <TableHeader
                                  className={cn(
                                    "bg-linear-to-r",
                                    "from-muted/80",
                                    "to-muted/40",
                                  )}
                                >
                                  {table
                                    .getHeaderGroups()
                                    .map((headerGroup) => (
                                      <TableRow
                                        key={headerGroup.id}
                                        className="hover:bg-transparent"
                                      >
                                        {headerGroup.headers.map((header) => (
                                          <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ width: header.getSize() }}
                                            className={cn(
                                              "h-11",
                                              "font-semibold",
                                              "text-foreground/80",
                                            )}
                                          >
                                            {header.isPlaceholder
                                              ? null
                                              : flexRender(
                                                  header.column.columnDef
                                                    .header,
                                                  header.getContext(),
                                                )}
                                          </TableHead>
                                        ))}
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
                                        className={cn("h-32", "text-center")}
                                      >
                                        <div
                                          className={cn(
                                            "flex",
                                            "flex-col",
                                            "items-center",
                                            "justify-center",
                                            "gap-2",
                                          )}
                                        >
                                          <IconAlertCircle
                                            className={cn(
                                              "h-8",
                                              "w-8",
                                              "text-muted-foreground/50",
                                            )}
                                          />
                                          <p className="text-muted-foreground">
                                            No results found.
                                          </p>
                                          <Button
                                            variant="link"
                                            className="text-primary"
                                            onClick={() => handleSearch("")}
                                          >
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
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            Total: <span className="font-medium text-foreground">{apiPagination?.totalCars || 0}</span> results
                            {selectedCount > 0 && (
                              <span className="text-xs ml-2">
                                ({selectedCount} selected)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.setPageIndex(0)}
                              disabled={!apiPagination?.hasPrevPage}
                            >
                              <span className="sr-only">First page</span>
                              <IconChevronsLeft className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.previousPage()}
                              disabled={!apiPagination?.hasPrevPage}
                            >
                              <span className="sr-only">Previous page</span>
                              <IconChevronLeft className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.nextPage()}
                              disabled={!apiPagination?.hasNextPage}
                            >
                              <span className="sr-only">Next page</span>
                              <IconChevronRight className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                table.setPageIndex(
                                  (apiPagination?.totalPages || 1) - 1,
                                )
                              }
                              disabled={!apiPagination?.hasNextPage}
                            >
                              <span className="sr-only">Last page</span>
                              <IconChevronsRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TooltipProvider>
              </div>
            </div>

            {/* ─── Delete Car Dialog ───────────────────────── */}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the car "{carToDelete?.title}" from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(
                      "bg-red-600",
                      "hover:bg-red-700",
                      "text-white",
                    )}
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <IconRefresh
                        className={cn("mr-2", "h-4", "w-4", "animate-spin")}
                      />
                    ) : (
                      <Trash2 className={cn("mr-2", "h-4", "w-4")} />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* ─── Bulk Delete Dialog ──────────────────────── */}
            <AlertDialog
              open={bulkDeleteDialogOpen}
              onOpenChange={setBulkDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedCount} cars?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the selected {selectedCount} cars from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmBulkDelete}
                    className={cn("bg-red-600", "hover:bg-red-500")}
                    disabled={bulkDeleting}
                  >
                    {bulkDeleting ? "Deleting..." : "Delete All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Sheet open={viewDrawerOpen} onOpenChange={setViewDrawerOpen}>
              <SheetContent className="w-full sm:max-w-2xl p-0 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
                {/* Hidden accessibility elements */}
                <SheetTitle className="sr-only">Car Details</SheetTitle>
                <SheetDescription className="sr-only">
                  Complete vehicle information
                </SheetDescription>

                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <CarIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Vehicle Details
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {viewCar?._id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewDrawerOpen(false)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {viewLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <IconRefresh className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading details...
                      </p>
                    </div>
                  </div>
                ) : viewCar ? (
                  <div className="p-6 space-y-8">
                    {/* Quick Info Bar */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {viewCar.primaryImage?.url ? (
                            <Image
                              src={viewCar.primaryImage.url}
                              alt={viewCar.primaryImage.alt || viewCar.title}
                              fill
                              className="object-cover rounded-md border border-gray-200 dark:border-gray-700"
                              sizes="64px"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {viewCar.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {viewCar.brand} • {viewCar.carModel} •{" "}
                            {viewCar.year}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(viewCar.status)}
                            {viewCar.isFeatured && (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatPrice(viewCar.salePrice)}
                        </div>
                        {viewCar.discountPercentage &&
                          viewCar.discountPercentage > 0 && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(viewCar.regularPrice)}
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                                {viewCar.discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Image Gallery with Carousel */}
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Gallery</span>
                        <span className="text-gray-400">
                          {getAllImages(viewCar).length} images
                        </span>
                      </label>

                      {/* Main Image Display with Animation */}
                      {getAllImages(viewCar).length > 0 && (
                        <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 group">
                          {/* Image Container with Animation */}
                          <div className="relative w-full h-full">
                            {/* Current Image */}
                            <div
                              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                                isImageTransitioning
                                  ? imageDirection === 'right'
                                    ? 'opacity-0 transform translate-x-8'
                                    : 'opacity-0 transform -translate-x-8'
                                  : 'opacity-100 transform translate-x-0'
                              }`}
                            >
                              <Image
                                src={getAllImages(viewCar)[selectedImageIndex]?.url || ''}
                                alt={getAllImages(viewCar)[selectedImageIndex]?.alt || `Image ${selectedImageIndex + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 600px"
                              />
                            </div>
                            
                            {/* Previous Image for Smooth Transition */}
                            {isImageTransitioning && (
                              <div
                                className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                                  imageDirection === 'right'
                                    ? 'opacity-50 transform -translate-x-4'
                                    : 'opacity-50 transform translate-x-4'
                                }`}
                              >
                                <Image
                                  src={getAllImages(viewCar)[
                                    imageDirection === 'right'
                                      ? selectedImageIndex === 0 ? getAllImages(viewCar).length - 1 : selectedImageIndex - 1
                                      : selectedImageIndex === getAllImages(viewCar).length - 1 ? 0 : selectedImageIndex + 1
                                  ]?.url || ''}
                                  alt="Previous image"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 600px"
                                />
                              </div>
                            )}
                          </div>
                          
                          {getAllImages(viewCar)[selectedImageIndex]?.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
                              Primary Image
                            </div>
                          )}
                          
                          {/* Navigation Arrows */}
                          {getAllImages(viewCar).length > 1 && (
                            <>
                              <button
                                onClick={() => {
                                  const newIndex = selectedImageIndex === 0 ? getAllImages(viewCar).length - 1 : selectedImageIndex - 1;
                                  handleImageChange(newIndex, 'left');
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 transform hover:scale-110"
                                disabled={isImageTransitioning}
                              >
                                <IconChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const newIndex = selectedImageIndex === getAllImages(viewCar).length - 1 ? 0 : selectedImageIndex + 1;
                                  handleImageChange(newIndex, 'right');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 transform hover:scale-110"
                                disabled={isImageTransitioning}
                              >
                                <IconChevronRight className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Image Counter */}
                          {getAllImages(viewCar).length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                              {selectedImageIndex + 1} / {getAllImages(viewCar).length}
                            </div>
                          )}
                          
                          {/* Loading Indicator */}
                          {isImageTransitioning && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-black/50 text-white p-1 rounded-full">
                                <IconLoader className="h-3 w-3 animate-spin" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Thumbnail Carousel */}
                      {getAllImages(viewCar).length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {getAllImages(viewCar).map((image, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (index !== selectedImageIndex && !isImageTransitioning) {
                                  const direction = index > selectedImageIndex ? 'right' : 'left';
                                  handleImageChange(index, direction);
                                }
                              }}
                              disabled={isImageTransitioning}
                              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 transform ${
                                selectedImageIndex === index
                                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 scale-105 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105'
                              } ${
                                isImageTransitioning ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                              }`}
                            >
                              <Image
                                src={image.url}
                                alt={image.alt || `Thumbnail ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300"
                                sizes="80px"
                              />
                              {image.isPrimary && (
                                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                                  P
                                </div>
                              )}
                              {selectedImageIndex === index && (
                                <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Key Specifications - 4 Column Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {viewCar.year}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Year
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Fuel className="h-4 w-4 text-gray-500 dark:text-gray-400 mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {viewCar.fuelType}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Fuel Type
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Gauge className="h-4 w-4 text-gray-500 dark:text-gray-400 mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {viewCar.km.toLocaleString()} km
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Odometer
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Cog className="h-4 w-4 text-gray-500 dark:text-gray-400 mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {viewCar.transmission}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Transmission
                        </div>
                      </div>
                    </div>

                    {/* Basic Information - 2 Column Grid */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                        Basic Information
                      </label>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Brand
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.brand}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Model
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.carModel}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Variant
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.variant || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Body Type
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
                            {viewCar.bodyType}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Color
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.color}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Seats
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.seats} Seats
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Ownership
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.ownership} Owner(s)
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Drive Type
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
                            {viewCar.driveType}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                        Pricing Details
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Regular Price
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                            {formatPrice(viewCar.regularPrice)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Sale Price
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {formatPrice(viewCar.salePrice)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            On Road Price
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                            {formatPrice(viewCar.onRoadPrice)}
                          </div>
                        </div>
                      </div>
                      {viewCar.emiStartingFrom && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          EMI from {formatPrice(viewCar.emiStartingFrom)}/month
                        </div>
                      )}
                    </div>

                    {/* Technical Specifications */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                        Technical Specifications
                      </label>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {viewCar.engine && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Engine
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                              {viewCar.engine}
                            </div>
                          </div>
                        )}
                        {viewCar.mileage && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Mileage
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                              {viewCar.mileage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location & Registration */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                        Location & Registration
                      </label>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Registration City
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.registrationCity || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Registration State
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {viewCar.registrationState || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Insurance
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
                            {viewCar.insurance?.toLowerCase() || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Seller Type
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
                            {viewCar.sellerType?.toLowerCase() || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features - Updated for new API structure */}
                    {viewCar.features && viewCar.features.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Features
                          </label>
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-100 dark:bg-gray-800"
                          >
                            {Object.keys(viewCar.features[0]?.features || {}).length} items
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(viewCar.features[0]?.features || {}).map(([featureName, isAvailable]) => (
                            <div
                              key={featureName}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md border text-sm",
                                isAvailable
                                  ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                  : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                                  isAvailable
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                                )}
                              >
                                {isAvailable ? (
                                  <IconCheck className="h-3 w-3" />
                                ) : (
                                  <IconX className="h-3 w-3" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-sm",
                                  isAvailable
                                    ? "text-gray-900 dark:text-gray-100 font-medium"
                                    : "text-gray-500 dark:text-gray-400",
                                )}
                              >
                                {featureName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specifications - Updated for new API structure */}
                    {viewCar.specifications &&
                      viewCar.specifications.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Specifications
                            </label>
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100 dark:bg-gray-800"
                            >
                              {Object.keys(viewCar.specifications[0]?.specifications || {}).length} items
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(viewCar.specifications[0]?.specifications || {}).map(([specName, isAvailable]) => (
                              <div
                                key={specName}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-md border text-sm",
                                  isAvailable
                                    ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                    : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                                    isAvailable
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                                  )}
                                >
                                  {isAvailable ? (
                                    <IconCheck className="h-3 w-3" />
                                  ) : (
                                    <IconX className="h-3 w-3" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-sm",
                                    isAvailable
                                      ? "text-gray-900 dark:text-gray-100 font-medium"
                                      : "text-gray-500 dark:text-gray-400",
                                  )}
                                >
                                  {specName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Description */}
                    {viewCar.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
                          Description
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {viewCar.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
                      <div className="space-y-1">
                        <div className="text-gray-500 dark:text-gray-400">
                          Created:{" "}
                          {new Date(viewCar.createdAt).toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Updated:{" "}
                          {new Date(viewCar.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-gray-400 font-mono bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                        ID: {viewCar._id}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewDrawerOpen(false)}
                        className="h-10 px-5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Close
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(viewCar)}
                        className="h-10 px-5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Vehicle
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <CarIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No car data available
                      </p>
                    </div>
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
