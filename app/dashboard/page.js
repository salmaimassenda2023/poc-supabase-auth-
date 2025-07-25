// app/admin/dashboard/page.js
import { getAllUsersWithRoles } from '../../supabase/users'
import { createClient } from '../../supabase/server'
import UserManagementClient from './UserManagementClient'

export default async function Dashboard() {
    // Check if current user is admin
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    try {
        const users = await getAllUsersWithRoles()

        return (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-sm text-gray-600">
                        Logged in as: {authData.user.email} (Admin)
                    </p>
                </div>
                <UserManagementClient users={users} currentUserId={authData.user.id} />
            </div>
        )
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-xl font-bold mb-4">Error</h1>
                <p className="text-red-600">Error fetching users: {error.message}</p>
            </div>
        )
    }
}