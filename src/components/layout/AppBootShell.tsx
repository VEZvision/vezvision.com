/**
 * Minimal placeholder while maintenance access is verified (maintenance ON only).
 * Lighter than full LoadingScreen — avoids blocking first paint on normal visits.
 */
export default function AppBootShell() {
  return (
    <div
      className="min-h-screen bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    </div>
  )
}
