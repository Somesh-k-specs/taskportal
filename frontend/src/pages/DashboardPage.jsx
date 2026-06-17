import React, { useState, useEffect, useCallback } from 'react'
import { taskApi } from '../services/api'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const STATUS_TABS = [
  { key: null,          label: 'All' },
  { key: 'TODO',        label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE',        label: 'Done' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState(null)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editTask, setEditTask]     = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await taskApi.getAll(activeTab)
      setTasks(data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleCreate = async (form) => {
    try {
      await taskApi.create(form)
      toast.success('Task created!')
      setShowModal(false)
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task')
    }
  }

  const handleUpdate = async (form) => {
    try {
      await taskApi.update(editTask.id, form)
      toast.success('Task updated!')
      setEditTask(null)
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await taskApi.delete(id)
      toast.success('Task deleted')
      fetchTasks()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskApi.update(id, { status: newStatus })
      toast.success('Status updated')
      fetchTasks()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done:       tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's your task overview</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> New Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: stats.total,      color: 'bg-blue-50 text-blue-700'   },
          { label: 'To Do',       value: stats.todo,       color: 'bg-gray-50 text-gray-700'   },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Done',        value: stats.done,       color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 text-center`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map(({ key, label }) => (
            <button key={String(key)} onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input type="text" placeholder="🔍 Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field flex-1 sm:max-w-xs"
        />
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          Loading tasks…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <span className="text-4xl mb-2">📭</span>
          <p>{search ? 'No tasks match your search' : 'No tasks yet — create one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={t => setEditTask(t)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <TaskModal onClose={() => setShowModal(false)} onSave={handleCreate} />
      )}
      {editTask && (
        <TaskModal task={editTask} onClose={() => setEditTask(null)} onSave={handleUpdate} />
      )}
    </div>
  )
}
