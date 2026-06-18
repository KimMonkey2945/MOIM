"use client";

import { useCallback, useState } from "react";

import { createClient } from "@/lib/supabase/client";

// Storage 버킷 정책과 일치시키는 허용 MIME 타입 목록.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type UploadResult = { url: string } | { error: string };

type UseImageUploadOptions = {
  /** 업로드 대상 버킷 (예: "avatars", "event-covers") */
  bucket: string;
  /** 파일 경로 첫 세그먼트로 쓰일 사용자 ID (RLS 소유권 판단 기준) */
  userId: string;
  /** 허용 최대 용량(bytes). 버킷 정책과 동일하게 맞춘다. */
  maxBytes: number;
};

// 클라이언트 직접 업로드 훅.
// 검증(type/size) → browser client로 storage 업로드 → public URL 합성까지 캡슐화한다.
// 업로드 결과 URL만 반환하므로 호출 측 폼은 기존 thumbnail_url/avatar_url 흐름을 그대로 쓴다.
export function useImageUpload({
  bucket,
  userId,
  maxBytes,
}: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setError(null);

      // ── 클라이언트 검증 (버킷 정책과 이중화) ──────────────────────────────
      if (
        !file.type.startsWith("image/") ||
        !ALLOWED_MIME_TYPES.includes(file.type)
      ) {
        const message =
          "이미지 파일(JPEG, PNG, WebP, GIF)만 업로드할 수 있습니다.";
        setError(message);
        return { error: message };
      }
      if (file.size > maxBytes) {
        const maxMb = Math.round(maxBytes / (1024 * 1024));
        const message = `파일 크기는 ${maxMb}MB 이하여야 합니다.`;
        setError(message);
        return { error: message };
      }

      setIsUploading(true);
      try {
        const supabase = createClient();

        // 경로는 반드시 {userId}/ 로 시작해야 RLS(본인 폴더 업로드) 정책을 통과한다.
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          const message = `업로드에 실패했습니다: ${uploadError.message}`;
          setError(message);
          return { error: message };
        }

        // getPublicUrl은 네트워크 호출 없이 URL 문자열만 합성한다.
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(path);

        return { url: publicUrl };
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "알 수 없는 오류로 업로드에 실패했습니다.";
        setError(message);
        return { error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, userId, maxBytes],
  );

  return { upload, isUploading, error };
}
