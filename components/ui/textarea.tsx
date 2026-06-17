import * as React from "react";

import { cn } from "@/lib/utils";

// Input 프리미티브와 동일한 시각 토큰(border-input·ring·radius)을 공유하는 멀티라인 입력.
// shadcn textarea와 호환되는 시그니처라 Phase 3 이후 교체 비용이 없다.
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
