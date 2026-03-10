import ProtectedLayout from "@/components/protected-layout"

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
