import { useState, useEffect, useRef } from "react";
import { SearchBar } from "./components/SearchBar";
import { PanelDataTable } from "./components/PanelDataTable";
import { DataAnalysis } from "./components/DataAnalysis";
import { DataVisualization } from "./components/DataVisualization";
import { RelatedPanels } from "./components/RelatedPanels";
import { PanelDetailDialog } from "./components/PanelDetailDialog";
import { PanelData } from "./utils/mockPanelData";
import { downloadCSV } from "./utils/panelSearchUtils";
import { searchByNaturalLanguage, SearchResultItem, analyzePanels, AnalysisResponse } from "./utils/api";
import { Button } from "./components/ui/button";
import { Download, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { LoadingIndicator } from "./components/LoadingIndicator";

export default function App() {
  const [allPanels, setAllPanels] = useState<PanelData[]>([]);
  const [displayedPanels, setDisplayedPanels] = useState<PanelData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [selectedPanel, setSelectedPanel] = useState<PanelData | null>(null);
  const [isPanelDialogOpen, setIsPanelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analyzingRef = useRef(false); // 실제 분석 진행 중인지 추적 (중복 실행 방지)

  // 백엔드 SearchResultItem을 프론트엔드 PanelData로 변환
  const convertSearchResultToPanelData = (result: SearchResultItem): PanelData => {
    // 디버깅: 첫 번째 결과만 로그 출력
    if (result.panel_id && result.panel_summary_text) {
      console.log(`🔍 패널 ${result.panel_id} 요약 텍스트:`, result.panel_summary_text.substring(0, 50));
    }
    
    const genderRaw = (result.gender ?? "").toString();
    // DB에서 "남성", "여성" 또는 "male", "female" 형식 모두 지원
    let gender: "남성" | "여성" = "남성";
    if (genderRaw.toLowerCase() === "male" || genderRaw === "남성" || genderRaw.includes("남")) {
      gender = "남성";
    } else if (genderRaw.toLowerCase() === "female" || genderRaw === "여성" || genderRaw.includes("여")) {
      gender = "여성";
    }

    // 소득을 문자열 형식으로 변환 (DB에 만원 단위로 저장됨)
    const formatIncome = (income?: number): string | undefined => {
      if (!income) return undefined;
      
      // "월 100만원 미만"의 경우 parse_income이 100을 반환하므로 특별 처리
      if (income < 100) {
        return "월 100만원 미만";
      }
      
      // "월 1000만원 이상"의 경우
      if (income >= 1000) {
        return "월 1000만원 이상";
      }
      
      // 100만원 단위 범위로 변환 (예: 500 -> "월 500~599만원", 300 -> "월 300~399만원")
      const hundredThousands = Math.floor(income / 100) * 100;
      // "월 100~199만원" 같은 형식
      if (hundredThousands === 100 && income < 200) {
        return "월 100~199만원";
      }
      return `월 ${hundredThousands}~${hundredThousands + 99}만원`;
    };

    // 만원 단위를 원 단위로 변환하여 income_level 계산
    const incomeNum = (result.monthly_household_income ?? 0) * 10000;
    const income_level = incomeNum >= 10000000 ? "상" : incomeNum >= 7000000 ? "중" : "하";

    return {
      panel_uid: result.panel_id || "UNKNOWN",
      gender,
      age: result.age ?? 0,
      region_city: result.region_city,
      region_district: result.region_gu,
      region: result.region_city,
      marital_status: result.marital_status,
      children_count: result.children_count,
      family_members: result.family_size,
      education: result.education_level,
      occupation: result.occupation,
      job: result.occupation,
      monthly_personal_income: formatIncome(result.monthly_personal_income),
      monthly_household_income: formatIncome(result.monthly_household_income),
      income_level,
      phone_brand: result.phone_brand,
      phone_model: result.phone_model,
      car_ownership: result.car_ownership ? "유" : result.car_ownership === false ? "무" : undefined,
      car_manufacturer: result.car_manufacturer,
      car_model: result.car_model,
      owned_electronics: result.owned_electronics && Array.isArray(result.owned_electronics) 
        ? result.owned_electronics.join(", ") 
        : undefined,
      smoking_experience: result.smoking_experience && Array.isArray(result.smoking_experience) && result.smoking_experience.length > 0
        ? result.smoking_experience[0]  // 첫 번째 값만 표시
        : undefined,
      smoking_brands: result.smoking_brand && Array.isArray(result.smoking_brand)
        ? result.smoking_brand.join(", ")
        : undefined,
      heated_tobacco_brands: result.e_cig_heated_brand && Array.isArray(result.e_cig_heated_brand)
        ? result.e_cig_heated_brand.join(", ")
        : undefined,
      liquid_ecig_brands: result.e_cig_liquid_brand && Array.isArray(result.e_cig_liquid_brand)
        ? result.e_cig_liquid_brand.join(", ")
        : undefined,
      drinking_experience: result.drinking_experience && Array.isArray(result.drinking_experience)
        ? result.drinking_experience.join(", ")
        : undefined,
      panel_summary_text: result.panel_summary_text || undefined,
      // 정확도 정보 추가
      accuracy_score: result.accuracy_score,
      vector_score: result.vector_score,
      fts_score: result.fts_score,
      rrf_score: result.rrf_score,
      matched_fields: result.matched_fields,
      search_source: result.source,
    };
  };

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    setError(null);
  };

  const handleSearch = async (query: string) => {
    setExecutedQuery(query);
    setError(null);
    
    if (!query.trim()) {
      setDisplayedPanels([]);
      setAnalysisResult(null);
      setAnalysisError(null);
      setIsAnalyzing(false);
      return;
    }

    setIsLoading(true);
    // 분석 상태 초기화 (분석은 검색 결과를 받은 후 자동 시작)
    setAnalysisResult(null);
    setAnalysisError(null);
    
    try {
      // 백엔드 API 호출 (제한 없이 모든 결과 반환)
      const res = await searchByNaturalLanguage({ query, top_k: 10000 });
      
      // 응답 데이터 검증
      if (!res || !Array.isArray(res.results)) {
        throw new Error('서버로부터 잘못된 응답을 받았습니다.');
      }
      
      // 비정형 청크에서 관련 세그먼트 추출
      const matchedSegments: string[] = [];
      if (res.analysis?.unstructured_chunks) {
        res.analysis.unstructured_chunks.forEach((chunk: any) => {
          if (chunk.related_segments && Array.isArray(chunk.related_segments)) {
            chunk.related_segments.forEach((segment: string) => {
              if (!matchedSegments.includes(segment)) {
                matchedSegments.push(segment);
              }
            });
          }
        });
      }
      
      // SearchResultItem을 PanelData로 변환
      const mapped: PanelData[] = res.results.map((result) => {
        const panelData = convertSearchResultToPanelData(result);
        // 비정형 검색 결과인 경우 matched_segments 추가
        if (result.source === 'unstructured' || result.source === 'hybrid') {
          panelData.matched_segments = matchedSegments;
        }
        return panelData;
      });
      
      // 디버깅: 요약 텍스트가 있는 패널 확인
      const withSummary = mapped.filter(p => p.panel_summary_text);
      console.log(`📊 검색 결과: 총 ${mapped.length}개, 요약 텍스트 있음: ${withSummary.length}개`);
      if (withSummary.length > 0) {
        console.log('📝 요약 텍스트 샘플:', withSummary[0].panel_summary_text?.substring(0, 50));
      }
      
      setDisplayedPanels(mapped);
      setAllPanels(mapped); // 전체 패널도 업데이트
      
      // 결과가 없는 경우
      if (mapped.length === 0) {
        setError(null); // 에러가 아니라 빈 결과이므로 에러 메시지 제거
        setIsAnalyzing(false); // 분석 중지
      }
    } catch (err) {
      console.error("검색 오류:", err);
      
      // 에러 메시지 추출
      let errorMessage = "검색 중 오류가 발생했습니다.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setDisplayedPanels([]);
      setIsAnalyzing(false); // 검색 실패 시 분석도 중지
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setExecutedQuery("");
    setDisplayedPanels([]);
    setError(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleRelatedQueryClick = async (query: string) => {
    setSearchQuery(query);
    // 검색 자동 실행
    await handleSearch(query);
  };

  const handleDownloadCSV = () => {
    // 파일명에 검색 쿼리 포함 (한글/특수문자 제거)
    const sanitizeFilename = (str: string) => {
      return str
        .replace(/[^\w\s-]/g, "") // 특수문자 제거
        .replace(/\s+/g, "_") // 공백을 언더스코어로
        .substring(0, 50); // 최대 50자
    };
    
    const queryPart = executedQuery 
      ? `_${sanitizeFilename(executedQuery)}` 
      : "";
    const filename = `패널데이터${queryPart}_${displayedPanels.length}명_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(displayedPanels, filename);
  };

  const handlePanelClick = (panel: PanelData) => {
    setSelectedPanel(panel);
    setIsPanelDialogOpen(true);
  };

  const handleManualAnalyze = async (panels: PanelData[]) => {
    console.log(`🔍 handleManualAnalyze 호출됨: ${panels.length}개 패널, analyzingRef.current=${analyzingRef.current}`);
    
    if (panels.length === 0) {
      console.log("⚠️ 패널이 없어서 분석을 건너뜁니다.");
      setIsAnalyzing(false);
      analyzingRef.current = false;
      return;
    }

    // 이미 분석 중이면 중복 실행 방지 (useRef로 실제 상태 추적)
    if (analyzingRef.current) {
      console.log("⚠️ 이미 분석이 진행 중입니다. 중복 실행 방지.");
      return;
    }

    // 분석 시작
    console.log("✅ 분석 시작 설정...");
    analyzingRef.current = true;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    
    console.log(`📊 분석 시작: ${panels.length}개 패널`);

    try {
      const panelIds = panels.map(p => p.panel_uid);
      
      // 패널 수에 따른 경고 메시지 (제한 없이 분석 진행)
      if (panelIds.length > 1000) {
        console.log(`⚠️ 패널이 ${panelIds.length}개로 많습니다. 분석에 시간이 오래 걸릴 수 있습니다.`);
      }
      
      // 질의에서 명수 추출
      const extractCountFromQuery = (query: string): number | undefined => {
        const patterns = [
          /(\d+)\s*명\s*(?:뽑|추출|추천|보여|보여줘)/,
          /(\d+)\s*개\s*(?:뽑|추출|추천|보여|보여줘)/,
          /(\d+)\s*명\s*뽑/,
          /(\d+)\s*개\s*뽑/,
          /(\d+)\s*명(?:\s|$|,|\.|뿐)/,
          /(\d+)\s*개(?:\s|$|,|\.|뿐)/,
        ];
        for (const pattern of patterns) {
          const match = query.match(pattern);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
        return undefined;
      };
      
      const requestedCount = executedQuery ? extractCountFromQuery(executedQuery) : undefined;
      
      // 제한 없이 모든 패널에 대해 고품질 comprehensive 분석 수행
      console.log(`📊 고품질 분석 시작: ${panelIds.length}개 패널`);
      console.log(`📤 분석 API 호출: ${panelIds.length}개 패널, 타입=comprehensive, 질의="${executedQuery}", 명수=${requestedCount || "없음"}`);
      const result = await analyzePanels({
        panel_ids: panelIds,
        analysis_type: "comprehensive",
        include_comparison: true,
        query: executedQuery,
        requested_count: requestedCount,
        include_charts: true,
      });
      console.log("✅ 분석 완료, 결과 저장 중...");
      console.log("📊 분석 결과 구조:", {
        hasSummary: !!result.summary,
        hasInsights: !!result.insights,
        hasStatistics: !!result.statistics,
        summaryKeys: result.summary ? Object.keys(result.summary) : [],
        insightsLength: result.insights?.length || 0,
        keyInsightsLength: result.summary?.key_insights?.length || 0,
        fullResult: result
      });
      setAnalysisResult(result);
      console.log("✅ 분석 결과 저장 완료");
    } catch (err) {
      console.error("분석 오류:", err);
      
      // 에러 메시지 설정
      let errorMessage = "분석 중 오류가 발생했습니다.";
      if (err instanceof Error) {
        if (err.message.includes("시간이 초과") || err.message.includes("timeout")) {
          errorMessage = "분석 시간이 초과되었습니다. 패널 수가 많을 경우 분석이 건너뛰어질 수 있습니다.";
        } else if (err.message.includes("ThrottlingException") || err.message.includes("throttle")) {
          errorMessage = "서버가 일시적으로 사용량이 많습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = err.message;
        }
      }
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
      analyzingRef.current = false; // 분석 완료
    }
  };

  // 검색 전 상태 (중앙 검색창만 표시)
  if (!executedQuery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          <div className="space-y-3 text-center">
            <h1>패널 데이터 검색 시스템</h1>
            <p className="text-muted-foreground">
              자연어로 설문조사 응답자를 검색하고 분석하세요
            </p>
          </div>
          <SearchBar 
            query={searchQuery}
            onQueryChange={handleQueryChange}
            onSearch={handleSearch} 
            onClear={handleClearSearch} 
          />
        </div>
      </div>
    );
  }

  // 검색 후 상태 (모든 결과 표시)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1>패널 데이터 검색 시스템</h1>
          <p className="text-muted-foreground">
            자연어로 설문조사 응답자를 검색하고 분석하세요
          </p>
        </div>

        {/* Search Section */}
        <div className="space-y-4">
          <div className="max-w-3xl mx-auto">
            <SearchBar 
              query={searchQuery}
              onQueryChange={handleQueryChange}
              onSearch={handleSearch} 
              onClear={handleClearSearch} 
            />
          </div>
          {error && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            </div>
          )}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {isLoading ? (
                <LoadingIndicator />
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>검색 결과 {displayedPanels.length}명</span>
                </>
              )}
            </div>
            {displayedPanels.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 내보내기
              </Button>
            )}
          </div>
        </div>

        {/* Related Panels */}
        <RelatedPanels
          currentQuery={executedQuery}
          analysisResult={analysisResult}
          onQueryClick={handleRelatedQueryClick}
        />

        {/* Data Analysis */}
        <DataAnalysis
          panels={displayedPanels} 
          query={executedQuery}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          isLoading={isLoading}
          analysisError={analysisError}
          onAnalyze={(panels) => handleManualAnalyze(panels)}
        />

        {/* Main Content */}
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="table">패널 데이터</TabsTrigger>
            <TabsTrigger value="visualization">데이터 분석</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-6">
            <PanelDataTable panels={displayedPanels} onPanelClick={handlePanelClick} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="visualization" className="mt-6">
            <DataVisualization 
              panels={displayedPanels} 
              query={executedQuery}
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
        </Tabs>

        {/* Panel Detail Dialog */}
        <PanelDetailDialog
          panel={selectedPanel}
          open={isPanelDialogOpen}
          onOpenChange={setIsPanelDialogOpen}
        />
      </div>
    </div>
  );
}
