# Vencord Plugin Development Highlights

## 🛠️ Core Architecture & Workflow
* **Pre-load Patching**: Vencord modifies code *directly* before Discord loads it.
    * *Benefit:* Significantly more efficient and stable than runtime patching.
* **Dev Environment**: Built using `pnpm build --watch` for real-time updates.
    * *Indicator:* The `(Dev)` tag appears next to the Vencord version in settings.
* **Folder Structure**: Plugins live in `src/userplugins/`, keeping custom code isolated and organized.
    * *Entry Point:* `index.ts` (or `.tsx` for React components).

## 🧩 The Patching System
* **The "Patch Helper"**: A built-in Vencord tool in settings that validates unique finders.
    * *Safety Check:* Ensures your "find" string matches exactly one module (prevents "Multiple matches" or "No match" errors).
* **Regex-Based Replacements**: Uses standard Regex for precise code injection.
    * **Finders**: Uses unique strings (often i18n strings or class names) to locate modules.
    * **Lookbehinds**: Uses `(?<=...)` to anchor matches without accidentally deleting code.
    * **`\i` Identifier**: A special Vencord regex token that automatically matches variable names (safe against minification changes).

## ⚛️ UI & React Components
* **React Integration**: Full support for `.tsx` files to write native React components.
* **Native Components**: Access to Discord's internal component library (e.g., `Button` from `@webpack/common`) to match the native UI look and feel.
* **React DevTools**: Essential for finding the right component to patch.
    * *Workflow:* Select element -> Find source -> Identify array of children -> Inject custom component.

## ⚙️ Settings API
* **Built-in Settings UI**: No need to build custom settings menus from scratch.
* **`definePluginSettings`**: a simple API to define typed configuration options.
    * *Supports:* Booleans, Strings, Numbers, etc. via `OptionType`.
* **Reactive Updates**: Settings changes apply instantly without requiring a client restart.

## 🔍 Discord Internals Access
* **Lazy Loading**: Uses `findByPropsLazy` to safely grab Discord functions (like `sendMessage`) that might not be initialized when the plugin first loads.
* **Utils**: Access to Vencord's utility helpers (e.g., `getCurrentChannel` from `@utils/discord`) to simplify interaction with the client state.

# Vencord Plugin Quickstart Guide

## Phase 1: Intel (Research)
* **Enable React DevTools:** Go to Vencord Settings -> `Developer` -> Enable. Restart Discord.
* **Locate Target:** Use the DevTools "Select" element to find the specific component/UI you want to mod.
* **Find Source:** Open the **Patch Helper** tab in Vencord settings. Paste a unique string (class name or text) to find the module.
* **Test Regex:** Write and verify your regex directly inside Patch Helper to ensure it matches exactly **one** module.

## Phase 2: The Setup
* **Run Watch Mode:** Execute `pnpm build --watch` in your terminal for hot-reloading.
* **Create File:** Navigate to `src/userplugins/` and create a new folder with an `index.ts` file.
* **Boilerplate:** Export the default `definePlugin` structure with metadata (name, description, authors).

## Phase 3: The Code
* **Define Patches:** Insert your tested regex into the `patches` array in your plugin definition.
* **The Logic:**
    * **Find:** The unique string identifying the module.
    * **Replacement:** The object containing `match` (regex) and `replace` (injection string).
* **Add UI (Optional):** Define standard React components in the same file and inject them via the patch using `$self.YourComponent()`.

## Phase 4: Verification
* **Save & Reload:** Save the file. If you modified patches, fully restart Discord (`Ctrl+R`).
* **Console Check:** Open the console (`Ctrl+Shift+I`) and check for errors or successful load logs.