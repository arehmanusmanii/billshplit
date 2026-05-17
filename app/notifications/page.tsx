import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNotifications, getActiveReminders, markAllAsRead } from "@/lib/actions/notifications"
import Link from "next/link"
import { NotificationsView } from "@/components/ui/NotificationsView"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [notifications, reminders] = await Promise.all([
    getNotifications(user.id),
    getActiveReminders(user.id),
  ])

  return (
    <NotificationsView
      userId={user.id}
      notifications={notifications}
      reminders={reminders}
    />
  )
}
