
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Project = {
  id: number
  name: string
  description: string
  status: string
  progress: number
}

type Task = {
  id: number
  title: string
  projectId: number
  priority: 'Low' | 'Medium' | 'High'
  status: 'To Do' | 'In Progress' | 'Completed'
  dueDate: string
}

const menuItems = [
  { icon: '▦', label: 'Dashboard' },
  { icon: '▤', label: 'My Projects' },
  { icon: '☑', label: 'Tasks' },
  { icon: '▥', label: 'Calendar' },
  { icon: '⚙', label: 'Settings' },
]

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Redesign the company website with a modern interface.',
    status: 'In Progress',
    progress: 75,
  },
  {
    id: 2,
    name: 'Mobile App UI',
    description: 'Create a responsive mobile application interface.',
    status: 'In Progress',
    progress: 45,
  },
  {
    id: 3,
    name: 'Marketing Dashboard',
    description: 'Build an analytics dashboard for marketing campaigns.',
    status: 'Completed',
    progress: 100,
  },
]

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design homepage layout',
    projectId: 1,
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-11-10',
  },
  {
    id: 2,
    title: 'Build responsive navigation',
    projectId: 1,
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-11-15',
  },
  {
    id: 3,
    title: 'Create mobile UI components',
    projectId: 2,
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-11-20',
  },
]

// Keep existing storage keys to preserve saved data.
const PROJECT_STORAGE_KEY = 'taskpilot-projects'
const TASK_STORAGE_KEY = 'nexora-tasks'

const cardStyle =
  'rounded-2xl border border-violet-900/40 bg-[#211D40] p-6 transition hover:border-violet-500/50'

const inputStyle =
  'w-full rounded-xl border border-violet-800/50 bg-[#302B52] p-3 text-white outline-none focus:border-violet-400'

