package com.example.todoapp.mapper;

import com.example.todoapp.constant.Priority;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper giữa {@link Task} entity và các DTO.
 *
 * <p>{@code componentModel = "spring"} → MapStruct sinh class implement và đăng ký
 * nó như một Spring bean — có thể @Autowired / @RequiredArgsConstructor bình thường.
 */
@Mapper(componentModel = "spring")
public interface TaskMapper {

    /**
     * Chuyển request DTO sang entity để persist.
     *
     * <p>Các field không map từ DTO:
     * <ul>
     *   <li>{@code id} — do DB auto-generate.</li>
     *   <li>{@code status} — luôn là {@code PENDING} khi tạo mới; service set.</li>
     *   <li>{@code version} — Hibernate quản lý.</li>
     *   <li>{@code createdAt / updatedAt} — @PrePersist / @PreUpdate xử lý.</li>
     *   <li>{@code deletedAt} — luôn null khi tạo mới.</li>
     * </ul>
     *
     * <p>{@code priority}: nếu DTO truyền null, service chịu trách nhiệm set
     * {@code Priority.MEDIUM} trước khi gọi mapper này — hoặc dùng
     * {@code @Mapping(defaultValue = "MEDIUM")} nếu muốn xử lý ở mapper.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Task toEntity(TaskRequestDTO dto);

    /**
     * Chuyển entity sang response DTO để trả ra API.
     * MapStruct tự map các field cùng tên và cùng type.
     * Field {@code version} và {@code deletedAt} không có trong
     * {@link TaskResponseDTO} nên tự động bị bỏ qua.
     */
    TaskResponseDTO toResponseDTO(Task task);
}
