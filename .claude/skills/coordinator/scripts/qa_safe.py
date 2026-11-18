"""Guarded adb actions: every action first checks that the app under test is the
focused window, and aborts the whole run (exit 3) if it is not — so automation
never types into another app on a real person's phone. Usage:
  QA_PACKAGE=com.example.app python qa_safe.py <serial> <outdir> step [step ...]
steps: tap:TEXT  xy:X,Y  hold:X,Y,MS  swipe:X1,Y1,X2,Y2,MS  back  wait:SEC  shot:NAME  list  expect:TEXT
"""
import os
import re
import subprocess
import sys
import time

PKG = os.environ.get("QA_PACKAGE") or sys.exit("set QA_PACKAGE to the app id under test")
serial, outdir, steps = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(outdir, exist_ok=True)


def adb(*args, capture=True):
    return subprocess.run(["adb", "-s", serial, *args], capture_output=capture)


def focused():
    out = adb("shell", "dumpsys", "window").stdout.decode("utf-8", "replace")
    m = re.search(r"mCurrentFocus=Window\{[^}]*\}", out)
    return m.group(0) if m else ""


def guard(step):
    f = focused()
    if PKG not in f:
        print(f"ABORT before '{step}': focus is not {PKG} -> {f}")
        sys.exit(3)


def nodes():
    # a dump taken while a video plays can fail (no idle state); remove the old
    # file first so a failed dump never returns a stale screen
    adb("shell", "rm", "-f", "/sdcard/ui.xml")
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    xml = adb("exec-out", "cat", "/sdcard/ui.xml").stdout.decode("utf-8", "replace")
    if not xml.strip():
        # uiautomator cannot dump while a video plays (no idle); the focus
        # guard already confirmed the app, so this is not another app
        print("NO UI DUMP (video playing?) — stopping")
        sys.exit(4)
    if f'package="{PKG}"' not in xml:
        print(f"ABORT: UI dump is not {PKG}")
        sys.exit(3)
    for n in re.findall(r"<node [^>]*?>", xml):
        tx = re.search(r' text="([^"]*)"', n)
        cd = re.search(r'content-desc="([^"]*)"', n)
        t = ((tx.group(1) if tx else "") + " | " + (cd.group(1) if cd else "")).strip(" |")
        b = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', n)
        if t and b:
            yield t, tuple(map(int, b.groups()))


for step in steps:
    kind, _, arg = step.partition(":")
    if kind == "wait":
        time.sleep(float(arg))
        continue
    guard(step)
    if kind == "tap":
        found = [(t, b) for t, b in nodes() if arg.lower() in t.lower()]
        if not found:
            print(f"NOT FOUND '{arg}' — stopping")
            sys.exit(2)
        t, (x1, y1, x2, y2) = found[0]
        adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
        print("tapped", t.replace("\n", " / ")[:80])
    elif kind == "holdtext":
        text, ms = arg.rsplit(",", 1)
        found = [(t, b) for t, b in nodes() if text.lower() in t.lower()]
        if not found:
            print(f"NOT FOUND '{text}' — stopping")
            sys.exit(2)
        t, (x1, y1, x2, y2) = found[0]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        adb("shell", "input", "swipe", str(cx), str(cy), str(cx + 1), str(cy), ms)
        print("held", t.replace("\n", " / ")[:60], ms, "ms")
    elif kind == "expect":
        found = [t for t, _ in nodes() if arg.lower() in t.lower()]
        print(("OK   " if found else "MISS ") + arg)
    elif kind == "xy":
        x, y = arg.split(",")
        adb("shell", "input", "tap", x, y)
    elif kind == "hold":
        x, y, ms = arg.split(",")
        adb("shell", "input", "swipe", x, y, str(int(x) + 1), y, ms)
    elif kind == "text":
        # types into the focused field (letters only, no spaces)
        adb("shell", "input", "text", arg)
    elif kind == "clearfield":
        # select all in the focused field, then delete (Android 13+ keycombination)
        adb("shell", "input keyevent 123; input keyevent " + " ".join(["67"] * 80))
    elif kind == "taphold":
        # tap at X,Y then long-press at X2,Y2 in one shell call (no gap)
        x, y, x2, y2, ms = arg.split(",")
        adb("shell", f"input tap {x} {y}; sleep 0.4; input swipe {x2} {y2} {int(x2) + 1} {y2} {ms}")
    elif kind == "swipe":
        adb("shell", "input", "swipe", *arg.split(","))
    elif kind == "back":
        adb("shell", "input", "keyevent", "4")
    elif kind == "shot":
        with open(os.path.join(outdir, arg + ".png"), "wb") as fh:
            fh.write(adb("exec-out", "screencap", "-p").stdout)
    elif kind == "list":
        for t, b in list(nodes())[:14]:
            print(b, t.replace("\n", " / ")[:110])
    time.sleep(0.8)
print("DONE")
