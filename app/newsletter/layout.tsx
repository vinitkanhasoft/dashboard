import ProtectedLayout from "@/components/protected-layout"

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
