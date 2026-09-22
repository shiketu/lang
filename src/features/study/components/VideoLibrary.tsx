"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Film, Folder, Save, X, Scissors } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { useWs, useDict } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n";
import { parseYouTube } from "@/lib/youtube";
import type { Video } from "../domain/Video";
import type { Clip } from "../domain/Clip";

export default function VideoLibrary() {
  const ws = useWs();
  const dict = useDict();

  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [vRes, cRes] = await Promise.all([apiFetch("/videos"), apiFetch("/clips")]);
    if (vRes.ok) setVideos(await vRes.json());
    if (cRes.ok) setClips(await cRes.json());
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clipCount = (videoRowId: string) =>
    clips.filter((c) => c.videoRef === videoRowId).length;

  // Pasting a URL resolves the real YouTube title so you don't have to type it.
  async function handleLoadUrl() {
    const parsed = parseYouTube(url);
    if (!parsed) {
      setError(dict.study.invalidUrl);
      return;
    }
    setError("");
    setPreviewId(parsed.videoId);
    try {
      const res = await apiFetch(`/youtube/oembed?videoId=${parsed.videoId}`);
      if (res.ok) {
        const { title: fetched } = await res.json();
        if (fetched) setTitle(fetched);
      }
    } catch {
      /* title stays editable; not worth failing the flow */
    }
  }

  async function save() {
    setSaving(true);
    const res = await apiFetch("/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceUrl: url, title, category }),
    });
    setSaving(false);
    if (res.ok) {
      setAdding(false);
      setUrl("");
      setTitle("");
      setCategory("");
      setPreviewId(null);
      load();
    } else {
      setError(dict.study.saveFailed);
    }
  }

  return (
    <div className="space-y-4">
      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {dict.study.addVideo}
        </button>
      )}

      {adding && (
        <div className="card p-5 space-y-4 max-w-3xl">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={dict.study.urlPlaceholder}
              className="field flex-1"
            />
            <button onClick={handleLoadUrl} className="btn-primary shrink-0">
              {dict.study.load}
            </button>
          </div>

          {previewId && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                alt={title}
                className="w-56 aspect-video rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={dict.study.titlePlaceholder}
                className="field"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={dict.study.categoryPlaceholder}
                className="field"
                list="study-cats"
              />
              <datalist id="study-cats">
                {[...new Set(videos.map((v) => v.category).filter(Boolean) as string[])].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}

          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !previewId} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? dict.study.saving : dict.study.saveVideo}
            </button>
            <button onClick={() => setAdding(false)} className="btn-ghost">
              <X className="w-4 h-4" />
              {dict.study.cancel}
            </button>
          </div>
        </div>
      )}

      {loaded && videos.length === 0 && !adding ? (
        <div className="card p-10 text-center">
          <Film className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{dict.study.noVideos}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <Link
              key={v.id}
              href={`/${ws}/study/${v.id}`}
              className="card card-interactive p-4 block"
            >
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  <Scissors className="w-3 h-3" />
                  {fmt(dict.study.clipCount, { n: clipCount(v.id) })}
                </span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                {v.title || dict.study.untitledVideo}
              </p>
              {v.category && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Folder className="w-3 h-3" />
                  {v.category}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
