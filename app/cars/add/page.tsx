"use client";



import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";

import { toast, Toaster } from "sonner";

import {

  IconCheck,

  IconLoader,

  IconPlus,

} from "@tabler/icons-react";

import {

  ArrowLeft,

  Car as CarIcon,

  DollarSign,



  Gauge,

  ImageIcon,

  ListChecks,

  Pencil,

  Settings2,

  Shield,

  Upload,

  X,

} from "lucide-react";



import { AppSidebar } from "@/components/app-sidebar";

import { SiteHeader } from "@/components/site-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";



import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import {

  fetchCarById,

  clearCurrentCar,

  createCar,

  updateCar,

} from "@/lib/redux/carSlice";

import {

  CarStatus,

  FuelType,

  TransmissionType,

  BodyType,

  InsuranceType,

  DriveType,

  SellerType,

  OwnershipType,

} from "@/lib/enums/CarEnums";



// ─── Feature & Specification Keys ────────────────────────

const FEATURE_KEYS = [

  "Sunroof", "Panoramic Sunroof", "Leather Seats", "Heated Seats",

  "Ventilated Seats", "Memory Seats", "Premium Sound System", "Navigation System",

  "Apple CarPlay", "Android Auto", "Wireless Charging", "Keyless Entry",

  "Push Button Start", "Remote Start", "Dual Zone Climate Control", "Rear AC Vents",

  "Cruise Control", "360° Camera", "Parking Sensors", "Blind Spot Monitoring",

  "Lane Keep Assist", "Adaptive Cruise Control", "Heads-Up Display", "Ambient Lighting",

  "Power Tailgate", "Heated Steering Wheel", "Auto Dimming Mirrors", "Rain Sensing Wipers",

  "Automatic Headlights", "LED Headlights", "Fog Lights", "Alloy Wheels",

  "Run Flat Tires", "Spare Wheel",

];



const SPECIFICATION_KEYS = [

  "Turbo Engine", "Automatic Transmission", "All-Wheel Drive", "Leather Seats",

  "Sunroof", "Panoramic Sunroof", "Heated Seats", "Ventilated Seats",

  "Memory Seats", "Premium Sound System", "Navigation System", "Apple CarPlay",

  "Android Auto", "Wireless Charging", "Keyless Entry", "Push Button Start",

  "Remote Start", "Dual Zone Climate Control", "Rear AC Vents", "Cruise Control",

  "Adaptive Cruise Control", "360° Camera", "Parking Sensors", "Blind Spot Monitoring",

  "Lane Departure Warning", "Heads-Up Display", "Ambient Lighting", "Power Tailgate",

];



const DEFAULT_FEATURES = Object.fromEntries(FEATURE_KEYS.map((k) => [k, false]));

const DEFAULT_SPECIFICATIONS = Object.fromEntries(SPECIFICATION_KEYS.map((k) => [k, false]));



// ─── Steps config for sidebar nav ──────────────────────

const SECTIONS = [

  { id: "basic", label: "Basic Info", icon: CarIcon },

  { id: "pricing", label: "Pricing", icon: DollarSign },

  { id: "specs", label: "Specifications", icon: Gauge },

  { id: "location", label: "Location & Insurance", icon: Shield },

  { id: "features", label: "Features", icon: ListChecks },

  { id: "specsToggle", label: "Specs Toggle", icon: Settings2 },

  { id: "images", label: "Images", icon: ImageIcon },

];



