#!/bin/sh
# Installs Sei on a rooted TV over SSH: install.sh <TV IP> [all|service|home|remove]
set -e
HOST="${1:?usage: install.sh <TV IP> [all|service|home|remove]}"
WHAT="${2:-all}"
HERE=$(cd "$(dirname "$0")" && pwd)
REMOTE=/tmp/sei-install

# A release has everything beside this script; in the repository it is where the build puts it.
if [ -d "$HERE/app" ]; then
  APP=$HERE/app
  IPK=$HERE/service.ipk
else
  ROOT=$(cd "$HERE/../.." && pwd)
  APP=$ROOT/build/app
  IPK=$ROOT/dist/service.ipk
fi

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
cp "$HERE/tv.sh" "$STAGE/"
case "$WHAT" in
  all) cp -R "$APP" "$STAGE/app" && cp "$IPK" "$STAGE/service.ipk" ;;
  service) cp "$IPK" "$STAGE/service.ipk" ;;
  home) cp -R "$APP" "$STAGE/app" ;;
  remove) ;;
  *) echo "unknown: $WHAT" >&2 && exit 1 ;;
esac

COPYFILE_DISABLE=1 tar -C "$STAGE" -cf - . | ssh "root@$HOST" "rm -rf $REMOTE && mkdir -p $REMOTE && tar -xf - -C $REMOTE"
# luna-send does nothing without a TTY, and the tar stream above can't go through one.
ssh -tt "root@$HOST" "sh $REMOTE/tv.sh $WHAT; code=\$?; rm -rf $REMOTE; exit \$code"
