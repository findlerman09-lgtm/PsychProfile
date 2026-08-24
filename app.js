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

  let currentPage = 0;
  let animating = false;

  const roman = ['I', 'II', 'III', 'IV'];

  function makeFileNumber() {
    const n = Math.floor(10000 + Math.random() * 89999);
    fileNumber.textContent = String(n);
  }

  function updateChrome() {
    if (currentPage === 0) {
      statusLabel.textContent = 'UNASSESSED';
      progressLabel.textContent = 'Sheet I of III';
    } else if (currentPage < 3) {
      statusLabel.textContent = 'IN EXAMINATION';
      progressLabel.textContent = `Sheet ${roman[currentPage]} of III`;
    } else {
      statusLabel.textContent = 'REVIEW PENDING';
      progressLabel.textContent = 'Development Copy';
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
      sheet.querySelectorAll('input, button').forEach(control => {
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
      sheet.classList.remove('turned', 'current', 'next', 'returning', 'parked');

      if (index < currentPage) {
        sheet.classList.add('turned');
        if (index === currentPage - 1) sheet.classList.add('parked');
      } else if (index === currentPage) {
        sheet.classList.add('current');
      } else {
        sheet.classList.add('next');
      }
    });
  }

  function transitionDelay(callback) {
    if (reduceMotion.matches) {
      requestAnimationFrame(callback);
      return;
    }
    window.setTimeout(callback, 1180);
  }

  function turnForward() {
    if (animating || currentPage >= sheets.length - 1) return;

    const leaving = sheets[currentPage];
    const arriving = sheets[currentPage + 1];
    animating = true;

    /* The incoming sheet is already underneath. The outgoing sheet curls over
       it; after the curl finishes its blank reverse remains parked above. */
    arriving.classList.remove('next', 'returning', 'turned', 'parked');
    arriving.classList.add('current');
    arriving.setAttribute('aria-hidden', 'false');

    leaving.classList.remove('current', 'parked', 'returning');
    leaving.classList.add('turned');

    currentPage += 1;
    updateChrome();

    transitionDelay(() => {
      settleSheets();
      setAriaState();
      focusSheet(currentPage);
      animating = false;
    });
  }

  function turnBackward() {
    if (animating || currentPage <= 0) return;

    const leaving = sheets[currentPage];
    const arriving = sheets[currentPage - 1];
    animating = true;

    leaving.classList.remove('current');
    leaving.classList.add('next');

    /* Release the previous page from its parked position and let it uncurl
       downward over the sheet that was current. */
    arriving.classList.remove('turned', 'parked', 'current', 'next');
    arriving.classList.add('returning');
    arriving.setAttribute('aria-hidden', 'false');

    currentPage -= 1;
    updateChrome();

    transitionDelay(() => {
      settleSheets();
      setAriaState();
      focusSheet(currentPage);
      animating = false;
    });
  }

  function selectedCount(name) {
    return document.querySelectorAll(`input[name="${name}"]:checked`).length;
  }

  function validateCurrentPage() {
    if (currentPage === 1) {
      const count = selectedCount('q1');
      const message = document.getElementById('q1-validation');
      if (count !== 2) {
        message.textContent = 'Please mark exactly two responses before turning the sheet.';
        return false;
      }
      message.textContent = '';
    }

    if (currentPage === 2) {
      const count = selectedCount('q2');
      const message = document.getElementById('q2-validation');
      if (count < 1 || count > 2) {
        message.textContent = 'Please mark one or two responses before turning the sheet.';
        return false;
      }
      message.textContent = '';
    }

    return true;
  }

  document.querySelectorAll('fieldset[data-max]').forEach(fieldset => {
    const max = Number(fieldset.dataset.max || 1);
    const inputs = Array.from(fieldset.querySelectorAll('input[type="checkbox"]'));

    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const checked = inputs.filter(item => item.checked);
        const validation = fieldset.parentElement.querySelector('.validation');

        if (checked.length > max) {
          input.checked = false;
          if (validation) {
            validation.textContent = `Please choose no more than ${max} responses.`;
          }
          return;
        }

        if (validation) validation.textContent = '';
      });
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
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    acknowledge.checked = false;
    beginButton.disabled = true;
    document.querySelectorAll('.validation').forEach(message => {
      message.textContent = '';
    });

    currentPage = 0;
    settleSheets();
    makeFileNumber();
    updateChrome();
    setAriaState();
    focusSheet(0);
  });

  makeFileNumber();
  updateChrome();
  settleSheets();
  setAriaState();
})();
