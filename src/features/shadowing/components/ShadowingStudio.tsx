"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useDict } from "@/i18n/I18nProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import TargetList from "./TargetList";
import SetupPanel from "./SetupPanel";
import ClipWorkspace from "./ClipWorkspace";
import type { ShadowingTarget } from "../domain/ShadowingTarget";

type View = "list" | "setup" | "clip";

export default function ShadowingStudio() {
  const dict = useDict();
  const [view, setView] = useState<View>("list");
  const [targets, setTargets] = useState<ShadowingTarget[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<ShadowingTarget | null>(null);

  const loadTargets = useCallback(async () => {
    const res = await apiFetch("/shadowing");
    if (res.ok) setTargets(await res.json());
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  // Deep link ?target=<id> opens that target's clip view.
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("target");
    if (id) setPendingTarget(id);
  }, []);
  useEffect(() => {
    if (pendingTarget && targets.length > 0) {
      const t = targets.find((x) => x.id === pendingTarget);
      if (t) {
        setActiveTarget(t);
        setView("clip");
      }
      setPendingTarget(null);
    }
  }, [pendingTarget, targets]);

  async function confirmDelete() {
    if (!deleteId) return;
    await apiFetch(`/shadowing/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    loadTargets();
  }

  return (
    <div>
      {view === "list" && (
        <TargetList
          targets={targets}
          onCreate={() => setView("setup")}
          onOpen={(t) => {
            setActiveTarget(t);
            setView("clip");
          }}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {view === "setup" && (
        <SetupPanel
          existingCategories={[...new Set(targets.map((t) => t.category).filter(Boolean) as string[])]}
          onCancel={() => setView("list")}
          onSaved={async () => {
            await loadTargets();
            setView("list");
          }}
        />
      )}

      {view === "clip" && activeTarget && (
        <ClipWorkspace
          target={activeTarget}
          onBack={() => {
            setActiveTarget(null);
            setView("list");
          }}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={dict.shadowing.deleteClipTitle}
        message={dict.shadowing.deleteClipMsg}
        confirmLabel={dict.common.deleteAction}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
