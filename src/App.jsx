import { useState, useEffect } from "react";
import "./App.css";

const columns = ["Todo", "In Progress", "Done"];

function App() {

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanbanTasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [collapsed, setCollapsed] = useState({
    "Todo": false,
    "In Progress": false,
    "Done": false
  });

  useEffect(() => {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleColumn = (col) => {
    setCollapsed({
      ...collapsed,
      [col]: !collapsed[col]
    });
  };

  const addTask = () => {

    if (title.trim() === "") return;

    if (editingId) {

      const updated = tasks.map((t) =>
        t.id === editingId
          ? { ...t, title, description: desc, deadline: date, priority }
          : t
      );

      setTasks(updated);
      setEditingId(null);

    } else {

      const newTask = {
        id: Date.now(),
        title,
        description: desc,
        deadline: date,
        priority,
        status: "Todo"
      };

      setTasks([...tasks, newTask]);
    }

    setTitle("");
    setDesc("");
    setDate("");
    setPriority("medium");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const editTask = (task) => {
    setTitle(task.title);
    setDesc(task.description);
    setDate(task.deadline);
    setPriority(task.priority);
    setEditingId(task.id);
  };

  const dragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const dropTask = (e, column) => {

    const id = e.dataTransfer.getData("taskId");

    const updated = tasks.map((t) =>
      t.id == id ? { ...t, status: column } : t
    );

    setTasks(updated);
  };

  const isDueSoon = (deadline) => {

    if (!deadline) return false;

    const today = new Date();
    const d = new Date(deadline);

    const diff = (d - today) / (1000 * 60 * 60 * 24);

    return diff <= 1 && diff >= 0;
  };

  const groupByDate = (taskList) => {

    const groups = {};

    taskList.forEach((t) => {

      const key = t.deadline || "No Deadline";

      if (!groups[key]) groups[key] = [];

      groups[key].push(t);
    });

    return groups;
  };

  const completed = tasks.filter((t) => t.status === "Done").length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const filteredTasks = tasks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  return (

    <div className={darkMode ? "app dark" : "app"}>

      <h1>Diya's Kanban Task Board</h1>

      <button className="theme-btn" onClick={toggleTheme}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="progress-box">

        <p>{completed} / {total} tasks completed</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: percent + "%" }}
          ></div>
        </div>

      </div>

      <div className="search-box">
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="task-input">

        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <button onClick={addTask}>
          {editingId ? "Update Task" : "Add Task"}
        </button>

      </div>

      <div className="board">

        {columns.map((col) => {

          const colTasks = filteredTasks.filter((t) => t.status === col);

          const grouped = groupByDate(colTasks);

          return (

            <div
              key={col}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => dropTask(e, col)}
            >

              <div className="column-header">

                <h2>{col} ({colTasks.length})</h2>

                <button onClick={() => toggleColumn(col)}>
                  {collapsed[col] ? "+" : "-"}
                </button>

              </div>

              {!collapsed[col] &&

                Object.keys(grouped).map((dateKey) => (

                  <div key={dateKey} className="deadline-group">

                    <h4>{dateKey}</h4>

                    {grouped[dateKey].map((t) => (

                      <div
                        key={t.id}
                        className="task"
                        draggable
                        onDragStart={(e) => dragStart(e, t.id)}
                      >

                        <div className="task-header">
                          <span className={`dot ${t.priority}`}></span>
                          <strong>{t.title}</strong>
                        </div>

                        <p>{t.description}</p>

                        {isDueSoon(t.deadline) &&
                          <p className="warning">⚠ Deadline tomorrow</p>
                        }

                        <div className="task-buttons">

                          <button onClick={() => editTask(t)}>
                            Edit
                          </button>

                          <button onClick={() => deleteTask(t.id)}>
                            Delete
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                ))

              }

            </div>

          );

        })}

      </div>

    </div>

  );
}

export default App;