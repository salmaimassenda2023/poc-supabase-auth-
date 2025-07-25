// app/drivers/DriversList.js (Client Component)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from "../../supabase/actions";

export default function DriversList({ user, initialDrivers }) {
    const router = useRouter();
    const [drivers] = useState(initialDrivers);

    function goDashboard() {
        router.push("/dashboard");
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Drivers List</h1>
                <div className="flex gap-2">
                    <button
                        onClick={goDashboard}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">
                    Logged in as: {user.email} | Role: {user.user_metadata?.role || 'user'}
                </p>
            </div>

            {drivers.length === 0 ? (
                <p className="text-gray-500">No drivers found in the system.</p>
            ) : (
                <div className="grid gap-4">
                    {drivers.map(driver => (
                        <div key={driver.id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg">{driver.name}</h3>
                            <p className="text-gray-600">Phone: {driver.tele}</p>
                            <p className="text-gray-600">Age: {driver.age}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}