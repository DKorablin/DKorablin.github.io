---
layout: project
title: AutoClicker
project: AutoClickerMaui
group: apps
icon: AC
tagline: Record and replay taps on Android, with an optional AI agent
platforms:
  - Android 5.0+
  - .NET MAUI
---

<p><b>AutoClickerMaui</b> is a free, open-source Android app that automates repetitive tapping in any app or on your home screen.
You record a sequence of taps once — either at fixed coordinates or targeting a specific image on screen — and the app replays them in a continuous loop, with no root access required.
It can also hand control of the screen to an AI agent, which watches a screenshot of your app and either marks where to tap or taps for you.</p>

<h2 id="screenshots">Screenshots</h2>

<video class="demo-video" controls>
	<source src="Agent-1.webm" type="video/webm">
	Your browser does not support the video tag.
</video>

<div class="gallery">
	<a href="UI-1.png"><img src="UI-1-200.png" alt="AutoClickerMaui UI screenshot 1"></a>
	<a href="UI-2.png"><img src="UI-2-200.png" alt="AutoClickerMaui UI screenshot 2"></a>
	<a href="UI-3.png"><img src="UI-3-200.png" alt="AutoClickerMaui UI screenshot 3"></a>
</div>

<h2 id="features">Features</h2>

<ul>
	<li><b>Record &amp; replay tap sequences.</b> Draw numbered action markers directly on top of any app to build a "group" of steps, then play the whole sequence back on a loop.</li>
	<li>
		<b>Two click modes:</b>
		<ul>
			<li><b>Coordinate click</b> &mdash; taps a fixed (X, Y) point every time.</li>
			<li><b>Image click</b> &mdash; crop a small region of the screen as a template; during playback the app repeatedly scans the screen and taps once that image appears (or taps the live matched location as it moves), so sequences keep working even if elements shift on screen.</li>
		</ul>
	</li>
	<li><b>Per-app groups.</b> Each recorded sequence remembers which app it was recorded against (shown with that app's name and icon), or is tagged "Desktop" if recorded on the home screen. Selecting a group can bring its target app to the foreground automatically for editing.</li>
	<li><b>Floating overlay controls.</b> A draggable "Actions" button floats over your screen while recording or playing: drag it out of the way, tap it to start/stop the loop, and long-press markers to reposition them.</li>
	<li><b>AI agent ("Ask AI").</b> An optional floating button lets you type a plain-language request (e.g. "tap the Buy button"); the app sends a screenshot and your request to an LLM you configure, which can either mark where to tap for you to confirm (<b>Show Location</b> mode) or tap on your behalf (<b>Auto Click</b> mode) — see <a href="#ai-agent">AI Agent</a> below.</li>
	<li><b>Conversation log.</b> A flyout page showing everything exchanged with the AI agent — your prompts, the screenshots it saw, the tool calls it made, and its replies — for transparency into what it did and why.</li>
	<li>
		<b>Tunable timing</b>, via the in-app Settings page:
		<ul>
			<li>Delay between clicks (default 500 ms)</li>
			<li>Image search poll interval — how often the app rescans for an image target (default 1000 ms)</li>
			<li>Tap duration — length of the simulated tap gesture (default 100 ms)</li>
		</ul>
	</li>
	<li><b>No root required.</b> Taps and screenshots are performed through Android's built-in Accessibility Service APIs.</li>
</ul>

<h2 id="how-it-works">How it works</h2>

<ol>
	<li><b>Grant permissions</b> the first time you open the app — see <a href="#permissions">Permissions</a> below.</li>
	<li>On the <b>home screen</b>, tap <b>Record</b> to start a new group, or select an existing group and tap <b>Edit</b> to modify it.</li>
	<li>A floating overlay appears over whatever app is in front. Tap anywhere to drop a numbered marker (a coordinate click), or use the crop tool to select a region of the screen to record an image-based click.</li>
	<li>Drag markers to reposition them, or open a marker's menu to delete it.</li>
	<li>Tap the floating <b>Actions</b> button to start playback — the app replays your recorded steps in a loop until you tap Actions again or press Back.</li>
	<li>Back on the home screen, rename or remove any group from its "⋮" menu, and adjust timing under <b>Settings</b>.</li>
</ol>

<h2 id="ai-agent">AI Agent</h2>

<p>AutoClickerMaui can call out to an AI model to help you build or drive a sequence, instead of (or alongside) recording one by hand.</p>

<ol>
	<li>Open <b>AI Agent settings</b> and choose your provider (OpenAI, Grok, Gemini, Azure OpenAI, a self-hosted/local endpoint, or GitHub Copilot CLI), then supply its endpoint URL and API key. If you have a screenshot or photo of those credentials, the <b>Scan</b> button can read them for you: it takes a photo, recognizes text on-device, and auto-fills the endpoint/key fields for you to review before saving — nothing is uploaded anywhere for this step.</li>
	<li>Pick an <b>agent click mode</b>:
		<ul>
			<li><b>Show Location</b> — the agent may only view screenshots and drop markers for you to confirm; it never taps on its own.</li>
			<li><b>Auto Click</b> — the agent may also tap on your behalf.</li>
		</ul>
	</li>
	<li>While recording or playing, tap the <b>Ask AI</b> button on the overlay and type what you want done. The app sends the model a screenshot, your request, and context about the app currently in focus; the model responds by adding markers, tapping, or replying with text, which appears as a floating bubble and is recorded in the <b>Conversation log</b>.</li>
	<li>Automation and agent runs stop automatically if you leave the target app (e.g. go home or switch apps), so the agent can't act on the wrong screen.</li>
</ol>

<p>Conversation history is kept only in memory by default for the current session and is not written to disk. No screenshot or credential data is sent anywhere except to the AI provider you configure.</p>

<h2 id="permissions">Permissions</h2>

<p>AutoClickerMaui needs the following to function:</p>

<table>
	<thead>
		<tr>
			<th>Permission</th>
			<th>Why it's needed</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><b>Accessibility Service</b></td>
			<td>Lets the app take screenshots (for image matching) and dispatch simulated taps. Must be enabled manually &mdash; the app shows a banner with a shortcut to Android's Accessibility settings if it isn't.</td>
		</tr>
		<tr>
			<td><b>Display over other apps</b> (<code>SYSTEM_ALERT_WINDOW</code>)</td>
			<td>Draws the recording/playback overlay (markers, Actions button) on top of other apps.</td>
		</tr>
		<tr>
			<td><b>Foreground service / notifications</b></td>
			<td>Keeps the overlay and click engine running reliably while another app is in the foreground; shows a persistent notification while active (required on Android 13+).</td>
		</tr>
		<tr>
			<td><b>Camera</b></td>
			<td>Used only by the optional Connection Scan feature to photograph and auto-fill AI provider credentials; not required for tap/image automation.</td>
		</tr>
	</tbody>
</table>

<p>None of this data leaves your device except when you explicitly configure and use the AI Agent feature, in which case screenshots and your prompts are sent only to the AI provider you set up. Image templates used for image matching are processed only locally and are never uploaded.</p>

<h2 id="requirements">Requirements</h2>

<ul>
	<li>Android 5.0 (API 21) or later.</li>
	<li>Not currently available for iOS, Windows, or macOS.</li>
</ul>

<h2 id="installation">Installation</h2>

<p>AutoClickerMaui isn't published on the Play Store. Each push to the main branch is automatically built, signed, and published as an APK.</p>

<ol>
	<li>Download the latest <code>.apk</code>.</li>
	<li>On your Android device, allow installation from unknown sources if prompted.</li>
	<li>Install the APK and open the app.</li>
	<li>Follow the in-app permission prompts before recording your first sequence.</li>
</ol>

<h2 id="disclaimer">Disclaimer</h2>

<p>Automating taps may violate the terms of service of some apps or games. Use AutoClickerMaui responsibly and at your own risk.</p>
