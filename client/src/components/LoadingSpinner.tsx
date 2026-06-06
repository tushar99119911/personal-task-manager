export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Loading tasks">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
    </div>
  );
}
