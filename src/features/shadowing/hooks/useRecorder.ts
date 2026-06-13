"use client";

import { useState, useRef, useCallback } from "react";

/**
 * Webcam + MediaRecorder state shared by the shadowing practice panels.
 *
 * `stopCameraOnStop`: ShadowPanel stops the camera after each take (whole-clip
 * flow); RepeatPanel keeps it running so consecutive sentences don't require
 * re-granting the camera.
 */
export function useRecorder(opts?: { stopCameraOnStop?: boolean }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [denied, setDenied] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopCameraOnStop = opts?.stopCameraOnStop ?? false;

  const startCamera = useCallback(async (): Promise<boolean> => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = s;
      setStream(s);
      setDenied(false);
      return true;
    } catch {
      setDenied(true);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const startRecording = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(s, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: "video/webm" }));
      setIsRecording(false);
      if (stopCameraOnStop) stopCamera();
    };
    mrRef.current = mr;
    mr.start();
    setIsRecording(true);
  }, [stopCameraOnStop, stopCamera]);

  const stopRecording = useCallback(() => {
    mrRef.current?.stop();
  }, []);

  const discardBlob = useCallback(() => setBlob(null), []);

  return {
    stream,
    blob,
    isRecording,
    denied,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    discardBlob,
  };
}
