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
      validate: 'checkbox', min: 1, max: 3,
      title: 'Which kinds of problems would you most enjoy being the person everyone turns to solve?',
      prompt: 'Pick up to <strong>three</strong>.',
      body: `<fieldset data-max="3">
        <legend class="sr-only">Choose up to three responses</legend>
        ${checkbox('q3', 'medical', 'Medicine, injury, or caring for people')}
        ${checkbox('q3', 'scientific', 'Science, analysis, or figuring out why something happened')}
        ${checkbox('q3', 'technical', 'Machines, locks, security, or technical systems')}
        ${checkbox('q3', 'lore', 'Old languages, artifacts, ruins, books, or specialist lore')}
        ${checkbox('q3', 'investigation', 'Crime, investigation, or reconstructing events')}
        ${checkbox('q3', 'combat', 'Weapons, fighting, or handling physical danger')}
        ${checkbox('q3', 'movement', 'Sneaking, climbing, chasing, or getting into difficult places')}
        ${checkbox('q3', 'travel', 'Travel, wilderness, navigation, or exploration')}
        ${checkbox('q3', 'influential', 'Important people, formal institutions, or high society')}
        ${checkbox('q3', 'street', 'Ordinary people, neighborhoods, or street networks')}
        ${checkbox('q3', 'social', 'Persuasion, deception, disguise, or maintaining a cover identity')}
        ${checkbox('q3', 'leadership', 'Leadership, protection, or keeping other people functioning under pressure')}
        ${checkbox('q3', 'ethics', 'Religion, ethics, or helping people through difficult circumstances')}
        ${writeInTrigger('checkbox', 'q3', 'other', 'Other', 'q3-other')}
      </fieldset>`
    },
    {
      page: 4,
      question: 'IV',
      code: 'FORM 7-B · HAZARD RESPONSE',
      validate: 'radio',
      title: 'Things suddenly go very badly.',
      prompt: 'Which response sounds most fun?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q4', 'protect', 'Get someone else out first')}
        ${radio('q4', 'calm', 'Calm everyone down before panic makes it worse')}
        ${radio('q4', 'command', 'Take control and start giving orders')}
        ${radio('q4', 'weapon', 'Draw a weapon and take charge of the immediate threat')}
        ${radio('q4', 'close', 'Get close and deal with it physically')}
        ${radio('q4', 'assess', 'Find cover, assess what is happening, then act')}
        ${radio('q4', 'chase', 'Go after the person who is getting away')}
        ${radio('q4', 'environment', 'Use the surroundings, a tool, or a vehicle in a clever way')}
        ${radio('q4', 'shield', 'Stand between the danger and everyone else')}
        ${radio('q4', 'escape', 'Find the exit and get everyone through it')}
        ${radio('q4', 'reckless', 'Try the ridiculous idea that might actually work')}
      </fieldset>`
    },
    {
      page: 5,
      question: 'V',
      code: 'FORM 7-B · ACCESS',
      validate: 'checkbox', min: 2, max: 2,
      title: 'Which two doors would you most enjoy your character being unusually comfortable opening?',
      prompt: 'Not literally every time. Pick the <strong>two kinds of places</strong> where you would enjoy having an edge.',
      body: `<fieldset data-max="2">
        <legend class="sr-only">Choose exactly two responses</legend>
        ${checkbox('q5', 'society', 'A private club, fashionable house, or invitation-only gathering')}
        ${checkbox('q5', 'official', 'A government, police, military, or other official office')}
        ${checkbox('q5', 'technical', 'A workshop, laboratory, machine room, or secured technical space')}
        ${checkbox('q5', 'medical', 'A hospital, sickroom, morgue, or medical institution')}
        ${checkbox('q5', 'archive', 'A library, archive, museum collection, or restricted body of records')}
        ${checkbox('q5', 'transport', 'A ship, dockyard, station, train, or place people are about to depart from')}
        ${checkbox('q5', 'underworld', 'A criminal back room, gambling den, smuggler’s haunt, or rough drinking place')}
        ${checkbox('q5', 'backstage', 'Backstage, behind the scenes, or among performers and public personalities')}
        ${checkbox('q5', 'remote', 'A remote estate, excavation, ruin, wilderness camp, or isolated property')}
        ${checkbox('q5', 'restricted', 'A guarded or restricted place where bluffing, stealth, or bypassing security matters')}
      </fieldset>`
    },
    {
      page: 6,
      question: 'VI',
      code: 'FORM 7-B · DISPOSITION',
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
      code: 'FORM 7-B · UTILITY',
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
        ${radio('q7', 'shadow', '“You can follow them without being seen.”')}
        ${radio('q7', 'think', '“You understand how people like this think.”')}
        ${radio('q7', 'idea', '“You always come up with something.”')}
        ${writeInTrigger('radio', 'q7', 'other', 'Other', 'q7-other')}
      </fieldset>`
    },
    {
      page: 8,
      question: 'VIII',
      code: 'FORM 7-B · LIABILITY',
      validate: 'radio',
      title: 'Perfect people are boring.',
      prompt: 'Which problem would you actually enjoy occasionally making life harder?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q8', 'pride', 'Pride')}
        ${radio('q8', 'impatience', 'Impatience')}
        ${radio('q8', 'temper', 'A temper')}
        ${radio('q8', 'curious', 'Being too curious for my own good')}
        ${radio('q8', 'orders', 'Trouble taking orders')}
        ${radio('q8', 'trust', 'Trouble trusting people')}
        ${radio('q8', 'softspot', 'A soft spot someone could exploit')}
        ${radio('q8', 'reputation', 'A reputation that follows me')}
        ${radio('q8', 'money', 'Money problems')}
        ${radio('q8', 'risks', 'Taking unnecessary risks')}
        ${radio('q8', 'responsible', 'Feeling responsible for everyone')}
        ${radio('q8', 'code', 'A personal code I refuse to break even when it would be easier')}
        ${radio('q8', 'knows-it', 'Being very good at something and knowing it')}
        ${writeInTrigger('radio', 'q8', 'other', 'Other', 'q8-other')}
      </fieldset>`
    },
    {
      page: 9,
      question: 'IX',
      code: 'FORM 7-B · EXTERNAL PRESSURES',
      validate: 'checkbox', min: 1, max: 2,
      title: 'Which complication could make the story more interesting rather than annoying?',
      prompt: 'Choose up to <strong>two</strong>.',
      body: `<fieldset data-max="2">
        <legend class="sr-only">Choose one or two responses</legend>
        ${checkbox('q9', 'family', 'Family obligations')}
        ${checkbox('q9', 'reputation', 'Professional or public reputation')}
        ${checkbox('q9', 'money', 'Money problems')}
        ${checkbox('q9', 'rival', 'An old rival')}
        ${checkbox('q9', 'mistake', 'A past mistake that can still matter')}
        ${checkbox('q9', 'dependent', 'Someone depending on me')}
        ${checkbox('q9', 'authority', 'Conflict with authority')}
        ${checkbox('q9', 'expectations', 'Social expectations or family status')}
        ${checkbox('q9', 'romance', 'Romantic complications')}
        ${checkbox('q9', 'secret', 'A secret I have reasons to protect')}
        ${checkbox('q9', 'enemy', 'An enemy who knows who I am')}
        ${checkbox('q9', 'obligation', 'An organization, employer, patron, or cause that expects things from me')}
        ${checkbox('q9', 'little-drama', 'I would rather not have much personal drama')}
        ${checkbox('q9', 'surprise', 'Surprise me')}
      </fieldset>`
    },
    {
      page: 10,
      question: 'X',
      code: 'FORM 7-B · PREFERRED MOMENT',
      validate: 'radio',
      title: 'You get one scene where everyone at the table knows this is what your character is for.',
      prompt: 'Which moment sounds best?',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q10', 'room', 'Read a hostile room correctly and turn the right person into an ally')}
        ${radio('q10', 'clue', 'Recognize the one detail or clue that changes what everyone thinks is happening')}
        ${radio('q10', 'inscription', 'Recognize what an old inscription, object, or piece of specialist knowledge really means')}
        ${radio('q10', 'infiltration', 'Get through a guarded place without anyone realizing I do not belong there')}
        ${radio('q10', 'repair', 'Understand, repair, disable, or improvise something technical under pressure')}
        ${radio('q10', 'medicine', 'Keep someone alive while everything around me is going wrong')}
        ${radio('q10', 'pursuit', 'Win a dangerous pursuit across streets, rooftops, vehicles, or rough terrain')}
        ${radio('q10', 'command', 'Take command while everyone else is panicking or arguing')}
        ${radio('q10', 'protect', 'Put myself between innocent people and something dangerous')}
        ${radio('q10', 'contacts', 'Produce exactly the contact, favor, or introduction the group suddenly needs')}
        ${radio('q10', 'survival', 'Get everyone through a place or situation that looked impossible to survive')}
        ${radio('q10', 'audacious', 'Make an audacious plan work when the sensible options have failed')}
      </fieldset>`
    },
    {
      page: 11,
      question: 'XI',
      code: 'FORM 7-B · SELF-CONCEPTION',
      validate: 'radio',
      title: 'Which sentence would be most satisfying to say?',
      prompt: 'Pick the one that feels most like your person.',
      body: `<fieldset>
        <legend class="sr-only">Choose one response</legend>
        ${radio('q11', 'wrong-thing', '“You are looking at the wrong thing.”')}
        ${radio('q11', 'alone', '“Give me five minutes alone with them.”')}
        ${radio('q11', 'way-in', '“I know a way in.”')}
        ${radio('q11', 'works', '“Tell me how it works.”')}
        ${radio('q11', 'protect', '“Get behind me.”')}
        ${radio('q11', 'know-someone', '“I know someone.”')}
        ${radio('q11', 'story', '“That story does not add up.”')}
        ${radio('q11', 'watched', '“We are being watched.”')}
        ${radio('q11', 'rule-wall', '“That is a rule, not a wall.”')}
        ${radio('q11', 'move', '“We need to move. Now.”')}
        ${radio('q11', 'idea', '“I have an idea. You are not going to like it.”')}
        ${writeInTrigger('radio', 'q11', 'mine', 'Mine would be…', 'q11-mine')}
      </fieldset>`
    },
    {
      page: 12,
      question: 'XII',
      code: 'FORM 7-B · STARTING POSITION',
      validate: 'radio',
      title: 'Where would you rather begin the story?',
      prompt: 'Choose whichever starting position sounds most enjoyable.',
      body: `<fieldset class="short-options">
        <legend class="sr-only">Choose one response</legend>
        ${radio('q12', 'accomplished', 'Accomplished and respected')}
        ${radio('q12', 'proving', 'Capable but still proving myself')}
        ${radio('q12', 'complicated', 'Talented with a complicated reputation')}
        ${radio('q12', 'outsider', 'An outsider earning people’s trust')}
        ${radio('q12', 'any', 'Any of those — fit me where I work best')}
      </fieldset>`
    },
    {
      page: 13,
      question: 'XIII',
      code: 'FORM 7-B · SUBJECT OVERRIDE',
      validate: 'optional',
      title: 'Last two. These answers outrank any pattern in the earlier pages.',
      prompt: 'Short answers are completely fine. Leave either blank if you genuinely have no preference.',
      body: `<div class="long-form">
        <label for="q13-love"><strong>I would love it if these answers somehow turned into…</strong><span>Any type of person, personality, relationship, memorable ability, scene, or vague feeling.</span></label>
        <textarea id="q13-love" name="q13_love" rows="5"></textarea>
        <label for="q13-avoid"><strong>I definitely do not want these answers turned into…</strong><span>Any type, personality, role, trope, relationship, situation, or other element that would lower your excitement.</span></label>
        <textarea id="q13-avoid" name="q13_avoid" rows="5"></textarea>
      </div>`
    }
  ];

  const densePages = new Set([3, 4, 5, 7, 8, 9, 10, 11]);

  pages.forEach(page => {
    const section = document.createElement('section');
    section.className = `sheet next${densePages.has(page.page) ? ' dense' : ''}`;
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
        <p>Repeated preferences, contradictions, and the subject’s final statement are all material. No single answer should be treated as decisive.</p>
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