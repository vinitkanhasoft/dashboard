"use client";

import { useEffect, useState, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Key,
  Monitor,
  Clock,
  Loader2,
  Smartphone,
  Laptop,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateProfile, fetchSessions } from "@/lib/redux/authSlice";
import { ProfileOverview } from "@/components/account/EditProfile";
import { toast } from "sonner";

// Complete country codes data
const countryCodes = [
  { code: "+93", country: "AF", name: "Afghanistan" },
  { code: "+355", country: "AL", name: "Albania" },
  { code: "+213", country: "DZ", name: "Algeria" },
  { code: "+376", country: "AD", name: "Andorra" },
  { code: "+244", country: "AO", name: "Angola" },
  { code: "+54", country: "AR", name: "Argentina" },
  { code: "+374", country: "AM", name: "Armenia" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+43", country: "AT", name: "Austria" },
  { code: "+994", country: "AZ", name: "Azerbaijan" },
  { code: "+973", country: "BH", name: "Bahrain" },
  { code: "+880", country: "BD", name: "Bangladesh" },
  { code: "+375", country: "BY", name: "Belarus" },
  { code: "+32", country: "BE", name: "Belgium" },
  { code: "+501", country: "BZ", name: "Belize" },
  { code: "+229", country: "BJ", name: "Benin" },
  { code: "+975", country: "BT", name: "Bhutan" },
  { code: "+591", country: "BO", name: "Bolivia" },
  { code: "+387", country: "BA", name: "Bosnia and Herzegovina" },
  { code: "+267", country: "BW", name: "Botswana" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+673", country: "BN", name: "Brunei" },
  { code: "+359", country: "BG", name: "Bulgaria" },
  { code: "+226", country: "BF", name: "Burkina Faso" },
  { code: "+257", country: "BI", name: "Burundi" },
  { code: "+855", country: "KH", name: "Cambodia" },
  { code: "+237", country: "CM", name: "Cameroon" },
  { code: "+1", country: "CA", name: "Canada" },
  { code: "+238", country: "CV", name: "Cape Verde" },
  { code: "+236", country: "CF", name: "Central African Republic" },
  { code: "+235", country: "TD", name: "Chad" },
  { code: "+56", country: "CL", name: "Chile" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+57", country: "CO", name: "Colombia" },
  { code: "+269", country: "KM", name: "Comoros" },
  { code: "+242", country: "CG", name: "Congo" },
  { code: "+506", country: "CR", name: "Costa Rica" },
  { code: "+385", country: "HR", name: "Croatia" },
  { code: "+53", country: "CU", name: "Cuba" },
  { code: "+357", country: "CY", name: "Cyprus" },
  { code: "+420", country: "CZ", name: "Czech Republic" },
  { code: "+45", country: "DK", name: "Denmark" },
  { code: "+253", country: "DJ", name: "Djibouti" },
  { code: "+593", country: "EC", name: "Ecuador" },
  { code: "+20", country: "EG", name: "Egypt" },
  { code: "+503", country: "SV", name: "El Salvador" },
  { code: "+240", country: "GQ", name: "Equatorial Guinea" },
  { code: "+372", country: "EE", name: "Estonia" },
  { code: "+251", country: "ET", name: "Ethiopia" },
  { code: "+679", country: "FJ", name: "Fiji" },
  { code: "+358", country: "FI", name: "Finland" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+241", country: "GA", name: "Gabon" },
  { code: "+220", country: "GM", name: "Gambia" },
  { code: "+995", country: "GE", name: "Georgia" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+233", country: "GH", name: "Ghana" },
  { code: "+30", country: "GR", name: "Greece" },
  { code: "+299", country: "GL", name: "Greenland" },
  { code: "+502", country: "GT", name: "Guatemala" },
  { code: "+224", country: "GN", name: "Guinea" },
  { code: "+245", country: "GW", name: "Guinea-Bissau" },
  { code: "+592", country: "GY", name: "Guyana" },
  { code: "+509", country: "HT", name: "Haiti" },
  { code: "+504", country: "HN", name: "Honduras" },
  { code: "+852", country: "HK", name: "Hong Kong" },
  { code: "+36", country: "HU", name: "Hungary" },
  { code: "+354", country: "IS", name: "Iceland" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+62", country: "ID", name: "Indonesia" },
  { code: "+98", country: "IR", name: "Iran" },
  { code: "+964", country: "IQ", name: "Iraq" },
  { code: "+353", country: "IE", name: "Ireland" },
  { code: "+972", country: "IL", name: "Israel" },
  { code: "+39", country: "IT", name: "Italy" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+962", country: "JO", name: "Jordan" },
  { code: "+7", country: "KZ", name: "Kazakhstan" },
  { code: "+254", country: "KE", name: "Kenya" },
  { code: "+965", country: "KW", name: "Kuwait" },
  { code: "+996", country: "KG", name: "Kyrgyzstan" },
  { code: "+856", country: "LA", name: "Laos" },
  { code: "+371", country: "LV", name: "Latvia" },
  { code: "+961", country: "LB", name: "Lebanon" },
  { code: "+266", country: "LS", name: "Lesotho" },
  { code: "+231", country: "LR", name: "Liberia" },
  { code: "+218", country: "LY", name: "Libya" },
  { code: "+423", country: "LI", name: "Liechtenstein" },
  { code: "+370", country: "LT", name: "Lithuania" },
  { code: "+352", country: "LU", name: "Luxembourg" },
  { code: "+853", country: "MO", name: "Macau" },
  { code: "+389", country: "MK", name: "Macedonia" },
  { code: "+261", country: "MG", name: "Madagascar" },
  { code: "+265", country: "MW", name: "Malawi" },
  { code: "+60", country: "MY", name: "Malaysia" },
  { code: "+960", country: "MV", name: "Maldives" },
  { code: "+223", country: "ML", name: "Mali" },
  { code: "+356", country: "MT", name: "Malta" },
  { code: "+692", country: "MH", name: "Marshall Islands" },
  { code: "+222", country: "MR", name: "Mauritania" },
  { code: "+230", country: "MU", name: "Mauritius" },
  { code: "+52", country: "MX", name: "Mexico" },
  { code: "+691", country: "FM", name: "Micronesia" },
  { code: "+373", country: "MD", name: "Moldova" },
  { code: "+377", country: "MC", name: "Monaco" },
  { code: "+976", country: "MN", name: "Mongolia" },
  { code: "+382", country: "ME", name: "Montenegro" },
  { code: "+212", country: "MA", name: "Morocco" },
  { code: "+258", country: "MZ", name: "Mozambique" },
  { code: "+95", country: "MM", name: "Myanmar" },
  { code: "+264", country: "NA", name: "Namibia" },
  { code: "+674", country: "NR", name: "Nauru" },
  { code: "+977", country: "NP", name: "Nepal" },
  { code: "+31", country: "NL", name: "Netherlands" },
  { code: "+64", country: "NZ", name: "New Zealand" },
  { code: "+505", country: "NI", name: "Nicaragua" },
  { code: "+227", country: "NE", name: "Niger" },
  { code: "+234", country: "NG", name: "Nigeria" },
  { code: "+850", country: "KP", name: "North Korea" },
  { code: "+47", country: "NO", name: "Norway" },
  { code: "+968", country: "OM", name: "Oman" },
  { code: "+92", country: "PK", name: "Pakistan" },
  { code: "+680", country: "PW", name: "Palau" },
  { code: "+970", country: "PS", name: "Palestine" },
  { code: "+507", country: "PA", name: "Panama" },
  { code: "+675", country: "PG", name: "Papua New Guinea" },
  { code: "+595", country: "PY", name: "Paraguay" },
  { code: "+51", country: "PE", name: "Peru" },
  { code: "+63", country: "PH", name: "Philippines" },
  { code: "+48", country: "PL", name: "Poland" },
  { code: "+351", country: "PT", name: "Portugal" },
  { code: "+974", country: "QA", name: "Qatar" },
  { code: "+40", country: "RO", name: "Romania" },
  { code: "+7", country: "RU", name: "Russia" },
  { code: "+250", country: "RW", name: "Rwanda" },
  { code: "+685", country: "WS", name: "Samoa" },
  { code: "+378", country: "SM", name: "San Marino" },
  { code: "+966", country: "SA", name: "Saudi Arabia" },
  { code: "+221", country: "SN", name: "Senegal" },
  { code: "+381", country: "RS", name: "Serbia" },
  { code: "+248", country: "SC", name: "Seychelles" },
  { code: "+232", country: "SL", name: "Sierra Leone" },
  { code: "+65", country: "SG", name: "Singapore" },
  { code: "+421", country: "SK", name: "Slovakia" },
  { code: "+386", country: "SI", name: "Slovenia" },
  { code: "+677", country: "SB", name: "Solomon Islands" },
  { code: "+252", country: "SO", name: "Somalia" },
  { code: "+27", country: "ZA", name: "South Africa" },
  { code: "+82", country: "KR", name: "South Korea" },
  { code: "+211", country: "SS", name: "South Sudan" },
  { code: "+34", country: "ES", name: "Spain" },
  { code: "+94", country: "LK", name: "Sri Lanka" },
  { code: "+249", country: "SD", name: "Sudan" },
  { code: "+597", country: "SR", name: "Suriname" },
  { code: "+268", country: "SZ", name: "Swaziland" },
  { code: "+46", country: "SE", name: "Sweden" },
  { code: "+41", country: "CH", name: "Switzerland" },
  { code: "+963", country: "SY", name: "Syria" },
  { code: "+886", country: "TW", name: "Taiwan" },
  { code: "+992", country: "TJ", name: "Tajikistan" },
  { code: "+255", country: "TZ", name: "Tanzania" },
  { code: "+66", country: "TH", name: "Thailand" },
  { code: "+670", country: "TL", name: "Timor-Leste" },
  { code: "+228", country: "TG", name: "Togo" },
  { code: "+676", country: "TO", name: "Tonga" },
  { code: "+216", country: "TN", name: "Tunisia" },
  { code: "+90", country: "TR", name: "Turkey" },
  { code: "+993", country: "TM", name: "Turkmenistan" },
  { code: "+688", country: "TV", name: "Tuvalu" },
  { code: "+256", country: "UG", name: "Uganda" },
  { code: "+380", country: "UA", name: "Ukraine" },
  { code: "+971", country: "AE", name: "United Arab Emirates" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+1", country: "US", name: "United States" },
  { code: "+598", country: "UY", name: "Uruguay" },
  { code: "+998", country: "UZ", name: "Uzbekistan" },
  { code: "+678", country: "VU", name: "Vanuatu" },
  { code: "+379", country: "VA", name: "Vatican City" },
  { code: "+58", country: "VE", name: "Venezuela" },
  { code: "+84", country: "VN", name: "Vietnam" },
  { code: "+967", country: "YE", name: "Yemen" },
  { code: "+260", country: "ZM", name: "Zambia" },
  { code: "+263", country: "ZW", name: "Zimbabwe" },
];

export default function Page() {
  const dispatch = useAppDispatch();
  const {
    user,
    profileUpdating,
    profileUpdateError,
    sessions,
    sessionsLoading,
    sessionId: currentSessionId,
  } = useAppSelector((s) => s.auth);

  const sessionsFetched = useRef(false);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [address, setAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Function to detect country code from pasted phone number
  const detectCountryCode = (phoneNumber: string): { code: string; number: string } => {
    // Remove all non-digit characters except +
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Try to match with known country codes
    // Sort by code length (longest first) to avoid matching +1 before +12
    const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
    
    for (const country of sortedCodes) {
      if (cleanNumber.startsWith(country.code)) {
        return {
          code: country.code,
          number: cleanNumber.slice(country.code.length)
        };
      }
    }
    
    // If no match found, assume it's a local number without country code
    return {
      code: phoneCountryCode, // Keep current code
      number: cleanNumber
    };
  };

  // Paste handler for phone input
  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    const { code, number } = detectCountryCode(pastedText);
    
    setPhoneCountryCode(code);
    setPhone(number);
    
    // Show toast notification
    toast.info(`Country code ${code} detected and applied`);
  };

  // Sync form with Redux user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setPhoneCountryCode(user.phoneCountryCode ?? "+1");
      setAddress(user.address ?? "");
    }
  }, [user]);

  // Fetch sessions on mount
  useEffect(() => {
    if (!sessionsFetched.current) {
      sessionsFetched.current = true;
      dispatch(fetchSessions());
    }
  }, [dispatch]);

  const handleSaveProfile = async () => {
    setSaveSuccess(false);
    const result = await dispatch(
      updateProfile({ firstName, lastName, email, phone, phoneCountryCode, address })
    );
    if (updateProfile.fulfilled.match(result)) {
      setSaveSuccess(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      toast.error(result.payload as string || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setPhoneCountryCode(user.phoneCountryCode ?? "+1");
      setAddress(user.address ?? "");
    }
  };

  const getDeviceIcon = (browser: string, os: string) => {
    if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios')) {
      return <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />;
    }
    return <Laptop className="h-4 w-4 shrink-0 text-muted-foreground" />;
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
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
          <div className="@container/main flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl">
              
              {/* Page Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                    Account Settings
                  </h1>
                  <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
                    Manage your account settings and preferences
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className="w-fit px-2 py-0.5 text-xs font-medium sm:px-3 sm:py-1"
                >
                  {user.role}
                </Badge>
              </div>

              <Separator className="my-3 sm:my-4 md:my-6" />

              {/* Profile Overview Card */}
              <ProfileOverview />

              {/* Main Content Tabs - Redesigned with proper active state */}
              <Tabs defaultValue="profile" className="mt-4 sm:mt-6 md:mt-8">
                
                {/* Stylish Tabs Header with black active state */}
                <div className="relative">
                  {/* Background decoration */}
                  <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
                  
                  <TabsList className="relative flex h-auto w-full justify-start gap-1 bg-transparent p-0 sm:gap-2">
                    <TabsTrigger
                      value="profile"
                      className="relative flex items-center gap-2 rounded-none px-4 py-2.5 text-xs font-medium
                               transition-all duration-200
                               data-[state=active]:bg-black data-[state=active]:text-white
                               data-[state=inactive]:text-muted-foreground
                               data-[state=inactive]:hover:text-foreground
                               data-[state=inactive]:hover:bg-muted/50
                               sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm
                               md:gap-3 md:px-6 md:py-3.5 md:text-base"
                    >
                      <User className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                      <span>Profile Information</span>
                      {saveSuccess && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger
                      value="security"
                      className="relative flex items-center gap-2 rounded-none px-4 py-2.5 text-xs font-medium
                               transition-all duration-200
                               data-[state=active]:bg-black data-[state=active]:text-white
                               data-[state=inactive]:text-muted-foreground
                               data-[state=inactive]:hover:text-foreground
                               data-[state=inactive]:hover:bg-muted/50
                               sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm
                               md:gap-3 md:px-6 md:py-3.5 md:text-base"
                    >
                      <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                      <span>Security & Sessions</span>
                      {sessions.filter(s => s.active).length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] sm:ml-2 sm:h-5 sm:px-2 sm:text-xs">
                          {sessions.filter(s => s.active).length} active
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Profile Tab Content */}
                <TabsContent value="profile" className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
                  <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="space-y-1 border-b bg-muted/5 p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                            Personal Information
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Update your personal details and contact information
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                      
                      {/* Status Messages */}
                      {profileUpdateError && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive sm:px-4 sm:py-3 sm:text-sm">
                          <AlertCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                          <span className="flex-1">{profileUpdateError}</span>
                        </div>
                      )}
                      {saveSuccess && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-xs text-green-600 dark:text-green-400 sm:px-4 sm:py-3 sm:text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                          <span className="flex-1">Profile updated successfully!</span>
                        </div>
                      )}

                      {/* Form Fields */}
                      <div className="space-y-5 sm:space-y-6">
                        {/* Name Fields - Responsive Grid */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-xs font-medium sm:text-sm">
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                              <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                                placeholder="Enter first name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-xs font-medium sm:text-sm">
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                              <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-medium sm:text-sm">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>

                        {/* Phone and Address - Responsive Grid */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          {/* Phone Field with Paste Detection - FIXED HEIGHT ISSUE */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-medium sm:text-sm">
                              Phone Number
                            </Label>
                            <div className="flex gap-2">
                              <div className="w-[100px] shrink-0 sm:w-[120px]">
                                <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                                  <SelectTrigger className="h-10 w-full text-xs sm:h-11 sm:text-sm md:h-12 md:text-base">
                                    <Phone className="mr-1 h-3 w-3 shrink-0 text-muted-foreground sm:mr-2 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                    <SelectValue placeholder="Code" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[250px] sm:max-h-[300px]">
                                    {countryCodes.map((country) => (
                                      <SelectItem 
                                        key={`${country.code}-${country.country}`} 
                                        value={country.code}
                                        className="text-xs sm:text-sm"
                                      >
                                        <span className="flex items-center gap-1 sm:gap-2">
                                          <span className="font-mono">{country.code}</span>
                                          <span className="hidden sm:inline text-muted-foreground">
                                            {country.country}
                                          </span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onPaste={handlePhonePaste}
                                className="h-10 flex-1 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 md:h-12 md:text-base"
                                placeholder="Phone number"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 sm:text-xs">
                              Paste any phone number with country code - it will be detected automatically
                            </p>
                          </div>

                          {/* Address Field */}
                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-xs font-medium sm:text-sm">
                              Address
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                              <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                                placeholder="Enter address"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Join Date Field */}
                        <div className="space-y-2">
                          <Label htmlFor="joinDate" className="text-xs font-medium sm:text-sm">
                            Join Date
                          </Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                            <Input
                              id="joinDate"
                              value={user.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }) : ""}
                              disabled
                              className="h-10 pl-8 text-sm bg-muted/50 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-4 sm:pt-6">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={profileUpdating}
                          className="h-10 text-xs sm:h-11 sm:text-sm w-full sm:w-24 lg:w-28"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={profileUpdating}
                          className="h-10 text-xs sm:h-11 sm:text-sm w-full sm:w-32 lg:w-36 gap-2"
                        >
                          {profileUpdating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab Content */}
                <TabsContent value="security" className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
                  
                  {/* Change Password Card */}
                  <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="space-y-1 border-b bg-muted/5 p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Lock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                            Change Password
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Update your password to keep your account secure
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                      <div className="space-y-5 sm:space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className="text-xs font-medium sm:text-sm">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                            <Input
                              id="current-password"
                              type="password"
                              className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                              placeholder="Enter current password"
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-xs font-medium sm:text-sm">
                              New Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                              <Input
                                id="new-password"
                                type="password"
                                className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                                placeholder="Enter new password"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-xs font-medium sm:text-sm">
                              Confirm New Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                              <Input
                                id="confirm-password"
                                type="password"
                                className="h-10 pl-8 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-11 sm:pl-9 md:h-12 md:text-base"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button className="h-10 w-full text-xs sm:h-11 sm:w-auto sm:text-sm px-6 gap-2">
                          <Key className="h-3.5 w-3.5" />
                          Update Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Sessions Card */}
                  <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="space-y-1 border-b bg-muted/5 p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Monitor className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold sm:text-lg md:text-xl">
                            Active Sessions
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Manage your active login sessions
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      {sessionsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground sm:h-8 sm:w-8" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                          <Monitor className="h-8 w-8 text-muted-foreground/50 sm:h-10 sm:w-10" />
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            No active sessions found.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                          {sessions.map((session) => (
                            <div
                              key={session._id}
                              className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 sm:p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                  <div className="rounded-full bg-muted p-2">
                                    {getDeviceIcon(session.browser, session.os)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-sm font-medium sm:text-base">
                                        {session.browser !== "Unknown"
                                          ? `${session.browser}`
                                          : session.device}
                                      </p>
                                      {session.sessionId === currentSessionId ? (
                                        <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0.5 sm:text-xs">
                                          Current
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="shrink-0 text-[10px] px-1.5 py-0.5 sm:text-xs"
                                        >
                                          {session.active ? "Active" : "Inactive"}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {session.os} · {session.ip === "::1" ? "localhost" : session.ip}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 ml-11 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 sm:text-sm">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{session.location}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {new Date(session.loginDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </span>
                                </span>
                              </div>
                              
                              {session.sessionId !== currentSessionId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-2 h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}