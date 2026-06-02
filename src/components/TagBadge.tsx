"use client";

interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export default function TagBadge({ tag, onClick, removable, onRemove }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 ${
        onClick ? "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" : ""
      }`}
      onClick={onClick}
    >
      {tag}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:text-red-500"
        >
          ×
        </button>
      )}
    </span>
  );
}