const primaryButton =
  'rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [calendarDate, setCalendarDate] = useState(new Date())

  // SETTINGS
  const [workspaceName, setWorkspaceName] = useState(
    () =>
      localStorage.getItem('nexora-workspace-name') ||
      'Nexora Workspace'
  )

  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('nexora-display-name') || 'Kyrian'
  )

  const [email, setEmail] = useState(
    () => localStorage.getItem('nexora-email') || ''
  )

  const [settingsSaved, setSettingsSaved] = useState(false)

  function handleSaveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const nextWorkspaceName = workspaceName.trim()
    const nextDisplayName = displayName.trim()
    const nextEmail = email.trim()

    if (!nextWorkspaceName || !nextDisplayName) return

    localStorage.setItem('nexora-workspace-name', nextWorkspaceName)
    localStorage.setItem('nexora-display-name', nextDisplayName)
    localStorage.setItem('nexora-email', nextEmail)

    setWorkspaceName(nextWorkspaceName)
    setDisplayName(nextDisplayName)
    setEmail(nextEmail)
    setSettingsSaved(true)
  }

  // PROJECTS
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECT_STORAGE_KEY)

      if (saved) {
        const parsed: unknown = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          return parsed as Project[]
        }
      }
    } catch {
      console.warn('Could not load saved projects')
    }

    return initialProjects
  })

  // TASKS
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(TASK_STORAGE_KEY)

      if (saved) {
        const parsed: unknown = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          return parsed as Task[]
        }
      }
    } catch {
      console.warn('Could not load saved tasks')
    }

    return initialTasks
  })

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectId, setEditingProjectId] =
    useState<number | null>(null)

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskPriority, setTaskPriority] =
    useState<Task['priority']>('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')

  const [taskSearch, setTaskSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(projects)
    )
  }, [projects])

  useEffect(() => {
    localStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify(tasks)
    )
  }, [tasks])

  // FILTER TASKS
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(taskSearch.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter

    const matchesPriority =
      priorityFilter === 'All' ||
      task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // PROJECT ACTIONS
  function resetProjectForm() {
    setShowProjectForm(false)
    setEditingProjectId(null)
    setProjectName('')
    setProjectDescription('')
  }

  function openCreateForm() {
    resetProjectForm()
    setShowProjectForm(true)
  }

  function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!projectName.trim()) return

    if (editingProjectId !== null) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingProjectId
            ? {
                ...project,
                name: projectName.trim(),
                description: projectDescription.trim(),
              }
            : project
        )
      )
    } else {
      setProjects((current) => [
        ...current,
        {
          id: Date.now(),
          name: projectName.trim(),
          description: projectDescription.trim(),
          status: 'Not Started',
          progress: 0,
        },
      ])
    }

    resetProjectForm()
  }

  function handleEditProject(id: number) {
    const project = projects.find((p) => p.id === id)

    if (!project) return

    setEditingProjectId(id)
    setProjectName(project.name)
    setProjectDescription(project.description)
    setShowProjectForm(true)
  }

  function handleDeleteProject(id: number) {
    if (!window.confirm('Delete this project and its tasks?')) {
      return
    }

    setProjects((current) =>
      current.filter((project) => project.id !== id)
    )

    setTasks((current) =>
      current.filter((task) => task.projectId !== id)
    )

    if (editingProjectId === id) resetProjectForm()
  }

  // TASK ACTIONS
  function resetTaskForm() {
    setTaskTitle('')
    setTaskProjectId('')
    setTaskPriority('Medium')
    setTaskDueDate('')
    setShowTaskForm(false)
  }

  function handleCreateTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!taskTitle.trim() || !taskProjectId) return

    if (!projects.some((p) => p.id === Number(taskProjectId))) {
      return
    }

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle.trim(),
      projectId: Number(taskProjectId),
      priority: taskPriority,
      status: 'To Do',
      dueDate: taskDueDate,
    }

    setTasks((current) => [...current, newTask])
    resetTaskForm()
  }

  function handleTaskStatus(
    id: number,
    status: Task['status']
  ) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    )
  }

  function handleDeleteTask(id: number) {
    if (!window.confirm('Delete this task?')) return

    setTasks((current) =>
      current.filter((task) => task.id !== id)
    )
  }

  // AUTOMATIC PROJECT PROGRESS
  function getProjectProgress(project: Project) {
    const projectTasks = tasks.filter(
      (task) => task.projectId === project.id
    )

    if (projectTasks.length === 0) {
      return 0
    }

    const completedTasks = projectTasks.filter(
      (task) => task.status === 'Completed'
    ).length

    return Math.round(
      (completedTasks / projectTasks.length) * 100
    )
  }

  // AUTOMATIC PROJECT STATUS
  function getProjectStatus(project: Project) {
    const projectTasks = tasks.filter(
      (task) => task.projectId === project.id
    )

    if (projectTasks.length === 0) {
      return 'Not Started'
    }

    if (
      projectTasks.every(
        (task) => task.status === 'Completed'
      )
    ) {
      return 'Completed'
    }

    if (
      projectTasks.some(
        (task) =>
          task.status === 'In Progress' ||
          task.status === 'Completed'
      )
    ) {
      return 'In Progress'
    }

    return 'Not Started'
  }

  // DASHBOARD STATISTICS
  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: '📁',
    },
    {
      label: 'In Progress Projects',
      value: projects.filter(
        (project) => getProjectStatus(project) === 'In Progress'
      ).length,
      icon: '📋',
    },
    {
      label: 'Completed Projects',
      value: projects.filter(
        (project) => getProjectStatus(project) === 'Completed'
      ).length,
      icon: '✅',
    },
    {
      label: 'Average Progress',
      value: projects.length
        ? Math.round(
            projects.reduce(
              (total, project) =>
                total + getProjectProgress(project),
              0
            ) / projects.length
          ) + '%'
        : '0%',
      icon: '📊',
    },
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: '📋',
    },
    {
      label: 'To Do Tasks',
      value: tasks.filter(
        (task) => task.status === 'To Do'
      ).length,
      icon: '📝',
    },
    {
      label: 'In Progress Tasks',
      value: tasks.filter(
        (task) => task.status === 'In Progress'
      ).length,
      icon: '⏳',
    },
    {
      label: 'Completed Tasks',
      value: tasks.filter(
        (task) => task.status === 'Completed'
      ).length,
      icon: '🎯',
    },
  ]

  // UPCOMING DEADLINES
  const today = new Date()

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const upcomingDeadlines = tasks
    .filter(
      (task) =>
        task.status !== 'Completed' &&
        Boolean(task.dueDate)
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)

  function formatDeadline(dateString: string) {
    const [year, month, day] = dateString
      .split('-')
      .map(Number)

    return new Date(year, month - 1, day).toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  // CALENDAR
  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()

  const firstDayOfMonth = new Date(
    calendarYear,
    calendarMonth,
    1
  ).getDay()

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate()

  const emptyDays = (firstDayOfMonth + 6) % 7

  const calendarDays = Array.from(
    { length: emptyDays + daysInMonth },
    (_, index) => {
      const day = index - emptyDays + 1
      return day > 0 ? day : null
    }
  )

  const calendarMonthTitle = calendarDate.toLocaleDateString(
    'en-GB',
    { month: 'long', year: 'numeric' }
  )

  function changeCalendarMonth(offset: number) {
    setCalendarDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1
        )
    )
  }

  function getTasksForDay(day: number) {
    const dateString = [
      calendarYear,
      String(calendarMonth + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    return tasks.filter(
      (task) => task.dueDate === dateString
    )
  }

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'KY'

  return (
    <div className="min-h-screen bg-[#111027] text-white md:flex">
      {/* SIDEBAR */}
      <aside className="border-b border-violet-900/40 bg-[#191632] p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="mb-2 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Nexora.
        </h1>

        <p className="mb-10 text-xs uppercase tracking-widest text-violet-300/60">
          Project Workspace
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActivePage(item.label)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activePage === item.label
                  ? 'bg-violet-600 font-semibold text-white shadow-lg shadow-violet-950/40'
                  : 'text-violet-200/70 hover:bg-[#302B52] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-12 rounded-xl border border-violet-800/40 bg-[#211D40] p-4">
          <p className="text-sm font-semibold text-violet-200">
            {workspaceName}
          </p>
          <p className="mt-2 text-xs text-violet-200/60">
            Organize projects and track your progress.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-violet-300/70">
              Nexora / {workspaceName}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              {activePage}
            </h2>
          </div>

          <div
            title={displayName}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 font-bold text-white"
          >
            {initials}
          </div>
        </header>

        {activePage === 'Dashboard' ? (
          <>
            {/* WELCOME */}
            <section className="mb-8 rounded-2xl border border-violet-800/30 bg-gradient-to-r from-[#29204E] to-[#1D1A3A] p-7">
              <p className="mb-2 text-sm font-medium text-violet-300">
                YOUR WORKSPACE
              </p>

              <h3 className="text-2xl font-bold">
                Welcome to Nexora, {displayName}! 👋
              </h3>

              <p className="mt-3 text-violet-200/70">
                Manage your projects, monitor progress, and stay organized.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActivePage('My Projects')
                  openCreateForm()
                }}
                className={`${primaryButton} mt-6`}
              >
                + New Project
              </button>
            </section>

            {/* STATS */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className={cardStyle}>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl">
                    {stat.icon}
                  </div>

                  <p className="text-sm text-violet-200/70">
                    {stat.label}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            {/* UPCOMING DEADLINES */}
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Upcoming Deadlines
                  </h3>
                  <p className="mt-2 text-sm text-violet-200/60">
                    Stay on top of your unfinished tasks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('Tasks')}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  View Tasks
                </button>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div className={cardStyle}>
                  <p className="text-violet-200/70">
                    No upcoming deadlines. You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {upcomingDeadlines.map((task) => {
                    const project = projects.find(
                      (item) => item.id === task.projectId
                    )

                    const isOverdue = task.dueDate < todayString
                    const isDueToday = task.dueDate === todayString

                    return (
                      <article key={task.id} className={cardStyle}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-white">
                              {task.title}
                            </h4>

                            <p className="mt-2 text-sm text-violet-200/60">
                              {project?.name ?? 'Project unavailable'}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              task.priority === 'High'
                                ? 'bg-rose-500/15 text-rose-300'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-emerald-500/15 text-emerald-300'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <span
                            className={`text-sm ${
                              isOverdue
                                ? 'font-semibold text-rose-400'
                                : isDueToday
                                ? 'font-semibold text-amber-300'
                                : 'text-violet-200/70'
                            }`}
                          >
                            {isOverdue
                              ? '⚠ Overdue: '
                              : isDueToday
                              ? '⏰ Due Today: '
                              : '📅 Due: '}
                            {formatDeadline(task.dueDate)}
                          </span>

                          <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                            {task.status}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActivePage('Tasks')}
                          className="mt-5 text-sm font-medium text-violet-400 hover:text-violet-300"
                        >
                          Manage Task →
                        </button>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            {/* RECENT PROJECTS */}
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Recent Projects
                </h3>

                <button
                  type="button"
                  onClick={() => setActivePage('My Projects')}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  View All
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {projects.slice(0, 4).map((project) => (
                  <article key={project.id} className={cardStyle}>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold">
                        {project.name}
                      </h4>

                      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                        {getProjectStatus(project)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-violet-200/60">
                      {project.description}
                    </p>

                    <div className="mt-6 flex justify-between text-sm">
                      <span className="text-violet-200/60">
                        Progress
                      </span>
                      <span>{getProjectProgress(project)}%</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#302B52]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                        style={{
                          width: `${getProjectProgress(project)}%`,
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>

              {projects.length === 0 && (
                <p className="text-violet-200/70">
                  No projects yet. Create your first project.
                </p>
              )}
            </section>
          </>
        ) : activePage === 'My Projects' ? (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">
                  My Projects
                </h3>
                <p className="mt-2 text-violet-200/70">
                  Manage and track your ongoing projects.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className={primaryButton}
              >
                + Create Project
              </button>
            </div>

            {/* PROJECT FORM */}
            {showProjectForm && (
              <form
                onSubmit={handleCreateProject}
                className={`${cardStyle} mb-6 space-y-4`}
              >
                <h4 className="text-xl font-semibold">
                  {editingProjectId !== null
                    ? 'Edit Project'
                    : 'Create New Project'}
                </h4>

                <div>
                  <label
                    htmlFor="project-name"
                    className="mb-2 block text-sm text-violet-200"
                  >
                    Project Name
                  </label>

                  <input
                    id="project-name"
                    required
                    value={projectName}
                    onChange={(e) =>
                      setProjectName(e.target.value)
                    }
                    placeholder="Enter project name"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-2 block text-sm text-violet-200"
                  >
                    Description
                  </label>

                  <textarea
                    id="project-description"
                    rows={3}
                    value={projectDescription}
                    onChange={(e) =>
                      setProjectDescription(e.target.value)
                    }
                    placeholder="Describe your project"
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className={primaryButton}
                  >
                    {editingProjectId !== null
                      ? 'Update Project'
                      : 'Save Project'}
                  </button>

                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="rounded-xl bg-[#453D6B] px-5 py-3 text-white hover:bg-[#554B80]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* PROJECT CARDS */}
            <div className="grid gap-5 lg:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className={cardStyle}>
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-semibold">
                      {project.name}
                    </h4>

                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                      {getProjectStatus(project)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-violet-200/70">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditProject(project.id)
                      }
                      className="rounded-lg border border-violet-500/40 px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/10"
                    >
                      Edit Project
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteProject(project.id)
                      }
                      className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                    >
                      Delete Project
                    </button>
                  </div>

                  <div className="mt-6 flex justify-between text-sm">
                    <span className="text-violet-200/60">
                      Progress
                    </span>
                    <span>{getProjectProgress(project)}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#302B52]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                      style={{
                        width: `${getProjectProgress(project)}%`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>

            {projects.length === 0 && (
              <div className={`${cardStyle} text-center`}>
                <h3 className="text-xl font-semibold">
                  No projects yet
                </h3>
                <p className="mt-2 text-violet-200/70">
                  Click Create Project to get started.
                </p>
              </div>
            )}
          </section>
        ) : activePage === 'Tasks' ? (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">
                  Task Management
                </h3>
                <p className="mt-2 text-violet-200/70">
                  Organize tasks, priorities, and deadlines.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm((current) => !current)
                }
                className={primaryButton}
              >
                + Create Task
              </button>
            </div>

            {/* TASK STATS */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Total Tasks',
                  value: tasks.length,
                  icon: '📋',
                },
                {
                  label: 'In Progress',
                  value: tasks.filter(
                    (task) => task.status === 'In Progress'
                  ).length,
                  icon: '⏳',
                },
                {
                  label: 'Completed',
                  value: tasks.filter(
                    (task) => task.status === 'Completed'
                  ).length,
                  icon: '✅',
                },
              ].map((item) => (
                <div key={item.label} className={cardStyle}>
                  <span className="text-2xl">{item.icon}</span>
                  <p className="mt-3 text-sm text-violet-200/70">
                    {item.label}
                  </p>
                  <h4 className="mt-2 text-3xl font-bold">
                    {item.value}
                  </h4>
                </div>
              ))}
            </div>

            {/* CREATE TASK */}
            {showTaskForm && (
              <form
                onSubmit={handleCreateTask}
                className={`${cardStyle} mb-6 space-y-4`}
              >
                <h4 className="text-xl font-semibold">
                  Create New Task
                </h4>

                <div>
                  <label
                    htmlFor="task-title"
                    className="mb-2 block text-sm text-violet-200"
                  >
                    Task Title
                  </label>

                  <input
                    id="task-title"
                    required
                    value={taskTitle}
                    onChange={(e) =>
                      setTaskTitle(e.target.value)
                    }
                    placeholder="Enter task title"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-project"
                    className="mb-2 block text-sm text-violet-200"
                  >
                    Project
                  </label>

                  <select
                    id="task-project"
                    required
                    value={taskProjectId}
                    onChange={(e) =>
                      setTaskProjectId(e.target.value)
                    }
                    className={inputStyle}
                  >
                    <option value="">Select a project</option>

                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="task-priority"
                      className="mb-2 block text-sm text-violet-200"
                    >
                      Priority
                    </label>

                    <select
                      id="task-priority"
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(
                          e.target.value as Task['priority']
                        )
                      }
                      className={inputStyle}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="task-date"
                      className="mb-2 block text-sm text-violet-200"
                    >
                      Due Date
                    </label>

                    <input
                      id="task-date"
                      type="date"
                      value={taskDueDate}
                      onChange={(e) =>
                        setTaskDueDate(e.target.value)
                      }
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={projects.length === 0}
                    className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Save Task
                  </button>

                  <button
                    type="button"
                    onClick={resetTaskForm}
                    className="rounded-xl bg-[#453D6B] px-5 py-3 text-white hover:bg-[#554B80]"
                  >
                    Cancel
                  </button>
                </div>

                {projects.length === 0 && (
                  <p className="text-sm text-amber-300">
                    Create a project before adding tasks.
                  </p>
                )}
              </form>
            )}

            {/* TASK SEARCH AND FILTERS */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) =>
                  setTaskSearch(e.target.value)
                }
                className={inputStyle}
              />

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className={inputStyle}
              >
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                className={inputStyle}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* TASK LIST */}
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const project = projects.find(
                  (p) => p.id === task.projectId
                )

                return (
                  <article key={task.id} className={cardStyle}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold">
                          {task.title}
                        </h4>

                        <p className="mt-2 text-sm text-violet-200/60">
                          Project:{' '}
                          {project?.name ?? 'Project unavailable'}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          task.priority === 'High'
                            ? 'bg-rose-500/15 text-rose-300'
                            : task.priority === 'Medium'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <select
                        aria-label={`Status for ${task.title}`}
                        value={task.status}
                        onChange={(e) =>
                          handleTaskStatus(
                            task.id,
                            e.target.value as Task['status']
                          )
                        }
                        className="rounded-lg border border-violet-800/50 bg-[#302B52] px-3 py-2 text-sm text-white"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">
                          In Progress
                        </option>
                        <option value="Completed">
                          Completed
                        </option>
                      </select>

                      <span className="text-sm text-violet-200/70">
                        {task.dueDate
                          ? `Due: ${task.dueDate}`
                          : 'No deadline'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTask(task.id)
                        }
                        className="ml-auto rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                      >
                        Delete Task
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {tasks.length === 0 && (
              <div className={`${cardStyle} mt-4 text-center`}>
                <h4 className="text-xl font-semibold">
                  No tasks yet
                </h4>
                <p className="mt-2 text-violet-200/70">
                  Create your first task to get started.
                </p>
              </div>
            )}

            {tasks.length > 0 &&
              filteredTasks.length === 0 && (
                <div className={`${cardStyle} mt-4 text-center`}>
                  <p className="text-violet-200/70">
                    No tasks match your filters.
                  </p>
                </div>
              )}
          </section>
        ) : activePage === 'Calendar' ? (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">
                  Calendar
                </h3>
                <p className="mt-2 text-violet-200/70">
                  View your tasks and upcoming deadlines.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCalendarDate(new Date())}
                className={primaryButton}
              >
                Today
              </button>
            </div>

            <div className={cardStyle}>
              <div className="mb-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => changeCalendarMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-xl bg-[#302B52] px-4 py-2 text-violet-200 hover:bg-violet-600 hover:text-white"
                >
                  ←
                </button>

                <h4 className="text-center text-xl font-bold">
                  {calendarMonthTitle}
                </h4>

                <button
                  type="button"
                  onClick={() => changeCalendarMonth(1)}
                  aria-label="Next month"
                  className="rounded-xl bg-[#302B52] px-4 py-2 text-violet-200 hover:bg-violet-600 hover:text-white"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
                {[
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri',
                  'Sat',
                  'Sun',
                ].map((day) => (
                  <div
                    key={day}
                    className="py-3 text-xs font-semibold text-violet-300 sm:text-sm"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  const dayTasks = day
                    ? getTasksForDay(day)
                    : []

                  const isToday =
                    day !== null &&
                    new Date().getFullYear() === calendarYear &&
                    new Date().getMonth() === calendarMonth &&
                    new Date().getDate() === day

                  return (
                    <div
                      key={index}
                      className={`min-h-20 rounded-xl border p-1.5 sm:min-h-28 sm:p-2 ${
                        day === null
                          ? 'border-transparent'
                          : isToday
                          ? 'border-violet-400 bg-violet-600/20'
                          : 'border-violet-900/40 bg-[#302B52]/50'
                      }`}
                    >
                      {day !== null && (
                        <>
                          <div
                            className={`mb-2 text-sm font-semibold ${
                              isToday
                                ? 'text-violet-300'
                                : 'text-white'
                            }`}
                          >
                            {day}
                          </div>

                          <div className="space-y-1">
                            {dayTasks.map((task) => (
                              <div
                                key={task.id}
                                title={`${task.title} — ${task.status}`}
                                className={`truncate rounded-md px-1.5 py-1 text-left text-[10px] sm:text-xs ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : task.priority === 'High'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-violet-500/20 text-violet-200'
                                }`}
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-5 text-sm text-violet-200/80">
              <span>🟣 Scheduled Task</span>
              <span>🔴 High Priority</span>
              <span>🟢 Completed</span>
            </div>
          </section>
        ) : activePage === 'Settings' ? (
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold">
                Workspace Settings
              </h3>

              <p className="mt-2 text-violet-200/70">
                Customize your Nexora workspace.
              </p>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className={`${cardStyle} max-w-2xl space-y-5`}
            >
              <div>
                <label
                  htmlFor="workspace-name"
                  className="mb-2 block text-sm text-violet-200"
                >
                  Workspace Name
                </label>

                <input
                  id="workspace-name"
                  required
                  value={workspaceName}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value)
                    setSettingsSaved(false)
                  }}
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="display-name"
                  className="mb-2 block text-sm text-violet-200"
                >
                  Display Name
                </label>

                <input
                  id="display-name"
                  required
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    setSettingsSaved(false)
                  }}
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="settings-email"
                  className="mb-2 block text-sm text-violet-200"
                >
                  Email Address
                </label>

                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setSettingsSaved(false)
                  }}
                  placeholder="you@example.com"
                  className={inputStyle}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className={primaryButton}
                >
                  Save Changes
                </button>

                {settingsSaved && (
                  <span
                    role="status"
                    className="text-sm text-emerald-400"
                  >
                    ✓ Settings saved successfully
                  </span>
                )}
              </div>
            </form>

            <div className={`${cardStyle} mt-6 max-w-2xl`}>
              <h4 className="text-lg font-semibold">
                About Your Workspace
              </h4>

              <p className="mt-3 text-sm text-violet-200/70">
                Nexora is your personal project management
                workspace for organizing projects, tasks,
                priorities, and deadlines.
              </p>

              <p className="mt-3 text-sm text-violet-200/60">
                Your data is currently saved locally in this
                browser. Online accounts and cloud
                synchronization are not yet enabled.
              </p>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default App
