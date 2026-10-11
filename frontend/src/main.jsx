import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const load = async () => {
    try {
      setError("");
      const [a, b] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/tasks/stats`),
      ]);
      if (!a.ok || !b.ok) throw Error("Backend unavailable");
      setTasks(await a.json());
      setStats(await b.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const update = async (t) => {
    const next =
      t.status === "TODO"
        ? "IN_PROGRESS"
        : t.status === "IN_PROGRESS"
        ? "DONE"
        : "TODO";

    await fetch(`${API}/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, status: next }),
    });
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: f.get("title"),
        description: f.get("description"),
        priority: f.get("priority"),
        assignee: f.get("assignee"),
        status: "TODO",
      }),
    });
    e.currentTarget.reset();
    setShowForm(false);
    load();
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="brand-box">
          <div className="brand-logo">⚡</div>
          <div>
            <h3>TaskPulse</h3>
            <span>Enterprise DevOps</span>
          </div>
        </div>

        <nav className="nav-menu">
          <a className="nav-item active">
            <span className="icon">📊</span> Dashboard
          </a>
          <a className="nav-item">
            <span className="icon">🎯</span> My Tasks
          </a>
          <a className="nav-item">
            <span className="icon">🚀</span> Releases
          </a>
          <a className="nav-item">
            <span className="icon">📈</span> Analytics
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="telemetry-card">
            <div className="tc-header">
              <span>Cluster Health</span>
              <span className="pulse-dot"></span>
            </div>
            <p>All nodes & pods operational.</p>
          </div>
          <div className="user-profile">
            <div className="u-avatar">AP</div>
            <div className="u-info">
              <h4>Abhijit P</h4>
              <p>Lead Engineer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        <header className="main-header">
          <div>
            <div className="breadcrumb">WORKSPACE / OVERVIEW</div>
            <h1>Welcome back, Abhijit 👋</h1>
            <p className="header-subtitle">Here is what is happening across your deployment pipeline today.</p>
          </div>
          <div className="header-controls">
            <button
              className="theme-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <span>＋</span> New Task
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            ⚠️ {error}. Start the backend and PostgreSQL, then refresh.
          </div>
        )}

        {/* Stats Grid */}
        <section className="stats-grid">
          <StatCard title="Total Tasks" value={stats.total} icon="📋" trend="+12% this week" />
          <StatCard title="To Do" value={stats.todo} icon="⏳" trend="Awaiting pickup" />
          <StatCard title="In Progress" value={stats.inProgress} icon="⚡" trend="Active sprints" />
          <StatCard title="Completed" value={stats.done} icon="✨" trend="Shipped successfully" />
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Tasks Panel */}
          <div className="card tasks-card">
            <div className="card-header">
              <div>
                <h2>Active Task Stream</h2>
                <p>Manage and track team delivery milestones</p>
              </div>
              <div className="header-actions-group">
                <div className="view-toggle">
                  <button
                    className={viewMode === "table" ? "active" : ""}
                    onClick={() => setViewMode("table")}
                    title="Table View"
                  >
                    📑 Table
                  </button>
                  <button
                    className={viewMode === "kanban" ? "active" : ""}
                    onClick={() => setViewMode("kanban")}
                    title="Kanban Board View"
                  >
                    📋 Kanban
                  </button>
                </div>
                <div className="filter-chips">
                  {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((x) => (
                    <button
                      key={x}
                      className={filter === x ? "active" : ""}
                      onClick={() => setFilter(x)}
                    >
                      {x === "ALL" ? "All" : x.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Synchronizing task streams…</div>
            ) : viewMode === "table" ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Task Details</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="task-item-cell">
                            <span className={`status-indicator ${t.status.toLowerCase()}`}></span>
                            <div>
                              <span className="task-title-text">{t.title}</span>
                              <span className="task-desc-text">{t.description || "No description provided."}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="assignee-pill">{t.assignee}</span>
                        </td>
                        <td>
                          <span className={`priority-badge ${t.priority.toLowerCase()}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${t.status.toLowerCase()}`}>
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            className="btn-action"
                            onClick={() => update(t)}
                            title="Advance Status"
                          >
                            🔄 Advance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && <div className="empty-state">No matching tasks found.</div>}
              </div>
            ) : (
              <div className="kanban-container">
                {["TODO", "IN_PROGRESS", "DONE"].map((colStatus) => {
                  const colTasks = visible.filter((t) => t.status === colStatus);
                  return (
                    <div className="kanban-column" key={colStatus}>
                      <div className="kanban-col-header">
                        <span>{colStatus.replace("_", " ")}</span>
                        <span className="count-badge">{colTasks.length}</span>
                      </div>
                      <div className="kanban-cards-list">
                        {colTasks.map((t) => (
                          <div className="kanban-card" key={t.id}>
                            <div className="kc-top">
                              <span className={`priority-badge ${t.priority.toLowerCase()}`}>
                                {t.priority}
                              </span>
                              <button className="btn-action-sm" onClick={() => update(t)} title="Advance">
                                ➔
                              </button>
                            </div>
                            <h4>{t.title}</h4>
                            <p>{t.description}</p>
                            <div className="kc-footer">
                              <span>👤 {t.assignee}</span>
                            </div>
                          </div>
                        ))}
                        {!colTasks.length && <div className="kanban-empty">Empty</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Sidebar Feed */}
          <aside className="card activity-card">
            <div className="card-header">
              <div>
                <h2>Live Telemetry</h2>
                <p>Recent system & team actions</p>
              </div>
            </div>
            <div className="activity-list">
              <ActivityItem icon="✨" text="Monitoring dashboard deployed" time="12m ago" />
              <ActivityItem icon="⚡" text="Release pipeline moved to in progress" time="38m ago" />
              <ActivityItem icon="＋" text="New ingress configuration task created" time="1h ago" />
              <ActivityItem icon="🚀" text="Production canary deployment passed" time="2h ago" />
            </div>

            <div className="pipeline-widget">
              <div className="pw-title">CI/CD PIPELINE STATUS</div>
              <div className="pw-steps">
                <span className="passed">CI</span>
                <span className="line"></span>
                <span className="passed">Build</span>
                <span className="line"></span>
                <span className="passed">Scan</span>
                <span className="line"></span>
                <span className="active-step">Deploy</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Task Form */}
        {showForm && (
          <div className="modal-overlay">
            <form className="modal-card" onSubmit={create}>
              <div className="modal-header">
                <div>
                  <span className="modal-eyebrow">NEW TASK CREATION</span>
                  <h2>Create Workspace Task</h2>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Upgrade Kubernetes cluster ingress"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Provide technical specifications or context..."
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Priority Level</label>
                  <select name="priority">
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <input name="assignee" defaultValue="Abhijit P" />
                </div>
              </div>

              <button type="submit" className="btn-primary full-width">
                Deploy Task to Board
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <h2>{value}</h2>
        <small className="stat-trend">{trend}</small>
      </div>
    </div>
  );
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="activity-row">
      <div className="activity-badge">{icon}</div>
      <div>
        <p className="activity-text">{text}</p>
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);