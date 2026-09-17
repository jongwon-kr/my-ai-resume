import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfileLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-24 shrink-0 rounded-2xl sm:size-28" />
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full max-w-2xl" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-36 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:py-14">
        <div className="space-y-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <Skeleton className="hidden h-72 w-full rounded-2xl lg:block" />
      </div>
    </div>
  );
}
