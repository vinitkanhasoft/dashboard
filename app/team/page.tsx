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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {

  Trash2,

  Calendar,

  Eye,

  Edit,

  Mail,

  Phone,

  Users,

  UserCheck,

  UserX,

  Star,

  Briefcase,

  Award,

  Building2,

  Hash,

} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchTeamMembers,

  fetchTeamStats,

  createTeamMember,

  updateTeamMember,

  deleteTeamMember,

  bulkDeleteTeamMembers,

  toggleTeamMemberStatus,

  type TeamMember,

} from "@/lib/redux/teamSlice";

import {

  TeamPosition,

  TeamMemberTag,

  POSITION_LABELS,

  TAG_LABELS,

  POSITION_DEPARTMENTS,

} from "@/lib/enums/TeamEnums";

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

function DraggableRow({ row }: { row: Row<TeamMember> }) {

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



// ─── Position Badge ───────────────────────────────────────

function PositionBadge({ position }: { position: string }) {

  const label = POSITION_LABELS[position] || position;

  const colors: Record<string, string> = {

    founder: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",

    "co-founder": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",

    "head-of-operations": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",

    "senior-car-expert": "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",

    "customer-relations": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",

    "fi-specialist": "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400",

    "marketing-head": "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400",

    "sales-manager": "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400",

    "technical-director": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",

    "business-development": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",

    "hr-manager": "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",

    "finance-manager": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",

  };

  return <Badge className={colors[position] || "bg-gray-100 text-gray-700"}>{label}</Badge>;

}



// ─── Stats Cards ──────────────────────────────────────────

function TeamStatsCards() {

  const { members, stats } = useAppSelector((s) => s.team);



  const total = stats?.total ?? members.length;

  const active = stats?.active ?? members.filter((m) => m.isActive).length;

  const inactive = total - active;

  const featured = stats?.featured ?? members.filter((m) => m.isFeatured).length;



  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Total Members</CardTitle>

          <Users className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{total}</div>

          <p className="text-xs text-muted-foreground">Team members registered</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Active</CardTitle>

          <UserCheck className="h-4 w-4 text-green-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{active}</div>

          <p className="text-xs text-muted-foreground">

            {total > 0 ? ((active / total) * 100).toFixed(0) : 0}% of total

          </p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Inactive</CardTitle>

          <UserX className="h-4 w-4 text-red-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{inactive}</div>

          <p className="text-xs text-muted-foreground">Not currently active</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Featured</CardTitle>

          <Star className="h-4 w-4 text-yellow-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{featured}</div>

          <p className="text-xs text-muted-foreground">Highlighted on website</p>

        </CardContent>

      </Card>

    </div>

  );

}



// ─── Main Page ────────────────────────────────────────────

