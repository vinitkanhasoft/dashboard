import ProtectedLayout from "@/components/protected-layout"

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
