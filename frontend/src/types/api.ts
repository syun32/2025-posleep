// 공통 API 응답 타입
export type ApiResponse<T> = {
  status: string;            // "success" | "error" 등
  data: T;                   // 실제 데이터
  meta?: Record<string, unknown>; // 페이징, 총 개수 등 부가 정보
};