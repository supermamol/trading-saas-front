# mosaic-dnd

DnD tab‑centric playground built on top of React and react‑mosaic.

## 🎯 Goal

This project explores a **Drag & Drop first UX model** where:

- the **tab** is the only movable unit
- grouping, isolation and closing are **effects**, not commands
- layout (Mosaic) is strictly **orthogonal** to business logic
- there is **no concept of “isolated panel”** at the model level

A container with one tab *is* an isolated panel.

---

## 🧠 Core principles

### 1. Tabs are the only draggable entities
- never containers
- never headers
- never groups

### 2. Containers are tab stacks (LIFO)
- 1 tab → visually isolated
- N tabs → visually grouped
- same model, same rules

### 3. Drag & Drop is the language
There are only two valid DnD targets:

- **tab → container header**
  → grouping (move tab into container)

- **tab → neutral area**
  - if source has more than 1 tab → isolation
  - if source has 1 tab → closure

No explicit:
- attach
- detach
- close tab
- create group

---

## 🧱 Architecture (high level)

src/
model/ # pure business logic (tabs, containers, workspace)
dnd/ # drag & drop handling (UI → model mapping)
workspace/ # orchestration between model and layout
ui/ # dumb UI components


- **model** has no React dependency
- **layout** never modifies business state
- **DnD** only calls model actions

---

## 🚧 Status

This project is intentionally minimal and incremental.

Current focus:
- establish a clean, tab‑centric model
- validate DnD semantics before UI polish
- avoid legacy concepts and implicit behaviors

---

## 📌 Non‑goals (for now)

- no advanced styling
- no persistence
- no external DnD library until semantics are proven
- no premature abstractions

---

## 🧭 Why this project exists

This is a sandbox to design a **coherent DnD UX system** that can later
be integrated into a larger SaaS application.

Clarity > features.
Correctness > speed.
