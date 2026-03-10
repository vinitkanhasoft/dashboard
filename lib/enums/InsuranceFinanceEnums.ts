// ─── Car Plate Interface ─────────────────────────────────────
/**
 * Car plate number information
 */
export interface ICarPlateInfo {
  plateNumber: string;
  state: string;
  district: string;
  rtoCode: string;
  vehicleType: string;
  registrationDate?: Date;
  ownerName?: string;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Coverage Types ──────────────────────────────────────
/**
 * Insurance coverage types enumeration
 */
export enum CoverageType {
  LIABILITY = 'liability',
  COLLISION = 'collision',
  COMPREHENSIVE = 'comprehensive',
  PERSONAL_INJURY = 'personal-injury',
  PROPERTY_DAMAGE = 'property-damage',
  UNINSURED_MOTORIST = 'uninsured-motorist',
  MEDICAL_PAYMENTS = 'medical-payments',
  GAP_COVERAGE = 'gap-coverage',
  ROADSIDE_ASSISTANCE = 'roadside-assistance',
  RENTAL_REIMBURSEMENT = 'rental-reimbursement',
  CUSTOM_EQUIPMENT = 'custom-equipment',
  NEW_CAR_REPLACEMENT = 'new-car-replacement'
}

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  [CoverageType.LIABILITY]: 'Liability Coverage',
  [CoverageType.COLLISION]: 'Collision Coverage',
  [CoverageType.COMPREHENSIVE]: 'Comprehensive Coverage',
  [CoverageType.PERSONAL_INJURY]: 'Personal Injury Protection',
  [CoverageType.PROPERTY_DAMAGE]: 'Property Damage Liability',
  [CoverageType.UNINSURED_MOTORIST]: 'Uninsured Motorist Coverage',
  [CoverageType.MEDICAL_PAYMENTS]: 'Medical Payments Coverage',
  [CoverageType.GAP_COVERAGE]: 'Gap Coverage',
  [CoverageType.ROADSIDE_ASSISTANCE]: 'Roadside Assistance',
  [CoverageType.RENTAL_REIMBURSEMENT]: 'Rental Reimbursement',
  [CoverageType.CUSTOM_EQUIPMENT]: 'Custom Equipment Coverage',
  [CoverageType.NEW_CAR_REPLACEMENT]: 'New Car Replacement'
}

// ─── Insurance Types ─────────────────────────────────────
/**
 * Insurance type enumeration
 */
export enum InsuranceProductType {
  THIRD_PARTY = 'third-party',
  COMPREHENSIVE = 'comprehensive',
  COLLISION_ONLY = 'collision-only',
  LIABILITY_ONLY = 'liability-only',
  FULL_COVERAGE = 'full-coverage'
}

export const INSURANCE_PRODUCT_TYPE_LABELS: Record<InsuranceProductType, string> = {
  [InsuranceProductType.THIRD_PARTY]: 'Third Party Insurance',
  [InsuranceProductType.COMPREHENSIVE]: 'Comprehensive Insurance',
  [InsuranceProductType.COLLISION_ONLY]: 'Collision Only',
  [InsuranceProductType.LIABILITY_ONLY]: 'Liability Only',
  [InsuranceProductType.FULL_COVERAGE]: 'Full Coverage'
}

// ─── Finance Types ───────────────────────────────────────
/**
 * Finance type enumeration
 */
export enum FinanceType {
  CAR_LOAN = 'car-loan',
  PERSONAL_LOAN = 'personal-loan',
  BUSINESS_LOAN = 'business-loan',
  LEASE_FINANCING = 'lease-financing',
  REFINANCING = 'refinancing',
  BALLOON_FINANCING = 'balloon-financing',
  NO_COST_EMI = 'no-cost-emi',
  ZERO_DOWN_PAYMENT = 'zero-down-payment'
}

export const FINANCE_TYPE_LABELS: Record<FinanceType, string> = {
  [FinanceType.CAR_LOAN]: 'Car Loan',
  [FinanceType.PERSONAL_LOAN]: 'Personal Loan',
  [FinanceType.BUSINESS_LOAN]: 'Business Loan',
  [FinanceType.LEASE_FINANCING]: 'Lease Financing',
  [FinanceType.REFINANCING]: 'Refinancing',
  [FinanceType.BALLOON_FINANCING]: 'Balloon Financing',
  [FinanceType.NO_COST_EMI]: 'No Cost EMI',
  [FinanceType.ZERO_DOWN_PAYMENT]: 'Zero Down Payment'
}

// ─── Insurance Company Status ─────────────────────────────
/**
 * Insurance company status enumeration
 */
export enum InsuranceCompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PARTNER = 'partner',
  PREMIUM = 'premium'
}

export const INSURANCE_COMPANY_STATUS_LABELS: Record<InsuranceCompanyStatus, string> = {
  [InsuranceCompanyStatus.ACTIVE]: 'Active',
  [InsuranceCompanyStatus.INACTIVE]: 'Inactive',
  [InsuranceCompanyStatus.PARTNER]: 'Partner',
  [InsuranceCompanyStatus.PREMIUM]: 'Premium'
}

// ─── Finance Status ───────────────────────────────────────
/**
 * Finance status enumeration
 */
export enum FinanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  PRE_APPROVED = 'pre-approved'
}

export const FINANCE_STATUS_LABELS: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: 'Pending',
  [FinanceStatus.APPROVED]: 'Approved',
  [FinanceStatus.REJECTED]: 'Rejected',
  [FinanceStatus.ACTIVE]: 'Active',
  [FinanceStatus.COMPLETED]: 'Completed',
  [FinanceStatus.DEFAULTED]: 'Defaulted',
  [FinanceStatus.PRE_APPROVED]: 'Pre-Approved'
}
