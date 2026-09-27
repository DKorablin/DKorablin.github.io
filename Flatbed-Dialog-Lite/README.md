# Flatbed.Dialog.Lite

Flatbed.Dialog.Lite is a small Windows desktop component that makes application dialogs feel consistent, modern and responsive across both older and newer Windows systems. It focuses on what end users experience: clean windows, remembered positions, optional dark appearance and smooth extensibility through plug-ins – without the user needing to care about the underlying technology.

## What You Get As An End User
* Consistent dialog look & feel: Windows you open behave the same way everywhere in the app.
* Optional Dark Mode: Switch to a darker palette that is easier on the eyes (if the host app enables it).
* Remembers preferences: Window size, position and other settings can be recalled the next time you open the app.
* Fast start: Lightweight footprint keeps launch times short even on older PCs.
* Seamless add‑ons: The application can offer extra functionality via plug‑ins without complicated installs.
* Future ready: Works on very old systems (NET Framework 4.8) up to the newest .NET 8 runtime – helping apps stay supported longer.

## Typical User Scenarios
1. You reopen the application and each dialog appears exactly where you left it.
2. You switch to Dark Mode and all supported dialogs immediately adapt their colors for evening work.
3. A new feature appears after updating or dropping a plug‑in file into a designated folder – no manual configuration required.
4. You use the app on an older workstation at work and a modern laptop at home; dialogs behave the same in both places.

## Experience Benefits
| Need | How Flatbed.Dialog.Lite Helps |
|------|-------------------------------|
| Reduced eye strain | Optional dark theme styling applied consistently |
| Less repetitive setup | Automatic recall of window state and sizing |
| Smooth upgrades | Same dialog behavior preserved across platform versions |
| Lightweight updates | Plug‑ins discovered without complex install steps |
| Confidence & clarity | Consistent layout rules across all dialogs |

## Dark Appearance
When enabled by the host application, dialogs adopt darker backgrounds and adjusted foreground colors for readability. Users can toggle this (if exposed) without restarting.

## Settings & Personalization
User‑specific adjustments (window size/position or other simple preferences) are stored so they survive restarts. This means less time resizing or moving windows and more time using features.

## Plug‑In Ready
Applications built on this can transparently extend capabilities. For the end user this translates to new tools or panels appearing after an update or a simple file drop – no extra wizards.

## Performance & Footprint
Designed to stay small: unnecessary overhead is avoided so dialogs open quickly even on legacy hardware still common in corporate environments.

## Reliability Across Versions
Multi‑targeting (NET 4.8, 8) allows one product to run on older company machines while also taking advantage of newer Windows features when available. Users just see a consistent interface.

## Getting Started As A User
If Flatbed.Dialog.Lite is inside your application, there is nothing special to install. Launch the app and:
1. Open a dialog – it should appear styled consistently.
2. Move or resize it – reopen later and it returns to that shape and position.
3. Toggle dark theme (if provided in Settings) – dialog colors update instantly.
4. Drop a verified plug‑in file (if your app allows) – new options show up after a quick refresh.

## Frequently Asked (End User)
Q: Why did my window reopen where I left it?  A: The framework stores window state for convenience.
Q: Can I turn dark mode off?  A: Yes, switch back via the app’s theme or appearance setting.
Q: Do I need to reconfigure after updates?  A: No, stored preferences are kept unless the app resets them.
Q: Is it safe to add plug‑ins?  A: Only add plug‑ins from trusted sources provided by your vendor or IT.

## Accessibility & Clarity (Foundations)
While lightweight, dialogs aim for readable contrast and predictable tab order. Theme changes retain legibility to reduce cognitive load.

## For Administrators
Silent updates are easier because user settings and dialog behavior stay stable. Older machines can run the same build line, simplifying deployment waves.

## License
See repository for license terms.

---
Flatbed.Dialog.Lite – Focused on user comfort, consistency and longevity of Windows dialog experiences.
