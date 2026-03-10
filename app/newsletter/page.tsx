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

  Trash2,

  Calendar,

  Eye,

  Mail,

  MailPlus,

  Send,

  Users,

  UserCheck,

  UserX,

  TrendingUp,

  Megaphone,

  TestTube,

} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchSubscriptions,

  fetchNewsletterStats,

  deleteSubscription,

  bulkDeleteSubscriptions,

  fetchCampaigns,

  createCampaign,

  sendCampaign,

  deleteCampaign,

  sendQuickEmail,

  sendTestEmail,

  fetchMarketingStats,

  type Subscription,

  type Campaign,

} from "@/lib/redux/newsletterSlice";

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



// ─── Draggable Row (Subscriptions) ────────────────────────

function DraggableSubRow({ row }: { row: Row<Subscription> }) {

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



// ─── Draggable Row (Campaigns) ────────────────────────────

function DraggableCampaignRow({ row }: { row: Row<Campaign> }) {

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

function getStatusBadge(isActive: boolean) {

  return isActive ? (

    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">

      Active

    </Badge>

  ) : (

    <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400">

      Inactive

    </Badge>

  );

}



function getCampaignStatusBadge(status?: string) {

  switch (status?.toLowerCase()) {

    case "sent":

      return (

        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">

          Sent

        </Badge>

      );

    case "draft":

      return (

        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400">

          Draft

        </Badge>

      );

    case "sending":

      return (

        <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">

          Sending

        </Badge>

      );

    default:

      return <Badge variant="outline">{status || "Draft"}</Badge>;

  }

}



// ─── Stats Cards ──────────────────────────────────────────

function NewsletterCards() {

  const { subscriptions, stats, marketingStats } = useAppSelector((s) => s.newsletter);



  const total = stats?.total ?? subscriptions.length;

  const active = stats?.active ?? subscriptions.filter((s) => s.isActive).length;

  const inactive = stats?.inactive ?? subscriptions.filter((s) => !s.isActive).length;

  const campaignsTotal = marketingStats?.campaigns?.total ?? 0;



  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>

          <Users className="h-4 w-4 text-muted-foreground" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{total}</div>

          <p className="text-xs text-muted-foreground">All newsletter subscribers</p>

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

          <p className="text-xs text-muted-foreground">Unsubscribed</p>

        </CardContent>

      </Card>

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium">Campaigns</CardTitle>

          <Megaphone className="h-4 w-4 text-blue-500" />

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold">{campaignsTotal}</div>

          <p className="text-xs text-muted-foreground">

            {marketingStats?.campaigns?.sent ?? 0} sent

          </p>

        </CardContent>

      </Card>

    </div>

  );

}



// ─── Main Page ────────────────────────────────────────────

export default function NewsletterPage() {

  const dispatch = useAppDispatch();

  const { subscriptions, campaigns, loading, campaignsLoading, creating, sending } =

    useAppSelector((s) => s.newsletter);



  const hasFetched = React.useRef(false);



  // Subscribers table state

  const [subData, setSubData] = React.useState<Subscription[]>([]);

  const [subRowSelection, setSubRowSelection] = React.useState({});

  const [subColumnVisibility, setSubColumnVisibility] = React.useState<VisibilityState>({});

  const [subColumnFilters, setSubColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [subSorting, setSubSorting] = React.useState<SortingState>([]);

  const [subPagination, setSubPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const [subGlobalFilter, setSubGlobalFilter] = React.useState("");



  // Campaign table state

  const [campData, setCampData] = React.useState<Campaign[]>([]);

  const [campRowSelection, setCampRowSelection] = React.useState({});

  const [campColumnVisibility, setCampColumnVisibility] = React.useState<VisibilityState>({});

  const [campColumnFilters, setCampColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [campSorting, setCampSorting] = React.useState<SortingState>([]);

  const [campPagination, setCampPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const [campGlobalFilter, setCampGlobalFilter] = React.useState("");



  const [mounted, setMounted] = React.useState(false);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("subscribers");



  // Delete dialog state

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [subToDelete, setSubToDelete] = React.useState<Subscription | null>(null);

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);

  const [bulkDeleting, setBulkDeleting] = React.useState(false);



  // Campaign delete dialog

  const [campDeleteDialogOpen, setCampDeleteDialogOpen] = React.useState(false);

  const [campToDelete, setCampToDelete] = React.useState<Campaign | null>(null);



  // Send campaign dialog

  const [sendDialogOpen, setSendDialogOpen] = React.useState(false);

  const [campToSend, setCampToSend] = React.useState<Campaign | null>(null);



  // View drawer

  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);

  const [viewSubscription, setViewSubscription] = React.useState<Subscription | null>(null);



  // Campaign view drawer

  const [campViewDrawerOpen, setCampViewDrawerOpen] = React.useState(false);

  const [viewCampaign, setViewCampaign] = React.useState<Campaign | null>(null);



  // Create campaign drawer

  const [campaignDrawerOpen, setCampaignDrawerOpen] = React.useState(false);

  const [campaignName, setCampaignName] = React.useState("");

  const [campaignSubject, setCampaignSubject] = React.useState("");

  const [campaignContent, setCampaignContent] = React.useState("");



  // Quick email drawer

  const [quickEmailDrawerOpen, setQuickEmailDrawerOpen] = React.useState(false);

  const [quickEmailSubject, setQuickEmailSubject] = React.useState("");

  const [quickEmailContent, setQuickEmailContent] = React.useState("");



  // Test email dialog

  const [testEmailDialogOpen, setTestEmailDialogOpen] = React.useState(false);

  const [testEmailAddress, setTestEmailAddress] = React.useState("");



  const sortableSubId = React.useId();

  const sortableCampId = React.useId();



  const sensors = useSensors(

    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),

    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),

    useSensor(KeyboardSensor, {})

  );



  React.useEffect(() => {

    if (!hasFetched.current) {

      hasFetched.current = true;

      dispatch(fetchSubscriptions());

      dispatch(fetchCampaigns());

      dispatch(fetchMarketingStats());

    }

  }, [dispatch]);



  React.useEffect(() => {

    if (subscriptions) setSubData(subscriptions.filter((s) => s && s._id));

  }, [subscriptions]);



  React.useEffect(() => {

    if (campaigns) setCampData(campaigns.filter((c) => c && c._id));

  }, [campaigns]);



  React.useEffect(() => {

    setMounted(true);

  }, []);



  const subDataIds = React.useMemo<UniqueIdentifier[]>(

    () => subData?.map(({ _id }) => _id) || [],

    [subData]

  );



  const campDataIds = React.useMemo<UniqueIdentifier[]>(

    () => campData?.map(({ _id }) => _id) || [],

    [campData]

  );



  // ─── Subscription Handlers ─────────────────────────────

  const handleDeleteSub = (sub: Subscription) => {

    setSubToDelete(sub);

    setDeleteDialogOpen(true);

  };



  const confirmDeleteSub = async () => {

    if (!subToDelete) return;

    const result = await dispatch(deleteSubscription(subToDelete._id));

    if (deleteSubscription.fulfilled.match(result)) {

      toast.success("Subscription deleted successfully");

      setDeleteDialogOpen(false);

      setSubToDelete(null);

    } else {

      toast.error(result.payload ?? "Failed to delete subscription");

    }

  };



  const handleBulkDelete = () => {

    const selectedRows = subTable.getFilteredSelectedRowModel().rows;

    if (selectedRows.length === 0) return;

    setBulkDeleteDialogOpen(true);

  };



  const confirmBulkDelete = async () => {

    const selectedRows = subTable.getFilteredSelectedRowModel().rows;

    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) return;

    setBulkDeleting(true);

    const result = await dispatch(bulkDeleteSubscriptions(ids));

    if (bulkDeleteSubscriptions.fulfilled.match(result)) {

      toast.success(`${ids.length} subscription(s) deleted successfully`);

      setBulkDeleteDialogOpen(false);

      subTable.toggleAllRowsSelected(false);

    } else {

      toast.error(result.payload ?? "Failed to bulk delete");

    }

    setBulkDeleting(false);

  };



  // ─── Quick Email to Selected ───────────────────────────

  const handleQuickEmailSelected = () => {

    const selectedRows = subTable.getFilteredSelectedRowModel().rows;

    if (selectedRows.length === 0) {

      toast.error("Please select subscribers first");

      return;

    }

    setQuickEmailSubject("");

    setQuickEmailContent("");

    setQuickEmailDrawerOpen(true);

  };



  const handleSendQuickEmail = async () => {

    if (!quickEmailSubject.trim() || !quickEmailContent.trim()) {

      toast.error("Subject and content are required.");

      return;

    }

    const selectedRows = subTable.getFilteredSelectedRowModel().rows;

    const selectedEmails = selectedRows.map((row) => row.original.email);

    if (selectedEmails.length === 0) {

      toast.error("No subscribers selected.");

      return;

    }

    const result = await dispatch(

      sendQuickEmail({

        subject: quickEmailSubject.trim(),

        content: quickEmailContent.trim(),

        selectedEmails,

      })

    );

    if (sendQuickEmail.fulfilled.match(result)) {

      toast.success(`Email sent to ${result.payload.totalRecipients} recipient(s)`);

      setQuickEmailDrawerOpen(false);

      subTable.toggleAllRowsSelected(false);

    } else {

      toast.error(result.payload ?? "Failed to send email");

    }

  };



  // ─── Test Email Handler ────────────────────────────────

  const handleSendTestEmail = async () => {

    if (!testEmailAddress.trim()) {

      toast.error("Email address is required.");

      return;

    }

    const result = await dispatch(sendTestEmail(testEmailAddress.trim()));

    if (sendTestEmail.fulfilled.match(result)) {

      toast.success(`Test email sent to ${result.payload.email}`);

      setTestEmailDialogOpen(false);

      setTestEmailAddress("");

    } else {

      toast.error(result.payload ?? "Failed to send test email");

    }

  };



  // ─── Campaign Handlers ────────────────────────────────

  const handleDeleteCampaign = (camp: Campaign) => {

    setCampToDelete(camp);

    setCampDeleteDialogOpen(true);

  };



  const confirmDeleteCampaign = async () => {

    if (!campToDelete) return;

    const result = await dispatch(deleteCampaign(campToDelete._id));

    if (deleteCampaign.fulfilled.match(result)) {

      toast.success("Campaign deleted successfully");

      setCampDeleteDialogOpen(false);

      setCampToDelete(null);

    } else {

      toast.error(result.payload ?? "Failed to delete campaign");

    }

  };



  const handleSendCampaign = (camp: Campaign) => {

    setCampToSend(camp);

    setSendDialogOpen(true);

  };



  const confirmSendCampaign = async () => {

    if (!campToSend) return;

    const result = await dispatch(sendCampaign(campToSend._id));

    if (sendCampaign.fulfilled.match(result)) {

      toast.success(`Campaign sent to ${result.payload.totalRecipients} recipient(s)`);

      setSendDialogOpen(false);

      setCampToSend(null);

      dispatch(fetchCampaigns());

    } else {

      toast.error(result.payload ?? "Failed to send campaign");

    }

  };



  const handleCreateCampaign = async () => {

    if (!campaignName.trim() || !campaignSubject.trim() || !campaignContent.trim()) {

      toast.error("Name, subject, and content are required.");

      return;

    }

    const activeEmails = subData.filter((s) => s.isActive).map((s) => s.email);

    const result = await dispatch(

      createCampaign({

        name: campaignName.trim(),

        subject: campaignSubject.trim(),

        content: campaignContent.trim(),

        recipients: activeEmails,

      })

    );

    if (createCampaign.fulfilled.match(result)) {

      toast.success("Campaign created successfully!");

      setCampaignDrawerOpen(false);

      setCampaignName("");

      setCampaignSubject("");

      setCampaignContent("");

    } else {

      toast.error(result.payload ?? "Failed to create campaign.");

    }

  };



  // ─── Subscriber Columns ────────────────────────────────

  const subColumns = React.useMemo<ColumnDef<Subscription>[]>(

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

        accessorKey: "email",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            Email

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => (

          <div className="flex items-center gap-2">

            <Mail className="size-4 text-primary/70 shrink-0" />

            <span className="font-medium">{row.original.email}</span>

          </div>

        ),

        enableHiding: false,

        size: 300,

      },

      {

        accessorKey: "isActive",

        header: "Status",

        cell: ({ row }) => getStatusBadge(row.original.isActive),

        size: 110,

      },

      {

        accessorKey: "createdAt",

        header: "Subscribed On",

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

        size: 150,

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

                  onClick={() => {

                    setViewSubscription(row.original);

                    setViewDrawerOpen(true);

                  }}

                >

                  <Eye className="h-4 w-4" />

                  <span>View Details</span>

                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>

                </DropdownMenuItem>

                <DropdownMenuItem

                  className="cursor-pointer gap-2"

                  onClick={() => {

                    setQuickEmailSubject("");

                    setQuickEmailContent("");

                    row.toggleSelected(true);

                    setQuickEmailDrawerOpen(true);

                  }}

                >

                  <Send className="h-4 w-4" />

                  <span>Send Email</span>

                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>

                </DropdownMenuItem>

              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                variant="destructive"

                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"

                onClick={() => handleDeleteSub(row.original)}

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



  // ─── Campaign Columns ──────────────────────────────────

  const campColumns = React.useMemo<ColumnDef<Campaign>[]>(

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

        accessorKey: "name",

        header: ({ column }) => (

          <Button

            variant="ghost"

            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

            className="hover:bg-transparent font-semibold"

          >

            Campaign Name

            <IconChevronDown className="ml-2 h-4 w-4" />

          </Button>

        ),

        cell: ({ row }) => (

          <Button

            variant="link"

            className="text-foreground hover:text-primary w-fit px-0 text-left font-medium"

            onClick={() => {

              setViewCampaign(row.original);

              setCampViewDrawerOpen(true);

            }}

          >

            <div className="flex items-center gap-2">

              <Megaphone className="size-4 text-primary/70 shrink-0" />

              <span className="truncate max-w-48">{row.original.name}</span>

            </div>

          </Button>

        ),

        enableHiding: false,

        size: 250,

      },

      {

        accessorKey: "subject",

        header: "Subject",

        cell: ({ row }) => (

          <span className="text-sm truncate max-w-48 block">{row.original.subject}</span>

        ),

        size: 200,

      },

      {

        accessorKey: "status",

        header: "Status",

        cell: ({ row }) => getCampaignStatusBadge(row.original.status),

        size: 110,

      },

      {

        accessorKey: "recipients",

        header: "Recipients",

        cell: ({ row }) => (

          <div className="flex items-center gap-1.5">

            <Users className="size-3.5 text-muted-foreground" />

            <span className="text-sm">{row.original.recipients?.length ?? 0}</span>

          </div>

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

                className="data-[state=open]:bg-primary/10 text-muted-foreground hover:text-foreground flex size-8 transition-all duration-200 hover:scale-110"

                size="icon"

              >

                <IconDotsVertical className="size-4" />

                <span className="sr-only">Open menu</span>

              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">

              <DropdownMenuLabel>Campaign Actions</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>

                <DropdownMenuItem

                  className="cursor-pointer gap-2"

                  onClick={() => {

                    setViewCampaign(row.original);

                    setCampViewDrawerOpen(true);

                  }}

                >

                  <Eye className="h-4 w-4" />

                  <span>View Details</span>

                </DropdownMenuItem>

                <DropdownMenuItem

                  className="cursor-pointer gap-2"

                  onClick={() => handleSendCampaign(row.original)}

                >

                  <Send className="h-4 w-4" />

                  <span>Send Campaign</span>

                </DropdownMenuItem>

              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                variant="destructive"

                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"

                onClick={() => handleDeleteCampaign(row.original)}

              >

                <Trash2 className="h-4 w-4" />

                <span>Delete</span>

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



  // ─── Tables ────────────────────────────────────────────

  const subTable = useReactTable({

    data: subData,

    columns: subColumns,

    state: {

      sorting: subSorting,

      columnVisibility: subColumnVisibility,

      rowSelection: subRowSelection,

      columnFilters: subColumnFilters,

      pagination: subPagination,

      globalFilter: subGlobalFilter,

    },

    getRowId: (row) => row._id,

    enableRowSelection: true,

    onRowSelectionChange: setSubRowSelection,

    onSortingChange: setSubSorting,

    onColumnFiltersChange: setSubColumnFilters,

    onColumnVisibilityChange: setSubColumnVisibility,

    onPaginationChange: setSubPagination,

    onGlobalFilterChange: setSubGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),

    getFacetedUniqueValues: getFacetedUniqueValues(),

  });



  const campTable = useReactTable({

    data: campData,

    columns: campColumns,

    state: {

      sorting: campSorting,

      columnVisibility: campColumnVisibility,

      rowSelection: campRowSelection,

      columnFilters: campColumnFilters,

      pagination: campPagination,

      globalFilter: campGlobalFilter,

    },

    getRowId: (row) => row._id,

    enableRowSelection: true,

    onRowSelectionChange: setCampRowSelection,

    onSortingChange: setCampSorting,

    onColumnFiltersChange: setCampColumnFilters,

    onColumnVisibilityChange: setCampColumnVisibility,

    onPaginationChange: setCampPagination,

    onGlobalFilterChange: setCampGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),

    getFacetedUniqueValues: getFacetedUniqueValues(),

  });



  // ─── Drag End Handlers ─────────────────────────────────

  function handleSubDragEnd(event: DragEndEvent) {

    const { active, over } = event;

    if (active && over && active.id !== over.id) {

      setSubData((d) => {

        const oldIndex = subDataIds.indexOf(active.id);

        const newIndex = subDataIds.indexOf(over.id);

        return arrayMove(d, oldIndex, newIndex);

      });

      toast.success("Reordered successfully", {

        icon: <IconCheck className="h-4 w-4" />,

      });

    }

  }



  function handleCampDragEnd(event: DragEndEvent) {

    const { active, over } = event;

    if (active && over && active.id !== over.id) {

      setCampData((d) => {

        const oldIndex = campDataIds.indexOf(active.id);

        const newIndex = campDataIds.indexOf(over.id);

        return arrayMove(d, oldIndex, newIndex);

      });

      toast.success("Reordered successfully", {

        icon: <IconCheck className="h-4 w-4" />,

      });

    }

  }



  const handleRefresh = async () => {

    setIsRefreshing(true);

    await Promise.all([

      dispatch(fetchSubscriptions()),

      dispatch(fetchCampaigns()),

      dispatch(fetchMarketingStats()),

    ]);

    setIsRefreshing(false);

    toast.success("Data refreshed successfully");

  };



  const handleDownloadPDF = () => {

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);

    doc.text("Newsletter Subscribers Report", 14, 18);

    doc.setFontSize(10);

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);



    const rows = subTable.getFilteredRowModel().rows;

    const tableData = rows.map((row) => {

      const s = row.original;

      return [

        s.email || "",

        s.isActive ? "Active" : "Inactive",

        s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "",

      ];

    });



    autoTable(doc, {

      head: [["Email", "Status", "Subscribed On"]],

      body: tableData,

      startY: 30,

      styles: { fontSize: 8 },

      headStyles: { fillColor: [41, 128, 185] },

    });



    doc.save("newsletter-subscribers.pdf");

    toast.success("PDF downloaded successfully");

  };



  if (!mounted) return null;



  const selectedSubCount = subTable.getFilteredSelectedRowModel().rows.length;



  // ─── Helper: render a data table ───────────────────────

  const renderTable = <T extends { _id: string }>(

    table: ReturnType<typeof useReactTable<T>>,

    dataIds: UniqueIdentifier[],

    onDragEnd: (e: DragEndEvent) => void,

    sortableId: string,

    DraggableRowComponent: React.ComponentType<{ row: Row<T> }>,

    isLoading: boolean,

    emptyMessage: string,

    colWidths: number[],

    emptyAction?: () => void,

    emptyActionLabel?: string

  ) => {

    if (isLoading) {

      return (

        <div className="rounded-xl border bg-card shadow-lg">

          <div className="overflow-x-auto">

            <Table>

              <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">

                <TableRow className="hover:bg-transparent">

                  {colWidths.map((w, i) => (

                    <TableHead key={i} style={{ width: w }} className="h-11">

                      <Skeleton className="h-4 w-12 rounded" />

                    </TableHead>

                  ))}

                </TableRow>

              </TableHeader>

              <TableBody>

                {Array.from({ length: 5 }).map((_, i) => (

                  <TableRow key={i}>

                    {colWidths.map((w, j) => (

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

      );

    }



    if (table.getFilteredRowModel().rows.length === 0) {

      return (

        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card shadow-lg">

          <div className="rounded-full bg-muted p-4 mb-4">

            <Mail className="h-12 w-12 text-muted-foreground/50" />

          </div>

          <h3 className="text-lg font-semibold">{emptyMessage}</h3>

          <p className="text-muted-foreground mt-1 max-w-sm">

            Get started by adding data to your newsletter system.

          </p>

          {emptyAction && emptyActionLabel && (

            <Button className="mt-4" onClick={emptyAction}>

              <IconPlus className="mr-2 h-4 w-4" />

              {emptyActionLabel}

            </Button>

          )}

        </div>

      );

    }



    return (

      <div className="rounded-xl border bg-card shadow-lg">

        <div className="overflow-x-auto">

          <DndContext

            collisionDetection={closestCenter}

            modifiers={[restrictToVerticalAxis]}

            onDragEnd={onDragEnd}

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

                          : flexRender(header.column.columnDef.header, header.getContext())}

                      </TableHead>

                    ))}

                  </TableRow>

                ))}

              </TableHeader>

              <TableBody>

                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>

                  {table.getRowModel().rows.map((row) => (

                    <DraggableRowComponent key={row.id} row={row} />

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

            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{" "}

            {Math.min(

              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,

              table.getFilteredRowModel().rows.length

            )}{" "}

            of {table.getFilteredRowModel().rows.length} items

          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

            <div className="flex items-center gap-2">

              <Label className="text-sm whitespace-nowrap">Rows per page</Label>

              <Select

                value={`${table.getState().pagination.pageSize}`}

                onValueChange={(value) => table.setPageSize(Number(value))}

              >

                <SelectTrigger size="sm" className="w-18 h-8">

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

                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}

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

    );

  };



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

                  <h1 className="text-2xl font-bold tracking-tight">Newsletter</h1>

                  <p className="text-muted-foreground">

                    Manage subscribers, campaigns & email marketing

                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <Button

                    variant="outline"

                    size="sm"

                    className="h-9 gap-2"

                    onClick={() => {

                      setTestEmailAddress("");

                      setTestEmailDialogOpen(true);

                    }}

                  >

                    <TestTube className="size-3.5" />

                    <span className="hidden lg:inline">Test Email</span>

                  </Button>

                  <Button

                    variant="outline"

                    size="sm"

                    className="h-9 gap-2"

                    onClick={handleQuickEmailSelected}

                  >

                    <Send className="size-3.5" />

                    <span className="hidden lg:inline">Quick Email</span>

                  </Button>

                  <Button

                    variant="default"

                    size="sm"

                    className="h-9 gap-2 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"

                    onClick={() => {

                      setCampaignName("");

                      setCampaignSubject("");

                      setCampaignContent("");

                      setCampaignDrawerOpen(true);

                    }}

                  >

                    <MailPlus className="size-3.5" />

                    <span className="hidden lg:inline">New Campaign</span>

                  </Button>

                </div>

              </div>



              <NewsletterCards />



              <Tabs value={activeTab} onValueChange={setActiveTab}>

                <TabsList>

                  <TabsTrigger value="subscribers" className="gap-2">

                    <Users className="size-4" />

                    Subscribers

                  </TabsTrigger>

                  <TabsTrigger value="campaigns" className="gap-2">

                    <Megaphone className="size-4" />

                    Campaigns

                  </TabsTrigger>

                </TabsList>



                {/* ═══════ SUBSCRIBERS TAB ═══════ */}

                <TabsContent value="subscribers">

                  <TooltipProvider>

                    <div className="w-full flex flex-col gap-4">

                      {/* Toolbar */}

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 flex-1">

                          <div className="relative flex-1 max-w-md">

                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input

                              placeholder="Search subscribers..."

                              value={subGlobalFilter ?? ""}

                              onChange={(e) => setSubGlobalFilter(e.target.value)}

                              className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"

                            />

                          </div>

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

                              {subTable

                                .getAllColumns()

                                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())

                                .map((col) => (

                                  <DropdownMenuCheckboxItem

                                    key={col.id}

                                    className="capitalize cursor-pointer"

                                    checked={col.getIsVisible()}

                                    onCheckedChange={(v) => col.toggleVisibility(!!v)}

                                  >

                                    {col.id === "isActive" ? "Status" : col.id === "createdAt" ? "Subscribed On" : col.id}

                                  </DropdownMenuCheckboxItem>

                                ))}

                            </DropdownMenuContent>

                          </DropdownMenu>

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

                      {selectedSubCount > 0 && (

                        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">

                          <span className="text-sm font-medium">

                            {selectedSubCount} subscriber(s) selected

                          </span>

                          <div className="flex items-center gap-2">

                            <Button variant="outline" size="sm" onClick={() => subTable.toggleAllRowsSelected(false)}>

                              Clear selection

                            </Button>

                            <Button

                              size="sm"

                              variant="outline"

                              className="gap-2"

                              onClick={handleQuickEmailSelected}

                            >

                              <Send className="h-4 w-4" />

                              Email ({selectedSubCount})

                            </Button>

                            <Button

                              size="sm"

                              className="bg-black text-white hover:bg-black/90"

                              onClick={handleBulkDelete}

                            >

                              <Trash2 className="mr-2 h-4 w-4" />

                              Delete ({selectedSubCount})

                            </Button>

                          </div>

                        </div>

                      )}



                      {renderTable(

                        subTable,

                        subDataIds,

                        handleSubDragEnd,

                        sortableSubId,

                        DraggableSubRow,

                        loading,

                        "No subscribers found",

                        [40, 40, 300, 110, 150, 50],

                        undefined,

                        undefined

                      )}

                    </div>

                  </TooltipProvider>

                </TabsContent>



                {/* ═══════ CAMPAIGNS TAB ═══════ */}

                <TabsContent value="campaigns">

                  <TooltipProvider>

                    <div className="w-full flex flex-col gap-4">

                      {/* Toolbar */}

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 flex-1">

                          <div className="relative flex-1 max-w-md">

                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input

                              placeholder="Search campaigns..."

                              value={campGlobalFilter ?? ""}

                              onChange={(e) => setCampGlobalFilter(e.target.value)}

                              className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"

                            />

                          </div>

                          <Button

                            variant="default"

                            size="sm"

                            className="h-9 gap-2 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"

                            onClick={() => {

                              setCampaignName("");

                              setCampaignSubject("");

                              setCampaignContent("");

                              setCampaignDrawerOpen(true);

                            }}

                          >

                            <IconPlus className="size-3.5" />

                            <span className="hidden lg:inline">New Campaign</span>

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

                                disabled={isRefreshing || campaignsLoading}

                              >

                                <IconRefresh className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />

                              </Button>

                            </TooltipTrigger>

                            <TooltipContent>Refresh data</TooltipContent>

                          </Tooltip>

                        </div>

                      </div>



                      {renderTable(

                        campTable,

                        campDataIds,

                        handleCampDragEnd,

                        sortableCampId,

                        DraggableCampaignRow,

                        campaignsLoading,

                        "No campaigns found",

                        [40, 40, 250, 200, 110, 100, 130, 50],

                        () => {

                          setCampaignName("");

                          setCampaignSubject("");

                          setCampaignContent("");

                          setCampaignDrawerOpen(true);

                        },

                        "Create First Campaign"

                      )}

                    </div>

                  </TooltipProvider>

                </TabsContent>

              </Tabs>

            </div>

          </div>

        </div>



        {/* ═══════ DRAWERS & DIALOGS ═══════ */}



        {/* View Subscription Drawer */}

        <Drawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Subscription Details</DrawerTitle>

              <DrawerDescription>View subscriber information</DrawerDescription>

            </DrawerHeader>

            {viewSubscription && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">

                      <Mail className="h-6 w-6 text-primary" />

                    </div>

                    <div>

                      <h3 className="text-lg font-semibold">{viewSubscription.email}</h3>

                      {getStatusBadge(viewSubscription.isActive)}

                    </div>

                  </div>

                  <div className="grid gap-4">

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Email</span>

                      <span className="text-sm font-medium">{viewSubscription.email}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Status</span>

                      <span className="text-sm">{viewSubscription.isActive ? "Active" : "Inactive"}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Subscribed On</span>

                      <span className="text-sm">

                        {new Date(viewSubscription.createdAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

                      </span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Last Updated</span>

                      <span className="text-sm">

                        {new Date(viewSubscription.updatedAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

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



        {/* View Campaign Drawer */}

        <Drawer open={campViewDrawerOpen} onOpenChange={setCampViewDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Campaign Details</DrawerTitle>

              <DrawerDescription>View campaign information</DrawerDescription>

            </DrawerHeader>

            {viewCampaign && (

              <div className="flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">

                      <Megaphone className="h-6 w-6 text-blue-600" />

                    </div>

                    <div>

                      <h3 className="text-lg font-semibold">{viewCampaign.name}</h3>

                      {getCampaignStatusBadge(viewCampaign.status)}

                    </div>

                  </div>

                  <div className="grid gap-4">

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Subject</span>

                      <span className="text-sm font-medium">{viewCampaign.subject}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Recipients</span>

                      <span className="text-sm">{viewCampaign.recipients?.length ?? 0}</span>

                    </div>

                    <div className="flex justify-between border-b pb-2">

                      <span className="text-sm text-muted-foreground">Created</span>

                      <span className="text-sm">

                        {new Date(viewCampaign.createdAt).toLocaleDateString("en-US", {

                          month: "long",

                          day: "numeric",

                          year: "numeric",

                        })}

                      </span>

                    </div>

                    {viewCampaign.sentAt && (

                      <div className="flex justify-between border-b pb-2">

                        <span className="text-sm text-muted-foreground">Sent At</span>

                        <span className="text-sm">

                          {new Date(viewCampaign.sentAt).toLocaleDateString("en-US", {

                            month: "long",

                            day: "numeric",

                            year: "numeric",

                          })}

                        </span>

                      </div>

                    )}

                  </div>

                  <div>

                    <Label className="text-sm text-muted-foreground">Content Preview</Label>

                    <div

                      className="mt-2 rounded-lg border p-4 prose prose-sm dark:prose-invert max-w-none"

                      dangerouslySetInnerHTML={{ __html: viewCampaign.content }}

                    />

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

                {viewCampaign && (

                  <Button

                    className="flex-1"

                    onClick={() => {

                      setCampViewDrawerOpen(false);

                      handleSendCampaign(viewCampaign);

                    }}

                  >

                    <Send className="mr-2 h-4 w-4" />

                    Send Campaign

                  </Button>

                )}

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* Create Campaign Drawer */}

        <Drawer open={campaignDrawerOpen} onOpenChange={setCampaignDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Create Email Campaign</DrawerTitle>

              <DrawerDescription>

                Create a new campaign to send to all active subscribers

              </DrawerDescription>

            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="grid gap-5">

                <div className="space-y-2">

                  <Label htmlFor="campName">Campaign Name *</Label>

                  <Input

                    id="campName"

                    placeholder="e.g., Weekly Newsletter"

                    value={campaignName}

                    onChange={(e) => setCampaignName(e.target.value)}

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="campSubject">Email Subject *</Label>

                  <Input

                    id="campSubject"

                    placeholder="e.g., Latest Car Deals and Reviews"

                    value={campaignSubject}

                    onChange={(e) => setCampaignSubject(e.target.value)}

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="campContent">Email Content (HTML) *</Label>

                  <Textarea

                    id="campContent"

                    placeholder="Write your email content here... HTML is supported."

                    value={campaignContent}

                    onChange={(e) => setCampaignContent(e.target.value)}

                    rows={12}

                  />

                </div>

                <div className="rounded-lg border bg-muted/30 p-3">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <TrendingUp className="h-4 w-4" />

                    <span>

                      This campaign will be sent to{" "}

                      <strong>{subData.filter((s) => s.isActive).length}</strong> active subscriber(s).

                    </span>

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

                <Button className="flex-1" onClick={handleCreateCampaign} disabled={creating}>

                  {creating ? (

                    <>

                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                      Creating...

                    </>

                  ) : (

                    <>

                      <MailPlus className="mr-2 h-4 w-4" />

                      Create Campaign

                    </>

                  )}

                </Button>

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* Quick Email Drawer */}

        <Drawer open={quickEmailDrawerOpen} onOpenChange={setQuickEmailDrawerOpen} direction="right">

          <DrawerContent

            className="fixed inset-y-0 right-0 w-full sm:w-130 rounded-none border-l bg-background flex flex-col h-full"

            style={{ maxWidth: "520px" }}

          >

            <DrawerHeader className="border-b px-6 py-4">

              <DrawerTitle>Send Quick Email</DrawerTitle>

              <DrawerDescription>

                Send an email to selected subscribers

              </DrawerDescription>

            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">

              <div className="grid gap-5">

                <div className="rounded-lg border bg-muted/30 p-3">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <Users className="h-4 w-4" />

                    <span>

                      Sending to{" "}

                      <strong>{subTable.getFilteredSelectedRowModel().rows.length}</strong>{" "}

                      selected subscriber(s)

                    </span>

                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">

                    {subTable.getFilteredSelectedRowModel().rows.slice(0, 5).map((row) => (

                      <Badge key={row.original._id} variant="secondary" className="text-xs">

                        {row.original.email}

                      </Badge>

                    ))}

                    {subTable.getFilteredSelectedRowModel().rows.length > 5 && (

                      <Badge variant="outline" className="text-xs">

                        +{subTable.getFilteredSelectedRowModel().rows.length - 5} more

                      </Badge>

                    )}

                  </div>

                </div>

                <div className="space-y-2">

                  <Label htmlFor="quickSubject">Subject *</Label>

                  <Input

                    id="quickSubject"

                    placeholder="Email subject line"

                    value={quickEmailSubject}

                    onChange={(e) => setQuickEmailSubject(e.target.value)}

                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="quickContent">Content (HTML) *</Label>

                  <Textarea

                    id="quickContent"

                    placeholder="Write your email content here..."

                    value={quickEmailContent}

                    onChange={(e) => setQuickEmailContent(e.target.value)}

                    rows={10}

                  />

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

                <Button className="flex-1" onClick={handleSendQuickEmail} disabled={sending}>

                  {sending ? (

                    <>

                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                      Sending...

                    </>

                  ) : (

                    <>

                      <Send className="mr-2 h-4 w-4" />

                      Send Email

                    </>

                  )}

                </Button>

              </div>

            </DrawerFooter>

          </DrawerContent>

        </Drawer>



        {/* Delete Subscription Dialog */}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete the subscription for{" "}

                <strong>{subToDelete?.email}</strong>? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction

                className="bg-red-600 hover:bg-red-700"

                onClick={confirmDeleteSub}

              >

                Delete

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* Bulk Delete Dialog */}

        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Bulk Delete Subscriptions</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete {selectedSubCount} subscription(s)? This action

                cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction

                className="bg-red-600 hover:bg-red-700"

                onClick={confirmBulkDelete}

                disabled={bulkDeleting}

              >

                {bulkDeleting ? (

                  <>

                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                    Deleting...

                  </>

                ) : (

                  `Delete ${selectedSubCount}`

                )}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* Delete Campaign Dialog */}

        <AlertDialog open={campDeleteDialogOpen} onOpenChange={setCampDeleteDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to delete the campaign{" "}

                <strong>{campToDelete?.name}</strong>? This action cannot be undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction

                className="bg-red-600 hover:bg-red-700"

                onClick={confirmDeleteCampaign}

              >

                Delete

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* Send Campaign Dialog */}

        <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Send Campaign</AlertDialogTitle>

              <AlertDialogDescription>

                Are you sure you want to send the campaign{" "}

                <strong>{campToSend?.name}</strong> to all its recipients? This action cannot be

                undone.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction onClick={confirmSendCampaign} disabled={sending}>

                {sending ? (

                  <>

                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                    Sending...

                  </>

                ) : (

                  <>

                    <Send className="mr-2 h-4 w-4" />

                    Send Now

                  </>

                )}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



        {/* Test Email Dialog */}

        <AlertDialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>Send Test Email</AlertDialogTitle>

              <AlertDialogDescription>

                Enter an email address to receive a test email.

              </AlertDialogDescription>

            </AlertDialogHeader>

            <div className="px-1 py-2">

              <Input

                type="email"

                placeholder="test@example.com"

                value={testEmailAddress}

                onChange={(e) => setTestEmailAddress(e.target.value)}

              />

            </div>

            <AlertDialogFooter>

              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction onClick={handleSendTestEmail} disabled={sending}>

                {sending ? (

                  <>

                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />

                    Sending...

                  </>

                ) : (

                  <>

                    <TestTube className="mr-2 h-4 w-4" />

                    Send Test

                  </>

                )}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>



      </SidebarInset>

    </SidebarProvider>

  );

}