export default function TeamPage() {

  const dispatch = useAppDispatch();

  const { members, loading, creating, updating } = useAppSelector((s) => s.team);



  const hasFetched = React.useRef(false);



  // Table state

  const [data, setData] = React.useState<TeamMember[]>([]);

  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const [globalFilter, setGlobalFilter] = React.useState("");



  const [mounted, setMounted] = React.useState(false);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("all");



  // Delete dialogs

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [memberToDelete, setMemberToDelete] = React.useState<TeamMember | null>(null);

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  const [bulkDeleting, setBulkDeleting] = React.useState(false);



  // View drawer

  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);

  const [viewMember, setViewMember] = React.useState<TeamMember | null>(null);



  // Create / Edit drawer

  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);

  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  const [formName, setFormName] = React.useState("");

  const [formPosition, setFormPosition] = React.useState("");

  const [formTagline, setFormTagline] = React.useState("");

  const [formYears, setFormYears] = React.useState("");

  const [formEmail, setFormEmail] = React.useState("");

  const [formContactCode, setFormContactCode] = React.useState("+1");

  const [formContactNum, setFormContactNum] = React.useState("");

  const [formWhatsappCode, setFormWhatsappCode] = React.useState("+1");

  const [formWhatsappNum, setFormWhatsappNum] = React.useState("");

  const [formBio, setFormBio] = React.useState("");

  const [formTags, setFormTags] = React.useState<string[]>([]);

  const [formIsActive, setFormIsActive] = React.useState(true);

  const [formIsFeatured, setFormIsFeatured] = React.useState(false);

  const [formDisplayOrder, setFormDisplayOrder] = React.useState("1");

  const [formImage, setFormImage] = React.useState<File | null>(null);

  const [formImagePreview, setFormImagePreview] = React.useState<string | null>(null);



  const sortableId = React.useId();

  const sensors = useSensors(

    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),

    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),

    useSensor(KeyboardSensor, {})

  );



  React.useEffect(() => {

    if (!hasFetched.current) {

      hasFetched.current = true;

      dispatch(fetchTeamMembers());

      dispatch(fetchTeamStats());

    }

  }, [dispatch]);



  React.useEffect(() => {

    if (members) setData(members.filter((m) => m && m._id));

  }, [members]);



  React.useEffect(() => { setMounted(true); }, []);



  // Department filter

  const filteredData = React.useMemo(() => {

    if (activeTab === "all") return data;

    const departmentPositions = POSITION_DEPARTMENTS[activeTab];

    if (departmentPositions) {

      return data.filter((m) => departmentPositions.includes(m.position));

    }

    return data;

  }, [data, activeTab]);



  const dataIds = React.useMemo<UniqueIdentifier[]>(

    () => filteredData?.map(({ _id }) => _id) || [],

    [filteredData]

  );



  // ─── Handlers ──────────────────────────────────────────

  const resetForm = () => {

    setEditingMember(null);

    setFormName("");

    setFormPosition("");

    setFormTagline("");

    setFormYears("");

    setFormEmail("");

    setFormContactCode("+1");

    setFormContactNum("");

    setFormWhatsappCode("+1");

    setFormWhatsappNum("");

    setFormBio("");

    setFormTags([]);

    setFormIsActive(true);

    setFormIsFeatured(false);

    setFormDisplayOrder("1");

    setFormImage(null);

    setFormImagePreview(null);

  };



  const openCreateDrawer = () => {

    resetForm();

    setFormDrawerOpen(true);

  };



  const openEditDrawer = (member: TeamMember) => {

    setEditingMember(member);

    setFormName(member.name);

    setFormPosition(member.position);

    setFormTagline(member.tagline || "");

    setFormYears(String(member.yearsOfExperience || ""));

    setFormEmail(member.email || "");

    setFormContactCode(member.contactNumber?.countryCode || "+1");

    setFormContactNum(member.contactNumber?.number || "");

    setFormWhatsappCode(member.whatsappNumber?.countryCode || "+1");

    setFormWhatsappNum(member.whatsappNumber?.number || "");

    setFormBio(member.bio || "");

    setFormTags(member.tags || []);

    setFormIsActive(member.isActive);

    setFormIsFeatured(member.isFeatured);

    setFormDisplayOrder(String(member.displayOrder || 1));

    setFormImage(null);

    setFormImagePreview(member.image?.url || null);

    setFormDrawerOpen(true);

  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      setFormImage(file);

      setFormImagePreview(URL.createObjectURL(file));

    }

  };



  const handleTagToggle = (tag: string) => {

    setFormTags((prev) =>

      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]

    );

  };



  const handleSubmitForm = async () => {

    if (!formName.trim() || !formPosition || !formEmail.trim()) {

      toast.error("Name, position, and email are required.");

      return;

    }



    const fd = new FormData();

    fd.append("name", formName.trim());

    fd.append("position", formPosition);

    fd.append("tagline", formTagline.trim());

    fd.append("yearsOfExperience", formYears);

    fd.append("email", formEmail.trim());

    fd.append("contactNumber[countryCode]", formContactCode);

    fd.append("contactNumber[number]", formContactNum);

    fd.append("whatsappNumber[countryCode]", formWhatsappCode);

    fd.append("whatsappNumber[number]", formWhatsappNum);

    fd.append("tags", JSON.stringify(formTags));

    fd.append("bio", formBio.trim());

    fd.append("isActive", String(formIsActive));

    fd.append("isFeatured", String(formIsFeatured));

    fd.append("displayOrder", formDisplayOrder);

    if (formImage) fd.append("image", formImage);



    if (editingMember) {

      const result = await dispatch(updateTeamMember({ id: editingMember._id, formData: fd }));

      if (updateTeamMember.fulfilled.match(result)) {

        toast.success("Team member updated successfully!");

        setFormDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to update.");

      }

    } else {

      const result = await dispatch(createTeamMember(fd));

      if (createTeamMember.fulfilled.match(result)) {

        toast.success("Team member created successfully!");

        setFormDrawerOpen(false);

        resetForm();

      } else {

        toast.error(result.payload ?? "Failed to create.");

      }

    }

  };



  const handleDelete = (member: TeamMember) => {

    setMemberToDelete(member);

    setDeleteDialogOpen(true);

  };



  const confirmDelete = async () => {

    if (!memberToDelete) return;

    const result = await dispatch(deleteTeamMember(memberToDelete._id));

    if (deleteTeamMember.fulfilled.match(result)) {

      toast.success("Team member deleted successfully");

      setDeleteDialogOpen(false);

      setMemberToDelete(null);

    } else {

      toast.error(result.payload ?? "Failed to delete.");

    }

  };



  const handleBulkDelete = () => {

    const selected = table.getFilteredSelectedRowModel().rows;

    if (selected.length === 0) return;

    setBulkDeleteDialogOpen(true);

  };



  const confirmBulkDelete = async () => {

    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original._id);

    if (ids.length === 0) return;

    setBulkDeleting(true);

    const result = await dispatch(bulkDeleteTeamMembers(ids));

    if (bulkDeleteTeamMembers.fulfilled.match(result)) {

      toast.success(`${ids.length} member(s) deleted successfully`);

      setBulkDeleteDialogOpen(false);

      table.toggleAllRowsSelected(false);

    } else {

      toast.error(result.payload ?? "Failed to bulk delete.");

    }

    setBulkDeleting(false);

  };



  const handleToggleStatus = async (member: TeamMember) => {

    const result = await dispatch(toggleTeamMemberStatus(member._id));

    if (toggleTeamMemberStatus.fulfilled.match(result)) {

      toast.success(`${member.name} is now ${result.payload.isActive ? "active" : "inactive"}`);

    } else {

      toast.error(result.payload ?? "Failed to toggle status.");

    }

  };



  // ─── Columns ───────────────────────────────────────────

  const columns = React.useMemo<ColumnDef<TeamMember>[]>(

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

              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}

              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}

              aria-label="Select all"

              className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"

            />

          </div>

        ),

        cell: ({ row }) => (

          <div className="flex items-center justify-center">

            <Checkbox

              checked={row.getIsSelected()}

              onCheckedChange={(v) => row.toggleSelected(!!v)}

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

        accessorKey: "name",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            Name

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => (

          <Button

            variant="link"

            className="text-foreground hover:text-primary w-fit px-0 text-left font-medium"

            onClick={() => { setViewMember(row.original); setViewDrawerOpen(true); }}

          >

            <div className="flex items-center gap-3">

              {row.original.image?.url ? (

                <Image

                  src={row.original.image.url}

                  alt={row.original.name}

                  width={32}

                  height={32}

                  className="rounded-full object-cover size-8"

                />

              ) : (

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">

                  {row.original.name.charAt(0).toUpperCase()}

                </div>

              )}

              <div>

                <span className="block">{row.original.name}</span>

                {row.original.tagline && (

                  <span className="block text-xs text-muted-foreground truncate max-w-48">

                    {row.original.tagline}

                  </span>

                )}

              </div>

            </div>

          </Button>

        ),

        enableHiding: false,

        size: 280,

      },

      {

        accessorKey: "position",

        header: "Position",

        cell: ({ row }) => <PositionBadge position={row.original.position} />,

        filterFn: (row, _columnId, filterValue) => {

          if (!filterValue || filterValue === "all") return true;

          return row.original.position === filterValue;

        },

        size: 180,

      },

      {

        accessorKey: "email",

        header: "Email",

        cell: ({ row }) => (

          <div className="flex items-center gap-2">

            <Mail className="size-3.5 text-muted-foreground shrink-0" />

            <span className="text-sm truncate max-w-40">{row.original.email}</span>

          </div>

        ),

        size: 200,

      },

      {

        accessorKey: "yearsOfExperience",

        header: "Experience",

        cell: ({ row }) => (

          <div className="flex items-center gap-1.5">

            <Award className="size-3.5 text-muted-foreground" />

            <span className="text-sm">{row.original.yearsOfExperience} yrs</span>

          </div>

        ),

        size: 110,

      },

      {

        accessorKey: "isActive",

        header: "Status",

        cell: ({ row }) => (

          <Switch

            checked={row.original.isActive}

            onCheckedChange={() => handleToggleStatus(row.original)}

            aria-label="Toggle status"

          />

        ),

        size: 80,

      },

      {

        accessorKey: "isFeatured",

        header: "Featured",

        cell: ({ row }) =>

          row.original.isFeatured ? (

            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400">

              <Star className="size-3 mr-1" /> Featured

            </Badge>

          ) : (

            <Badge variant="outline" className="text-muted-foreground">No</Badge>

          ),

        size: 110,

      },

      {

        accessorKey: "createdAt",

        header: "Joined",

        cell: ({ row }) => {

          const date = new Date(row.original.createdAt);

          return (

            <div className="flex items-center gap-2">

              <Calendar className="size-3.5 text-muted-foreground" />

              <span className="text-sm">

                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}

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

              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>

                <DropdownMenuItem

                  className="cursor-pointer gap-2"

                  onClick={() => { setViewMember(row.original); setViewDrawerOpen(true); }}

                >

                  <Eye className="h-4 w-4" />

                  <span>View Details</span>

                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>

                </DropdownMenuItem>

                <DropdownMenuItem

                  className="cursor-pointer gap-2"

                  onClick={() => openEditDrawer(row.original)}

                >

                  <Edit className="h-4 w-4" />

                  <span>Edit Member</span>

                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>

                </DropdownMenuItem>

              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                variant="destructive"

                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"

                onClick={() => handleDelete(row.original)}

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



  // ─── Table ─────────────────────────────────────────────

  const table = useReactTable({

    data: filteredData,

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



  // ─── Drag End ──────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {

    const { active, over } = event;

    if (active && over && active.id !== over.id) {

      setData((d) => {

        const oldIndex = dataIds.indexOf(active.id);

        const newIndex = dataIds.indexOf(over.id);

        return arrayMove(d, oldIndex, newIndex);

      });

      toast.success("Reordered successfully", { icon: <IconCheck className="h-4 w-4" /> });

    }

  }



  const handleRefresh = async () => {

    setIsRefreshing(true);

    await Promise.all([dispatch(fetchTeamMembers()), dispatch(fetchTeamStats())]);

    setIsRefreshing(false);

    toast.success("Data refreshed successfully");

  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);

    doc.text("Team Members Report", 14, 18);

    doc.setFontSize(10);

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);



    const rows = table.getFilteredRowModel().rows;

    const tableData = rows.map((row) => {

      const m = row.original;

      return [

        m.name,

        POSITION_LABELS[m.position] || m.position,

        m.email,

        `${m.yearsOfExperience} yrs`,

        m.isActive ? "Active" : "Inactive",

        m.isFeatured ? "Yes" : "No",

        new Date(m.createdAt).toLocaleDateString(),

      ];

    });



    autoTable(doc, {

      head: [["Name", "Position", "Email", "Experience", "Status", "Featured", "Joined"]],

      body: tableData,

      startY: 30,

      styles: { fontSize: 8 },

      headStyles: { fillColor: [41, 128, 185] },

    });



    doc.save("team-members.pdf");

    toast.success("PDF downloaded successfully");

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

              {/* Header */}

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>

                  <p className="text-muted-foreground">Manage your team members & departments</p>

                </div>

                <Button

                  size="sm"

                  className="h-9 gap-2 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"

                  onClick={openCreateDrawer}

                >

                  <IconPlus className="size-3.5" />

                  <span className="hidden lg:inline">Add Member</span>

                </Button>

              </div>



              <TeamStatsCards />



              {/* Department Tabs */}

              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); table.toggleAllRowsSelected(false); }}>

                <TabsList className="flex-wrap h-auto gap-1">

                  <TabsTrigger value="all" className="gap-2">

                    <Users className="size-4" /> All

                    <Badge variant="secondary" className="ml-1 text-xs">{data.length}</Badge>

                  </TabsTrigger>

                  {Object.entries(POSITION_DEPARTMENTS).map(([dept, positions]) => {

                    const count = data.filter((m) => positions.includes(m.position)).length;

                    return (

                      <TabsTrigger key={dept} value={dept} className="gap-2">

                        <Building2 className="size-4" /> {dept}

                        <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>

                      </TabsTrigger>

                    );

                  })}

                </TabsList>



                <TabsContent value={activeTab} className="mt-4">

                  <TooltipProvider>

                    <div className="w-full flex flex-col gap-4">

                      {/* Toolbar */}

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 flex-1">

                          <div className="relative flex-1 max-w-md">

                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input

                              placeholder="Search by name, email, position..."

                              value={globalFilter ?? ""}

                              onChange={(e) => setGlobalFilter(e.target.value)}

                              className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"

                            />

                          </div>

                          <Select

                            value={(columnFilters.find((f) => f.id === "position")?.value as string) || "all"}

                            onValueChange={(v) => {

                              if (v === "all") {

                                setColumnFilters((prev) => prev.filter((f) => f.id !== "position"));

                              } else {

                                setColumnFilters((prev) => {

                                  const rest = prev.filter((f) => f.id !== "position");

                                  return [...rest, { id: "position", value: v }];

                                });

                              }

                            }}

                          >

                            <SelectTrigger className="h-9 w-48">

                              <SelectValue placeholder="Filter by position" />

                            </SelectTrigger>

                            <SelectContent>

                              <SelectItem value="all">All Positions</SelectItem>

                              {Object.values(TeamPosition).map((pos) => (

                                <SelectItem key={pos} value={pos}>

                                  {POSITION_LABELS[pos]}

                                </SelectItem>

                              ))}

                            </SelectContent>

                          </Select>

                          <DropdownMenu>

                            <DropdownMenuTrigger asChild>

                              <Button variant="outline" size="sm" className="h-9 gap-2 border-muted hover:bg-muted/50">

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

                                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())

                                .map((col) => (

                                  <DropdownMenuCheckboxItem

                                    key={col.id}

                                    className="capitalize cursor-pointer"

                                    checked={col.getIsVisible()}

                                    onCheckedChange={(v) => col.toggleVisibility(!!v)}

                                  >

                                    {col.id === "isActive" ? "Status" : col.id === "isFeatured" ? "Featured" : col.id === "yearsOfExperience" ? "Experience" : col.id === "createdAt" ? "Joined" : col.id}

                                  </DropdownMenuCheckboxItem>

                                ))}

                            </DropdownMenuContent>

                          </DropdownMenu>

                        </div>

                        <div className="flex items-center gap-2">

                          <Tooltip>

                            <TooltipTrigger asChild>

                              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefresh} disabled={isRefreshing || loading}>

                                <IconRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />

                              </Button>

                            </TooltipTrigger>

                            <TooltipContent>Refresh data</TooltipContent>

                          </Tooltip>

                          <Tooltip>

                            <TooltipTrigger asChild>

                              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleDownloadPDF}>

                                <IconDownload className="h-4 w-4" />

                              </Button>

                            </TooltipTrigger>

                            <TooltipContent>Download PDF</TooltipContent>

                          </Tooltip>

                        </div>

                      </div>



                      {/* Bulk action bar */}

                      {selectedCount > 0 && (

                        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">

                          <span className="text-sm font-medium">{selectedCount} member(s) selected</span>

                          <div className="flex items-center gap-2">

                            <Button variant="outline" size="sm" onClick={() => table.toggleAllRowsSelected(false)}>

                              Clear selection

                            </Button>

                            <Button size="sm" className="bg-black text-white hover:bg-black/90" onClick={handleBulkDelete}>

                              <Trash2 className="mr-2 h-4 w-4" />

                              Delete ({selectedCount})

                            </Button>

                          </div>

                        </div>

                      )}



                      {/* Data Table */}

                      {loading ? (

                        <div className="rounded-xl border bg-card shadow-lg">

                          <div className="overflow-x-auto">

                            <Table>

                              <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">

                                <TableRow className="hover:bg-transparent">

                                  {[40, 40, 280, 180, 200, 110, 80, 110, 130, 50].map((w, i) => (

                                    <TableHead key={i} style={{ width: w }} className="h-11">

                                      <Skeleton className="h-4 w-12 rounded" />

                                    </TableHead>

                                  ))}

                                </TableRow>

                              </TableHeader>

                              <TableBody>

                                {Array.from({ length: 5 }).map((_, i) => (

                                  <TableRow key={i}>

                                    {[40, 40, 280, 180, 200, 110, 80, 110, 130, 50].map((w, j) => (

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

                            <Users className="h-12 w-12 text-muted-foreground/50" />

                          </div>

                          <h3 className="text-lg font-semibold">No team members found</h3>

                          <p className="text-muted-foreground mt-1 max-w-sm">

                            {activeTab !== "all"

                              ? `No members in the ${activeTab} department. Try switching tabs or add a new member.`

                              : "Get started by adding your first team member."}

                          </p>

                          <Button className="mt-4" onClick={openCreateDrawer}>

                            <IconPlus className="mr-2 h-4 w-4" />

                            Add Team Member

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

                                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

                                        </TableHead>

                                      ))}

                                    </TableRow>

                                  ))}

                                </TableHeader>

                                <TableBody>

                                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>

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

                              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{" "}

                              {Math.min(

                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,

                                table.getFilteredRowModel().rows.length

                              )}{" "}

                              of {table.getFilteredRowModel().rows.length} members

                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

                              <div className="flex items-center gap-2">

                                <Label className="text-sm whitespace-nowrap">Rows per page</Label>

                                <Select

                                  value={`${table.getState().pagination.pageSize}`}

                                  onValueChange={(v) => table.setPageSize(Number(v))}

                                >

                                  <SelectTrigger size="sm" className="w-18 h-8">

                                    <SelectValue placeholder={table.getState().pagination.pageSize} />

                                  </SelectTrigger>

                                  <SelectContent side="top">

                                    {[10, 20, 30, 50, 100].map((ps) => (

                                      <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>

                                    ))}

                                  </SelectContent>

                                </Select>

                              </div>

                              <div className="flex items-center gap-2">

                                <span className="text-sm whitespace-nowrap">

                                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}

                                </span>

                                <div className="flex items-center gap-1">

                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>

                                    <IconChevronsLeft className="h-4 w-4" />

                                  </Button>

                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>

                                    <IconChevronLeft className="h-4 w-4" />

                                  </Button>

                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>

                                    <IconChevronRight className="h-4 w-4" />

                                  </Button>

                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>

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

                </TabsContent>

              </Tabs>

            </div>

          </div>

        </div>



        {/* ═══════ VIEW DRAWER ═══════ */}

        <Drawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Team Member Details</DrawerTitle>

              <DrawerDescription>Full profile information</DrawerDescription>

            </DrawerHeader>

            {viewMember && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  <div className="flex items-center gap-4">

                    {viewMember.image?.url ? (

                      <Image src={viewMember.image.url} alt={viewMember.name} width={64} height={64} className="rounded-full object-cover size-16" />

                    ) : (

                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">

                        {viewMember.name.charAt(0).toUpperCase()}

                      </div>

                    )}

                    <div>

                      <h3 className="text-lg font-semibold">{viewMember.name}</h3>

                      <PositionBadge position={viewMember.position} />

                      {viewMember.tagline && (

                        <p className="text-sm text-muted-foreground mt-1">{viewMember.tagline}</p>

                      )}

                    </div>

                  </div>

                  <div className="grid gap-4">

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Email</span>

                      <span className="text-sm font-medium">{viewMember.email}</span>

                    </div>

                    {viewMember.contactNumber?.number && (

                      <div className="flex justify-between border-b pb-2">

                        <span className="text-sm text-muted-foreground">Contact</span>

                        <span className="text-sm">{viewMember.contactNumber.countryCode} {viewMember.contactNumber.number}</span>

                      </div>

                    )}

                    {viewMember.whatsappNumber?.number && (

                      <div className="flex justify-between border-b pb-2">

                        <span className="text-sm text-muted-foreground">WhatsApp</span>

                        <span className="text-sm">{viewMember.whatsappNumber.countryCode} {viewMember.whatsappNumber.number}</span>

                      </div>

                    )}

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Experience</span>

                      <span className="text-sm">{viewMember.yearsOfExperience} years</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Status</span>

                      <Badge className={viewMember.isActive ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"}>

                        {viewMember.isActive ? "Active" : "Inactive"}

                      </Badge>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Featured</span>

                      <span className="text-sm">{viewMember.isFeatured ? "Yes" : "No"}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Display Order</span>

                      <span className="text-sm">{viewMember.displayOrder}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Joined</span>

                      <span className="text-sm">

                        {new Date(viewMember.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

                      </span>

                    </div>

                  </div>

                  {viewMember.tags && viewMember.tags.length > 0 && (

                    <div>

                      <Label className="text-sm text-muted-foreground">Expertise Tags</Label>

                      <div className="flex flex-wrap gap-1.5 mt-2">

                        {viewMember.tags.map((tag) => (

                          <Badge key={tag} variant="secondary" className="text-xs">

                            {TAG_LABELS[tag] || tag}

                          </Badge>

                        ))}

                      </div>

                    </div>

                  )}

                  {viewMember.bio && (

                    <div>

                      <Label className="text-sm text-muted-foreground">Bio</Label>

                      <p className="mt-2 text-sm leading-relaxed">{viewMember.bio}</p>

                    </div>

                  )}

                </div>

              </div>

            )}

            <DrawerFooter className="border-t px-6 py-4">

              <div className="flex gap-3">

                <DrawerClose asChild>

                  <Button variant="outline" className="flex-1">Close</Button>

                </DrawerClose>

                {viewMember && (

                  <Button

                    className="flex-1"

                    onClick={() => { setViewDrawerOpen(false); openEditDrawer(viewMember); }}

                  >

                    <Edit className="mr-2 h-4 w-4" /> Edit Member

                  </Button>

                )}

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* ═══════ CREATE / EDIT DRAWER ═══════ */}

        <Drawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "560px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DrawerTitle>

              <DrawerDescription>

                {editingMember ? "Update member information" : "Fill in the details to add a new member"}

              </DrawerDescription>

            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="grid gap-5">

                {/* Image Upload */}

                <div className="space-y-2">

                  <Label>Photo</Label>

                  <div className="flex items-center gap-4">

                    {formImagePreview ? (

                      <Image src={formImagePreview} alt="Preview" width={64} height={64} className="rounded-full object-cover size-16 border" />

                    ) : (

                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground text-xl font-bold border border-dashed">

                        ?

                      </div>

                    )}

                    <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-60" />

                  </div>

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label htmlFor="formName">Name *</Label>

                    <Input id="formName" placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="formEmail">Email *</Label>

                    <Input id="formEmail" type="email" placeholder="john@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />

                  </div>

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label>Position *</Label>

                    <Select value={formPosition} onValueChange={setFormPosition}>

                      <SelectTrigger>

                        <SelectValue placeholder="Select position" />

                      </SelectTrigger>

                      <SelectContent>

                        {Object.entries(POSITION_DEPARTMENTS).map(([dept, positions]) => (

                          <React.Fragment key={dept}>

                            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">{dept}</DropdownMenuLabel>

                            {positions.map((pos) => (

                              <SelectItem key={pos} value={pos}>{POSITION_LABELS[pos]}</SelectItem>

                            ))}

                            <DropdownMenuSeparator />

                          </React.Fragment>

                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="formYears">Years of Experience</Label>

                    <Input id="formYears" type="number" min="0" placeholder="15" value={formYears} onChange={(e) => setFormYears(e.target.value)} />

                  </div>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="formTagline">Tagline</Label>

                  <Input id="formTagline" placeholder="Expert in luxury car valuation" value={formTagline} onChange={(e) => setFormTagline(e.target.value)} />

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label>Contact Number</Label>

                    <div className="flex gap-2">

                      <Input className="w-20" placeholder="+1" value={formContactCode} onChange={(e) => setFormContactCode(e.target.value)} />

                      <Input placeholder="5551234567" value={formContactNum} onChange={(e) => setFormContactNum(e.target.value)} />

                    </div>

                  </div>

                  <div className="space-y-2">

                    <Label>WhatsApp Number</Label>

                    <div className="flex gap-2">

                      <Input className="w-20" placeholder="+1" value={formWhatsappCode} onChange={(e) => setFormWhatsappCode(e.target.value)} />

                      <Input placeholder="5551234567" value={formWhatsappNum} onChange={(e) => setFormWhatsappNum(e.target.value)} />

                    </div>

                  </div>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="formBio">Bio</Label>

                  <Textarea id="formBio" placeholder="Write a short bio..." value={formBio} onChange={(e) => setFormBio(e.target.value)} rows={4} />

                </div>



                {/* Tags */}

                <div className="space-y-2">

                  <Label>Expertise Tags</Label>

                  <div className="flex flex-wrap gap-2">

                    {Object.values(TeamMemberTag).map((tag) => (

                      <Badge

                        key={tag}

                        variant={formTags.includes(tag) ? "default" : "outline"}

                        className="cursor-pointer transition-all hover:scale-105"

                        onClick={() => handleTagToggle(tag)}

                      >

                        {formTags.includes(tag) && <IconCheck className="size-3 mr-1" />}

                        {TAG_LABELS[tag]}

                      </Badge>

                    ))}

                  </div>

                </div>



                <div className="grid grid-cols-3 gap-4">

                  <div className="flex items-center gap-3">

                    <Switch checked={formIsActive} onCheckedChange={setFormIsActive} id="formIsActive" />

                    <Label htmlFor="formIsActive">Active</Label>

                  </div>

                  <div className="flex items-center gap-3">

                    <Switch checked={formIsFeatured} onCheckedChange={setFormIsFeatured} id="formIsFeatured" />

                    <Label htmlFor="formIsFeatured">Featured</Label>

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="formOrder">Order</Label>

                    <Input id="formOrder" type="number" min="1" value={formDisplayOrder} onChange={(e) => setFormDisplayOrder(e.target.value)} />

                  </div>

                </div>

              </div>

            </div>

            <DrawerFooter className="border-t px-6 py-4">

              <div className="flex gap-3">

                <DrawerClose asChild>

                  <Button variant="outline" className="flex-1">Cancel</Button>

                </DrawerClose>

                <Button className="flex-1" onClick={handleSubmitForm} disabled={creating || updating}>

                  {(creating || updating) ? (

                    <><IconLoader className="mr-2 h-4 w-4 animate-spin" />{editingMember ? "Updating..." : "Creating..."}</>

                  ) : (

                    <>{editingMember ? <><Edit className="mr-2 h-4 w-4" />Update Member</> : <><IconPlus className="mr-2 h-4 w-4" />Add Member</>}</>

                  )}

                </Button>

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* ═══════ DELETE DIALOG ═══════ */}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Delete Team Member</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete <strong>{memberToDelete?.name}</strong>? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>

                Delete

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* ═══════ BULK DELETE DIALOG ═══════ */}

        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Bulk Delete Team Members</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete {selectedCount} member(s)? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmBulkDelete} disabled={bulkDeleting}>

                {bulkDeleting ? (

                  <><IconLoader className="mr-2 h-4 w-4 animate-spin" />Deleting...</>

                ) : (

                  `Delete ${selectedCount}`

                )}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



      </SidebarInset>

    </SidebarProvider>

  );

}

