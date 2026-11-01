// Desktop shell for Squeek Pet: a transparent, always-on-top pet window that
// lets clicks through everywhere except the pet, a tray menu, and a settings
// window. All wheel data handling lives in the web front end.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{
    AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, RunEvent, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, Wry,
};
use tauri_plugin_window_state::StateFlags;

const PET: &str = "pet";
const SETTINGS: &str = "settings";
/// How often the pointer is checked against the pet's clickable areas.
const CURSOR_POLL: Duration = Duration::from_millis(33);

static PET_VISIBLE: AtomicBool = AtomicBool::new(false);

/// A clickable area of the pet window, in logical pixels from its top-left corner.
#[derive(Clone, Copy, Debug, Deserialize)]
struct Rect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

impl Rect {
    fn contains(&self, x: f64, y: f64) -> bool {
        x >= self.x && x <= self.x + self.w && y >= self.y && y <= self.y + self.h
    }
}

#[derive(Default)]
struct HitRegions(Mutex<Vec<Rect>>);

#[derive(Clone, Serialize)]
struct CursorEvent {
    x: f64,
    y: f64,
    inside: bool,
}

struct TrayItems {
    toggle: MenuItem<Wry>,
    details: MenuItem<Wry>,
    demo: CheckMenuItem<Wry>,
    settings: MenuItem<Wry>,
    quit: MenuItem<Wry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TrayLabels {
    toggle: String,
    details: String,
    demo: String,
    settings: String,
    quit: String,
    demo_on: bool,
}

#[tauri::command]
fn set_hit_regions(regions: tauri::State<'_, HitRegions>, rects: Vec<Rect>) {
    if let Ok(mut current) = regions.0.lock() {
        *current = rects;
    }
}

#[tauri::command]
fn set_tray_labels(items: tauri::State<'_, TrayItems>, labels: TrayLabels) -> Result<(), String> {
    let result = (|| -> tauri::Result<()> {
        items.toggle.set_text(labels.toggle)?;
        items.details.set_text(labels.details)?;
        items.demo.set_text(labels.demo)?;
        items.demo.set_checked(labels.demo_on)?;
        items.settings.set_text(labels.settings)?;
        items.quit.set_text(labels.quit)
    })();
    result.map_err(|e| e.to_string())
}

/// Resizes the pet window and keeps its bottom-right corner in place, which is
/// where the pet stands.
#[tauri::command]
fn resize_pet(window: WebviewWindow, width: f64, height: f64) -> Result<(), String> {
    let result = (|| -> tauri::Result<()> {
        let scale = window.scale_factor()?;
        let position = window.outer_position()?;
        let size = window.outer_size()?;
        let next = LogicalSize::new(width, height).to_physical::<u32>(scale);
        if next == size {
            return Ok(());
        }
        let x = position.x + size.width as i32 - next.width as i32;
        let y = position.y + size.height as i32 - next.height as i32;
        window.set_size(next)?;
        window.set_position(PhysicalPosition::new(x, y))
    })();
    result.map_err(|e| e.to_string())
}

#[tauri::command]
fn open_settings(app: AppHandle) -> Result<(), String> {
    show_settings(&app).map_err(|e| e.to_string())
}

#[tauri::command]
fn hide_pet(app: AppHandle) {
    set_pet_visible(&app, false);
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

fn set_pet_visible(app: &AppHandle, visible: bool) {
    if let Some(window) = app.get_webview_window(PET) {
        let result = if visible { window.show() } else { window.hide() };
        if result.is_ok() {
            PET_VISIBLE.store(visible, Ordering::Relaxed);
        }
    }
}

fn toggle_pet(app: &AppHandle) {
    set_pet_visible(app, !PET_VISIBLE.load(Ordering::Relaxed));
}

fn show_settings(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(SETTINGS) {
        window.unminimize()?;
        window.show()?;
        return window.set_focus();
    }
    let window = WebviewWindowBuilder::new(app, SETTINGS, WebviewUrl::App("settings.html".into()))
        .title("Squeek Pet")
        .inner_size(420.0, 700.0)
        .min_inner_size(360.0, 480.0)
        .center()
        .build()?;
    window.set_focus()
}

/// Creates the pet window in the bottom-right corner of the primary screen.
/// The window-state plugin then moves it to the last saved spot, if that
/// spot is still on a connected screen.
fn create_pet(app: &AppHandle) -> tauri::Result<()> {
    let config = app
        .config()
        .app
        .windows
        .iter()
        .find(|w| w.label == PET)
        .cloned()
        .expect("tauri.conf.json defines the pet window");
    let mut builder = WebviewWindowBuilder::from_config(app, &config)?;
    if let Some(monitor) = app.primary_monitor()? {
        let scale = monitor.scale_factor();
        let area = monitor.work_area();
        let right = (area.position.x as f64 + area.size.width as f64) / scale;
        let bottom = (area.position.y as f64 + area.size.height as f64) / scale;
        builder = builder.position(right - config.width - 24.0, bottom - config.height);
    }
    builder.build()?;
    set_pet_visible(app, true);
    Ok(())
}

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", "Show / Hide Squeek Pet", true, None::<&str>)?;
    let details = MenuItem::with_id(app, "details", "Show details", true, None::<&str>)?;
    let demo = CheckMenuItem::with_id(app, "demo", "Demo mode", true, false, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Squeek Pet", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[
            &toggle,
            &details,
            &PredefinedMenuItem::separator(app)?,
            &demo,
            &settings,
            &PredefinedMenuItem::separator(app)?,
            &quit,
        ],
    )?;

