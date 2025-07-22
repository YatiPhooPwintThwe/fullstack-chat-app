import { Users } from "lucide-react";
import { useState } from "react";

const SidebarSkeleton = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const skeletonItems = Array(8).fill(null);

  return (
    <aside
      className={`h-full border-r border-base-300 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header with toggle (optional) */}
      <div className="border-b border-base-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
        </div>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="btn btn-sm btn-ghost"
        >
          {/* Optional collapse toggle */}
          <div className="skeleton w-4 h-4 rounded" />
        </button>
      </div>

      {/* Skeleton User Items */}
      <div className="overflow-y-auto flex-1 p-2">
        {skeletonItems.map((_, i) => (
          <div
            key={i}
            className={`w-full p-3 flex items-center gap-3 rounded-lg`}
          >
            <div className="skeleton w-10 h-10 rounded-full" />
            {!isCollapsed && (
              <div className="flex flex-col gap-2 w-full">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
