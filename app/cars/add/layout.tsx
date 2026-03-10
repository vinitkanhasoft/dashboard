import ProtectedLayout from "@/components/protected-layout"

export default function AddCarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
