import { useState, useeff } from "react";
import "./App.css";

const columns = ["Todo", "In Progress", "Done"];

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Load localStorage
  useeff(() => {
    const savedTasks = localStorage.getItem("kanbanTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks whenever changed
  useeff(() => {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add Task
  const addTask = () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title,
      description,
      status: "Todo",
    };

    setTasks([...tasks, newTask]);
    setTitle("");
    setDescription("");
  };

  // Delete Task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Drag Start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  // Drop
  const handleDrop = (e, column) => {
    const taskId = e.dataTransfer.getData("taskId");

    setTasks(
      tasks.map((task) =>
        task.id == taskId ? { ...task, status: column } : task
      )
    );
  };

  return (
    <div className="app">
      <h1>Kanban Board</h1>

      <div className="task-input">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="board">
        {columns.map((column) => (
          <div
            key={column}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column)}
          >
            <h2>{column}</h2>

            {tasks
              .filter((task) => task.status === column)
              .map((task) => (
                <div
                  key={task.id}
                  className="task"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <button onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;