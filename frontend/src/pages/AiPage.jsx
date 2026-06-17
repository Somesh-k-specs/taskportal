import React, { useState } from 'react'
import { aiApi } from '../services/api'
import toast from 'react-hot-toast'

const riskColor = {
  CRITICAL: 'bg-red-100 border-red-300 text-red-800',
  HIGH:     'bg-orange-100 border-orange-300 text-orange-800',
  MEDIUM:   'bg-yellow-100 border-yellow-300 text-yellow-800',
  LOW:      'bg-green-100 border-green-300 text-green-800',
}

export default function AiPage() {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading]         = useState(false)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const { data } = await aiApi.getSuggestions()
      setSuggestions(data)
      if (data.isFallback) {
        toast('Using rule-based suggestions (Gemini not configured)', { icon: '⚡' })
      } else {
        toast.success('AI analysis complete!')
      }
    } catch {
      toast.error('Failed to fetch AI suggestions')
    } finally {
      setLoading(false)
    }
  }

  const totalInsights = suggestions
    ? (suggestions.prioritySuggestions?.length || 0)
      + (suggestions.duplicateWarnings?.length || 0)
      + (suggestions.dueDateRisks?.length || 0)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI Assistant</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Smart analysis of your tasks — priority suggestions, duplicate detection, and due date alerts.
        </p>
      </div>

      {/* Trigger card */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Smart Task Analysis</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Let AI review all your tasks and surface actionable insights.
          </p>
        </div>
        <button onClick={fetchSuggestions} disabled={loading}
          className="btn-primary flex items-center gap-2 whitespace-nowrap">
          {loading
            ? <><span className="animate-spin inline-block">⟳</span> Analysing…</>
            : <><span>✨</span> Run AI Analysis</>}
        </button>
      </div>

      {suggestions && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Priority Suggestions', count: suggestions.prioritySuggestions?.length || 0, icon: '⚡' },
              { label: 'Duplicate Warnings',   count: suggestions.duplicateWarnings?.length   || 0, icon: '👥' },
              { label: 'Due Date Risks',        count: suggestions.dueDateRisks?.length        || 0, icon: '⏰' },
            ].map(({ label, count, icon }) => (
              <div key={label} className="card text-center">
                <div className="text-2xl">{icon}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {totalInsights === 0 ? (
            <div className="card flex flex-col items-center py-10 text-gray-400">
              <span className="text-4xl mb-2">🎉</span>
              <p className="font-medium text-gray-700">Everything looks great!</p>
              <p className="text-sm mt-1">No issues found with your current tasks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Priority Suggestions */}
              {suggestions.prioritySuggestions?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    ⚡ Priority Suggestions
                  </h3>
                  <div className="space-y-2">
                    {suggestions.prioritySuggestions.map((s, i) => (
                      <div key={i} className="card border-l-4 border-blue-400 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{s.taskTitle}</span>
                          <span className="text-xs text-gray-400">#{s.taskId}</span>
                          <span className="badge-low">{s.currentPriority}</span>
                          <span className="text-gray-400">→</span>
                          <span className="badge-high">{s.suggestedPriority}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Duplicate Warnings */}
              {suggestions.duplicateWarnings?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    👥 Possible Duplicates
                  </h3>
                  <div className="space-y-2">
                    {suggestions.duplicateWarnings.map((w, i) => (
                      <div key={i} className="card border-l-4 border-yellow-400 py-3">
                        <div className="flex flex-wrap gap-2 mb-1">
                          {w.taskTitles.map((t, j) => (
                            <span key={j} className="text-sm font-medium bg-yellow-50 px-2 py-0.5 rounded">
                              {t} <span className="text-gray-400 text-xs">#{w.taskIds[j]}</span>
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">{w.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Due Date Risks */}
              {suggestions.dueDateRisks?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    ⏰ Due Date Risks
                  </h3>
                  <div className="space-y-2">
                    {suggestions.dueDateRisks.map((r, i) => (
                      <div key={i}
                        className={`rounded-xl border px-4 py-3 ${riskColor[r.riskLevel] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{r.taskTitle}</span>
                          <span className="text-xs opacity-70">#{r.taskId}</span>
                          <span className="text-xs font-bold ml-auto">{r.riskLevel}</span>
                        </div>
                        <p className="text-sm mt-1 opacity-80">{r.message}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {suggestions.isFallback && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              ⚡ Running on rule-based fallback — add your Gemini API key in <code>application.properties</code> for full AI analysis.
            </p>
          )}
        </>
      )}
    </div>
  )
}
