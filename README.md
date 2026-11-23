# Sei

[![Check](https://github.com/glexe/sei/actions/workflows/check.yml/badge.svg)](https://github.com/glexe/sei/actions/workflows/check.yml)

**Your TV, without the noise.**

![Sei home screen on an LG OLED C3](docs/home.jpg)

An ad-free home screen for rooted LG webOS TVs. Tested on LG OLED C3, webOS 11.2.

Requires root and [Homebrew Channel](https://github.com/webosbrew/webos-homebrew-channel) with SSH. Use at your own risk.

## Features

- Every app on the TV in one grid, with a dock row. Hold OK to move or delete an app.
- Files: browse USB storage, play video in a built-in player with resume, watched marks and track selection.
- Wallpapers, weather, date and time, preferred audio and subtitle languages.
- 26 languages, following the TV by default.
- No background processes. No ads.

## Setup

```bash
npm install -g @webos-tools/cli
ssh-copy-id root@<TV_IP>
ares-setup-device -a tv -i "host=<TV_IP>" -i "port=22" -i "username=root" -i "privatekey=id_ed25519" -i "default=true"

npm install
export TV_HOST=<TV_IP>
npm run install:service   # once, and after service changes
npm run deploy            # build and install as Home
```

Set **Power On Screen** to **Home** in the TV settings.

To remove: `npm run remove:home`, then reboot. LG Home returns.

## Development

```bash
npm run dev       # browser preview with mock data, http://localhost:5173
npm run test      # unit tests
npm run check     # types, React Compiler coverage, tests, lint, format
```

The layout is a fixed 1920×1080. In the browser, use the DevTools device toolbar at that size with **Fit to window**.

Code rules: [AGENTS.md](AGENTS.md).

## How it works

The app installs as `com.webos.app.home` version 99 in `/media/system/apps`, the directory LG uses for system app
updates. The app manager runs the highest version of an id, so Sei becomes Home: on boot, power-on, the Home key and
when an app closes. Nothing is patched.

A small Node service (`service/`, root) does what a web app can't: list, launch and uninstall apps, cache their icons
and read USB storage. It answers only Sei and starts on demand. Log: `/tmp/sei-service.log`.

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
- `npm run icon` redraws the app icon in every size from `scripts/icon/icon.swift` (macOS).
- Settings and app order are stored in `/var/lib/sei/state.json` on the TV; playback history in `.sei/history.json`
  on each drive, so it travels with the files. Uninstalling apps wipes webOS's `localStorage`, which Sei only uses
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
tv/host/        stub package that carries the service
scripts/        Home installer, wallpaper sync, icon, compiler check, lint rule
docs/           screenshots
```

## License

[MIT](LICENSE), except the wallpapers: photos from Unsplash, see
[CREDITS](app/src/assets/wallpapers/CREDITS.md). Weather data by [Open-Meteo](https://open-meteo.com) (CC BY 4.0).

Sei is not affiliated with LG Electronics or Apple. App names and logos belong to their owners.
