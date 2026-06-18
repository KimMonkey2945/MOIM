"use client";

import { useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { cn } from "@/lib/utils";

// 이미지 업로드 공용 UI. 파일 선택 → 미리보기 → 업로드까지 담당한다.
// 업로드 성공 시 onChange(publicUrl)로 부모 state에 URL을 주입하므로,
// 부모 폼은 기존 thumbnail_url/avatar_url 흐름을 그대로 사용한다.
// URL 직접 입력 필드는 부모 폼에 그대로 유지하고, 동일한 value/onChange에 연결한다(병행).
export function ImageUpload({
  value,
  onChange,
  bucket,
  userId,
  shape,
  maxBytes,
  className,
}: {
  /** 현재 이미지 URL (업로드 또는 URL 직접 입력 결과) */
  value: string;
  /** URL 변경 콜백 */
  onChange: (url: string) => void;
  bucket: string;
  userId: string;
  /** 미리보기 모양: 아바타(circle) / 커버(rect) */
  shape: "circle" | "rect";
  maxBytes: number;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useImageUpload({
    bucket,
    userId,
    maxBytes,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 같은 파일을 다시 선택해도 onChange가 발화하도록 value를 초기화한다.
    e.target.value = "";
    if (!file) return;

    const result = await upload(file);
    if ("url" in result) {
      onChange(result.url);
    }
  };

  const previewUrl = value.trim();
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* 미리보기 */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground",
          shape === "circle"
            ? "h-16 w-16 rounded-full"
            : "aspect-video w-40 rounded-md",
        )}
      >
        {previewUrl ? (
          // 외부 임의 URL 병행 지원이라 next/image 도메인 설정을 피해 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="이미지 미리보기"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlus className="size-6" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              업로드 중...
            </>
          ) : (
            <>
              <ImagePlus aria-hidden />
              이미지 업로드
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          최대 {maxMb}MB · JPEG/PNG/WebP/GIF
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
