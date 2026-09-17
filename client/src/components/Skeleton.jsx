// Reusable skeleton loading components
// Used while data is being fetched

// Single skeleton line
export const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
    <div className={`${width} ${height} bg-gray-200 rounded-lg animate-pulse`} />
);

// Skeleton for donor card
export const DonorCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonLine width="w-1/2" height="h-5" />
                <SkeletonLine width="w-1/3" height="h-4" />
                <SkeletonLine width="w-1/4" height="h-3" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <SkeletonLine width="w-24" height="h-3" />
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
    </div>
);

// Skeleton for notification
export const NotificationSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <SkeletonLine width="w-3/4" height="h-4" />
            <SkeletonLine width="w-full" height="h-3" />
            <SkeletonLine width="w-1/4" height="h-3" />
        </div>
    </div>
);

// Skeleton for request card
export const RequestCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-gray-200 p-5">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="space-y-2">
                    <SkeletonLine width="w-32" height="h-4" />
                    <SkeletonLine width="w-24" height="h-3" />
                </div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-100">
            <SkeletonLine width="w-24" height="h-3" />
            <div className="w-24 h-8 bg-gray-200 rounded-xl animate-pulse" />
        </div>
    </div>
);

// Dashboard stats skeleton
export const StatsSkeleton = () => (
    <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 text-center">
                <div className="w-16 h-10 bg-gray-200 rounded-xl animate-pulse mx-auto mb-2" />
                <SkeletonLine width="w-16" height="h-3" />
            </div>
        ))}
    </div>
);