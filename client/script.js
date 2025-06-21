// // CollabDocs - Main Script
// const API_BASE = "http://localhost:3001"; // 🟢 Backend API base
// const socket = io(API_BASE); // 🟢 Socket.IO nga Express serveri

// const documentList = document.getElementById("document-list");
// const newDocumentBtn = document.getElementById("new-document-btn");
// const editorContainer = document.getElementById("editor-container");
// const editor = document.getElementById("editor");
// const backBtn = document.getElementById("back-btn");
// const createBtn = document.getElementById("create-document-btn");
// const shareBtn = document.getElementById("shareBtn");

// let currentDocId = null;
// let allDocuments = [];
// let debounceTimer = null;
// const token = localStorage.getItem("token");

// // Load documents and set up event listeners
// document.addEventListener("DOMContentLoaded", () => {
//   fetchDocuments();

//   if (newDocumentBtn) {
//     newDocumentBtn.addEventListener("click", createNewDocument);
//   }

//   if (shareBtn) {
//     shareBtn.addEventListener("click", shareDocument);
//   }
// });

// // Fetch and render documents
// async function fetchDocuments() {
//   try {
//     const res = await fetch(`${API_BASE}/api/documents`, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) throw new Error("Failed to fetch documents");
//     allDocuments = await res.json();
//     renderDocumentList(allDocuments);
//   } catch (error) {
//     console.error(error);
//     alert("Error loading documents");
//   }
// }

// // Render document list
// function renderDocumentList(documents) {
//   documentList.innerHTML = "";

//   if (documents.length === 0) {
//     documentList.textContent = "No documents found.";
//     return;
//   }

//   documents.forEach(doc => {
//     const docElement = document.createElement("div");
//     docElement.className =
//       "flex flex-col justify-between p-3 border border-gray-500 rounded-md mb-2 cursor-pointer hover:bg-gray-100 w-56";

//     const titleElement = document.createElement("div");
//     titleElement.textContent = doc.title;
//     titleElement.className = "font-bold text-xl mb-2";
//     titleElement.onclick = () => openDocument(doc._id);

//     const infoElement = document.createElement("div");
//     infoElement.className = "flex flex-col";

//     const dateElement = document.createElement("div");
//     dateElement.textContent = new Date(doc.updatedAt).toLocaleString();
//     dateElement.className = "text-xs text-gray-500 mb-2";

//     const deleteBtn = document.createElement("button");
//     deleteBtn.textContent = "Delete";
//     deleteBtn.className =
//       "bg-red-500 text-white text-sm py-1.5 rounded-full hover:bg-red-600 w-full";
//     deleteBtn.onclick = (e) => {
//       e.stopPropagation();
//       deleteDocument(doc._id);
//     };

//     infoElement.appendChild(dateElement);
//     infoElement.appendChild(deleteBtn);

//     docElement.appendChild(titleElement);
//     docElement.appendChild(infoElement);

//     documentList.appendChild(docElement);
//   });
// }

// // Open a document
// function openDocument(docId) {
//   window.location.href = `/edit.html?docId=${docId}`;
// }

// // Create document helper
// // async function createNewDocument() {
// //   const title = prompt("Enter title for new document:");
// //   if (!title) return;
// //   await createDocument(title);
// // }

// async function createDocument(title) {
//   try {
//     const response = await fetch(`${API_BASE}/api/documents/create`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({ title }),
//     });

//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err.error || "Failed to create document");
//     }

//     const newDocument = await response.json();
//     window.location.href = `/edit.html?docId=${newDocument._id}`;
//   } catch (error) {
//     alert("Error creating document: " + error.message);
//     console.error("Create document error:", error);
//   }
// }

// // Delete a document
// async function deleteDocument(docId) {
//   const confirmed = confirm("Are you sure you want to delete this document?");
//   if (!confirmed) return;

//   try {
//     const response = await fetch(`${API_BASE}/api/documents/${docId}`, {
//       method: "DELETE",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) throw new Error("Failed to delete document");
//     await fetchDocuments();
//   } catch (error) {
//     alert("Error deleting document: " + error.message);
//   }
// }

// // Socket.IO real-time collaboration
// const params = new URLSearchParams(window.location.search);
// const docId = params.get("docId");
// if (docId) {
//   socket.emit("join", docId);

//   if (editor) {
//     editor.addEventListener("input", () => {
//       socket.emit("edit", { docId, content: editor.innerHTML });
//     });

//     socket.on("receiveEdit", (content) => {
//       editor.innerHTML = content;
//     });
//   }
// }

