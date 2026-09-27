# Flatbed.Dialog

SAL.Windows - Dialog based Interface

Flatbed.Dialog provides a dialog‑driven UI abstraction for SAL.Windows applications, targeting legacy .NET Framework 3.5 and modern .NET 8 (multi‑target single csproj).

Core purpose: standardize modal and modeless dialog presentation, lifecycle, and result handling across platforms.


## Key points

* Unified API surface for dialogs across both target frameworks.
* Encapsulates dialog initialization, validation, and clean shutdown.
* Supports synchronous (blocking) and asynchronous patterns where available.
* Centralized result/status model (OK/Cancel/Error) for higher‑level orchestration.
* Extension points for custom dialog hosts and theming.
* Shared assembly versioning and strong‑name signing for release integrity.
  Use cases:
* Replace ad‑hoc Form.ShowDialog / Window.Show usage with consistent service calls.
* Plug into larger SAL workflow pipelines needing user input checkpoints.
* Enable future migration from .NET 3.5 to .NET 8 without UI contract changes.