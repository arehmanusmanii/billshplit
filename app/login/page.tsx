import { LoginCard } from '@/components/ui/LoginCard'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  return <LoginCard message={message} />
}
