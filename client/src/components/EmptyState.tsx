interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
        📝
      </div>
      <h3 className="text-lg font-semibold text-slate-800">
        {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? 'Try changing your filter or search query.'
          : 'Add your first task using the form above to get started.'}
      </p>
    </div>
  );
}
