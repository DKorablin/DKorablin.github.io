# Flatbed.WorkerService
Developer documentation for the SAL Flatbed Worker (Windows) Service host.

## Purpose
Flatbed.WorkerService hosts SAL (Software Abstraction Layer) plugins inside a Windows Service (or console for debug). It provides:
* Service lifecycle (install, start, stop, uninstall)
* Plugin discovery and initialization
* Settings bootstrap via XML/settings providers or by extra configuration plugin available through http(s) endpoint. (See Plugin.ConfigurationHttp)
* Remote method invocation via WCF (See Plugin.WcfServer)
* Basic session cache for plugin interaction
* Trace (`System.Diagnostics`) forwarding

## Targets
Multi-target project (legacy + modern):
* .NET Framework 3.5 (Windows Service classic environments)
* .NET 8 (windows) (modern deployment / container scenarios where Windows Service hosting is still required)

## High-Level Architecture
Program.cs -> parses command line -> `ApplicationArgs`.

Service.cs -> Windows Service implementation; creates HostService.

HostService.cs -> derives from HostBase (from `SAL.Flatbed`); loads plugins & settings providers; manages session cache & unload.

ServiceInstaller.cs -> thin P/Invoke wrapper for native service install/uninstall/start.

CmdLine classes -> attribute-driven command line parsing (AlphaOmega.Console).

## Command Line Usage
Executable can be used to install/uninstall or debug run.
```
Flatbed.WorkerService.exe [options]
```
Primary switches:
* -I | /Install            Install service
* -U | /Uninstall          Uninstall service
* -? | /Help               Show help
* /Debug                   Run as console app (no service wrapper)

Service configuration switches (when installing):
* -N | /ServiceName \<name>       Internal service name (default `SALFlatbedSvc`)
* -D | /DisplayName \<display>    Display name (default `SAL Flatbed Service`)
* -A | /Arguments "args"         Extra args appended to executable service path
* -R | /Access \<rights>          Access mask (enum `AccessRights`)
* -T | /Type \<type>              ServiceType enum (e.g. `Win32OwnProcess`)
* -S | /Start \<startType>        StartType enum (`AutoStart`, `DemandStart` ...)
* -E | /Error \<errorControl>     ErrorControl enum
* /Dependencies name1,name2      Comma separated dependent services
* -L | /Login DOMAIN\User        Account (default `NT AUTHORITY\NetworkService`)
* -P | /Password \<pwd>           Password (omit for built-in accounts)

Return codes (ReturnType enum): 0 success, -1 exception, -2 insufficient parameters, -3 invalid command, -4 service failure.

## Typical Scenarios
Install & start automatically:
```
Flatbed.WorkerService.exe /I /N:"svc.ServiceName" /D:"Service description" /A:"\"/SAL_Path:C:\Service Plugins\svc.ServiceName\"" /L:"ServiceUser@domain.com" /P:"derPassword"
```
Debug service with plugins in console (no SCManager interaction):
```
Flatbed.WorkerService.exe /D  "/SAL_Path:C:\Service Plugins\svc.ServiceName\"
```
Uninstall:
```
Flatbed.WorkerService.exe /U /N:"svc.ServiceName"
```

## Plugin Loading Flow
1. `HostService.LoadPlugins(pluginPath)`
2. `FilePluginProvider` enumerates binaries in pluginPath.
3. Kernel plugin (`IPluginKernel`) detected & stored.
4. `Configuration.Plugin.SetKernelForSettings(kernel)`
5. `XmlSettingsPlugin` registered as settings provider.
6. Additional `ISettingsPluginProvider` instances initialized (OnConnection Startup).
7. All plugins initialized (`InitializePlugins`).

Unload: `HostService.UnloadPlugins` invokes `OnDisconnection(reason)` for each plugin then RemovePlugins().

Session Cache: HostService.SetSessionValue / GetSessionValue for lightweight cross-plugin data sharing in current run.

## Tracing & Logging
TraceSource created in `Program.CreateTraceSource\<T>()`. All service lifecycle events + exceptions traced. Attach listeners through app.config or Trace.Listeners at runtime.

Important events: Service start (includes plugin count & settings path), stop, dispose, critical exceptions.

## Extending
To add a plugin:
1. Implement `IPlugin` (and optionally `IPluginKernel` / `ISettingsPluginProvider` or `IPluginProvider`).
2. Drop assembly into plugin directory or subfolder (SAL.Flatbed.Configuration.BaseDirectory).
3. Ensure dependencies are present.
4. For settings: implement custom settings provider or rely on XmlSettingsPlugin.

Kernel Plugin: First discovered implementation of `IPluginKernel` becomes kernel; affects Configuration.Plugin.SetKernelForSettings.

## Configuration
BaseDirectory / plugin folder resolution comes from SAL.Flatbed.Configuration.BaseDirectory.
Settings path: Configuration.Plugin.SettingsPath (trace output on start). XML settings plugin uses that path for persistence.

## Service Installation Internals
ServiceInstaller uses advapi32 `CreateService` / `DeleteService` / `StartService` P/Invoke. Dependencies are marshalled as double-null terminated string list. Account defaults to NetworkService for reduced privilege.

## Debugging Tips
* Use `/Debug` to run plugins without service manager overhead.
* Attach debugger after pressing /Debug if needed or run executable with this switch to attach debugger automatically.
* Check Trace listeners output (e.g. configure `TextWriterTraceListener`).
* Unhandled exceptions captured via `AppDomain.CurrentDomain.UnhandledException`.

## Upgrading / Multi-target Considerations
* Prefer net8 implementation for modern deployments.
* Keep APIs compatible with net35 if distributing to legacy servers.
* Test plugins against both runtimes when using conditional compilation.

## License / Attribution
See project root for licensing details. Copyright (c) Danila Korablin.

## Quick Reference
Install:    Flatbed.WorkerService.exe /Install
Uninstall:  Flatbed.WorkerService.exe /Uninstall
Run debug:  Flatbed.WorkerService.exe /Debug
Help:       Flatbed.WorkerService.exe /Help

## FAQ
Q: Where do I place plugins? A: BaseDirectory from SAL.Flatbed.Configuration.

Q: How do I supply settings? A: Via XML settings provider or implement ISettingsPluginProvider.

Q: How to change service account? A: Use /Login and /Password during /Install.

Q: Why nothing happens with no args? A: Without any of Install/Uninstall/Help/Debug the service is started by SCM only.

---
For additional integration details see SAL.Flatbed core repository.
