document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://googledocsclone-2.onrender.com";
  const socket = io(API_BASE);
  const editor = document.getElementById("editor");
  const docTitle = document.getElementById("doc-title");
  const docId = new URLSearchParams(window.location.search).get("docId");
  const token = localStorage.getItem("token");

  function execCmd(command, value = null) {
    editor.focus();
    document.execCommand(command, false, value);
  }

  function formatBlock(tag) {
    editor.focus();
    document.execCommand("formatBlock", false, tag);
  }

  document.getElementById("fore-color").addEventListener("input", function () {
    editor.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, this.value);
  });

  document.getElementById("back-color").addEventListener("input", function () {
    editor.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("hiliteColor", false, this.value);
  });

  async function loadDoc() {
    const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    docTitle.value = data.title;
    editor.innerHTML = data.content;
  }

  docTitle.addEventListener("input", () => {
    socket.emit("edit-title", { docId, title: docTitle.value });
  });

  editor.addEventListener("input", () => {
    socket.emit("edit-content", { docId, content: editor.innerHTML });
  });

  socket.on("update-content", (data) => {
    if (data.content !== editor.innerHTML) {
      editor.innerHTML = data.content;
    }
  });

  socket.on("update-title", (data) => {
    if (data.title !== docTitle.value) {
      docTitle.value = data.title;
    }
  });

 
  document.getElementById("save-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(editor.innerText, 10, 10);
    doc.save(`${docTitle.value || "document"}.pdf`);
  });

  document.getElementById("save-word").addEventListener("click", () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + editor.innerHTML + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${docTitle.value || "document"}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  });

  socket.emit("join", docId); // Join the document room
  loadDoc();
});
