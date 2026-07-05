package com.example.todoapp.mapper;

import com.example.todoapp.dto.request.TaskRequestDTO;
import com.example.todoapp.dto.response.TaskResponseDTO;
import com.example.todoapp.entity.Task;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-05T18:41:34+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.1 (Oracle Corporation)"
)
@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public Task toEntity(TaskRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Task.TaskBuilder task = Task.builder();

        task.title( dto.getTitle() );
        task.description( dto.getDescription() );
        task.priority( dto.getPriority() );

        return task.build();
    }

    @Override
    public TaskResponseDTO toResponseDTO(Task task) {
        if ( task == null ) {
            return null;
        }

        TaskResponseDTO taskResponseDTO = new TaskResponseDTO();

        taskResponseDTO.setId( task.getId() );
        taskResponseDTO.setTitle( task.getTitle() );
        taskResponseDTO.setDescription( task.getDescription() );
        taskResponseDTO.setStatus( task.getStatus() );
        taskResponseDTO.setPriority( task.getPriority() );
        taskResponseDTO.setCreatedAt( task.getCreatedAt() );
        taskResponseDTO.setUpdatedAt( task.getUpdatedAt() );

        return taskResponseDTO;
    }
}
