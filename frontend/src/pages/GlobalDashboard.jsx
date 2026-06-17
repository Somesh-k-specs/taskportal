import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const features = [
  {
    icon: '📋',
    title: 'Task Management',
    desc: 'Create, edit, and organize tasks with priorities, due dates, and status tracking — all in one clean board.',
  },
  {
    icon: '🤖',
    title: 'AI Auto-Fill',
    desc: 'Type a task title like "Gym" or "Study Math" and let AI instantly generate a detailed description, priority, and effort estimate.',
  },
  {
    icon: '🧠',
    title: 'Smart Suggestions',
    desc: 'AI scans your task list and flags overdue risks, duplicate tasks, and priority mismatches before they become problems.',
  },
  {
    icon: '⚡',
    title: 'Quick Status Updates',
    desc: 'Move tasks from To Do → In Progress → Done with a single click. No drag-and-drop friction.',
  },
  {
    icon: '⚠️',
    title: 'Overdue Detection',
    desc: 'Tasks past their due date are automatically highlighted in red so nothing slips through the cracks.',
  },
  {
    icon: '💬',
    title: 'AI Assistant Chat',
    desc: 'Ask your AI assistant anything about your tasks — "What\'s due this week?" or "Which task should I do first?"',
  },
]

const steps = [
  { step: '1', title: 'Create an account', desc: 'Register with your email and password in under 30 seconds.' },
  { step: '2', title: 'Add your tasks', desc: 'Enter task titles and let AI auto-fill the details, or write your own.' },
  { step: '3', title: 'Track & complete', desc: 'Move tasks through statuses, get AI suggestions, and stay on top of deadlines.' },
]

const faqs = [
  {
    q: 'Is TaskPortal free to use?',
    a: 'Yes — TaskPortal is completely free. Create an account and start managing your tasks right away.',
  },
  {
    q: 'How does the AI auto-fill work?',
    a: 'When you type a task title and click "Auto-fill with AI", our backend sends the title to Gemini AI which generates a smart description, recommends a priority level, and estimates the effort needed.',
  },
  {
    q: 'Can I use TaskPortal without logging in?',
    a: 'You can browse this page and explore the documentation. To create or manage tasks, you need a free account.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your tasks are tied to your account and are only visible to you. We never share your data.',
  },
  {
    q: 'What happens if I miss a deadline?',
    a: 'Tasks past their due date are automatically flagged with a red ⚠️ warning on your dashboard so you always know what needs attention.',
  },
]

export default function GlobalDashboard() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const docsRef = useRef(null)

  const handleNewTask = () => {
    if (!isAuthenticated) {
      toast.error('Please log in before creating a task')
      setTimeout(() => navigate('/login'), 1200)
    } else {
      navigate('/dashboard')
    }
  }

  const scrollToDocs = () => {
    docsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* subtle grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>✨</span> AI-Powered Task Management
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Get things done.<br />
            <span className="text-yellow-300">Let AI handle the rest.</span>
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            TaskPortal is a smart personal task manager that uses AI to auto-fill task details,
            detect risks, suggest priorities, and keep you focused on what matters.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-all">
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/register')}
                  className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-all">
                  Get Started Free →
                </button>
                <button onClick={() => navigate('/login')}
                  className="px-8 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                  Sign In
                </button>
              </>
            )}
            <button onClick={scrollToDocs}
              className="px-8 py-3.5 border border-white/30 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-all text-sm">
              Read the Docs ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-gray-200 text-center">
          {[
            { value: 'AI-First', label: 'Task creation' },
            { value: '3-Step', label: 'Workflow' },
            { value: 'Real-time', label: 'Risk detection' },
          ].map(({ value, label }) => (
            <div key={label} className="px-4">
              <p className="text-2xl font-bold text-blue-700">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={docsRef} className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to stay on track</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Built for people who want to move fast without losing track of what matters.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 transition-colors">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">Up and running in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-blue-200">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why TaskPortal ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Why TaskPortal?</p>
          <h2 className="text-3xl font-bold text-gray-900">Built for real productivity</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: '🎯', title: 'No clutter', desc: 'Just tasks, priorities, and deadlines. No unnecessary features slowing you down.' },
            { icon: '🤖', title: 'AI that actually helps', desc: 'The AI knows your tasks and gives context-aware suggestions, not generic advice.' },
            { icon: '🔒', title: 'Your data, only yours', desc: 'Every task is tied to your account. Nobody else can see your data.' },
            { icon: '📱', title: 'Works on any device', desc: 'Fully responsive — manage tasks from your phone, tablet, or desktop.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-2xl mt-0.5 flex-shrink-0">{icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 border-t border-gray-200 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900">Common questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Q: {q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + New Task button ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-10 leading-relaxed">
            Stop juggling tasks in your head. TaskPortal keeps everything organised so you can focus on doing, not remembering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated && (
              <button onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-blue-50 transition-all">
                Create Free Account
              </button>
            )}
            <button
              onClick={handleNewTask}
              className="px-8 py-3.5 bg-yellow-400 text-gray-900 font-semibold rounded-xl shadow hover:bg-yellow-300 transition-all flex items-center gap-2">
              <span>✏️</span> New Task
            </button>
          </div>
          {!isAuthenticated && (
            <p className="mt-4 text-blue-200 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="underline text-white font-medium">Sign in</button>
            </p>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">✅</span>
          <span className="font-semibold text-white">TaskPortal</span>
        </div>
        <p>AI-Powered Task Management · Built with React + Spring Boot + Gemini AI</p>
      </footer>
    </div>
  )
}