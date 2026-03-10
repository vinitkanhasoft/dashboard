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
  IconLoader,
  IconPlus,
  IconSearch,
  IconDownload,
  IconRefresh,
  IconAlertCircle,
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
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  Tag,
  Eye,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { IconX } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchBanners,
  fetchBannersWithFilter,
  createBanner,
  updateBanner,
  deleteBanner,
  bulkDeleteBanners,
  type Banner,
  searchBanners,
} from "@/lib/redux/bannerSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Removed unused imports from @reduxjs/toolkit

// Drag Handle Component
function DragHandle({ id }: { id: string }) {
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

// Draggable Row Component
function DraggableRow({ row }: { row: Row<Banner> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });

  const isActive = row.original.isActive;

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
        ${isActive 
          ? "text-black font-semibold" 
          : "text-gray-400 opacity-70"
        }
        ${row.index > 0 ? "" : ""}
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

// Banner Cards Component
function BannerCards() {
  const { banners, statistics } = useAppSelector((s) => s.banner);

  const totalBanners = statistics?.totalBanners || banners.length;
  const activeBanners = statistics?.activeBanners || 0;
  const latestBanner =
    banners.length > 0 && banners[0]?.createdAt
      ? new Date(banners[0].createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBanners}</div>
          <p className="text-xs text-muted-foreground">
            +{Math.floor(totalBanners * 0.2)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBanners}</div>
          <p className="text-xs text-muted-foreground">
            {((activeBanners / totalBanners) * 100 || 0).toFixed(0)}% of total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Banner</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latestBanner}</div>
          <p className="text-xs text-muted-foreground">Most recent addition</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function BannerPage() {
  const dispatch = useAppDispatch();
  const { banners, loading, creating, updating } = useAppSelector(
    (s) => s.banner,
  );

  const hasFetched = React.useRef(false);

  // Table state
  const [data, setData] = React.useState<Banner[]>([]);
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

  // Search handler - calls the search API with proper params
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  
  const handleSearch = React.useCallback(
    (q: string) => {
      setGlobalFilter(q);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        if (q.trim()) {
          // Use search API when there's a search query
          dispatch(
            searchBanners({
              q,
              searchIn: "title,description",
              sortBy: "displayOrder",
              sortOrder: "asc",
              page: 1,
              limit: 10,
              ...(statusFilter !== "all" && { isActive: statusFilter === "active" }),
            }),
          );
        } else {
          // Use main banners API when no search query
          if (statusFilter !== "all") {
            dispatch(fetchBannersWithFilter({ isActive: statusFilter === "active" }));
          } else {
            dispatch(fetchBanners());
          }
        }
      }, 400);
    },
    [dispatch, statusFilter],
  );

  const handleStatusFilter = React.useCallback(
    (newStatus: "all" | "active" | "inactive") => {
      setStatusFilter(newStatus);
      
      if (globalFilter.trim()) {
        // Use search API when there's a search query
        dispatch(
          searchBanners({
            q: globalFilter,
            searchIn: "title,description",
            sortBy: "displayOrder",
            sortOrder: "asc",
            page: 1,
            limit: 10,
            ...(newStatus !== "all" && { isActive: newStatus === "active" }),
          }),
        );
      } else {
        // Use main banners API with filter when no search query
        if (newStatus !== "all") {
          dispatch(fetchBannersWithFilter({ isActive: newStatus === "active" }));
        } else {
          dispatch(fetchBanners());
        }
      }
    },
    [dispatch, globalFilter],
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<"add" | "edit">("add");
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bannerToDelete, setBannerToDelete] = React.useState<Banner | null>(
    null,
  );

  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  // Form state
  const [displayOrder, setDisplayOrder] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [altText, setAltText] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  React.useEffect(() => {
    if (!hasFetched.current && banners.length === 0) {
      hasFetched.current = true;
      dispatch(fetchBanners());
    }
  }, [dispatch, banners.length]);

  React.useEffect(() => {
    if (banners && Array.isArray(banners)) {
      setData(banners);
    }
  }, [banners]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => (data && Array.isArray(data) ? data.filter(item => item && item._id).map(({ _id }) => _id) : []),
    [data],
  );

  const handleDeleteBanner = async (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    const result = await dispatch(deleteBanner(bannerToDelete._id));
    if (deleteBanner.fulfilled.match(result)) {
      toast.success("Banner deleted successfully");
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
      // Refresh data to get updated statistics
      await dispatch(fetchBanners());
    } else {
      toast.error(result.payload ?? "Failed to delete banner");
    }
  };

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const bannerIds = selectedRows.map((row) => row.original._id);
    if (bannerIds.length === 0) return;
    setBulkDeleting(true);
    const result = await dispatch(bulkDeleteBanners(bannerIds));
    if (bulkDeleteBanners.fulfilled.match(result)) {
      toast.success(`${bannerIds.length} banner(s) deleted successfully`);
      setBulkDeleteDialogOpen(false);
      table.toggleAllRowsSelected(false);
      // Refresh data to get updated statistics
      await dispatch(fetchBanners());
    } else {
      toast.error(result.payload ?? "Failed to bulk delete banners");
    }
    setBulkDeleting(false);
  };

  const columns = React.useMemo<ColumnDef<Banner>[]>(
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
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
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
        accessorKey: "bannerImage",
        header: "Image",
        cell: ({ row }) => (
          <div className="relative h-12 w-20 overflow-hidden rounded-md border group cursor-pointer">
            <Image
              src={row.original.bannerImage}
              alt={row.original.altText}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="80px"
            />
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-transparent font-semibold"
            >
              Title
              <IconChevronDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <Button
              variant="link"
              className="text-foreground hover:text-primary w-fit px-0 text-left font-medium"
              onClick={() => handleOpenView(row.original)}
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary/70" />
                {row.original.title}
              </div>
            </Button>
          );
        },
        enableHiding: false,
        size: 300,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-75">
            <p className="truncate text-sm text-muted-foreground">
              {(() => {
                const words = row.original.description?.split(" ") || [];
                if (words.length > 20) {
                  return words.slice(0, 20).join(" ") + "...";
                }
                return row.original.description;
              })()}
            </p>
          </div>
        ),
        size: 250,
      },
      {
        accessorKey: "altText",
        header: "Alt Text",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="bg-linear-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 dark:from-purple-950/30 dark:to-pink-950/30 dark:text-purple-400 dark:border-purple-800 px-3 py-1 text-xs font-medium rounded-full shadow-sm"
          >
            <Tag className="w-3 h-3 mr-1 inline-block" />
            {row.original.altText}
          </Badge>
        ),
        size: 150,
      },
      // isActive field with interactive switch
      {
        accessorKey: "isActive",
        header: () => (
          <div className="w-full text-center font-semibold">Active</div>
        ),
        cell: ({ row }) => {
          const isActive = !!row.original.isActive;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [loading, setLoading] = React.useState(false);
          const handleToggle = async () => {
            setLoading(true);
            const newIsActive = !isActive;
            // Optimistically update local data immediately
            setData((prev) =>
              prev.map((b) =>
                b._id === row.original._id
                  ? { ...b, isActive: newIsActive }
                  : b,
              ),
            );
            const formData = new FormData();
            formData.append("isActive", newIsActive.toString());
            formData.append("title", row.original.title);
            formData.append("description", row.original.description);
            formData.append("altText", row.original.altText);
            formData.append(
              "displayOrder",
              String(row.original.displayOrder ?? ""),
            );
            const result = await dispatch(
              updateBanner({ id: row.original._id, formData }),
            );
            setLoading(false);
            if (updateBanner.fulfilled.match(result)) {
              toast.success(
                `Banner ${newIsActive ? "activated" : "deactivated"}`,
              );
              // Refresh data to get updated statistics
              await dispatch(fetchBanners());
            } else {
              // Revert on failure
              setData((prev) =>
                prev.map((b) =>
                  b._id === row.original._id ? { ...b, isActive } : b,
                ),
              );
              toast.error(result.payload ?? "Failed to update status");
            }
          };
          return (
            <div className="flex justify-center">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={loading}
                aria-label={isActive ? "Deactivate banner" : "Activate banner"}
              />
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "displayOrder",
        header: () => (
          <div className="w-full text-center font-semibold">Order</div>
        ),
        cell: ({ row }) => {
          const order = row.original.displayOrder;
          return (
            <div className="relative group text-center">
              <Badge variant="outline" className="px-3 py-1">
                #{order || "—"}
              </Badge>
            </div>
          );
        },
        size: 80,
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
        size: 120,
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
                  className="cursor-pointer gap-2"
                  onClick={() => handleOpenView(row.original)}
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => handleOpenEdit(row.original)}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                onClick={() => handleDeleteBanner(row.original)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [dispatch],
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
      toast.success("Banners reordered successfully", {
        icon: <IconCheck className="h-4 w-4" />,
      });
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchBanners());
    setIsRefreshing(false);
    toast.success("Banners refreshed successfully");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Banners Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    const rows = table.getFilteredRowModel().rows;
    const tableData = rows.map((row) => {
      const banner = row.original;
      return [
        banner.title || "",
        banner.description || "",
        banner.altText || "",
        banner.displayOrder?.toString() || "",
        banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "",
      ];
    });

    autoTable(doc, {
      head: [["Title", "Description", "Alt Text", "Order", "Created"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("banners-report.pdf");
    toast.success("PDF downloaded successfully");
  };

  const resetForm = () => {
    setDisplayOrder("");
    setTitle("");
    setDescription("");
    setAltText("");
    setImageFile(null);
    setImagePreview(null);
    setEditingBanner(null);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenAdd = () => {
    resetForm();
    setDrawerMode("add");
    setDrawerOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setDrawerMode("edit");
    setEditingBanner(banner);
    setDisplayOrder(String(banner.displayOrder ?? ""));
    setTitle(banner.title);
    setDescription(banner.description);
    setAltText(banner.altText);
    setImagePreview(banner.bannerImage);
    setImageFile(null);
    setDrawerOpen(true);
  };

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [viewBanner, setViewBanner] = React.useState<Banner | null>(null);

  const handleOpenView = (banner: Banner) => {
    setViewBanner(banner);
    setViewDialogOpen(true);
  };

  const processFile = React.useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (!altText.trim()) {
      toast.error("Alt text is required.");
      return;
    }

    const formData = new FormData();
    if (displayOrder.trim()) {
      formData.append("displayOrder", displayOrder.trim());
    }
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("altText", altText.trim());

    if (drawerMode === "add") {
      if (!imageFile) {
        toast.error("Please select a banner image.");
        return;
      }
      formData.append("bannerImage", imageFile);

      const result = await dispatch(createBanner(formData));
      if (createBanner.fulfilled.match(result)) {
        toast.success("Banner created successfully!");
        setDrawerOpen(false);
        resetForm();
        // Refresh data to get updated statistics
        await dispatch(fetchBanners());
      } else {
        toast.error(result.payload ?? "Failed to create banner.");
      }
    } else if (editingBanner) {
      if (imageFile) {
        formData.append("bannerImage", imageFile);
      }
      const result = await dispatch(
        updateBanner({ id: editingBanner._id, formData }),
      );
      if (updateBanner.fulfilled.match(result)) {
        toast.success("Banner updated successfully!");
        setDrawerOpen(false);
        resetForm();
        // Refresh data to get updated statistics
        await dispatch(fetchBanners());
      } else {
        toast.error(result.payload ?? "Failed to update banner.");
      }
    }
  };

  // Don't render until after hydration to prevent mismatch
  if (!mounted) {
    return null;
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

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
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Banner Stats Cards */}
                <div className="px-4 lg:px-6">
                  <BannerCards />
                </div>

                {/* Banner Table Section */}
                <div className="px-4 lg:px-6">
                  <TooltipProvider>
                    <div className="w-full flex flex-col gap-4">
                      {/* Table Toolbar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="relative flex-1 max-w-md">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search banners..."
                              value={globalFilter ?? ""}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"
                            />
                          </div>

                          <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="h-9 w-32 bg-muted/50 border-muted focus:bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
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
                                <span className="hidden lg:inline">
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
                                      {column.id === "drag"
                                        ? "Drag Handle"
                                        : column.id === "bannerImage"
                                          ? "Image"
                                          : column.id === "displayOrder"
                                            ? "Order"
                                            : column.id === "createdAt"
                                              ? "Created"
                                              : column.id
                                                  .replace(/([A-Z])/g, " $1")
                                                  .trim()}
                                    </DropdownMenuCheckboxItem>
                                  );
                                })}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="default"
                            size="sm"
                            className="h-9 gap-2 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
                            onClick={handleOpenAdd}
                          >
                            <IconPlus className="size-3.5" />
                            <span className="hidden lg:inline">Add Banner</span>
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
                                className="h-9 w-9"
                                onClick={handleDownloadPDF}
                              >
                                <IconDownload className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Table Content */}
                      {loading ? (
                        <div className="rounded-xl border bg-card shadow-lg">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">
                                <TableRow className="hover:bg-transparent">
                                  <TableHead
                                    style={{ width: 40 }}
                                    className="h-11"
                                  />
                                  <TableHead
                                    style={{ width: 40 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-4 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 100 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-12 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 300 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-10 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 250 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-20 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 150 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-14 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 80 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-10 rounded mx-auto" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 80 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-10 rounded mx-auto" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 120 }}
                                    className="h-11"
                                  >
                                    <Skeleton className="h-4 w-14 rounded" />
                                  </TableHead>
                                  <TableHead
                                    style={{ width: 50 }}
                                    className="h-11"
                                  />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[...Array(pagination.pageSize)].map((_, i) => (
                                  <TableRow
                                    key={i}
                                    className={
                                      i % 2 === 0
                                        ? "bg-white dark:bg-gray-900/50"
                                        : "bg-gray-50/30 dark:bg-gray-800/30"
                                    }
                                  >
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 40 }}
                                    >
                                      <Skeleton className="h-4 w-4 rounded" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 40 }}
                                    >
                                      <Skeleton className="h-4 w-4 rounded" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 100 }}
                                    >
                                      <Skeleton className="h-12 w-20 rounded-md" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 300 }}
                                    >
                                      <Skeleton className="h-5 w-40 rounded" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 250 }}
                                    >
                                      <Skeleton className="h-4 w-full rounded" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 150 }}
                                    >
                                      <Skeleton className="h-6 w-24 rounded-full" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 80 }}
                                    >
                                      <Skeleton className="h-5 w-10 rounded-full mx-auto" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 80 }}
                                    >
                                      <Skeleton className="h-6 w-10 rounded mx-auto" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 120 }}
                                    >
                                      <Skeleton className="h-4 w-20 rounded" />
                                    </TableCell>
                                    <TableCell
                                      className="py-3"
                                      style={{ width: 50 }}
                                    >
                                      <Skeleton className="h-6 w-6 rounded" />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            No banners found. Add your first banner.
                          </p>
                          <Button onClick={handleOpenAdd} className="mt-4">
                            <IconPlus className="mr-2 h-4 w-4" />
                            Add Banner
                          </Button>
                        </div>
                      ) : (
                        <>
                          {selectedCount > 0 && (
                            <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="default"
                                  className="bg-primary text-primary-foreground"
                                >
                                  {selectedCount} selected
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {selectedCount} of {totalCount} rows selected
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 gap-1.5"
                                  onClick={handleBulkDelete}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

                          {/* Table */}
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
                                  <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">
                                    {table
                                      .getHeaderGroups()
                                      .map((headerGroup) => (
                                        <TableRow
                                          key={headerGroup.id}
                                          className="hover:bg-transparent"
                                        >
                                          {headerGroup.headers.map((header) => {
                                            return (
                                              <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                  width: header.getSize(),
                                                }}
                                                className="h-11 font-semibold text-foreground/80"
                                              >
                                                {header.isPlaceholder
                                                  ? null
                                                  : flexRender(
                                                      header.column.columnDef
                                                        .header,
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
                                          <DraggableRow
                                            key={row.id}
                                            row={row}
                                          />
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
                                            <p className="text-muted-foreground">
                                              No results found.
                                            </p>
                                            <Button
                                              variant="link"
                                              className="text-primary"
                                              onClick={() =>
                                                setGlobalFilter("")
                                              }
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
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Total: <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> items
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
                                disabled={!table.getCanPreviousPage()}
                              >
                                <span className="sr-only">First page</span>
                                <IconChevronsLeft className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                              >
                                <span className="sr-only">Previous page</span>
                                <IconChevronLeft className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                              >
                                <span className="sr-only">Next page</span>
                                <IconChevronRight className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
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
            </div>
          </div>

          {/* Add/Edit Drawer */}
          <Drawer
            direction="right"
            open={drawerOpen}
            onOpenChange={(open) => {
              setDrawerOpen(open);
              if (!open) resetForm();
            }}
          >
            <DrawerContent className="h-full w-full sm:max-w-lg">
              <DrawerHeader className="border-b px-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DrawerTitle className="text-lg">
                      {drawerMode === "add" ? "Add New Banner" : "Edit Banner"}
                    </DrawerTitle>
                    <DrawerDescription className="text-xs">
                      {drawerMode === "add"
                        ? "Fill in the details to create a new banner."
                        : "Update the banner information below."}
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  {/* Banner Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Banner Image <span className="text-destructive">*</span>
                    </Label>
                    {imagePreview ? (
                      <div className="group relative overflow-hidden rounded-xl border-2 border-border shadow-sm">
                        <div className="relative aspect-video w-full">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="500px"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-xs"
                          >
                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                            Replace
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemoveImage}
                            className="h-8 text-xs"
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                        {imageFile && (
                          <div className="absolute bottom-2 left-2">
                            <Badge
                              variant="secondary"
                              className="bg-background/80 text-xs backdrop-blur-sm"
                            >
                              {imageFile.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            fileInputRef.current?.click();
                        }}
                        className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
                          isDragOver
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                            isDragOver
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {isDragOver ? (
                              <span className="text-primary">
                                Drop image here
                              </span>
                            ) : (
                              <>
                                Drag & drop or{" "}
                                <span className="text-primary underline underline-offset-2">
                                  browse
                                </span>
                              </>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 5 MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <Separator />

                  {/* Display Order */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="banner-order"
                      className="text-sm font-semibold"
                    >
                      Display Order
                    </Label>
                    <Input
                      id="banner-order"
                      type="number"
                      min={1}
                      placeholder="e.g. 1, 2, 3..."
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower numbers display first.
                    </p>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="banner-title"
                      className="text-sm font-semibold"
                    >
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="banner-title"
                      placeholder="Enter banner title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="banner-description"
                      className="text-sm font-semibold"
                    >
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="banner-description"
                      placeholder="Enter banner description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Alt Text */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="banner-alt"
                      className="text-sm font-semibold"
                    >
                      Alt Text <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="banner-alt"
                      placeholder="Describe the image for accessibility..."
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for SEO and screen readers.
                    </p>
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t px-6 pt-4">
                <div className="flex gap-3">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1 h-10">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button
                    onClick={handleSubmit}
                    disabled={creating || updating}
                    className="flex-1 h-10"
                  >
                    {creating || updating ? (
                      <>
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                        {drawerMode === "add" ? "Creating..." : "Updating..."}
                      </>
                    ) : drawerMode === "add" ? (
                      <>
                        <IconPlus className="mr-2 h-4 w-4" />
                        Create Banner
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-2 h-4 w-4" />
                        Update Banner
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  banner &quot;{bannerToDelete?.title}&quot; and remove it from
                  the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  // disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {/* {deleting ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )} */}
                  delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bulk Delete Confirmation Dialog */}
          <AlertDialog
            open={bulkDeleteDialogOpen}
            onOpenChange={setBulkDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {table.getFilteredSelectedRowModel().rows.length}{" "}
                  banner(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected {table.getFilteredSelectedRowModel().rows.length}{" "}
                  banner(s) and remove them from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={bulkDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmBulkDelete}
                  disabled={bulkDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {bulkDeleting ? "Deleting..." : "Delete All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* View Banner Dialog */}
          <Sheet open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <SheetContent className="w-full sm:max-w-2xl p-0 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
              {/* Hidden accessibility elements */}
              <SheetTitle className="sr-only">Banner Details</SheetTitle>
              <SheetDescription className="sr-only">
                Complete banner information
              </SheetDescription>

              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Banner Details
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {viewBanner?._id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewDialogOpen(false)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewBanner ? (
                <div className="p-6 space-y-8">
                  {/* Banner Image - LARGE DISPLAY */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Banner Image</span>
                      <span className="text-gray-400">Primary Banner</span>
                    </label>

                    {/* Large Image Container - Full width with good height */}
                    <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg group">
                      <Image
                        src={viewBanner.bannerImage}
                        alt={viewBanner.altText}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 640px) 100vw, 700px"
                        priority
                      />
                      {/* Image overlay with dimensions */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        Auto × Auto
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Bar - With thumbnail preview */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <Image
                          src={viewBanner.bannerImage}
                          alt={viewBanner.altText}
                          fill
                          className="object-cover rounded-md border border-gray-200 dark:border-gray-700"
                          sizes="80px"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {viewBanner.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 px-3 py-1"
                          >
                            Order: {viewBanner.displayOrder}
                          </Badge>
                          {viewBanner.isActive ? (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 px-3 py-1">
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 px-3 py-1"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner Information Grid */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">
                      Banner Information
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="col-span-2 sm:col-span-1 space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Title
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800">
                          {viewBanner.title}
                        </div>
                      </div>

                      {/* Display Order */}
                      <div className="col-span-2 sm:col-span-1 space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Display Order
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800">
                          {viewBanner.displayOrder}
                        </div>
                      </div>

                      {/* Alt Text - Full Width */}
                      <div className="col-span-2 space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Alt Text
                        </div>
                        <div className="text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800">
                          {viewBanner.altText || "No alt text provided"}
                        </div>
                      </div>

                      {/* Description - Full Width with larger height */}
                      <div className="col-span-2 space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Description
                        </div>
                        <div className="text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 min-h-[120px] whitespace-pre-wrap">
                          {viewBanner.description || "No description provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="space-y-1.5">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(viewBanner.createdAt).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                      {viewBanner.updatedAt &&
                        viewBanner.updatedAt !== viewBanner.createdAt && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Updated:</span>{" "}
                            {new Date(viewBanner.updatedAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800">
                      ID: {viewBanner._id}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setViewDialogOpen(false)}
                      className="h-11 px-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleOpenEdit(viewBanner);
                      }}
                      className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Banner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No banner data available
                    </p>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
