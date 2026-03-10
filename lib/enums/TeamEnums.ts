// Team member position enumeration
export enum TeamPosition {
  FOUNDER = 'founder',
  CO_FOUNDER = 'co-founder',
  HEAD_OF_OPERATIONS = 'head-of-operations',
  SENIOR_CAR_EXPERT = 'senior-car-expert',
  CUSTOMER_RELATIONS = 'customer-relations',
  FI_SPECIALIST = 'fi-specialist',
  MARKETING_HEAD = 'marketing-head',
  SALES_MANAGER = 'sales-manager',
  TECHNICAL_DIRECTOR = 'technical-director',
  BUSINESS_DEVELOPMENT = 'business-development',
  HR_MANAGER = 'hr-manager',
  FINANCE_MANAGER = 'finance-manager',
}

// Team member tags enumeration
export enum TeamMemberTag {
  CAR_VALUATION = 'car-valuation',
  CUSTOMER_TRUST = 'customer-trust',
  QUALITY_CHECK = 'quality-check',
  LOGISTICS = 'logistics',
  TECHNICAL = 'technical',
  CERTIFICATION = 'certification',
  SUPPORT = 'support',
  TEST_DRIVE = 'test-drive',
  LOANS = 'loans',
  INSURANCE = 'insurance',
  DIGITAL = 'digital',
  SALES = 'sales',
  MARKETING = 'marketing',
  FINANCE = 'finance',
  OPERATIONS = 'operations',
}

// Position display labels
export const POSITION_LABELS: Record<string, string> = {
  [TeamPosition.FOUNDER]: 'Founder',
  [TeamPosition.CO_FOUNDER]: 'Co-Founder',
  [TeamPosition.HEAD_OF_OPERATIONS]: 'Head of Operations',
  [TeamPosition.SENIOR_CAR_EXPERT]: 'Senior Car Expert',
  [TeamPosition.CUSTOMER_RELATIONS]: 'Customer Relations',
  [TeamPosition.FI_SPECIALIST]: 'F&I Specialist',
  [TeamPosition.MARKETING_HEAD]: 'Marketing Head',
  [TeamPosition.SALES_MANAGER]: 'Sales Manager',
  [TeamPosition.TECHNICAL_DIRECTOR]: 'Technical Director',
  [TeamPosition.BUSINESS_DEVELOPMENT]: 'Business Development',
  [TeamPosition.HR_MANAGER]: 'HR Manager',
  [TeamPosition.FINANCE_MANAGER]: 'Finance Manager',
}

// Tag display labels
export const TAG_LABELS: Record<string, string> = {
  [TeamMemberTag.CAR_VALUATION]: 'Car Valuation',
  [TeamMemberTag.CUSTOMER_TRUST]: 'Customer Trust',
  [TeamMemberTag.QUALITY_CHECK]: 'Quality Check',
  [TeamMemberTag.LOGISTICS]: 'Logistics',
  [TeamMemberTag.TECHNICAL]: 'Technical',
  [TeamMemberTag.CERTIFICATION]: 'Certification',
  [TeamMemberTag.SUPPORT]: 'Support',
  [TeamMemberTag.TEST_DRIVE]: 'Test Drive',
  [TeamMemberTag.LOANS]: 'Loans',
  [TeamMemberTag.INSURANCE]: 'Insurance',
  [TeamMemberTag.DIGITAL]: 'Digital',
  [TeamMemberTag.SALES]: 'Sales',
  [TeamMemberTag.MARKETING]: 'Marketing',
  [TeamMemberTag.FINANCE]: 'Finance',
  [TeamMemberTag.OPERATIONS]: 'Operations',
}

// Department grouping for positions
export const POSITION_DEPARTMENTS: Record<string, string[]> = {
  'Leadership': [TeamPosition.FOUNDER, TeamPosition.CO_FOUNDER],
  'Operations': [TeamPosition.HEAD_OF_OPERATIONS, TeamPosition.TECHNICAL_DIRECTOR],
  'Sales & Business': [TeamPosition.SENIOR_CAR_EXPERT, TeamPosition.SALES_MANAGER, TeamPosition.BUSINESS_DEVELOPMENT],
  'Customer & Finance': [TeamPosition.CUSTOMER_RELATIONS, TeamPosition.FI_SPECIALIST, TeamPosition.FINANCE_MANAGER],
  'Marketing & HR': [TeamPosition.MARKETING_HEAD, TeamPosition.HR_MANAGER],
}
