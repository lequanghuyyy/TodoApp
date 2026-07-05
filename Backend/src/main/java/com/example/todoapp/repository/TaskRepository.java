package com.example.todoapp.repository;

import com.example.todoapp.constant.TaskStatus;
import com.example.todoapp.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);

    @Query(value = "SELECT * FROM tasks WHERE id = :id", nativeQuery = true)
    Optional<Task> findByIdIncludeDeleted(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Task t SET t.deletedAt = :now WHERE t.id = :id AND t.deletedAt IS NULL")
    int softDeleteById(@Param("id") Long id, @Param("now") LocalDateTime now);
}
