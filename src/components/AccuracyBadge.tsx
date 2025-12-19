import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Info } from "lucide-react";
import { PanelData } from "../utils/mockPanelData";

interface AccuracyBadgeProps {
  panel: PanelData;
}

/**
 * 검색 정확도를 표시하는 배지 컴포넌트
 */
export function AccuracyBadge({ panel }: AccuracyBadgeProps) {
  const accuracy = panel.accuracy_score;
  
  if (accuracy === undefined || accuracy === null) {
    return null;
  }

  // 정확도 레벨 결정
  const getAccuracyLevel = (score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (score >= 0.95) {
      return { label: "매우 높음", variant: "default" };
    } else if (score >= 0.8) {
      return { label: "높음", variant: "default" };
    } else if (score >= 0.6) {
      return { label: "중간", variant: "secondary" };
    } else {
      return { label: "낮음", variant: "outline" };
    }
  };

  const level = getAccuracyLevel(accuracy);
  const percentage = Math.round(accuracy * 100);

  // 간단한 정보만 표시
  const details: string[] = [];
  
  // 검색 방법
  if (panel.search_source) {
    const sourceLabels: Record<string, string> = {
      "structured": "정형검색",
      "unstructured": "비정형검색",
      "hybrid": "하이브리드검색",
    };
    details.push(`검색 방법: ${sourceLabels[panel.search_source] || panel.search_source}`);
  }
  
  // 매칭 필드
  if (panel.matched_fields && panel.matched_fields.length > 0) {
    details.push(`매칭 필드: ${panel.matched_fields.join(", ")}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Badge variant={level.variant}>
        {level.label} ({percentage}%)
      </Badge>
      {details.length > 0 && (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center h-5 w-5 p-0 rounded-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              aria-label="정확도 계산 근거 보기"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-lg z-50"
            side="top"
            align="start"
            style={{ 
              backgroundColor: '#f3f4f6', 
              color: '#111827',
              border: '1px solid #d1d5db',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="space-y-2.5 text-sm" style={{ color: '#111827' }}>
              {details.map((detail, idx) => (
                <div key={idx} className="font-medium" style={{ color: '#111827' }}>{detail}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

