package com.example.todoapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig — Cross-Origin Resource Sharing policy for the application.
 *
 * <p><strong>Tại sao không dùng wildcard "*"?</strong><br>
 * Theo đặc tả CORS (Fetch Standard), khi server trả về
 * {@code Access-Control-Allow-Origin: *} thì trình duyệt sẽ từ chối gửi kèm
 * cookie / session hoặc chấp nhận {@code Authorization} header ngay cả khi
 * phía client đặt {@code credentials: 'include'} hoặc
 * {@code axios.defaults.withCredentials = true}. Nói cách khác, wildcard và
 * {@code allowCredentials(true)} là xung đột — Spring MVC sẽ ném
 * {@code IllegalArgumentException} nếu bạn kết hợp cả hai.<br>
 * Vì TodoApp sẽ dùng JWT trong cookie / Bearer header, chúng ta phải chỉ rõ
 * từng origin được phép để sau này bật credentials mà không cần refactor.
 *
 * <p><strong>Cách cấu hình nhiều origin (staging, production):</strong><br>
 * Đặt biến môi trường {@code CORS_ALLOWED_ORIGINS} với danh sách phân cách
 * bằng dấu phẩy, ví dụ:
 * <pre>
 *   CORS_ALLOWED_ORIGINS=http://localhost:5173,https://todo.example.com
 * </pre>
 * Khi biến không được đặt, Spring dùng giá trị mặc định
 * {@code http://localhost:5173} (phù hợp cho dev local với Vite).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Danh sách origins được phép, đọc từ biến môi trường.
     * Mặc định: chỉ Vite dev server (port 5173).
     */
    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")           // áp dụng cho toàn bộ endpoint
                .allowedOrigins(allowedOrigins)
                .allowedMethods(
                        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
                )
                .allowedHeaders("*")         // cho phép mọi request header
                // allowCredentials = false (default) — bật lên khi cần cookie/JWT
                // .allowCredentials(true)   // ← bỏ comment khi thêm Auth
                .maxAge(3600);               // preflight cache 1 giờ
    }
}
