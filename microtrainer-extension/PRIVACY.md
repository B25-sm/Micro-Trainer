# MicroTrainer Extension Privacy Notes

MicroTrainer uses a content script on web pages so it can show the floating
button and side panel while a student is browsing documentation, coding sites,
or learning material.

## Permissions Used

- `activeTab`: lets the popup send a message to the current tab to open or
  navigate the side panel after the student clicks a button.
- `storage`: stores the student's own MicroTrainer frontend URL so the extension
  loads their self-hosted app instead of a shared server.
- `content_scripts.matches: <all_urls>`: injects only the MicroTrainer floating
  button and iframe shell. This is needed so students can open the side panel on
  any learning website.

## Data Handling

- The extension does not read page content by default.
- The extension does not collect browsing history.
- The extension does not send host-page data to MicroTrainer automatically.
- Student learning data stays inside the connected MicroTrainer app/backend and
  official progress sync only sends progress summaries required for trainer
  verification.

## Student-Specific App URL

Each student connects the extension to their own deployed frontend URL, for
example:

```text
https://student-microtrainer-frontend.onrender.com
```

That URL is stored in Chrome extension storage and is used for both the side
panel and the fullscreen app button.
