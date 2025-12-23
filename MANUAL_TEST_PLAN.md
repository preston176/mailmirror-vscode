# MailMirror Extension - Manual Test Plan

## Pre-Test Setup

### ✅ Checklist
- [ ] Cloudflared installed and in PATH (`cloudflared --version`)
- [ ] Extension built (`bun run build` in apps/extension)
- [ ] Example MJML file ready (`examples/welcome-email.mjml`)

---

## Test 1: Extension Activation

**Steps:**
1. Open this project in VS Code
2. Press `F5` to launch Extension Development Host
3. Wait for new VS Code window to open

**Expected Results:**
- ✅ New VS Code window opens with "[Extension Development Host]" in title
- ✅ No errors in Debug Console
- ✅ MailMirror icon appears in Activity Bar (left sidebar)

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 2: MailMirror Sidebar Panel

**Steps:**
1. Click the MailMirror icon in Activity Bar
2. Check the sidebar panel content

**Expected Results:**
- ✅ "Mobile Preview" panel shows
- ✅ Message: "No preview is currently running"
- ✅ Instructions visible with 3 steps

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 3: Command Palette - List Commands

**Steps:**
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type "MailMirror"

**Expected Results:**
- ✅ Three commands appear:
  - MailMirror: Start Mobile Preview
  - MailMirror: Stop Mobile Preview
  - MailMirror: Fix for Outlook

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 4: Start Mobile Preview - Happy Path

**Steps:**
1. Open `examples/welcome-email.mjml`
2. Run command: "MailMirror: Start Mobile Preview"
3. Wait 10-30 seconds for tunnel to start

**Expected Results:**
- ✅ Info message: "Mobile preview started!"
- ✅ Cloudflare tunnel starts in terminal
- ✅ Public URL appears (https://xxx.trycloudflare.com)
- ✅ Sidebar updates with:
  - ✅ Status badge: "⚡ Live"
  - ✅ QR code image
  - ✅ Public URL displayed
  - ✅ "Copy URL" button

**Actual Results:**
- [ ] Pass / [ ] Fail
- Public URL:
- Screenshot (sidebar):
- Screenshot (terminal):
- Notes:

---

## Test 5: QR Code Accessibility

**Steps:**
1. With preview running, scan QR code with phone
2. Visit the public URL in phone browser

**Expected Results:**
- ✅ QR code scans successfully
- ✅ URL opens on phone
- ✅ Email renders correctly on phone
- ✅ No "No email template loaded" message

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot (phone):
- Notes:

---

## Test 6: Hot Reload - Edit and Save

**Steps:**
1. With preview running and phone viewing email
2. Edit `examples/welcome-email.mjml`:
   - Change "Welcome to MailMirror! 👋" to "Testing Hot Reload! 🔥"
3. Save file (Cmd/Ctrl + S)
4. Watch phone browser

**Expected Results:**
- ✅ Phone browser auto-reloads (2-5 seconds)
- ✅ New text appears: "Testing Hot Reload! 🔥"
- ✅ No errors in Debug Console

**Actual Results:**
- [ ] Pass / [ ] Fail
- Time to reload:
- Screenshot (phone - before):
- Screenshot (phone - after):
- Notes:

---

## Test 7: Stop Mobile Preview

**Steps:**
1. Run command: "MailMirror: Stop Mobile Preview"
2. Check sidebar and terminal

**Expected Results:**
- ✅ Info message: "Preview stopped"
- ✅ Sidebar reverts to "No preview is currently running"
- ✅ Cloudflared process terminates
- ✅ Public URL becomes inaccessible

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 8: Start Preview - No File Open

**Steps:**
1. Close all editor tabs
2. Run command: "MailMirror: Start Mobile Preview"

**Expected Results:**
- ✅ Error message: "No active editor found"
- ✅ Preview does NOT start
- ✅ Sidebar stays empty

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 9: Start Preview - Already Running

**Steps:**
1. Open `examples/welcome-email.mjml`
2. Start preview (first time)
3. Try to start preview again (second time)

**Expected Results:**
- ✅ Info message: "Preview server is already running"
- ✅ No duplicate tunnels created

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 10: Fix for Outlook - With Selection

**Steps:**
1. Open `examples/welcome-email.mjml`
2. Select these lines (around line 70):
   ```
   <mj-button background-color="#0078D4" color="#ffffff" href="https://github.com/preston176/mailmirror-vscode" font-size="16px">
     Get Started
   </mj-button>
   ```
3. Run command: "MailMirror: Fix for Outlook"

**Expected Results:**
- ✅ Info message: "Code fixed for Outlook compatibility!"
- ✅ Selected code is replaced with VML comments/fallbacks
- ✅ Transformation visible in editor

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot (before):
- Screenshot (after):
- Notes:

---

## Test 11: Fix for Outlook - No Selection

**Steps:**
1. Open any file
2. Place cursor without selecting text
3. Run command: "MailMirror: Fix for Outlook"

**Expected Results:**
- ✅ Warning message: "Please select HTML code to fix for Outlook"

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 12: Fix for Outlook - No File Open

**Steps:**
1. Close all editor tabs
2. Run command: "MailMirror: Fix for Outlook"

**Expected Results:**
- ✅ Error message: "No active editor found"

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 13: Invalid MJML Syntax

**Steps:**
1. Open `examples/welcome-email.mjml`
2. Break the MJML by removing closing tag:
   - Find `</mj-button>` and delete it
3. Save file
4. Start preview

**Expected Results:**
- ✅ Preview starts (doesn't crash)
- ✅ Warning message about compilation errors
- ✅ Email still renders (with errors)

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot (error message):
- Screenshot (rendered output):
- Notes:

---

## Test 14: Port Conflict (Advanced)

**Steps:**
1. Start preview (uses port 3000)
2. In another terminal, run: `python3 -m http.server 3000`
3. Try to start preview again

**Expected Results:**
- ✅ Error message about port conflict
- OR
- ✅ Extension auto-selects different port

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

---

## Test 15: Cloudflared Not Installed (Destructive - Do Last!)

**Steps:**
1. Temporarily rename cloudflared:
   ```bash
   sudo mv /opt/homebrew/bin/cloudflared /opt/homebrew/bin/cloudflared.bak
   ```
2. Start preview

**Expected Results:**
- ✅ Error message about cloudflared not installed
- ✅ Installation instructions displayed
- ✅ Link to installation guide

**Actual Results:**
- [ ] Pass / [ ] Fail
- Screenshot:
- Notes:

**RESTORE:**
```bash
sudo mv /opt/homebrew/bin/cloudflared.bak /opt/homebrew/bin/cloudflared
```

---

## Summary

### Pass Rate: __ / 15 tests

### Critical Issues Found:
1.
2.
3.

### Minor Issues Found:
1.
2.
3.

### Notes:
