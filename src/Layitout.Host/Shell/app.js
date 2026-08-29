// Tab Switching Logic
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));

    btn.classList.add("active");
    const targetId = `tab${btn.getAttribute("data-tab").charAt(0).toUpperCase() + btn.getAttribute("data-tab").slice(1)}`;
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.remove("hidden");
  });
});

// Workspace Split Pane Resizing
const resizer = document.getElementById("dragResizer");
const workspace = document.getElementById("workspacePanel");
let isDragging = false;

resizer.addEventListener("mousedown", (e) => {
  isDragging = true;
  resizer.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const newWidth = e.clientX;
  if (newWidth >= 220 && newWidth <= 700) {
    workspace.style.width = `${newWidth}px`;
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    resizer.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
});

// Render user app into sandboxed iframe preview
window.loadUserPreview = function (htmlContent, cssContent) {
  const iframe = document.getElementById("previewFrame");
  if (!iframe) return;

  const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
  const combined = `
    <!DOCTYPE html>
    <html>
      <head><style>${cssContent || ""}</style></head>
      <body>${htmlContent || ""}</body>
    </html>
  `;
  iframe.srcdoc = combined;
};
