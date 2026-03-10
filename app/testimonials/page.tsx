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

  IconCheck,

  IconStar,

  IconStarFilled,

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Copy, Pencil, Trash2, Calendar, Eye, Upload, X, MessageSquare, ShieldCheck, Star, MapPin, Car } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchTestimonials,

  createTestimonial,

  updateTestimonial,

  deleteTestimonial,

  bulkDeleteTestimonials,

  approveTestimonial,

  searchTestimonials,

  type Testimonial,

} from "@/lib/redux/testimonialSlice";

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

function DraggableRow({ row }: { row: Row<Testimonial> }) {

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



// ─── Star Rating Display ──────────────────────────────────

function StarRating({ rating }: { rating: number }) {

  return (

    <div className="flex items-center gap-0.5">

      {[1, 2, 3, 4, 5].map((star) =>

        star <= rating ? (

          <IconStarFilled key={star} className="size-4 text-yellow-500" />

        ) : (

          <IconStar key={star} className="size-4 text-muted-foreground/40" />

        )

      )}

    </div>

  );

}



// ─── Stats Cards ──────────────────────────────────────────

function TestimonialCards() {

  const { testimonials } = useAppSelector((s) => s.testimonial);



  const total = testimonials.length;

  const approved = testimonials.filter((t) => t.isApproved).length;

  const featured = testimonials.filter((t) => t.isFeatured).length;

  const avgRating =

    total > 0

      ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / total).toFixed(1)

      : "0.0";



  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>

          <MessageSquare className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{total}</div>

          <p className="text-xs text-muted-foreground">All testimonials</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Approved</CardTitle>

          <ShieldCheck className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{approved}</div>

          <p className="text-xs text-muted-foreground">

            {total > 0 ? ((approved / total) * 100).toFixed(0) : 0}% of total

          </p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Featured</CardTitle>

          <Star className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{featured}</div>

          <p className="text-xs text-muted-foreground">Highlighted reviews</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>

          <Star className="h-4 w-4 text-yellow-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{avgRating}</div>

          <p className="text-xs text-muted-foreground">Out of 5 stars</p>

        </CardContent>

      </Card>

    </div>

  );

}



// ─── User Type Badge ──────────────────────────────────────

function getUserTypeBadge(userType: string) {

  switch (userType?.toLowerCase()) {

    case "buyer":

      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">Buyer</Badge>;

    case "seller":

      return <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">Seller</Badge>;

    case "dealer":

      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400">Dealer</Badge>;

    default:

      return <Badge variant="outline">{userType}</Badge>;

  }

}



// ─── Main Page ────────────────────────────────────────────

