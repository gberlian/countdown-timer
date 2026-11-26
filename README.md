# countdown-timer

A one-page countdown timer. One HTML file, no build step, no dependencies at runtime.

Open `index.html`, or link to a target time:

```
index.html?to=2027-01-01T00:00
```

Without `?to=` it counts down to the next New Year. The date field under the clock changes the target and updates the link, so the link can be shared.

## Test

```
bun install
bun test/e2e.ts
```

The test opens the page in headless Chrome, checks that the remaining time matches the target, that it counts down, that it shows zero after the target, that it fits a 390 px screen, and saves screenshots to `test/shots/`. Set `CHROME` to point at another Chrome binary.
