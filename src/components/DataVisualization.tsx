import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PanelData, getAgeGroup } from "../utils/mockPanelData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { AnalysisResponse } from "../utils/api";
import { getDynamicStats } from "../utils/panelSearchUtils";
import { TrendingUp, Users, Calendar, UserCheck, Heart, MapPin, DollarSign, AlertCircle, Loader2, BarChart3, Lightbulb, Target, ArrowRight, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { getCategoryName } from "../utils/categoryNames";
import { LoadingIndicator } from "./LoadingIndicator";

interface DataVisualizationProps {
  panels: PanelData[];
  query?: string;
  analysisResult?: AnalysisResponse | null;
  isAnalyzing?: boolean;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

// 백엔드 DB 컬럼명 → 프론트엔드 PanelData 필드명 매핑
const FIELD_NAME_MAPPING: Record<string, string> = {
  // DB 컬럼명 → 프론트엔드 필드명
  "education_level": "education",  // DB: education_level → 프론트: education
  "occupation": "job",              // DB: occupation → 프론트: job (또는 occupation)
  "family_size": "family_members", // DB: family_size → 프론트: family_members
  // 나머지는 동일
  "gender": "gender",
  "age": "age",
  "region_city": "region_city",
  "marital_status": "marital_status",
  "children_count": "children_count",
  "monthly_personal_income": "monthly_personal_income",
  "monthly_household_income": "monthly_household_income",
  "phone_brand": "phone_brand",
  "phone_model": "phone_model",
  "car_ownership": "car_ownership",
  "car_manufacturer": "car_manufacturer",
  "car_model": "car_model",
  // 배열 필드들 (프론트엔드에서는 문자열로 변환되어 있음)
  "owned_electronics": "owned_electronics",
  "smoking_experience": "smoking_experience",
  "smoking_brand": "smoking_brands",
  "e_cig_heated_brand": "heated_tobacco_brands",
  "e_cig_liquid_brand": "liquid_ecig_brands",
  "drinking_experience": "drinking_experience",
};

// 차트 데이터 생성 헬퍼 함수
function generateChartData(panels: PanelData[], field: string, aggregation: string): any[] {
  // 필드명 매핑 적용
  const mappedField = FIELD_NAME_MAPPING[field] || field;
  
  // 디버깅: 필드명과 데이터 확인
  console.log(`[차트 생성] 필드명: ${field} → ${mappedField}, aggregation: ${aggregation}`);
  const sampleValue = panels.length > 0 ? (panels[0] as any)[mappedField] : null;
  console.log(`[차트 생성] 샘플 값:`, sampleValue, `타입:`, typeof sampleValue);
  
  if (aggregation === "count" || aggregation === "distribution") {
    const counts: Record<string, number> = {};
    
    // 배열 타입 필드 목록 (복수 선택 가능한 필드들)
    const arrayFields = ["owned_electronics", "smoking_experience", "smoking_brand", 
                         "e_cig_heated_brand", "e_cig_liquid_brand", "drinking_experience"];
    
    panels.forEach(panel => {
      // 매핑된 필드명으로 접근 시도, 없으면 원본 필드명으로 시도
      let value = (panel as any)[mappedField] ?? (panel as any)[field];
      
      if (value === undefined || value === null || value === "") {
        return; // 값이 없으면 스킵
      }
      
      // 배열 타입 필드 처리 (문자열로 변환된 경우도 처리)
      if (arrayFields.includes(field) || arrayFields.includes(mappedField)) {
        // 배열인 경우
        if (Array.isArray(value)) {
          value.forEach((item: any) => {
            if (item) {
              const key = String(item).trim();
              if (key) counts[key] = (counts[key] || 0) + 1;
            }
          });
        } 
        // 문자열로 변환된 경우 (쉼표로 구분)
        else if (typeof value === 'string') {
          const items = value.split(',').map((item: string) => item.trim()).filter((item: string) => item);
          items.forEach((item: string) => {
            counts[item] = (counts[item] || 0) + 1;
          });
        }
        // 단일 값인 경우
        else {
          const key = String(value).trim();
          if (key) counts[key] = (counts[key] || 0) + 1;
        }
      } 
      // 일반 필드 처리
      else {
        const key = String(value).trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
      }
    });
    
    const result = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // 빈도순 정렬
      .slice(0, 20) // 상위 20개만
      .map(([name, value]) => ({ name, value }));
    
    console.log(`[차트 생성] 결과 데이터 개수:`, result.length, result.slice(0, 5));
    return result;
  } else if (aggregation === "mean") {
    const values = panels
      .map(p => {
        const val = (p as any)[mappedField] ?? (p as any)[field];
        return val;
      })
      .filter(v => v !== undefined && v !== null && v !== "");
    
    if (values.length > 0) {
      // 숫자로 변환 시도
      const numericValues = values.map(v => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          // 문자열에서 숫자 추출 (예: "300-400만원" → 350)
          const numMatch = v.match(/\d+/);
          return numMatch ? parseInt(numMatch[0]) : null;
        }
        return null;
      }).filter(v => v !== null) as number[];
      
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        return [{ name: "평균", value: Math.round(mean * 10) / 10 }];
      }
    }
  }
  console.warn(`[차트 생성] 데이터 없음: 필드=${field}, 매핑된 필드=${mappedField}`);
  return [];
}

