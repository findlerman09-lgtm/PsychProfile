(() => {
  'use strict';

  const book = document.getElementById('survey-book');
  const fileNumber = document.getElementById('file-number');
  const subjectLine = document.querySelector('.subject-line');
  const completionSection = book?.querySelector('[data-page="14"]');
  const completionSheet = completionSection?.querySelector('.completion-sheet');
  const introSheet = book?.querySelector('[data-page="0"] .sheet-front');
  const restartButton = document.getElementById('restart-button');
  const config = window.PSYCHPROFILE_CONFIG || {};

  if (!book || !completionSheet) return;

  const configuredEndpoint = String(config.formEndpoint || '').trim();
  const deliveryConfigured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+\/?$/.test(configuredEndpoint);

  let autoSubmissionAttempted = false;
  let submissionInFlight = false;
  let submissionSucceeded = false;
  let completionTimer = null;

  /* Keep identification inside the existing case-file furniture rather than
     adding a new survey question. It is optional; the file number remains a
     usable fallback identifier. */
  let subjectInput = document.getElementById('subject-name');
  if (!subjectInput && subjectLine) {
    subjectLine.textContent = '';
    subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.id = 'subject-name';
    subjectInput.name = 'subject_name';
    subjectInput.className = 'subject-input';
    subjectInput.maxLength = 80;
    subjectInput.autocomplete = 'name';
    subjectInput.placeholder = 'name or initials';
    subjectInput.setAttribute('aria-label', 'Subject name or initials');
    subjectLine.appendChild(subjectInput);
  }

  /* When automatic delivery is configured, disclose it before the examination
     begins. Keep the wording plain and consistent with the file-room fiction. */
  if (deliveryConfigured && introSheet && !document.getElementById('delivery-notice')) {
    const notice = document.createElement('p');
    notice.id = 'delivery-notice';
    notice.className = 'delivery-notice';
    notice.textContent = 'Completing the examination sends this record to the examiner for private review. A local copy remains available on the final sheet.';

    const acknowledgement = introSheet.querySelector('.acknowledgement');
    introSheet.insertBefore(notice, acknowledgement || null);
  }

  let exportPanel = document.getElementById('export-panel');
  if (!exportPanel) {
    exportPanel = document.createElement('div');
    exportPanel.id = 'export-panel';
    exportPanel.className = 'export-panel';
    exportPanel.innerHTML = `
      <p class="export-note">${deliveryConfigured
        ? 'This examination record is filed automatically for private review. Local copies remain available below.'
        : 'Prepare a copy of this examination record for review.'}</p>
      <div class="export-actions">
        <button class="secondary" type="button" id="copy-record-button">Copy Record</button>
        <button class="secondary" type="button" id="download-record-button">Download Record</button>
        <button class="primary" type="button" id="send-record-button" ${deliveryConfigured ? '' : 'hidden'}>File Record</button>
      </div>
      <p class="export-status" id="export-status" aria-live="polite"></p>`;

    const existingActions = completionSheet.querySelector('.sheet-actions');
    completionSheet.insertBefore(exportPanel, existingActions || null);
  }

  const copyButton = document.getElementById('copy-record-button');
  const downloadButton = document.getElementById('download-record-button');
  const sendButton = document.getElementById('send-record-button');
  const exportStatus = document.getElementById('export-status');

  if (!copyButton || !downloadButton) return;

  function cleanText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
  }

  function selectedLabelText(input) {
    const label = input.closest('label');
    if (!label) return input.value || '';

    const clone = label.cloneNode(true);
    clone.querySelectorAll('input, textarea, button').forEach(control => control.remove());
    return cleanText(clone.textContent);
  }

  function selectedAnswer(input) {
    let text = selectedLabelText(input);
    const targetId = input.dataset.otherTarget;

    if (targetId) {
      const target = document.getElementById(targetId);
      const written = target ? cleanText(target.value) : '';
      if (written) text = text ? `${text}: ${written}` : written;
    }

    return text || cleanText(input.value);
  }

  function questionRecord(sheet) {
    const page = Number(sheet.dataset.page || 0);
    if (page < 1 || page > 13) return null;

    const inquiry = cleanText(sheet.querySelector('.question-number')?.textContent) || `Inquiry ${page}`;
    const title = cleanText(sheet.querySelector('h2')?.textContent);
    const checked = Array.from(sheet.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked'));
    const answers = checked.map(selectedAnswer).filter(Boolean);

    if (page === 13) {
      const love = cleanText(document.getElementById('q13-love')?.value);
      const avoid = cleanText(document.getElementById('q13-avoid')?.value);
      return {
        inquiry,
        title,
        lines: [
          `I would love it if these answers somehow turned into: ${love || '(no answer)'}`,
          `I definitely do not want these answers turned into: ${avoid || '(no answer)'}`
        ]
      };
    }

    return {
      inquiry,
      title,
      lines: answers.length ? answers : ['(no recorded answer)']
    };
  }

  function subjectName() {
    return cleanText(subjectInput?.value) || 'Unspecified';
  }

  function fileId() {
    const number = cleanText(fileNumber?.textContent) || 'UNNUMBERED';
    return number.startsWith('P-') ? number : `P-${number}`;
  }

  function buildRecord(completedAt = new Date().toISOString()) {
    const subject = subjectName();
    const file = fileId();

    const sections = Array.from(book.querySelectorAll('.sheet'))
      .map(questionRecord)
      .filter(Boolean);

    const lines = [
      '# C.L.L.A. Preliminary Personal Examination',
      '',
      `**File:** ${file}`,
      `**Subject:** ${subject}`,
      `**Completed:** ${completedAt}`,
      '',
      '> Player preference record. Final free-response statements should override inferred patterns when they conflict.',
      ''
    ];

    sections.forEach(section => {
      lines.push(`## ${section.inquiry} — ${section.title}`);
      lines.push('');
      section.lines.forEach(answer => lines.push(`- ${answer}`));
      lines.push('');
    });

    return lines.join('\n').trim() + '\n';
  }

  function recordFilename() {
    const subject = cleanText(subjectInput?.value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const file = cleanText(fileNumber?.textContent).replace(/[^0-9a-z-]/gi, '');
    const stem = subject || (file ? `p-${file}` : 'clla-examination');
    return `${stem}-psychprofile.md`;
  }

  function setStatus(message, state = '') {
    if (!exportStatus) return;
    exportStatus.textContent = message;
    if (state) {
      exportStatus.dataset.state = state;
    } else {
      delete exportStatus.dataset.state;
    }
  }

  async function copyRecord() {
    const record = buildRecord();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(record);
      } else {
        const helper = document.createElement('textarea');
        helper.value = record;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
      }
      setStatus('Record copied.', 'success');
    } catch (error) {
      console.error(error);
      setStatus('Copy failed. Use Download Record instead.', 'error');
    }
  }

  function downloadRecord() {
    const record = buildRecord();
    const blob = new Blob([record], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = recordFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Record downloaded.', 'success');
  }

  function formspreeErrorMessage(response, data) {
    if (response.status === 429) {
      return 'The filing service is receiving too many submissions. Please wait a moment, then use File Record again or save a local copy.';
    }

    const errors = Array.isArray(data?.errors)
      ? data.errors.map(error => cleanText(error?.message || error)).filter(Boolean)
      : [];

    if (errors.length) return `Automatic filing failed: ${errors.join(' ')}`;
    return 'Automatic filing failed. Your answers remain on this page; please retry or save a local copy.';
  }

  async function sendRecord({ automatic = false } = {}) {
    if (!deliveryConfigured) {
      setStatus('Automatic filing is not configured. Use Copy Record or Download Record.', 'error');
      return false;
    }

    if (submissionInFlight || submissionSucceeded) return submissionSucceeded;

    submissionInFlight = true;
    if (automatic) autoSubmissionAttempted = true;

    if (sendButton) {
      sendButton.hidden = false;
      sendButton.disabled = true;
      sendButton.textContent = 'Filing…';
    }
    setStatus('Filing record for private review…');

    const completedAt = new Date().toISOString();
    const subject = subjectName();
    const file = fileId();
    const record = buildRecord(completedAt);

    const payload = {
      name: subject,
      subject: `PsychProfile ${file} — ${subject}`,
      file_number: file,
      completed_at: completedAt,
      record_format: 'Markdown',
      source_page: window.location.href,
      message: record,
      _gotcha: ''
    };

    try {
      const response = await fetch(configuredEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      if (!response.ok) {
        throw Object.assign(new Error(formspreeErrorMessage(response, data)), { response, data });
      }

      submissionSucceeded = true;
      setStatus('Record filed for private review.', 'success');
      if (sendButton) {
        sendButton.hidden = false;
        sendButton.disabled = true;
        sendButton.textContent = 'Record Filed';
      }
      return true;
    } catch (error) {
      console.error(error);
      const message = error?.message || 'Automatic filing failed. Please retry or save a local copy.';
      setStatus(message, 'error');
      if (sendButton) {
        sendButton.hidden = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Retry Filing';
      }
      return false;
    } finally {
      submissionInFlight = false;
    }
  }

  function scheduleAutomaticSubmission() {
    if (!deliveryConfigured || autoSubmissionAttempted || submissionSucceeded || submissionInFlight) return;
    if (!completionSection?.classList.contains('current')) return;

    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(() => {
      sendRecord({ automatic: true });
    }, 450);
  }

  copyButton.addEventListener('click', copyRecord);
  downloadButton.addEventListener('click', downloadRecord);
  if (sendButton) {
    sendButton.addEventListener('click', () => sendRecord({ automatic: false }));
  }

  if (deliveryConfigured && completionSection) {
    const observer = new MutationObserver(scheduleAutomaticSubmission);
    observer.observe(completionSection, { attributes: true, attributeFilter: ['class'] });
    scheduleAutomaticSubmission();
  }

  if (restartButton) {
    restartButton.addEventListener('click', () => {
      if (subjectInput) subjectInput.value = '';
      window.clearTimeout(completionTimer);
      autoSubmissionAttempted = false;
      submissionInFlight = false;
      submissionSucceeded = false;
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'File Record';
        sendButton.hidden = !deliveryConfigured;
      }
      setStatus('');
    });
  }

  /* Expose only the read-only helpers future delivery adapters may need. */
  window.PsychProfileExport = Object.freeze({
    buildRecord,
    recordFilename
  });
})();
