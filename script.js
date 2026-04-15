const API = "http://localhost:2000/todo";

// =====================
// ADD TODO
// =====================
function addTodo() {
  const input = document.getElementById("input");

  if (!input.value.trim()) return;

  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: input.value,
    }),
  }).then(() => {
    input.value = "";
    loadTodos();
  });
}

// =====================
// LOAD TODOS
// =====================
function loadTodos() {
  fetch(API)
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.todos.forEach((todo) => {
        const li = document.createElement("li");

        li.innerHTML = `
          ${todo.text}
          <button onclick="updateTodo('${todo._id}')">Edit</button>
          <button onclick="deleteTodo('${todo._id}')">X</button>
        `;

        list.appendChild(li);
      });
    });
}

// =====================
// UPDATE TODO
// =====================
function updateTodo(id) {
  const newText = prompt("Update todo:");

  if (!newText || !newText.trim()) return;

  fetch(`${API}?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: newText,
    }),
  }).then(() => loadTodos());
}

// =====================
// DELETE TODO
// =====================
function deleteTodo(id) {
  fetch(`${API}?id=${id}`, {
    method: "DELETE",
  }).then(() => loadTodos());
}

// initial load
loadTodos();
