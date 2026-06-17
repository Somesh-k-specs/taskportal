package com.taskportal.backend.controller;

import com.taskportal.backend.dto.AiSuggestionResponse;
import com.taskportal.backend.model.Task;
import com.taskportal.backend.service.AiService;
import com.taskportal.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final TaskService taskService;

    /**
     * GET /api/ai/suggestions
     * Returns AI-powered smart suggestions for the user's tasks.
     * Includes: priority suggestions, duplicate warnings, due date risks.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<AiSuggestionResponse> getSuggestions(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Task> tasks = taskService.getAllTasks(userDetails.getUsername());
        AiSuggestionResponse response = aiService.getSmartSuggestions(tasks);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/ai/generate-description
     * Body: { "title": "Prepare client presentation" }
     * Returns AI-generated description, priority, and estimated effort.
     */
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String title = body.get("title");
        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        Map<String, String> result = aiService.generateTaskDescription(title);
        return ResponseEntity.ok(result);
    }
}
