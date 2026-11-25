# Sei

[![Check](https://github.com/glexe/sei/actions/workflows/check.yml/badge.svg)](https://github.com/glexe/sei/actions/workflows/check.yml)

**Your TV, without the noise.**

![Sei home screen on an LG OLED C3](docs/home.jpg)

An ad-free home screen for rooted LG webOS TVs.

| | |
| --- | --- |
| ![All apps](docs/apps.jpg) | ![Files with a watched video and a resume bar](docs/files.jpg) |
| ![Player with the audio track menu](docs/player.jpg) | ![Wallpaper settings](docs/wallpapers.jpg) |

## Features

- Every app on the TV in one grid, with a dock row. Hold OK to move or delete an app.
- HDMI inputs show the logo of the connected device.
- Files: browse USB storage, play video in a built-in player with resume, watched marks and track selection.
- Wallpapers: photos, colors and gradients. Weather, date and time.
- 26 languages, following the TV by default.
- No background processes. No ads.

## Requirements

- A rooted TV with [Homebrew Channel](https://github.com/webosbrew/webos-homebrew-channel) 0.8.0 or newer.
- webOS 25 or newer. Tested on one TV, an LG OLED C3 with webOS 11.2 (platform version).

Use at your own risk. Firmware updates can remove root, so keep automatic updates off; if LG Home comes back after one,
install Sei again. Don't combine it with other home replacements, such as Home Chooser or Luma's takeover.

## Install

With the remote:

1. In Homebrew Channel, open Settings, choose **Add repository** and enter
   `https://github.com/glexe/sei/releases/latest/download/apps.json`.
2. Find **Sei** in the list and install it, then open it and choose **Install**.
3. Restart the TV, and set **Power On Screen** to **Home** in the TV settings.

Homebrew Channel also updates Sei and uninstalls it. After uninstalling, press Home: Sei offers to restart the TV, and
LG Home returns.

Or from macOS or Linux over SSH (`ssh root@<TV_IP>` has to work):

```bash
curl -L https://github.com/glexe/sei/releases/latest/download/sei.tar.gz | tar -xz
sh sei/install.sh <TV_IP>
```

To update, run it again. To remove: `sh sei/install.sh <TV_IP> remove`, then restart; the Sei app itself stays until you
uninstall it in Homebrew Channel.

## Development

```bash
npm install
npm run dev               # browser preview with mock data, http://localhost:5173
npm run check             # types, React Compiler coverage, tests, lint, format

export TV_HOST=<TV_IP>
npm run deploy            # build and install the home screen
npm run install:package   # after service changes; needs npm install -g @webos-tools/cli
npm run release           # dist/: the package, its Homebrew Channel files, the SSH installer
```

The layout is a fixed 1920×1080. In the browser, use the DevTools device toolbar at that size with **Fit to window**.

Code rules: [AGENTS.md](AGENTS.md).

## How it works

The app installs as `com.webos.app.home` version 99 in `/media/system/apps`, the directory LG uses for system app
updates. The app manager runs the highest version of an id, so Sei becomes Home: on boot, power-on, the Home key and
when an app closes. Nothing is patched.

It travels in the package `com.glexe.sei`, which is the same web app: opened as an app, it shows the setup screen that
installs it as Home. Homebrew Channel only replaces the package; Sei notices a newer one, copies it over itself and
reloads.

A small Node service (`service/`, root) does what a web app can't: list, launch and uninstall apps, cache their icons
and read USB storage. It answers only Sei and its setup screen, and starts on demand. Log: `/tmp/sei-service.log`.

The player is a `<video>` element with LG's own USB media options, so the system decodes MKV and HEVC in hardware.

## Remote

| Key | Action |
| --- | --- |
| Arrows | Move focus |
| OK | Open |
| Hold OK | Move or Delete |
| Back | Up one level, or to the top row |

Home is handled by the system and can't close Files or Settings while Sei is in front. Use Back.

## Notes

- LG Channels is kept out of memory by disabling its preload in `/var/preferences/webos-preload-manager-conf.json`
  (`"com.webos.app.lgchannels": false`), applied with `systemctl restart preload-manager.service`.
- `npm run wallpapers -- <folder>` rebuilds the wallpapers and their credits from photos named
  `<name>_Author-<First-Last>_unsplash.jpg` (macOS).
- `npm run icon` redraws the app icon in every size from `scripts/icon/Sei.icon`, an Icon Composer file (macOS, Xcode).
- Settings and app order are stored in `/var/lib/sei/state.json` on the TV; playback history in `.sei/history.json`
  on each drive, so it travels with the files. Uninstalling an app can wipe webOS's `localStorage`, which Sei only uses
  as a cache.

## Layout

```
app/src/
  components/   screens and widgets
  primitives/   generic UI: lists, switch, menu, dialog
  hooks/        shared hooks
  lib/          logic and platform access, with tests
  icons/        Phosphor icons as JSX
service/        root Node service
tv/host/        appinfo of the package
scripts/        installer, release, wallpaper sync, icon, compiler check, lint rule
docs/           screenshots
```

## Translations

English is the original; the other 25 languages are machine translations no native speaker has reviewed. Corrections are
welcome: each language is one file in [`app/src/lib/i18n/locales`](app/src/lib/i18n/locales).

## License

[MIT](LICENSE), except the wallpapers: photos from Unsplash, see
[CREDITS](app/src/assets/wallpapers/CREDITS.md). Weather data by [Open-Meteo](https://open-meteo.com) (CC BY 4.0).

Sei is not affiliated with LG Electronics or Apple. App names and logos belong to their owners.
