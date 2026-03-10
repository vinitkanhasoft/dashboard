import ProtectedLayout from "@/components/protected-layout"

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
