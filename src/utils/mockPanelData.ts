export interface SurveyResponse {
  question: string;
  answer: string;
  category: string;
}

export interface PanelData {
  panel_uid: string;
  gender: "남성" | "여성";
  age: number;
  // LLM 요약 텍스트 (백엔드 panels.panel_summary_text)
  panel_summary_text?: string;
  // 검색 정확도 정보 (새로 추가)
  accuracy_score?: number;  // 종합 정확도 점수 (0.0 ~ 1.0)
  vector_score?: number;    // 벡터 검색 유사도 점수
  fts_score?: number;       // FTS 검색 점수
  rrf_score?: number;       // RRF 통합 점수
  matched_fields?: string[]; // 매칭된 정형 필드 목록
  matched_segments?: string[]; // 매칭된 비정형 세그먼트 목록
  search_source?: string;   // 검색 소스 (structured/unstructured/hybrid)
  // 기본 정보
  region_city?: string;
  region_district?: string;
  region?: string; // 기존 호환성을 위해 유지
  marital_status?: string;
  children_count?: number;
  family_members?: number;
  education?: string;
  job?: string;
  occupation?: string; // 기존 호환성을 위해 유지
  monthly_personal_income?: string;
  monthly_household_income?: string;
  income_level?: string; // 기존 호환성을 위해 유지
  phone_brand?: string;
  phone_model?: string;
  car_ownership?: string;
  car_manufacturer?: string;
  car_model?: string;
  // 배열 필드들 (백엔드 응답과 일치)
  owned_electronics?: string[] | string;  // 배열 또는 문자열 허용 (하위 호환성)
  smoking_experience?: string[] | string;
  smoking?: boolean; // 기존 호환성을 위해 유지
  smoking_brand?: string[] | string;  // 배열 또는 문자열
  e_cig_heated_brand?: string[] | string;  // 배열 또는 문자열
  e_cig_liquid_brand?: string[] | string;  // 배열 또는 문자열
  // 하위 호환성을 위한 필드 (기존 코드용)
  smoking_brands?: string;
  heated_tobacco_brands?: string;
  liquid_ecig_brands?: string;
  drinking_experience?: string[] | string;
  ott_service?: boolean; // 기존 호환성을 위해 유지
  survey_responses?: SurveyResponse[];
}

// 필드명의 한국어 라벨 매핑
export const fieldLabels: Record<string, string> = {
  panel_uid: "패널 ID",
  gender: "성별",
  age: "나이",
  panel_summary_text: "요약",
  region_city: "거주 도시",
  region_district: "거주 구",
  region: "지역",
  marital_status: "결혼 상태",
  children_count: "자녀 수",
  family_members: "가족 구성원",
  education: "학력",
  job: "직업",
  occupation: "직업",
  monthly_personal_income: "월 개인 소득",
  monthly_household_income: "월 가구 소득",
  income_level: "소득 수준",
  phone_brand: "휴대폰 브랜드",
  phone_model: "휴대폰 모델",
  car_ownership: "차량 소유",
  car_manufacturer: "차량 제조사",
  car_model: "차량 모델",
  owned_electronics: "보유 전자제품",
  smoking_experience: "흡연 경험",
  smoking: "흡연 여부",
  smoking_brands: "흡연 브랜드",
  heated_tobacco_brands: "궐련형 전자담배",
  liquid_ecig_brands: "액상형 전자담배",
  drinking_experience: "음주 경험",
  ott_service: "OTT 서비스",
};