// 차트 컴포넌트 렌더링
function renderChart(chartType: string, data: any[], title: string) {
  if (data.length === 0) {
    console.warn(`[차트 렌더링] 데이터 없음: chartType=${chartType}, title=${title}`);
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        <p className="text-sm">차트 데이터가 없습니다.</p>
      </div>
    );
  }

  // treemap, box, violin 등은 bar 차트로 fallback
  const normalizedType = chartType === "treemap" || chartType === "box" || chartType === "violin" 
    ? "bar" 
    : chartType;

  if (normalizedType === "pie" || normalizedType === "donut") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={normalizedType === "donut" ? 60 : 0}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: { name: string; percent: number }) => {
              // 라벨이 너무 길면 줄임
              const shortName = name.length > 10 ? name.substring(0, 10) + "..." : name;
              return `${shortName} ${(percent * 100).toFixed(0)}%`;
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [value, "개"]} />
        </PieChart>
      </ResponsiveContainer>
    );
  } else if (normalizedType === "bar" || normalizedType === "histogram") {
    // 데이터가 많으면 상위 15개만 표시
    const displayData = data.slice(0, 15);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip formatter={(value: any) => [value, "개"]} />
          <Legend />
          <Bar dataKey="value" fill={normalizedType === "histogram" ? "#10b981" : "#3b82f6"} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  console.warn(`[차트 렌더링] 지원하지 않는 차트 타입: ${chartType}`);
  return (
    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
      <p className="text-sm">지원하지 않는 차트 타입입니다: {chartType}</p>
    </div>
  );
}

