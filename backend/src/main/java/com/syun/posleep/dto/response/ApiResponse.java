package com.syun.posleep.dto.response;

import java.util.Map;

public record ApiResponse<T>(
        String status,
        T data,
        Map<String, Object> meta
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", data, null);
    }
    public static <T> ApiResponse<T> success(T data, Map<String,Object> meta) {
        return new ApiResponse<>("success", data, meta);
    }
}
