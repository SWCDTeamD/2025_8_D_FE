import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AnalysisResponse } from "../utils/api";
import { Lightbulb } from "lucide-react";
import { Badge } from "./ui/badge";

interface RelatedPanelsProps {
  currentQuery?: string;
  analysisResult?: AnalysisResponse | null;
  onQueryClick: (query: string) => void;
}

export function RelatedPanels({ currentQuery, analysisResult, onQueryClick }: RelatedPanelsProps) {
  // 비교군 추천에서 연관 패널 추천 쿼리 추출
  const relatedQueries = useMemo(() => {
    if (!analysisResult || !analysisResult.comparison_groups || analysisResult.comparison_groups.length === 0) {
      return [];
    }
    
    // comparison_groups에서 query_suggestion이 있는 것만 추출
    return analysisResult.comparison_groups
      .filter(group => group.query_suggestion && group.query_suggestion.trim())
      .map(group => ({
        query: group.query_suggestion!,
        type: group.type,
        reason: group.reason,
      }));
  }, [analysisResult]);

  // 비교군 추천이 없으면 표시하지 않음
  if (!currentQuery || !currentQuery.trim() || relatedQueries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          연관 패널 추천
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            LLM이 추천한 비교군을 기반으로 한 연관 패널 검색어입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedQueries.map((item, index) => (
              <Button
                key={`${item.query}-${index}`}
                variant="outline"
                onClick={() => onQueryClick(item.query)}
                className="flex items-center gap-2"
              >
                <Badge 
                  variant={
                    item.type === "similar" ? "default" :
                    item.type === "contrast" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {item.type === "similar" ? "유사" :
                   item.type === "contrast" ? "대조" : "보완"}
                </Badge>
                {item.query}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
