package com.taskportal.backend.controller;

import com.taskportal.backend.dto.TaskRequest;
import com.taskportal.backend.model.Task;
import com.taskportal.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /api/tasks
     * Returns all tasks for the authenticated user.
     * Optional ?status=TODO|IN_PROGRESS|DONE filter.
     */
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        List<Task> tasks = (status != null)
                ? taskService.getTasksByStatus(username, status)
                : taskService.getAllTasks(username);

        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/{id}
     * Returns a specific task by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        Task task = taskService.getTaskById(id, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    /**
     * POST /api/tasks
     * Create a new task.
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        Task task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(task);
    }

    /**
     * PUT /api/tasks/{id}
     * Update an existing task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @RequestBody TaskRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        Task task = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
