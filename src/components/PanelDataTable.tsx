import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { PanelData, fieldLabels } from "../utils/mockPanelData";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AccuracyBadge } from "./AccuracyBadge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingIndicator } from "./LoadingIndicator";

interface PanelDataTableProps {
  panels: PanelData[];
  onPanelClick?: (panel: PanelData) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 20;

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

export function PanelDataTable({ panels, onPanelClick, isLoading = false }: PanelDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(panels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPanels = useMemo(() => {
    return panels.slice(startIndex, endIndex);
  }, [panels, startIndex, endIndex]);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // panels가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [panels.length]);

  if (isLoading) {
    return (
      <LoadingIndicator variant="centered" size="sm" label="검색 중..." />
    );
  }

  if (panels.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-max">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]">순번 / {fieldLabels.panel_uid}</TableHead>
              <TableHead className="min-w-[120px]">정확도</TableHead>
              <TableHead className="min-w-[80px]">{fieldLabels.gender}</TableHead>
              <TableHead className="min-w-[70px]">{fieldLabels.age}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.region_city}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.region_district}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.marital_status}</TableHead>
              <TableHead className="min-w-[80px]">{fieldLabels.children_count}</TableHead>
              <TableHead className="min-w-[110px]">{fieldLabels.family_members}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.education}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.job}</TableHead>
              <TableHead className="min-w-[140px]">{fieldLabels.monthly_personal_income}</TableHead>
              <TableHead className="min-w-[140px]">{fieldLabels.monthly_household_income}</TableHead>
              <TableHead className="min-w-[120px]">{fieldLabels.phone_brand}</TableHead>
              <TableHead className="min-w-[140px]">{fieldLabels.phone_model}</TableHead>
              <TableHead className="min-w-[100px]">{fieldLabels.car_ownership}</TableHead>
              <TableHead className="min-w-[120px]">{fieldLabels.car_manufacturer}</TableHead>
              <TableHead className="min-w-[120px]">{fieldLabels.car_model}</TableHead>
              <TableHead className="min-w-[180px]">{fieldLabels.owned_electronics}</TableHead>
              <TableHead className="min-w-[120px]">{fieldLabels.smoking_experience}</TableHead>
              <TableHead className="min-w-[120px]">{fieldLabels.smoking_brands}</TableHead>
              <TableHead className="min-w-[140px]">{fieldLabels.heated_tobacco_brands}</TableHead>
              <TableHead className="min-w-[140px]">{fieldLabels.liquid_ecig_brands}</TableHead>
              <TableHead className="min-w-[130px]">{fieldLabels.drinking_experience}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPanels.map((panel, index) => {
              const globalIndex = startIndex + index + 1; // 전체 순서 번호 (1부터 시작)
              return (
              <TableRow key={panel.panel_uid}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium min-w-[40px]">{globalIndex}.</span>
                    <Button
                      variant="link"
                      onClick={() => onPanelClick?.(panel)}
                      className="p-0 h-auto"
                    >
                      {panel.panel_uid}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <AccuracyBadge panel={panel} />
                </TableCell>
                <TableCell>
                  <Badge variant={panel.gender === "남성" ? "default" : "destructive"}>
                    {panel.gender}
                  </Badge>
                </TableCell>
                <TableCell>{panel.age ? `${panel.age}세` : "-"}</TableCell>
                <TableCell>{panel.region_city || "-"}</TableCell>
                <TableCell>{panel.region_district || "-"}</TableCell>
                <TableCell>
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
                    >
                      {panel.marital_status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{panel.children_count !== undefined && panel.children_count !== null ? `${panel.children_count}명` : "-"}</TableCell>
                <TableCell>{panel.family_members !== undefined && panel.family_members !== null ? `${panel.family_members}명` : "-"}</TableCell>
                <TableCell>
                  {panel.education ? (
                    <Badge variant="outline">
                      {panel.education}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{panel.job || panel.occupation || "-"}</TableCell>
                <TableCell>{panel.monthly_personal_income || "-"}</TableCell>
                <TableCell>{panel.monthly_household_income || "-"}</TableCell>
                <TableCell>{panel.phone_brand || "-"}</TableCell>
                <TableCell>{panel.phone_model || "-"}</TableCell>
                <TableCell>
                  {panel.car_ownership ? (
                    <Badge variant={panel.car_ownership === "유" ? "default" : "outline"}>
                      {panel.car_ownership}
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>{panel.car_manufacturer || "-"}</TableCell>
                <TableCell>{panel.car_model || "-"}</TableCell>
                <TableCell>
                  {(() => {
                    const items = ensureArray(panel.owned_electronics);
                    return items.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {items.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    const experiences = ensureArray(panel.smoking_experience);
                    return experiences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {experiences.map((exp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    // smoking_brand (백엔드) 또는 smoking_brands (하위 호환성) 지원
                    const brands = ensureArray(panel.smoking_brand || panel.smoking_brands);
                    return brands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    // e_cig_heated_brand (백엔드) 또는 heated_tobacco_brands (하위 호환성) 지원
                    const brands = ensureArray(panel.e_cig_heated_brand || panel.heated_tobacco_brands);
                    return brands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    // e_cig_liquid_brand (백엔드) 또는 liquid_ecig_brands (하위 호환성) 지원
                    const brands = ensureArray(panel.e_cig_liquid_brand || panel.liquid_ecig_brands);
                    return brands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    const experiences = ensureArray(panel.drinking_experience);
                    return experiences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {experiences.map((exp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    ) : "-";
                  })()}
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
        </div>
      </div>
      
      {/* 페이지네이션 - sticky로 화면 가운데 고정 */}
      {totalPages > 1 && (
        <div className="sticky bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4 py-3 bg-background border shadow-lg z-50 w-fit mx-auto rounded-lg">
          <div className="text-xs text-muted-foreground">
            총 {panels.length}개 중 {startIndex + 1}-{Math.min(endIndex, panels.length)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>
            
            {/* 페이지 번호 표시 (최대 5개) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