    let mut tray = TrayIconBuilder::with_id("squeek-pet")
        .tooltip("Squeek Pet")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "toggle" => toggle_pet(app),
            "details" => {
                set_pet_visible(app, true);
                let _ = app.emit_to(PET, "pet://menu", "details");
            }
            // The pet window owns the setting; it updates the check mark back.
            "demo" => {
                let _ = app.emit_to(PET, "pet://menu", "demo");
            }
            "settings" => {
                let _ = show_settings(app);
            }
            "quit" => app.exit(0),
            _ => {}
        });

    // macOS menu bar icons are monochrome templates; elsewhere use the app icon.
    #[cfg(target_os = "macos")]
    {
        tray = tray
            .icon(tauri::image::Image::from_bytes(include_bytes!("../icons/tray-template.png"))?)
            .icon_as_template(true);
    }
    #[cfg(not(target_os = "macos"))]
    {
        if let Some(icon) = app.default_window_icon() {
            tray = tray.icon(icon.clone());
        }
    }

    tray.build(app)?;
    app.manage(TrayItems {
        toggle,
        details,
        demo,
        settings,
        quit,
    });
    Ok(())
}

/// Makes the transparent parts of the pet window click-through. The pointer is
/// checked against the clickable areas the front end reports; mouse events
/// are only caught while the pointer is over one of them. The pointer
/// position is also forwarded so the hamster can look at it.
fn watch_cursor(app: AppHandle) {
    std::thread::spawn(move || {
        let mut ignoring: Option<bool> = None;
        let mut last: Option<(i64, i64, bool)> = None;
        loop {
            std::thread::sleep(CURSOR_POLL);
            if !PET_VISIBLE.load(Ordering::Relaxed) {
                continue;
            }
            let Some(window) = app.get_webview_window(PET) else {
                continue;
            };
            let (Ok(cursor), Ok(origin), Ok(scale)) = (app.cursor_position(), window.inner_position(), window.scale_factor())
            else {
                continue;
            };
            let x = (cursor.x - origin.x as f64) / scale;
            let y = (cursor.y - origin.y as f64) / scale;
            let inside = app
                .state::<HitRegions>()
                .0
                .lock()
                .map(|rects| rects.iter().any(|r| r.contains(x, y)))
                .unwrap_or(false);
            if ignoring != Some(!inside) && window.set_ignore_cursor_events(!inside).is_ok() {
                ignoring = Some(!inside);
            }
            let key = (x.round() as i64, y.round() as i64, inside);
            if last != Some(key) {
                last = Some(key);
                let _ = app.emit_to(PET, "pet://cursor", CursorEvent { x, y, inside });
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            set_pet_visible(app, true);
        }))
        .plugin(tauri_plugin_window_state::Builder::default().with_state_flags(StateFlags::POSITION).build())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
        .plugin(tauri_plugin_opener::init())
        .manage(HitRegions::default())
        .invoke_handler(tauri::generate_handler![
            set_hit_regions,
            set_tray_labels,
            resize_pet,
            open_settings,
            hide_pet,
            quit_app
        ])
        .setup(|app| {
            // A desktop pet lives in the menu bar, not the Dock.
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            let handle = app.handle().clone();
            build_tray(&handle)?;
            create_pet(&handle)?;
            watch_cursor(handle);
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Squeek Pet");

    app.run(|app, event| {
        // Closing the settings window must not quit the pet.
        if let RunEvent::ExitRequested { code: None, api, .. } = event {
            if app.get_webview_window(PET).is_some() {
                api.prevent_exit();
            }
        }
    });
}
