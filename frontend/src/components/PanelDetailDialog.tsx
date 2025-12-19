import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { PanelData, fieldLabels } from "../utils/mockPanelData";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { User, Briefcase, GraduationCap, Heart, MapPin, Wallet, Users, Baby, Smartphone, Car, Laptop, Cigarette, Wine, CheckCircle2 } from "lucide-react";
import { getPanelDetail, PanelDetailResponse } from "../utils/api";
import { LoadingIndicator } from "./LoadingIndicator";

interface PanelDetailDialogProps {
  panel: PanelData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 세그먼트 이름을 한글로 변환 (필드명을 그대로 표시하거나 필요시 매핑 추가)
// drinking_experience_multi_label 이후의 모든 필드가 비정형 데이터로 저장됨
const SEGMENT_NAME_MAP: Record<string, string> = {
  // 기존 G1~G7 매핑 (하위 호환성)
  "G1_HEALTH": "건강 및 의료",
  "G2_TECH": "기술 및 디지털",
  "G3_FINANCE": "금융 및 소비",
  "G4_TRAVEL_CULTURE": "여행 및 문화",
  "G5_PSYCHOLOGY": "심리 및 가치관",
  "G6_DAILY_HABITS": "일상 습관",
  "G7_VALUES": "가치관 및 라이프스타일",
  // 새로운 필드명 매핑 (필요시 추가)
  "FITNESS_MANAGEMENT_METHOD": "체력 관리 방법",
  "SKIN_SATISFACTION": "피부 만족도",
  "SKINCARE_SPENDING_MONTHLY": "월 스킨케어 지출",
  "SKINCARE_CONSIDERATIONS": "스킨케어 고려사항",
  "MOST_EFFECTIVE_DIET_EXPERIENCE": "가장 효과적인 다이어트 경험",
  "AI_USAGE_FIELD": "AI 사용 분야",
  "MOST_SAVED_PHOTOS_TOPIC": "가장 많이 저장한 사진 주제",
  "OTT_SERVICE_COUNT": "OTT 서비스 이용 개수",
  "MAIN_APPS_USED": "주로 사용하는 앱",
  "CHATBOT_EXPERIENCE": "챗봇 경험",
  "MAIN_CHATBOT_USED": "주로 사용하는 챗봇",
  "CHATBOT_MAIN_PURPOSE": "챗봇 주요 목적",
  "PREFERRED_CHATBOT": "선호하는 챗봇",
  "PREFERRED_NEW_YEAR_GIFT": "선호하는 설 선물",
  "MAIN_QUICK_DELIVERY_PRODUCTS": "주로 주문하는 빠른 배송 상품",
  "REWARD_POINTS_INTEREST": "리워드 포인트 관심도",
  "PREFERRED_SPENDING_CATEGORY": "선호하는 지출 카테고리",
  "HIGH_SPENDING_CATEGORY": "높은 지출 카테고리",
  "PREFERRED_WATER_PLAY_AREA": "선호하는 물놀이 장소",
  "TRAVEL_STYLE": "여행 스타일",
  "TRADITIONAL_MARKET_VISIT_FREQUENCY": "전통시장 방문 빈도",
  "PREFERRED_OVERSEAS_DESTINATION": "선호하는 해외 여행지",
  "MEMORABLE_CHILDHOOD_WINTER_ACTIVITY": "기억에 남는 어린 시절 겨울 활동",
  "PREFERRED_SUMMER_SNACK": "선호하는 여름 간식",
  "STRESS_FACTORS": "스트레스 요인",
  "STRESS_RELIEF_METHOD": "스트레스 해소 방법",
  "MOVING_STRESS_FACTORS": "이사 스트레스 요인",
  "RAINY_DAY_COPING_METHOD": "비 오는 날 대처 방법",
  "LIFESTYLE_VALUES": "라이프스타일 가치관",
  "PRIVACY_HABITS": "개인정보 보호 습관",
  "PREFERRED_CHOCOLATE_SITUATION": "초콜릿을 먹는 상황",
  "WASTE_DISPOSAL_METHOD": "폐기물 처리 방법",
  "MORNING_WAKEUP_METHOD": "아침 기상 방법",
  "LATE_NIGHT_SNACK_METHOD": "야식 섭취 방법",
  "REDUCING_PLASTIC_BAGS": "비닐봉지 줄이기 노력",
  "SOLO_DINING_FREQUENCY": "혼밥 빈도",
  "SUMMER_FASHION_ESSENTIAL": "여름 패션 필수 아이템",
  "PETS": "반려동물",
  "SUMMER_WORRIES": "여름 걱정사항",
  "SUMMER_SWEAT_DISCOMFORT": "여름 땀 불편함",
  "CONDITIONS_FOR_HAPPY_OLD_AGE": "행복한 노후를 위한 조건",
};

// 필드명을 한글로 변환하는 헬퍼 함수
function getSegmentDisplayName(segmentName: string): string {
  return SEGMENT_NAME_MAP[segmentName] || segmentName.replace(/_/g, " ").toLowerCase();
}

// 안전한 배열 변환 헬퍼 함수 (백엔드에서 문자열 또는 배열로 올 수 있음)
function ensureArray(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // 문자열인 경우 쉼표로 split (예: "노트북, 태블릿" → ["노트북", "태블릿"])
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  return [];
}

export function PanelDetailDialog({ panel, open, onOpenChange }: PanelDetailDialogProps) {
  const [panelDetail, setPanelDetail] = useState<PanelDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 패널 상세 정보 로드
  useEffect(() => {
    if (open && panel) {
      setIsLoading(true);
      setError(null);
      getPanelDetail(panel.panel_uid)
        .then((detail) => {
          setPanelDetail(detail);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("패널 상세 정보 조회 실패:", err);
          setError(err.message || "패널 상세 정보를 불러올 수 없습니다.");
          setIsLoading(false);
        });
    } else {
      setPanelDetail(null);
    }
  }, [open, panel]);

  if (!panel) return null;

  // 정형 필드명 매핑 (DB 컬럼명 → UI 필드명)
  const fieldNameMapping: Record<string, string> = {
    gender: "gender",
    age: "age",
    region_city: "region_city",
    region_gu: "region_district",
    marital_status: "marital_status",
    children_count: "children_count",
    family_size: "family_members",
    education_level: "education",
    occupation: "job",
    monthly_personal_income: "monthly_personal_income",
    monthly_household_income: "monthly_household_income",
    phone_brand: "phone_brand",
    phone_model: "phone_model",
    car_ownership: "car_ownership",
    car_manufacturer: "car_manufacturer",
    car_model: "car_model",
    owned_electronics: "owned_electronics",
    smoking_experience: "smoking_experience",
    smoking_brand: "smoking_brand",
    e_cig_heated_brand: "e_cig_heated_brand",
    e_cig_liquid_brand: "e_cig_liquid_brand",
    drinking_experience: "drinking_experience",
  };

  // 필드가 검색에 사용되었는지 확인
  const isMatchedField = (fieldKey: string): boolean => {
    if (!panel.matched_fields || panel.matched_fields.length === 0) return false;
    // DB 컬럼명으로 직접 매칭
    if (panel.matched_fields.includes(fieldKey)) return true;
    // UI 필드명으로 매핑하여 확인
    const mappedKey = fieldNameMapping[fieldKey];
    return mappedKey ? panel.matched_fields.includes(mappedKey) : false;
  };

  // 세그먼트가 검색에 사용되었는지 확인
  const isMatchedSegment = (segmentName: string): boolean => {
    if (!panel.matched_segments || panel.matched_segments.length === 0) return false;
    return panel.matched_segments.includes(segmentName);
  };

  const InfoField = ({ icon: Icon, label, value, fieldKey }: { icon: any, label: string, value: string | number | undefined | null, fieldKey?: string }) => {
    // null이나 undefined일 때 "-" 표시
    const displayValue = (value === null || value === undefined) ? "-" : value;
    const isMatched = fieldKey ? isMatchedField(fieldKey) : false;
    
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span className={isMatched ? "font-semibold text-primary" : ""}>{label}</span>
          {isMatched && (
            <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
          )}
        </div>
        <p className={isMatched ? "font-medium text-primary" : ""}>{displayValue}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            패널 상세 정보: {panel.panel_uid}
          </DialogTitle>
          <DialogDescription>
            응답자의 기본 정보와 설문 응답 내역을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* LLM 요약 텍스트 */}
          {panel.panel_summary_text && panel.panel_summary_text.trim().length > 0 && (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{fieldLabels.panel_summary_text ?? "요약"}</h3>
                <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  {panel.panel_summary_text}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* 기본 인적 정보 */}
          <div className="space-y-4">
            <h3>기본 인적 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className={isMatchedField("gender") ? "font-semibold text-primary" : ""}>{fieldLabels.gender}</span>
                  {isMatchedField("gender") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {panel.gender ? (
                    <Badge variant={panel.gender === "남성" ? "default" : "destructive"} className={isMatchedField("gender") ? "ring-2 ring-primary" : ""}>
                      {panel.gender}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <InfoField icon={User} label={fieldLabels.age} value={panel.age ? `${panel.age}세` : undefined} fieldKey="age" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className={isMatchedField("marital_status") ? "font-semibold text-primary" : ""}>{fieldLabels.marital_status}</span>
                  {isMatchedField("marital_status") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {panel.marital_status ? (
                    <Badge 
                      variant={
                        panel.marital_status === "기혼" 
                          ? "default" 
                          : panel.marital_status === "미혼" 
                          ? "secondary" 
                          : panel.marital_status === "기타"
                          ? "outline"
                          : "secondary"
                      }
                      className={isMatchedField("marital_status") ? "ring-2 ring-primary" : ""}
                    >
                      {panel.marital_status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <InfoField icon={Baby} label={fieldLabels.children_count} value={panel.children_count !== undefined && panel.children_count !== null ? `${panel.children_count}명` : null} fieldKey="children_count" />
              <InfoField icon={Users} label={fieldLabels.family_members} value={panel.family_members !== undefined && panel.family_members !== null ? `${panel.family_members}명` : null} fieldKey="family_size" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span className={isMatchedField("education_level") ? "font-semibold text-primary" : ""}>{fieldLabels.education}</span>
                  {isMatchedField("education_level") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {panel.education ? (
                    <Badge variant="outline" className={isMatchedField("education_level") ? "ring-2 ring-primary" : ""}>
                      {panel.education}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 거주 지역 */}
          <div className="space-y-4">
            <h3>거주 지역</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoField icon={MapPin} label={fieldLabels.region_city} value={panel.region_city} fieldKey="region_city" />
              <InfoField icon={MapPin} label={fieldLabels.region_district} value={panel.region_district} fieldKey="region_gu" />
            </div>
          </div>

          <Separator />

          {/* 직업 및 소득 정보 */}
          <div className="space-y-4">
            <h3>직업 및 소득 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoField icon={Briefcase} label={fieldLabels.job} value={panel.job || panel.occupation} fieldKey="occupation" />
              <InfoField icon={Wallet} label={fieldLabels.monthly_personal_income} value={panel.monthly_personal_income} fieldKey="monthly_personal_income" />
              <InfoField icon={Wallet} label={fieldLabels.monthly_household_income} value={panel.monthly_household_income} fieldKey="monthly_household_income" />
            </div>
          </div>

          <Separator />

          {/* 휴대폰 정보 */}
          <div className="space-y-4">
            <h3>휴대폰 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoField icon={Smartphone} label={fieldLabels.phone_brand} value={panel.phone_brand} fieldKey="phone_brand" />
              <InfoField icon={Smartphone} label={fieldLabels.phone_model} value={panel.phone_model} fieldKey="phone_model" />
            </div>
          </div>

          <Separator />

          {/* 차량 정보 */}
          <div className="space-y-4">
            <h3>차량 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="w-4 h-4" />
                  <span className={isMatchedField("car_ownership") ? "font-semibold text-primary" : ""}>{fieldLabels.car_ownership}</span>
                  {isMatchedField("car_ownership") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {panel.car_ownership ? (
                    <Badge variant={panel.car_ownership === "유" ? "default" : "outline"} className={isMatchedField("car_ownership") ? "ring-2 ring-primary" : ""}>
                      {panel.car_ownership}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              {panel.car_ownership === "유" && (
                <>
                  <InfoField icon={Car} label={fieldLabels.car_manufacturer} value={panel.car_manufacturer} fieldKey="car_manufacturer" />
                  <InfoField icon={Car} label={fieldLabels.car_model} value={panel.car_model} fieldKey="car_model" />
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* 보유 전자제품 */}
          {(() => {
            const electronics = ensureArray(panel.owned_electronics);
            return electronics.length > 0 ? (
            <>
              <div className="space-y-4">
                <h3>보유 전자제품</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Laptop className="w-4 h-4" />
                        <span className={isMatchedField("owned_electronics") ? "font-semibold text-primary" : ""}>{fieldLabels.owned_electronics}</span>
                        {isMatchedField("owned_electronics") && (
                          <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {electronics.map((item, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("owned_electronics") ? "ring-1 ring-primary" : ""}`}>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
            ) : null;
          })()}

          {/* 흡연 정보 */}
          <div className="space-y-4">
            <h3>흡연 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cigarette className="w-4 h-4" />
                  <span className={isMatchedField("smoking_experience") ? "font-semibold text-primary" : ""}>{fieldLabels.smoking_experience}</span>
                  {isMatchedField("smoking_experience") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {(() => {
                    const experiences = ensureArray(panel.smoking_experience);
                    return experiences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {experiences.map((exp, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("smoking_experience") ? "ring-1 ring-primary" : ""}`}>
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </div>
              </div>
              {(() => {
                // smoking_brand (백엔드) 또는 smoking_brands (하위 호환성) 지원
                const brands = ensureArray(panel.smoking_brand || panel.smoking_brands);
                return brands.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cigarette className="w-4 h-4" />
                      <span className={isMatchedField("smoking_brand") ? "font-semibold text-primary" : ""}>{fieldLabels.smoking_brands}</span>
                      {isMatchedField("smoking_brand") && (
                        <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                      )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                      {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("smoking_brand") ? "ring-1 ring-primary" : ""}`}>
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}
              {(() => {
                // e_cig_heated_brand (백엔드) 또는 heated_tobacco_brands (하위 호환성) 지원
                const brands = ensureArray(panel.e_cig_heated_brand || panel.heated_tobacco_brands);
                return brands.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cigarette className="w-4 h-4" />
                      <span className={isMatchedField("e_cig_heated_brand") ? "font-semibold text-primary" : ""}>{fieldLabels.heated_tobacco_brands}</span>
                      {isMatchedField("e_cig_heated_brand") && (
                        <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                      )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                      {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("e_cig_heated_brand") ? "ring-1 ring-primary" : ""}`}>
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}
              {(() => {
                // e_cig_liquid_brand (백엔드) 또는 liquid_ecig_brands (하위 호환성) 지원
                const brands = ensureArray(panel.e_cig_liquid_brand || panel.liquid_ecig_brands);
                return brands.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cigarette className="w-4 h-4" />
                      <span className={isMatchedField("e_cig_liquid_brand") ? "font-semibold text-primary" : ""}>{fieldLabels.liquid_ecig_brands}</span>
                      {isMatchedField("e_cig_liquid_brand") && (
                        <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                      )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                      {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("e_cig_liquid_brand") ? "ring-1 ring-primary" : ""}`}>
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}
            </div>
          </div>

          <Separator />

          {/* 음주 정보 */}
          <div className="space-y-4">
            <h3>음주 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wine className="w-4 h-4" />
                  <span className={isMatchedField("drinking_experience") ? "font-semibold text-primary" : ""}>{fieldLabels.drinking_experience}</span>
                  {isMatchedField("drinking_experience") && (
                    <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 필드" />
                  )}
                </div>
                <div>
                  {(() => {
                    const experiences = ensureArray(panel.drinking_experience);
                    return experiences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {experiences.map((exp, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${isMatchedField("drinking_experience") ? "ring-1 ring-primary" : ""}`}>
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* 주요 특성 */}
          {(panel.smoking !== undefined || panel.ott_service !== undefined) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3>추가 특성</h3>
                <div className="flex flex-wrap gap-2">
                  {panel.smoking !== undefined && (
                    <Badge variant={panel.smoking ? "destructive" : "secondary"}>
                      {panel.smoking ? "흡연자" : "비흡연자"}
                    </Badge>
                  )}
                  {panel.ott_service !== undefined && (
                    <Badge variant={panel.ott_service ? "default" : "secondary"}>
                      {panel.ott_service ? "OTT 이용" : "OTT 미이용"}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 비정형 데이터 (G1~G7 요약 텍스트 세그먼트) */}
          {isLoading && (
            <>
              <Separator />
              <LoadingIndicator variant="centered" size="sm" label="검색 중..." />
            </>
          )}

          {error && (
            <>
              <Separator />
              <div className="text-center py-8 text-destructive">
                {error}
              </div>
            </>
          )}

          {!isLoading && !error && panelDetail?.summary_segments && Object.keys(panelDetail.summary_segments).length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3>설문 응답</h3>
                <div className="space-y-4">
                  {Object.entries(panelDetail.summary_segments)
                    .sort(([a], [b]) => a.localeCompare(b)) // 세그먼트 이름 순서대로 정렬
                    .map(([segmentName, summaryText]) => {
                      // "?" 이후의 답변만 추출 (QA 형식: "질문? 답변")
                      const answerOnly = summaryText.includes('?') 
                        ? summaryText.split('?').slice(1).join('?').trim() 
                        : summaryText;
                      
                      const isMatched = isMatchedSegment(segmentName);
                      
                      return (
                             <div key={segmentName} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isMatched ? "text-primary" : ""}`}>
                                 {getSegmentDisplayName(segmentName)}
                               </h4>
                            {isMatched && (
                              <CheckCircle2 className="w-4 h-4 text-primary" title="검색에 사용된 세그먼트" />
                            )}
                          </div>
                          <div className={`pl-4 border-l-2 ${isMatched ? "border-primary/30" : "border-primary/20"}`}>
                            <p className={`text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md ${isMatched ? "ring-1 ring-primary/20" : ""}`}>
                              {answerOnly}
                          </p>
                        </div>
                      </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* 설문 응답이 없는 경우 (로딩 완료 후) */}
          {!isLoading && !error && (!panelDetail?.summary_segments || Object.keys(panelDetail.summary_segments || {}).length === 0) && (
            <>
              <Separator />
              <div className="text-center py-8 text-muted-foreground">
                상세 설문 응답 데이터가 없습니다.
              </div>
            </>
          )}

          {/* 기존 survey_responses (하위 호환성) */}
          {panel.survey_responses && panel.survey_responses.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3>설문 응답 데이터 (기존 형식)</h3>
                <div className="space-y-4">
                  {Array.from(new Set(panel.survey_responses.map(r => r.category))).map((category) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-primary">{category}</h4>
                      <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                        {panel.survey_responses
                          ?.filter(r => r.category === category)
                          .map((response, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-muted-foreground">{response.question}</p>
                              <p>{response.answer}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
