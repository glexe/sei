#!/bin/sh
# Runs on the TV, from the folder install.sh uploaded: tv.sh all|service|home|remove
set -e
cd "$(dirname "$0")"
HOME_DIR=/media/system/apps/usr/palm/applications/com.webos.app.home
ELEVATE=/media/developer/apps/usr/palm/services/org.webosbrew.hbchannel.service/elevate-service
SERVICE=com.glexe.sei.service
MIN_SDK=10

die() {
  echo "$1" >&2
  exit 1
}

check() {
  [ "$(id -u)" = 0 ] || die 'Not root on the TV.'
  [ -e "$ELEVATE" ] || die 'Homebrew Channel is not installed on the TV.'
  sdk=$(luna-send -n 1 luna://com.webos.service.tv.systemproperty/getSystemInfo '{"keys":["sdkVersion"]}' |
    sed -n 's/.*"sdkVersion": *"\([0-9]*\).*/\1/p')
  [ "${sdk:-0}" -ge "$MIN_SDK" ] || die "Sei needs webOS 25 (platform $MIN_SDK) or newer; this TV reports ${sdk:-nothing}."
}

install_service() {
  echo 'Installing the service'
  # The installer answers through a subscription that never ends by itself.
  { timeout 90 luna-send -i luna://com.webos.appInstallService/dev/install \
    "{\"id\":\"com.glexe.sei\",\"ipkUrl\":\"$PWD/service.ipk\",\"subscribe\":true}"; } 2>/dev/null |
    {
      while read -r line; do
        case $line in
          *'"installed"'*)
            pkill -f appInstallService/dev/install
            exit 0
            ;;
          *'"returnValue":false'* | *'failed'*)
            echo "$line" >&2
            pkill -f appInstallService/dev/install
            exit 1
            ;;
        esac
      done
      exit 1
    } || die 'The TV refused the service package.'
  [ -f "/media/developer/apps/usr/palm/services/$SERVICE/service.js" ] || die 'The service did not install.'
  "$ELEVATE" "$SERVICE" >/dev/null
  # A service that is already running would stay unprivileged.
  pkill -f "$SERVICE" || true
  echo 'Service installed.'
}

install_home() {
  echo 'Installing the home screen'
  first=
  cmp -s app/appinfo.json "$HOME_DIR/appinfo.json" || first=1
  mkdir -p "$HOME_DIR"
  # cache/ holds app icons copied by the service, so it survives reinstalls; an old setup left it as a symlink.
  find "$HOME_DIR" -mindepth 1 -maxdepth 1 ! -name cache -exec rm -rf {} +
  cp -R app/. "$HOME_DIR/"
  [ -L "$HOME_DIR/cache" ] && rm "$HOME_DIR/cache"
  mkdir -p "$HOME_DIR/cache"
  chown -R root:jailer "$HOME_DIR"
  chmod -R a+rX "$HOME_DIR"
  if [ "$first" ]; then
    echo 'Done. Reboot the TV to start Sei.'
    return
  fi
  # SAM relaunches Home by itself once WAM drops it.
  luna-send -n 1 -a com.webos.service.applicationmanager luna://com.palm.webappmanager/killApp \
    '{"appId":"com.webos.app.home","instanceId":""}' >/dev/null
  echo 'Done.'
}

case "$1" in
  all)
    check
    install_service
    install_home
    ;;
  service)
    check
    install_service
    ;;
  home)
    check
    install_home
    ;;
  remove)
    rm -rf "$HOME_DIR"
    echo 'Removed. Reboot the TV to get LG Home back.'
    ;;
esac
