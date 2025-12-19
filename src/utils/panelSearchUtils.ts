import { PanelData, getAgeGroup, fieldLabels } from "./mockPanelData";

// 검색어 분석 결과
export interface QueryAnalysis {
  attributes: string[]; // 질의된 속성들 (age, gender, smoking, etc.)
  values: Record<string, any>; // 속성별 값
  keywords: string[]; // 검색 키워드
}

// 검색어 분석
export function analyzeQuery(query: string): QueryAnalysis {
  const queryLower = query.toLowerCase();
  const attributes: string[] = [];
  const values: Record<string, any> = {};
  const keywords: string[] = [];

  // 나이대
  if (queryLower.includes("20대")) {
    attributes.push("age");
    values.age = "20대";
    keywords.push("20대");
  }
  if (queryLower.includes("30대")) {
    attributes.push("age");
    values.age = "30대";
    keywords.push("30대");
  }
  if (queryLower.includes("40대")) {
    attributes.push("age");
    values.age = "40대";
    keywords.push("40대");
  }
  if (queryLower.includes("50대")) {
    attributes.push("age");
    values.age = "50대";
    keywords.push("50대");
  }

  // 성별
  if (queryLower.includes("남성")) {
    attributes.push("gender");
    values.gender = "남성";
    keywords.push("남성");
  }
  if (queryLower.includes("여성")) {
    attributes.push("gender");
    values.gender = "여성";
    keywords.push("여성");
  }

  // 흡연
  if (queryLower.includes("흡연") && !queryLower.includes("비흡연")) {
    attributes.push("smoking");
    values.smoking = true;
    keywords.push("흡연");
  }
  if (queryLower.includes("비흡연")) {
    attributes.push("smoking");
    values.smoking = false;
    keywords.push("비흡연");
  }

  // OTT
  if (queryLower.includes("ott")) {
    attributes.push("ott_service");
    values.ott_service = true;
    keywords.push("OTT");
  }

  // 지역
  const regions = ["서울", "부산", "인천", "대구", "광주", "대전"];
  regions.forEach(region => {
    if (queryLower.includes(region)) {
      attributes.push("region_city");
      values.region_city = region;
      keywords.push(region);
    }
  });

  // 세부 지역구
  const districts = ["강남구", "서초구", "송파구", "마포구", "용산구", "해운대구", "유성구"];
  districts.forEach(district => {
    if (queryLower.includes(district)) {
      attributes.push("region_district");
      values.region_district = district;
      keywords.push(district);
    }
  });

  // 결혼 상태
  if (queryLower.includes("기혼")) {
    attributes.push("marital_status");
    values.marital_status = "기혼";
    keywords.push("기혼");
  }
  if (queryLower.includes("미혼")) {
    attributes.push("marital_status");
    values.marital_status = "미혼";
    keywords.push("미혼");
  }
  // "기타"는 결혼 상태 맥락에서만 처리 (다른 필드의 "기타"와 구분)
  // "결혼상태가 기타", "기타 결혼", "결혼 기타" 등의 패턴 인식
  if (queryLower.includes("기타") && 
      (queryLower.includes("결혼") || queryLower.includes("결혼상태") || queryLower.includes("결혼 상태") ||
       queryLower.includes("결혼상태가 기타") || queryLower.includes("기타인 패널") || queryLower.includes("기타인 사람"))) {
    attributes.push("marital_status");
    values.marital_status = "기타";
    keywords.push("기타");
  }

  // 직업
  const jobs = ["회사원", "전문직", "자영업", "학생", "프리랜서", "임원"];
  jobs.forEach(job => {
    if (queryLower.includes(job)) {
      attributes.push("job");
      values.job = job;
      keywords.push(job);
    }
  });

  // 휴대폰 브랜드
  if (queryLower.includes("아이폰") || queryLower.includes("애플")) {
    attributes.push("phone_brand");
    values.phone_brand = "애플";
    keywords.push("아이폰");
  }
  if (queryLower.includes("삼성") || queryLower.includes("갤럭시")) {
    attributes.push("phone_brand");
    values.phone_brand = "삼성";
    keywords.push("삼성");
  }

  // 차량
  if (queryLower.includes("차량") || queryLower.includes("자동차")) {
    if (queryLower.includes("소유") || !queryLower.includes("미소유")) {
      attributes.push("car_ownership");
      values.car_ownership = "유";
      keywords.push("차량 소유");
    }
    if (queryLower.includes("미소유")) {
      attributes.push("car_ownership");
      values.car_ownership = "무";
      keywords.push("차량 미소유");
    }
  }

  // 음주
  if (queryLower.includes("음주")) {
    attributes.push("drinking_experience");
    keywords.push("음주");
  }

  return {
    attributes: Array.from(new Set(attributes)),
    values,
    keywords,
  };
}

