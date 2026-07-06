package com.example.todoapp.controller;

import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskByDateGroupDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

import static com.example.todoapp.constant.ApiConstants.DEFAULT_PAGE_SIZE;

/**
 * REST controller cho Task resource.
 *
 * <p>Base path: {@code /tasks} — context-path {@code /api} được cấu hình ở server.servlet.
 * URL đầy đủ khi dev: {@code http://localhost:8080/api/tasks}
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "APIs for managing tasks")
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /api/tasks — Lấy danh sách task có search, filter, sort và phân trang.
     *
     * <p>Query params:
     * <ul>
     *   <li>{@code search}  — tìm trong title hoặc description (optional)</li>
     *   <li>{@code status}  — PENDING | COMPLETED (optional, mặc định tất cả)</li>
     *   <li>{@code sortBy}  — CREATED_AT | TITLE | PRIORITY | STATUS (default CREATED_AT)</li>
     *   <li>{@code sortDir} — ASC | DESC (default DESC)</li>
     *   <li>{@code page}    — số trang 0-indexed (default 0)</li>
     *   <li>{@code size}    — số phần tử/trang (default 10, tối đa 100)</li>
     * </ul>
     *
     * <p>Nếu {@code sortBy} không nằm trong enum {@link TaskSortField}, Spring tự động
     * Trả {@code 400 Bad Request} thông qua ConversionService — không cần xử lý thủ công.
     */
    @Operation(summary = "Lấy danh sách task", description = "Lấy danh sách task có search, filter, sort và phân trang.")
    @ApiResponse(responseCode = "200", description = "Thành công")
    @GetMapping
    public ResponseEntity<PageResponseDTO<TaskResponseDTO>> getTasks(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            TaskStatus status,

            @RequestParam(defaultValue = "CREATED_AT")
            TaskSortField sortBy,

            @RequestParam(defaultValue = "DESC")
            Sort.Direction sortDir,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "" + DEFAULT_PAGE_SIZE)
            int size
    ) {
        PageResponseDTO<TaskResponseDTO> response =
                taskService.getTasks(search, status, sortBy, sortDir, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/tasks — Tạo task mới.
     *
     * <p>Trả về 201 Created với:
     * <ul>
     *   <li>Header {@code Location: /api/tasks/{id}} trỏ tới resource vừa tạo.</li>
     *   <li>Body là {@link TaskResponseDTO} của task vừa persist.</li>
     * </ul>
     */
    @Operation(summary = "Tạo task mới", description = "Tạo một task mới.")
    @ApiResponse(responseCode = "201", description = "Đã tạo thành công")
    @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(
            @Valid @RequestBody TaskRequestDTO dto
    ) {
        TaskResponseDTO created = taskService.createTask(dto);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    /**
     * PUT /api/tasks/{id} — Cập nhật task.
     *
     * <p>Xử lý conflict (race condition) qua Optimistic Locking (HTTP 409).
     * Trả về HTTP 404 nếu không tìm thấy ID.
     */
    @Operation(summary = "Cập nhật task", description = "Cập nhật thông tin của task.")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @ApiResponse(responseCode = "404", description = "Không tìm thấy task")
    @ApiResponse(responseCode = "409", description = "Xung đột dữ liệu (Optimistic Locking)")
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO dto
    ) {
        TaskResponseDTO updated = taskService.updateTask(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/tasks/{id} — Xóa task.
     *
     * <p>Gọi 2 lần (double-click) thì lần 2 trả 404.
     */
    @Operation(summary = "Xóa mềm task", description = "Đánh dấu task là đã xóa (xóa mềm).")
    @ApiResponse(responseCode = "204", description = "Xóa thành công")
    @ApiResponse(responseCode = "404", description = "Không tìm thấy task")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/tasks/{id}/toggle-status — Đổi trạng thái task.
     *
     * <p>Xử lý conflict (race condition) qua Optimistic Locking (HTTP 409).
     * Trả về HTTP 404 nếu không tìm thấy ID.
     */
    @Operation(summary = "Đổi trạng thái task", description = "Chuyển đổi trạng thái của task (PENDING <-> COMPLETED).")
    @ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công")
    @ApiResponse(responseCode = "404", description = "Không tìm thấy task")
    @ApiResponse(responseCode = "409", description = "Xung đột dữ liệu (Optimistic Locking)")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<TaskResponseDTO> toggleStatus(@PathVariable Long id) {
        TaskResponseDTO updated = taskService.toggleStatus(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/tasks/by-date — Xem công việc theo khoảng ngày (dùng cho Agenda View).
     *
     * <p>Query params:
     * <ul>
     *   <li>{@code fromDate} — ngày bắt đầu (yyyy-MM-dd, bắt buộc)</li>
     *   <li>{@code toDate}   — ngày kết thúc (yyyy-MM-dd, bắt buộc)</li>
     * </ul>
     *
     * <p>Trả về danh sách nhóm theo ngày, MỖI ngày trong khoảng đều xuất hiện
     * (kể cả ngày không có task — tasks=[]).
     *
     * <p>Lỗi 400:
     * <ul>
     *   <li>fromDate &gt; toDate</li>
     *   <li>Khoảng cách &gt; 90 ngày</li>
     *   <li>Sai định dạng date (Spring parse lỗi → MethodArgumentTypeMismatchException)</li>
     * </ul>
     */
    @Operation(summary = "Lấy task nhóm theo ngày", description = "Trả task nhóm theo dueDate trong khoảng fromDate–toDate. Mỗi ngày đều xuất hiện dù trống.")
    @ApiResponse(responseCode = "200", description = "Thành công")
    @ApiResponse(responseCode = "400", description = "Tham số không hợp lệ")
    @GetMapping("/by-date")
    public ResponseEntity<List<TaskByDateGroupDTO>> getTasksByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<TaskByDateGroupDTO> result = taskService.getTasksByDateRange(fromDate, toDate);
        return ResponseEntity.ok(result);
    }
}
