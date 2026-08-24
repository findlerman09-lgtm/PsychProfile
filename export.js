(() => {
  'use strict';

  const book = document.getElementById('survey-book');
  const fileNumber = document.getElementById('file-number');
  const subjectInput = document.getElementById('subject-name');
  const copyButton = document.getElementById('copy-record-button');
  const downloadButton = document.getElementById('download-record-button');
  const exportStatus = document.getElementById('export-status');

  if (!book || !copyButton || !downloadButton) return;

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

  function buildRecord() {
    const subject = cleanText(subjectInput?.value) || 'Unspecified';
    const file = `P-${cleanText(fileNumber?.textContent) || 'UNNUMBERED'}`;
    const completed = new Date().toISOString();

    const sections = Array.from(book.querySelectorAll('.sheet'))
      .map(questionRecord)
      .filter(Boolean);

    const lines = [
      '# C.L.L.A. Preliminary Personal Examination',
      '',
      `**File:** ${file}`,
      `**Subject:** ${subject}`,
      `**Completed:** ${completed}`,
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

  function setStatus(message) {
    if (exportStatus) exportStatus.textContent = message;
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
      setStatus('Record copied.');
    } catch (error) {
      console.error(error);
      setStatus('Copy failed. Use Download Record instead.');
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
    setStatus('Record downloaded.');
  }

  copyButton.addEventListener('click', copyRecord);
  downloadButton.addEventListener('click', downloadRecord);
})();