export function searchPanels(panels: PanelData[], query: string): PanelData[] {
  if (!query.trim()) {
    return panels;
  }

  const queryLower = query.toLowerCase();
  
  return panels.filter((panel) => {
    let match = true;

    // 나이대 검색
    if (queryLower.includes("20대")) {
      match = match && getAgeGroup(panel.age) === "20대";
    }
    if (queryLower.includes("30대")) {
      match = match && getAgeGroup(panel.age) === "30대";
    }
    if (queryLower.includes("40대")) {
      match = match && getAgeGroup(panel.age) === "40대";
    }
    if (queryLower.includes("50대")) {
      match = match && getAgeGroup(panel.age) === "50대 이상";
    }

    // 성별 검색
    if (queryLower.includes("남성")) {
      match = match && panel.gender === "남성";
    }
    if (queryLower.includes("여성")) {
      match = match && panel.gender === "여성";
    }

    // 흡연 검색
    if (queryLower.includes("흡연") && !queryLower.includes("비흡연")) {
      match = match && panel.smoking === true;
    }
    if (queryLower.includes("비흡연")) {
      match = match && panel.smoking === false;
    }

    // OTT 검색
    if (queryLower.includes("ott")) {
      match = match && panel.ott_service === true;
    }

    // 지역 검색
    const regions = ["서울", "부산", "인천", "대구", "광주", "대전"];
    regions.forEach(region => {
      if (queryLower.includes(region)) {
        match = match && panel.region_city === region;
      }
    });

    // 세부 지역구
    const districts = ["강남구", "서초구", "송파구", "마포구", "용산구", "해운대구", "유성구", "남동구", "연수구"];
    districts.forEach(district => {
      if (queryLower.includes(district)) {
        match = match && panel.region_district === district;
      }
    });

    // 결혼 상태
    if (queryLower.includes("기혼")) {
      match = match && panel.marital_status === "기혼";
    }
    if (queryLower.includes("미혼")) {
      match = match && panel.marital_status === "미혼";
    }
    // "기타"는 결혼 상태 맥락에서만 처리 (다른 필드의 "기타"와 구분)
    if (queryLower.includes("기타") && 
        (queryLower.includes("결혼") || queryLower.includes("결혼상태") || queryLower.includes("결혼 상태") ||
         queryLower.includes("결혼상태가 기타") || queryLower.includes("기타인 패널") || queryLower.includes("기타인 사람"))) {
      match = match && panel.marital_status === "기타";
    }

    // 직업
    const jobs = ["회사원", "전문직", "자영업", "학생", "프리랜서", "임원"];
    jobs.forEach(job => {
      if (queryLower.includes(job)) {
        match = match && (panel.job === job || panel.occupation === job);
      }
    });

    // 휴대폰 브랜드
    if (queryLower.includes("아이폰") || queryLower.includes("애플")) {
      match = match && panel.phone_brand === "애플";
    }
    if (queryLower.includes("삼성") || queryLower.includes("갤럭시")) {
      match = match && panel.phone_brand === "삼성";
    }

    // 차량
    if (queryLower.includes("차량") || queryLower.includes("자동차")) {
      if (queryLower.includes("소유") && !queryLower.includes("미소유")) {
        match = match && panel.car_ownership === "유";
      }
      if (queryLower.includes("미소유")) {
        match = match && panel.car_ownership === "무";
      }
    }

    return match;
  });
}

