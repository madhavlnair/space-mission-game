function menu(prompt, labels){
  return new Promise(res => {
    $('speaker').textContent = ''; $('text').textContent = prompt;
    const box = $('choices'); box.innerHTML = '';
    labels.forEach((l, i) => {
      const b = document.createElement('button'); b.className = 'choice'; b.textContent = l;
      b.onclick = () => res(i); box.appendChild(b);
    });
  });
}

async function corkboard(){
  scene('A gray hallway. A corkboard with three notices.');
  const notices = [
    'In memory of Grissom, White and Chaffee. January 27, 1967.',
    'A typed memo: "Before this decade is out."',
    'A newspaper clipping: war news from Vietnam.'
  ];
  let done = false;
  while(!done){
    const i = await menu('Read a notice, or walk on.', ['Memorial notice', 'Typed memo', 'Newspaper clipping', 'Walk on']);
    if(i === 3) done = true; else await say('Notice', notices[i]);
  }
}

async function intro(who, sceneText, line, options){
  scene(sceneText);
  await say(who, line);
  const r = await ask(options);
  await say(r.narr ? '' : who, r.reply);
}

async function startGame(){
  await card('<b>SPRING 1967</b><br>In January, the Apollo 1 crew was lost in a ground test. The programme pushes on.');
  await corkboard();

  scene("The chairman's office.");
  await say('Prescott', "Mr. Washington. The chairman's office doesn't usually meet juniors. I made an exception.");
  await say('Prescott', 'You will work beside these people for a long time. Go and speak to each of them. Then get to work.');
  let r = await ask([
    { t: '"Yes, sir. I\'ll introduce myself to everyone."', reply: 'Good.' },
    { t: '"Thank you for the chance, sir."', reply: "Don't thank me yet." },
    { t: '"I won\'t let anyone down, sir."', reply: 'Hm. We will see.' }
  ]);
  await say('Prescott', r.reply);

  scene("Walter Brennan's office.");
  await say('Walter', 'Washington. I read your file: good marks, no name attached. That is rare.');
  await say('Walter', "I don't hand out favors, I hand out tasks. Meet the team. Don't take the cold ones personally.");
  r = await ask([
    { t: '"No strings, sir. I applied like everyone else."', reply: 'Noted.' },
    { t: '"I\'ll make it count, sir."', reply: 'Make it count for the whole team.' },
    { t: '"Where do I start?"', reply: 'The desk by the window.' }
  ]);
  await say('Walter', r.reply);

  await intro('Dorothy', 'A desk buried in binders.',
    "Don't touch that pile. It's organized. Not in a way anyone else can see.", [
    { t: '"Messy people often find things faster than tidy ones."', fx: { dorothy: 5 }, reply: 'Careful, I might like you.' },
    { t: '"I can see there\'s a system."', fx: { dorothy: 5 }, reply: 'Finally, someone with eyes.' },
    { t: '"I\'ll stay out of your way."', reply: 'Hm. Polite, at least.' }
  ]);

  await intro('Marcus', 'A tidy desk, a steel thermos, a photo of a porch far from here. He does not look up.',
    'Nobody walks in here this young without a name on the paper. Whose is yours?', [
    { t: '"I\'m not asking for anything you didn\'t earn."', reply: 'Sure. I earned every inch of this desk.' },
    { t: '"I applied like everybody else."', reply: "That's what they all say." },
    { t: '"Understood."', reply: 'Understood what? ...Never mind.' }
  ]);

  await intro('Frank', 'A photo of a smiling woman. A calendar date circled in red.',
    "Frank Alvarez. The coffee's terrible, but it's hot. That's Maria. Eight months along.", [
    { t: '"Congratulations, that\'s wonderful."', fx: { frank: 5 }, reply: 'If you need help, ask me.' },
    { t: '"Eight months? You should be home."', fx: { frank: 5 }, reply: 'Tell that to the schedule.' },
    { t: '"Good luck with the sleep."', reply: "Ha! Don't remind me." }
  ]);

  await intro('Richard', 'A corner desk with a very straight pen holder.',
    "I thought they'd fill this spot from somewhere closer to home. Did the agency run out of people?", [
    { t: '"I\'m here to do the work."', reply: 'We will see.' },
    { t: '"I\'ll be at my desk."', reply: 'Good. Stay there.' },
    { t: '(Say nothing.)', reply: 'Richard smirks and turns back to his papers.', narr: true }
  ]);

  await intro('Ben', 'A pencil sharpened for the third time.',
    'Oh. Hi. I am Ben. Sorry. The higher-ups make me nervous. My numbers are good, I think.', [
    { t: '"Good numbers speak for themselves."', fx: { ben: 5 }, reply: '...Thanks. Really.' },
    { t: '"I\'ll listen if you want to practise."', fx: { ben: 5 }, reply: 'You would do that? Oh. Okay.' },
    { t: '"Everyone gets nervous."', reply: 'Not like me. But thanks.' }
  ]);

  scene('The corridor.');
  await say('Walter', 'Briefing room, five minutes. Bring a pencil.');
  await runTask1(); await runTask2(); await runTask4(); await runTask5(); await promotion1(); await runTask7(); await promotion2();
  scene('END OF STORY TEST');    await say('', 'The first part of the story is complete. The ending comes next.');
} 