export default function AddCarPage() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const editId = searchParams.get("id");

  const isEditMode = !!editId;



  const dispatch = useAppDispatch();

  const { currentCar, fetchingCar, creating, updating } = useAppSelector((s) => s.car);

  const hasFetched = React.useRef(false);



  // Active section for sidebar highlight

  const [activeSection, setActiveSection] = React.useState("basic");



  // ─── Form State (pre-filled with dummy data) ────────

  const [title, setTitle] = React.useState(isEditMode ? "" : "BMW X5 M Sport 2023");

  const [brand, setBrand] = React.useState(isEditMode ? "" : "BMW");

  const [carModel, setCarModel] = React.useState(isEditMode ? "" : "X5 M Sport");

  const [year, setYear] = React.useState(isEditMode ? "" : "2023");

  const [variant, setVariant] = React.useState(isEditMode ? "" : "M Sport");

  const [bodyType, setBodyType] = React.useState(isEditMode ? "" : BodyType.SUV);

  const [color, setColor] = React.useState(isEditMode ? "" : "Black Sapphire");

  const [description, setDescription] = React.useState(isEditMode ? "" : "Premium BMW X5 M Sport in excellent condition with full service history and luxury features");



  const [regularPrice, setRegularPrice] = React.useState(isEditMode ? "" : "9000000");

  const [salePrice, setSalePrice] = React.useState(isEditMode ? "" : "8500000");

  const [onRoadPrice, setOnRoadPrice] = React.useState(isEditMode ? "" : "9200000");

  const [emiStartingFrom, setEmiStartingFrom] = React.useState(isEditMode ? "" : "250000");



  const [km, setKm] = React.useState(isEditMode ? "" : "12000");

  const [fuelType, setFuelType] = React.useState(isEditMode ? "" : FuelType.PETROL);

  const [transmission, setTransmission] = React.useState(isEditMode ? "" : TransmissionType.AUTOMATIC);

  const [engine, setEngine] = React.useState(isEditMode ? "" : "3.0L Turbocharged Inline-6");

  const [mileage, setMileage] = React.useState(isEditMode ? "" : "12.5 km/L");

  const [seats, setSeats] = React.useState(isEditMode ? "" : "5");

  const [ownership, setOwnership] = React.useState(isEditMode ? "" : String(OwnershipType.FIRST));

  const [driveType, setDriveType] = React.useState(isEditMode ? "" : DriveType.AWD);

  const [sellerType, setSellerType] = React.useState(isEditMode ? "" : SellerType.INDIVIDUAL);



  const [registrationCity, setRegistrationCity] = React.useState(isEditMode ? "" : "Ahmedabad");

  const [registrationState, setRegistrationState] = React.useState(isEditMode ? "" : "Gujarat");

  const [insurance, setInsurance] = React.useState(isEditMode ? "" : InsuranceType.COMPREHENSIVE);

  const [status, setStatus] = React.useState(CarStatus.AVAILABLE);

  const [isFeatured, setIsFeatured] = React.useState(isEditMode ? false : true);



  const DUMMY_FEATURES: Record<string, boolean> = {

    "Sunroof": true, "Panoramic Sunroof": false, "Leather Seats": true, "Heated Seats": true,

    "Ventilated Seats": false, "Memory Seats": true, "Premium Sound System": true, "Navigation System": true,

    "Apple CarPlay": true, "Android Auto": true, "Wireless Charging": true, "Keyless Entry": true,

    "Push Button Start": true, "Remote Start": false, "Dual Zone Climate Control": true, "Rear AC Vents": true,

    "Cruise Control": true, "360° Camera": true, "Parking Sensors": true, "Blind Spot Monitoring": true,

    "Lane Keep Assist": true, "Adaptive Cruise Control": false, "Heads-Up Display": true, "Ambient Lighting": true,

    "Power Tailgate": true, "Heated Steering Wheel": true, "Auto Dimming Mirrors": true, "Rain Sensing Wipers": true,

    "Automatic Headlights": true, "LED Headlights": true, "Fog Lights": true, "Alloy Wheels": true,

    "Run Flat Tires": false, "Spare Wheel": true,

  };

  const DUMMY_SPECIFICATIONS: Record<string, boolean> = {

    "Turbo Engine": true, "Automatic Transmission": true, "All-Wheel Drive": true, "Leather Seats": true,

    "Sunroof": true, "Panoramic Sunroof": false, "Heated Seats": true, "Ventilated Seats": false,

    "Memory Seats": true, "Premium Sound System": true, "Navigation System": true, "Apple CarPlay": true,

    "Android Auto": true, "Wireless Charging": true, "Keyless Entry": true, "Push Button Start": true,

    "Remote Start": false, "Dual Zone Climate Control": true, "Rear AC Vents": true, "Cruise Control": true,

    "Adaptive Cruise Control": false, "360° Camera": true, "Parking Sensors": true, "Blind Spot Monitoring": true,

    "Lane Departure Warning": true, "Heads-Up Display": true, "Ambient Lighting": true, "Power Tailgate": true,

  };



  const [features, setFeatures] = React.useState<Record<string, boolean>>(isEditMode ? { ...DEFAULT_FEATURES } : { ...DEFAULT_FEATURES, ...DUMMY_FEATURES });

  const [specifications, setSpecifications] = React.useState<Record<string, boolean>>(isEditMode ? { ...DEFAULT_SPECIFICATIONS } : { ...DEFAULT_SPECIFICATIONS, ...DUMMY_SPECIFICATIONS });



  const [primaryImageFile, setPrimaryImageFile] = React.useState<File | null>(null);

  const [primaryImagePreview, setPrimaryImagePreview] = React.useState<string | null>(null);

  const [additionalImageFiles, setAdditionalImageFiles] = React.useState<File[]>([]);

  const [additionalImagePreviews, setAdditionalImagePreviews] = React.useState<string[]>([]);

  const primaryFileRef = React.useRef<HTMLInputElement>(null);

  const additionalFileRef = React.useRef<HTMLInputElement>(null);



  // Section refs for scroll-to

  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});



  // Fetch car by ID if edit mode

  React.useEffect(() => {

    if (isEditMode && editId && !hasFetched.current) {

      hasFetched.current = true;

      dispatch(fetchCarById(editId));

    }

    return () => {

      dispatch(clearCurrentCar());

    };

  }, [dispatch, isEditMode, editId]);



  // Populate form when car data is fetched

  React.useEffect(() => {

    if (!isEditMode || !currentCar) return;

    const car = currentCar;

    setTitle(car.title || "");

    setBrand(car.brand || "");

    setCarModel(car.carModel || "");

    setYear(car.year ? String(car.year) : "");

    setVariant(car.variant || "");

    setBodyType(car.bodyType || "");

    setColor(car.color || "");

    setDescription(car.description || "");

    setRegularPrice(car.regularPrice ? String(car.regularPrice) : "");

    setSalePrice(car.salePrice ? String(car.salePrice) : "");

    setOnRoadPrice(car.onRoadPrice ? String(car.onRoadPrice) : "");

    setEmiStartingFrom(car.emiStartingFrom ? String(car.emiStartingFrom) : "");

    setKm(car.km ? String(car.km) : "");

    setFuelType(car.fuelType || "");

    setTransmission(car.transmission || "");

    setEngine(car.engine || "");

    setMileage(car.mileage || "");

    setSeats(car.seats ? String(car.seats) : "");

    setOwnership(car.ownership ? String(car.ownership) : "");

    setDriveType(car.driveType || "");

    setSellerType(car.sellerType || "");

    setRegistrationCity(car.registrationCity || "");

    setRegistrationState(car.registrationState || "");

    setInsurance(car.insurance || "");

    setStatus((car.status as CarStatus) || CarStatus.AVAILABLE);

    setIsFeatured(car.isFeatured ?? false);

    setPrimaryImagePreview(car.primaryImage?.url || null);

    setAdditionalImagePreviews(car.images?.map((img) => img.url) || []);



    // Parse features from API format: [{ features: { [key: string]: boolean } }]
    const parsedFeatures = { ...DEFAULT_FEATURES };
    
    if (Array.isArray(car.features) && car.features.length > 0) {
      const featuresData = car.features[0];
      if (featuresData.features && typeof featuresData.features === 'object') {
        Object.entries(featuresData.features).forEach(([featureName, isAvailable]) => {
          if (featureName in parsedFeatures) {
            parsedFeatures[featureName] = isAvailable;
          }
        });
      }
    }
    
    setFeatures(parsedFeatures);



    // Parse specifications from API format: [{ specifications: { [key: string]: boolean } }]
    const parsedSpecs = { ...DEFAULT_SPECIFICATIONS };
    
    if (Array.isArray(car.specifications) && car.specifications.length > 0) {
      const specificationsData = car.specifications[0];
      if (specificationsData.specifications && typeof specificationsData.specifications === 'object') {
        Object.entries(specificationsData.specifications).forEach(([specName, isAvailable]) => {
          if (specName in parsedSpecs) {
            parsedSpecs[specName] = isAvailable;
          }
        });
      }
    }
    
    setSpecifications(parsedSpecs);

  }, [isEditMode, currentCar]);



  // Intersection observer for active section tracking

  React.useEffect(() => {

    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((section) => {

      const el = sectionRefs.current[section.id];

      if (!el) return;

      const observer = new IntersectionObserver(

        ([entry]) => {

          if (entry.isIntersecting) setActiveSection(section.id);

        },

        { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }

      );

      observer.observe(el);

      observers.push(observer);

    });

    return () => observers.forEach((o) => o.disconnect());

  }, []);



  const scrollToSection = (id: string) => {

    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

  };



  const processFile = (file: File, type: "primary" | "additional") => {

    if (!file.type.startsWith("image/")) {

      toast.error("Please upload a valid image file.");

      return;

    }

    if (file.size > 5 * 1024 * 1024) {

      toast.error("Image size must be less than 5 MB.");

      return;

    }

    const reader = new FileReader();

    if (type === "primary") {

      setPrimaryImageFile(file);

      reader.onloadend = () => setPrimaryImagePreview(reader.result as string);

    } else {

      setAdditionalImageFiles((prev) => [...prev, file]);

      reader.onloadend = () =>

        setAdditionalImagePreviews((prev) => [...prev, reader.result as string]);

    }

    reader.readAsDataURL(file);

  };



  const handleRemoveAdditionalImage = (index: number) => {

    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));

    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));

  };



  const validate = (): boolean => {

    if (!title.trim()) { toast.error("Title is required."); scrollToSection("basic"); return false; }

    if (!brand.trim()) { toast.error("Brand is required."); scrollToSection("basic"); return false; }

    if (!carModel.trim()) { toast.error("Model is required."); scrollToSection("basic"); return false; }

    if (!year.trim()) { toast.error("Year is required."); scrollToSection("basic"); return false; }

    if (!regularPrice.trim()) { toast.error("Regular price is required."); scrollToSection("pricing"); return false; }

    if (!salePrice.trim()) { toast.error("Sale price is required."); scrollToSection("pricing"); return false; }

    if (!fuelType) { toast.error("Fuel type is required."); scrollToSection("specs"); return false; }

    if (!transmission) { toast.error("Transmission is required."); scrollToSection("specs"); return false; }

    if (!registrationCity.trim()) { toast.error("Registration city is required."); scrollToSection("location"); return false; }

    if (!registrationState.trim()) { toast.error("Registration state is required."); scrollToSection("location"); return false; }

    if (!isEditMode && !primaryImageFile) { toast.error("Primary image is required."); scrollToSection("images"); return false; }

    return true;

  };



  const handleSubmit = async () => {

    if (!validate()) return;



    const formData = new FormData();

    formData.append("title", title.trim());

    formData.append("brand", brand.trim());

    formData.append("carModel", carModel.trim());

    formData.append("year", year.trim());

    formData.append("variant", variant.trim());

    formData.append("bodyType", bodyType);

    formData.append("color", color.trim());

    formData.append("description", description.trim());

    formData.append("regularPrice", regularPrice.trim());

    formData.append("salePrice", salePrice.trim());

    formData.append("onRoadPrice", onRoadPrice.trim());

    formData.append("emiStartingFrom", emiStartingFrom.trim());

    formData.append("km", km.trim());

    formData.append("fuelType", fuelType);

    formData.append("transmission", transmission);

    formData.append("engine", engine.trim());

    formData.append("mileage", mileage.trim());

    formData.append("seats", seats.trim());

    formData.append("ownership", ownership.trim());

    formData.append("driveType", driveType);

    formData.append("sellerType", sellerType);

    formData.append("registrationCity", registrationCity.trim());

    formData.append("registrationState", registrationState.trim());

    formData.append("insurance", insurance);

    formData.append("status", status);

    formData.append("isFeatured", String(isFeatured));

    formData.append("features", JSON.stringify(features));

    formData.append("specifications", JSON.stringify(specifications));



    if (primaryImageFile) formData.append("primaryImage", primaryImageFile);

    additionalImageFiles.forEach((file) => formData.append("images", file));



    if (isEditMode) {

      const result = await dispatch(updateCar({ id: editId!, formData }));

      if (updateCar.fulfilled.match(result)) {

        toast.success("Car updated successfully!");

        router.push("/cars");

      } else {

        toast.error(result.payload ?? "Failed to update car.");

      }

    } else {

      console.log("Submitting new car with data:", formData);

      const result = await dispatch(createCar(formData));

      if (createCar.fulfilled.match(result)) {

        toast.success("Car created successfully!");

        router.push("/cars");

      } else {

        toast.error(result.payload ?? "Failed to create car.");

      }

    }

  };



  // Count enabled features / specs for badges

  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;

  const enabledSpecsCount = Object.values(specifications).filter(Boolean).length;



  // Completeness tracking

  const completedSections = React.useMemo(() => {

    const done: string[] = [];

    if (title && brand && carModel && year) done.push("basic");

    if (regularPrice && salePrice) done.push("pricing");

    if (fuelType && transmission) done.push("specs");

    if (registrationCity && registrationState) done.push("location");

    if (enabledFeaturesCount > 0) done.push("features");

    if (enabledSpecsCount > 0) done.push("specsToggle");

    if (primaryImagePreview) done.push("images");

    return done;

  }, [title, brand, carModel, year, regularPrice, salePrice, fuelType, transmission, registrationCity, registrationState, primaryImagePreview, enabledFeaturesCount, enabledSpecsCount]);



  const progressPercent = Math.round((completedSections.length / SECTIONS.length) * 100);



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

          <div className="flex flex-1 flex-col overflow-hidden">

            <div className="flex flex-col gap-6 py-6 overflow-y-auto">

              {/* ─── Page Header ────────────────────────────── */}

              <div className="px-4 lg:px-6">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <Button

                      variant="outline"

                      size="icon"

                      className="h-9 w-9 shrink-0"

                      onClick={() => router.push("/cars")}

                    >

                      <ArrowLeft className="h-4 w-4" />

                    </Button>

                    <div>

                      <h1 className="text-2xl font-bold tracking-tight">

                        {isEditMode ? "Edit Car" : "Add New Car"}

                      </h1>

                      <p className="text-sm text-muted-foreground mt-0.5">

                        {isEditMode

                          ? "Update the car listing information below."

                          : "Fill in the details to create a new car listing."}

                      </p>

                    </div>

                  </div>

                  <div className="hidden sm:flex items-center gap-3">

                    <div className="text-right mr-2">

                      <p className="text-xs text-muted-foreground">Completion</p>

                      <p className="text-sm font-semibold">{progressPercent}%</p>

                    </div>

                    <Progress value={progressPercent} className="w-32 h-2" />

                  </div>

                </div>

              </div>



              {/* ─── Main Content: Sidebar Nav + Form ──────── */}

              {isEditMode && fetchingCar ? (

                <div className="px-4 lg:px-6">

                  <div className="flex flex-col items-center justify-center py-24 gap-4">

                    <IconLoader className="h-8 w-8 animate-spin text-primary" />

                    <p className="text-sm text-muted-foreground">Loading car details...</p>

                  </div>

                </div>

              ) : (

              <div className="px-4 lg:px-6">

                <div className="flex gap-6">

                  {/* Section Navigation Sidebar */}

                  <div className="hidden lg:block w-56 shrink-0">

                    <div className="sticky top-20">

                      <nav className="space-y-1">

                        {SECTIONS.map((section) => {

                          const Icon = section.icon;

                          const isActive = activeSection === section.id;

                          const isCompleted = completedSections.includes(section.id);

                          return (

                            <button

                              key={section.id}

                              type="button"

                              onClick={() => scrollToSection(section.id)}

                              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${

                                isActive

                                  ? "bg-primary/10 text-primary border border-primary/20"

                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"

                              }`}

                            >

                              <div

                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 transition-all ${

                                  isActive

                                    ? "border-primary bg-primary/10"

                                    : isCompleted

                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"

                                    : "border-muted"

                                }`}

                              >

                                {isCompleted && !isActive ? (

                                  <IconCheck className="h-3.5 w-3.5 text-green-600" />

                                ) : (

                                  <Icon className="h-3.5 w-3.5" />

                                )}

                              </div>

                              {section.label}

                            </button>

                          );

                        })}

                      </nav>



                      {/* Quick Stats */}

                      <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-3">

                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>

                        <div className="space-y-2 text-sm">

                          <div className="flex justify-between">

                            <span className="text-muted-foreground">Features</span>

                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{enabledFeaturesCount}/{FEATURE_KEYS.length}</Badge>

                          </div>

                          <div className="flex justify-between">

                            <span className="text-muted-foreground">Specs</span>

                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{enabledSpecsCount}/{SPECIFICATION_KEYS.length}</Badge>

                          </div>

                          <div className="flex justify-between">

                            <span className="text-muted-foreground">Images</span>

                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{(primaryImagePreview ? 1 : 0) + additionalImagePreviews.length}</Badge>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>



                  {/* ─── Form Sections ─────────────────────── */}

                  <div className="flex-1 min-w-0 space-y-6 pb-24">

                    {/* Section 1: Basic Info */}

                    <Card

                      ref={(el) => { sectionRefs.current.basic = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30">

                            <CarIcon className="h-4.5 w-4.5 text-blue-600" />

                          </div>

                          <div>

                            <CardTitle className="text-base">Basic Information</CardTitle>

                            <p className="text-xs text-muted-foreground mt-0.5">Enter the core details about the car.</p>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid gap-4 sm:grid-cols-2">

                          <div className="space-y-1.5 sm:col-span-2">

                            <Label className="text-sm font-medium">Title <span className="text-destructive">*</span></Label>

                            <Input placeholder="e.g. BMW X5 M Sport 2023" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Brand <span className="text-destructive">*</span></Label>

                            <Input placeholder="e.g. BMW" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Model <span className="text-destructive">*</span></Label>

                            <Input placeholder="e.g. X5 M Sport" value={carModel} onChange={(e) => setCarModel(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Year <span className="text-destructive">*</span></Label>

                            <Input type="number" placeholder="e.g. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Variant</Label>

                            <Input placeholder="e.g. M Sport" value={variant} onChange={(e) => setVariant(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Body Type</Label>

                            <Select value={bodyType} onValueChange={setBodyType}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select body type" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(BodyType).map((bt) => (

                                  <SelectItem key={bt} value={bt} className="capitalize">{bt}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Color</Label>

                            <Input placeholder="e.g. Black Sapphire" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5 sm:col-span-2">

                            <Label className="text-sm font-medium">Description</Label>

                            <Textarea placeholder="Describe the car condition, history, features..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none" />

                          </div>

                        </div>

                      </CardContent>

                    </Card>



                    {/* Section 2: Pricing */}

                    <Card

                      ref={(el) => { sectionRefs.current.pricing = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/30">

                            <DollarSign className="h-4.5 w-4.5 text-green-600" />

                          </div>

                          <div>

                            <CardTitle className="text-base">Pricing</CardTitle>

                            <p className="text-xs text-muted-foreground mt-0.5">Set the pricing details for the car.</p>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid gap-4 sm:grid-cols-2">

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Regular Price (₹) <span className="text-destructive">*</span></Label>

                            <Input type="number" placeholder="e.g. 9000000" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Sale Price (₹) <span className="text-destructive">*</span></Label>

                            <Input type="number" placeholder="e.g. 8500000" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">On-Road Price (₹)</Label>

                            <Input type="number" placeholder="e.g. 9200000" value={onRoadPrice} onChange={(e) => setOnRoadPrice(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">EMI Starting From (₹)</Label>

                            <Input type="number" placeholder="e.g. 25000" value={emiStartingFrom} onChange={(e) => setEmiStartingFrom(e.target.value)} className="h-10" />

                          </div>

                        </div>

                        {regularPrice && salePrice && Number(regularPrice) > Number(salePrice) && (

                          <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">

                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">

                              Discount: ₹{(Number(regularPrice) - Number(salePrice)).toLocaleString("en-IN")}

                              {" "}({Math.round(((Number(regularPrice) - Number(salePrice)) / Number(regularPrice)) * 100)}% off)

                            </p>

                          </div>

                        )}

                      </CardContent>

                    </Card>



                    {/* Section 3: Specifications */}

                    <Card

                      ref={(el) => { sectionRefs.current.specs = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">

                            <Gauge className="h-4.5 w-4.5 text-orange-600" />

                          </div>

                          <div>

                            <CardTitle className="text-base">Specifications</CardTitle>

                            <p className="text-xs text-muted-foreground mt-0.5">Technical specifications of the car.</p>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">KM Driven</Label>

                            <Input type="number" placeholder="e.g. 12000" value={km} onChange={(e) => setKm(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Fuel Type <span className="text-destructive">*</span></Label>

                            <Select value={fuelType} onValueChange={setFuelType}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select fuel type" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(FuelType).map((ft) => (

                                  <SelectItem key={ft} value={ft} className="capitalize">{ft}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Transmission <span className="text-destructive">*</span></Label>

                            <Select value={transmission} onValueChange={setTransmission}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select transmission" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(TransmissionType).map((t) => (

                                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Engine</Label>

                            <Input placeholder="e.g. 3.0L Turbocharged" value={engine} onChange={(e) => setEngine(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Mileage</Label>

                            <Input placeholder="e.g. 12.5 km/L" value={mileage} onChange={(e) => setMileage(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Seats</Label>

                            <Input type="number" placeholder="e.g. 5" value={seats} onChange={(e) => setSeats(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Ownership</Label>

                            <Select value={ownership} onValueChange={setOwnership}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select ownership" /></SelectTrigger>

                              <SelectContent>

                                <SelectItem value={String(OwnershipType.FIRST)}>1st Owner</SelectItem>

                                <SelectItem value={String(OwnershipType.SECOND)}>2nd Owner</SelectItem>

                                <SelectItem value={String(OwnershipType.THIRD)}>3rd Owner</SelectItem>

                                <SelectItem value={String(OwnershipType.FOURTH)}>4th Owner</SelectItem>

                                <SelectItem value={String(OwnershipType.FIFTH_OR_MORE)}>5th+ Owner</SelectItem>

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Drive Type</Label>

                            <Select value={driveType} onValueChange={setDriveType}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select drive type" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(DriveType).map((dt) => (

                                  <SelectItem key={dt} value={dt}>{dt}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Seller Type</Label>

                            <Select value={sellerType} onValueChange={setSellerType}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select seller type" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(SellerType).map((st) => (

                                  <SelectItem key={st} value={st}>{st}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                        </div>

                      </CardContent>

                    </Card>



                    {/* Section 4: Location & Insurance */}

                    <Card

                      ref={(el) => { sectionRefs.current.location = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/30">

                            <Shield className="h-4.5 w-4.5 text-purple-600" />

                          </div>

                          <div>

                            <CardTitle className="text-base">Location & Insurance</CardTitle>

                            <p className="text-xs text-muted-foreground mt-0.5">Registration and insurance details.</p>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid gap-4 sm:grid-cols-2">

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Registration City <span className="text-destructive">*</span></Label>

                            <Input placeholder="e.g. Ahmedabad" value={registrationCity} onChange={(e) => setRegistrationCity(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Registration State <span className="text-destructive">*</span></Label>

                            <Input placeholder="e.g. Gujarat" value={registrationState} onChange={(e) => setRegistrationState(e.target.value)} className="h-10" />

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Insurance</Label>

                            <Select value={insurance} onValueChange={setInsurance}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select insurance" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(InsuranceType).map((ins) => (

                                  <SelectItem key={ins} value={ins} className="capitalize">{ins.replace("_", " ")}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="space-y-1.5">

                            <Label className="text-sm font-medium">Status</Label>

                            <Select value={status} onValueChange={(v) => setStatus(v as CarStatus)}>

                              <SelectTrigger className="h-10"><SelectValue placeholder="Select status" /></SelectTrigger>

                              <SelectContent>

                                {Object.values(CarStatus).map((s) => (

                                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>

                                ))}

                              </SelectContent>

                            </Select>

                          </div>

                          <div className="sm:col-span-2">

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">

                              <div className="space-y-0.5">

                                <Label className="text-sm font-medium">Featured Car</Label>

                                <p className="text-xs text-muted-foreground">

                                  Mark this car as featured to highlight it on the homepage.

                                </p>

                              </div>

                              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />

                            </div>

                          </div>

                        </div>

                      </CardContent>

                    </Card>



                    {/* Section 5: Features */}

                    <Card

                      ref={(el) => { sectionRefs.current.features = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-950/30">

                              <ListChecks className="h-4.5 w-4.5 text-cyan-600" />

                            </div>

                            <div>

                              <CardTitle className="text-base">Features</CardTitle>

                              <p className="text-xs text-muted-foreground mt-0.5">Toggle the features available in this car.</p>

                            </div>

                          </div>

                          <Badge variant="secondary" className="text-xs">

                            {enabledFeaturesCount} / {FEATURE_KEYS.length} enabled

                          </Badge>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

                          {FEATURE_KEYS.map((key) => (

                            <div

                              key={key}

                              className={`flex items-center justify-between rounded-lg border p-3 transition-all cursor-pointer ${

                                features[key]

                                  ? "border-primary/40 bg-primary/5 shadow-sm"

                                  : "hover:bg-muted/50"

                              }`}

                              onClick={() => setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))}

                            >

                              <Label className="text-sm font-medium cursor-pointer flex-1 select-none">{key}</Label>

                              <Switch

                                checked={features[key] ?? false}

                                onCheckedChange={(checked) =>

                                  setFeatures((prev) => ({ ...prev, [key]: checked }))

                                }

                              />

                            </div>

                          ))}

                        </div>

                      </CardContent>

                    </Card>



                    {/* Section 6: Specs Toggle */}

                    <Card

                      ref={(el) => { sectionRefs.current.specsToggle = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">

                              <Settings2 className="h-4.5 w-4.5 text-amber-600" />

                            </div>

                            <div>

                              <CardTitle className="text-base">Specifications Toggle</CardTitle>

                              <p className="text-xs text-muted-foreground mt-0.5">Toggle the specification highlights for this car.</p>

                            </div>

                          </div>

                          <Badge variant="secondary" className="text-xs">

                            {enabledSpecsCount} / {SPECIFICATION_KEYS.length} enabled

                          </Badge>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

                          {SPECIFICATION_KEYS.map((key) => (

                            <div

                              key={key}

                              className={`flex items-center justify-between rounded-lg border p-3 transition-all cursor-pointer ${

                                specifications[key]

                                  ? "border-primary/40 bg-primary/5 shadow-sm"

                                  : "hover:bg-muted/50"

                              }`}

                              onClick={() => setSpecifications((prev) => ({ ...prev, [key]: !prev[key] }))}

                            >

                              <Label className="text-sm font-medium cursor-pointer flex-1 select-none">{key}</Label>

                              <Switch

                                checked={specifications[key] ?? false}

                                onCheckedChange={(checked) =>

                                  setSpecifications((prev) => ({ ...prev, [key]: checked }))

                                }

                              />

                            </div>

                          ))}

                        </div>

                      </CardContent>

                    </Card>



                    {/* Section 7: Images */}

                    <Card

                      ref={(el) => { sectionRefs.current.images = el; }}

                      className="scroll-mt-20"

                    >

                      <CardHeader className="pb-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-950/30">

                            <ImageIcon className="h-4.5 w-4.5 text-pink-600" />

                          </div>

                          <div>

                            <CardTitle className="text-base">Images</CardTitle>

                            <p className="text-xs text-muted-foreground mt-0.5">Upload the car images. Primary image is required.</p>

                          </div>

                        </div>

                      </CardHeader>

                      <CardContent>

                        <div className="space-y-6">

                          {/* Primary Image */}

                          <div className="space-y-2">

                            <Label className="text-sm font-medium">Primary Image <span className="text-destructive">*</span></Label>

                            {primaryImagePreview ? (

                              <div className="group relative overflow-hidden rounded-xl border-2 border-border shadow-sm max-w-md">

                                <div className="relative aspect-video w-full">

                                  <Image src={primaryImagePreview} alt="Primary" fill className="object-cover" sizes="500px" />

                                </div>

                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">

                                  <Button type="button" size="sm" variant="secondary" onClick={() => primaryFileRef.current?.click()} className="h-8 text-xs">

                                    <Upload className="mr-1.5 h-3.5 w-3.5" />Replace

                                  </Button>

                                  <Button type="button" size="sm" variant="destructive" onClick={() => { setPrimaryImageFile(null); setPrimaryImagePreview(null); }} className="h-8 text-xs">

                                    <X className="mr-1.5 h-3.5 w-3.5" />Remove

                                  </Button>

                                </div>

                              </div>

                            ) : (

                              <div

                                role="button"

                                tabIndex={0}

                                onClick={() => primaryFileRef.current?.click()}

                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") primaryFileRef.current?.click(); }}

                                className="flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all"

                              >

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">

                                  <Upload className="h-6 w-6" />

                                </div>

                                <div className="text-center">

                                  <p className="text-sm font-medium">

                                    Click to upload <span className="text-primary underline underline-offset-2">primary image</span>

                                  </p>

                                  <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WEBP up to 5 MB</p>

                                </div>

                              </div>

                            )}

                            <input ref={primaryFileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f, "primary"); }} className="hidden" />

                          </div>



                          <Separator />



                          {/* Additional Images */}

                          <div className="space-y-2">

                            <Label className="text-sm font-medium">Additional Images</Label>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                              {additionalImagePreviews.map((preview, index) => (

                                <div key={index} className="group relative overflow-hidden rounded-lg border">

                                  <div className="relative aspect-video w-full">

                                    <Image src={preview} alt={`Image ${index + 1}`} fill className="object-cover" sizes="200px" />

                                  </div>

                                  <button

                                    type="button"

                                    onClick={() => handleRemoveAdditionalImage(index)}

                                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"

                                  >

                                    <X className="h-3.5 w-3.5" />

                                  </button>

                                </div>

                              ))}

                              <div

                                role="button"

                                tabIndex={0}

                                onClick={() => additionalFileRef.current?.click()}

                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") additionalFileRef.current?.click(); }}

                                className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all"

                              >

                                <IconPlus className="h-6 w-6 text-muted-foreground" />

                                <span className="text-xs text-muted-foreground">Add Image</span>

                              </div>

                            </div>

                            <input ref={additionalFileRef} type="file" accept="image/*" multiple onChange={(e) => { Array.from(e.target.files || []).forEach((f) => processFile(f, "additional")); }} className="hidden" />

                          </div>

                        </div>

                      </CardContent>

                    </Card>

                  </div>

                </div>

              </div>

              )}

            </div>

          </div>



          {/* ─── Sticky Bottom Action Bar ──────────────────── */}

          <div className="fixed bottom-0 right-0 left-0 z-50 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">

            <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl mx-auto">

              <Button

                variant="outline"

                onClick={() => router.push("/cars")}

                className="gap-2"

              >

                <ArrowLeft className="h-4 w-4" />

                Cancel

              </Button>

              <div className="flex items-center gap-3">

                <p className="text-sm text-muted-foreground hidden sm:block">

                  {completedSections.length} of {SECTIONS.length} sections complete

                </p>

                <Button

                  onClick={handleSubmit}

                  disabled={creating || updating}

                  size="lg"

                  className="gap-2 min-w-35"

                >

                  {creating || updating ? (

                    <>

                      <IconLoader className="h-4 w-4 animate-spin" />

                      {isEditMode ? "Updating..." : "Creating..."}

                    </>

                  ) : isEditMode ? (

                    <>

                      <Pencil className="h-4 w-4" />

                      Update Car

                    </>

                  ) : (

                    <>

                      <IconPlus className="h-4 w-4" />

                      Create Car

                    </>

                  )}

                </Button>

              </div>

            </div>

          </div>

        </SidebarInset>

      </SidebarProvider>

    </>

  );

}

