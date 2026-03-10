import ProtectedLayout from "@/components/protected-layout"

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
