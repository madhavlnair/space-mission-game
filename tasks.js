function verdict(r){ return r.t < 180 ? 'fast' : (r.t <= 300 ? 'ok' : 'slow'); }

function orderPuzzle(cfg){
  return new Promise(res => {
    let next = 0;
    startTask(cfg.no);
    const all = shuffle(cfg.order.concat(cfg.decoys || []));
    const box = $('choices');
    function done(){ res(finishTask()); }
    function draw(msg){
      $('speaker').textContent = cfg.title;
      $('text').textContent = cfg.intro + ' Placed: ' + (next ? cfg.order.slice(0, next).join(' > ') : 'nothing yet.') + (msg ? '  ' + msg : '');
      box.innerHTML = '';
      all.forEach(item => {
        const idx = cfg.order.indexOf(item);
        if(idx >= 0 && idx < next) return;
        const b = document.createElement('button'); b.className = 'choice'; b.textContent = item;
        b.onclick = () => pick(item); box.appendChild(b);
      });
      const h = document.createElement('button'); h.className = 'choice';
      h.textContent = 'Use a lifeline (' + S.lifelines + ' left)'; h.onclick = lifeline; box.appendChild(h);
    }
    function pick(item){
      if(item === cfg.order[next]){ next++; if(next >= cfg.order.length){ done(); return; } draw('Correct.'); return; }
      change('focus', -5);
      const f = checkFail();
      if(f === 'restart-game'){ location.reload(); return; }
      if(f === 'redo'){ next = 0; draw('A bar fell too low. Redo the task (bars reset).'); return; }
      draw('Wrong move.');
    }
    function lifeline(){
      S.lifelines--; drawBars();
      if(S.lifelines <= 0){ next = 0; startTask(cfg.no); draw('All lifelines used. The task restarts.'); return; }
      next++; if(next >= cfg.order.length){ done(); return; }
      draw('Hint used: ' + cfg.order[next - 1] + ' placed for you.');
    }
    draw();
  });
}

async function runTask1(){
  await card('<b>SPRING 1967</b><br>Engineers are still rewriting the safety rules after Apollo 1.');
  scene('The briefing room. A chalkboard, a long table, a clipboard of jumbled papers.');
  await say('Walter', 'A launch-prep list, all out of order. Put it back. Five minutes. Decoys do not belong on the list.');
  await say('Richard', "Even you can't ruin a checklist.");
  await ask([{ t: '"Watch me."' }, { t: '"Thank you for the confidence."' }, { t: '(Ignore him.)' }]);
  const r = await orderPuzzle({
    no: 1, title: 'Task 1: Mission checklist',
    intro: 'Click the steps in launch order.',
    order: ['Suit check', 'Comms check', 'Guidance check', 'Fuel check', 'Hatch seal', 'Final countdown'],
    decoys: ['Coffee break', 'Repaint the hatch']
  });
  await say('Walter', { fast: 'Clean.', ok: 'Fine.', slow: 'Slow, Washington.' }[verdict(r)]);
}

async function runTask2(){
  await card('<b>SUMMER 1967</b><br>The Saturn V is the tallest and most powerful rocket ever built at that time.');
  scene('The drafting room. A giant blueprint, the stages drawn as outlines.');
  await say('Walter', 'Three stages, then the lunar, service and command modules on top. Build it from the bottom up.');
  await say('Frank', 'Think bottom to top. What has to burn first?');
  await say('Richard', "Careful, Carter. Her desk will lose us a rocket.");
  await say('Marcus', "No wonder her numbers are off.");
  const a = await ask([
    { t: '"Her numbers have been right every time I\'ve checked."', fx: { dorothy: 10 } },
    { t: '(Keep your head down.)' },
    { t: '(Laugh along.)', fx: { dorothy: -10 } }
  ]);
  const r = await orderPuzzle({
    no: 2, title: 'Task 2: Saturn V stages',
    intro: 'Click the parts from the bottom of the rocket up.',
    order: ['First stage', 'Second stage', 'Third stage', 'Lunar module', 'Service module', 'Command module'],
    decoys: ['Radio dish', 'Spare wheel']
  });
  await say('Walter', { fast: 'Textbook.', ok: 'Acceptable.', slow: 'You will need to be faster than this.' }[verdict(r)]);
}

