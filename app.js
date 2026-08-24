(() => {
  'use strict';

  const book = document.getElementById('survey-book');
  const sheets = Array.from(book.querySelectorAll('.sheet'));
  const acknowledge = document.getElementById('acknowledge');
  const beginButton = document.getElementById('begin-button');
  const restartButton = document.getElementById('restart-button');
  const progressLabel = document.getElementById('progress-label');
  const statusLabel = document.getElementById('status-label');
  const fileNumber = document.getElementById('file-number');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const STRIP_COUNT = 12;
  const TURN_DURATION = 1280;
  const PARK_ANGLE = 138;
  const completionPage = sheets.length - 1;

  let currentPage = 0;
  let animating = false;
  let parkedOverlay = null;

  function toRoman(number) {
    const values = [
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let remaining = number;
    let result = '';
    values.forEach(([value, symbol]) => {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
      }
    });
    return result;
  }

  function makeFileNumber() {
    const n = Math.floor(10000 + Math.random() * 89999);
    fileNumber.textContent = String(n);
  }

  function updateChrome() {
    if (currentPage === 0) {
      statusLabel.textContent = 'UNASSESSED';
      progressLabel.textContent = `Sheet I of ${toRoman(completionPage)}`;
    } else if (currentPage < completionPage) {
      statusLabel.textContent = 'IN EXAMINATION';
      progressLabel.textContent = `Sheet ${toRoman(currentPage + 1)} of ${toRoman(completionPage)}`;
    } else {
      statusLabel.textContent = 'REVIEW PENDING';
      progressLabel.textContent = 'Review Copy';
    }
  }

  function focusSheet(index) {
    const heading = sheets[index].querySelector('h2');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function setAriaState() {
    sheets.forEach((sheet, index) => {
      const isCurrent = index === currentPage;
      sheet.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
      sheet.querySelectorAll('input, button, textarea, select').forEach(control => {
        if (isCurrent) {
          control.removeAttribute('tabindex');
        } else {
          control.setAttribute('tabindex', '-1');
        }
      });
    });
  }

  function settleSheets() {
    sheets.forEach((sheet, index) => {
      sheet.classList.remove(
        'turned', 'returning', 'parked', 'turning-forward', 'turning-back',
        'current', 'next', 'stored'
      );

      if (index < currentPage) {
        sheet.classList.add('stored');
      } else if (index === currentPage) {
        sheet.classList.add('current');
      } else {
        sheet.classList.add('next');
      }
    });
  }

  function syncControlAppearance(original, clone) {
    const sourceControls = original.querySelectorAll('input, textarea, select');
    const cloneControls = clone.querySelectorAll('input, textarea, select');

    sourceControls.forEach((sourceControl, index) => {
      const cloneControl = cloneControls[index];
      if (!cloneControl) return;

      if ('checked' in sourceControl) cloneControl.checked = sourceControl.checked;
      if ('value' in sourceControl) cloneControl.value = sourceControl.value;
    });
  }

  function removeDuplicateIds(root) {
    if (root.id) root.removeAttribute('id');
    root.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    root.querySelectorAll('[for]').forEach(node => node.removeAttribute('for'));
  }

  function createFlipOverlay(sourceSheet) {
    const sourceFace = sourceSheet.querySelector('.sheet-front');
    const pageHeight = book.offsetHeight;
    const sliceHeight = pageHeight / STRIP_COUNT;

    const overlay = document.createElement('div');
    overlay.className = 'flip-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.height = `${pageHeight}px`;
    overlay.dataset.sourcePage = sourceSheet.dataset.page || '';

    const strips = [];

    for (let i = 0; i < STRIP_COUNT; i += 1) {
      const strip = document.createElement('div');
      strip.className = 'flip-strip';
      strip.style.setProperty('--slice-height', `${sliceHeight + 1.5}px`);
      strip.style.setProperty('--slice-top', `${i * sliceHeight}px`);
      strip.style.setProperty('--page-height', `${pageHeight}px`);

      const front = document.createElement('div');
      front.className = 'flip-strip-face flip-strip-front';

      const clonedFace = sourceFace.cloneNode(true);
      clonedFace.classList.add('flip-full-face');
      removeDuplicateIds(clonedFace);
      syncControlAppearance(sourceFace, clonedFace);
      front.appendChild(clonedFace);

      const back = document.createElement('div');
      back.className = 'flip-strip-face flip-strip-back';

      strip.append(front, back);
      overlay.appendChild(strip);
      strips.push(strip);
    }

    overlay._strips = strips;
    overlay._sliceHeight = sliceHeight;
    book.appendChild(overlay);
    return overlay;
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function renderFlip(overlay, progress) {
    const p = Math.max(0, Math.min(1, progress));
    const eased = easeInOutCubic(p);
    const baseAngle = PARK_ANGLE * eased;

    const movingCurl = Math.sin(Math.PI * p) * 42;
    const parkedCurl = eased * 13;
    const curlAmount = movingCurl + parkedCurl;

    let y = 0;
    let z = 0;

    overlay._strips.forEach((strip, index) => {
      const t = index / Math.max(1, STRIP_COUNT - 1);
      const flexiblePart = Math.max(0, (t - 0.30) / 0.70);
      const bend = curlAmount * Math.pow(flexiblePart, 1.45);
      const angle = baseAngle + bend;

      strip.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${angle.toFixed(2)}deg)`;

      const radians = angle * Math.PI / 180;
      y += overlay._sliceHeight * Math.cos(radians);
      z += overlay._sliceHeight * Math.sin(radians);
    });

    overlay.classList.toggle('parked', p > 0.995);
  }

  function animateFlip(overlay, from, to, onComplete) {
    if (reduceMotion.matches) {
      renderFlip(overlay, to);
      requestAnimationFrame(onComplete);
      return;
    }

    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const local = Math.min(1, elapsed / TURN_DURATION);
      const progress = from + (to - from) * local;
      renderFlip(overlay, progress);

      if (local < 1) {
        requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    }

    requestAnimationFrame(frame);
  }

  function removeParkedOverlay() {
    if (!parkedOverlay) return;
    parkedOverlay.remove();
    parkedOverlay = null;
  }

  function createStaticPreviousPage() {
    removeParkedOverlay();
    if (currentPage <= 0) return;

    parkedOverlay = createFlipOverlay(sheets[currentPage - 1]);
    renderFlip(parkedOverlay, 1);
  }

  function turnForward() {
    if (animating || currentPage >= sheets.length - 1) return;

    const leaving = sheets[currentPage];
    animating = true;

    removeParkedOverlay();
    const overlay = createFlipOverlay(leaving);
    renderFlip(overlay, 0);

    currentPage += 1;
    settleSheets();
    setAriaState();
    updateChrome();

    animateFlip(overlay, 0, 1, () => {
      parkedOverlay = overlay;
      renderFlip(parkedOverlay, 1);
      focusSheet(currentPage);
      animating = false;
    });
  }

  function turnBackward() {
    if (animating || currentPage <= 0) return;

    animating = true;

    let overlay = parkedOverlay;
    if (!overlay) {
      overlay = createFlipOverlay(sheets[currentPage - 1]);
      renderFlip(overlay, 1);
    }
    parkedOverlay = null;

    animateFlip(overlay, 1, 0, () => {
      overlay.remove();
      currentPage -= 1;
      settleSheets();
      setAriaState();
      updateChrome();
      createStaticPreviousPage();
      focusSheet(currentPage);
      animating = false;
    });
  }

  function validationMessage(sheet) {
    return sheet.querySelector('.validation');
  }

  function failValidation(sheet, message) {
    const output = validationMessage(sheet);
    if (output) output.textContent = message;
    return false;
  }

  function clearValidation(sheet) {
    const output = validationMessage(sheet);
    if (output) output.textContent = '';
  }

  function validateWriteIns(sheet) {
    const selectedTriggers = Array.from(sheet.querySelectorAll('[data-other-target]:checked'));
    for (const trigger of selectedTriggers) {
      const target = document.getElementById(trigger.dataset.otherTarget);
      if (target && !target.value.trim()) {
        target.focus({ preventScroll: true });
        return failValidation(sheet, 'Please complete the written response you selected.');
      }
    }
    return true;
  }

  function validateCurrentPage() {
    const sheet = sheets[currentPage];
    const type = sheet.dataset.validate || 'optional';
    clearValidation(sheet);

    if (type === 'optional' || type === 'completion') return true;

    if (type === 'checkbox') {
      const count = sheet.querySelectorAll('input[type="checkbox"]:checked').length;
      const min = Number(sheet.dataset.min || 1);
      const max = Number(sheet.dataset.max || min);

      if (min === max && count !== min) {
        return failValidation(sheet, `Please mark exactly ${min} response${min === 1 ? '' : 's'} before turning the sheet.`);
      }
      if (count < min || count > max) {
        return failValidation(sheet, `Please mark ${min === 1 ? 'at least one' : `at least ${min}`} and no more than ${max} responses before turning the sheet.`);
      }
    }

    if (type === 'radio') {
      if (!sheet.querySelector('input[type="radio"]:checked')) {
        return failValidation(sheet, 'Please mark one response before turning the sheet.');
      }
    }

    if (type === 'radio-count') {
      const count = sheet.querySelectorAll('input[type="radio"]:checked').length;
      const required = Number(sheet.dataset.min || 1);
      if (count !== required) {
        return failValidation(sheet, 'Please mark one response in each pair before turning the sheet.');
      }
    }

    return validateWriteIns(sheet);
  }

  function syncConditionalInputs() {
    document.querySelectorAll('[data-other-target]').forEach(trigger => {
      const target = document.getElementById(trigger.dataset.otherTarget);
      if (!target) return;
      target.disabled = !trigger.checked;
    });
  }

  document.querySelectorAll('fieldset[data-max]').forEach(fieldset => {
    const max = Number(fieldset.dataset.max || 1);
    const inputs = Array.from(fieldset.querySelectorAll('input[type="checkbox"]'));

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const checked = inputs.filter(item => item.checked);
        const sheet = fieldset.closest('.sheet');

        if (checked.length > max) {
          input.checked = false;
          syncConditionalInputs();
          failValidation(sheet, `Please choose no more than ${max} responses.`);
          return;
        }

        clearValidation(sheet);
        syncConditionalInputs();
      });
    });
  });

  document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      const sheet = input.closest('.sheet');
      clearValidation(sheet);
      syncConditionalInputs();
    });
  });

  document.querySelectorAll('.write-in, .long-form textarea').forEach(input => {
    input.addEventListener('input', () => {
      const sheet = input.closest('.sheet');
      clearValidation(sheet);
    });
  });

  acknowledge.addEventListener('change', () => {
    beginButton.disabled = !acknowledge.checked;
  });

  beginButton.addEventListener('click', turnForward);

  document.querySelectorAll('.next-button').forEach(button => {
    button.addEventListener('click', () => {
      if (validateCurrentPage()) turnForward();
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', turnBackward);
  });

  restartButton.addEventListener('click', () => {
    if (animating) return;

    removeParkedOverlay();
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
      input.checked = false;
    });
    document.querySelectorAll('.write-in, .long-form textarea').forEach(input => {
      input.value = '';
    });
    acknowledge.checked = false;
    beginButton.disabled = true;
    document.querySelectorAll('.validation').forEach(message => {
      message.textContent = '';
    });

    syncConditionalInputs();
    currentPage = 0;
    settleSheets();
    makeFileNumber();
    updateChrome();
    setAriaState();
    focusSheet(0);
  });

  makeFileNumber();
  syncConditionalInputs();
  updateChrome();
  settleSheets();
  setAriaState();
})();
