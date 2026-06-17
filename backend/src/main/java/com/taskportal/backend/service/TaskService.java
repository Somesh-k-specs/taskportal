package com.taskportal.backend.service;

import com.taskportal.backend.dto.TaskRequest;
import com.taskportal.backend.exception.ResourceNotFoundException;
import com.taskportal.backend.model.Task;
import com.taskportal.backend.model.User;
import com.taskportal.backend.repository.TaskRepository;
import com.taskportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // ─── CREATE ────────────────────────────────────────────────────────────────

    public Task createTask(TaskRequest request, String username) {
        User user = getUser(username);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(Task.Priority.valueOf(
                request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM"));
        task.setStatus(Task.Status.valueOf(
                request.getStatus() != null ? request.getStatus().toUpperCase() : "TODO"));
        task.setDueDate(request.getDueDate());
        task.setUser(user);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    // ─── READ ───────────────────────────────────────────────────────────────────

    public List<Task> getAllTasks(String username) {
        return taskRepository.findByUserUsername(username);
    }

    public List<Task> getTasksByStatus(String username, String status) {
        Task.Status taskStatus = Task.Status.valueOf(status.toUpperCase());
        return taskRepository.findByUserUsernameAndStatus(username, taskStatus);
    }

    public Task getTaskById(Long id, String username) {
        return taskRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    // ─── UPDATE ─────────────────────────────────────────────────────────────────

    public Task updateTask(Long id, TaskRequest request, String username) {
        Task task = getTaskById(id, username);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
        }
        if (request.getStatus() != null) {
            task.setStatus(Task.Status.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────────

    public void deleteTask(Long id, String username) {
        Task task = getTaskById(id, username);
        taskRepository.delete(task);
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