// // Share document
// async function shareDocument() {
//   const userToShareWith = prompt("Enter the email of the user you want to share with:");
//   if (!userToShareWith || !docId) return;

//   try {
//     const res = await fetch(`${API_BASE}/api/documents/${docId}/share`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({ userEmail: userToShareWith }),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       alert("Document shared successfully!");
//     } else {
//       alert(`Error: ${data.error}`);
//     }
//   } catch (error) {
//     console.error("Error sharing document:", error);
//     alert("Failed to share document.");
//   }
// }































// CollabDocs - Main Script
const API_BASE = "http://localhost:3001";
const socket = io(API_BASE);

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

// Load documents and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchDocuments();

  if (newDocumentBtn) {
    newDocumentBtn.addEventListener("click", createNewDocument);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", shareDocument);
  }
});

// Fetch and render documents
async function fetchDocuments() {
  try {
    const res = await fetch(`${API_BASE}/api/documents`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch documents");
    allDocuments = await res.json();
    renderDocumentList(allDocuments);
  } catch (error) {
    console.error(error);
    alert("Error loading documents");
  }
}

// Render document list
function renderDocumentList(documents) {
  documentList.innerHTML = "";

  if (documents.length === 0) {
    documentList.textContent = "No documents found.";
    return;
  }

  documents.forEach(doc => {
    const docElement = document.createElement("div");
    docElement.className =
      "flex flex-col justify-between p-3 border border-gray-500 rounded-md mb-2 cursor-pointer hover:bg-gray-100 w-56";

    const titleElement = document.createElement("div");
    titleElement.textContent = doc.title;
    titleElement.className = "font-bold text-xl mb-2";
    titleElement.onclick = () => openDocument(doc._id);

    const infoElement = document.createElement("div");
    infoElement.className = "flex flex-col";

    const dateElement = document.createElement("div");
    dateElement.textContent = new Date(doc.updatedAt).toLocaleString();
    dateElement.className = "text-xs text-gray-500 mb-2";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "bg-red-500 text-white text-sm py-1.5 rounded-full hover:bg-red-600 w-full";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteDocument(doc._id);
    };

    infoElement.appendChild(dateElement);
    infoElement.appendChild(deleteBtn);

    docElement.appendChild(titleElement);
    docElement.appendChild(infoElement);

    documentList.appendChild(docElement);
  });
}

// Open a document
function openDocument(docId) {
  window.location.href = `/edit.html?docId=${docId}`;
}

// Create new document
async function createNewDocument() {
  const title = prompt("Enter title for new document:");
  if (!title) return;
  await createDocument(title);
}

async function createDocument(title) {
  try {
    const response = await fetch(`${API_BASE}/api/documents/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create document");
    }

    const newDocument = await response.json();
    window.location.href = `/edit.html?docId=${newDocument._id}`;
  } catch (error) {
    alert("Error creating document: " + error.message);
    console.error("Create document error:", error);
  }
}

// Delete document
async function deleteDocument(docId) {
  const confirmed = confirm("Are you sure you want to delete this document?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/api/documents/${docId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete document");
    await fetchDocuments();
  } catch (error) {
    alert("Error deleting document: " + error.message);
  }
}

// Real-time per-character editing with conflict handling
const params = new URLSearchParams(window.location.search);
const docId = params.get("docId");

if (docId && editor) {
  socket.emit("join", docId);

  editor.addEventListener("input", (e) => {
    const selection = window.getSelection();
    const position = selection.focusOffset;
    const character = e.data; // null if it's a deletion

    if (character !== null) {
      socket.emit("charInput", {
        docId,
        character,
        position,
        timestamp: Date.now()
      });
    }
  });

  socket.on("receiveChar", ({ character, position }) => {
    const currentText = editor.textContent;
    const before = currentText.slice(0, position);
    const after = currentText.slice(position);
    editor.textContent = before + character + after;

    // Restore cursor to correct place (optional basic handling)
    const range = document.createRange();
    const sel = window.getSelection();
    if (editor.firstChild) {
      range.setStart(editor.firstChild, position + 1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
}

// Share document
async function shareDocument() {
  const userToShareWith = prompt("Enter the email of the user you want to share with:");
  if (!userToShareWith || !docId) return;

  try {
    const res = await fetch(`${API_BASE}/api/documents/${docId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail: userToShareWith }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Document shared successfully!");
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Error sharing document:", error);
    alert("Failed to share document.");
  }
}