export function DataVisualization({ panels, query, analysisResult, isAnalyzing }: DataVisualizationProps) {
  // 분석 중일 때는 통계는 표시하고 차트만 로딩 표시

  // 패널이 없을 때는 안내 메시지 표시
  if (panels.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">검색 결과가 없습니다</p>
          <p className="text-sm text-muted-foreground">패널을 검색한 후 데이터 분석을 확인하세요</p>
        </div>
      </div>
    );
  }

  // LLM이 추천한 차트가 있으면 우선 사용
  const recommendedCharts = analysisResult?.chart_recommendations || [];
  
  // 디버깅: 추천 차트 정보 확인
  console.log(`[차트] 추천 차트 개수:`, recommendedCharts.length);
  if (recommendedCharts.length > 0) {
    console.log(`[차트] 추천 차트 샘플:`, recommendedCharts[0]);
  }
  
  // LLM 추천 차트 데이터 생성
  const ragCharts = recommendedCharts
    .slice(0, 2) // 최대 2개만
    .map(chart => {
      const field = chart.data_spec?.field || "";
      const data = generateChartData(panels, field, chart.data_spec?.aggregation || "distribution");
      console.log(`[차트] LLM 추천 차트 생성:`, { field, type: chart.type, dataLength: data.length });
      return {
        type: chart.type,
        title: chart.title,
        description: chart.description,
        data,
        field, // 필드명 저장 (중복 체크용)
      };
    })
    .filter(chart => chart.data.length > 0);
  
  console.log(`[차트] LLM 추천 차트 필터링 후:`, ragCharts.length, "개");

  // 질의에서 관련 필드 추출
  const extractRelevantFieldsFromQuery = (query: string): string[] => {
    if (!query) return [];
    const queryLower = query.toLowerCase();
    const relevantFields: string[] = [];
    
    // 키워드 → 필드명 매핑
    const keywordToField: Record<string, string> = {
      // 인구통계
      "성별": "gender", "남성": "gender", "여성": "gender",
      "나이": "age", "연령": "age", "20대": "age", "30대": "age", "40대": "age", "50대": "age",
      "지역": "region_city", "서울": "region_city", "부산": "region_city", "인천": "region_city",
      "결혼": "marital_status", "기혼": "marital_status", "미혼": "marital_status",
      "학력": "education", "학원": "education",
      "직업": "job", "회사원": "job", "전문직": "job", "자영업": "job",
      
      // 경제력
      "소득": "monthly_household_income", "수입": "monthly_household_income", "가구소득": "monthly_household_income",
      "차량": "car_ownership", "자동차": "car_ownership", "차": "car_ownership",
      "차량제조사": "car_manufacturer", "차량모델": "car_model",
      
      // 디지털
      "휴대폰": "phone_brand", "스마트폰": "phone_brand", "아이폰": "phone_brand", "갤럭시": "phone_brand",
      "전자제품": "owned_electronics", "가전": "owned_electronics", "가전제품": "owned_electronics",
      "TV": "owned_electronics", "냉장고": "owned_electronics", "세탁기": "owned_electronics",
      "노트북": "owned_electronics", "태블릿": "owned_electronics",
      
      // 라이프스타일
      "흡연": "smoking_experience", "담배": "smoking_experience",
      "음주": "drinking_experience", "술": "drinking_experience",
      "OTT": "ott_service", "넷플릭스": "ott_service", "디즈니": "ott_service",
    };
    
    // 질의에서 키워드 찾기
    Object.entries(keywordToField).forEach(([keyword, field]) => {
      if (queryLower.includes(keyword) && !relevantFields.includes(field)) {
        relevantFields.push(field);
      }
    });
    
    return relevantFields;
  };

  // 동적으로 가장 의미있는 컬럼 2개 선택 (LLM 추천이 없을 때만 사용)
  const findMeaningfulColumns = (query?: string): Array<{ field: string; title: string; type: string; data: any[] }> => {
    // 질의에서 관련 필드 추출
    const queryRelevantFields = query ? extractRelevantFieldsFromQuery(query) : [];
    console.log(`[차트] 질의 관련 필드:`, queryRelevantFields);
    
    // 분석할 컬럼 목록 (시각화하기 적합한 컬럼들)
    // 프론트엔드 PanelData 필드명 사용
    const analyzableFields = [
      { field: "gender", title: "성별 분포", type: "pie" },
      { field: "age", title: "연령대 분포", type: "bar" },
      { field: "region_city", title: "지역(시) 분포", type: "bar" },
      { field: "marital_status", title: "결혼 여부 분포", type: "pie" },
      { field: "education", title: "학력 분포", type: "bar" },
      { field: "job", title: "직업 분포", type: "bar" },
      { field: "car_ownership", title: "차량 보유 여부", type: "pie" },
      { field: "car_manufacturer", title: "차량 제조사 분포", type: "bar" },
      { field: "phone_brand", title: "휴대폰 브랜드 분포", type: "bar" },
      { field: "monthly_household_income", title: "가구소득 분포", type: "bar" },
      { field: "owned_electronics", title: "가전제품 보유 현황", type: "bar" },
      { field: "smoking_experience", title: "흡연 경험 분포", type: "pie" },
      { field: "drinking_experience", title: "음주 경험 분포", type: "pie" },
    ];

    // 각 컬럼의 점수 계산 (의미있음 점수 + 질의 관련성 가중치)
    const fieldScores = analyzableFields.map(({ field, title, type }) => {
      const values = panels.map((p: any) => p[field]).filter(v => v !== undefined && v !== null && v !== "");
      const validCount = values.length;
      const totalCount = panels.length;
      const coverage = validCount / totalCount; // 데이터 커버리지 (0~1)

      if (coverage < 0.3) {
        // 데이터가 30% 미만이면 의미없음
        return { field, title, type, score: 0, data: [] };
      }

      // 분포 다양성 계산 (entropy)
      const counts: Record<string, number> = {};
      values.forEach(v => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });

      const uniqueValues = Object.keys(counts).length;
      const entropy = -Object.values(counts).reduce((sum, count) => {
        const p = count / validCount;
        return sum + (p > 0 ? p * Math.log2(p) : 0);
      }, 0);

      // 점수 계산: 커버리지 * 엔트로피 * 고유값 수 (정규화)
      // 엔트로피는 최대 log2(uniqueValues)이므로 정규화
      const maxEntropy = uniqueValues > 1 ? Math.log2(uniqueValues) : 1;
      const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;
      
      // 고유값이 너무 많으면 (20개 이상) 시각화하기 어려움
      const uniquenessScore = uniqueValues > 20 ? 0.5 : (uniqueValues / 20);
      
      // 기본 점수
      let score = coverage * 0.4 + normalizedEntropy * 0.4 + uniquenessScore * 0.2;
      
      // 질의 관련성 가중치 추가 (질의에 언급된 필드는 점수 증가)
      if (queryRelevantFields.includes(field)) {
        score += 0.3; // 질의 관련 필드는 가중치 추가
        console.log(`[차트] 질의 관련 필드 발견: ${field}, 점수 증가`);
      }

      // 차트 데이터 생성
      let chartData: any[] = [];
      if (field === "age") {
        // 연령대별로 그룹화
        const ageGroups: Record<string, number> = {};
        values.forEach((age: number) => {
          let ageGroup: string;
          if (age < 20) ageGroup = "10대";
          else if (age < 30) ageGroup = "20대";
          else if (age < 40) ageGroup = "30대";
          else if (age < 50) ageGroup = "40대";
          else if (age < 60) ageGroup = "50대";
          else if (age < 70) ageGroup = "60대";
          else if (age < 80) ageGroup = "70대";
          else ageGroup = "80대 이상";
          ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
        });
        const ageOrder = ["10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대 이상"];
        chartData = Object.entries(ageGroups)
          .sort((a, b) => {
            const indexA = ageOrder.indexOf(a[0]);
            const indexB = ageOrder.indexOf(b[0]);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          })
          .map(([name, value]) => ({ name, value }));
      } else {
        // 일반 카테고리 분포
        chartData = Object.entries(counts)
          .sort((a, b) => b[1] - a[1]) // 빈도순 정렬
          .slice(0, 10) // 상위 10개만
          .map(([name, value]) => ({ name, value }));
      }

      return { field, title, type, score, data: chartData };
    });

    // 점수순으로 정렬하고 상위 2개 선택
    const topCharts = fieldScores
      .filter(item => item.score > 0 && item.data.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(({ field, title, type, data }) => ({ field, title, type, data }));

    return topCharts;
  };

  // LLM 추천 차트가 있으면 그것을 사용, 없으면 질의 기반으로 동적으로 선택
  let defaultCharts = ragCharts.length > 0 
    ? ragCharts 
    : findMeaningfulColumns(query || "");
  
  console.log(`[차트] 초기 차트 개수:`, defaultCharts.length);
  console.log(`[차트] 초기 차트 정보:`, defaultCharts.map(c => ({ title: c.title, type: c.type, dataLength: c.data?.length || 0 })));

  // LLM 추천 차트가 1개만 있으면 동적 차트에서 추가로 가져오기
  if (ragCharts.length > 0 && ragCharts.length < 2) {
    const dynamicCharts = findMeaningfulColumns(query || "");
    // 이미 ragCharts에 있는 필드는 제외하고 추가
    const existingFields = new Set(ragCharts.map(c => c.field || ""));
    const additionalCharts = dynamicCharts
      .filter(chart => !existingFields.has(chart.field || ""))
      .slice(0, 2 - ragCharts.length);
    defaultCharts = [...ragCharts, ...additionalCharts];
    console.log(`[차트] LLM 추천 차트 보완:`, defaultCharts.length, "개");
  }
  
  // 최소 2개가 되도록 보장
  if (defaultCharts.length < 2) {
    const dynamicCharts = findMeaningfulColumns(query || "");
    const existingFields = new Set(defaultCharts.map(c => c.field || ""));
    const additionalCharts = dynamicCharts
      .filter(chart => !existingFields.has(chart.field || ""))
      .slice(0, 2 - defaultCharts.length);
    defaultCharts = [...defaultCharts, ...additionalCharts];
    console.log(`[차트] 차트 개수 보완:`, defaultCharts.length, "개");
  }

  console.log(`[차트] 최종 차트 개수:`, defaultCharts.length);
  console.log(`[차트] 최종 차트 정보:`, defaultCharts.map(c => ({ title: c.title, type: c.type, dataLength: c.data?.length || 0 })));

  // 표시할 차트: 최소 2개, 최대 2개 (데이터가 있는 것만)
  const chartsToShow = defaultCharts
    .filter(chart => chart.data && chart.data.length > 0)
    .slice(0, 2); // 최대 2개

  // 고급 통계 (데이터 분석 페이지용 - 데이터분석 카드와 다른 통계)
  const hasRAGAnalysis = analysisResult && (analysisResult.insights.length > 0 || analysisResult.summary.key_insights.length > 0);
  
  const getAdvancedStats = () => {
    if (panels.length === 0) return [];
    
    const stats: Array<{ label: string; value: string; key: string }> = [];
    
    // 1. 자녀가 있는 패널 비율
    const withChildren = panels.filter(p => p.children_count && p.children_count > 0).length;
    if (withChildren > 0) {
      stats.push({
        label: "자녀 보유 비율",
        value: `${((withChildren / panels.length) * 100).toFixed(1)}%`,
        key: "children_ratio",
      });
    }
    
    // 2. 차량 보유 비율
    const withCar = panels.filter(p => p.car_ownership === "유" || String(p.car_ownership) === "true").length;
    if (withCar > 0) {
      stats.push({
        label: "차량 보유 비율",
        value: `${((withCar / panels.length) * 100).toFixed(1)}%`,
        key: "car_ownership_ratio",
      });
    }
    
    // 3. 평균 가족 수
    const familySizes = panels
      .map(p => p.family_members)
      .filter((v): v is number => v !== undefined && v !== null && typeof v === 'number');
    if (familySizes.length > 0) {
      const avgFamilySize = familySizes.reduce((sum, size) => sum + size, 0) / familySizes.length;
      stats.push({
        label: "평균 가족 수",
        value: `${avgFamilySize.toFixed(1)}명`,
        key: "avg_family_size",
      });
    }
    
    // 4. 음주 경험 비율
    const withDrinking = panels.filter(p => p.drinking_experience && p.drinking_experience.length > 0).length;
    if (withDrinking > 0) {
      stats.push({
        label: "음주 경험 비율",
        value: `${((withDrinking / panels.length) * 100).toFixed(1)}%`,
        key: "drinking_ratio",
      });
    }
    
    // 5. 전자제품 보유 평균 개수
    const electronicsCounts = panels
      .map(p => {
        if (p.owned_electronics) {
          if (typeof p.owned_electronics === 'string') {
            return p.owned_electronics.split(',').length;
          }
          if (Array.isArray(p.owned_electronics)) {
            return p.owned_electronics.length;
          }
        }
        return 0;
      })
      .filter(count => count > 0);
    if (electronicsCounts.length > 0) {
      const avgElectronics = electronicsCounts.reduce((sum, count) => sum + count, 0) / electronicsCounts.length;
      stats.push({
        label: "평균 전자제품 보유",
        value: `${avgElectronics.toFixed(1)}개`,
        key: "avg_electronics",
      });
    }
    
    // 6. 최빈 학력
    const educationLevels = panels.reduce((acc: Record<string, number>, p) => {
      const edu = p.education || "정보 없음";
      acc[edu] = (acc[edu] || 0) + 1;
      return acc;
    }, {});
    const topEducation = Object.entries(educationLevels)
      .sort((a, b) => b[1] - a[1])
      .filter(([edu]) => edu !== "정보 없음")[0];
    if (topEducation) {
      stats.push({
        label: "주요 학력",
        value: topEducation[0],
        key: "top_education",
      });
    }
    
    return stats;
  };
  
  const advancedStats = getAdvancedStats();

  return (
    <div className="space-y-6">
      {/* 고급 통계 카드 (분석 중에도 표시) */}
      {advancedStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>고급 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {advancedStats.map((stat) => {
                const getIcon = (key: string) => {
                  switch (key) {
                    case "children_ratio":
                      return <Users className="w-5 h-5" />;
                    case "car_ownership_ratio":
                      return <DollarSign className="w-5 h-5" />;
                    case "avg_family_size":
                      return <Users className="w-5 h-5" />;
                    case "drinking_ratio":
                      return <Heart className="w-5 h-5" />;
                    case "avg_electronics":
                      return <BarChart3 className="w-5 h-5" />;
                    case "top_education":
                      return <UserCheck className="w-5 h-5" />;
                    default:
                      return null;
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
          </CardContent>
        </Card>
      )}

      {/* 데이터 시각화 - 차트 생성 (위로 이동) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            데이터 시각화
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-12">
              <LoadingIndicator variant="centered" size="md" label="차트 생성 중..." />
            </div>
          ) : chartsToShow.length > 0 ? (
            <div className="space-y-6">
              <div className={`grid grid-cols-1 ${chartsToShow.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
                {chartsToShow.map((chart, index) => (
                  <div key={index} className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-1">{chart.title || `차트 ${index + 1}`}</h3>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      {renderChart(chart.type, chart.data, chart.title)}
                    </div>
                  </div>
                ))}
              </div>
              {chartsToShow.length < 2 && (
                <div className="text-center text-xs text-muted-foreground pt-2">
                  <p>추가 차트를 생성하려면 분석을 다시 실행하세요.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium mb-2">차트 데이터가 없습니다.</p>
              {!hasRAGAnalysis ? (
                <p className="text-xs">패널을 검색하면 자동으로 차트가 생성됩니다.</p>
              ) : (
                <p className="text-xs">LLM이 추천한 차트를 생성할 수 없습니다. 다른 검색어로 시도해보세요.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 분석 결과 (통합: 핵심 인사이트 + 상세 인사이트 + 추천사항 + 비교군) */}
      {!isAnalyzing && hasRAGAnalysis && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              상세 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DetailedRAGAnalysisDisplay analysisResult={analysisResult} />
            
            {/* 추천사항 및 비교군 (분석 코멘트에서 가져옴) */}
            {(() => {
              const recommendations = analysisResult.insights
                .filter(i => i.recommendation)
                .map(i => i.recommendation!)
                .slice(0, 3); // 최대 3개만
              
              const comparisonGroups = analysisResult.comparison_groups || [];
              
              if (recommendations.length === 0 && comparisonGroups.length === 0) {
                return null;
              }
              
              return (
                <>
                  {/* 추천사항 */}
                  {recommendations.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold">추천사항</span>
                      </div>
                      <div className="space-y-2">
                        {recommendations.map((recommendation, index) => (
                          <div key={index} className="text-sm pl-4 border-l-2 border-primary/30 py-1">
                            {recommendation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 비교군 추천 */}
                  {comparisonGroups.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold">비교군 추천</span>
                      </div>
                      <div className="space-y-2">
                        {comparisonGroups.map((group, index) => (
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
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 상세 분석 결과 표시 컴포넌트 (데이터 분석 페이지용 - 중복 제거)
function DetailedRAGAnalysisDisplay({ analysisResult }: { analysisResult: AnalysisResponse }) {
  const { summary, insights } = analysisResult;

  // 중복 제거 함수
  const removeDuplicates = (items: string[]): string[] => {
    const seen = new Set<string>();
    const normalized = items.map(item => item.trim().toLowerCase());
    
    return items.filter((item, index) => {
      const normalizedItem = normalized[index];
      if (seen.has(normalizedItem)) {
        return false;
      }
      
      for (const seenItem of seen) {
        if (normalizedItem.includes(seenItem) || seenItem.includes(normalizedItem)) {
          if (normalizedItem.length < seenItem.length) {
            return false;
          }
        }
      }
      
      seen.add(normalizedItem);
      return true;
    });
  };

  // key_insights와 notable_findings를 분리
  const uniqueKeyInsights = removeDuplicates(summary.key_insights || []);
  const uniqueNotableFindings = removeDuplicates(summary.notable_findings || []);
  
  // key_insights와 notable_findings를 합쳐서 중복 체크용으로 사용
  const allKeyFindings = [
    ...uniqueKeyInsights,
    ...uniqueNotableFindings
  ];

  // insights에서 key_insights와 notable_findings와 중복되지 않는 것만 필터링 (완화된 기준)
  const keyFindingTexts = allKeyFindings.map(i => i.trim().toLowerCase());
  const filteredInsights = insights.filter(insight => {
    const findingLower = insight.finding.trim().toLowerCase();
    // key_insights나 notable_findings와 완전히 동일한 경우만 제외 (부분 일치는 허용)
    // 너무 엄격한 필터링으로 인해 유용한 인사이트가 제거되는 것을 방지
    return !keyFindingTexts.some(keyFinding => {
      // 완전히 동일한 경우만 제외 (부분 포함은 허용)
      return findingLower === keyFinding || keyFinding === findingLower;
    });
  });

  return (
    <>
      {/* 핵심 인사이트 (key_insights만) */}
      {uniqueKeyInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">핵심 인사이트</span>
          </div>
          <div className="space-y-2">
            {uniqueKeyInsights.slice(0, 5).map((insight, idx) => (
              <div key={idx} className="text-sm pl-4 border-l-2 border-primary/30 py-1">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주요 발견사항 (notable_findings 별도 표시) */}
      {uniqueNotableFindings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">주요 발견사항</span>
          </div>
          <div className="space-y-2">
            {uniqueNotableFindings.map((finding, idx) => (
              <div key={idx} className="text-sm pl-4 border-l-2 border-primary/30 py-1">
                {finding}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상세 인사이트 (카테고리별 그룹화, 중복 제거된 insights만) */}
      {filteredInsights.length > 0 && (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">카테고리별 상세 인사이트</span>
            </div>
            
            {/* 카테고리별로 그룹화 */}
            {(() => {
              // 카테고리별로 인사이트 그룹화
              const groupedByCategory = filteredInsights.reduce((acc, insight) => {
                const category = insight.category || "기타";
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(insight);
                return acc;
              }, {} as Record<string, typeof filteredInsights>);

              // 카테고리 순서 정의
              const categoryOrder = [
                "demographics", "economic", "digital", "lifestyle",
                "health_wellness", "tech_digital_life", "consumption_finance",
                "travel_culture", "psychology_stress", "daily_habits", "values_experience"
              ];

              return (
                <div className="space-y-4">
                  {categoryOrder
                    .filter(cat => groupedByCategory[cat] && groupedByCategory[cat].length > 0)
                    .map((category, catIdx) => (
                      <div key={category} className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                category === "demographics" || category === "economic" ? "default" :
                                category === "digital" || category === "lifestyle" ? "secondary" :
                                "outline"
                              }
                              className="text-xs font-semibold"
                            >
                              {getCategoryName(category)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {groupedByCategory[category].length}개 인사이트
                            </span>
                          </div>
                          
                          <div className="space-y-3 pl-2">
                            {groupedByCategory[category].map((insight, idx) => (
                              <div key={idx} className="space-y-2 p-3 rounded-lg border bg-card">
                                <p className="text-sm text-foreground leading-relaxed">
                                  {insight.finding}
                                </p>
                                {insight.business_implication && (
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {insight.business_implication}
                                  </p>
                                )}
                                {insight.recommendation && (
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {insight.recommendation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            })()}
          </div>
      )}
    </>
  );
}
