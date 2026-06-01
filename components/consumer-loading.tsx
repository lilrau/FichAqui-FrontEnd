export function ConsumerLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 animate-pulse">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4">
        <div className="h-6 w-32 rounded-lg bg-muted" />
      </div>
      <div className="space-y-4 px-4 py-6">
        <div className="h-36 rounded-2xl bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
        <div className="space-y-3">
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
