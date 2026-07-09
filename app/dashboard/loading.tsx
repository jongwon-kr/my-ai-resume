import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-72" />
      <Skeleton className="mb-4 h-10 w-full max-w-md" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
