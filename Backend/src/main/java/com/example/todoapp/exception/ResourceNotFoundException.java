package com.example.todoapp.exception;

/**
 * Exception được ném khi không tìm thấy một resource (ví dụ: Task với ID cung cấp không tồn tại).
 * Sẽ được GlobalExceptionHandler bắt và trả về HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