function binaryPuzzle(no){
  return new Promise(res => {
    startTask(no);
    let target = '';
    for(let i = 0; i < 48; i++) target += Math.random() < 0.5 ? '0' : '1';
    const shown = target.match(/.{8}/g).join(' ');
    const penal = {};
    const box = $('choices'); box.innerHTML = '';
    $('speaker').textContent = 'Task 4: The binary code';
    const inp = document.createElement('input');
    inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.style.cssText = 'font-family:inherit;font-size:18px;padding:10px;background:#111a3a;color:#f4f1de;border:3px solid #f4f1de;';
    inp.onpaste = e => e.preventDefault(); inp.ondrop = e => e.preventDefault();
    box.appendChild(inp);
    const val = () => inp.value.replace(/\s/g, '');
    function reset(){ inp.value = ''; Object.keys(penal).forEach(k => delete penal[k]); }
    function render(msg){
      const v = val();
      let h = 'Type this string by hand (no paste): <b>' + shown + '</b><br>';
      for(let i = 0; i < v.length; i++){
        const ch = /[01]/.test(v[i]) ? v[i] : '?';
        h += '<span style="color:' + (v[i] === target[i] ? '#6fcf97' : '#eb5757') + '">' + ch + '</span>';
      }
      if(msg) h += '<br>' + msg;
      $('text').innerHTML = h;
    }
    function failCheck(){
      const f = checkFail();
      if(f === 'restart-game'){ location.reload(); return true; }
      if(f === 'redo'){ reset(); render('A bar fell too low. Redo the task (bars reset).'); return true; }
      return false;
    }
    inp.oninput = () => {
      const v = val();
      for(let i = 0; i < v.length - 1; i++){
        if(v[i] !== target[i] && !penal[i]){ penal[i] = 1; change('mental', -2); }
      }
      if(failCheck()) return;
      render();
    };
    const run = document.createElement('button'); run.className = 'choice'; run.textContent = 'Run the code';
    run.onclick = () => {
      if(val() === target){ res(finishTask()); return; }
      change('focus', -5);
      if(failCheck()) return;
      render('The run failed: errors found. Fix them.');
    };
    const life = document.createElement('button'); life.className = 'choice'; life.textContent = 'Use a lifeline';
    life.onclick = () => {
      S.lifelines--; drawBars();
      if(S.lifelines <= 0){ reset(); startTask(no); render('All lifelines used. The task restarts.'); return; }
      const v = val(); let bad = -1;
      for(let i = 0; i < v.length; i++){ if(v[i] !== target[i]){ bad = i; break; } }
      const keep = bad >= 0 ? bad : v.length;
      inp.value = target.slice(0, Math.min(48, keep + 4));
      render('Lifeline: errors fixed and 4 digits filled in.');
    };
    box.appendChild(run); box.appendChild(life);
    render(); inp.focus();
  });
}

async function runTask4(){
  await card('<b>WINTER 1967</b><br>Apollo computers run on code stored in hand-woven wire memory.');
  scene('A quiet terminal room. Rows of lights, the soft clicking of machines.');
  await say('Walter', 'Type this string by hand. No copy, no paste. Typos show in red.');
  await say('Marcus', 'One wrong digit and the whole run goes sideways.');
  await ask([{ t: '"Fix it now."' }, { t: '"Press on, fix it later."' }, { t: '"Ask Frank for a hint."' }]);
  const r = await binaryPuzzle(4);
  await say('Walter', { fast: 'Not many get that on the first try.', ok: 'Fine. Check your errors next time.', slow: 'Too slow. Again.' }[verdict(r)]);
}

