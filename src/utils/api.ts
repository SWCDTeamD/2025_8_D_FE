/**
 * Backend API 클라이언트
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 백엔드 응답 형식
export interface SearchResultItem {
  panel_id: string;
  score: number;
  source: string;
  // 정확도 정보 (새로 추가)
  accuracy_score?: number;  // 종합 정확도 점수 (0.0 ~ 1.0)
  vector_score?: number;    // 벡터 검색 유사도 점수
  fts_score?: number;       // FTS 검색 점수
  rrf_score?: number;       // RRF 통합 점수
  matched_fields?: string[]; // 매칭된 정형 필드 목록
  // 패널 기본 정보
  gender?: string;
  age?: number;
  region_city?: string;
  region_gu?: string;
  marital_status?: string;
  children_count?: number;
  family_size?: number;
  education_level?: string;
  occupation?: string;
  monthly_personal_income?: number;
  monthly_household_income?: number;
  phone_brand?: string;
  phone_model?: string;
  car_ownership?: boolean;
  car_manufacturer?: string;
  car_model?: string;
  // 배열 필드들
  owned_electronics?: string[];
  smoking_experience?: string[];
  smoking_brand?: string[];
  e_cig_heated_brand?: string[];
  e_cig_liquid_brand?: string[];
  drinking_experience?: string[];
  panel_summary_text?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  analysis?: {
    structured_chunks?: any[];
    unstructured_chunks?: any[];
    label_filters?: any[];
  };
}

export interface NLQueryRequest {
  query: string;
  top_k?: number;
}

/**
 * 자연어 질의로 패널 검색
 */
export async function searchByNaturalLanguage(
  payload: NLQueryRequest
): Promise<SearchResponse> {
  // 타임아웃 처리를 위한 AbortController 생성
  // top_k가 크면 처리 시간이 길어질 수 있으므로 동적으로 타임아웃 조정
  const timeoutSeconds = (payload.top_k && payload.top_k > 1000) ? 300 : 120; // 1000개 이상이면 5분, 그 외는 2분
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

  const apiUrl = `${API_BASE_URL}/search/nl`;
  console.log('🔍 API 호출:', apiUrl);
  console.log('📤 요청 데이터:', payload);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status})`;
      
      try {
        const errorData = await response.json();
        // FastAPI는 보통 {detail: "에러 메시지"} 형식으로 반환
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
        errorMessage = response.status === 503 
          ? 'LLM 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
          : `서버 오류 (${response.status}: ${response.statusText})`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // AbortController에 의한 중단 (타임아웃)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 네트워크 오류 처리
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }
    }
    
    // 기타 오류는 그대로 throw
    throw error;
  }
}

// ===== 분석 API 타입 정의 =====
export interface InsightItem {
  category: string;
  finding: string;
  significance: "high" | "medium" | "low";
  business_implication?: string;
  recommendation?: string;
}

export interface ChartRecommendation {
  type: string;
  title: string;
  description: string;
  category: string;
  data_spec: {
    field: string;
    aggregation: string;
  };
}

export interface ComparisonGroup {
  type: "similar" | "contrast" | "complement";
  reason: string;
  query_suggestion?: string;
}

export interface AnalysisResponse {
  summary: {
    total_panels: number;
    key_insights: string[];
    notable_findings: string[];
  };
  statistics: {
    demographics?: Record<string, any>;
    economic?: Record<string, any>;
    digital?: Record<string, any>;
    lifestyle?: Record<string, any>;
  };
  insights: InsightItem[];
  chart_recommendations: ChartRecommendation[];
  comparison_groups: ComparisonGroup[];
}

export interface AnalyzeRequest {
  panel_ids: string[];
  analysis_type?: "basic" | "comprehensive" | "custom";
  focus_areas?: string[];
  include_comparison?: boolean;
  include_charts?: boolean;
  query?: string; // 원본 질의
  requested_count?: number; // 질의에서 추출한 명수 (명시된 경우만)
}

/**
 * 패널 데이터 분석 (RAG 기반)
 */
export async function analyzePanels(
  request: AnalyzeRequest
): Promise<AnalysisResponse> {
  const controller = new AbortController();
  // 타임아웃을 10분(600초)으로 늘림 (많은 패널 분석 시 LLM 처리 시간이 길어질 수 있음)
  // 패널 수에 따라 동적으로 타임아웃 조정 (1000개 이상이면 15분)
  const timeoutSeconds = request.panel_ids.length > 1000 ? 900 : 600;
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

  const apiUrl = `${API_BASE_URL}/analysis/analyze`;
  console.log('📊 분석 API 호출:', apiUrl);
  console.log('📤 요청 데이터:', request);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        panel_ids: request.panel_ids,
        analysis_type: request.analysis_type || "comprehensive",
        focus_areas: request.focus_areas,
        include_comparison: request.include_comparison !== false,
        include_charts: request.include_charts !== false,
        query: request.query,
        requested_count: request.requested_count,
      }),
      signal: controller.signal,
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = response.status === 503 
          ? '분석 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
          : `서버 오류 (${response.status}: ${response.statusText})`;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('📥 분석 API 응답 데이터:', {
      hasSummary: !!responseData.summary,
      hasInsights: !!responseData.insights,
      hasStatistics: !!responseData.statistics,
      summaryKeys: responseData.summary ? Object.keys(responseData.summary) : [],
      insightsLength: responseData.insights?.length || 0,
      keyInsightsLength: responseData.summary?.key_insights?.length || 0,
      fullResponse: responseData
    });
    return responseData;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('분석 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }
    }
    
    throw error;
  }
}

// 패널 상세 정보 인터페이스
export interface PanelDetailResponse {
  panel_id: string;
  gender?: string;
  age?: number;
  region_city?: string;
  region_gu?: string;
  marital_status?: string;
  children_count?: number;
  family_size?: number;
  education_level?: string;
  occupation?: string;
  monthly_personal_income?: number;
  monthly_household_income?: number;
  phone_brand?: string;
  phone_model?: string;
  car_ownership?: boolean;
  car_manufacturer?: string;
  car_model?: string;
  owned_electronics?: string[];
  smoking_experience?: string[];
  smoking_brand?: string[];
  e_cig_heated_brand?: string[];
  e_cig_liquid_brand?: string[];
  drinking_experience?: string[];
  panel_summary_text?: string;
  search_labels?: string[];
  summary_segments?: Record<string, string>; // G1~G7 요약 텍스트 세그먼트
}

/**
 * 패널 상세 정보 조회
 */
export async function getPanelDetail(panelId: string): Promise<PanelDetailResponse> {
  const apiUrl = `${API_BASE_URL}/panels/${panelId}`;
  console.log('📋 패널 상세 정보 조회:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = response.status === 404 
          ? '패널을 찾을 수 없습니다.'
          : `서버 오류 (${response.status}: ${response.statusText})`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }
    }
    
    throw error;
  }
}

