"use client";

import { Plus, Trash2, Folder, Film } from "lucide-react";
import { useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { useVideoTitle } from "../useVideoTitle";
import type { VideoGroup } from "../groupByVideo";

function VideoCard({
  video,
  onOpen,
  onDelete,
}: {
  video: VideoGroup;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const dict = useDict();
  const title = useVideoTitle(video.videoId) || video.title || video.videoId;

  return (
    <div className="card card-interactive p-4 flex flex-col">
      <button onClick={onOpen} className="text-left flex-1">
        <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            <Film className="w-3 h-3" />
            {fmt(dict.shadowing.videoCount, { n: video.segments.length })}
          </span>
        </div>
        <p className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{title}</p>
        {video.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <Folder className="w-3 h-3" />
            {video.categories.join("・")}
          </div>
        )}
      </button>
      <div className="flex justify-end mt-2">
        <button
          onClick={onDelete}
          aria-label={dict.common.deleteAction}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function VideoList({
  videos,
  onCreate,
  onOpenVideo,
  onDeleteVideo,
}: {
  videos: VideoGroup[];
  onCreate: () => void;
  onOpenVideo: (videoId: string) => void;
  onDeleteVideo: (videoId: string) => void;
}) {
  const dict = useDict();
  return (
    <div className="space-y-4">
      <button onClick={onCreate} className="btn-primary">
        <Plus className="w-4 h-4" />
        {dict.shadowing.newVideo}
      </button>

      {videos.length === 0 ? (
        <div className="card p-10 text-center">
          <Film className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{dict.shadowing.noClips}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <VideoCard
              key={v.videoId}
              video={v}
              onOpen={() => onOpenVideo(v.videoId)}
              onDelete={() => onDeleteVideo(v.videoId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
