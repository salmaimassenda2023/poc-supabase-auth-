export default function Unauthorized() {
    return (
        <div className="p-8 max-w-md mx-auto mt-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h1 className="text-xl font-bold text-red-800 mb-2">Access Denied</h1>
                <p className="text-red-700 mb-4">
                    You don't have permission to access this page.
                </p>
                <a href="/" className="text-blue-600 hover:underline">
                    Go to Home
                </a>
            </div>
        </div>
    )
}