A GPS spoofing / mock-location application for Android, built with **.NET MAUI** (net10.0-android).  
It injects a fake GPS position into the Android location stack via a persistent foreground service, letting any app on the device see whatever coordinates you choose — either a fixed point or a moving route.

---

## Features

| Feature | Description |
|---|---|
| **Single-point emulation** | Lock the device GPS to any fixed coordinate. |
| **Route emulation** | Define a sequence of waypoints; the service smoothly interpolates movement between them at a configurable speed. |
| **Looping routes** | Optionally repeat the route from the beginning when the end is reached. |
| **Interactive OSM map** | Full OpenStreetMap / Leaflet.js map embedded in the app (bundled offline — no CDN dependency at runtime). Tap the map to set a location or add route waypoints. |
| **Draggable overlay window** | A floating mini-map overlay that stays on top of other apps while emulation is running, so you can reposition the fake location without leaving your target app. |
| **Start on boot** | Automatically resumes the last emulation session after a device reboot or app update. |
| **GPS noise simulation** | Adds configurable random jitter (±N metres) to mimic realistic GPS drift. |
| **Auto / manual altitude** | Optionally forward the real device altitude or override it with a fixed value. |
| **Persistent settings** | All configuration is saved automatically to `app_state.json` in the app data directory. |

---

## Requirements

- Android **5.0 (API 21)** or higher (target SDK 35).
- The app must be selected as the **Mock Location App** in Android Developer Options.
- For the floating overlay window: the **"Display over other apps"** permission must be granted.

---

## Setup

1. Enable **Developer Options** on your Android device.
2. Inside Developer Options → **Select mock location app** → choose **FakeGpsMaui**.
3. Launch the app.
4. *(Optional)* If you want the overlay map window, tap **Settings → Open Overlay Permission Settings** and grant the "Display over other apps" permission.
5. *(Optional)* If the app reports "mock location not allowed", tap **Settings → Open Mock App Settings** to verify the mock-location permission is correctly set.

---

## Usage

### Single-Point Mode

1. Ensure the **route/single-point toggle button** (orange, top-right of the map) shows the single-point icon.
2. Tap anywhere on the map **or** open the coordinate dialog (Settings → *Add Coordinates*) to choose a target location.
3. Press the **red play button** (bottom-left of the map) to start emulation.  
   A toast confirms the active coordinates.
4. Press the button again (it becomes a pause icon) to stop emulation.

### Route Mode

1. Tap the **orange toggle button** to switch to route mode (icon changes to a route icon).
2. Add waypoints by tapping the map or using **Settings → Add Coordinates**.  
   Each tap appends a point to the route; the route is drawn on the map.
3. Configure **speed**, **dwell time**, and **loop** behaviour in Settings.
4. Press the **play button** to start.  
   The service interpolates GPS positions between waypoints at the configured speed using the Haversine formula.
5. Tap the **eraser button** (purple, top-right) to clear all route points.

---

## Settings Reference

### Application

| Setting | Default | Description |
|---|---|---|
| **Start on boot** | Off | Automatically restart the last emulation session after a device reboot or package update. |
| **Show overlay map** | Off | Display a draggable floating map window over other apps during single-point emulation. Requires the "Display over other apps" permission. |

### GPS

| Setting | Default | Description |
|---|---|---|
| **Auto altitude** | On | Pass the real device altitude to the mock location when available. |
| **Manual altitude (m)** | — | Override altitude with a fixed value (metres). Visible only when Auto altitude is off. |
| **Update interval (ms)** | 1000 | How often the foreground service publishes a new mock location update. |
| **GPS noise** | On | Add small random position jitter to simulate real GPS accuracy. |
| **Noise radius (m)** | 3.0 | Maximum horizontal jitter radius in metres (0 – 100). |

### Route

| Setting | Default | Description |
|---|---|---|
| **Point dwell time (s)** | 5 | How long the fake GPS lingers at each waypoint before moving to the next (used in dwell-mode playback). |
| **Speed (km/h)** | 5.0 | Movement speed used to compute interpolated GPS positions between waypoints. |
| **Loop route** | Off | Restart the route from the first waypoint when the last one is reached. |

---

## Architecture Overview

### Project Structure