function errorPuzzle(no){
  return new Promise(res => {
    startTask(no);
    const parts = [
      { t: 'Panel A: 8 bolts', e: false }, { t: 'Panel B: 7 bolts', e: true },
      { t: 'Panel C: 8 bolts', e: false }, { t: 'Fuel tank: label reads OX', e: true },
      { t: 'Oxidizer tank: label reads OX', e: false }, { t: 'Feed valve 1: arrow points down', e: false },
      { t: 'Feed valve 2: arrow points up', e: true }, { t: 'Plate: Stage 2 drawn at the bottom', e: true },
      { t: 'Plate: Stage 3 drawn at the top', e: false }, { t: 'Interstage length: 10.1 m here, 1.01 m in the table', e: true },
      { t: 'Hatch seal: 8 bolts', e: false }, { t: 'Engine mount: 5 engines', e: false }
    ];
    const list = shuffle(parts), found = {};
    let count = 0;
    const box = $('choices');
    function draw(msg){
      $('speaker').textContent = 'Task 5: Fix the design errors';
      $('text').textContent = 'Rules: 8 bolts per panel. Valves point down. Stages count 1 to 3 from the bottom. Fuel tanks read FUEL. One unit per measurement. Find the 5 errors (' + count + '/5).' + (msg ? '  ' + msg : '');
      box.innerHTML = '';
      list.forEach(p => {
        const b = document.createElement('button'); b.className = 'choice'; b.textContent = p.t;
        if(found[p.t]){ b.style.borderColor = '#6fcf97'; b.style.color = '#6fcf97'; b.disabled = true; }
        b.onclick = () => pick(p); box.appendChild(b);
      });
      const h = document.createElement('button'); h.className = 'choice';
      h.textContent = 'Use a lifeline (' + S.lifelines + ' left)'; h.onclick = life; box.appendChild(h);
    }
    function pick(p){
      if(p.e){ found[p.t] = 1; count++; if(count >= 5){ res(finishTask()); return; } draw('Error found.'); return; }
      change('focus', -5);
      const f = checkFail();
      if(f === 'restart-game'){ location.reload(); return; }
      if(f === 'redo'){ Object.keys(found).forEach(k => delete found[k]); count = 0; draw('A bar fell too low. Redo the task (bars reset).'); return; }
      draw('That one is fine.');
    }
    function life(){
      S.lifelines--; drawBars();
      if(S.lifelines <= 0){ Object.keys(found).forEach(k => delete found[k]); count = 0; startTask(no); draw('All lifelines used. The task restarts.'); return; }
      const miss = list.find(p => p.e && !found[p.t]);
      found[miss.t] = 1; count++;
      if(count >= 5){ res(finishTask()); return; }
      draw('Hint: an error was marked for you.');
    }
    draw();
  });
}

async function runTask5(){
  await card('<b>WINTER 1967-68</b><br>In January, the lunar module is tested in Earth orbit without a crew.');
  scene('The drafting room, late. Only the desk lamps are on.');
  await say('Walter', 'Five errors. This one decides whether you move up.');
  await say('Dorothy', "Don't look at the big picture. Look at the small things that don't belong.");
  await say('Richard', 'Some people are better at carrying than thinking.');
  await ask([{ t: '"I\'ll do both."' }, { t: '(Ignore him.)' }, { t: '"Show me which part I got wrong."' }]);
  const r = await errorPuzzle(5);
  await say('Walter', { fast: 'All five. That is a first.', ok: 'All five, eventually.', slow: 'Too slow. Again.' }[verdict(r)]);
}

async function promotion1(){
  await card('<b>SPRING 1968</b><br>In April, Apollo 6 flies a second uncrewed Saturn V test. The ride is rough, and engineers get to work on fixes.');
  scene("Walter's office. The same gray walls, but the light seems warmer.");
  await say('Walter', 'Mid-level, effective today. Harder problems, not an easier chair.');
  await say('Walter', 'The board wants to know what to test first. Data card 1: engine problems caused 3 of the last 5 test delays. Data card 2: navigation errors caused 1 of the last 5.');
  let r;
  do {
    r = await ask([
      { t: '"Fuel system first. Engines are the biggest risk."', fx: { focus: 5 }, pick: 'fuel' },
      { t: '"Guidance computer first. Navigation is the biggest risk."', pick: 'guidance' },
      { t: '"Let me check the numbers again."', pick: 'again' }
    ]);
    if(r.pick === 'again') await say('Walter', 'Take another look: engines 3 of 5 delays, navigation 1 of 5.');
  } while(r.pick === 'again');
  S.decision1 = r.pick;
  await say('Walter', 'Good reasoning. I will take it to the board. Go home. Sleep.');
}