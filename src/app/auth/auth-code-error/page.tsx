export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
            <p className="mt-2 text-gray-600">There was an issue authenticating your account.</p>
        </div>
    )
}