// 동적 통계 항목
export interface DynamicStat {
  label: string;
  value: string;
  key: string;
}

export function analyzePanels(panels: PanelData[]) {
  if (panels.length === 0) {
    return {
      total: 0,
      smokingRate: 0,
      ottRate: 0,
      maleCount: 0,
      femaleCount: 0,
      ageDistribution: {},
    };
  }

  const smokingCount = panels.filter(p => p.smoking).length;
  const ottCount = panels.filter(p => p.ott_service).length;
  const maleCount = panels.filter(p => p.gender === "남성").length;
  const femaleCount = panels.filter(p => p.gender === "여성").length;

  const ageDistribution: Record<string, number> = {};
  panels.forEach(panel => {
    const ageGroup = getAgeGroup(panel.age);
    ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
  });

  return {
    total: panels.length,
    smokingRate: (smokingCount / panels.length) * 100,
    ottRate: (ottCount / panels.length) * 100,
    maleCount,
    femaleCount,
    ageDistribution,
  };
}

// 검색어에 따른 동적 통계 생성
export function getDynamicStats(panels: PanelData[], query: string): DynamicStat[] {
  if (panels.length === 0) {
    return [];
  }

  const stats: DynamicStat[] = [];
  const analysis = analyzePanels(panels);
  const queryAnalysis = analyzeQuery(query);

  // 총 패널 수는 항상 표시
  stats.push({
    label: "총 패널 수",
    value: `${analysis.total}명`,
    key: "total",
  });

  // 평균 나이는 항상 표시 (null 값 제외)
  const validAges = panels
    .map(p => p.age)
    .filter((age): age is number => age !== undefined && age !== null && typeof age === 'number');
  
  if (validAges.length > 0) {
    const avgAge = validAges.reduce((sum, age) => sum + age, 0) / validAges.length;
    stats.push({
      label: "평균 나이",
      value: `${avgAge.toFixed(1)}세`,
      key: "avg_age",
    });
  }

  // 성별 분포는 항상 표시
  stats.push({
    label: "성별 분포",
    value: `남성 ${analysis.maleCount}명 / 여성 ${analysis.femaleCount}명`,
    key: "gender",
  });

  // 결혼 여부 분포 (항상 표시)
  const married = panels.filter(p => p.marital_status === "기혼").length;
  const single = panels.filter(p => p.marital_status === "미혼").length;
  const other = panels.filter(p => p.marital_status === "기타").length;
  const maritalStatusParts = [];
  if (married > 0) maritalStatusParts.push(`기혼 ${married}명`);
  if (single > 0) maritalStatusParts.push(`미혼 ${single}명`);
  if (other > 0) maritalStatusParts.push(`기타 ${other}명`);
  stats.push({
    label: "결혼 여부",
    value: maritalStatusParts.length > 0 ? maritalStatusParts.join(" / ") : "데이터 없음",
    key: "marital_status",
  });

  // 평균 가구소득 (가능한 경우)
  const householdIncomes = panels
    .map(p => {
      const income = p.monthly_household_income;
      if (!income) return null;
      
      // "월 300~399만원" 형식에서 범위 추출
      const rangeMatch = income.match(/(\d+)~(\d+)/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        return (min + max) / 2; // 범위의 중간값 (만원 단위)
      }
      
      // "월 100만원 미만" 형식
      if (income.includes("100만원 미만")) {
        return 50; // 대략 50만원으로 추정
      }
      
      // "월 1000만원 이상" 형식
      if (income.includes("1000만원 이상")) {
        return 1200; // 대략 1200만원으로 추정
      }
      
      // 단일 숫자 추출 시도
      const singleMatch = income.match(/(\d+)/);
      if (singleMatch) {
        return parseInt(singleMatch[1]);
      }
      
      return null;
    })
    .filter((v): v is number => v !== null);
  
  if (householdIncomes.length > 0) {
    const avgHouseholdIncome = householdIncomes.reduce((sum, v) => sum + v, 0) / householdIncomes.length;
    // 만원 단위를 천원 단위로 표시 (더 읽기 쉽게)
    const displayValue = avgHouseholdIncome >= 1000 
      ? `${(avgHouseholdIncome / 1000).toFixed(1)}천만원`
      : `${Math.round(avgHouseholdIncome)}만원`;
    
    stats.push({
      label: "평균 가구소득",
      value: displayValue,
      key: "avg_household_income",
    });
  }

  // 주요 거주지역 (시/도 단위, 항상 표시)
  const regions = panels.reduce((acc: Record<string, number>, p) => {
    const region = p.region_city || "기타";
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
  const topRegions = Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2); // 상위 2개 지역
  
  if (topRegions.length > 0) {
    const regionText = topRegions.map(([region, count]) => `${region} ${count}명`).join(" / ");
    stats.push({
      label: "주요 거주지역",
      value: regionText,
      key: "region",
    });
  }

  // 학력 분포 (항상 표시)
  const educationLevels = panels.reduce((acc: Record<string, number>, p) => {
    const education = p.education || p.education_level || "정보 없음";
    if (education && education !== "정보 없음") {
      acc[education] = (acc[education] || 0) + 1;
    }
    return acc;
  }, {});
  const topEducation = Object.entries(educationLevels)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2); // 상위 2개 학력
  
  if (topEducation.length > 0) {
    const educationText = topEducation.map(([edu, count]) => `${edu} ${count}명`).join(" / ");
    stats.push({
      label: "주요 학력",
      value: educationText,
      key: "education",
    });
  }

  // 자녀 수 통계 (항상 표시)
  const childrenCounts = panels
    .map(p => p.children_count)
    .filter((count): count is number => count !== undefined && count !== null && typeof count === 'number');
  
  if (childrenCounts.length > 0) {
    const avgChildren = childrenCounts.reduce((sum, count) => sum + count, 0) / childrenCounts.length;
    const noChildren = childrenCounts.filter(c => c === 0).length;
    const hasChildren = childrenCounts.length - noChildren;
    
    stats.push({
      label: "자녀 수",
      value: `평균 ${avgChildren.toFixed(1)}명 (자녀 있음 ${hasChildren}명 / 없음 ${noChildren}명)`,
      key: "children",
    });
  }

  // 직업 관련 통계
  if (queryAnalysis.attributes.includes("job")) {
    const jobs = panels.reduce((acc: Record<string, number>, p) => {
      const job = p.job || p.occupation || "기타";
      acc[job] = (acc[job] || 0) + 1;
      return acc;
    }, {});
    const topJob = Object.entries(jobs).sort((a, b) => b[1] - a[1])[0];
    if (topJob) {
      stats.push({
        label: "주요 직업",
        value: `${topJob[0]} (${topJob[1]}명)`,
        key: "job",
      });
    }
  }

  // 휴대폰 브랜드 관련 통계
  if (queryAnalysis.attributes.includes("phone_brand")) {
    const appleCount = panels.filter(p => p.phone_brand === "애플").length;
    const samsungCount = panels.filter(p => p.phone_brand === "삼성").length;
    stats.push({
      label: "휴대폰 브랜드",
      value: `애플 ${appleCount}명 / 삼성 ${samsungCount}명`,
      key: "phone_brand",
    });
  }

  // 차량 관련 통계
  if (queryAnalysis.attributes.includes("car_ownership")) {
    const carOwners = panels.filter(p => p.car_ownership === "유").length;
    const carRate = (carOwners / panels.length) * 100;
    stats.push({
      label: "차량 소유율",
      value: `${carRate.toFixed(1)}%`,
      key: "car_ownership",
    });

    // 차량 브랜드 분석
    const manufacturers = panels.filter(p => p.car_manufacturer).map(p => p.car_manufacturer);
    if (manufacturers.length > 0) {
      const topManufacturer = manufacturers.reduce((acc: Record<string, number>, mfr) => {
        if (mfr) {
          acc[mfr] = (acc[mfr] || 0) + 1;
        }
        return acc;
      }, {});
      const mostCommon = Object.entries(topManufacturer).sort((a, b) => b[1] - a[1])[0];
      if (mostCommon) {
        stats.push({
          label: "주요 차량 브랜드",
          value: mostCommon[0],
          key: "car_brand",
        });
      }
    }
  }

  // 음주 관련 통계
  if (queryAnalysis.attributes.includes("drinking_experience")) {
    const drinkingPatterns = panels.reduce((acc: Record<string, number>, p) => {
      const pattern = p.drinking_experience || "정보 없음";
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {});
    const topPattern = Object.entries(drinkingPatterns).sort((a, b) => b[1] - a[1])[0];
    if (topPattern && topPattern[0] !== "정보 없음") {
      stats.push({
        label: "주요 음주 패턴",
        value: `${topPattern[0]} (${topPattern[1]}명)`,
        key: "drinking",
      });
    }
  }

  // 소득 관련 통계
  if (query.toLowerCase().includes("소득") || query.toLowerCase().includes("수입")) {
    const incomes = panels.reduce((acc: Record<string, number>, p) => {
      const income = p.monthly_personal_income || "정보 없음";
      acc[income] = (acc[income] || 0) + 1;
      return acc;
    }, {});
    const topIncome = Object.entries(incomes).sort((a, b) => b[1] - a[1])[0];
    if (topIncome && topIncome[0] !== "정보 없음") {
      stats.push({
        label: "주요 소득 구간",
        value: topIncome[0],
        key: "income",
      });
    }
  }

  return stats.slice(0, 6); // 최대 6개 통계만 표시
}

// 스마트한 연관 패널 추천 (데이터 기반)
export function getRelatedPanelQueries(currentQuery: string, panels?: PanelData[]): string[] {
  try {
    if (!panels || panels.length === 0) {
      return [];
    }

    if (!currentQuery || !currentQuery.trim()) {
      return [];
    }

    const queries: string[] = [];
    const queryAnalysis = analyzeQuery(currentQuery);

    // 현재 패널 그룹의 특성 분석 (안전하게)
    const validAges = panels.filter(p => p.age && p.age > 0).map(p => p.age);
    const avgAge = validAges.length > 0 
      ? validAges.reduce((sum, age) => sum + age, 0) / validAges.length 
      : 0;
    const ageGroup = avgAge > 0 ? getAgeGroup(Math.round(avgAge)) : "20대";
    
    const maleCount = panels.filter(p => p.gender === "남성").length;
    const femaleCount = panels.filter(p => p.gender === "여성").length;
    const mainGender = maleCount > femaleCount ? "남성" : femaleCount > 0 ? "여성" : "남성";
    const oppositeGender = mainGender === "남성" ? "여성" : "남성";

    const marriedCount = panels.filter(p => p.marital_status === "기혼").length;
    const singleCount = panels.filter(p => p.marital_status === "미혼").length;
    const mainMarital = marriedCount > singleCount ? "기혼" : singleCount > 0 ? "미혼" : "기혼";
    const oppositeMarital = mainMarital === "기혼" ? "미혼" : "기혼";

    // 지역 분포 분석
    const regionCounts: Record<string, number> = {};
    panels.forEach(p => {
      const region = p.region_city || "";
      if (region && region.trim()) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });
    const topRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([region]) => region);

    // 1. 유사 패널 추천 (단일 속성 추가/변경)
    // 성별이 없으면 추가, 있으면 반전
    if (!queryAnalysis.attributes.includes("gender")) {
      queries.push(`${currentQuery} ${mainGender}`);
    } else {
      const replaced = currentQuery.replace(/남성|여성/gi, oppositeGender);
      if (replaced !== currentQuery) {
        queries.push(replaced);
      }
    }

    // 결혼 여부가 없으면 추가, 있으면 반전
    if (!queryAnalysis.attributes.includes("marital_status")) {
      queries.push(`${currentQuery} ${mainMarital}`);
    } else {
      const replaced = currentQuery.replace(/기혼|미혼/g, oppositeMarital);
      if (replaced !== currentQuery) {
        queries.push(replaced);
      }
    }

    // 나이대 변형 (인접 나이대)
    if (!queryAnalysis.attributes.includes("age") && avgAge > 0) {
      queries.push(`${currentQuery} ${ageGroup}`);
    } else if (queryAnalysis.values.age) {
      const ageGroups = ["20대", "30대", "40대", "50대"];
      const currentAgeGroup = queryAnalysis.values.age;
      const currentIndex = ageGroups.indexOf(currentAgeGroup);
      if (currentIndex > 0) {
        const replaced = currentQuery.replace(new RegExp(currentAgeGroup, "g"), ageGroups[currentIndex - 1]);
        if (replaced !== currentQuery) {
          queries.push(replaced);
        }
      }
      if (currentIndex >= 0 && currentIndex < ageGroups.length - 1) {
        const replaced = currentQuery.replace(new RegExp(currentAgeGroup, "g"), ageGroups[currentIndex + 1]);
        if (replaced !== currentQuery) {
          queries.push(replaced);
        }
      }
    }

    // 지역 변형 (주요 지역이 1개면 다른 지역 추천)
    if (topRegions.length > 0 && !queryAnalysis.attributes.includes("region_city")) {
      const mainRegion = topRegions[0];
      const otherRegions = ["서울", "부산", "인천", "대구", "광주", "대전", "경기"];
      const otherRegion = otherRegions.find(r => r !== mainRegion && !topRegions.includes(r));
      if (otherRegion) {
        queries.push(`${currentQuery} ${otherRegion}`);
      }
    } else if (queryAnalysis.values.region_city) {
      const otherRegions = ["서울", "부산", "인천", "대구", "광주", "대전", "경기"];
      const otherRegion = otherRegions.find(r => r !== queryAnalysis.values.region_city);
      if (otherRegion) {
        const replaced = currentQuery.replace(queryAnalysis.values.region_city, otherRegion);
        if (replaced !== currentQuery) {
          queries.push(replaced);
        }
      }
    }

    // 중복 제거 및 빈 문자열 제거
    const uniqueQueries = Array.from(new Set(queries.filter(q => q.trim() && q !== currentQuery)));
    
    // 최대 5개만 반환 (유사 패널 우선)
    return uniqueQueries.slice(0, 5);
  } catch (error) {
    console.error("연관 패널 추천 오류:", error);
    return [];
  }
}

