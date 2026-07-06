package com.example.todoapp.service;

import com.example.todoapp.dto.response.TaskByDateGroupDTO;
import com.example.todoapp.entity.Task;
import com.example.todoapp.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class TaskByDateTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @AfterEach
    public void cleanup() {
        taskRepository.deleteAll();
    }

    @Test
    @Transactional
    public void testGetTasksByDateRange_GroupsCorrectlyAndFillsEmptyDays() {
        LocalDate fromDate = LocalDate.of(2026, 7, 1);
        LocalDate toDate = LocalDate.of(2026, 7, 5);

        // Tạo 2 task vào ngày 2/7
        Task t1 = new Task();
        t1.setTitle("Task 1");
        t1.setDueDate(LocalDate.of(2026, 7, 2));
        t1.setCreatedAt(LocalDateTime.now());
        t1.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(t1);

        Task t2 = new Task();
        t2.setTitle("Task 2");
        t2.setDueDate(LocalDate.of(2026, 7, 2));
        t2.setCreatedAt(LocalDateTime.now());
        t2.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(t2);

        // Tạo 1 task vào ngày 4/7
        Task t3 = new Task();
        t3.setTitle("Task 3");
        t3.setDueDate(LocalDate.of(2026, 7, 4));
        t3.setCreatedAt(LocalDateTime.now());
        t3.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(t3);

        List<TaskByDateGroupDTO> groups = taskService.getTasksByDateRange(fromDate, toDate);

        // Phải có 5 phần tử cho 5 ngày (1, 2, 3, 4, 5)
        assertEquals(5, groups.size());

        // Ngày 1/7: trống
        assertEquals(LocalDate.of(2026, 7, 1), groups.get(0).getDate());
        assertTrue(groups.get(0).getTasks().isEmpty());

        // Ngày 2/7: 2 task
        assertEquals(LocalDate.of(2026, 7, 2), groups.get(1).getDate());
        assertEquals(2, groups.get(1).getTasks().size());

        // Ngày 3/7: trống
        assertEquals(LocalDate.of(2026, 7, 3), groups.get(2).getDate());
        assertTrue(groups.get(2).getTasks().isEmpty());

        // Ngày 4/7: 1 task
        assertEquals(LocalDate.of(2026, 7, 4), groups.get(3).getDate());
        assertEquals(1, groups.get(3).getTasks().size());

        // Ngày 5/7: trống
        assertEquals(LocalDate.of(2026, 7, 5), groups.get(4).getDate());
        assertTrue(groups.get(4).getTasks().isEmpty());
    }

    @Test
    public void testGetTasksByDateRange_Validation_FromDateAfterToDate() {
        LocalDate fromDate = LocalDate.of(2026, 7, 5);
        LocalDate toDate = LocalDate.of(2026, 7, 1);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            taskService.getTasksByDateRange(fromDate, toDate);
        });
        assertTrue(ex.getMessage().contains("phải trước hoặc bằng toDate"));
    }

    @Test
    public void testGetTasksByDateRange_Validation_Exceeds90Days() {
        LocalDate fromDate = LocalDate.of(2026, 1, 1);
        LocalDate toDate = LocalDate.of(2026, 5, 1); // > 90 days

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            taskService.getTasksByDateRange(fromDate, toDate);
        });
        assertTrue(ex.getMessage().contains("Khoảng cách tối đa là 90 ngày"));
    }
}
