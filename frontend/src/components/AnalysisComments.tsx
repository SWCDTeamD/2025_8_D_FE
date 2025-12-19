import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PanelData } from "../utils/mockPanelData";
import { generateAnalysisComments } from "../utils/panelSearchUtils";
import { AnalysisResponse } from "../utils/api";
import { MessageSquare, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface AnalysisCommentsProps {
  panels: PanelData[];
  query?: string;
  analysisResult?: AnalysisResponse | null;
}

export function AnalysisComments({ panels, query, analysisResult }: AnalysisCommentsProps) {
  if (panels.length === 0) {
    return null;
  }

  const comments = generateAnalysisComments(panels, query);
  const hasRAGAnalysis = analysisResult && (analysisResult.insights.length > 0 || analysisResult.summary.key_insights.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          분석 코멘트
          {hasRAGAnalysis && (
            <Badge variant="default" className="ml-2">
              분석
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주요 인사이트 표시 (key_insights + insights의 finding) */}
        {(() => {
          // RAG 분석에서 핵심 인사이트와 상세 인사이트 모두 추출
          const ragKeyInsights = hasRAGAnalysis && analysisResult!.summary.key_insights.length > 0
            ? analysisResult!.summary.key_insights
            : [];
          
          // RAG 분석의 상세 인사이트 finding 추출 (key_insights와 중복되지 않는 것만)
          const ragDetailedInsights = hasRAGAnalysis && analysisResult!.insights.length > 0
            ? analysisResult!.insights
                .filter(insight => {
                  // key_insights와 중복되지 않는 finding만 포함
                  const findingLower = insight.finding.toLowerCase();
                  return !ragKeyInsights.some(ki => ki.toLowerCase().includes(findingLower) || findingLower.includes(ki.toLowerCase()));
                })
                .map(insight => insight.finding)
                .slice(0, 5) // 최대 5개만
            : [];
          
          // 클라이언트 사이드 분석 (RAG가 없을 때만)
          const clientInsights = !hasRAGAnalysis ? comments.insights : [];
          
          // key_insights 우선, 그 다음 detailed insights, 마지막으로 client insights
          const insightsToShow = [
            ...ragKeyInsights,
            ...ragDetailedInsights,
            ...(ragKeyInsights.length === 0 && ragDetailedInsights.length === 0 ? clientInsights : [])
          ].slice(0, 10); // 최대 10개
          
          return insightsToShow.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>주요 인사이트</span>
                {hasRAGAnalysis && (
                  <span className="text-xs text-muted-foreground">
                    (핵심 {ragKeyInsights.length}개, 상세 {ragDetailedInsights.length}개)
                  </span>
                )}
              </div>
              {insightsToShow.map((insight, index) => (
                <Alert key={index} className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <AlertDescription className="text-sm">
                    {insight}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : null;
        })()}

        {/* 추천사항 - RAG 분석의 recommendation을 우선 사용 */}
        {(() => {
          const ragRecommendations = hasRAGAnalysis
            ? analysisResult!.insights
                .filter(i => i.recommendation)
                .map(i => i.recommendation!)
            : [];
          const recommendationsToShow = ragRecommendations.length > 0
            ? ragRecommendations
            : comments.recommendations;
          
          return recommendationsToShow.length > 0 ? (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>추천사항</span>
              </div>
              <div className="space-y-2">
                {recommendationsToShow.map((recommendation, index) => (
                  <div key={index} className="text-sm pl-4 border-l-2 border-primary/30 py-1">
                    {recommendation}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* 비교군 추천 (RAG) */}
        {hasRAGAnalysis && analysisResult!.comparison_groups.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>비교군 추천</span>
            </div>
            <div className="space-y-2">
              {analysisResult!.comparison_groups.map((group, index) => (
                <div key={index} className="text-sm pl-4 border-l-2 border-primary/30 py-1">
                  <Badge variant="outline" className="mr-2">
                    {group.type === "similar" ? "유사 그룹" :
                     group.type === "contrast" ? "대조 그룹" : "보완 그룹"}
                  </Badge>
                  {group.reason}
                  {group.query_suggestion && (
                    <div className="text-xs text-muted-foreground mt-1">
                      추천 검색어: {group.query_suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
