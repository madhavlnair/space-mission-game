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