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
  Eye,
  Edit,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Star,
  Building2,
  TrendingUp,
  DollarSign,
  Percent,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchInsuranceCompanies,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany,
  fetchFinanceOptions,
  createFinanceOption,
  updateFinanceOption,
  deleteFinanceOption,
  type InsuranceCompany,
  type FinanceOption,
} from "@/lib/redux/insuranceFinanceSlice";
import { cn } from "@/lib/utils";
import {
  CoverageType,
  InsuranceProductType,
  FinanceType,
  COVERAGE_TYPE_LABELS,
  INSURANCE_PRODUCT_TYPE_LABELS,
  FINANCE_TYPE_LABELS,
} from "@/lib/enums/InsuranceFinanceEnums";

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

// ─── Draggable Row (Insurance) ────────────────────────────
function DraggableInsuranceRow({ row }: { row: Row<InsuranceCompany> }) {
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
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-3">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── Draggable Row (Finance) ──────────────────────────────
function DraggableFinanceRow({ row }: { row: Row<FinanceOption> }) {
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
      style={{ transform: CSS.Transform.toString(transform), transition }}
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
function InsuranceFinanceStats() {
  const { insuranceCompanies, financeOptions } = useAppSelector((s) => s.insuranceFinance);

  const premiumPartners = insuranceCompanies.filter((c) => c.isPremiumPartner).length;
  const popularFinance = financeOptions.filter((o) => o.isPopular).length;
  const instantDisbursement = financeOptions.filter((o) => o.instantDisbursement).length;

  return (
    <div className={cn('grid', 'gap-4', 'sm:grid-cols-2', 'lg:grid-cols-4')}>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Insurance Partners</CardTitle>
          <Shield className={cn('h-4', 'w-4', 'text-blue-500')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{insuranceCompanies.length}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>{premiumPartners} premium partners</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Finance Options</CardTitle>
          <CreditCard className={cn('h-4', 'w-4', 'text-green-500')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{financeOptions.length}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>{popularFinance} popular options</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Premium Insurance</CardTitle>
          <Star className={cn('h-4', 'w-4', 'text-yellow-500')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{premiumPartners}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>
            {insuranceCompanies.length > 0
              ? ((premiumPartners / insuranceCompanies.length) * 100).toFixed(0)
              : 0}% of total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2')}>
          <CardTitle className={cn('text-sm', 'font-medium')}>Instant Disbursement</CardTitle>
          <TrendingUp className={cn('h-4', 'w-4', 'text-purple-500')} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl', 'font-bold')}>{instantDisbursement}</div>
          <p className={cn('text-xs', 'text-muted-foreground')}>Quick loan approvals</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function InsuranceFinancePage() {
  const dispatch = useAppDispatch();
  const { insuranceCompanies, financeOptions, loading, financeLoading, creating, updating, deleting } =
    useAppSelector((s) => s.insuranceFinance);

  const hasFetched = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeMainTab, setActiveMainTab] = React.useState("insurance");

  // ─── Insurance table state ────────────────────────────
  const [insuranceData, setInsuranceData] = React.useState<InsuranceCompany[]>([]);
  const [insRowSelection, setInsRowSelection] = React.useState({});
  const [insColumnVisibility, setInsColumnVisibility] = React.useState<VisibilityState>({});
  const [insColumnFilters, setInsColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [insSorting, setInsSorting] = React.useState<SortingState>([]);
  const [insPagination, setInsPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [insGlobalFilter, setInsGlobalFilter] = React.useState("");

  // ─── Finance table state ──────────────────────────────
  const [financeData, setFinanceData] = React.useState<FinanceOption[]>([]);
  const [finRowSelection, setFinRowSelection] = React.useState({});
  const [finColumnVisibility, setFinColumnVisibility] = React.useState<VisibilityState>({});
  const [finColumnFilters, setFinColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [finSorting, setFinSorting] = React.useState<SortingState>([]);
  const [finPagination, setFinPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [finGlobalFilter, setFinGlobalFilter] = React.useState("");

  // ─── Delete dialogs ───────────────────────────────────
  const [deleteInsDialogOpen, setDeleteInsDialogOpen] = React.useState(false);
  const [insToDelete, setInsToDelete] = React.useState<InsuranceCompany | null>(null);
  const [deleteFinDialogOpen, setDeleteFinDialogOpen] = React.useState(false);
  const [finToDelete, setFinToDelete] = React.useState<FinanceOption | null>(null);
  const [bulkDeleteInsDialogOpen, setBulkDeleteInsDialogOpen] = React.useState(false);
  const [bulkDeleteFinDialogOpen, setBulkDeleteFinDialogOpen] = React.useState(false);

  // ─── View drawers ─────────────────────────────────────
  const [viewInsDrawerOpen, setViewInsDrawerOpen] = React.useState(false);
  const [viewInsurance, setViewInsurance] = React.useState<InsuranceCompany | null>(null);
  const [viewFinDrawerOpen, setViewFinDrawerOpen] = React.useState(false);
  const [viewFinance, setViewFinance] = React.useState<FinanceOption | null>(null);

  // ─── Insurance Form drawer ────────────────────────────
  const [insFormDrawerOpen, setInsFormDrawerOpen] = React.useState(false);
  const [editingInsurance, setEditingInsurance] = React.useState<InsuranceCompany | null>(null);
  const [insFormName, setInsFormName] = React.useState("");
  const [insFormDescription, setInsFormDescription] = React.useState("");
  const [insFormContactNumber, setInsFormContactNumber] = React.useState("");
  const [insFormEmail, setInsFormEmail] = React.useState("");
  const [insFormWebsite, setInsFormWebsite] = React.useState("");
  const [insFormCoverageTypes, setInsFormCoverageTypes] = React.useState<string[]>([]);
  const [insFormInsuranceTypes, setInsFormInsuranceTypes] = React.useState<string[]>([]);
  const [insFormEmiStartPrice, setInsFormEmiStartPrice] = React.useState("");
  const [insFormMinCoverage, setInsFormMinCoverage] = React.useState("");
  const [insFormMaxCoverage, setInsFormMaxCoverage] = React.useState("");
  const [insFormIsPremium, setInsFormIsPremium] = React.useState(false);
  const [insFormLogo, setInsFormLogo] = React.useState<File | null>(null);
  const [insFormLogoPreview, setInsFormLogoPreview] = React.useState<string | null>(null);

  // ─── Finance Form drawer ──────────────────────────────
  const [finFormDrawerOpen, setFinFormDrawerOpen] = React.useState(false);
  const [editingFinance, setEditingFinance] = React.useState<FinanceOption | null>(null);
  const [finFormBankName, setFinFormBankName] = React.useState("");
  const [finFormDescription, setFinFormDescription] = React.useState("");
  const [finFormFinanceType, setFinFormFinanceType] = React.useState("");
  const [finFormInterestRate, setFinFormInterestRate] = React.useState("");
  const [finFormProcessingFee, setFinFormProcessingFee] = React.useState("");
  const [finFormMinLoan, setFinFormMinLoan] = React.useState("");
  const [finFormMaxLoan, setFinFormMaxLoan] = React.useState("");
  const [finFormMinTenure, setFinFormMinTenure] = React.useState("");
  const [finFormMaxTenure, setFinFormMaxTenure] = React.useState("");
  const [finFormEmiStartPrice, setFinFormEmiStartPrice] = React.useState("");
  const [finFormIsPopular, setFinFormIsPopular] = React.useState(false);
  const [finFormContactNumber, setFinFormContactNumber] = React.useState("");
  const [finFormEmail, setFinFormEmail] = React.useState("");
  const [finFormPreApproval, setFinFormPreApproval] = React.useState(false);
  const [finFormInstantDisbursement, setFinFormInstantDisbursement] = React.useState(false);
  const [finFormLogo, setFinFormLogo] = React.useState<File | null>(null);
  const [finFormLogoPreview, setFinFormLogoPreview] = React.useState<string | null>(null);

  const insSortableId = React.useId();
  const finSortableId = React.useId();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchInsuranceCompanies());
      dispatch(fetchFinanceOptions());
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (insuranceCompanies) setInsuranceData(insuranceCompanies.filter((c) => c && c._id));
  }, [insuranceCompanies]);

  React.useEffect(() => {
    if (financeOptions) setFinanceData(financeOptions.filter((o) => o && o._id));
  }, [financeOptions]);

  React.useEffect(() => { setMounted(true); }, []);

  const insDataIds = React.useMemo<UniqueIdentifier[]>(
    () => insuranceData?.map(({ _id }) => _id) || [],
    [insuranceData]
  );

  const finDataIds = React.useMemo<UniqueIdentifier[]>(
    () => financeData?.map(({ _id }) => _id) || [],
    [financeData]
  );

  // ─── Refresh ─────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchInsuranceCompanies()),
      dispatch(fetchFinanceOptions()),
    ]);
    setIsRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  // ─── Insurance Form Handlers ──────────────────────────
  const resetInsForm = () => {
    setEditingInsurance(null);
    setInsFormName("");
    setInsFormDescription("");
    setInsFormContactNumber("");
    setInsFormEmail("");
    setInsFormWebsite("");
    setInsFormCoverageTypes([]);
    setInsFormInsuranceTypes([]);
    setInsFormEmiStartPrice("");
    setInsFormMinCoverage("");
    setInsFormMaxCoverage("");
    setInsFormIsPremium(false);
    setInsFormLogo(null);
    setInsFormLogoPreview(null);
  };

  const openCreateInsDrawer = () => {
    resetInsForm();
    setInsFormDrawerOpen(true);
  };

  const openEditInsDrawer = (company: InsuranceCompany) => {
    setEditingInsurance(company);
    setInsFormName(company.name);
    setInsFormDescription(company.description);
    setInsFormContactNumber(company.contactNumber);
    setInsFormEmail(company.email);
    setInsFormWebsite(company.website);
    setInsFormCoverageTypes(company.coverageTypes);
    setInsFormInsuranceTypes(company.insuranceTypes);
    setInsFormEmiStartPrice(String(company.emiStartPrice));
    setInsFormMinCoverage(String(company.minCoverageAmount));
    setInsFormMaxCoverage(String(company.maxCoverageAmount));
    setInsFormIsPremium(company.isPremiumPartner);
    setInsFormLogoPreview(company.logo?.url || null);
    setInsFormDrawerOpen(true);
  };

  const handleInsLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInsFormLogo(file);
      setInsFormLogoPreview(URL.createObjectURL(file));
    }
  };

  const toggleCoverageType = (type: string) => {
    setInsFormCoverageTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleInsuranceType = (type: string) => {
    setInsFormInsuranceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleInsFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insFormName.trim()) { toast.error("Company name is required"); return; }
    if (!insFormEmail.trim()) { toast.error("Email is required"); return; }

    const fd = new FormData();
    fd.append("name", insFormName.trim());
    fd.append("description", insFormDescription.trim());
    fd.append("contactNumber", insFormContactNumber.trim());
    fd.append("email", insFormEmail.trim());
    fd.append("website", insFormWebsite.trim());
    insFormCoverageTypes.forEach((t) => fd.append("coverageTypes[]", t));
    insFormInsuranceTypes.forEach((t) => fd.append("insuranceTypes[]", t));
    fd.append("emiStartPrice", insFormEmiStartPrice || "0");
    fd.append("minCoverageAmount", insFormMinCoverage || "0");
    fd.append("maxCoverageAmount", insFormMaxCoverage || "0");
    fd.append("isPremiumPartner", String(insFormIsPremium));
    if (insFormLogo) fd.append("logo", insFormLogo);

    if (editingInsurance) {
      const result = await dispatch(updateInsuranceCompany({ id: editingInsurance._id, formData: fd }));
      if (updateInsuranceCompany.fulfilled.match(result)) {
        toast.success("Insurance company updated successfully");
        setInsFormDrawerOpen(false);
        resetInsForm();
      } else {
        toast.error(String(result.payload) || "Failed to update insurance company");
      }
    } else {
      const result = await dispatch(createInsuranceCompany(fd));
      if (createInsuranceCompany.fulfilled.match(result)) {
        toast.success("Insurance company created successfully");
        setInsFormDrawerOpen(false);
        resetInsForm();
      } else {
        toast.error(String(result.payload) || "Failed to create insurance company");
      }
    }
  };

  const handleDeleteInsurance = async () => {
    if (!insToDelete) return;
    await dispatch(deleteInsuranceCompany(insToDelete._id));
    setInsToDelete(null);
    setDeleteInsDialogOpen(false);
    toast.success("Insurance company deleted");
  };

  const handleBulkDeleteInsurance = async () => {
    const ids = Object.keys(insRowSelection);
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => dispatch(deleteInsuranceCompany(id))));
    setInsRowSelection({});
    setBulkDeleteInsDialogOpen(false);
    toast.success(`${ids.length} insurance companies deleted`);
  };

  // ─── Finance Form Handlers ────────────────────────────
  const resetFinForm = () => {
    setEditingFinance(null);
    setFinFormBankName("");
    setFinFormDescription("");
    setFinFormFinanceType("");
    setFinFormInterestRate("");
    setFinFormProcessingFee("");
    setFinFormMinLoan("");
    setFinFormMaxLoan("");
    setFinFormMinTenure("");
    setFinFormMaxTenure("");
    setFinFormEmiStartPrice("");
    setFinFormIsPopular(false);
    setFinFormContactNumber("");
    setFinFormEmail("");
    setFinFormPreApproval(false);
    setFinFormInstantDisbursement(false);
    setFinFormLogo(null);
    setFinFormLogoPreview(null);
  };

  const openCreateFinDrawer = () => {
    resetFinForm();
    setFinFormDrawerOpen(true);
  };

  const openEditFinDrawer = (option: FinanceOption) => {
    setEditingFinance(option);
    setFinFormBankName(option.bankName);
    setFinFormDescription(option.description);
    setFinFormFinanceType(option.financeType);
    setFinFormInterestRate(String(option.interestRate));
    setFinFormProcessingFee(String(option.processingFee));
    setFinFormMinLoan(String(option.minLoanAmount));
    setFinFormMaxLoan(String(option.maxLoanAmount));
    setFinFormMinTenure(String(option.minTenure));
    setFinFormMaxTenure(String(option.maxTenure));
    setFinFormEmiStartPrice(String(option.emiStartPrice));
    setFinFormIsPopular(option.isPopular);
    setFinFormContactNumber(option.contactNumber);
    setFinFormEmail(option.email);
    setFinFormPreApproval(option.preApprovalAvailable);
    setFinFormInstantDisbursement(option.instantDisbursement);
    setFinFormLogoPreview(option.logo?.url || null);
    setFinFormDrawerOpen(true);
  };

  const handleFinLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFinFormLogo(file);
      setFinFormLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFinFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finFormBankName.trim()) { toast.error("Bank name is required"); return; }
    if (!finFormFinanceType) { toast.error("Finance type is required"); return; }

    const fd = new FormData();
    fd.append("bankName", finFormBankName.trim());
    fd.append("description", finFormDescription.trim());
    fd.append("financeType", finFormFinanceType);
    fd.append("interestRate", finFormInterestRate || "0");
    fd.append("processingFee", finFormProcessingFee || "0");
    fd.append("minLoanAmount", finFormMinLoan || "0");
    fd.append("maxLoanAmount", finFormMaxLoan || "0");
    fd.append("minTenure", finFormMinTenure || "0");
    fd.append("maxTenure", finFormMaxTenure || "0");
    fd.append("emiStartPrice", finFormEmiStartPrice || "0");
    fd.append("isPopular", String(finFormIsPopular));
    fd.append("contactNumber", finFormContactNumber.trim());
    fd.append("email", finFormEmail.trim());
    fd.append("preApprovalAvailable", String(finFormPreApproval));
    fd.append("instantDisbursement", String(finFormInstantDisbursement));
    if (finFormLogo) fd.append("logo", finFormLogo);

    if (editingFinance) {
      const result = await dispatch(updateFinanceOption({ id: editingFinance._id, formData: fd }));
      if (updateFinanceOption.fulfilled.match(result)) {
        toast.success("Finance option updated successfully");
        setFinFormDrawerOpen(false);
        resetFinForm();
      } else {
        toast.error(String(result.payload) || "Failed to update finance option");
      }
    } else {
      const result = await dispatch(createFinanceOption(fd));
      if (createFinanceOption.fulfilled.match(result)) {
        toast.success("Finance option created successfully");
        setFinFormDrawerOpen(false);
        resetFinForm();
      } else {
        toast.error(String(result.payload) || "Failed to create finance option");
      }
    }
  };

  const handleDeleteFinance = async () => {
    if (!finToDelete) return;
    const result = await dispatch(deleteFinanceOption(finToDelete._id));
    if (deleteFinanceOption.fulfilled.match(result)) {
      setFinToDelete(null);
      setDeleteFinDialogOpen(false);
      toast.success("Finance option deleted");
    } else {
      toast.error(String(result.payload) || "Failed to delete finance option");
    }
  };

  const handleBulkDeleteFinance = async () => {
    const ids = Object.keys(finRowSelection);
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => dispatch(deleteFinanceOption(id))));
    setFinRowSelection({});
    setBulkDeleteFinDialogOpen(false);
    toast.success(`${ids.length} finance options deleted`);
  };

  // ─── DnD Handlers ────────────────────────────────────
  function handleInsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setInsuranceData((data) => {
        const oldIndex = data.findIndex((d) => d._id === active.id);
        const newIndex = data.findIndex((d) => d._id === over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  function handleFinDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setFinanceData((data) => {
        const oldIndex = data.findIndex((d) => d._id === active.id);
        const newIndex = data.findIndex((d) => d._id === over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  // ─── Export CSV ───────────────────────────────────────
  const exportInsuranceCSV = () => {
    const headers = ["Name", "Email", "Contact", "Website", "Coverage Types", "EMI Start", "Min Coverage", "Max Coverage", "Premium Partner"];
    const rows = insuranceData.map((c) => [
      c.name, c.email, c.contactNumber, c.website,
      c.coverageTypes.join(";"), c.emiStartPrice, c.minCoverageAmount, c.maxCoverageAmount,
      c.isPremiumPartner ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "insurance_companies.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Insurance data exported");
  };

  const exportFinanceCSV = () => {
    const headers = ["Bank Name", "Finance Type", "Interest Rate", "Processing Fee", "Min Loan", "Max Loan", "Min Tenure", "Max Tenure", "EMI Start", "Popular", "Pre-Approval", "Instant Disbursement"];
    const rows = financeData.map((o) => [
      o.bankName, o.financeType, o.interestRate, o.processingFee,
      o.minLoanAmount, o.maxLoanAmount, o.minTenure, o.maxTenure,
      o.emiStartPrice, o.isPopular ? "Yes" : "No", o.preApprovalAvailable ? "Yes" : "No", o.instantDisbursement ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "finance_options.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Finance data exported");
  };

  // ─── Insurance Columns ────────────────────────────────
  const insuranceColumns = React.useMemo<ColumnDef<InsuranceCompany>[]>(
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
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Company",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className={cn('flex', 'items-center', 'gap-3', 'min-w-0')}>
              {company.logo?.url ? (
                <Image src={company.logo.url} alt={company.logo.alt || company.name} width={36} height={36} className={cn('rounded-lg', 'object-cover', 'border', 'border-border', 'shrink-0')} />
              ) : (
                <div className={cn('w-9', 'h-9', 'rounded-lg', 'bg-gradient-to-br', 'from-blue-400', 'to-blue-600', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                  <Shield className={cn('h-4', 'w-4', 'text-white')} />
                </div>
              )}
              <div className="min-w-0">
                <div className={cn('font-semibold', 'text-sm', 'truncate')}>{company.name}</div>
                <div className={cn('text-xs', 'text-muted-foreground', 'truncate')}>{company.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isPremiumPartner",
        header: "Status",
        cell: ({ row }) => (
          <div className={cn('flex', 'flex-col', 'gap-1')}>
            <Badge className={row.original.isPremiumPartner
              ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400"
              : "bg-gray-100 text-gray-600 border-gray-200"
            }>
              {row.original.isPremiumPartner ? "Premium" : "Standard"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "coverageTypes",
        header: "Coverage Types",
        cell: ({ row }) => (
          <div className={cn('flex', 'flex-wrap', 'gap-1', 'max-w-[200px]')}>
            {row.original.coverageTypes.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {COVERAGE_TYPE_LABELS[t as CoverageType] || t}
              </Badge>
            ))}
            {row.original.coverageTypes.length > 2 && (
              <Badge variant="outline" className="text-xs">+{row.original.coverageTypes.length - 2}</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "emiStartPrice",
        header: "EMI From",
        cell: ({ row }) => (
          <div className={cn('font-medium', 'text-sm')}>
            ₹{row.original.emiStartPrice.toLocaleString()}/mo
          </div>
        ),
      },
      {
        accessorKey: "minCoverageAmount",
        header: "Coverage Range",
        cell: ({ row }) => (
          <div className={cn('text-xs', 'text-muted-foreground')}>
            ₹{row.original.minCoverageAmount.toLocaleString()} – ₹{row.original.maxCoverageAmount.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: "Contact",
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'gap-1', 'text-xs', 'text-muted-foreground')}>
            <Phone className={cn('h-3', 'w-3')} />
            {row.original.contactNumber}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('h-8', 'w-8')}>
                  <IconDotsVertical className={cn('h-4', 'w-4')} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setViewInsurance(company); setViewInsDrawerOpen(true); }}>
                  <Eye className={cn('mr-2', 'h-4', 'w-4')} /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditInsDrawer(company)}>
                  <Edit className={cn('mr-2', 'h-4', 'w-4')} /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                  onClick={() => { setInsToDelete(company); setDeleteInsDialogOpen(true); }}
                >
                  <Trash2 className={cn('mr-2', 'h-4', 'w-4')} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: false,
      },
    ],
    []
  );

  // ─── Finance Columns ──────────────────────────────────
  const financeColumns = React.useMemo<ColumnDef<FinanceOption>[]>(
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
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "bankName",
        header: "Bank / Lender",
        cell: ({ row }) => {
          const option = row.original;
          return (
            <div className={cn('flex', 'items-center', 'gap-3', 'min-w-0')}>
              {option.logo?.url ? (
                <Image src={option.logo.url} alt={option.logo.alt || option.bankName} width={36} height={36} className={cn('rounded-lg', 'object-cover', 'border', 'border-border', 'shrink-0')} />
              ) : (
                <div className={cn('w-9', 'h-9', 'rounded-lg', 'bg-gradient-to-br', 'from-green-400', 'to-green-600', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                  <CreditCard className={cn('h-4', 'w-4', 'text-white')} />
                </div>
              )}
              <div className="min-w-0">
                <div className={cn('font-semibold', 'text-sm', 'truncate')}>{option.bankName}</div>
                <div className={cn('text-xs', 'text-muted-foreground', 'truncate')}>{option.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "financeType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {FINANCE_TYPE_LABELS[row.original.financeType as FinanceType] || row.original.financeType}
          </Badge>
        ),
      },
      {
        accessorKey: "interestRate",
        header: "Interest Rate",
        cell: ({ row }) => (
          <div className={cn('flex', 'items-center', 'gap-1', 'font-medium', 'text-sm')}>
            <Percent className={cn('h-3', 'w-3', 'text-muted-foreground')} />
            {row.original.interestRate}%
          </div>
        ),
      },
      {
        accessorKey: "emiStartPrice",
        header: "EMI From",
        cell: ({ row }) => (
          <div className={cn('font-medium', 'text-sm')}>
            ₹{row.original.emiStartPrice.toLocaleString()}/mo
          </div>
        ),
      },
      {
        accessorKey: "isPopular",
        header: "Status",
        cell: ({ row }) => (
          <div className={cn('flex', 'flex-col', 'gap-1')}>
            {row.original.isPopular && (
              <Badge className={cn('bg-blue-100', 'text-blue-700', 'border-blue-200', 'dark:bg-blue-950/30', 'dark:text-blue-400', 'text-xs')}>
                Popular
              </Badge>
            )}
            {row.original.instantDisbursement && (
              <Badge className={cn('bg-green-100', 'text-green-700', 'border-green-200', 'text-xs')}>
                Instant
              </Badge>
            )}
            {row.original.preApprovalAvailable && (
              <Badge className={cn('bg-purple-100', 'text-purple-700', 'border-purple-200', 'text-xs')}>
                Pre-Approval
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "minLoanAmount",
        header: "Loan Range",
        cell: ({ row }) => (
          <div className={cn('text-xs', 'text-muted-foreground')}>
            ₹{row.original.minLoanAmount.toLocaleString()} – ₹{row.original.maxLoanAmount.toLocaleString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const option = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('h-8', 'w-8')}>
                  <IconDotsVertical className={cn('h-4', 'w-4')} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setViewFinance(option); setViewFinDrawerOpen(true); }}>
                  <Eye className={cn('mr-2', 'h-4', 'w-4')} /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditFinDrawer(option)}>
                  <Edit className={cn('mr-2', 'h-4', 'w-4')} /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                  onClick={() => { setFinToDelete(option); setDeleteFinDialogOpen(true); }}
                >
                  <Trash2 className={cn('mr-2', 'h-4', 'w-4')} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: false,
      },
    ],
    []
  );

  // ─── Insurance Table ──────────────────────────────────
  const insuranceTable = useReactTable({
    data: insuranceData,
    columns: insuranceColumns,
    state: { sorting: insSorting, columnVisibility: insColumnVisibility, rowSelection: insRowSelection, columnFilters: insColumnFilters, globalFilter: insGlobalFilter, pagination: insPagination },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setInsRowSelection,
    onSortingChange: setInsSorting,
    onColumnFiltersChange: setInsColumnFilters,
    onColumnVisibilityChange: setInsColumnVisibility,
    onPaginationChange: setInsPagination,
    onGlobalFilterChange: setInsGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // ─── Finance Table ────────────────────────────────────
  const financeTable = useReactTable({
    data: financeData,
    columns: financeColumns,
    state: { sorting: finSorting, columnVisibility: finColumnVisibility, rowSelection: finRowSelection, columnFilters: finColumnFilters, globalFilter: finGlobalFilter, pagination: finPagination },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setFinRowSelection,
    onSortingChange: setFinSorting,
    onColumnFiltersChange: setFinColumnFilters,
    onColumnVisibilityChange: setFinColumnVisibility,
    onPaginationChange: setFinPagination,
    onGlobalFilterChange: setFinGlobalFilter,
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
        <div className={cn('flex', 'flex-1', 'flex-col', 'overflow-hidden')}>
          <div className={cn('@container/main', 'flex', 'flex-1', 'flex-col', 'gap-2', 'overflow-y-auto')}>
            <div className={cn('flex', 'flex-col', 'gap-4', 'py-4', 'md:gap-6', 'md:py-6')}>
              {/* Header */}
              <div className={cn('px-4', 'lg:px-6')}>
                <h1 className={cn('text-2xl', 'font-bold', 'tracking-tight')}>Insurance & Finance</h1>
                <p className={cn('text-sm', 'text-muted-foreground', 'mt-1')}>
                  Manage insurance companies and finance options for car buyers
                </p>
              </div>

              {/* Stats */}
              <div className={cn('px-4', 'lg:px-6')}>
                <InsuranceFinanceStats />
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className={cn('px-4', 'lg:px-6')}>
            <TabsList>
              <TabsTrigger value="insurance" className={cn('flex', 'items-center', 'gap-2')}>
                <Shield className={cn('h-4', 'w-4')} />
                Insurance Companies
                <Badge variant="secondary" className="ml-1">{insuranceCompanies.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="finance" className={cn('flex', 'items-center', 'gap-2')}>
                <CreditCard className={cn('h-4', 'w-4')} />
                Finance Options
                <Badge variant="secondary" className="ml-1">{financeOptions.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* ─── Insurance Tab ─────────────────────────────── */}
            <TabsContent value="insurance" className={cn('space-y-4', 'mt-4', 'mb-6')}>
              <TooltipProvider>
                <div className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search insurance companies..."
                      value={insGlobalFilter}
                      onChange={(e) => setInsGlobalFilter(e.target.value)}
                      className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        className="h-9 w-9 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
                        onClick={openCreateInsDrawer}
                      >
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Insurance Company</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading || financeLoading}
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
                        onClick={exportInsuranceCSV}
                      >
                        <IconDownload className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export CSV</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Selected Actions */}
              {Object.keys(insRowSelection).length > 0 && (
                <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      {Object.keys(insRowSelection).length} selected
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(insRowSelection).length} of {insuranceTable.getFilteredRowModel().rows.length} rows selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setBulkDeleteInsDialogOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete ({Object.keys(insRowSelection).length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setInsRowSelection({})}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Insurance Table */}
              <div className={cn('w-full', 'flex', 'flex-col', 'gap-4')}>
                <div className={cn('rounded-xl', 'border', 'bg-card', 'shadow-lg')}>
                  {loading ? (
                    <div className={cn('p-6', 'space-y-3')}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className={cn('h-14', 'w-full', 'rounded-lg')} />
                      ))}
                    </div>
                  ) : (
                    <DndContext
                      id={insSortableId}
                      collisionDetection={closestCenter}
                      modifiers={[restrictToVerticalAxis]}
                      onDragEnd={handleInsDragEnd}
                      sensors={sensors}
                    >
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">
                            {insuranceTable.getHeaderGroups().map((hg) => (
                              <TableRow key={hg.id} className="hover:bg-transparent">
                                {hg.headers.map((header) => (
                                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} className="h-11 font-semibold text-foreground/80">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {insuranceTable.getRowModel().rows.length ? (
                              <SortableContext items={insDataIds} strategy={verticalListSortingStrategy}>
                                {insuranceTable.getRowModel().rows.map((row) => (
                                  <DraggableInsuranceRow key={row.id} row={row} />
                                ))}
                              </SortableContext>
                            ) : (
                              <TableRow>
                                <TableCell colSpan={insuranceColumns.length} className={cn('h-32', 'text-center', 'text-muted-foreground')}>
                                  <div className={cn('flex', 'flex-col', 'items-center', 'gap-2')}>
                                    <Shield className={cn('h-8', 'w-8', 'text-muted-foreground/50')} />
                                    <span>No insurance companies found</span>
                                    <Button variant="outline" size="sm" onClick={openCreateInsDrawer}>
                                      <IconPlus className={cn('h-4', 'w-4', 'mr-1')} /> Add Insurance Company
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </DndContext>
                  )}
                </div>
              </div>

              {/* Insurance Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{insuranceTable.getFilteredRowModel().rows.length}</span> items
                  {insuranceTable.getFilteredSelectedRowModel().rows.length > 0 && (
                    <span className="text-xs ml-2">
                      ({insuranceTable.getFilteredSelectedRowModel().rows.length} selected)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => insuranceTable.setPageIndex(0)}
                    disabled={!insuranceTable.getCanPreviousPage()}
                  >
                    <span className="sr-only">First page</span>
                    <IconChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => insuranceTable.previousPage()}
                    disabled={!insuranceTable.getCanPreviousPage()}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => insuranceTable.nextPage()}
                    disabled={!insuranceTable.getCanNextPage()}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => insuranceTable.setPageIndex(insuranceTable.getPageCount() - 1)}
                    disabled={!insuranceTable.getCanNextPage()}
                  >
                    <span className="sr-only">Last page</span>
                    <IconChevronsRight className="size-4" />
                  </Button>
                </div>
              </div>
                </div>
              </TooltipProvider>
            </TabsContent>

            {/* ─── Finance Tab ───────────────────────────────── */}
            <TabsContent value="finance" className={cn('space-y-4', 'mt-4', 'px-4', 'lg:px-6')}>
              <TooltipProvider>
                <div className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search finance options..."
                      value={finGlobalFilter}
                      onChange={(e) => setFinGlobalFilter(e.target.value)}
                      className="h-9 pl-9 pr-4 w-full bg-muted/50 border-muted focus:bg-background transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        className="h-9 w-9 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
                        onClick={openCreateFinDrawer}
                      >
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Finance Option</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading || financeLoading}
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
                        onClick={exportFinanceCSV}
                      >
                        <IconDownload className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export CSV</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Selected Actions */}
              {Object.keys(finRowSelection).length > 0 && (
                <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      {Object.keys(finRowSelection).length} selected
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(finRowSelection).length} of {financeTable.getFilteredRowModel().rows.length} rows selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setBulkDeleteFinDialogOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete ({Object.keys(finRowSelection).length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setFinRowSelection({})}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Finance Table */}
              <div className={cn('w-full', 'flex', 'flex-col', 'gap-4')}>
                <div className={cn('rounded-xl', 'border', 'bg-card', 'shadow-lg')}>
                  {financeLoading ? (
                    <div className={cn('p-6', 'space-y-3')}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className={cn('h-14', 'w-full', 'rounded-lg')} />
                      ))}
                    </div>
                  ) : (
                    <DndContext
                      id={finSortableId}
                      collisionDetection={closestCenter}
                      modifiers={[restrictToVerticalAxis]}
                      onDragEnd={handleFinDragEnd}
                      sensors={sensors}
                    >
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-linear-to-r from-muted/80 to-muted/40">
                            {financeTable.getHeaderGroups().map((hg) => (
                              <TableRow key={hg.id} className="hover:bg-transparent">
                                {hg.headers.map((header) => (
                                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} className="h-11 font-semibold text-foreground/80">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {financeTable.getRowModel().rows.length ? (
                              <SortableContext items={finDataIds} strategy={verticalListSortingStrategy}>
                                {financeTable.getRowModel().rows.map((row) => (
                                  <DraggableFinanceRow key={row.id} row={row} />
                                ))}
                              </SortableContext>
                            ) : (
                              <TableRow>
                                <TableCell colSpan={financeColumns.length} className={cn('h-32', 'text-center', 'text-muted-foreground')}>
                                  <div className={cn('flex', 'flex-col', 'items-center', 'gap-2')}>
                                    <CreditCard className={cn('h-8', 'w-8', 'text-muted-foreground/50')} />
                                    <span>No finance options found</span>
                                    <Button variant="outline" size="sm" onClick={openCreateFinDrawer}>
                                      <IconPlus className={cn('h-4', 'w-4', 'mr-1')} /> Add Finance Option
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </DndContext>
                  )}
                </div>
              </div>

              {/* Finance Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{financeTable.getFilteredRowModel().rows.length}</span> items
                  {financeTable.getFilteredSelectedRowModel().rows.length > 0 && (
                    <span className="text-xs ml-2">
                      ({financeTable.getFilteredSelectedRowModel().rows.length} selected)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => financeTable.setPageIndex(0)}
                    disabled={!financeTable.getCanPreviousPage()}
                  >
                    <span className="sr-only">First page</span>
                    <IconChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => financeTable.previousPage()}
                    disabled={!financeTable.getCanPreviousPage()}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => financeTable.nextPage()}
                    disabled={!financeTable.getCanNextPage()}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => financeTable.setPageIndex(financeTable.getPageCount() - 1)}
                    disabled={!financeTable.getCanNextPage()}
                  >
                    <span className="sr-only">Last page</span>
                    <IconChevronsRight className="size-4" />
                  </Button>
                </div>
              </div>
                </div>
              </TooltipProvider>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Insurance Create/Edit Drawer ───────────────── */}
        <Drawer open={insFormDrawerOpen} onOpenChange={setInsFormDrawerOpen} direction="right">
          <DrawerContent className={cn('w-[80vw]', 'max-w-4xl', 'ml-auto', 'h-full', 'flex', 'flex-col')}>
            <DrawerHeader className={cn('shrink-0', 'px-8', 'pt-8', 'pb-4', 'border-b')}>
              <DrawerTitle className={cn('text-xl', 'font-semibold')}>{editingInsurance ? "Edit Insurance Company" : "Add Insurance Company"}</DrawerTitle>
              <DrawerDescription className="mt-1.5">
                {editingInsurance ? "Update the insurance company details." : "Add a new insurance partner."}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleInsFormSubmit} className={cn('flex', 'flex-col', 'gap-7', 'px-8', 'py-6', 'overflow-y-auto', 'overflow-x-hidden', 'flex-1', 'min-h-0')}>
              {/* Logo */}
              <div className="space-y-3">
                <Label className={cn('text-sm', 'font-medium')}>Company Logo</Label>
                <div className={cn('flex', 'items-center', 'gap-5')}>
                  <div className={cn('w-20', 'h-20', 'rounded-xl', 'border-2', 'border-dashed', 'border-border', 'flex', 'items-center', 'justify-center', 'overflow-hidden', 'bg-muted', 'shrink-0')}>
                    {insFormLogoPreview ? (
                      <Image src={insFormLogoPreview} alt="Logo preview" width={80} height={80} className={cn('object-cover', 'w-full', 'h-full', 'rounded-xl')} />
                    ) : (
                      <Shield className={cn('h-7', 'w-7', 'text-muted-foreground')} />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleInsLogoChange} className={cn('flex-1', 'h-10')} />
                </div>
              </div>

              <div className={cn('grid', 'grid-cols-1', 'gap-6')}>
                <div className="space-y-2.5">
                  <Label htmlFor="ins-name" className={cn('text-sm', 'font-medium')}>Company Name *</Label>
                  <Input id="ins-name" value={insFormName} onChange={(e) => setInsFormName(e.target.value)} placeholder="e.g. HDFC Ergo" className="h-11" required />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="ins-desc" className={cn('text-sm', 'font-medium')}>Description</Label>
                  <Textarea id="ins-desc" value={insFormDescription} onChange={(e) => setInsFormDescription(e.target.value)} placeholder="Brief description of the insurance company..." rows={4} className="resize-none" />
                </div>
                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="ins-email" className={cn('text-sm', 'font-medium')}>Email *</Label>
                    <Input id="ins-email" type="email" value={insFormEmail} onChange={(e) => setInsFormEmail(e.target.value)} placeholder="contact@company.com" className="h-11" required />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="ins-phone" className={cn('text-sm', 'font-medium')}>Contact Number</Label>
                    <Input id="ins-phone" value={insFormContactNumber} onChange={(e) => setInsFormContactNumber(e.target.value)} placeholder="+91 9999999999" className="h-11" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="ins-website" className={cn('text-sm', 'font-medium')}>Website</Label>
                  <Input id="ins-website" value={insFormWebsite} onChange={(e) => setInsFormWebsite(e.target.value)} placeholder="https://example.com" className="h-11" />
                </div>

                {/* Coverage Types */}
                <div className="space-y-3">
                  <Label className={cn('text-sm', 'font-medium')}>Coverage Types</Label>
                  <div className={cn('flex', 'flex-wrap', 'gap-2.5', 'p-4', 'rounded-lg', 'bg-muted/40', 'border')}>
                    {Object.values(CoverageType).map((type) => (
                      <Badge
                        key={type}
                        variant={insFormCoverageTypes.includes(type) ? "default" : "outline"}
                        className={cn('cursor-pointer', 'select-none', 'transition-colors', 'px-3', 'py-1.5', 'text-sm')}
                        onClick={() => toggleCoverageType(type)}
                      >
                        {COVERAGE_TYPE_LABELS[type]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Insurance Types */}
                <div className="space-y-3">
                  <Label className={cn('text-sm', 'font-medium')}>Insurance Product Types</Label>
                  <div className={cn('flex', 'flex-wrap', 'gap-2.5', 'p-4', 'rounded-lg', 'bg-muted/40', 'border')}>
                    {Object.values(InsuranceProductType).map((type) => (
                      <Badge
                        key={type}
                        variant={insFormInsuranceTypes.includes(type) ? "default" : "outline"}
                        className={cn('cursor-pointer', 'select-none', 'transition-colors', 'px-3', 'py-1.5', 'text-sm')}
                        onClick={() => toggleInsuranceType(type)}
                      >
                        {INSURANCE_PRODUCT_TYPE_LABELS[type]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="ins-emi" className={cn('text-sm', 'font-medium')}>EMI Start (₹)</Label>
                    <Input id="ins-emi" type="number" min={0} value={insFormEmiStartPrice} onChange={(e) => setInsFormEmiStartPrice(e.target.value)} placeholder="999" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="ins-min" className={cn('text-sm', 'font-medium')}>Min Coverage (₹)</Label>
                    <Input id="ins-min" type="number" min={0} value={insFormMinCoverage} onChange={(e) => setInsFormMinCoverage(e.target.value)} placeholder="100000" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="ins-max" className={cn('text-sm', 'font-medium')}>Max Coverage (₹)</Label>
                    <Input id="ins-max" type="number" min={0} value={insFormMaxCoverage} onChange={(e) => setInsFormMaxCoverage(e.target.value)} placeholder="5000000" className="h-11" />
                  </div>
                </div>

                <div className={cn('flex', 'items-center', 'gap-4', 'rounded-xl', 'border', 'p-4', 'bg-muted/20')}>
                  <Switch id="ins-premium" checked={insFormIsPremium} onCheckedChange={setInsFormIsPremium} />
                  <div>
                    <Label htmlFor="ins-premium" className={cn('cursor-pointer', 'font-medium', 'text-sm')}>Premium Partner</Label>
                    <p className={cn('text-xs', 'text-muted-foreground', 'mt-0.5')}>Featured on the website as a premium partner</p>
                  </div>
                </div>
              </div>

              <DrawerFooter className={cn('px-0', 'pb-4', 'pt-4', 'shrink-0', 'border-t', 'mt-4')}>
                <div className={cn('flex', 'flex-row', 'gap-3', 'w-full')}>
                  <DrawerClose asChild>
                    <Button variant="outline" type="button" className={cn('flex-1', 'h-11')}>Cancel</Button>
                  </DrawerClose>
                  <Button type="submit" disabled={creating || updating} className={cn('flex-1', 'h-11', 'text-base', 'font-medium', 'relative')}>
                    {(creating || updating) ? (
                      <span className={cn('flex', 'items-center', 'gap-2')}>
                        <svg className={cn('animate-spin', 'h-4', 'w-4')} viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {editingInsurance ? "Saving..." : "Creating..."}
                      </span>
                    ) : (
                      editingInsurance ? "Save Changes" : "Create Insurance Company"
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>

        {/* ─── Finance Create/Edit Drawer ──────────────────── */}
        <Drawer open={finFormDrawerOpen} onOpenChange={setFinFormDrawerOpen} direction="right">
          <DrawerContent className={cn('w-[90vw]', 'max-w-4xl', 'ml-auto', 'h-full', 'flex', 'flex-col')}>
            <DrawerHeader className={cn('shrink-0', 'px-8', 'pt-8', 'pb-4', 'border-b')}>
              <DrawerTitle className={cn('text-xl', 'font-semibold')}>{editingFinance ? "Edit Finance Option" : "Add Finance Option"}</DrawerTitle>
              <DrawerDescription className="mt-1.5">
                {editingFinance ? "Update the finance option details." : "Add a new financing partner."}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleFinFormSubmit} className={cn('flex', 'flex-col', 'gap-7', 'px-8', 'py-6', 'overflow-y-auto', 'overflow-x-hidden', 'flex-1', 'min-h-0')}>
              {/* Logo */}
              <div className="space-y-3">
                <Label className={cn('text-sm', 'font-medium')}>Bank Logo</Label>
                <div className={cn('flex', 'items-center', 'gap-5')}>
                  <div className={cn('w-20', 'h-20', 'rounded-xl', 'border-2', 'border-dashed', 'border-border', 'flex', 'items-center', 'justify-center', 'overflow-hidden', 'bg-muted', 'shrink-0')}>
                    {finFormLogoPreview ? (
                      <Image src={finFormLogoPreview} alt="Logo preview" width={80} height={80} className={cn('object-cover', 'w-full', 'h-full', 'rounded-xl')} />
                    ) : (
                      <Building2 className={cn('h-7', 'w-7', 'text-muted-foreground')} />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleFinLogoChange} className={cn('flex-1', 'h-10')} />
                </div>
              </div>

              <div className={cn('grid', 'grid-cols-1', 'gap-6')}>
                <div className="space-y-2.5">
                  <Label htmlFor="fin-bank" className={cn('text-sm', 'font-medium')}>Bank / Lender Name *</Label>
                  <Input id="fin-bank" value={finFormBankName} onChange={(e) => setFinFormBankName(e.target.value)} placeholder="e.g. HDFC Bank" className="h-11" required />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="fin-desc" className={cn('text-sm', 'font-medium')}>Description</Label>
                  <Textarea id="fin-desc" value={finFormDescription} onChange={(e) => setFinFormDescription(e.target.value)} placeholder="Brief description of the finance option..." rows={4} className="resize-none" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="fin-type" className={cn('text-sm', 'font-medium')}>Finance Type *</Label>
                  <Select value={finFormFinanceType} onValueChange={setFinFormFinanceType}>
                    <SelectTrigger id="fin-type" className="h-11"><SelectValue placeholder="Select finance type" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(FinanceType).map((type) => (
                        <SelectItem key={type} value={type}>{FINANCE_TYPE_LABELS[type]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-email" className={cn('text-sm', 'font-medium')}>Email</Label>
                    <Input id="fin-email" type="email" value={finFormEmail} onChange={(e) => setFinFormEmail(e.target.value)} placeholder="loans@bank.com" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-phone" className={cn('text-sm', 'font-medium')}>Contact Number</Label>
                    <Input id="fin-phone" value={finFormContactNumber} onChange={(e) => setFinFormContactNumber(e.target.value)} placeholder="+91 9999999999" className="h-11" />
                  </div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-rate" className={cn('text-sm', 'font-medium')}>Interest Rate (%)</Label>
                    <Input id="fin-rate" type="number" step="0.1" min={0} value={finFormInterestRate} onChange={(e) => setFinFormInterestRate(e.target.value)} placeholder="8.5" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-fee" className={cn('text-sm', 'font-medium')}>Processing Fee (%)</Label>
                    <Input id="fin-fee" type="number" step="0.1" min={0} value={finFormProcessingFee} onChange={(e) => setFinFormProcessingFee(e.target.value)} placeholder="1.5" className="h-11" />
                  </div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-emi" className={cn('text-sm', 'font-medium')}>EMI Start (₹)</Label>
                    <Input id="fin-emi" type="number" min={0} value={finFormEmiStartPrice} onChange={(e) => setFinFormEmiStartPrice(e.target.value)} placeholder="5000" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-min-loan" className={cn('text-sm', 'font-medium')}>Min Loan (₹)</Label>
                    <Input id="fin-min-loan" type="number" min={0} value={finFormMinLoan} onChange={(e) => setFinFormMinLoan(e.target.value)} placeholder="100000" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-max-loan" className={cn('text-sm', 'font-medium')}>Max Loan (₹)</Label>
                    <Input id="fin-max-loan" type="number" min={0} value={finFormMaxLoan} onChange={(e) => setFinFormMaxLoan(e.target.value)} placeholder="5000000" className="h-11" />
                  </div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-5')}>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-min-tenure" className={cn('text-sm', 'font-medium')}>Min Tenure (months)</Label>
                    <Input id="fin-min-tenure" type="number" min={0} value={finFormMinTenure} onChange={(e) => setFinFormMinTenure(e.target.value)} placeholder="12" className="h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="fin-max-tenure" className={cn('text-sm', 'font-medium')}>Max Tenure (months)</Label>
                    <Input id="fin-max-tenure" type="number" min={0} value={finFormMaxTenure} onChange={(e) => setFinFormMaxTenure(e.target.value)} placeholder="84" className="h-11" />
                  </div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-3')}>
                  <div className={cn('flex', 'items-center', 'gap-4', 'rounded-xl', 'border', 'p-4', 'bg-muted/20')}>
                    <Switch id="fin-popular" checked={finFormIsPopular} onCheckedChange={setFinFormIsPopular} />
                    <Label htmlFor="fin-popular" className={cn('cursor-pointer', 'font-medium', 'text-sm')}>Popular Option</Label>
                  </div>
                  <div className={cn('flex', 'items-center', 'gap-4', 'rounded-xl', 'border', 'p-4', 'bg-muted/20')}>
                    <Switch id="fin-preapproval" checked={finFormPreApproval} onCheckedChange={setFinFormPreApproval} />
                    <Label htmlFor="fin-preapproval" className={cn('cursor-pointer', 'font-medium', 'text-sm')}>Pre-Approval</Label>
                  </div>
                  <div className={cn('flex', 'items-center', 'gap-4', 'rounded-xl', 'border', 'p-4', 'bg-muted/20')}>
                    <Switch id="fin-instant" checked={finFormInstantDisbursement} onCheckedChange={setFinFormInstantDisbursement} />
                    <Label htmlFor="fin-instant" className={cn('cursor-pointer', 'font-medium', 'text-sm')}>Instant Disbursement</Label>
                  </div>
                </div>
              </div>

              <DrawerFooter className={cn('px-0', 'pb-4', 'pt-4', 'shrink-0', 'border-t', 'mt-4')}>
                <div className={cn('flex', 'flex-row', 'gap-3', 'w-full')}>
                  <DrawerClose asChild>
                    <Button variant="outline" type="button" className={cn('flex-1', 'h-11')}>Cancel</Button>
                  </DrawerClose>
                  <Button type="submit" disabled={creating || updating} className={cn('flex-1', 'h-11', 'text-base', 'font-medium', 'relative')}>
                    {(creating || updating) ? (
                      <span className={cn('flex', 'items-center', 'gap-2')}>
                        <svg className={cn('animate-spin', 'h-4', 'w-4')} viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {editingFinance ? "Saving..." : "Creating..."}
                      </span>
                    ) : (
                      editingFinance ? "Save Changes" : "Create Finance Option"
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>

        {/* ─── Insurance View Drawer ───────────────────────── */}
        <Drawer open={viewInsDrawerOpen} onOpenChange={setViewInsDrawerOpen} direction="right">
          <DrawerContent className={cn('w-[80vw]', 'max-w-3xl', 'ml-auto', 'h-full', 'flex', 'flex-col')}>
            <DrawerHeader className={cn('shrink-0', 'px-8', 'pt-8', 'pb-4', 'border-b')}>
              <DrawerTitle className={cn('text-xl', 'font-semibold')}>Insurance Company Details</DrawerTitle>
            </DrawerHeader>
            {viewInsurance && (
              <div className={cn('px-8', 'py-6', 'space-y-6', 'overflow-y-auto', 'overflow-x-hidden', 'flex-1', 'min-h-0')}>
                <div className={cn('flex', 'items-center', 'gap-5')}>
                  {viewInsurance.logo?.url ? (
                    <Image src={viewInsurance.logo.url} alt={viewInsurance.name} width={72} height={72} className={cn('rounded-xl', 'object-cover', 'border', 'shrink-0')} />
                  ) : (
                    <div className={cn('w-18', 'h-18', 'rounded-xl', 'bg-gradient-to-br', 'from-blue-400', 'to-blue-600', 'flex', 'items-center', 'justify-center', 'shrink-0', 'w-[72px]', 'h-[72px]')}>
                      <Shield className={cn('h-8', 'w-8', 'text-white')} />
                    </div>
                  )}
                  <div>
                    <h3 className={cn('text-xl', 'font-bold')}>{viewInsurance.name}</h3>
                    <Badge className={`mt-1.5 ${viewInsurance.isPremiumPartner ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {viewInsurance.isPremiumPartner ? "Premium Partner" : "Standard"}
                    </Badge>
                  </div>
                </div>

                {viewInsurance.description && (
                  <p className={cn('text-sm', 'text-muted-foreground', 'leading-relaxed')}>{viewInsurance.description}</p>
                )}

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4')}>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><Mail className={cn('h-3.5', 'w-3.5')} /> Email</div>
                    <div className={cn('text-sm', 'font-medium')}>{viewInsurance.email}</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><Phone className={cn('h-3.5', 'w-3.5')} /> Contact</div>
                    <div className={cn('text-sm', 'font-medium')}>{viewInsurance.contactNumber || "—"}</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><Globe className={cn('h-3.5', 'w-3.5')} /> Website</div>
                    <div className={cn('text-sm', 'font-medium', 'truncate')}>{viewInsurance.website || "—"}</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><DollarSign className={cn('h-3.5', 'w-3.5')} /> EMI From</div>
                    <div className={cn('text-sm', 'font-bold', 'text-primary')}>₹{viewInsurance.emiStartPrice?.toLocaleString()}/mo</div>
                  </div>
                </div>

                <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-2')}>
                  <div className={cn('text-xs', 'font-semibold', 'text-muted-foreground', 'uppercase', 'tracking-wider')}>Coverage Range</div>
                  <div className={cn('text-sm', 'font-medium')}>₹{viewInsurance.minCoverageAmount?.toLocaleString()} — ₹{viewInsurance.maxCoverageAmount?.toLocaleString()}</div>
                </div>

                <div className="space-y-3">
                  <div className={cn('text-xs', 'font-semibold', 'text-muted-foreground', 'uppercase', 'tracking-wider')}>Coverage Types</div>
                  <div className={cn('flex', 'flex-wrap', 'gap-2')}>
                    {viewInsurance.coverageTypes?.map((t) => (
                      <Badge key={t} variant="outline" className={cn('text-xs', 'px-2.5', 'py-1')}>{COVERAGE_TYPE_LABELS[t as CoverageType] || t}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={cn('text-xs', 'font-semibold', 'text-muted-foreground', 'uppercase', 'tracking-wider')}>Insurance Products</div>
                  <div className={cn('flex', 'flex-wrap', 'gap-2')}>
                    {viewInsurance.insuranceTypes?.map((t) => (
                      <Badge key={t} variant="secondary" className={cn('text-xs', 'px-2.5', 'py-1')}>{INSURANCE_PRODUCT_TYPE_LABELS[t as InsuranceProductType] || t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DrawerFooter className={cn('px-8', 'py-5', 'border-t', 'shrink-0')}>
              <DrawerClose asChild>
                <Button variant="outline" className={cn('w-full', 'h-11')}>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* ─── Finance View Drawer ─────────────────────────── */}
        <Drawer open={viewFinDrawerOpen} onOpenChange={setViewFinDrawerOpen} direction="right">
          <DrawerContent className={cn('w-[80vw]', 'max-w-3xl', 'ml-auto', 'h-full', 'flex', 'flex-col')}>
            <DrawerHeader className={cn('shrink-0', 'px-8', 'pt-8', 'pb-4', 'border-b')}>
              <DrawerTitle className={cn('text-xl', 'font-semibold')}>Finance Option Details</DrawerTitle>
            </DrawerHeader>
            {viewFinance && (
              <div className={cn('px-8', 'py-6', 'space-y-6', 'overflow-y-auto', 'overflow-x-hidden', 'flex-1', 'min-h-0')}>
                <div className={cn('flex', 'items-center', 'gap-5')}>
                  {viewFinance.logo?.url ? (
                    <Image src={viewFinance.logo.url} alt={viewFinance.bankName} width={72} height={72} className={cn('rounded-xl', 'object-cover', 'border', 'shrink-0')} />
                  ) : (
                    <div className={cn('w-[72px]', 'h-[72px]', 'rounded-xl', 'bg-gradient-to-br', 'from-green-400', 'to-green-600', 'flex', 'items-center', 'justify-center', 'shrink-0')}>
                      <Building2 className={cn('h-8', 'w-8', 'text-white')} />
                    </div>
                  )}
                  <div>
                    <h3 className={cn('text-xl', 'font-bold')}>{viewFinance.bankName}</h3>
                    <Badge variant="outline" className="mt-1.5">{FINANCE_TYPE_LABELS[viewFinance.financeType as FinanceType] || viewFinance.financeType}</Badge>
                  </div>
                </div>

                {viewFinance.description && (
                  <p className={cn('text-sm', 'text-muted-foreground', 'leading-relaxed')}>{viewFinance.description}</p>
                )}

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4')}>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><Percent className={cn('h-3.5', 'w-3.5')} /> Interest Rate</div>
                    <div className={cn('text-sm', 'font-bold')}>{viewFinance.interestRate}% p.a.</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><DollarSign className={cn('h-3.5', 'w-3.5')} /> EMI From</div>
                    <div className={cn('text-sm', 'font-bold', 'text-primary')}>₹{viewFinance.emiStartPrice?.toLocaleString()}/mo</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground')}>Processing Fee</div>
                    <div className={cn('text-sm', 'font-medium')}>{viewFinance.processingFee}%</div>
                  </div>
                  <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-1')}>
                    <div className={cn('text-xs', 'text-muted-foreground', 'flex', 'items-center', 'gap-1.5')}><Mail className={cn('h-3.5', 'w-3.5')} /> Email</div>
                    <div className={cn('text-sm', 'font-medium', 'truncate')}>{viewFinance.email || "—"}</div>
                  </div>
                </div>

                <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-2')}>
                  <div className={cn('text-xs', 'font-semibold', 'text-muted-foreground', 'uppercase', 'tracking-wider')}>Loan Range</div>
                  <div className={cn('text-sm', 'font-medium')}>₹{viewFinance.minLoanAmount?.toLocaleString()} — ₹{viewFinance.maxLoanAmount?.toLocaleString()}</div>
                </div>

                <div className={cn('rounded-xl', 'border', 'p-4', 'space-y-2')}>
                  <div className={cn('text-xs', 'font-semibold', 'text-muted-foreground', 'uppercase', 'tracking-wider')}>Tenure Range</div>
                  <div className={cn('text-sm', 'font-medium')}>{viewFinance.minTenure} — {viewFinance.maxTenure} months</div>
                </div>

                <div className={cn('grid', 'grid-cols-1', 'sm:grid-cols-3', 'gap-3')}>
                  <div className={`rounded-xl border p-4 text-center ${viewFinance.isPopular ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20" : ""}`}>
                    {viewFinance.isPopular ? <CheckCircle2 className={cn('h-5', 'w-5', 'text-blue-500', 'mx-auto', 'mb-2')} /> : <XCircle className={cn('h-5', 'w-5', 'text-muted-foreground', 'mx-auto', 'mb-2')} />}
                    <div className={cn('text-xs', 'font-medium')}>Popular</div>
                  </div>
                  <div className={`rounded-xl border p-4 text-center ${viewFinance.preApprovalAvailable ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20" : ""}`}>
                    {viewFinance.preApprovalAvailable ? <CheckCircle2 className={cn('h-5', 'w-5', 'text-purple-500', 'mx-auto', 'mb-2')} /> : <XCircle className={cn('h-5', 'w-5', 'text-muted-foreground', 'mx-auto', 'mb-2')} />}
                    <div className={cn('text-xs', 'font-medium')}>Pre-Approval</div>
                  </div>
                  <div className={`rounded-xl border p-4 text-center ${viewFinance.instantDisbursement ? "bg-green-50 border-green-200 dark:bg-green-950/20" : ""}`}>
                    {viewFinance.instantDisbursement ? <CheckCircle2 className={cn('h-5', 'w-5', 'text-green-500', 'mx-auto', 'mb-2')} /> : <XCircle className={cn('h-5', 'w-5', 'text-muted-foreground', 'mx-auto', 'mb-2')} />}
                    <div className={cn('text-xs', 'font-medium')}>Instant</div>
                  </div>
                </div>
              </div>
            )}
            <DrawerFooter className={cn('px-8', 'py-5', 'border-t', 'shrink-0')}>
              <DrawerClose asChild>
                <Button variant="outline" className={cn('w-full', 'h-11')}>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* ─── Insurance Delete Dialog ─────────────────────── */}
        <AlertDialog open={deleteInsDialogOpen} onOpenChange={setDeleteInsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Insurance Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{insToDelete?.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteInsurance}
                disabled={deleting}
              >
                {deleting ? <IconLoader className={cn('mr-2', 'h-4', 'w-4', 'animate-spin')} /> : <Trash2 className={cn('mr-2', 'h-4', 'w-4')} />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─── Finance Delete Dialog ───────────────────────── */}
        <AlertDialog open={deleteFinDialogOpen} onOpenChange={setDeleteFinDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Finance Option</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{finToDelete?.bankName}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteFinance}
                disabled={deleting}
              >
                {deleting ? <IconLoader className={cn('mr-2', 'h-4', 'w-4', 'animate-spin')} /> : <Trash2 className={cn('mr-2', 'h-4', 'w-4')} />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─── Bulk Delete Insurance Dialog ────────────────── */}
        <AlertDialog open={bulkDeleteInsDialogOpen} onOpenChange={setBulkDeleteInsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {Object.keys(insRowSelection).length} insurance compan{Object.keys(insRowSelection).length === 1 ? 'y' : 'ies'}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected {Object.keys(insRowSelection).length} insurance compan{Object.keys(insRowSelection).length === 1 ? 'y' : 'ies'} and remove them from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleBulkDeleteInsurance}
                disabled={deleting}
              >
                {deleting ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─── Bulk Delete Finance Dialog ───────────────────── */}
        <AlertDialog open={bulkDeleteFinDialogOpen} onOpenChange={setBulkDeleteFinDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {Object.keys(finRowSelection).length} finance option{Object.keys(finRowSelection).length === 1 ? '' : 's'}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected {Object.keys(finRowSelection).length} finance option{Object.keys(finRowSelection).length === 1 ? '' : 's'} and remove them from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleBulkDeleteFinance}
                disabled={deleting}
              >
                {deleting ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
