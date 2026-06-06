interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
