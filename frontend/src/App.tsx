import { FormEvent, useEffect, useMemo, useState } from 'react'
import { fetchAnalytics, fetchTasks, loadSampleTasks, createTask, deleteTask, updateTask } from './api'
import { AnalyticsSummary, Task } from './types'

const priorities = ['high', 'medium', 'low'] as const

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(dateString?: string) {
  if (!dateString) return 'No due date'
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: 'bg-rose-500/15 text-rose-300',
    medium: 'bg-amber-500/15 text-amber-300',
    low: 'bg-sky-500/15 text-sky-300',
  }
  return (
    <span className={classNames('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', colors[priority as keyof typeof colors] ?? 'bg-slate-700/80 text-slate-300')}>
      {priority}
    </span>
  )
}

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => Promise<void>; onDelete: () => Promise<void> }) {
  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-glow transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{task.description || 'No details added yet.'}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>{formatDate(task.due_date)}</span>
        <span>{task.estimated_hours}h estimated</span>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={classNames(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            task.completed ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-100 hover:bg-slate-700',
          )}
        >
          {task.completed ? 'Mark as pending' : 'Mark complete'}
        </button>
        <button type="button" onClick={onDelete} className="rounded-full border border-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10">
          Delete
        </button>
      </div>
    </div>
  )
}

function AnalyticsPanel({ analytics }: { analytics: AnalyticsSummary | null }) {
  if (!analytics) return <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">Loading analytics...</div>

  return (
    <div className="grid gap-4">
      {[
        { title: 'Total tasks', value: analytics.total_tasks },
        { title: 'Completed', value: analytics.completed_tasks },
        { title: 'Pending', value: analytics.pending_tasks },
      ].map((item) => (
        <div key={item.title} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">{item.value}</p>
        </div>
      ))}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Productivity</p>
        <div className="mt-4 flex items-center justify-between text-slate-100">
          <span className="text-3xl font-semibold">{analytics.completion_rate}%</span>
          <span className="text-sm text-slate-400">Avg. {analytics.average_estimated_hours}h</span>
        </div>
      </div>
    </div>
  )
}

function TaskForm({ onCreate }: { onCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [estimatedHours, setEstimatedHours] = useState(3)
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
      estimated_hours: estimatedHours,
      due_date: dueDate || undefined,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setEstimatedHours(3)
    setDueDate('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-100">Create task</p>
          <p className="mt-1 text-sm text-slate-500">Add new work and keep the sprint moving.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Fast</span>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Design onboarding flow"
            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-400">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Summarize the task goal and acceptance criteria."
            rows={3}
            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-400">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
            >
              {priorities.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-400">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
            />
          </label>
          <label className="text-sm font-medium text-slate-400">
            Estimate (hrs)
            <input
              type="number"
              value={estimatedHours}
              min={1}
              onChange={(event) => setEstimatedHours(Number(event.target.value))}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
            />
          </label>
        </div>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? 'Adding...' : 'Add task'}
        </button>
      </div>
    </form>
  )
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks])
  const pendingTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksResponse, analyticsResponse] = await Promise.all([fetchTasks(), fetchAnalytics()])
      setTasks(tasksResponse)
      setAnalytics(analyticsResponse)
    } catch (error) {
      setStatusMessage((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const refreshData = async () => {
    await loadData()
    setStatusMessage('Updated successfully.')
    window.setTimeout(() => setStatusMessage(null), 2500)
  }

  const handleCreate = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    await createTask(taskData)
    await refreshData()
  }

  const handleToggle = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed })
    await refreshData()
  }

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id)
    await refreshData()
  }

  const handleLoadSample = async () => {
    setLoading(true)
    try {
      await loadSampleTasks()
      await refreshData()
    } catch (error) {
      setStatusMessage((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-white/5 bg-slate-950/40 p-8 shadow-glow backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Task Master</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-100 sm:text-5xl">A premium workspace for modern product teams.</h1>
            <p className="mt-4 max-w-2xl text-slate-400">Create tasks, track progress, and manage your team like a professional project system inspired by Jira and Linear.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={refreshData} className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800">
              Refresh board
            </button>
            <button onClick={handleLoadSample} className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Load sample workflow
            </button>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <TaskForm onCreate={handleCreate} />
            <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-glow">
              <div className="flex items-center justify-between gap-4 pb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active workflow</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-100">Backlog & sprint board</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-400">{pendingTasks.length} open tasks</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-800/90 bg-slate-950/85 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Open</p>
                  <div className="mt-5 space-y-4">
                    {pendingTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">Nothing is pending — build something great.</p>
                    ) : (
                      pendingTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onToggle={() => handleToggle(task)} onDelete={() => handleDelete(task)} />
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800/90 bg-slate-950/85 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Completed</p>
                  <div className="mt-5 space-y-4">
                    {completedTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">No completed tasks yet.</p>
                    ) : (
                      completedTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onToggle={() => handleToggle(task)} onDelete={() => handleDelete(task)} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <AnalyticsPanel analytics={analytics} />
            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-glow">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <div className="mt-6 grid gap-4">
                <button onClick={refreshData} className="rounded-3xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800">
                  Sync board data
                </button>
                <button onClick={handleLoadSample} className="rounded-3xl bg-sky-500 px-4 py-3 text-left text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                  Import sample workflow
                </button>
              </div>
            </div>
            {statusMessage ? (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-200">{statusMessage}</div>
            ) : null}
            {loading && <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 text-slate-400">Loading your premium workspace…</div>}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
