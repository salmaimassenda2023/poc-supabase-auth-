// app/admin/actions.js
'use server'

import { adminAuthClient } from './supabase_admin'
import { revalidatePath } from 'next/cache'

// Get user role by ID
export async function getUserRole(userId) {
    try {
        const { data: user, error } = await adminAuthClient.getUserById(userId)

        if (error) {
            throw new Error(`Failed to get user: ${error.message}`)
        }

        return user.user_metadata?.role || 'user'
    } catch (error) {
        console.error('Error getting user role:', error)
        throw error
    }
}

// Delete user by ID
export async function deleteUser(userId) {
    try {
        const { data, error } = await adminAuthClient.deleteUser(userId)

        if (error) {
            throw new Error(`Failed to delete user: ${error.message}`)
        }

        // Revalidate the page to refresh the user list
        revalidatePath('/admin/dashboard')

        return { success: true, message: 'User deleted successfully' }
    } catch (error) {
        console.error('Error deleting user:', error)
        throw error
    }
}

// Update user role
export async function updateUserRole(userId, newRole) {
    try {
        const { data: user, error } = await adminAuthClient.updateUserById(userId, {
            user_metadata: {
                role: newRole,
                updated_at: new Date().toISOString()
            }
        })

        if (error) {
            throw new Error(`Failed to update user role: ${error.message}`)
        }

        // Revalidate the page to refresh the user list
        revalidatePath('/admin/dashboard')

        return { success: true, user, message: 'User role updated successfully' }
    } catch (error) {
        console.error('Error updating user role:', error)
        throw error
    }
}

// Get all users with their roles
export async function getAllUsersWithRoles() {
    try {
        const { data, error } = await adminAuthClient.listUsers()

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`)
        }

        return data.users.map(user => ({
            ...user,
            role: user.user_metadata?.role || 'user'
        }))
    } catch (error) {
        console.error('Error fetching users:', error)
        throw error
    }
}