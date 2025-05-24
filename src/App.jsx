// src/App.js
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app'; // Import compat version
import 'firebase/compat/firestore';       // Import compat firestore
import { firebaseConfig } from './firebaseConfig'; // Your Firebase config
import './App.css'; // You can create this file for styling

// Initialize Firebase (only if it hasn't been initialized yet)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();
const tasksCollection = db.collection('tasks');

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [editingTask, setEditingTask] = useState(null); // { id, text }
  const [editText, setEditText] = useState('');

  // READ: Fetch tasks from Firebase
  useEffect(() => {
    const unsubscribe = tasksCollection
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(fetchedTasks);
      }, error => {
        console.error("Error fetching tasks: ", error);
      });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // CREATE: Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (taskInput.trim() === "") {
      alert("Please enter a task!");
      return;
    }
    try {
      await tasksCollection.add({
        text: taskInput,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTaskInput(''); // Clear input field
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  // UPDATE: Toggle task completion
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await tasksCollection.doc(id).update({
        completed: !currentStatus
      });
    } catch (error) {
      console.error("Error updating task status: ", error);
    }
  };

  // Start editing a task
  const handleStartEdit = (task) => {
    setEditingTask(task);
    setEditText(task.text);
  };

  // UPDATE: Save edited task
  const handleSaveEdit = async (id) => {
    if (editText.trim() === "") {
      alert("Task text cannot be empty.");
      return;
    }
    try {
      await tasksCollection.doc(id).update({
        text: editText
      });
      setEditingTask(null); // Exit editing mode
      setEditText('');
    } catch (error) {
      console.error("Error saving edited task: ", error);
    }
  };

  // DELETE: Remove a task
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksCollection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  return (
    <div className="container">
      <h1>tasks list</h1>

      {/* Form for adding tasks */}
      <form onSubmit={handleAddTask} className="input-area">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Form for editing tasks (conditional rendering) */}
      {editingTask && (
        <div className="edit-area">
          <h3>Edit Task</h3>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button onClick={() => handleSaveEdit(editingTask.id)}>Save</button>
          <button onClick={() => setEditingTask(null)}>Cancel</button>
        </div>
      )}

      {/* List of tasks */}
      <ul>
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => handleToggleComplete(task.id, task.completed)}>
              {task.text}
            </span>
            <div className="task-actions">
              <button className="complete-btn" onClick={() => handleToggleComplete(task.id, task.completed)}>
                {task.completed ? 'Undo' : 'Complete'}
              </button>
              <button className="edit-btn" onClick={() => handleStartEdit(task)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;