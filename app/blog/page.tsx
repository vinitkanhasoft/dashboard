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

import {

  Copy,

  Pencil,

  Trash2,

  Calendar,

  Eye,

  Upload,

  X,

  FileText,

  Star,

  Tag,

  BookOpen,

  Clock,

  FolderOpen,

} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchBlogs,

  createBlog,

  updateBlog,

  deleteBlog,

  bulkDeleteBlogs,

  searchBlogs,

  type Blog,

} from "@/lib/redux/blogSlice";

import {

  BlogCategory,

  BlogCategoryLabels,

  ALL_DEFAULT_TAGS,

} from "@/lib/enums/BlogEnums";

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

function DraggableRow({ row }: { row: Row<Blog> }) {

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



// ─── Status Badge ─────────────────────────────────────────

function getStatusBadge(status: string) {

  switch (status?.toLowerCase()) {

    case "published":

      return (

        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">

          Published

        </Badge>

      );

    case "draft":

      return (

        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400">

          Draft

        </Badge>

      );

    case "archived":

      return (

        <Badge className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400">

          Archived

        </Badge>

      );

    default:

      return <Badge variant="outline">{status}</Badge>;

  }

}



// ─── Stats Cards ──────────────────────────────────────────

function BlogCards() {

  const { blogs } = useAppSelector((s) => s.blog);



  const total = blogs.length;

  const published = blogs.filter((b) => b.status === "published").length;

  const drafts = blogs.filter((b) => b.status === "draft").length;

  const featured = blogs.filter((b) => b.isFeatured).length;



  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>

          <FileText className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{total}</div>

          <p className="text-xs text-muted-foreground">All blog posts</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Published</CardTitle>

          <BookOpen className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{published}</div>

          <p className="text-xs text-muted-foreground">

            {total > 0 ? ((published / total) * 100).toFixed(0) : 0}% of total

          </p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Drafts</CardTitle>

          <Clock className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{drafts}</div>

          <p className="text-xs text-muted-foreground">Awaiting publish</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Featured</CardTitle>

          <Star className="h-4 w-4 text-yellow-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{featured}</div>

          <p className="text-xs text-muted-foreground">Highlighted posts</p>

        </CardContent>

      </Card>

    </div>

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

export default function BlogPage() {

  const dispatch = useAppDispatch();

  const { blogs, loading, creating, updating } = useAppSelector((s) => s.blog);



  const hasFetched = React.useRef(false);



  // Table state

  const [data, setData] = React.useState<Blog[]>([]);

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

            searchBlogs({

              q,

              sortBy: "postDate",

              sortOrder: "desc",

              page: 1,

              limit: pagination.pageSize,

            })

          );

        } else {

          dispatch(fetchBlogs({

            page: pagination.pageIndex + 1,

            limit: pagination.pageSize,

            sortBy: "createdAt",

            sortOrder: "desc",

          }));

        }

      }, 400);

    },

    [dispatch, pagination.pageIndex, pagination.pageSize]

  );



  // Handle pagination changes

  React.useEffect(() => {

    if (!globalFilter && hasFetched.current) {

      dispatch(fetchBlogs({

        page: pagination.pageIndex + 1,

        limit: pagination.pageSize,

        sortBy: "createdAt",

        sortOrder: "desc",

      }));

    }

  }, [pagination.pageIndex, pagination.pageSize, dispatch, globalFilter]);



  React.useEffect(() => {

    if (!hasFetched.current && blogs.length === 0) {

      hasFetched.current = true;

      dispatch(fetchBlogs({

        page: pagination.pageIndex + 1,

        limit: pagination.pageSize,

        sortBy: "createdAt",

        sortOrder: "desc",

      }));

    }

  }, [dispatch, blogs.length, pagination.pageIndex, pagination.pageSize]);



  // Drawer state

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [drawerMode, setDrawerMode] = React.useState<"add" | "edit">("add");

  const [editingBlog, setEditingBlog] = React.useState<Blog | null>(null);



  // Delete dialog state

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [blogToDelete, setBlogToDelete] = React.useState<Blog | null>(null);



  // Bulk delete dialog state

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  const [bulkDeleting, setBulkDeleting] = React.useState(false);



  // View dialog state

  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);

  const [viewBlog, setViewBlog] = React.useState<Blog | null>(null);



  // Form state

  const [title, setTitle] = React.useState("");

  const [tagline, setTagline] = React.useState("");

  const [content, setContent] = React.useState("");



  const [status, setStatus] = React.useState("draft");

  const [isFeatured, setIsFeatured] = React.useState(false);

  const [category, setCategory] = React.useState("");

  const [tags, setTags] = React.useState<string[]>([]);

  const [tagInput, setTagInput] = React.useState("");

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

    setMounted(true);

  }, []);



  const dataIds = React.useMemo<UniqueIdentifier[]>(

    () => data?.map(({ _id }) => _id) || [],

    [data]

  );



  // ─── Handlers ──────────────────────────────────────────

  const handleDeleteBlog = (blog: Blog) => {

    setBlogToDelete(blog);

    setDeleteDialogOpen(true);

  };



  const confirmDelete = async () => {

    if (!blogToDelete) return;

    const result = await dispatch(deleteBlog(blogToDelete._id));

    if (deleteBlog.fulfilled.match(result)) {

      toast.success("Blog deleted successfully");

      setDeleteDialogOpen(false);

      setBlogToDelete(null);

    } else {

      toast.error(result.payload ?? "Failed to delete blog");

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

    const result = await dispatch(bulkDeleteBlogs(ids));

    if (bulkDeleteBlogs.fulfilled.match(result)) {

      toast.success(`${ids.length} blog(s) deleted successfully`);

      setBulkDeleteDialogOpen(false);

      table.toggleAllRowsSelected(false);

    } else {

      toast.error(result.payload ?? "Failed to bulk delete blogs");

    }

    setBulkDeleting(false);

  };



  // ─── Columns ───────────────────────────────────────────

  const columns = React.useMemo<ColumnDef<Blog>[]>(

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

        accessorKey: "featuredImage",

        header: "Image",

        cell: ({ row }) => (

          <div className="relative h-10 w-16 overflow-hidden rounded-md border group cursor-pointer">

            {row.original.featuredImage?.url ? (

              <Image

                src={row.original.featuredImage.url}

                alt={row.original.title}

                fill

                className="object-cover transition-transform duration-300 group-hover:scale-110"

                sizes="64px"

              />

            ) : (

              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">

                <FileText className="size-4" />

              </div>

            )}

          </div>

        ),

        size: 80,

      },

      {

        accessorKey: "title",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            Title

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

              <FileText className="size-4 text-primary/70 shrink-0" />

              <span className="truncate max-w-48">{row.original.title}</span>

            </div>

          </Button>

        ),

        enableHiding: false,

        size: 250,

      },

      {

        accessorKey: "category",

        header: "Category",

        cell: ({ row }) =>

          row.original.category ? (

            <div className="flex items-center gap-1.5">

              <FolderOpen className="size-3.5 text-muted-foreground" />

              <span className="text-sm truncate max-w-28">

                {BlogCategoryLabels[row.original.category as BlogCategory] || row.original.category}

              </span>

            </div>

          ) : (

            <span className="text-sm text-muted-foreground">—</span>

          ),

        size: 160,

      },

      {

        accessorKey: "status",

        header: "Status",

        cell: ({ row }) => getStatusBadge(row.original.status),

        size: 110,

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

              prev.map((b) => (b._id === row.original._id ? { ...b, isFeatured: newVal } : b))

            );

            const formData = new FormData();

            formData.append("title", row.original.title);

            formData.append("content", row.original.content);

            formData.append("isFeatured", String(newVal));

            const result = await dispatch(

              updateBlog({ id: row.original._id, formData })

            );

            setToggling(false);

            if (updateBlog.fulfilled.match(result)) {

              toast.success(`Blog ${newVal ? "featured" : "unfeatured"}`);

            } else {

              setData((prev) =>

                prev.map((b) =>

                  b._id === row.original._id ? { ...b, isFeatured: featured } : b

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

        accessorKey: "postDate",

        header: "Date",

        cell: ({ row }) => {

          const date = new Date(row.original.postDate || row.original.createdAt);

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

                className="data-[state=open]:bg-primary/10 text-muted-foreground hover:text-foreground flex size-8 transition-all duration-200 hover:scale-110"

                size="icon"

              >

                <IconDotsVertical className="size-4" />

                <span className="sr-only">Open menu</span>

              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">

              <DropdownMenuLabel>Actions for Blog</DropdownMenuLabel>

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

                onClick={() => handleDeleteBlog(row.original)}

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

      toast.success("Blogs reordered successfully", {

        icon: <IconCheck className="h-4 w-4" />,

      });

    }

  }



  const handleRefresh = async () => {

    setIsRefreshing(true);

    await dispatch(fetchBlogs({

      page: 1,

      limit: pagination.pageSize,

      sortBy: "createdAt",

      sortOrder: "desc",

    }));

    setIsRefreshing(false);

    toast.success("Blogs refreshed successfully");

  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);

    doc.text("Blogs Report", 14, 18);

    doc.setFontSize(10);

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);



    const rows = table.getFilteredRowModel().rows;

    const tableData = rows.map((row) => {

      const b = row.original;

      return [

        b.title || "",

        b.category || "",

        b.status || "",

        b.tags?.join(", ") || "",

        String(b.views ?? 0),

        b.isFeatured ? "Yes" : "No",

        b.postDate ? new Date(b.postDate).toLocaleDateString() : "",

      ];

    });



    autoTable(doc, {

      head: [["Title", "Category", "Status", "Tags", "Views", "Featured", "Post Date"]],

      body: tableData,

      startY: 30,

      styles: { fontSize: 7 },

      headStyles: { fillColor: [41, 128, 185] },

    });



    doc.save("blogs-report.pdf");

    toast.success("PDF downloaded successfully");

  };



  const resetForm = () => {

    setTitle("");

    setTagline("");

    setContent("");

    setStatus("draft");

    setIsFeatured(false);

    setCategory("");

    setTags([]);

    setTagInput("");

    setImageFile(null);

    setImagePreview(null);

    setEditingBlog(null);

    setIsDragOver(false);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };



  const handleOpenAdd = () => {

    resetForm();

    setDrawerMode("add");

    setDrawerOpen(true);

  };



  const handleOpenEdit = (blog: Blog) => {

    setDrawerMode("edit");

    setEditingBlog(blog);

    setTitle(blog.title);

    setTagline(blog.tagline || "");

    setContent(blog.content);

    setStatus(blog.status);

    setIsFeatured(blog.isFeatured);

    setCategory(blog.category || "");

    setTags(blog.tags || []);

    setTagInput("");

    setImagePreview(blog.featuredImage?.url || null);

    setImageFile(null);

    setDrawerOpen(true);

  };



  const handleOpenView = (blog: Blog) => {

    setViewBlog(blog);

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

    if (!title.trim()) {

      toast.error("Title is required.");

      return;

    }

    if (!content.trim()) {

      toast.error("Content is required.");

      return;

    }



    const formData = new FormData();

    formData.append("title", title.trim());

    if (tagline.trim()) formData.append("tagline", tagline.trim());

    formData.append("content", content.trim());

    formData.append("status", status);

    formData.append("isFeatured", String(isFeatured));

    if (category.trim()) formData.append("category", category.trim());



    tags.forEach((tag) => formData.append("tags", tag));



    if (drawerMode === "add") {

      if (imageFile) formData.append("image", imageFile);

      const result = await dispatch(createBlog(formData));

      if (createBlog.fulfilled.match(result)) {

        toast.success("Blog created successfully!");

        setDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to create blog.");

      }

    } else if (editingBlog) {

      if (imageFile) formData.append("image", imageFile);

      const result = await dispatch(

        updateBlog({ id: editingBlog._id, formData })

      );

      if (updateBlog.fulfilled.match(result)) {

        toast.success("Blog updated successfully!");

        setDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to update blog.");

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

                  <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>

                  <p className="text-muted-foreground">

                    Manage blog posts and articles

                  </p>

                </div>

              </div>



              <BlogCards />



              <TooltipProvider>

                <div className="w-full flex flex-col gap-4">

                  {/* Table Toolbar */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 flex-1">

                      <div className="relative flex-1 max-w-md">

                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                        <Input

                          placeholder="Search blogs..."

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

                                {column.id === "featuredImage"

                                  ? "Image"

                                  : column.id === "isFeatured"

                                    ? "Featured"

                                    : column.id === "postDate"

                                      ? "Post Date"

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

                        <span className="hidden lg:inline">Add Blog</span>

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

                        {selectedCount} blog(s) selected

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

                          <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">

                            <TableRow className="hover:bg-transparent">

                              {[40, 40, 80, 250, 160, 110, 90, 130, 50].map(

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

                                {[40, 40, 80, 250, 160, 110, 90, 130, 50].map(

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

                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card shadow-lg">

                      <div className="rounded-full bg-muted p-4 mb-4">

                        <FileText className="h-12 w-12 text-muted-foreground/50" />

                      </div>

                      <h3 className="text-lg font-semibold">No blogs found</h3>

                      <p className="text-muted-foreground mt-1 max-w-sm">

                        Get started by creating your first blog post. Share news, updates, and stories with your audience.

                      </p>

                      <Button className="mt-4" onClick={handleOpenAdd}>

                        <IconPlus className="mr-2 h-4 w-4" />

                        Create First Blog

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

                            <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40 sticky top-0 z-10">

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

                              <SelectTrigger size="sm" className="w-[70px] h-8" id="rows-per-page">

                                <SelectValue placeholder={table.getState().pagination.pageSize} />

                              </SelectTrigger>

                              <SelectContent side="top">

                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (

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

                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}

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

              </TooltipProvider>

            </div>

          </div>

        </div>



        {/* Add/Edit Drawer */}

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>

                {drawerMode === "add" ? "Add Blog Post" : "Edit Blog Post"}

              </DrawerTitle>

              <DrawerDescription>

                {drawerMode === "add"

                  ? "Create a new blog post"

                  : "Update blog post details"}

              </DrawerDescription>

            </DrawerHeader>



            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="grid gap-5">

                {/* Featured Image Upload */}

                <div className="space-y-2">

                  <Label>Featured Image</Label>

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

                        <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border-2">

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

                          className="absolute top-2 right-2 h-6 w-6 rounded-full"

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



                {/* Title */}

                <div className="space-y-2">

                  <Label htmlFor="title">Title *</Label>

                  <Input

                    id="title"

                    placeholder="Enter blog title"

                    value={title}

                    onChange={(e) => setTitle(e.target.value)}

                  />

                </div>



                {/* Tagline */}

                <div className="space-y-2">

                  <Label htmlFor="tagline">Tagline</Label>

                  <Input

                    id="tagline"

                    placeholder="Short description or subtitle"

                    value={tagline}

                    onChange={(e) => setTagline(e.target.value)}

                  />

                </div>



                {/* Content */}

                <div className="space-y-2">

                  <Label htmlFor="content">Content *</Label>

                  <Textarea

                    id="content"

                    placeholder="Write your blog content..."

                    value={content}

                    onChange={(e) => setContent(e.target.value)}

                    rows={8}

                  />

                </div>



                {/* Category */}

                <div className="space-y-2">

                  <Label htmlFor="category">Category</Label>

                  <Select value={category} onValueChange={setCategory}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select category" />

                    </SelectTrigger>

                    <SelectContent>

                      {Object.values(BlogCategory).map((cat) => (

                        <SelectItem key={cat} value={cat}>

                          {BlogCategoryLabels[cat]}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                {/* Tags */}

                <div className="space-y-2">

                  <Label>Tags</Label>

                  <div className="flex items-center gap-2">

                    <Select

                      value={tagInput}

                      onValueChange={(val) => {

                        if (val && !tags.includes(val)) {

                          setTags((prev) => [...prev, val]);

                        }

                        setTagInput("");

                      }}

                    >

                      <SelectTrigger>

                        <SelectValue placeholder="Select a tag" />

                      </SelectTrigger>

                      <SelectContent>

                        {ALL_DEFAULT_TAGS.filter((t) => !tags.includes(t)).map((tag) => (

                          <SelectItem key={tag} value={tag}>

                            {tag}

                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                  {tags.length > 0 && (

                    <div className="flex flex-wrap gap-1.5 pt-1">

                      {tags.map((tag) => (

                        <Badge

                          key={tag}

                          variant="secondary"

                          className="gap-1 pr-1"

                        >

                          {tag}

                          <button

                            type="button"

                            onClick={() =>

                              setTags((prev) => prev.filter((t) => t !== tag))

                            }

                            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"

                          >

                            <X className="size-3" />

                          </button>

                        </Badge>

                      ))}

                    </div>

                  )}

                </div>



                {/* Status */}

                <div className="space-y-2">

                  <Label htmlFor="status">Status *</Label>

                  <Select value={status} onValueChange={setStatus}>

                    <SelectTrigger>

                      <SelectValue placeholder="Select status" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="draft">Draft</SelectItem>

                      <SelectItem value="published">Published</SelectItem>

                      <SelectItem value="archived">Archived</SelectItem>

                    </SelectContent>

                  </Select>

                </div>



                {/* Featured Toggle */}

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

                  {creating || updating ? (

                    <>

                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                      {drawerMode === "add" ? "Creating..." : "Updating..."}

                    </>

                  ) : drawerMode === "add" ? (

                    <>

                      <IconPlus className="mr-2 h-4 w-4" />

                      Create Blog

                    </>

                  ) : (

                    "Update Blog"

                  )}

                </Button>

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* View Drawer */}

        <Drawer open={viewDialogOpen} onOpenChange={setViewDialogOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Blog Details</DrawerTitle>

              <DrawerDescription>View blog post information</DrawerDescription>

            </DrawerHeader>



            {viewBlog && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  {/* Featured Image */}

                  {viewBlog.featuredImage?.url && (

                    <div className="relative h-48 w-full overflow-hidden rounded-lg border">

                      <Image

                        src={viewBlog.featuredImage.url}

                        alt={viewBlog.title}

                        fill

                        className="object-cover"

                      />

                    </div>

                  )}



                  {/* Title & Tagline */}

                  <div>

                    <h3 className="text-lg font-semibold">{viewBlog.title}</h3>

                    {viewBlog.tagline && (

                      <p className="text-sm text-muted-foreground mt-1">{viewBlog.tagline}</p>

                    )}

                    {viewBlog.slug && (

                      <p className="text-xs text-muted-foreground/70 mt-1 font-mono">

                        /{viewBlog.slug}

                      </p>

                    )}

                  </div>



                  {/* Status & Category */}

                  <div className="flex items-center gap-2 flex-wrap">

                    {getStatusBadge(viewBlog.status)}

                    {viewBlog.category && (

                      <Badge variant="outline" className="gap-1">

                        <FolderOpen className="size-3" />

                        {BlogCategoryLabels[viewBlog.category as BlogCategory] || viewBlog.category}

                      </Badge>

                    )}

                    {viewBlog.isFeatured && (

                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">

                        <Star className="size-3" />

                        Featured

                      </Badge>

                    )}

                  </div>



                  {/* Content */}

                  <div className="space-y-1">

                    <Label className="text-muted-foreground">Content</Label>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewBlog.content}</p>

                  </div>



                  {/* Tags */}

                  {viewBlog.tags && viewBlog.tags.length > 0 && (

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Tags</Label>

                      <div className="flex flex-wrap gap-1.5">

                        {viewBlog.tags.map((tag) => (

                          <Badge key={tag} variant="outline" className="gap-1">

                            <Tag className="size-3" />

                            {tag}

                          </Badge>

                        ))}

                      </div>

                    </div>

                  )}



                  {/* Stats */}

                  <div className="grid grid-cols-3 gap-4">

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Views</Label>

                      <div className="flex items-center gap-1.5">

                        <Eye className="size-4 text-muted-foreground" />

                        <span className="text-sm font-medium">{viewBlog.views ?? 0}</span>

                      </div>

                    </div>

                    {viewBlog.readingTime && (

                      <div className="space-y-1">

                        <Label className="text-muted-foreground">Reading Time</Label>

                        <div className="flex items-center gap-1.5">

                          <Clock className="size-4 text-muted-foreground" />

                          <span className="text-sm font-medium">{viewBlog.readingTime} min</span>

                        </div>

                      </div>

                    )}

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Featured</Label>

                      <div>

                        {viewBlog.isFeatured ? (

                          <Badge className="bg-yellow-100 text-yellow-700">Yes</Badge>

                        ) : (

                          <Badge variant="outline">No</Badge>

                        )}

                      </div>

                    </div>

                  </div>



                  {/* Dates */}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Post Date</Label>

                      <p className="text-sm">

                        {new Date(viewBlog.postDate || viewBlog.createdAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

                      </p>

                    </div>

                    <div className="space-y-1">

                      <Label className="text-muted-foreground">Updated</Label>

                      <p className="text-sm">

                        {new Date(viewBlog.updatedAt).toLocaleDateString("en-US", {

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

                {viewBlog && (

                  <Button

                    variant="outline"

                    className="flex-1"

                    onClick={() => {

                      setViewDialogOpen(false);

                      handleOpenEdit(viewBlog);

                    }}

                  >

                    <Pencil className="mr-2 h-4 w-4" />

                    Edit

                  </Button>

                )}

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* Delete Confirmation Dialog */}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Delete Blog</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete{" "}

                <strong>{blogToDelete?.title}</strong>? This action cannot be undone.

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

              <AlertDialogTitle>Bulk Delete Blogs</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete{" "}

                <strong>{table.getFilteredSelectedRowModel().rows.length}</strong>{" "}

                blog(s)? This action cannot be undone.

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