export default function TestimonialsPage() {

  const dispatch = useAppDispatch();

  const { testimonials, loading, creating, updating } = useAppSelector(

    (s) => s.testimonial

  );



  const hasFetched = React.useRef(false);



  // Table state

  const [data, setData] = React.useState<Testimonial[]>([]);

  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] = React.useState({

    pageIndex: 0,

    pageSize: 10,

  });

  const [globalFilter, setGlobalFilter] = React.useState("");

  const [mounted, setMounted] = React.useState(false);

  const [isRefreshing, setIsRefreshing] = React.useState(false);



  // Search handler

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearch = React.useCallback(

    (q: string) => {

      setGlobalFilter(q);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(() => {

        if (q.trim()) {

          dispatch(

            searchTestimonials({

              search: q,

              sortBy: "createdAt",

              sortOrder: "desc",

              page: 1,

              limit: 50,

            })

          );

        } else {

          dispatch(fetchTestimonials());

        }

      }, 400);

    },

    [dispatch]

  );



  // Drawer state

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [drawerMode, setDrawerMode] = React.useState<"add" | "edit">("add");

  const [editingTestimonial, setEditingTestimonial] = React.useState<Testimonial | null>(null);



  // Delete dialog state

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [testimonialToDelete, setTestimonialToDelete] = React.useState<Testimonial | null>(null);



  // Bulk delete dialog state

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  const [bulkDeleting, setBulkDeleting] = React.useState(false);



  // View dialog state

  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);

  const [viewTestimonial, setViewTestimonial] = React.useState<Testimonial | null>(null);



  // Form state

  const [userName, setUserName] = React.useState("");

  const [userType, setUserType] = React.useState("buyer");

  const [location, setLocation] = React.useState("");

  const [description, setDescription] = React.useState("");

  const [rating, setRating] = React.useState("5");

  const [carName, setCarName] = React.useState("");

  const [isApproved, setIsApproved] = React.useState(false);

  const [isFeatured, setIsFeatured] = React.useState(false);

  const [isVisible, setIsVisible] = React.useState(true);

  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [isDragOver, setIsDragOver] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);



  const sortableId = React.useId();



  const sensors = useSensors(

    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),

    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),

    useSensor(KeyboardSensor, {})

  );



  React.useEffect(() => {

    if (!hasFetched.current && testimonials.length === 0) {

      hasFetched.current = true;

      dispatch(fetchTestimonials());

    }

  }, [dispatch, testimonials.length]);



  React.useEffect(() => {

    if (testimonials) setData(testimonials.filter((t) => t && t._id));

  }, [testimonials]);



  React.useEffect(() => {

    setMounted(true);

  }, []);



  const dataIds = React.useMemo<UniqueIdentifier[]>(

    () => data?.map(({ _id }) => _id) || [],

    [data]

  );



  // ─── Handlers ──────────────────────────────────────────

  const handleDeleteTestimonial = (testimonial: Testimonial) => {

    setTestimonialToDelete(testimonial);

    setDeleteDialogOpen(true);

  };



  const confirmDelete = async () => {

    if (!testimonialToDelete) return;

    const result = await dispatch(deleteTestimonial(testimonialToDelete._id));

    if (deleteTestimonial.fulfilled.match(result)) {

      toast.success("Testimonial deleted successfully");

      setDeleteDialogOpen(false);

      setTestimonialToDelete(null);

    } else {

      toast.error(result.payload ?? "Failed to delete testimonial");

    }

  };



  const handleBulkDelete = () => {

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    if (selectedRows.length === 0) return;

    setBulkDeleteDialogOpen(true);

  };



  const confirmBulkDelete = async () => {

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) return;

    setBulkDeleting(true);

    const result = await dispatch(bulkDeleteTestimonials(ids));

    if (bulkDeleteTestimonials.fulfilled.match(result)) {

      toast.success(`${ids.length} testimonial(s) deleted successfully`);

      setBulkDeleteDialogOpen(false);

      table.toggleAllRowsSelected(false);

    } else {

      toast.error(result.payload ?? "Failed to bulk delete testimonials");

    }

    setBulkDeleting(false);

  };



  const handleApprove = async (testimonial: Testimonial) => {

    const result = await dispatch(approveTestimonial(testimonial._id));

    if (approveTestimonial.fulfilled.match(result)) {

      toast.success("Testimonial approved successfully");

    } else {

      toast.error(result.payload ?? "Failed to approve testimonial");

    }

  };



  // ─── Columns ───────────────────────────────────────────

  const columns = React.useMemo<ColumnDef<Testimonial>[]>(

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

        accessorKey: "userProfileImage",

        header: "Photo",

        cell: ({ row }) => (

          <div className="relative h-10 w-10 overflow-hidden rounded-full border group cursor-pointer">

            {row.original.userProfileImage?.url ? (

              <Image

                src={row.original.userProfileImage.url}

                alt={row.original.userName}

                fill

                className="object-cover transition-transform duration-300 group-hover:scale-110"

                sizes="40px"

              />

            ) : (

              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm font-medium">

                {row.original.userName?.charAt(0)?.toUpperCase() || "?"}

              </div>

            )}

          </div>

        ),

        size: 60,

      },

      {

        accessorKey: "userName",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            User Name

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => (

          <Button

            variant="link"

            className="text-foreground hover:text-primary w-fit px-0 text-left font-medium"

            onClick={() => handleOpenView(row.original)}

          >

            <div className="flex items-center gap-2">

              <MessageSquare className="size-4 text-primary/70" />

              {row.original.userName}

            </div>

          </Button>

        ),

        enableHiding: false,

        size: 180,

      },

      {

        accessorKey: "userType",

        header: "Type",

        cell: ({ row }) => getUserTypeBadge(row.original.userType),

        size: 100,

      },

      {

        accessorKey: "rating",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            Rating

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => <StarRating rating={row.original.rating} />,

        size: 130,

      },

      {

        accessorKey: "description",

        header: "Review",

        cell: ({ row }) => (

          <div className="max-w-60">

            <p className="truncate text-sm text-muted-foreground">

              {(() => {

                const words = row.original.description?.split(" ") || [];

                if (words.length > 15) return words.slice(0, 15).join(" ") + "...";

                return row.original.description;

              })()}

            </p>

          </div>

        ),

        size: 250,

      },

      {

        accessorKey: "carName",

        header: "Car",

        cell: ({ row }) =>

          row.original.carName ? (

            <div className="flex items-center gap-1.5">

              <Car className="size-3.5 text-muted-foreground" />

              <span className="text-sm">{row.original.carName}</span>

            </div>

          ) : (

            <span className="text-sm text-muted-foreground">—</span>

          ),

        size: 160,

      },

      {

        accessorKey: "location",

        header: "Location",

        cell: ({ row }) =>

          row.original.location ? (

            <div className="flex items-center gap-1.5">

              <MapPin className="size-3.5 text-muted-foreground" />

              <span className="text-sm truncate max-w-32">{row.original.location}</span>

            </div>

          ) : (

            <span className="text-sm text-muted-foreground">—</span>

          ),

        size: 160,

      },

      {

        accessorKey: "isApproved",

        header: () => <div className="w-full text-center font-semibold">Approved</div>,

        cell: ({ row }) => {

          const approved = !!row.original.isApproved;

          return (

            <div className="flex justify-center">

              {approved ? (

                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">

                  Approved

                </Badge>

              ) : (

                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400">

                  Pending

                </Badge>

              )}

            </div>

          );

        },

        size: 100,

      },

      {

        accessorKey: "isFeatured",

        header: () => <div className="w-full text-center font-semibold">Featured</div>,

        cell: ({ row }) => {

          const featured = !!row.original.isFeatured;

          // eslint-disable-next-line react-hooks/rules-of-hooks

          const [toggling, setToggling] = React.useState(false);

          const handleToggle = async () => {

            setToggling(true);

            const newVal = !featured;

            setData((prev) =>

              prev.map((t) => (t._id === row.original._id ? { ...t, isFeatured: newVal } : t))

            );

            const formData = new FormData();

            formData.append("userName", row.original.userName);

            formData.append("userType", row.original.userType);

            formData.append("description", row.original.description);

            formData.append("rating", String(row.original.rating));

            formData.append("isFeatured", String(newVal));

            const result = await dispatch(

              updateTestimonial({ id: row.original._id, formData })

            );

            setToggling(false);

            if (updateTestimonial.fulfilled.match(result)) {

              toast.success(`Testimonial ${newVal ? "featured" : "unfeatured"}`);

            } else {

              setData((prev) =>

                prev.map((t) =>

                  t._id === row.original._id ? { ...t, isFeatured: featured } : t

                )

              );

              toast.error(result.payload ?? "Failed to update");

            }

          };

          return (

            <div className="flex justify-center">

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

              <DropdownMenuLabel>Actions for {row.original.userName}</DropdownMenuLabel>

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

                {!row.original.isApproved && (

                  <DropdownMenuItem

                    className="cursor-pointer gap-2"

                    onClick={() => handleApprove(row.original)}

                  >

                    <ShieldCheck className="h-4 w-4" />

                    <span>Approve</span>

                  </DropdownMenuItem>

                )}

                <DropdownMenuItem className="cursor-pointer gap-2">

                  <Copy className="h-4 w-4" />

                  <span>Duplicate</span>

                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>

                </DropdownMenuItem>

              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                variant="destructive"

                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"

                onClick={() => handleDeleteTestimonial(row.original)}

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

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [dispatch]

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

      setData((d) => {

        const oldIndex = dataIds.indexOf(active.id);

        const newIndex = dataIds.indexOf(over.id);

        return arrayMove(d, oldIndex, newIndex);

      });

      toast.success("Testimonials reordered successfully", {

        icon: <IconCheck className="h-4 w-4" />,

      });

    }

  }



  const handleRefresh = async () => {

    setIsRefreshing(true);

    await dispatch(fetchTestimonials());

    setIsRefreshing(false);

    toast.success("Testimonials refreshed successfully");

  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);

    doc.text("Testimonials Report", 14, 18);

    doc.setFontSize(10);

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);



    const rows = table.getFilteredRowModel().rows;

    const tableData = rows.map((row) => {

      const t = row.original;

      return [

        t.userName || "",

        t.userType || "",

        `${t.rating}/5`,

        t.description?.substring(0, 80) || "",

        t.carName || "",

        t.location || "",

        t.isApproved ? "Yes" : "No",

        t.isFeatured ? "Yes" : "No",

        t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",

      ];

    });



    autoTable(doc, {

      head: [["User", "Type", "Rating", "Review", "Car", "Location", "Approved", "Featured", "Created"]],

      body: tableData,

      startY: 30,

      styles: { fontSize: 7 },

      headStyles: { fillColor: [41, 128, 185] },

    });



    doc.save("testimonials-report.pdf");

    toast.success("PDF downloaded successfully");

  };



  const resetForm = () => {

    setUserName("");

    setUserType("buyer");

    setLocation("");

    setDescription("");

    setRating("5");

    setCarName("");

    setIsApproved(false);

    setIsFeatured(false);

    setIsVisible(true);

    setImageFile(null);

    setImagePreview(null);

    setEditingTestimonial(null);

    setIsDragOver(false);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };



  const handleOpenAdd = () => {

    resetForm();

    setDrawerMode("add");

    setDrawerOpen(true);

  };



  const handleOpenEdit = (testimonial: Testimonial) => {

    setDrawerMode("edit");

    setEditingTestimonial(testimonial);

    setUserName(testimonial.userName);

    setUserType(testimonial.userType);

    setLocation(testimonial.location || "");

    setDescription(testimonial.description);

    setRating(String(testimonial.rating));

    setCarName(testimonial.carName || "");

    setIsApproved(testimonial.isApproved);

    setIsFeatured(testimonial.isFeatured);

    setIsVisible(testimonial.isVisible);

    setImagePreview(testimonial.userProfileImage?.url || null);

    setImageFile(null);

    setDrawerOpen(true);

  };



  const handleOpenView = (testimonial: Testimonial) => {

    setViewTestimonial(testimonial);

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

    [processFile]

  );



  const handleSubmit = async () => {

    if (!userName.trim()) {

      toast.error("User name is required.");

      return;

    }

    if (!description.trim()) {

      toast.error("Description is required.");

      return;

    }



    const formData = new FormData();

    formData.append("userName", userName.trim());

    formData.append("userType", userType);

    if (location.trim()) formData.append("location", location.trim());

    formData.append("description", description.trim());

    formData.append("rating", rating);

    if (carName.trim()) formData.append("carName", carName.trim());

    formData.append("isApproved", String(isApproved));

    formData.append("isFeatured", String(isFeatured));

    formData.append("isVisible", String(isVisible));



    if (drawerMode === "add") {

      if (imageFile) formData.append("profileImage", imageFile);

      const result = await dispatch(createTestimonial(formData));

      if (createTestimonial.fulfilled.match(result)) {

        toast.success("Testimonial created successfully!");

        setDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to create testimonial.");

      }

    } else if (editingTestimonial) {

      if (imageFile) formData.append("profileImage", imageFile);

      const result = await dispatch(

        updateTestimonial({ id: editingTestimonial._id, formData })

      );

      if (updateTestimonial.fulfilled.match(result)) {

        toast.success("Testimonial updated successfully!");

        setDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to update testimonial.");

      }

    }

  };



  if (!mounted) return null;



  const selectedCount = table.getFilteredSelectedRowModel().rows.length;



  return (

    <SidebarProvider>

      <AppSidebar variant="inset" />

      <SidebarInset>

        <SiteHeader />

        <div className="flex flex-1 flex-col overflow-hidden">

          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>

                  <p className="text-muted-foreground">

                    Manage customer testimonials and reviews

                  </p>

                </div>

              </div>



              <TestimonialCards />



              <TooltipProvider>

                <div className="w-full flex flex-col gap-4">

                  {/* Table Toolbar */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 flex-1">

                      <div className="relative flex-1 max-w-md">

                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input

                          placeholder="Search testimonials..."

                          value={globalFilter ?? ""}

                          onChange={(e) => handleSearch(e.target.value)}

                          className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"

                        />

                      </div>



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

                        <DropdownMenuContent align="start" className="w-56">

                          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>

                          <DropdownMenuSeparator />

                          {table

                            .getAllColumns()

                            .filter(

                              (column) =>

                                typeof column.accessorFn !== "undefined" &&

                                column.getCanHide()

                            )

                            .map((column) => (

                              <DropdownMenuCheckboxItem

                                key={column.id}

                                className="capitalize cursor-pointer"

                                checked={column.getIsVisible()}

                                onCheckedChange={(value) =>

                                  column.toggleVisibility(!!value)

                                }

                              >

                                {column.id === "userProfileImage"

                                  ? "Photo"

                                  : column.id === "userName"

                                    ? "User Name"

                                    : column.id === "userType"

                                      ? "Type"

                                      : column.id === "isApproved"

                                        ? "Approved"

                                        : column.id === "isFeatured"

                                          ? "Featured"

                                          : column.id === "createdAt"

                                            ? "Created"

                                            : column.id === "carName"

                                              ? "Car"

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

                        className="h-9 gap-2 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"

                        onClick={handleOpenAdd}

                      >

                        <IconPlus className="size-3.5" />

                        <span className="hidden lg:inline">Add Testimonial</span>

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



                  {/* Bulk delete bar */}

                  {selectedCount > 0 && (

                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">

                      <span className="text-sm font-medium">

                        {selectedCount} testimonial(s) selected

                      </span>

                      <div className="flex items-center gap-2">

                        <Button

                          variant="outline"

                          size="sm"

                          onClick={() => table.toggleAllRowsSelected(false)}

                        >

                          Clear selection

                        </Button>

                        <Button

                          size="sm"

                          className="bg-black text-white hover:bg-black/90"

                          onClick={handleBulkDelete}

                        >

                          <Trash2 className="mr-2 h-4 w-4" />

                          Delete ({selectedCount})

                        </Button>

                      </div>

                    </div>

                  )}



                  {/* Table Content */}

                  {loading ? (

                    <div className="rounded-xl border bg-card shadow-lg">

                      <div className="overflow-x-auto">

                        <Table>

                          <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40">

                            <TableRow className="hover:bg-transparent">

                              {[40, 40, 60, 180, 100, 130, 250, 160, 160, 100, 90, 120, 50].map(

                                (w, i) => (

                                  <TableHead key={i} style={{ width: w }} className="h-11">

                                    <Skeleton className="h-4 w-12 rounded" />

                                  </TableHead>

                                )

                              )}

                            </TableRow>

                          </TableHeader>

                          <TableBody>

                            {Array.from({ length: 5 }).map((_, i) => (

                              <TableRow key={i}>

                                {[40, 40, 60, 180, 100, 130, 250, 160, 160, 100, 90, 120, 50].map(

                                  (w, j) => (

                                    <TableCell key={j} style={{ width: w }}>

                                      <Skeleton className="h-4 w-full rounded" />

                                    </TableCell>

                                  )

                                )}

                              </TableRow>

                            ))}

                          </TableBody>

                        </Table>

                      </div>

                    </div>

                  ) : data.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-16 text-center">

                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />

                      <h3 className="text-lg font-semibold">No testimonials found</h3>

                      <p className="text-muted-foreground mt-1">

                        Get started by adding your first testimonial.

                      </p>

                      <Button className="mt-4" onClick={handleOpenAdd}>

                        <IconPlus className="mr-2 h-4 w-4" />

                        Add Testimonial

                      </Button>

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

                            <TableHeader className="bg-gradient-to-r from-muted/80 to-muted/40 sticky top-0 z-10">

                              {table.getHeaderGroups().map((headerGroup) => (

                                <TableRow key={headerGroup.id} className="hover:bg-transparent">

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

                          of {table.getFilteredRowModel().rows.length} items

                          {selectedCount > 0 && (

                            <span className="ml-2">({selectedCount} selected)</span>

                          )}

                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

                          <div className="flex items-center gap-2">

                            <Label htmlFor="rows-per-page" className="text-sm whitespace-nowrap">

                              Rows per page

                            </Label>

                            <Select

                              value={`${table.getState().pagination.pageSize}`}

                              onValueChange={(value) => {

                                table.setPageSize(Number(value));

                              }}

                            >

                              <SelectTrigger size="sm" className="w-18 h-8" id="rows-per-page">

                                <SelectValue placeholder={table.getState().pagination.pageSize} />

                              </SelectTrigger>

                              <SelectContent side="top">

                                {[10, 20, 30, 50, 100].map((pageSize) => (

                                  <SelectItem key={pageSize} value={`${pageSize}`}>

                                    {pageSize}

                                  </SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="flex items-center gap-2">

                            <span className="text-sm whitespace-nowrap">

                              Page {table.getState().pagination.pageIndex + 1} of{" "}

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

                                <IconChevronsLeft className="h-4 w-4" />

                              </Button>

                              <Button

                                variant="outline"

                                size="icon"

                                className="h-8 w-8"

                                onClick={() => table.previousPage()}

                                disabled={!table.getCanPreviousPage()}

                              >

                                <IconChevronLeft className="h-4 w-4" />

                              </Button>

                              <Button

                                variant="outline"

                                size="icon"

                                className="h-8 w-8"

                                onClick={() => table.nextPage()}

                                disabled={!table.getCanNextPage()}

                              >

                                <IconChevronRight className="h-4 w-4" />

                              </Button>

                              <Button

                                variant="outline"

                                size="icon"

                                className="h-8 w-8"

                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}

                                disabled={!table.getCanNextPage()}

                              >

                                <IconChevronsRight className="h-4 w-4" />

                              </Button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </TooltipProvider>

            </div>

          </div>

        </div>



        {/* Add/Edit Drawer */}

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-[520px] rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>

                {drawerMode === "add" ? "Add Testimonial" : "Edit Testimonial"}

              </DrawerTitle>

              <DrawerDescription>

                {drawerMode === "add"

                  ? "Add a new customer testimonial"

                  : "Update testimonial details"}

              </DrawerDescription>

            </DrawerHeader>



            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="grid gap-5">

                {/* Profile Image Upload */}

                <div className="space-y-2">

                  <Label>Profile Image</Label>

                  <div

                    className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${

                      isDragOver

                        ? "border-primary bg-primary/5"

                        : "border-muted-foreground/25 hover:border-primary/50"

                    }`}

                    onDragOver={handleDragOver}

                    onDragLeave={handleDragLeave}

                    onDrop={handleDrop}

                  >

                    {imagePreview ? (

                      <div className="relative">

                        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2">

                          <Image

                            src={imagePreview}

                            alt="Preview"

                            fill

                            className="object-cover"

                          />

                        </div>

                        <Button

                          variant="destructive"

                          size="icon"

                          className="absolute top-0 right-0 h-6 w-6 rounded-full"

                          onClick={handleRemoveImage}

                        >

                          <X className="h-3 w-3" />

                        </Button>

                      </div>

                    ) : (

                      <div

                        className="cursor-pointer py-4"

                        onClick={() => fileInputRef.current?.click()}

                      >

                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-2 text-sm text-muted-foreground">

                          Click or drag & drop to upload

                        </p>

                        <p className="text-xs text-muted-foreground/70">

                          PNG, JPG up to 5MB

                        </p>

                      </div>

                    )}

                    <input

                      ref={fileInputRef}

                      type="file"

                      accept="image/*"

                      className="hidden"

                      onChange={handleImageChange}

                    />

                  </div>

                </div>



                {/* User Name */}

                <div className="space-y-2">

                  <Label htmlFor="userName">User Name *</Label>

                  <Input

                    id="userName"

                    placeholder="Enter user name"

                    value={userName}

                    onChange={(e) => setUserName(e.target.value)}

                  />

                </div>



                {/* User Type */}

                <div className="space-y-2">

                  <Label htmlFor="userType">User Type *</Label>

                  <Select value={userType} onValueChange={setUserType}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select user type" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="buyer">Buyer</SelectItem>

                      <SelectItem value="seller">Seller</SelectItem>

                      <SelectItem value="dealer">Dealer</SelectItem>

                    </SelectContent>

                  </Select>

                </div>



                {/* Location */}

                <div className="space-y-2">

                  <Label htmlFor="location">Location</Label>

                  <Input

                    id="location"

                    placeholder="e.g., Mumbai, Maharashtra"

                    value={location}

                    onChange={(e) => setLocation(e.target.value)}

                  />

                </div>



                {/* Description */}

                <div className="space-y-2">

                  <Label htmlFor="description">Review / Description *</Label>

                  <Textarea

                    id="description"

                    placeholder="Enter testimonial description..."

                    value={description}

                    onChange={(e) => setDescription(e.target.value)}

                    rows={4}

                  />

                </div>



                {/* Rating */}

                <div className="space-y-2">

                  <Label htmlFor="rating">Rating *</Label>

                  <Select value={rating} onValueChange={setRating}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select rating" />

                    </SelectTrigger>

                    <SelectContent>

                      {[5, 4, 3, 2, 1].map((r) => (

                        <SelectItem key={r} value={String(r)}>

                          {"★".repeat(r)}{"☆".repeat(5 - r)} ({r})

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                {/* Car Name */}

                <div className="space-y-2">

                  <Label htmlFor="carName">Car Name</Label>

                  <Input

                    id="carName"

                    placeholder="e.g., Toyota Fortuner 2022"

                    value={carName}

                    onChange={(e) => setCarName(e.target.value)}

                  />

                </div>



                {/* Toggles */}

                <div className="grid grid-cols-3 gap-4">

                  <div className="flex items-center gap-2">

                    <Switch

                      checked={isApproved}

                      onCheckedChange={setIsApproved}

                      id="isApproved"

                    />

                    <Label htmlFor="isApproved" className="text-sm">

                      Approved

                    </Label>

                  </div>

                  <div className="flex items-center gap-2">

                    <Switch

                      checked={isFeatured}

                      onCheckedChange={setIsFeatured}

                      id="isFeaturedForm"

                    />

                    <Label htmlFor="isFeaturedForm" className="text-sm">

                      Featured

                    </Label>

                  </div>

                  <div className="flex items-center gap-2">

                    <Switch

                      checked={isVisible}

                      onCheckedChange={setIsVisible}

                      id="isVisible"

                    />

                    <Label htmlFor="isVisible" className="text-sm">

                      Visible

                    </Label>

                  </div>

                </div>

              </div>

            </div>



            <DrawerFooter className="border-t px-6 py-4">

              <div className="flex gap-3">

                <DrawerClose asChild>

                  <Button variant="outline" className="flex-1">

                    Cancel

                  </Button>

                </DrawerClose>

                <Button

                  className="flex-1"

                  onClick={handleSubmit}

                  disabled={creating || updating}

                >

                  {creating || updating

                    ? "Saving..."

                    : drawerMode === "add"

                      ? "Create Testimonial"

                      : "Update Testimonial"}

                </Button>

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* View Drawer */}

        <Drawer open={viewDialogOpen} onOpenChange={setViewDialogOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-[520px] rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Testimonial Details</DrawerTitle>

              <DrawerDescription>View testimonial information</DrawerDescription>

            </DrawerHeader>



            {viewTestimonial && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  {/* Profile */}

                  <div className="flex items-center gap-4">

                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2">

                      {viewTestimonial.userProfileImage?.url ? (

                        <Image

                          src={viewTestimonial.userProfileImage.url}

                          alt={viewTestimonial.userName}

                          fill

                          className="object-cover"

                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center bg-muted text-xl font-bold">

                          {viewTestimonial.userName?.charAt(0)?.toUpperCase()}

                        </div>

                      )}

                    </div>

                    <div>

                      <h3 className="text-lg font-semibold">{viewTestimonial.userName}</h3>

                      <div className="flex items-center gap-2 mt-1">

                        {getUserTypeBadge(viewTestimonial.userType)}

                        {viewTestimonial.location && (

                          <span className="text-sm text-muted-foreground flex items-center gap-1">

                            <MapPin className="size-3" />

                            {viewTestimonial.location}

                          </span>

                        )}

                      </div>

                    </div>

                  </div>



                  {/* Rating */}

                  <div className="space-y-1">

                    <Label className="text-muted-foreground">Rating</Label>

                    <StarRating rating={viewTestimonial.rating} />

                  </div>



                  {/* Review */}

                  <div className="space-y-1">

                    <Label className="text-muted-foreground">Review</Label>

                    <p className="text-sm leading-relaxed">{viewTestimonial.description}</p>

                  </div>



                  {/* Car */}

                  {viewTestimonial.carName && (

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Car</Label>

                      <div className="flex items-center gap-2">

                        <Car className="size-4 text-muted-foreground" />

                        <span className="text-sm">{viewTestimonial.carName}</span>

                      </div>

                    </div>

                  )}



                  {/* Status */}

                  <div className="grid grid-cols-3 gap-4">

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Approved</Label>

                      <div>

                        {viewTestimonial.isApproved ? (

                          <Badge className="bg-green-100 text-green-700">Yes</Badge>

                        ) : (

                          <Badge className="bg-yellow-100 text-yellow-700">No</Badge>

                        )}

                      </div>

                    </div>

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Featured</Label>

                      <div>

                        {viewTestimonial.isFeatured ? (

                          <Badge className="bg-blue-100 text-blue-700">Yes</Badge>

                        ) : (

                          <Badge variant="outline">No</Badge>

                        )}

                      </div>

                    </div>

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Visible</Label>

                      <div>

                        {viewTestimonial.isVisible ? (

                          <Badge className="bg-green-100 text-green-700">Yes</Badge>

                        ) : (

                          <Badge variant="outline">No</Badge>

                        )}

                      </div>

                    </div>

                  </div>



                  {/* Admin Notes */}

                  {viewTestimonial.adminNotes && (

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Admin Notes</Label>

                      <p className="text-sm">{viewTestimonial.adminNotes}</p>

                    </div>

                  )}



                  {/* Dates */}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Created</Label>

                      <p className="text-sm">

                        {new Date(viewTestimonial.createdAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

                      </p>

                    </div>

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Updated</Label>

                      <p className="text-sm">

                        {new Date(viewTestimonial.updatedAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}



            <DrawerFooter className="border-t px-6 py-4">

              <div className="flex gap-3">

                <DrawerClose asChild>

                  <Button variant="outline" className="flex-1">

                    Close

                  </Button>

                </DrawerClose>

                {viewTestimonial && (

                  <>

                    {!viewTestimonial.isApproved && (

                      <Button

                        className="flex-1"

                        onClick={() => {

                          handleApprove(viewTestimonial);

                          setViewDialogOpen(false);

                        }}

                      >

                        <ShieldCheck className="mr-2 h-4 w-4" />

                        Approve

                      </Button>

                    )}

                    <Button

                      variant="outline"

                      className="flex-1"

                      onClick={() => {

                        setViewDialogOpen(false);

                        handleOpenEdit(viewTestimonial);

                      }}

                    >

                      <Pencil className="mr-2 h-4 w-4" />

                      Edit

                    </Button>

                  </>

                )}

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* Delete Confirmation Dialog */}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete the testimonial from{" "}

                <strong>{testimonialToDelete?.userName}</strong>? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction

                onClick={confirmDelete}

                className="bg-black hover:bg-black/80"

              >

                Delete

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* Bulk Delete Confirmation Dialog */}

        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Bulk Delete Testimonials</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete{" "}

                <strong>{table.getFilteredSelectedRowModel().rows.length}</strong>{" "}

                testimonial(s)? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction

                onClick={confirmBulkDelete}

                className="bg-black hover:bg-black/80"

                disabled={bulkDeleting}

              >

                {bulkDeleting ? "Deleting..." : "Delete All"}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



      </SidebarInset>

    </SidebarProvider>

  );

}

