/**
 * 카테고리 이름 매핑 (백엔드 category_groups.json과 동기화)
 */
export const CATEGORY_NAMES: Record<string, string> = {
  demographics: "인구통계",
  economic: "경제력",
  digital: "디지털",
  lifestyle: "라이프스타일",
  summary: "요약",
  health_wellness: "건강/신체관리",
  tech_digital_life: "기술 및 디지털 라이프",
  consumption_finance: "소비 및 재테크",
  travel_culture: "여행 및 문화생활",
  psychology_stress: "심리 및 스트레스 관리",
  daily_habits: "일상생활 태도 및 습관",
  values_experience: "경험 및 가치관",
};

/**
 * 카테고리 이름 가져오기 (한글)
 */
export function getCategoryName(category: string): string {
  return CATEGORY_NAMES[category] || category;
}

