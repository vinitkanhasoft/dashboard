import ProtectedLayout from "@/components/protected-layout"

export default function CarPlatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
