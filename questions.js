(() => {
  'use strict';

  const book = document.getElementById('survey-book');
  if (!book) return;

  const existingPrototype = book.querySelector('section[data-page="3"]');
  if (existingPrototype) existingPrototype.remove();

  const q1 = book.querySelector('section[data-page="1"]');
  const q2 = book.querySelector('section[data-page="2"]');
  if (q1) Object.assign(q1.dataset, { validate: 'checkbox', min: '2', max: '2' });
  if (q2) Object.assign(q2.dataset, { validate: 'checkbox', min: '1', max: '2' });

  const intro = book.querySelector('section[data-page="0"] .sheet-front');
  if (intro && !intro.querySelector('.classification-rubric')) {
    const rubric = document.createElement('div');
    rubric.className = 'classification-rubric';
    rubric.setAttribute('aria-label', 'Assessment domains');
    rubric.innerHTML = `
      <span class="rubric-label">ASSESSMENT DOMAINS</span>
      <span>CIVIC</span>
      <span>EXPEDITIONARY</span>
      <span>COVERT</span>
      <span>TECHNICAL</span>
      <span>PROTECTIVE</span>
      <span>IRREGULAR</span>`;
    const acknowledgement = intro.querySelector('.acknowledgement');
    intro.insertBefore(rubric, acknowledgement || null);
  }

  function backFace() {
    return '<div class="sheet-face sheet-back" aria-hidden="true"></div>';
  }

  function actions(nextLabel = 'Turn Page') {
    return `
      <div class="sheet-actions">
        <button class="secondary back-button" type="button">Previous Sheet</button>
        <button class="primary next-button" type="button">${nextLabel}</button>
      </div>`;
  }

  function checkbox(name, value, label, extra = '') {
    return `<label><input type="checkbox" name="${name}" value="${value}" ${extra}> <span>${label}</span></label>`;
  }

  function radio(name, value, label, extra = '') {
    return `<label><input type="radio" name="${name}" value="${value}" ${extra}> <span>${label}</span></label>`;
  }

  function writeInTrigger(type, name, value, label, targetId) {
    return `<label class="writein-option"><span class="choice-line"><input type="${type}" name="${name}" value="${value}" data-other-target="${targetId}"> <span>${label}</span></span><input class="write-in" type="text" id="${targetId}" name="${targetId}" disabled autocomplete="off" aria-label="${label} response"></label>`;
  }

  const pages = [
    {
      page: 3,
      question: 'III',
      code: 'FORM 7-B · APTITUDE',
      classification: 'SCHOLASTIC / TECHNICAL / FIELD',
      validate: 'checkbox', min: 1, max: 3,
      title: 'Which kinds of problems would you most enjoy being the person everyone turns to solve?',
      prompt: 'Pick up to <strong>three</strong>.',
      body: `<fieldset data-max="3">
        <legend class="sr-only">Choose up to three responses</legend>
        ${checkbox('q3', 'medical', 'Medical problems')}
        ${checkbox('q3', 'scientific', 'Scientific problems')}
        ${checkbox('q3', 'mechanical', 'Mechanical or technical problems')}
        ${checkbox('q3', 'records', 'Books, records, or specialist knowledge')}
        ${checkbox('q3', 'crime', 'Crime or investigation')}
        ${checkbox('q3', 'danger', 'Weapons or physical danger')}
        ${checkbox('q3', 'travel', 'Travel, terrain, or survival')}
        ${checkbox('q3', 'influential', 'Important or influential people')}
        ${checkbox('q3', 'street', 'Ordinary people, neighborhoods, or street knowledge')}
        ${checkbox('q3', 'persuasion', 'Persuasion, deception, or reading people')}
        ${checkbox('q3', 'ethics', 'Religion, ethics, or human suffering')}
        ${writeInTrigger('checkbox', 'q3', 'other', 'Other', 'q3-other')}
      </fieldset>`
    },
    {
      page: 4,
      question: 'IV',
      code: 'FORM 7-B · HAZARD RESPONSE',
      classification: 'PROTECTIVE / COMBAT / EVASIVE',
      validate: 'radio',
      title: 'Things suddenly go very badly.',
      prompt: 'Which response sounds most fun?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q4', 'protect', 'Get someone else out first')}
        ${radio('q4', 'calm', 'Calm everyone')}
        ${radio('q4', 'command', 'Take control and give orders')}
        ${radio('q4', 'weapon', 'Draw a weapon and take charge of the threat')}
        ${radio('q4', 'close', 'Get close and deal with it physically')}
        ${radio('q4', 'assess', 'Find cover, assess, then act')}
        ${radio('q4', 'chase', 'Chase the person who is getting away')}
        ${radio('q4', 'environment', 'Use the surroundings cleverly')}
        ${radio('q4', 'escape', 'Find the exit and get everyone through it')}
        ${radio('q4', 'reckless', 'Try the ridiculous idea that might actually work')}
      </fieldset>`
    },
    {
      page: 5,
      question: 'V',
      code: 'FORM 7-B · OUTCOME PREFERENCE',
      classification: 'ANALYTICAL / SOCIAL / ACTION',
      validate: 'checkbox', min: 2, max: 2,
      title: 'Which victories feel best?',
      prompt: 'Pick <strong>two</strong>.',
      body: `<fieldset data-max="2">
        <legend class="sr-only">Choose exactly two responses</legend>
        ${checkbox('q5', 'noticed', '“Nobody else noticed that.”')}
        ${checkbox('q5', 'truth', 'They finally told me the truth')}
        ${checkbox('q5', 'paperwork', 'The answer was sitting in the paperwork')}
        ${checkbox('q5', 'specialist', 'I knew something nobody else knew')}
        ${checkbox('q5', 'deduced', 'I figured it out before anyone explained it')}
        ${checkbox('q5', 'access', 'I got us somewhere we were not supposed to be')}
        ${checkbox('q5', 'saved', 'I saved someone')}
        ${checkbox('q5', 'outsmarted', 'I outsmarted them')}
        ${checkbox('q5', 'caught', 'I caught them')}
        ${checkbox('q5', 'survived', 'I survived something I probably should not have tried')}
      </fieldset>`
    },
    {
      page: 6,
      question: 'VI',
      code: 'FORM 7-B · DISPOSITION MATRIX',
      classification: 'SOCIAL / PROCEDURAL / IRREGULAR',
      validate: 'radio-count', min: 8,
      title: 'Pick whichever side you lean toward.',
      prompt: 'Do not worry about keeping the answers consistent.',
      body: `<fieldset class="pair-matrix">
        <legend class="sr-only">Choose one response from each pair</legend>
        <div class="pair-row">${radio('q6_1', 'book', 'Book learning')}${radio('q6_1', 'experience', 'Hard-earned experience')}</div>
        <div class="pair-row">${radio('q6_2', 'respectable', 'Respectable')}${radio('q6_2', 'questionable', 'A little questionable')}</div>
        <div class="pair-row">${radio('q6_3', 'patient', 'Patient')}${radio('q6_3', 'impulsive', 'Impulsive')}</div>
        <div class="pair-row">${radio('q6_4', 'skeptical', 'Skeptical')}${radio('q6_4', 'open', 'Open-minded')}</div>
        <div class="pair-row">${radio('q6_5', 'diplomatic', 'Diplomatic')}${radio('q6_5', 'blunt', 'Blunt')}</div>
        <div class="pair-row">${radio('q6_6', 'rules', 'Follow the rules')}${radio('q6_6', 'negotiate', 'Rules are negotiable')}</div>
        <div class="pair-row">${radio('q6_7', 'established', 'Already established')}${radio('q6_7', 'prove', 'Something to prove')}</div>
        <div class="pair-row">${radio('q6_8', 'local', 'Deep local roots')}${radio('q6_8', 'travelled', 'Been around')}</div>
      </fieldset>`
    },
    {
      page: 7,
      question: 'VII',
      code: 'FORM 7-B · SPECIALIST UTILITY',
      classification: 'CIVIC / EXPEDITIONARY / COVERT',
      validate: 'radio',
      title: 'Someone says, “We need you for this.”',
      prompt: 'What would you most like the next sentence to be?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q7', 'missing', '“You notice when something is missing.”')}
        ${radio('q7', 'talk', '“You know how to talk to these people.”')}
        ${radio('q7', 'subject', '“You are the only one who understands this subject.”')}
        ${radio('q7', 'hurt', '“Someone is hurt.”')}
        ${radio('q7', 'works', '“We need to know how this works.”')}
        ${radio('q7', 'danger', '“You are the one we trust when it gets dangerous.”')}
        ${radio('q7', 'inside', '“You can get us inside.”')}
        ${radio('q7', 'people', '“You know people.”')}
        ${radio('q7', 'place', '“You know this place.”')}
        ${radio('q7', 'think', '“You understand how people like this think.”')}
        ${radio('q7', 'idea', '“You always come up with something.”')}
        ${writeInTrigger('radio', 'q7', 'other', 'Other', 'q7-other')}
      </fieldset>`
    },
    {
      page: 8,
      question: 'VIII',
      code: 'FORM 7-B · LIABILITY INDEX',
      classification: 'TEMPERAMENT / REPUTATION / OBLIGATION',
      validate: 'radio',
      title: 'Perfect people are boring.',
      prompt: 'Which problem would you actually enjoy occasionally making life harder?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q8', 'pride', 'Pride')}
        ${radio('q8', 'impatience', 'Impatience')}
        ${radio('q8', 'temper', 'A temper')}
        ${radio('q8', 'curious', 'Too curious')}
        ${radio('q8', 'orders', 'Trouble taking orders')}
        ${radio('q8', 'trust', 'Trouble trusting people')}
        ${radio('q8', 'softspot', 'A soft spot someone could exploit')}
        ${radio('q8', 'reputation', 'A reputation that follows me')}
        ${radio('q8', 'money', 'Money problems')}
        ${radio('q8', 'risks', 'Taking unnecessary risks')}
        ${radio('q8', 'responsible', 'Feeling responsible for everyone')}
        ${radio('q8', 'knows-it', 'Being very good at something and knowing it')}
        ${writeInTrigger('radio', 'q8', 'other', 'Other', 'q8-other')}
      </fieldset>`
    },
    {
      page: 9,
      question: 'IX',
      code: 'FORM 7-B · EXTERNAL PRESSURES',
      classification: 'SOCIAL / PROFESSIONAL / PRIVATE',
      validate: 'checkbox', min: 1, max: 2,
      title: 'Which complication could make the story more interesting rather than annoying?',
      prompt: 'Choose up to <strong>two</strong>.',
      body: `<fieldset data-max="2">
        <legend class="sr-only">Choose one or two responses</legend>
        ${checkbox('q9', 'family', 'Family obligations')}
        ${checkbox('q9', 'reputation', 'Professional reputation')}
        ${checkbox('q9', 'money', 'Money')}
        ${checkbox('q9', 'rival', 'An old rival')}
        ${checkbox('q9', 'mistake', 'A past mistake')}
        ${checkbox('q9', 'dependent', 'Someone depending on me')}
        ${checkbox('q9', 'authority', 'Conflict with authority')}
        ${checkbox('q9', 'expectations', 'Social expectations')}
        ${checkbox('q9', 'romance', 'Romantic complications')}
        ${checkbox('q9', 'secret', 'A secret')}
        ${checkbox('q9', 'enemy', 'An enemy')}
        ${checkbox('q9', 'little-drama', 'I would rather not have much personal drama')}
        ${checkbox('q9', 'surprise', 'Surprise me')}
      </fieldset>`
    },
    {
      page: 10,
      question: 'X',
      code: 'FORM 7-B · MORAL DISCRETION',
      classification: 'ETHICAL / OPERATIONAL',
      validate: 'radio',
      title: 'The situation has no clean solution.',
      prompt: 'How does that sound?',
      body: `<fieldset class="short-options">
        <legend class="sr-only">Choose one response</legend>
        ${radio('q10', 'excellent', 'Excellent. Make me choose.')}
        ${radio('q10', 'fine', 'Fine with me.')}
        ${radio('q10', 'occasionally', 'Occasionally.')}
        ${radio('q10', 'clear', 'I would rather there usually be a clear right thing to do.')}
      </fieldset>`
    },
    {
      page: 11,
      question: 'XI',
      code: 'FORM 7-B · SELF-CONCEPTION',
      classification: 'ANALYTICAL / SOCIAL / ACTION / IRREGULAR',
      validate: 'radio',
      title: 'Which sentence would be most satisfying to say?',
      prompt: 'Pick the one that feels most like your person.',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q11', 'wrong-thing', '“You are looking at the wrong thing.”')}
        ${radio('q11', 'alone', '“Give me five minutes alone with them.”')}
        ${radio('q11', 'explanation', '“There is an explanation. We just have not found it yet.”')}
        ${radio('q11', 'worse', '“I have been in worse situations than this.”')}
        ${radio('q11', 'rule-wall', '“That is a rule, not a wall.”')}
        ${radio('q11', 'protect', '“Nobody else is getting hurt.”')}
        ${radio('q11', 'know-someone', '“I know someone.”')}
        ${radio('q11', 'written', '“The answer is written down somewhere.”')}
        ${radio('q11', 'no-time', '“We do not have time to debate this.”')}
        ${radio('q11', 'idea', '“I have an idea. You are not going to like it.”')}
        ${writeInTrigger('radio', 'q11', 'mine', 'Mine would be…', 'q11-mine')}
      </fieldset>`
    },
    {
      page: 12,
      question: 'XII',
      code: 'FORM 7-B · SOCIAL POSITION',
      classification: 'ESTABLISHED / ASPIRANT / OUTSIDER',
      validate: 'radio',
      title: 'Where would you rather begin the story?',
      prompt: 'Choose whichever starting position sounds most enjoyable.',
      body: `<fieldset class="short-options">
        <legend class="sr-only">Choose one response</legend>
        ${radio('q12', 'accomplished', 'Accomplished and respected')}
        ${radio('q12', 'proving', 'Capable but still proving myself')}
        ${radio('q12', 'complicated', 'Talented with a complicated reputation')}
        ${radio('q12', 'outsider', 'An outsider earning people’s trust')}
        ${radio('q12', 'any', 'Any of those')}
      </fieldset>`
    },
    {
      page: 13,
      question: 'XIII',
      code: 'FORM 7-B · SUBJECT OVERRIDE',
      classification: 'FINAL PERSONAL STATEMENT',
      validate: 'optional',
      title: 'Last two. These answers outrank any pattern in the earlier pages.',
      prompt: 'Short answers are completely fine.',
      body: `<div class="long-form">
        <label for="q13-love"><strong>I would love it if these answers somehow turned into…</strong><span>Any type of person, personality, relationship, memorable ability, scene, or vague feeling.</span></label>
        <textarea id="q13-love" name="q13_love" rows="5"></textarea>
        <label for="q13-avoid"><strong>I definitely do not want these answers turned into…</strong><span>Any type, personality, role, trope, relationship, situation, or other element that would lower your excitement.</span></label>
        <textarea id="q13-avoid" name="q13_avoid" rows="5"></textarea>
      </div>`
    }
  ];

  pages.forEach(page => {
    const section = document.createElement('section');
    section.className = `sheet next${page.page === 3 || page.page === 8 || page.page === 9 || page.page === 11 ? ' dense' : ''}`;
    section.dataset.page = String(page.page);
    section.dataset.validate = page.validate;
    if (page.min != null) section.dataset.min = String(page.min);
    if (page.max != null) section.dataset.max = String(page.max);
    section.setAttribute('aria-labelledby', `q${page.page}-heading`);
    section.setAttribute('aria-hidden', 'true');
    section.innerHTML = `
      <div class="sheet-face sheet-front">
        <p class="form-code">${page.code}</p>
        <div class="question-number">Inquiry ${page.question}</div>
        <div class="classification-code">${page.classification}</div>
        <h2 id="q${page.page}-heading">${page.title}</h2>
        <p class="prompt">${page.prompt}</p>
        ${page.body}
        <p class="validation" aria-live="polite"></p>
        ${actions(page.page === 13 ? 'Complete Examination' : 'Turn Page')}
        <p class="folio">Sheet ${['IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV'][page.page - 3]}</p>
      </div>
      ${backFace()}`;
    book.appendChild(section);
  });

  const completion = document.createElement('section');
  completion.className = 'sheet next';
  completion.dataset.page = '14';
  completion.dataset.validate = 'completion';
  completion.setAttribute('aria-labelledby', 'completion-heading');
  completion.setAttribute('aria-hidden', 'true');
  completion.innerHTML = `
    <div class="sheet-face sheet-front completion-sheet">
      <p class="form-code">FORM 7-B · REVIEW COPY</p>
      <div class="stamp">FILE FOR REVIEW</div>
      <h2 id="completion-heading">Examination Complete</h2>
      <p>Your responses remain attached to this examination record for review.</p>
      <div class="examiner-note">
        <b>EXAMINER'S NOTE</b>
        <p>Do not infer a single classification from isolated answers. Repeated preferences, contradictions, and the subject’s final statement are all material.</p>
      </div>
      <div class="classification-rubric compact-rubric" aria-hidden="true">
        <span class="rubric-label">POSSIBLE CLASSIFICATIONS</span>
        <span>CIVIC</span><span>EXPEDITIONARY</span><span>COVERT</span><span>TECHNICAL</span><span>PROTECTIVE</span><span>IRREGULAR</span>
      </div>
      <div class="sheet-actions">
        <button class="secondary back-button" type="button">Previous Sheet</button>
        <button class="primary" type="button" id="restart-button">Restart Examination</button>
      </div>
      <p class="folio">Review Copy</p>
    </div>
    ${backFace()}`;
  book.appendChild(completion);
})();
