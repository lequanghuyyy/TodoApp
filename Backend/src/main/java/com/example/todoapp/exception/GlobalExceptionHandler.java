package com.example.todoapp.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler — bắt tất cả exception phổ biến và trả về
 * response body nhất quán thay vì Spring's default error JSON.
 *
 * Sẽ được hoàn thiện thêm ở issue #1.9 (ResourceNotFoundException, v.v.).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ----------------------------------------------------------------
    // 400 — Validation lỗi (@Valid @RequestBody)
    // ----------------------------------------------------------------

    /**
     * Bắt lỗi từ @Valid trên @RequestBody.
     * Trả về map field → message để client hiển thị ngay dưới từng input.
     *
     * Ví dụ response:
     * {
     *   "status": 400,
     *   "error": "Validation Failed",
     *   "fields": { "title": "Tiêu đề không được để trống" },
     *   "timestamp": "2026-07-05T18:00:00"
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Giá trị không hợp lệ",
                        // Nếu nhiều lỗi trên cùng 1 field, lấy lỗi đầu tiên
                        (first, second) -> first
                ));

        return ResponseEntity.badRequest().body(errorBody(
                HttpStatus.BAD_REQUEST, "Validation Failed", fieldErrors));
    }

    // ----------------------------------------------------------------
    // 400 — JSON parse error (enum không hợp lệ, sai kiểu dữ liệu)
    // ----------------------------------------------------------------

    /**
     * Bắt lỗi khi Jackson không deserialize được request body.
     * Ví dụ: priority = "URGENT" không nằm trong enum Priority.
     * Nếu không handle, Spring trả 400 với body mặc định rất khó hiểu.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(
            HttpMessageNotReadableException ex) {

        log.warn("Không đọc được request body: {}", ex.getMessage());

        return ResponseEntity.badRequest().body(errorBody(
                HttpStatus.BAD_REQUEST,
                "Request body không hợp lệ — kiểm tra kiểu dữ liệu và giá trị enum",
                null));
    }

    // ----------------------------------------------------------------
    // 400 — Query param sai kiểu / enum (sortBy, sortDir không hợp lệ)
    // ----------------------------------------------------------------

    /**
     * Bắt lỗi khi @RequestParam không convert được sang kiểu khai báo.
     * Ví dụ: sortBy=INVALID_FIELD → MethodArgumentTypeMismatchException.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        String message = String.format(
                "Tham số '%s' có giá trị không hợp lệ: '%s'",
                ex.getName(), ex.getValue());

        return ResponseEntity.badRequest().body(errorBody(
                HttpStatus.BAD_REQUEST, message, null));
    }

    // ----------------------------------------------------------------
    // 500 — Fallback cho mọi exception chưa được handle
    // ----------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(errorBody(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Lỗi hệ thống — vui lòng thử lại sau",
                null));
    }

    // ----------------------------------------------------------------
    // Helper
    // ----------------------------------------------------------------

    private Map<String, Object> errorBody(HttpStatus status, String error, Object detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        if (detail != null) {
            body.put("fields", detail);
        }
        return body;
    }
}
