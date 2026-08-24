# PsychProfile — Automatic Delivery Setup

The site is prepared to file completed examination records through **Formspree** while retaining the local Copy Record and Download Record fallbacks.

## One-time setup

1. Create or sign in to a Formspree account.
2. Create a new form for the PsychProfile submissions.
3. Confirm the form's target email / notification destination in Formspree.
4. Copy the public form endpoint. It will look like:

   `https://formspree.io/f/xxxxxxxx`

5. Open `config.js` in this repository and set:

   ```js
   formEndpoint: 'https://formspree.io/f/xxxxxxxx'
   ```

6. Commit the change and allow GitHub Pages to deploy it.
7. Run one dummy examination all the way through and verify the submission arrives.

## What the site sends

When automatic delivery is configured and the player reaches the final review sheet, the browser sends one HTTPS POST containing:

- subject name or initials, if supplied;
- C.L.L.A. file number;
- completion timestamp;
- source page URL;
- the complete human-readable Markdown examination record in the `message` field;
- an empty Formspree `_gotcha` honeypot field.

The notification subject is generated as:

`PsychProfile P-##### — Subject`

## Player disclosure

When a valid Formspree endpoint is configured, the opening sheet displays a short notice that completing the examination sends the record to the examiner for private review. The final sheet reports whether filing succeeded.

## Failure behavior

If automatic filing fails:

- the player's answers remain in the page;
- a Retry Filing button appears;
- Copy Record and Download Record remain available;
- rate-limit and ordinary service errors are surfaced in the final-sheet status line.

A successful submission is not automatically repeated while the player moves backward and forward through the completed examination. Restarting the examination resets the submission state for a new record.

## Security rule

The Formspree **form endpoint is public configuration** and is safe to place in the static site. Do **not** put Formspree API keys, email passwords, GitHub tokens, or other credentials in `config.js` or any client-side repository file.
