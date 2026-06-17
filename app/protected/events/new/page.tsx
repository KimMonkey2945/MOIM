// 이벤트 생성 (PRD 6.2 /protected/events/new). 현재는 빈 껍데기.
// 실제 생성 폼(제목·설명·날짜·장소·카테고리·썸네일)은 Phase 1 Task에서 구현한다.
export default function EventNewPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">이벤트 생성</h1>
      <p className="text-sm text-muted-foreground">
        새 모임 이벤트를 만듭니다. (폼은 추후 구현)
      </p>
    </div>
  );
}
