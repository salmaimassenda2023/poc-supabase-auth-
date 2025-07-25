// app/admin/dashboard/UserManagementClient.js
'use client'

import { useState } from 'react'
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa"
import { deleteUser, updateUserRole } from '../../supabase/users'
import { formatDate } from '../../utils/dateUtils'

const ROLES = ['user', 'admin', 'moderator']

export default function UserManagementClient({ users: initialUsers, currentUserId }) {
    const [users, setUsers] = useState(initialUsers)
    const [editingUser, setEditingUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleDeleteUser = async (userId) => {
        if (userId === currentUserId) {
            setMessage('You cannot delete your own account')
            return
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        setLoading(true)
        try {
            await deleteUser(userId)
            setUsers(users.filter(user => user.id !== userId))
            setMessage('User deleted successfully')
        } catch (error) {
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleStartEdit = (user) => {
        setEditingUser({ ...user })
    }

    const handleCancelEdit = () => {
        setEditingUser(null)
    }

    const handleSaveEdit = async () => {
        if (!editingUser) return

        setLoading(true)
        try {
            await updateUserRole(editingUser.id, editingUser.role)
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, role: editingUser.role, user_metadata: { ...user.user_metadata, role: editingUser.role } }
                    : user
            ))
            setMessage('User role updated successfully')
            setEditingUser(null)
        } catch (error) {
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (newRole) => {
        setEditingUser({ ...editingUser, role: newRole })
    }

    return (
        <div>
            {message && (
                <div className={`mb-4 p-3 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                    <button
                        onClick={() => setMessage('')}
                        className="float-right font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">Email</th>
                        <th className="border px-4 py-2 text-left">Role</th>
                        <th className="border px-4 py-2 text-left">Created At</th>
                        <th className="border px-4 py-2 text-left">Last Sign In</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">
                                {user.email}
                                {user.id === currentUserId && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        You
                                    </span>
                                )}
                            </td>
                            <td className="border px-4 py-2">
                                {editingUser?.id === user.id ? (
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        {ROLES.map(role => (
                                            <option key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                                    </span>
                                )}
                            </td>
                            <td className="border px-4 py-2">
                                {formatDate(user.created_at)}
                            </td>
                            <td className="border px-4 py-2">
                                {formatDate(user.last_sign_in_at)}
                            </td>
                            <td className="border px-4 py-2">
                                <div className="flex space-x-2">
                                    {editingUser?.id === user.id ? (
                                        <>
                                            <button
                                                title="Save"
                                                className="text-green-600 hover:text-green-800"
                                                onClick={handleSaveEdit}
                                                disabled={loading}
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                title="Cancel"
                                                className="text-gray-600 hover:text-gray-800"
                                                onClick={handleCancelEdit}
                                                disabled={loading}
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                title="Edit Role"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => handleStartEdit(user)}
                                                disabled={loading}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                title="Delete User"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={loading || user.id === currentUserId}
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <p className="text-gray-500 text-center py-8">No users found.</p>
            )}
        </div>
    )
}