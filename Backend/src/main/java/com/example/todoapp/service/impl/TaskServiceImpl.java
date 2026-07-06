package com.example.todoapp.service.impl;

import com.example.todoapp.constant.Priority;
import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskByDateGroupDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.entity.Task;
import com.example.todoapp.exception.ResourceNotFoundException;
import com.example.todoapp.mapper.TaskMapper;
import com.example.todoapp.repository.TaskRepository;
import com.example.todoapp.repository.TaskSpecification;
import com.example.todoapp.service.TaskService;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.example.todoapp.constant.ApiConstants.MAX_PAGE_SIZE;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper     taskMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<TaskResponseDTO> getTasks(
            String search,
            TaskStatus status,
            TaskSortField sortBy,
            Sort.Direction sortDir,
            int page,
            int size
    ) {
        // Giới hạn size tối đa — không trả lỗi, chỉ clamp + log warning
        if (size > MAX_PAGE_SIZE) {
            log.warn("Client yêu cầu size={} vượt quá MAX_PAGE_SIZE={}, tự động giới hạn.",
                    size, MAX_PAGE_SIZE);
            size = MAX_PAGE_SIZE;
        }

        Specification<Task> spec = TaskSpecification.withFilters(search, status);
        Page<TaskResponseDTO> resultPage;

        // DUE_DATE cần xử lý NULLS LAST thủ công vì JPA/MySQL không đảm bảo
        // vị trí của NULL nhất quán khi dùng ORDER BY thông thường.
        if (sortBy == TaskSortField.DUE_DATE) {
            // Không dùng Pageable.sort — inject order thủ công qua Specification
            Pageable pageableNoSort = PageRequest.of(page, size);

            Specification<Task> specWithOrder = spec.and((root, query, cb) -> {
                // nullCheck = 1 khi dueDate IS NULL, 0 khi có giá trị
                // → ORDER BY nullCheck ASC luôn đặt task có dueDate trước task null
                Expression<Integer> nullCheck = cb.selectCase()
                        .when(cb.isNull(root.get("dueDate")), cb.literal(1))
                        .otherwise(cb.literal(0))
                        .as(Integer.class);

                List<Order> orders = new ArrayList<>();
                orders.add(cb.asc(nullCheck));  // NULLs luôn cuối
                if (sortDir == Sort.Direction.ASC) {
                    orders.add(cb.asc(root.get("dueDate")));
                } else {
                    orders.add(cb.desc(root.get("dueDate")));
                }
                query.orderBy(orders);
                return null;  // predicate null = không thêm điều kiện WHERE, chỉ thêm ORDER BY
            });

            resultPage = taskRepository
                    .findAll(specWithOrder, pageableNoSort)
                    .map(taskMapper::toResponseDTO);
        } else {
            Sort sort = Sort.by(sortDir, sortBy.getFieldName());
            Pageable pageable = PageRequest.of(page, size, sort);

            resultPage = taskRepository
                    .findAll(spec, pageable)
                    .map(taskMapper::toResponseDTO);
        }

        return PageResponseDTO.<TaskResponseDTO>builder()
                .content(resultPage.getContent())
                .pageNumber(resultPage.getNumber())
                .pageSize(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .isLast(resultPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO dto) {
        // Trim để loại bỏ khoảng trắng đầu/cuối trước khi lưu.
        // Lưu ý: @NotBlank trên DTO đã validate trước khi vào đây,
        // nhưng "   ".trim() = "" vẫn phải bị reject — @NotBlank xử lý điều này
        // vì nó gọi String.isBlank() bên trong, không phải isEmpty().
        String title = dto.getTitle().trim();
        String description = dto.getDescription() != null ? dto.getDescription().trim() : "";

        // Priority default MEDIUM nếu client không gửi
        Priority priority = dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM;

        Task task = taskMapper.toEntity(dto);
        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        task.setStatus(TaskStatus.PENDING);    // luôn PENDING khi tạo mới
        // dueDate đã được mapper set từ dto.getDueDate() (có thể null)

        Task saved = taskRepository.save(task);
        return taskMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc với id: " + id));

        String title = dto.getTitle().trim();
        String description = dto.getDescription() != null ? dto.getDescription().trim() : "";
        Priority priority = dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM;

        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        // Cho phép set về null để xóa deadline khi client gửi dueDate: null tường minh
        task.setDueDate(dto.getDueDate());

        Task saved = taskRepository.save(task);
        return taskMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        // Tìm task (nếu đã xoá rồi, @SQLRestriction sẽ làm nó không trả về -> văng 404)
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc với id: " + id));

        // Soft delete
        task.softDelete();
        taskRepository.save(task);
    }

    @Override
    @Transactional
    public TaskResponseDTO toggleStatus(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc với id: " + id));

        if (task.getStatus() == TaskStatus.PENDING) {
            task.setStatus(TaskStatus.COMPLETED);
        } else {
            task.setStatus(TaskStatus.PENDING);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskByDateGroupDTO> getTasksByDateRange(LocalDate fromDate, LocalDate toDate) {
        // ── Validate ──────────────────────────────────────────────────────────
        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "fromDate (" + fromDate + ") phải trước hoặc bằng toDate (" + toDate + ")");
        }

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(fromDate, toDate);
        if (daysBetween > 90) {
            throw new IllegalArgumentException(
                    "Khoảng cách tối đa là 90 ngày, hiện tại: " + (daysBetween + 1) + " ngày");
        }

        // ── Query ─────────────────────────────────────────────────────────────
        // @SQLRestriction trên entity tự động loại soft-deleted
        List<Task> tasks = taskRepository.findByDueDateBetweenOrderByDueDateAsc(fromDate, toDate);

        // ── Nhóm theo dueDate ─────────────────────────────────────────────────
        Map<LocalDate, List<TaskResponseDTO>> tasksByDate = tasks.stream()
                .collect(Collectors.groupingBy(
                        Task::getDueDate,
                        Collectors.mapping(taskMapper::toResponseDTO, Collectors.toList())
                ));

        // ── Điền đầy đủ mọi ngày trong khoảng, kể cả ngày không có task ──────
        List<TaskByDateGroupDTO> result = new ArrayList<>();
        LocalDate cursor = fromDate;
        while (!cursor.isAfter(toDate)) {
            result.add(TaskByDateGroupDTO.builder()
                    .date(cursor)
                    .tasks(tasksByDate.getOrDefault(cursor, Collections.emptyList()))
                    .build());
            cursor = cursor.plusDays(1);
        }

        return result;
    }
}
