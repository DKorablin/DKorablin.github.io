Hybrid WPF + WinForms Multiple Document Interface (MDI) host built on top of [Dirkster99's AvalonDock](https://github.com/Dirkster99/AvalonDock).

[![UI Screenshot](.github/assets/UI-1-200.png)](.github/assets/UI-1.png)

## Overview
Flatbed.MDI.Avalon provides an extensible shell that loads plugins from the file system (DLLs) and hosts their UI (WinForms or WPF) inside an AvalonDock layout. It supports runtime kernel plugin selection, persistent window layout, per‑plugin settings, and common host services (menu, toolbars, trace/output panel, event panel).

## Key Features
* Plugin architecture
  * File system discovery of DLL plugins
  * Kernel plugin (core) selection dialog with persistence
  * Settings providers (XML) scoped per kernel/company
  * Session value caching
* UI Hosting
  * AvalonDock layout serialization/restoration
  * WinForms controls embedded via WindowsFormsHost
  * Output and Event panels as dockable anchorables
  * Dynamic window creation with plugin‑specific persisted state
* User Experience
  * DPI awareness (optional) and Visual Styles
  * Tray (NotifyIcon) integration (title/icon overridden by kernel plugin)
  * About dialog showing loaded plugins metadata
  * Options dialog (extensible for plugin settings)
* Logging & Diagnostics
  * Central TraceSource forwarding
  * Console output redirected to Output panel
* Configuration & Persistence
  * Layout saved to %AppData% / Company / Kernel (or local folder if Assembly.config present)
  * Window size/position persisted between runs

## Command Line Arguments
* /SAL_Kernel:PluginName  – Preselect default kernel plugin.

## Settings Storage
If an Assembly.config file exists in the current directory it becomes the root for settings. Otherwise settings are stored under ApplicationData/Company/Kernel.

## Target Framework
.NET 8 (net8.0-windows)

## Structure Highlights
* **App.xaml.cs** – Application bootstrap, trace setup, DPI handling.
* **MainWindow.xaml.cs** – Core shell, plugin loading, layout persistence, menus/toolbars wiring.
* **Plugins/HostMdi.cs** – Plugin lifecycle management (load, initialize, unload) + window/menu cleanup.
* **Windows/WindowControl.cs** – Bridge between AvalonDock and plugin UI (WinForms/WPF), persistence id generation.
* **Logging/ConsoleReader.cs** – Redirects Console to Output panel.
* **SAL.Shared/*** – Shared infrastructure (configuration paths, plugin providers, settings, utilities).

## Extending
1. Drop plugin DLLs into the plugin path (default: application base directory).
2. Implement `IPlugin`; for kernel features implement `IPluginKernel` & optionally `IKernelInfo`.
3. Provide `IPluginSettings` for forms needing persisted arguments.
4. Use host interfaces (`IHostWindows`, `IWindows`, `IToolBar`, `IMenu`) to add UI elements.

## Persistence of Layout
Each docked window generates a ContentId combining plugin id, form type, and optional persisted settings string; restored on next run through XmlLayoutSerializer.

## Disclaimer
Early stage; several members intentionally not yet implemented (e.g., dynamic WPF toolbar item creation methods). API may evolve.

---
SAL.Windows - MDI host wrapper around AvalonDock.