/**
 * CSV 값 이스케이프 (쉼표, 따옴표, 줄바꿈 처리)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  const str = String(value);
  
  // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 이중화
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * 배열 또는 문자열을 CSV 형식으로 변환
 */
function formatArrayField(value: string[] | string | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) {
    return value.join("; "); // 배열은 세미콜론으로 구분
  }
  return String(value);
}

export function exportToCSV(panels: PanelData[]): string {
  // 한글 헤더 정의 (모든 필드 포함)
  const headers = [
    "패널 ID",
    "성별",
    "나이",
    "거주 도시",
    "거주 구",
    "지역",
    "결혼 상태",
    "자녀 수",
    "가족 구성원",
    "학력",
    "직업",
    "월 개인 소득",
    "월 가구 소득",
    "소득 수준",
    "휴대폰 브랜드",
    "휴대폰 모델",
    "차량 소유",
    "차량 제조사",
    "차량 모델",
    "보유 전자제품",
    "흡연 경험",
    "흡연 브랜드",
    "궐련형 전자담배",
    "액상형 전자담배",
    "음주 경험",
    "요약 텍스트",
    "검색 정확도",
    "벡터 점수",
    "FTS 점수",
    "RRF 점수",
    "매칭된 필드",
    "매칭된 세그먼트",
    "검색 소스",
  ];

  // 헤더에 대응하는 필드명
  const fieldNames = [
    "panel_uid",
    "gender",
    "age",
    "region_city",
    "region_district",
    "region",
    "marital_status",
    "children_count",
    "family_members",
    "education",
    "occupation",
    "monthly_personal_income",
    "monthly_household_income",
    "income_level",
    "phone_brand",
    "phone_model",
    "car_ownership",
    "car_manufacturer",
    "car_model",
    "owned_electronics",
    "smoking_experience",
    "smoking_brand",
    "e_cig_heated_brand",
    "e_cig_liquid_brand",
    "drinking_experience",
    "panel_summary_text",
    "accuracy_score",
    "vector_score",
    "fts_score",
    "rrf_score",
    "matched_fields",
    "matched_segments",
    "search_source",
  ];

  // 각 패널을 CSV 행으로 변환
  const rows = panels.map(panel => {
    return fieldNames.map(fieldName => {
      const value = (panel as any)[fieldName];
      
      // 배열 필드 처리
      if (fieldName === "owned_electronics" || 
          fieldName === "smoking_experience" || 
          fieldName === "smoking_brand" ||
          fieldName === "e_cig_heated_brand" ||
          fieldName === "e_cig_liquid_brand" ||
          fieldName === "drinking_experience" ||
          fieldName === "matched_fields" ||
          fieldName === "matched_segments") {
        return escapeCSVValue(formatArrayField(value));
      }
      
      // 숫자 필드 처리
      if (fieldName === "age" || 
          fieldName === "children_count" || 
          fieldName === "family_members" ||
          fieldName === "accuracy_score" ||
          fieldName === "vector_score" ||
          fieldName === "fts_score" ||
          fieldName === "rrf_score") {
        return value !== null && value !== undefined ? String(value) : "";
      }
      
      // 불린 필드 처리 (기존 호환성)
      if (fieldName === "car_ownership" && typeof value === "boolean") {
        return value ? "유" : "무";
      }
      
      // 일반 문자열 필드
      return escapeCSVValue(value);
    });
  });

  // CSV 내용 생성
  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return csvContent;
}

