package com.taskportal.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskportal.backend.dto.AiSuggestionResponse;
import com.taskportal.backend.model.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    // ─── PUBLIC ENTRY POINT ─────────────────────────────────────────────────────

    /**
     * Analyse all tasks for a user and return AI-powered suggestions.
     * Falls back to rule-based logic if Gemini is unavailable.
     */
    public AiSuggestionResponse getSmartSuggestions(List<Task> tasks) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            log.warn("Gemini API key not configured — using fallback suggestions");
            return buildFallbackSuggestions(tasks);
        }

        try {
            return callGeminiForSuggestions(tasks);
        } catch (Exception e) {
            log.error("Gemini API call failed: {} — falling back to rule-based suggestions", e.getMessage());
            return buildFallbackSuggestions(tasks);
        }
    }

    /**
     * Generate description, priority and effort estimate for a task title.
     * Used for AI Task Description Generator (Option A).
     */
    public Map<String, String> generateTaskDescription(String title) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            return buildFallbackDescription(title);
        }

        try {
            return callGeminiForDescription(title);
        } catch (Exception e) {
            log.error("Gemini description call failed: {}", e.getMessage());
            return buildFallbackDescription(title);
        }
    }

    // ─── GEMINI CALLS ───────────────────────────────────────────────────────────

    private AiSuggestionResponse callGeminiForSuggestions(List<Task> tasks) throws Exception {
        String prompt = buildSuggestionsPrompt(tasks);

        String rawJson = callGemini(prompt);

        // Parse Gemini's JSON text response
        return parseGeminiSuggestionsResponse(rawJson, tasks);
    }

 // AFTER
    private Map<String, String> callGeminiForDescription(String title) throws Exception {
        String prompt = String.format("""
            You are an expert personal productivity coach and task planner.
            
            A user has created a task titled: "%s"
            
            Your job is to intelligently expand this into a fully actionable task. Think about:
            - What this task actually involves in real life
            - Specific steps or actions the person needs to take
            - What a realistic, motivated person would do to complete it
            
            Generate:
            1. A rich, specific, actionable description (2-4 sentences). Be concrete — mention 
               real sub-actions, tools, or goals. For example, if the title is "Gym", say what 
               workout to do, how long, what to track. If it's "Read book", mention focus, 
               notes, chapters. Make it feel personal and useful, not generic.
            2. Priority: LOW, MEDIUM, or HIGH — based on how health/career/life-impacting this task is
            3. Estimated effort: realistic time to complete (e.g., "45 minutes", "2 hours", "1 day")
            
            Respond ONLY in this exact JSON format (no markdown, no extra text):
            {
              "description": "...",
              "priority": "HIGH",
              "estimatedEffort": "45 minutes"
            }
            """, title);

        String rawJson = callGemini(prompt);
        // Strip markdown fences if present
        rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        JsonNode node = objectMapper.readTree(rawJson);
        Map<String, String> result = new HashMap<>();
        result.put("description", node.path("description").asText("Auto-generated description"));
        result.put("priority", node.path("priority").asText("MEDIUM").toUpperCase());
        result.put("estimatedEffort", node.path("estimatedEffort").asText("Unknown"));
        return result;
    }

    private String callGemini(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Gemini request body
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                GEMINI_URL + geminiApiKey, entity, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("candidates").get(0)
                   .path("content").path("parts").get(0)
                   .path("text").asText();
    }

    // ─── PROMPT BUILDER ─────────────────────────────────────────────────────────

    private String buildSuggestionsPrompt(List<Task> tasks) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            You are a smart project management AI. Analyse these tasks and return suggestions.

            Tasks:
            """);

        for (Task t : tasks) {
            sb.append(String.format("- ID:%d | Title:%s | Priority:%s | Status:%s | DueDate:%s%n",
                    t.getId(), t.getTitle(), t.getPriority(), t.getStatus(),
                    t.getDueDate() != null ? t.getDueDate().toString() : "none"));
        }

        sb.append("""

            Respond ONLY in this exact JSON (no markdown fences, no extra text):
            {
              "prioritySuggestions": [
                {"taskId": 1, "taskTitle": "...", "currentPriority": "LOW", "suggestedPriority": "HIGH", "reason": "..."}
              ],
              "duplicateWarnings": [
                {"taskIds": [2,3], "taskTitles": ["...", "..."], "reason": "..."}
              ],
              "dueDateRisks": [
                {"taskId": 4, "taskTitle": "...", "riskLevel": "HIGH", "message": "..."}
              ]
            }
            If there are no items for a category, return an empty array [].
            """);

        return sb.toString();
    }

    // ─── RESPONSE PARSER ────────────────────────────────────────────────────────

    private AiSuggestionResponse parseGeminiSuggestionsResponse(String rawJson, List<Task> tasks) {
        try {
            String cleaned = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode root = objectMapper.readTree(cleaned);

            List<AiSuggestionResponse.PrioritySuggestion> priorities = new ArrayList<>();
            for (JsonNode n : root.path("prioritySuggestions")) {
                priorities.add(new AiSuggestionResponse.PrioritySuggestion(
                        n.path("taskId").asLong(),
                        n.path("taskTitle").asText(),
                        n.path("currentPriority").asText(),
                        n.path("suggestedPriority").asText(),
                        n.path("reason").asText()
                ));
            }

            List<AiSuggestionResponse.DuplicateWarning> duplicates = new ArrayList<>();
            for (JsonNode n : root.path("duplicateWarnings")) {
                List<Long> ids = new ArrayList<>();
                List<String> titles = new ArrayList<>();
                for (JsonNode id : n.path("taskIds")) ids.add(id.asLong());
                for (JsonNode t : n.path("taskTitles")) titles.add(t.asText());
                duplicates.add(new AiSuggestionResponse.DuplicateWarning(ids, titles, n.path("reason").asText()));
            }

            List<AiSuggestionResponse.DueDateRisk> risks = new ArrayList<>();
            for (JsonNode n : root.path("dueDateRisks")) {
                risks.add(new AiSuggestionResponse.DueDateRisk(
                        n.path("taskId").asLong(),
                        n.path("taskTitle").asText(),
                        n.path("riskLevel").asText(),
                        n.path("message").asText()
                ));
            }

            AiSuggestionResponse resp = new AiSuggestionResponse(priorities, duplicates, risks, false);
            return resp;

        } catch (Exception e) {
            log.error("Failed to parse Gemini response, using fallback: {}", e.getMessage());
            return buildFallbackSuggestions(tasks);
        }
    }

    // ─── FALLBACK (RULE-BASED) ──────────────────────────────────────────────────

    private AiSuggestionResponse buildFallbackSuggestions(List<Task> tasks) {
        List<AiSuggestionResponse.PrioritySuggestion> priorities = new ArrayList<>();
        List<AiSuggestionResponse.DuplicateWarning> duplicates = new ArrayList<>();
        List<AiSuggestionResponse.DueDateRisk> risks = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Task task : tasks) {
            if (task.getStatus() == Task.Status.DONE) continue;

            // Due date risk check
            if (task.getDueDate() != null) {
                long daysUntilDue = ChronoUnit.DAYS.between(today, task.getDueDate());

                if (daysUntilDue < 0) {
                    risks.add(new AiSuggestionResponse.DueDateRisk(
                            task.getId(), task.getTitle(), "CRITICAL",
                            "This task is " + Math.abs(daysUntilDue) + " day(s) overdue!"));
                } else if (daysUntilDue <= 1) {
                    risks.add(new AiSuggestionResponse.DueDateRisk(
                            task.getId(), task.getTitle(), "HIGH",
                            "Due date is tomorrow or today — immediate attention needed!"));
                } else if (daysUntilDue <= 3) {
                    risks.add(new AiSuggestionResponse.DueDateRisk(
                            task.getId(), task.getTitle(), "MEDIUM",
                            "Due in " + daysUntilDue + " days — consider prioritizing."));
                }

                // Suggest higher priority if due soon but priority is LOW
                if (daysUntilDue <= 2 && task.getPriority() == Task.Priority.LOW) {
                    priorities.add(new AiSuggestionResponse.PrioritySuggestion(
                            task.getId(), task.getTitle(),
                            "LOW", "HIGH",
                            "Task is due in " + daysUntilDue + " day(s) but priority is LOW"));
                }
            }
        }

        // Duplicate detection — check similar titles (simple contains check)
        List<Task> pending = tasks.stream()
                .filter(t -> t.getStatus() != Task.Status.DONE).toList();
        for (int i = 0; i < pending.size(); i++) {
            for (int j = i + 1; j < pending.size(); j++) {
                String t1 = pending.get(i).getTitle().toLowerCase();
                String t2 = pending.get(j).getTitle().toLowerCase();
                if (t1.contains(t2) || t2.contains(t1) || areSimilar(t1, t2)) {
                    duplicates.add(new AiSuggestionResponse.DuplicateWarning(
                            List.of(pending.get(i).getId(), pending.get(j).getId()),
                            List.of(pending.get(i).getTitle(), pending.get(j).getTitle()),
                            "These tasks have very similar titles — possible duplicate"));
                }
            }
        }

        return new AiSuggestionResponse(priorities, duplicates, risks, true);
    }

    private boolean areSimilar(String a, String b) {
        // Simple word overlap check
        Set<String> wordsA = new HashSet<>(Arrays.asList(a.split("\\s+")));
        Set<String> wordsB = new HashSet<>(Arrays.asList(b.split("\\s+")));
        long common = wordsA.stream().filter(wordsB::contains).count();
        int minLen = Math.min(wordsA.size(), wordsB.size());
        return minLen > 0 && (double) common / minLen >= 0.7;
    }

 // AFTER
    private Map<String, String> buildFallbackDescription(String title) {
        String lower = title.toLowerCase().trim();

        String description;
        String priority;
        String effort;

        // Health & fitness
        if (lower.matches(".*(gym|workout|exercise|run|jog|yoga|swim|cycling|lift|training).*")) {
            description = "Complete a full workout session including warm-up, main exercise sets, and cool-down stretching. Track your reps, sets, and weights to monitor progress over time. Stay hydrated and maintain proper form throughout.";
            priority = "HIGH";
            effort = "1 hour";

        // Study & learning
        } else if (lower.matches(".*(study|learn|read|course|lecture|exam|revision|practice|research).*")) {
            description = "Dedicate focused time to study this topic without distractions. Take structured notes, highlight key concepts, and summarize what you've learned at the end of the session. Review previous notes before starting.";
            priority = "HIGH";
            effort = "2 hours";

        // Work & meetings
        } else if (lower.matches(".*(meeting|call|presentation|report|email|project|deadline|client|review).*")) {
            description = "Prepare thoroughly for this work task by gathering all required materials and information in advance. Define the key outcomes you want to achieve and follow up with stakeholders after completion.";
            priority = "HIGH";
            effort = "1-2 hours";

        // Shopping & errands
        } else if (lower.matches(".*(grocery|shopping|buy|order|pick up|errand|store|market).*")) {
            description = "Make a checklist of all items needed before heading out. Group items by category to save time. Check for any discounts or offers, and ensure you stay within budget.";
            priority = "MEDIUM";
            effort = "45 minutes";

        // Cooking & meals
        } else if (lower.matches(".*(cook|meal|recipe|breakfast|lunch|dinner|food|bake|prep).*")) {
            description = "Plan and prepare the meal by gathering all ingredients first. Follow the recipe step by step, manage cooking times carefully, and clean up the workspace as you go.";
            priority = "MEDIUM";
            effort = "1 hour";

        // Cleaning & chores
        } else if (lower.matches(".*(clean|wash|laundry|organize|tidy|declutter|dishes|vacuum|mop).*")) {
            description = "Set a timer and systematically work through each area. Gather all supplies before starting. Focus on one zone at a time and do a final check to make sure everything is in order.";
            priority = "LOW";
            effort = "30-45 minutes";

        // Finance & bills
        } else if (lower.matches(".*(pay|bill|invoice|budget|finance|tax|bank|money|expense).*")) {
            description = "Review all relevant accounts and documents before making any payments. Verify amounts, check due dates, and keep a record of all transactions completed. Set a reminder for next month.";
            priority = "HIGH";
            effort = "30 minutes";

        // Social & personal
        } else if (lower.matches(".*(call|text|friend|family|birthday|gift|party|visit|catch up).*")) {
            description = "Set aside quality time for this personal connection. Prepare any gifts or messages in advance if needed. Be fully present and make it a meaningful interaction.";
            priority = "MEDIUM";
            effort = "1 hour";

        // Default smart fallback
        } else {
            description = String.format(
                "Complete the task '%s' by breaking it into clear steps and tackling each one systematically. " +
                "Set a specific time block for this task, minimize distractions, and mark it done once all steps are finished.",
                title);
            priority = "MEDIUM";
            effort = "1-2 hours";
        }

        return Map.of(
            "description", description,
            "priority", priority,
            "estimatedEffort", effort
        );
    }
}
