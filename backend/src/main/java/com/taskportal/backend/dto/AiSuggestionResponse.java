package com.taskportal.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiSuggestionResponse {

    private List<PrioritySuggestion> prioritySuggestions;
    private List<DuplicateWarning> duplicateWarnings;
    private List<DueDateRisk> dueDateRisks;
    private boolean isFallback;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PrioritySuggestion {
        private Long taskId;
        private String taskTitle;
        private String currentPriority;
        private String suggestedPriority;
        private String reason;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DuplicateWarning {
        private List<Long> taskIds;
        private List<String> taskTitles;
        private String reason;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DueDateRisk {
        private Long taskId;
        private String taskTitle;
        private String riskLevel;
        private String message;
    }
}