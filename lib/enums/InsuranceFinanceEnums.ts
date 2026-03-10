// ─── Coverage Types ──────────────────────────────────────
export enum CoverageType {
  COMPREHENSIVE = "comprehensive",
  LIABILITY = "liability",
  COLLISION = "collision",
  PERSONAL_INJURY = "personal-injury",
  UNINSURED_MOTORIST = "uninsured-motorist",
  ROADSIDE_ASSISTANCE = "roadside-assistance",
}

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  [CoverageType.COMPREHENSIVE]: "Comprehensive",
  [CoverageType.LIABILITY]: "Liability",
  [CoverageType.COLLISION]: "Collision",
  [CoverageType.PERSONAL_INJURY]: "Personal Injury",
  [CoverageType.UNINSURED_MOTORIST]: "Uninsured Motorist",
  [CoverageType.ROADSIDE_ASSISTANCE]: "Roadside Assistance",
}

// ─── Insurance Types ─────────────────────────────────────
export enum InsuranceProductType {
  COMPREHENSIVE = "comprehensive",
  THIRD_PARTY = "third-party",
  STANDALONE_OD = "standalone-od",
}

export const INSURANCE_PRODUCT_TYPE_LABELS: Record<InsuranceProductType, string> = {
  [InsuranceProductType.COMPREHENSIVE]: "Comprehensive",
  [InsuranceProductType.THIRD_PARTY]: "Third Party",
  [InsuranceProductType.STANDALONE_OD]: "Standalone OD",
}

// ─── Finance Types ───────────────────────────────────────
export enum FinanceType {
  CAR_LOAN = "car-loan",
  USED_CAR_LOAN = "used-car-loan",
  LEASE = "lease",
  REFINANCE = "refinance",
}

export const FINANCE_TYPE_LABELS: Record<FinanceType, string> = {
  [FinanceType.CAR_LOAN]: "Car Loan",
  [FinanceType.USED_CAR_LOAN]: "Used Car Loan",
  [FinanceType.LEASE]: "Lease",
  [FinanceType.REFINANCE]: "Refinance",
}
