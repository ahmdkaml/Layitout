// Global State for UI Attachments
let discoveredComponents = [];
let selectedComponentId = null;

// Tab Switcher
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.add("hidden"));

    btn.classList.add("active");
    const targetId = `tab${btn.getAttribute("data-tab").charAt(0).toUpperCase() + btn.getAttribute("data-tab").slice(1)}`;
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.remove("hidden");

    if (btn.getAttribute("data-tab") === "graph") {
      renderRelationshipFlow();
    }
  });
});

// Workspace Splitter Resize
const resizer = document.getElementById("dragResizer");
const workspace = document.getElementById("workspacePanel");
let isDragging = false;

resizer.addEventListener("mousedown", () => {
  isDragging = true;
  resizer.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  if (e.clientX >= 250 && e.clientX <= 700) {
    workspace.style.width = `${e.clientX}px`;
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

// 1. Sandbox Preview Loader
window.loadUserPreview = function (htmlContent, cssContent) {
  const iframe = document.getElementById("previewFrame");
  if (!iframe) return;

  iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head><style>${cssContent || ""}</style></head>
      <body>${htmlContent || ""}</body>
    </html>
  `;

  iframe.onload = () => {
    scanDiscoveredComponents();
  };
};

// 2. Discover [data-component] or identifiable elements in Preview Frame
function scanDiscoveredComponents() {
  const iframe = document.getElementById("previewFrame");
  if (!iframe || !iframe.contentDocument) return;

  const doc = iframe.contentDocument;
  const nodes = doc.querySelectorAll("[data-component], [id]");

  discoveredComponents = [];
  nodes.forEach((el) => {
    if (!el.id) return;
    discoveredComponents.push({
      id: el.id,
      componentType: el.getAttribute("data-component") || el.tagName.toLowerCase(),
      emitter: el.getAttribute("data-emit") || "",
      listener: el.getAttribute("data-listen") || ""
    });
  });

  renderComponentList();
  if (discoveredComponents.length > 0 && !selectedComponentId) {
    selectComponent(discoveredComponents[0].id);
  }
}

// 3. Render Discovered Components List
function renderComponentList() {
  const listEl = document.getElementById("componentList");
  listEl.innerHTML = "";

  discoveredComponents.forEach((comp) => {
    const item = document.createElement("div");
    item.className = `component-pill ${comp.id === selectedComponentId ? "active" : ""}`;
    item.innerHTML = `
      <span>#${comp.id}</span>
      <span class="pill-badge ${comp.componentType}">${comp.componentType}</span>
    `;
    item.addEventListener("click", () => selectComponent(comp.id));
    listEl.appendChild(item);
  });
}

// 4. Select Component and Populate Configuration Controls
function selectComponent(id) {
  selectedComponentId = id;
  renderComponentList();

  const comp = discoveredComponents.find((c) => c.id === id);
  if (!comp) return;

  document.getElementById("selectedTargetHeader").textContent = `Target: #${comp.id}`;
  document.getElementById("emitterInput").value = comp.emitter;
  document.getElementById("listenerInput").value = comp.listener;

  document.getElementById("activeEmitterDisplay").innerHTML = `Emitter: <em>${comp.emitter || "None"}</em>`;
  document.getElementById("activeListenerDisplay").innerHTML = `Listener: <em>${comp.listener || "None"}</em>`;
}

// 5. Attach Emitter to Component in Preview DOM
document.getElementById("btnSaveEmitter").addEventListener("click", () => {
  if (!selectedComponentId) return;
  const val = document.getElementById("emitterInput").value.trim();
  const iframe = document.getElementById("previewFrame");
  const el = iframe?.contentDocument?.getElementById(selectedComponentId);

  if (el) {
    if (val) {
      el.setAttribute("data-emit", val);
    } else {
      el.removeAttribute("data-emit");
    }
  }

  const comp = discoveredComponents.find((c) => c.id === selectedComponentId);
  if (comp) comp.emitter = val;

  document.getElementById("activeEmitterDisplay").innerHTML = `Emitter: <em>${val || "None"}</em>`;
});

// 6. Attach Listener to Component in Preview DOM
document.getElementById("btnSaveListener").addEventListener("click", () => {
  if (!selectedComponentId) return;
  const val = document.getElementById("listenerInput").value.trim();
  const iframe = document.getElementById("previewFrame");
  const el = iframe?.contentDocument?.getElementById(selectedComponentId);

  if (el) {
    if (val) {
      el.setAttribute("data-listen", val);
    } else {
      el.removeAttribute("data-listen");
    }
  }

  const comp = discoveredComponents.find((c) => c.id === selectedComponentId);
  if (comp) comp.listener = val;

  document.getElementById("activeListenerDisplay").innerHTML = `Listener: <em>${val || "None"}</em>`;
});

// 7. Render Relationship Flow Graph
function renderRelationshipFlow() {
  const container = document.getElementById("relationshipFlow");
  container.innerHTML = "";

  const emitters = discoveredComponents.filter((c) => c.emitter);
  const listeners = discoveredComponents.filter((c) => c.listener);

  if (emitters.length === 0 && listeners.length === 0) {
    container.innerHTML = `<p class="section-hint">No emitters or listeners attached yet.</p>`;
    return;
  }

  emitters.forEach((emitter) => {
    const card = document.createElement("div");
    card.className = "flow-card";
    card.innerHTML = `
      <div class="flow-step">🔘 <strong>Component:</strong> #${emitter.id} (${emitter.componentType})</div>
      <div class="flow-arrow">↓ emits event:</div>
      <div class="flow-step">⚡ <strong>Channel:</strong> <code style="color:#38bdf8;">${emitter.emitter}</code></div>
    `;
    container.appendChild(card);
  });

  listeners.forEach((listener) => {
    const card = document.createElement("div");
    card.className = "flow-card";
    card.innerHTML = `
      <div class="flow-step">👂 <strong>Channel:</strong> <code style="color:#10b981;">${listener.listener}</code></div>
      <div class="flow-arrow">↓ updates target:</div>
      <div class="flow-step">📦 <strong>Component:</strong> #${listener.id} (${listener.componentType})</div>
    `;
    container.appendChild(card);
  });
}

// Rescan Button
document.getElementById("btnScanDom").addEventListener("click", scanDiscoveredComponents);
