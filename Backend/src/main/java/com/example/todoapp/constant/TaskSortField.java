package com.example.todoapp.constant;

/**
 * Whitelist các field được phép sort trong query danh sách task.
 *
 * Mỗi giá trị ánh xạ sang tên field trong {@code Task} entity (không phải tên cột DB)
 * để Spring Data JPA dùng trực tiếp trong {@code Sort.by()}.
 *
 * QUAN TRỌNG — Tại sao phải whitelist?
 * Nếu cho phép client truyền thẳng chuỗi sortBy tuỳ ý vào ORDER BY:
 *  1. Field không tồn tại → PropertyReferenceException / crash.
 *  2. Có thể dùng để thăm dò cấu trúc entity (information disclosure).
 *  3. Khó kiểm soát khi refactor tên field.
 * Với enum, bất kỳ giá trị nào ngoài danh sách → Spring trả 400 tự động
 * (qua @RequestParam + ConversionService), không cần xử lý thủ công.
 */
public enum TaskSortField {

    CREATED_AT("createdAt"),
    TITLE("title"),
    PRIORITY("priority"),
    STATUS("status"),

    /**
     * Sắp xếp theo ngày dự kiến hoàn thành.
     * Khi dùng giá trị này, service sẽ áp dụng NULLS LAST thủ công
     * (task không có deadline luôn xếp cuối, bất kể ASC/DESC).
     */
    DUE_DATE("dueDate");

    private final String fieldName;

    TaskSortField(String fieldName) {
        this.fieldName = fieldName;
    }

    /** Tên field trong entity — dùng trực tiếp với {@code Sort.by(fieldName)}. */
    public String getFieldName() {
        return fieldName;
    }
}
