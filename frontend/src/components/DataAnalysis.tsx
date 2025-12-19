import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getDynamicStats } from "../utils/panelSearchUtils";
import { PanelData } from "../utils/mockPanelData";
import { AnalysisResponse } from "../utils/api";
import { BarChart3, TrendingUp, Sparkles, Loader2, AlertCircle, Users, Calendar, UserCheck, Heart, MapPin, DollarSign, Brain } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { LoadingIndicator } from "./LoadingIndicator";

interface DataAnalysisProps {
  panels: PanelData[];
  query?: string;
  analysisResult?: AnalysisResponse | null;
  isAnalyzing?: boolean;
  isLoading?: boolean; // 검색 중 상태 추가
  analysisError?: string | null;
  onAnalyze?: (panels: PanelData[]) => void;
}

export function DataAnalysis({ panels, query, analysisResult, isAnalyzing, isLoading = false, analysisError, onAnalyze }: DataAnalysisProps) {
  // 백엔드 분석 결과가 있으면 우선 표시
  // analysisResult가 존재하고, summary나 statistics가 있으면 분석 결과로 간주
  // (insights나 key_insights가 비어있어도 summary나 statistics가 있으면 분석이 완료된 것으로 간주)
  const hasRAGAnalysis = analysisResult && (
    (analysisResult.summary && Object.keys(analysisResult.summary).length > 0) ||
    (analysisResult.statistics && Object.keys(analysisResult.statistics).length > 0) ||
    (analysisResult.insights && analysisResult.insights.length > 0) || 
    (analysisResult.summary?.key_insights && analysisResult.summary.key_insights.length > 0)
  );
  
  // 디버깅: 분석 결과 확인
  if (analysisResult) {
    console.log("📊 DataAnalysis - analysisResult:", {
      hasSummary: !!analysisResult.summary,
      hasStatistics: !!analysisResult.statistics,
      hasInsights: analysisResult.insights?.length || 0,
      hasKeyInsights: analysisResult.summary?.key_insights?.length || 0,
      hasNotableFindings: analysisResult.summary?.notable_findings?.length || 0,
      summaryKeys: analysisResult.summary ? Object.keys(analysisResult.summary) : [],
      hasRAGAnalysis,
      isAnalyzing,
      fullResult: analysisResult
    });
  }
  
  // 통계 (원래대로 모든 통계 표시)
  const stats = getDynamicStats(panels, query || "");

  // 검색 중이면 로딩 표시
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            데이터 분석
            <Badge variant="secondary" className="ml-2">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              검색 중
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <LoadingIndicator variant="centered" size="md" label="검색 중..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 패널이 없어도 카드는 표시
  if (panels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            데이터 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            데이터 분석
            {hasRAGAnalysis && !isAnalyzing && (
              <Badge variant="default" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                분석 완료
              </Badge>
            )}
            {isAnalyzing && (
              <Badge variant="secondary" className="ml-2">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                분석 중
              </Badge>
            )}
            {onAnalyze && panels.length > 0 && !hasRAGAnalysis && !isAnalyzing && (
              <Badge
                variant="default"
                className="ml-2 cursor-pointer hover:opacity-80 transition-opacity"
                asChild
              >
                <button onClick={() => onAnalyze(panels)}>
                  데이터 분석
                </button>
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본 통계는 항상 표시 */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => {
              const getIcon = (key: string) => {
                switch (key) {
                  case "total":
                    return <Users className="w-5 h-5" />;
                  case "avg_age":
                    return <Calendar className="w-5 h-5" />;
                  case "gender":
                    return <UserCheck className="w-5 h-5" />;
                  case "marital_status":
                    return <Heart className="w-5 h-5" />;
                  case "avg_household_income":
                    return <DollarSign className="w-5 h-5" />;
                  case "region":
                    return <MapPin className="w-5 h-5" />;
                  case "education":
                    return <UserCheck className="w-5 h-5" />;
                  case "children":
                    return <Users className="w-5 h-5" />;
                  default:
                    return <BarChart3 className="w-5 h-5" />;
                }
              };

              return (
                <div key={stat.key} className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="text-primary/80">
                      {getIcon(stat.key)}
                    </div>
                    <p className="text-sm font-medium">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 분석 중일 때는 로딩 메시지 추가 */}
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8 border-t">
            <LoadingIndicator variant="centered" size="md" label="데이터 분석 중..." />
          </div>
        )}

        {/* 분석 결과 표시 */}
        {hasRAGAnalysis && !analysisError && analysisResult && (
          <div className="pt-4 border-t space-y-4">
            {/* summary 정보 표시 */}
            {analysisResult.summary && (
              <>
                {analysisResult.summary.total_panels !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    분석된 패널 수: {analysisResult.summary.total_panels}개
                  </div>
                )}
                
                {/* key_insights만 표시 (나머지는 상세 분석 결과에서 확인) */}
                {analysisResult.summary.key_insights && analysisResult.summary.key_insights.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">핵심 인사이트</span>
                    </div>
                    <ul className="space-y-1">
                      {analysisResult.summary.key_insights.map((insight, idx) => (
                        <li key={idx} className="text-sm text-foreground">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* 분석 결과가 있지만 내용이 비어있을 때 */}
            {analysisResult.summary && 
             (!analysisResult.summary.key_insights || analysisResult.summary.key_insights.length === 0) &&
             (!analysisResult.summary.notable_findings || analysisResult.summary.notable_findings.length === 0) &&
             (!analysisResult.insights || analysisResult.insights.length === 0) && (
              <div className="text-sm text-muted-foreground">
                <p>분석이 완료되었지만 인사이트가 생성되지 않았습니다.</p>
                <p className="text-xs mt-1">백엔드 로그를 확인해주세요.</p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground pt-2">
              💡 더 자세한 분석은 <span className="font-medium text-primary">"데이터 분석"</span> 탭에서 확인하세요.
            </p>
          </div>
        )}

        {/* 분석 오류 메시지 */}
        {analysisError && (
          <div className="pt-4 border-t">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* 분석 결과가 없을 때 */}
        {!hasRAGAnalysis && !isAnalyzing && !analysisError && (
          <div className="flex items-center justify-center py-12 border-t min-h-[120px]">
            <p className="text-sm text-muted-foreground text-center">데이터분석 버튼을 누르면 분석이 진행됩니다..</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

