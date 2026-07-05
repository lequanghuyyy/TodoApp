package com.example.todoapp.controller;

import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

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
     * trả {@code 400 Bad Request} thông qua ConversionService — không cần xử lý thủ công.
     */
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
}