export function downloadCSV(panels: PanelData[], filename: string = "panel_data.csv") {
  const csvContent = exportToCSV(panels);
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface AnalysisComment {
  insights: string[];
  observations: string[];
  recommendations: string[];
}

export function generateAnalysisComments(panels: PanelData[], query?: string): AnalysisComment {
  if (panels.length === 0) {
    return {
      insights: [],
      observations: [],
      recommendations: [],
    };
  }

  const analysis = analyzePanels(panels);
  const insights: string[] = [];
  const observations: string[] = [];
  const recommendations: string[] = [];

  // 표본 크기 분석
  if (analysis.total < 10) {
    observations.push(`표본 크기가 ${analysis.total}명으로 작아 통계적 신뢰도가 제한적일 수 있습니다.`);
  } else if (analysis.total >= 30) {
    insights.push(`총 ${analysis.total}명의 충분한 표본으로 통계적으로 의미있는 분석이 가능합니다.`);
  }

  // 성별 분포 분석
  const genderRatio = analysis.maleCount / (analysis.femaleCount || 1);
  if (genderRatio > 2) {
    observations.push(`남성 비율(${((analysis.maleCount / analysis.total) * 100).toFixed(1)}%)이 높아 성별 편향이 있을 수 있습니다.`);
    recommendations.push("여성 패널 확보를 통해 성별 균형을 맞추는 것을 권장합니다.");
  } else if (genderRatio < 0.5) {
    observations.push(`여성 비율(${((analysis.femaleCount / analysis.total) * 100).toFixed(1)}%)이 높아 성별 편향이 있을 수 있습니다.`);
    recommendations.push("남성 패널 확보를 통해 성별 균형을 맞추는 것을 권장합니다.");
  } else {
    insights.push(`남성 ${analysis.maleCount}명, 여성 ${analysis.femaleCount}명으로 성별 분포가 비교적 균형적입니다.`);
  }

  // 흡연율 분석
  if (analysis.smokingRate > 70) {
    insights.push(`흡연율이 ${analysis.smokingRate.toFixed(1)}%로 매우 높은 편입니다. 흡연자를 타겟으로 한 설문에 적합합니다.`);
  } else if (analysis.smokingRate < 30) {
    insights.push(`흡연율이 ${analysis.smokingRate.toFixed(1)}%로 낮은 편입니다. 비흡연자 대상 연구에 적합합니다.`);
  } else {
    insights.push(`흡연율이 ${analysis.smokingRate.toFixed(1)}%로 흡연자와 비흡연자가 적절히 혼합되어 있습니다.`);
  }

  // OTT 이용률 분석
  if (analysis.ottRate > 80) {
    insights.push(`OTT 서비스 이용률이 ${analysis.ottRate.toFixed(1)}%로 매우 높습니다. 디지털 콘텐츠 소비에 적극적인 그룹입니다.`);
  } else if (analysis.ottRate < 40) {
    observations.push(`OTT 서비스 이용률이 ${analysis.ottRate.toFixed(1)}%로 낮습니다. 전통적인 미디어 선호 그룹일 수 있습니다.`);
  }

  // 연령대 분포 분석
  const dominantAgeGroup = Object.entries(analysis.ageDistribution)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantAgeGroup) {
    const dominantPercentage = (dominantAgeGroup[1] / analysis.total) * 100;
    if (dominantPercentage > 60) {
      observations.push(`${dominantAgeGroup[0]}가 ${dominantPercentage.toFixed(1)}%로 과대 대표되어 있습니다.`);
      recommendations.push("다양한 연령대의 패널을 확보하여 연령 편향을 줄이는 것을 고려해보세요.");
    } else {
      insights.push(`${dominantAgeGroup[0]}가 ${dominantPercentage.toFixed(1)}%로 가장 많으나, 연령대 분포가 다양합니다.`);
    }
  }

  // 쿼리 기반 인사이트
  if (query) {
    const queryLower = query.toLowerCase();
    if (queryLower.includes("흡연") && queryLower.includes("ott")) {
      insights.push("흡연자이면서 OTT를 이용하는 패널로, 현대적인 라이프스타일과 전통적 습관이 공존하는 그룹입니다.");
    }
    if (queryLower.includes("20대") || queryLower.includes("30대")) {
      recommendations.push("젊은 연령층 대상의 디지털 마케팅이나 온라인 캠페인이 효과적일 것입니다.");
    }
  }

  // 지역 분석
  const seoulCount = panels.filter(p => p.region === "서울").length;
  const seoulRate = (seoulCount / analysis.total) * 100;
  if (seoulRate > 70) {
    observations.push(`서울 거주자가 ${seoulRate.toFixed(1)}%로 수도권 중심의 표본입니다.`);
    recommendations.push("지역 대표성을 위해 지방 패널 확보를 고려해보세요.");
  }

  return {
    insights,
    observations,
    recommendations,
  };
}
