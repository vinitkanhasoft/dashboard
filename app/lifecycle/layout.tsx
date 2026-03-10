import ProtectedLayout from "@/components/protected-layout"

export default function LifecycleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
