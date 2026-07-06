package com.example.todoapp.service;

import com.example.todoapp.constant.TaskSortField;
import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.PageResponseDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.entity.Task;
import com.example.todoapp.repository.TaskRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Kiểm thử tính năng due date:
 * 1. Sort DUE_DATE ASC: task có deadline gần nhất lên đầu, task không có deadline xuống cuối.
 * 2. Set dueDate về null qua updateTask → DB lưu đúng NULL.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TaskDueDateTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EntityManager entityManager;

    // ── Helper để tạo task nhanh qua repository ──────────────────────────────

    private Task saveTask(String title, LocalDate dueDate) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription("");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setDueDate(dueDate);
        return taskRepository.save(task);
    }

    // ── Test 1: Sort DUE_DATE ASC với NULLS LAST ─────────────────────────────

    @Test
    public void testSortByDueDateAsc_nullsGoLast() {
        LocalDate today   = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate nextWeek = today.plusDays(7);

        Task taskNoDate  = saveTask("Task không có deadline", null);
        Task taskNext    = saveTask("Task hạn tuần sau", nextWeek);
        Task taskTomorrow = saveTask("Task hạn ngày mai", tomorrow);

        entityManager.flush();
        entityManager.clear();

        PageResponseDTO<TaskResponseDTO> result = taskService.getTasks(
                null, null, TaskSortField.DUE_DATE, Sort.Direction.ASC, 0, 10
        );

        List<TaskResponseDTO> tasks = result.getContent();
        assertTrue(tasks.size() >= 3, "Phải có ít nhất 3 task");

        // Lọc ra 3 task vừa tạo theo title để kiểm tra thứ tự
        List<TaskResponseDTO> relevant = tasks.stream()
                .filter(t -> t.getId().equals(taskTomorrow.getId())
                          || t.getId().equals(taskNext.getId())
                          || t.getId().equals(taskNoDate.getId()))
                .toList();

        assertEquals(3, relevant.size());

        // Task ngày mai phải trước task tuần sau
        int idxTomorrow = indexById(relevant, taskTomorrow.getId());
        int idxNextWeek = indexById(relevant, taskNext.getId());
        int idxNoDate   = indexById(relevant, taskNoDate.getId());

        assertTrue(idxTomorrow < idxNextWeek, "Task ngày mai phải trước task tuần sau");
        assertTrue(idxNextWeek < idxNoDate,   "Task tuần sau phải trước task không có deadline");
    }

    @Test
    public void testSortByDueDateDesc_nullsGoLast() {
        LocalDate today    = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate nextWeek = today.plusDays(7);

        Task taskNoDate   = saveTask("DESC Task không có deadline", null);
        Task taskYesterday = saveTask("DESC Task qua hôm qua", yesterday);
        Task taskNextWeek  = saveTask("DESC Task tuần sau", nextWeek);

        entityManager.flush();
        entityManager.clear();

        PageResponseDTO<TaskResponseDTO> result = taskService.getTasks(
                null, null, TaskSortField.DUE_DATE, Sort.Direction.DESC, 0, 10
        );

        List<TaskResponseDTO> tasks = result.getContent();
        List<TaskResponseDTO> relevant = tasks.stream()
                .filter(t -> t.getId().equals(taskYesterday.getId())
                          || t.getId().equals(taskNextWeek.getId())
                          || t.getId().equals(taskNoDate.getId()))
                .toList();

        assertEquals(3, relevant.size());

        // DESC: tuần sau trước hôm qua, nhưng null vẫn phải cuối
        int idxNextWeek  = indexById(relevant, taskNextWeek.getId());
        int idxYesterday = indexById(relevant, taskYesterday.getId());
        int idxNoDate    = indexById(relevant, taskNoDate.getId());

        assertTrue(idxNextWeek < idxYesterday, "DESC: task tuần sau phải trước task hôm qua");
        assertTrue(idxYesterday < idxNoDate,   "Task null luôn xếp cuối dù DESC");
    }

    // ── Test 2: Cập nhật dueDate về null ─────────────────────────────────────

    @Test
    public void testSetDueDateToNull_clearsDeadline() {
        LocalDate nextWeek = LocalDate.now().plusDays(7);
        Task task = saveTask("Task có deadline", nextWeek);

        entityManager.flush();
        entityManager.clear();

        // Tạo DTO update với dueDate = null (xóa deadline)
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setTitle(task.getTitle());
        dto.setDescription("");
        dto.setDueDate(null);   // tường minh set null

        TaskResponseDTO updated = taskService.updateTask(task.getId(), dto);

        assertNull(updated.getDueDate(), "dueDate phải là null sau khi update");

        // Xác nhận DB cũng lưu NULL
        entityManager.flush();
        entityManager.clear();

        Task fromDb = taskRepository.findById(task.getId()).orElseThrow();
        assertNull(fromDb.getDueDate(), "DB phải lưu NULL, không phải giá trị cũ");
    }

    // ── Test 3: Task cũ không có dueDate vẫn hiển thị bình thường ────────────

    @Test
    public void testOldTaskWithNullDueDate_appearsInList() {
        Task task = saveTask("Task không có deadline (dữ liệu cũ)", null);

        entityManager.flush();
        entityManager.clear();

        PageResponseDTO<TaskResponseDTO> result = taskService.getTasks(
                null, null, TaskSortField.CREATED_AT, Sort.Direction.DESC, 0, 10
        );

        boolean found = result.getContent().stream()
                .anyMatch(t -> t.getId().equals(task.getId()));

        assertTrue(found, "Task không có deadline vẫn phải xuất hiện trong danh sách");
    }

    // ── Util ──────────────────────────────────────────────────────────────────

    private int indexById(List<TaskResponseDTO> list, Long id) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId().equals(id)) return i;
        }
        return -1;
    }
}