export const mockPanelData: PanelData[] = [
  { 
    panel_uid: "P001", 
    age: 25, 
    gender: "남성",
    region_city: "서울",
    region_district: "강남구",
    region: "서울",
    marital_status: "미혼",
    children_count: 0,
    family_members: 1,
    education: "대졸",
    job: "회사원",
    occupation: "회사원",
    monthly_personal_income: "300-400만원",
    monthly_household_income: "300-400만원",
    income_level: "중",
    phone_brand: "삼성",
    phone_model: "갤럭시 S23",
    car_ownership: "무",
    owned_electronics: "노트북, 태블릿, 스마트워치",
    smoking_experience: "현재 흡연",
    smoking: true,
    smoking_brands: "말보로",
    heated_tobacco_brands: "아이코스",
    drinking_experience: "소주, 맥주",
    ott_service: true,
    survey_responses: [
      { question: "선호하는 OTT 서비스", answer: "넷플릭스", category: "엔터테인먼트" },
      { question: "주간 OTT 이용 시간", answer: "10시간 이상", category: "엔터테인먼트" },
      { question: "선호하는 콘텐츠 장르", answer: "드라마, 예능", category: "엔터테인먼트" },
      { question: "커피 구매 빈도", answer: "주 5회 이상", category: "소비 습관" },
      { question: "선호 브랜드", answer: "스타벅스, 이디야", category: "소비 습관" },
      { question: "운동 빈도", answer: "주 2-3회", category: "라이프스타일" },
    ]
  },
  { 
    panel_uid: "P002", 
    age: 28, 
    gender: "남성",
    region_city: "서울",
    region_district: "서초구",
    region: "서울",
    marital_status: "미혼",
    children_count: 0,
    family_members: 1,
    education: "대학원졸",
    job: "전문직",
    occupation: "전문직",
    monthly_personal_income: "500-600만원",
    monthly_household_income: "500-600만원",
    income_level: "상",
    phone_brand: "애플",
    phone_model: "아이폰 14 Pro",
    car_ownership: "유",
    car_manufacturer: "BMW",
    car_model: "3시리즈",
    owned_electronics: "노트북, 아이패드, 애플워치",
    smoking_experience: "현재 흡연",
    smoking: true,
    smoking_brands: "던힐",
    heated_tobacco_brands: "글로",
    drinking_experience: "와인",
    ott_service: false,
    survey_responses: [
      { question: "선호하는 OTT 서비스", answer: "이용 안함", category: "엔터테인먼트" },
      { question: "여가 활동", answer: "독서, 운동", category: "라이프스타일" },
      { question: "커피 구매 빈도", answer: "주 3-4회", category: "소비 습관" },
      { question: "선호 브랜드", answer: "블루보틀, 프릳츠", category: "소비 습관" },
      { question: "운동 빈도", answer: "주 4-5회", category: "라이프스타일" },
      { question: "신문/잡지 구독", answer: "경제지 구독 중", category: "정보 소비" },
    ]
  },
  { 
    panel_uid: "P003", 
    age: 23, 
    gender: "남성",
    region_city: "부산",
    region_district: "해운대구",
    region: "부산",
    marital_status: "미혼",
    children_count: 0,
    family_members: 4,
    education: "대학 재학",
    job: "학생",
    occupation: "학생",
    monthly_personal_income: "100만원 미만",
    monthly_household_income: "400-500만원",
    income_level: "하",
    phone_brand: "삼성",
    phone_model: "갤럭시 A53",
    car_ownership: "무",
    owned_electronics: "노트북, 게임 콘솔",
    smoking_experience: "비흡연",
    smoking: false,
    drinking_experience: "맥주",
    ott_service: true,
    survey_responses: [
      { question: "선호하는 OTT 서비스", answer: "유튜브 프리미엄", category: "엔터테인먼트" },
      { question: "주간 OTT 이용 시간", answer: "20시간 이상", category: "엔터테인먼트" },
      { question: "선호하는 콘텐츠 장르", answer: "게임, 음악", category: "엔터테인먼트" },
      { question: "커피 구매 빈도", answer: "주 1-2회", category: "소비 습관" },
      { question: "선호 브랜드", answer: "메가커피, 컴포즈", category: "소비 습관" },
      { question: "게임 이용 시간", answer: "주 15시간 이상", category: "라이프스타일" },
    ]
  },
  { panel_uid: "P004", age: 29, gender: "남성", region_city: "서울", region_district: "마포구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 2, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S22", car_ownership: "무", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "에쎄", heated_tobacco_brands: "아이코스", drinking_experience: "소주", ott_service: true },
  { panel_uid: "P005", age: 22, gender: "여성", region_city: "인천", region_district: "남동구", region: "인천", marital_status: "미혼", children_count: 0, family_members: 3, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "200-300만원", monthly_household_income: "500-600만원", income_level: "중", phone_brand: "애플", phone_model: "아이폰 13", car_ownership: "무", owned_electronics: "노트북, 아이패드", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인, 저도��", ott_service: true },
  { panel_uid: "P006", age: 26, gender: "여성", region_city: "서울", region_district: "송파구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "전문직", occupation: "전문직", monthly_personal_income: "400-500만원", monthly_household_income: "400-500만원", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14", car_ownership: "유", car_manufacturer: "벤츠", car_model: "A클래스", owned_electronics: "맥북, 아이패드, 애플워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", liquid_ecig_brands: "쥴", drinking_experience: "와인", ott_service: false },
  { panel_uid: "P007", age: 27, gender: "남성", region_city: "대구", region_district: "수성구", region: "대구", marital_status: "기혼", children_count: 1, family_members: 3, education: "대졸", job: "자영업", occupation: "자영업", monthly_personal_income: "400-500만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23", car_ownership: "유", car_manufacturer: "현대", car_model: "아반떼", owned_electronics: "노트북, 태블릿", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "던힐", heated_tobacco_brands: "글로", drinking_experience: "소주, 맥주, 기타", ott_service: true },
  { panel_uid: "P008", age: 24, gender: "남성", region_city: "서울", region_district: "용산구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "프리랜서", occupation: "프리랜서", monthly_personal_income: "200-300만원", monthly_household_income: "200-300만원", income_level: "하", phone_brand: "애플", phone_model: "아이폰 12", car_ownership: "무", owned_electronics: "맥북", smoking_experience: "비흡연", smoking: false, drinking_experience: "맥주", ott_service: true },
  { panel_uid: "P009", age: 21, gender: "여성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 4, education: "대학 재학", job: "학생", occupation: "학생", monthly_personal_income: "100만원 미만", monthly_household_income: "700-800만원", income_level: "중", phone_brand: "애플", phone_model: "아이폰 13 Pro", car_ownership: "무", owned_electronics: "맥북, 아이패드", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "레종", liquid_ecig_brands: "쥴", drinking_experience: "저도주", ott_service: true },
  { panel_uid: "P010", age: 25, gender: "남성", region_city: "광주", region_district: "서구", region: "광주", marital_status: "미혼", children_count: 0, family_members: 3, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "500-600만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S21", car_ownership: "무", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "소주, 맥주", ott_service: false },
  { panel_uid: "P011", age: 32, gender: "남성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 1, family_members: 3, education: "대학원졸", job: "회사원", occupation: "회사원", monthly_personal_income: "600-700만원", monthly_household_income: "800-900만원", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro Max", car_ownership: "유", car_manufacturer: "현대", car_model: "그랜저", owned_electronics: "맥북 프로, 아이패드, 애플워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "던힐", heated_tobacco_brands: "글로", drinking_experience: "소주, 기타", ott_service: true },
  { panel_uid: "P012", age: 35, gender: "남성", region_city: "서울", region_district: "서초구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "전문직", occupation: "전문직", monthly_personal_income: "700-800만원", monthly_household_income: "900-1000만원", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro", car_ownership: "유", car_manufacturer: "BMW", car_model: "5시리즈", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인", ott_service: true },
  { panel_uid: "P013", age: 31, gender: "여성", region_city: "부산", region_district: "부산진구", region: "부산", marital_status: "기혼", children_count: 1, family_members: 3, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "700-800만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S22", car_ownership: "유", car_manufacturer: "현대", car_model: "투싼", owned_electronics: "노트북, 태블릿", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "에쎄", liquid_ecig_brands: "베이프", drinking_experience: "저도주, 와인", ott_service: false },
  { panel_uid: "P014", age: 33, gender: "남성", region_city: "서울", region_district: "송파구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23 Ultra", car_ownership: "유", car_manufacturer: "기아", car_model: "카니발", owned_electronics: "노트북, 태블릿", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "맥주", ott_service: true },
  { panel_uid: "P015", age: 36, gender: "남성", region_city: "대전", region_district: "유성구", region: "대전", marital_status: "기혼", children_count: 2, family_members: 4, education: "고졸", job: "자영업", occupation: "자영업", monthly_personal_income: "200-300만원", monthly_household_income: "400-500만원", income_level: "하", phone_brand: "삼성", phone_model: "갤럭시 A33", car_ownership: "유", car_manufacturer: "기아", car_model: "모닝", owned_electronics: "노트북", smoking_experience: "비흡연", smoking: false, drinking_experience: "소주, 맥주, 기타", ott_service: false },
  { panel_uid: "P016", age: 38, gender: "여성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "전문직", occupation: "전문직", monthly_personal_income: "600-700만원", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro", car_ownership: "유", car_manufacturer: "벤츠", car_model: "E클래스", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인", ott_service: true },
  { panel_uid: "P017", age: 34, gender: "남성", region_city: "서울", region_district: "마포구", region: "서울", marital_status: "기혼", children_count: 1, family_members: 3, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "700-800만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23", car_ownership: "유", car_manufacturer: "현대", car_model: "쏘나타", owned_electronics: "노트북, 스마트워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "던힐", heated_tobacco_brands: "글로", drinking_experience: "소주, 맥주", ott_service: true },
  { panel_uid: "P018", age: 37, gender: "남성", region_city: "인천", region_district: "연수구", region: "인천", marital_status: "기혼", children_count: 2, family_members: 4, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S22", car_ownership: "유", car_manufacturer: "현대", car_model: "아반떼", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "에쎄", heated_tobacco_brands: "��이코스", drinking_experience: "소주, 기타", ott_service: false },
  { panel_uid: "P019", age: 30, gender: "여성", region_city: "서울", region_district: "용산구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "프리랜서", occupation: "프리랜서", monthly_personal_income: "200-300만원", monthly_household_income: "200-300만원", income_level: "하", phone_brand: "애플", phone_model: "아이폰 13", car_ownership: "무", owned_electronics: "맥북, 아이패드", smoking_experience: "비흡연", smoking: false, drinking_experience: "맥주", ott_service: true },
  { panel_uid: "P020", age: 39, gender: "남성", region_city: "서울", region_district: "서초구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "전문직", occupation: "전문직", monthly_personal_income: "800-900만원", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro Max", car_ownership: "유", car_manufacturer: "BMW", car_model: "7시리즈", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인", ott_service: true },
  { panel_uid: "P021", age: 42, gender: "남성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "임원", occupation: "임원", monthly_personal_income: "1000만원 이상", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro Max", car_ownership: "유", car_manufacturer: "벤츠", car_model: "S클래스", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "던힐", heated_tobacco_brands: "글로", drinking_experience: "소주, 기타", ott_service: false },
  { panel_uid: "P022", age: 45, gender: "여성", region_city: "부산", region_district: "해운대구", region: "부산", marital_status: "기혼", children_count: 2, family_members: 4, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "700-800만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23", car_ownership: "유", car_manufacturer: "현대", car_model: "투싼", owned_electronics: "노트북, 태블릿", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인, 저도주", ott_service: true },
  { panel_uid: "P023", age: 41, gender: "남성", region_city: "서울", region_district: "송파구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S22", car_ownership: "유", car_manufacturer: "기아", car_model: "K5", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "소주, 맥주", ott_service: true },
  { panel_uid: "P024", age: 44, gender: "남성", region_city: "대구", region_district: "달서구", region: "대구", marital_status: "기혼", children_count: 2, family_members: 4, education: "고졸", job: "자영업", occupation: "자영업", monthly_personal_income: "200-300만원", monthly_household_income: "400-500만원", income_level: "하", phone_brand: "삼성", phone_model: "갤럭시 A53", car_ownership: "유", car_manufacturer: "기아", car_model: "프라이드", owned_electronics: "노트북", smoking_experience: "비흡연", smoking: false, drinking_experience: "소주, 맥주, 기타", ott_service: false },
  { panel_uid: "P025", age: 43, gender: "여성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "전문직", occupation: "전문직", monthly_personal_income: "700-800만원", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro", car_ownership: "유", car_manufacturer: "BMW", car_model: "X5", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "레종", liquid_ecig_brands: "쥴", drinking_experience: "와인", ott_service: true },
  { panel_uid: "P026", age: 26, gender: "남성", region_city: "서울", region_district: "마포구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 2, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23", car_ownership: "무", owned_electronics: "노트북, 태블릿", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "소주, 맥주", ott_service: true },
  { panel_uid: "P027", age: 27, gender: "여성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "300-400만원", income_level: "중", phone_brand: "애플", phone_model: "아이폰 13", car_ownership: "무", owned_electronics: "맥북, 아이패드", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "에쎄", liquid_ecig_brands: "베이프", drinking_experience: "와인, 저도주", ott_service: true },
  { panel_uid: "P028", age: 28, gender: "남성", region_city: "서울", region_district: "서초구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "400-500만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23", car_ownership: "무", owned_electronics: "노트북, 스마트워치", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "던힐", heated_tobacco_brands: "글로", drinking_experience: "소주, 맥주", ott_service: true },
  { panel_uid: "P029", age: 24, gender: "남성", region_city: "서울", region_district: "송파구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 3, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "600-700만원", income_level: "중", phone_brand: "애플", phone_model: "아이폰 13", car_ownership: "무", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "맥주", ott_service: false },
  { panel_uid: "P030", age: 29, gender: "남성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "미혼", children_count: 0, family_members: 1, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "400-500만원", monthly_household_income: "400-500만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S23 Ultra", car_ownership: "무", owned_electronics: "노트북, 태블릿", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "에쎄", heated_tobacco_brands: "글로", drinking_experience: "소주, 맥주", ott_service: true },
  { panel_uid: "P031", age: 51, gender: "남성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "대학원졸", job: "임원", occupation: "임원", monthly_personal_income: "1000만원 이상", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro Max", car_ownership: "유", car_manufacturer: "벤츠", car_model: "E클래스", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "비흡연", smoking: false, drinking_experience: "소주, 기타", ott_service: false },
  { panel_uid: "P032", age: 53, gender: "여성", region_city: "부산", region_district: "해운대구", region: "부산", marital_status: "기혼", children_count: 2, family_members: 4, education: "대졸", job: "회사원", occupation: "회사원", monthly_personal_income: "300-400만원", monthly_household_income: "700-800만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S22", car_ownership: "유", car_manufacturer: "현대", car_model: "쏘나타", owned_electronics: "노트북, 태블릿", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인", ott_service: true },
  { panel_uid: "P033", age: 55, gender: "남성", region_city: "서울", region_district: "종로구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 4, education: "고졸", job: "자영업", occupation: "자영업", monthly_personal_income: "300-400만원", monthly_household_income: "500-600만원", income_level: "중", phone_brand: "삼성", phone_model: "갤럭시 S21", car_ownership: "유", car_manufacturer: "현대", car_model: "그랜저", owned_electronics: "노트북", smoking_experience: "현재 흡연", smoking: true, smoking_brands: "말보로", heated_tobacco_brands: "아이코스", drinking_experience: "소주, 맥주, 기타", ott_service: false },
  { panel_uid: "P034", age: 52, gender: "남성", region_city: "인천", region_district: "남동구", region: "인천", marital_status: "기혼", children_count: 2, family_members: 4, education: "고졸", job: "자영업", occupation: "자영업", monthly_personal_income: "200-300만원", monthly_household_income: "400-500만원", income_level: "하", phone_brand: "삼성", phone_model: "갤럭시 A33", car_ownership: "유", car_manufacturer: "기아", car_model: "프라이드", owned_electronics: "노트북", smoking_experience: "비흡연", smoking: false, drinking_experience: "소주, 기타", ott_service: true },
  { panel_uid: "P035", age: 58, gender: "여성", region_city: "서울", region_district: "강남구", region: "서울", marital_status: "기혼", children_count: 2, family_members: 2, education: "대학원졸", job: "전문직", occupation: "전문직", monthly_personal_income: "800-900만원", monthly_household_income: "1000만원 이상", income_level: "상", phone_brand: "애플", phone_model: "아이폰 14 Pro", car_ownership: "유", car_manufacturer: "BMW", car_model: "X3", owned_electronics: "맥북 프로, 아이패드 프로, 애플워치", smoking_experience: "비흡연", smoking: false, drinking_experience: "와인", ott_service: false },
];

export function getAgeGroup(age: number): string {
  if (age < 30) return "20대";
  if (age < 40) return "30대";
  if (age < 50) return "40대";
  return "50대 이상";
}
