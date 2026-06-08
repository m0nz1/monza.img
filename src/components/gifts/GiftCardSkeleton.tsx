export function GiftCardSkeleton() {
  return (
    <div className="border-3 border-brand-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-brutal-lg flex flex-col">
      <div className="skeleton h-40 border-b-3 border-brand-black dark:border-zinc-700" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-5 w-3/4 rounded-none" />
        <div className="skeleton h-4 w-full rounded-none" />
        <div className="skeleton h-4 w-2/3 rounded-none" />
        <div className="skeleton h-2 w-full rounded-none mt-2" />
        <div className="skeleton h-11 w-full rounded-none mt-1" />
      </div>
    </div>
  );
}
