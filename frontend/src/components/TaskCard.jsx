import React from 'react'
import { format, isPast, parseISO } from 'date-fns'

// Safely convert string, Date object, or timestamp → Date
function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') return parseISO(value)
  return new Date(value)
}


const statusBadge = {
  TODO:        'badge-todo',
  IN_PROGRESS: 'badge-inprogress',
  DONE:        'badge-done',
}
const priorityBadge = {
  HIGH:   'badge-high',
  MEDIUM: 'badge-medium',
  LOW:    'badge-low',
}
const statusLabel = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && task.status !== 'DONE' && isPast(toDate (task.dueDate))

  const nextStatus = {
    TODO:        'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE:        null,
  }[task.status]

  return (
    <div className={`card hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
            ✏️
          </button>
          <button onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">
            🗑️
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex items-center flex-wrap gap-2">
        <span className={statusBadge[task.status] || 'badge-todo'}>
          {statusLabel[task.status] || task.status}
        </span>
        <span className={priorityBadge[task.priority] || 'badge-medium'}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {format(toDate(task.dueDate), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Quick status advance */}
      {nextStatus && (
        <button
          onClick={() => onStatusChange(task.id, nextStatus)}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          → Mark as {statusLabel[nextStatus]}
        </button>
      )}
    </div>
  )
}
