import ProtectedLayout from "@/components/protected-layout"

export default function BannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
