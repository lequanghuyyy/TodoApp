package com.example.todoapp.repository;

import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.entity.Task;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Factory class tạo {@link Specification} động cho query danh sách task.
 *
 * <p>Dùng static factory method thay vì constructor để dễ compose:
 * <pre>
 *   Specification&lt;Task&gt; spec = TaskSpecification.withFilters(search, status);
 * </pre>
 *
 * <p><b>Lưu ý ESCAPE ký tự đặc biệt trong LIKE:</b><br>
 * Trong SQL LIKE, ký tự {@code %} và {@code _} có nghĩa đặc biệt (wildcard).
 * Nếu user search "50%" họ muốn tìm chuỗi "50%" theo nghĩa đen, không phải
 * "bắt đầu bằng 50 + bất kỳ gì". Method {@link #escapeLike(String)} xử lý
 * edge case này bằng cách escape trước khi wrap thành {@code %input%}.
 */
public class TaskSpecification {

    private TaskSpecification() {}

    /**
     * Tạo {@link Specification} kết hợp search + status filter.
     *
     * @param search tìm trong title LIKE hoặc description LIKE (null = bỏ qua)
     * @param status lọc theo status (null = tất cả)
     */
    public static Specification<Task> withFilters(String search, TaskStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ---- Search: title LIKE %x% OR description LIKE %x% ----
            if (search != null && !search.isBlank()) {
                String escaped = "%" + escapeLike(search.trim()) + "%";
                Predicate titleMatch       = cb.like(root.get("title"),       escaped);
                Predicate descriptionMatch = cb.like(root.get("description"), escaped);
                predicates.add(cb.or(titleMatch, descriptionMatch));
            }

            // ---- Status filter ----
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()                                   // không có filter → WHERE 1=1
                    : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Escape các ký tự đặc biệt của SQL LIKE: {@code %}, {@code _}, {@code \}.
     *
     * <p>Ví dụ:
     * <ul>
     *   <li>Input {@code "50%"}  → {@code "50\%"}  → query LIKE {@code "%50\%%"}</li>
     *   <li>Input {@code "a_b"}  → {@code "a\_b"}  → query LIKE {@code "%a\_b%"}</li>
     * </ul>
     *
     * <p>MySQL/H2 nhận diện {@code \} là escape character mặc định trong LIKE.
     * Nếu dùng DB khác (PostgreSQL), cần thêm {@code ESCAPE '\'} vào predicate.
     */
    static String escapeLike(String input) {
        return input
                .replace("\\", "\\\\")   // escape backslash trước tiên
                .replace("%",  "\\%")    // escape wildcard %
                .replace("_",  "\\_");   // escape single-char wildcard _
    }
}
