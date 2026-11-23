#!/bin/sh
# Installs build/app as the system Home app: SAM prefers the highest version of an app id across its app dirs.
set -e
HOST="${TV_HOST:?set TV_HOST to the TV IP}"
DIR=/media/system/apps/usr/palm/applications/com.webos.app.home
KILL='luna-send -n 1 -a com.webos.service.applicationmanager luna://com.palm.webappmanager/killApp "{\"appId\":\"com.webos.app.home\",\"instanceId\":\"\"}" >/dev/null'

case "$1" in
  install)
    test -f build/app/index.html || { echo 'run npm run build first' >&2; exit 1; }
    # cache/ holds app icons copied by the service, so it survives reinstalls; an old setup left it as a symlink.
    COPYFILE_DISABLE=1 tar -C build/app -cf - . | ssh "root@$HOST" "
      mkdir -p $DIR && cd $DIR &&
      find . -mindepth 1 -maxdepth 1 ! -name cache -exec rm -rf {} + &&
      tar -xf - && { [ -L cache ] && rm cache; mkdir -p cache; } && chown -R root:jailer . && chmod -R a+rX ."
    # luna-send does nothing without a TTY, and the tar stream above can't go through one.
    ssh -tt "root@$HOST" "$KILL" >/dev/null
    # SAM relaunches Home by itself once WAM drops it; appinfo.json changes need a reboot.
    echo 'Home updated'
    ;;
  remove)
    ssh "root@$HOST" "rm -rf $DIR"
    echo 'Removed; reboot the TV to get LG Home back'
    ;;
  *)
    echo 'usage: home.sh install|remove' >&2
    exit 1
    ;;
esac
