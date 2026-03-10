// ─── Vehicle Types ───────────────────────────────────────
export enum VehicleType {
  CAR = "car",
  SUV = "suv",
  TRUCK = "truck",
  VAN = "van",
  BUS = "bus",
  MOTORCYCLE = "motorcycle",
  OTHER = "other",
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VehicleType.CAR]: "Car",
  [VehicleType.SUV]: "SUV",
  [VehicleType.TRUCK]: "Truck",
  [VehicleType.VAN]: "Van",
  [VehicleType.BUS]: "Bus",
  [VehicleType.MOTORCYCLE]: "Motorcycle",
  [VehicleType.OTHER]: "Other",
}

// ─── Indian States for RTO ───────────────────────────────
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
] as const

// ─── RTO Code Prefixes ──────────────────────────────────
export const RTO_STATE_PREFIXES: Record<string, string> = {
  AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar",
  CG: "Chhattisgarh", GA: "Goa", GJ: "Gujarat", HR: "Haryana",
  HP: "Himachal Pradesh", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala",
  MP: "Madhya Pradesh", MH: "Maharashtra", MN: "Manipur", ML: "Meghalaya",
  MZ: "Mizoram", NL: "Nagaland", OD: "Odisha", PB: "Punjab",
  RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TS: "Telangana",
  TR: "Tripura", UP: "Uttar Pradesh", UK: "Uttarakhand", WB: "West Bengal",
  DL: "Delhi", CH: "Chandigarh", PY: "Puducherry",
}