```
FakeGpsMaui/
├── MainPage.xaml / .cs          # Main UI: map, toolbar, settings sheet, coordinate dialog
├── MauiProgram.cs               # DI container setup
├── Platforms/
│   └── Android/
│       ├── AndroidManifest.xml
│       ├── Services/
│       │   ├── AndroidLocationMocker.cs          # ILocationMocker for Android; sends intents to the service
│       │   ├── MockLocationForegroundService.cs  # Core foreground service (location injection)
│       │   ├── MockLocationForegroundService.Route.cs    # Route playback & Haversine interpolation
│       │   ├── MockLocationForegroundService.Overlay.cs  # Floating WebView overlay window
│       │   ├── MockLocationForegroundService.Notification.cs  # Persistent notification
│       │   ├── MockLocationForegroundService.AppState.cs      # Reads/writes saved state
│       │   └── MockLocationForegroundService.LocationProvider.cs  # Android LocationManager provider
│       └── BootCompletedReceiver.cs   # Handles ACTION_BOOT_COMPLETED & ACTION_MY_PACKAGE_REPLACED
└── Services/
    ├── AppSettingsService.cs     # All settings: loading, validation, auto-save
    ├── IAppStateStore.cs         # Persistence abstraction
    ├── JsonAppStateStore.cs      # JSON-file implementation of IAppStateStore
    ├── ILocationMocker.cs        # Platform-agnostic mock-location interface
    ├── NoOpLocationMocker.cs     # No-op implementation (non-Android builds)
    ├── EmulationRunState.cs      # Enum: Stopped / Starting / Running / Stopping / Failed
    ├── GlobalExceptionHandler.cs
    └── Maps/
        ├── IMapProviderAdapter.cs          # Map provider abstraction
        ├── MapProviderKind.cs              # Enum (Osm, …)
        ├── MapProviderRegistry.cs          # Resolves adapter by kind
        ├── OpenStreetMapProviderAdapter.cs # Leaflet/OSM implementation
        └── MapViewportState.cs             # Zoom + centre coordinates
```

### Key Components

#### `MockLocationForegroundService`
The heart of the app — a long-running Android foreground service typed as `ForegroundService.TypeLocation`. It:
- Registers itself as a **mock location provider** via `LocationManager`.
- Publishes a new `Location` object on every timer tick (default: every 1 000 ms).
- In **route mode**, advances the virtual position along the polyline by computing step distance from speed × interval, using the Haversine formula for segment lengths and linear interpolation for sub-segment positions.
- Optionally hosts a **draggable WebView overlay** (`SYSTEM_ALERT_WINDOW`) showing the live position on an OSM mini-map.
- Broadcasts `ACTION_STATE_CHANGED` intents so the UI can reflect the current `EmulationRunState`.

#### `AndroidLocationMocker`
Thin client that forwards UI commands (start / stop / reset) to `MockLocationForegroundService` via explicit `Intent` actions, and listens for `ACTION_STATE_CHANGED` broadcasts to expose a `StateChanged` event to the UI layer.

#### `AppSettingsService`
Manages all user preferences as typed properties backed by `IAppStateStore`. Mutations auto-save asynchronously with a semaphore-guarded write queue. Implements `INotifyPropertyChanged` for two-way binding.

#### `JsonAppStateStore`
Persists a key/value document to `app_state.json` in the app's private data directory. Values are stored as raw `JsonElement` objects, allowing heterogeneous typed values without separate DTOs per key.

#### `BootCompletedReceiver`
Receives `ACTION_BOOT_COMPLETED` and `ACTION_MY_PACKAGE_REPLACED`. Reads saved settings and restarts the foreground service automatically — route mode if a route was active, single-point mode otherwise.

#### `OpenStreetMapProviderAdapter`
Loads `osm_map.html` from app assets and **inlines** the bundled `leaflet.css` and `leaflet.js` files, replacing the CDN `<link>` and `<script>` tags to consume less traffic and faster loading time.

---

## Permissions

| Permission | Purpose |
|---|---|
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` | Required to register as a mock provider. |
| `ACCESS_MOCK_LOCATION` | Grants mock-location injection rights. |
| `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_LOCATION` | Keeps the service alive in the background. |
| `SYSTEM_ALERT_WINDOW` | Allows the floating overlay window to draw over other apps. |
| `RECEIVE_BOOT_COMPLETED` | Enables the boot auto-start feature. |
| `INTERNET` + `ACCESS_NETWORK_STATE` | Used by the WebView to load map tiles. |

---

## Building

```bash
# Debug build (APK)
dotnet build -f net10.0-android -c Debug

# Release build (AAB)
dotnet publish -f net10.0-android -c Release
```

Requires the **.NET 10 Android workload**:

```bash
dotnet workload install android
```

The release AAB is signed with the keystore configured in `FakeGpsMaui.csproj`.  
The signed APK / AAB output lands in `bin/Release/net10.0-android/`.
