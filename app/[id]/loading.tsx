import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfileLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b px-4 py-3">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="min-h-[520px] w-full rounded-xl" />
      </div>
    </div>
  );
}
