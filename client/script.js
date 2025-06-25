
// ✅ Backend URL - Connected to Render
const API_BASE = "https://googledocsclone-2.onrender.com";
const socket = io(API_BASE); // Connect to backend Socket.IO

const documentList = document.getElementById("document-list");
const newDocumentBtn = document.getElementById("new-document-btn");
const editorContainer = document.getElementById("editor-container");
const editor = document.getElementById("editor");
const backBtn = document.getElementById("back-btn");
const createBtn = document.getElementById("create-document-btn");
const shareBtn = document.getElementById("shareBtn");

let currentDocId = null;
let allDocuments = [];
const token = localStorage.getItem("token");

// Load on page ready
document.addEventListener("DOMContentLoaded", () => {
  fetchDocuments();
  if (newDocumentBtn) newDocumentBtn.addEventListener("click", createNewDocument);
  if (shareBtn) shareBtn.addEventListener("click", shareDocument);
  if (backBtn) backBtn.addEventListener("click", () => window.location.href = "/");
});

// Fetch documents
async function fetchDocuments() {
  try {
    const res = await fetch(`${API_BASE}/api/documents`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch documents");
    const data = await res.json();
    allDocuments = data;
    renderDocumentList(data);
  } catch (err) {
    console.error("Error loading documents:", err);
    alert("Failed to load documents");
  }
}

// Render document cards
function renderDocumentList(docs) {
  documentList.innerHTML = "";
  if (docs.length === 0) {
    documentList.innerHTML = "<p>No documents found.</p>";
    return;
  }

  docs.forEach(doc => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col justify-between p-3 border border-gray-500 rounded-md mb-2 cursor-pointer hover:bg-gray-100 w-56";

    const title = document.createElement("div");
    title.textContent = doc.title;
    title.className = "font-bold text-xl mb-2";
    title.onclick = () => openDocument(doc._id);

    const info = document.createElement("div");
    info.className = "flex flex-col";

    const updated = document.createElement("div");
    updated.textContent = new Date(doc.updatedAt).toLocaleString();
    updated.className = "text-xs text-gray-500 mb-2";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "bg-red-500 text-white text-sm py-1.5 rounded-full hover:bg-red-600 w-full";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteDocument(doc._id);
    };

    info.appendChild(updated);
    info.appendChild(deleteBtn);

    wrapper.appendChild(title);
    wrapper.appendChild(info);
    documentList.appendChild(wrapper);
  });
}

// Go to editor
function openDocument(docId) {
  window.location.href = `/edit.html?docId=${docId}`;
}

// Prompt and create
async function createNewDocument() {
  const title = prompt("Enter document title:");
  if (!title) return;
  await createDocument(title);
}

// Create document
async function createDocument(title) {
  try {
    const res = await fetch(`${API_BASE}/api/documents/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create document");
    }

    const doc = await res.json();
    window.location.href = `/edit.html?docId=${doc._id}`;
  } catch (err) {
    console.error("Create error:", err);
    alert("Error creating document");
  }
}

// Delete document
async function deleteDocument(docId) {
  const confirmed = confirm("Are you sure you want to delete this document?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete");
    fetchDocuments();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting document");
  }
}

// Realtime collaboration logic
const params = new URLSearchParams(window.location.search);
const docId = params.get("docId");

if (docId) {
  socket.emit("join", docId);

  if (editor) {
    editor.addEventListener("input", () => {
      socket.emit("edit-content", { docId, content: editor.innerHTML });
    });

    socket.on("receiveEdit", (content) => {
      editor.innerHTML = content;
    });

    socket.on("update-content", ({ content }) => {
      editor.innerHTML = content;
    });
  }
}

// Share document
async function shareDocument() {
  const userEmail = prompt("Enter user email to share with:");
  if (!userEmail || !docId) return;

  try {
    const res = await fetch(`${API_BASE}/api/documents/${docId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Document shared successfully");
    } else {
      alert("Failed to share: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Share error:", err);
    alert("Error sharing document");
  }
}
