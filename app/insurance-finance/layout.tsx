import ProtectedLayout from "@/components/protected-layout"

export default function InsuranceFinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
