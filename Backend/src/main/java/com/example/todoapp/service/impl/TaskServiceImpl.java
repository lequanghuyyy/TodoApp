package com.example.todoapp.service.impl;

import com.example.todoapp.constant.Priority;
import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.entity.Task;
import com.example.todoapp.exception.ResourceNotFoundException;
import com.example.todoapp.mapper.TaskMapper;
import com.example.todoapp.repository.TaskRepository;
import com.example.todoapp.repository.TaskSpecification;
import com.example.todoapp.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        Sort sort = Sort.by(sortDir, sortBy.getFieldName());
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Task> spec = TaskSpecification.withFilters(search, status);

        Page<TaskResponseDTO> resultPage = taskRepository
                .findAll(spec, pageable)
                .map(taskMapper::toResponseDTO);

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
}

