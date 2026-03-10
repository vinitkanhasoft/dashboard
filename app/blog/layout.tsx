import ProtectedLayout from "@/components/protected-layout"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
