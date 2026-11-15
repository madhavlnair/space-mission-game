const S = { mental:70, focus:70, friend:{dorothy:50,frank:50,ben:50}, respect:{marcus:50,richard:50},
  coins:0, points:0, lifelines:3, vulnerable:false, taskNo:0, taskStart:0, timerId:null };
const $ = id => document.getElementById(id);
const clamp = v => Math.max(0, Math.min(100, v));

function drawBars(){
  $('bar-mental').style.width = S.mental + '%';
  $('bar-focus').style.width = S.focus + '%';
  $('lifelines').textContent = 'Lifelines: ' + S.lifelines;
  $('coins').textContent = 'Coins: ' + S.coins;
}
function chip(label, d){
  if(!d) return;
  const c = document.createElement('div');
  c.className = 'chip ' + (d > 0 ? 'up' : 'down');
  c.textContent = label + ' ' + (d > 0 ? '+' : '') + d;
  $('chips').appendChild(c);
  setTimeout(() => c.remove(), 1800);
}
function change(key, d){
  if(key === 'mental'){
    const b = S.mental; S.mental = clamp(S.mental + d); chip('Mental', S.mental - b);
    if(b >= 50 && S.mental < 50) change('focus', -10);
  } else if(key === 'focus'){
    const b = S.focus; S.focus = clamp(S.focus + d); chip('Focus', S.focus - b);
  } else if(key in S.friend){ S.friend[key] = clamp(S.friend[key] + d); }
  else if(key in S.respect){ S.respect[key] = clamp(S.respect[key] + d); }
  drawBars();
}
function applyFx(fx){ for(const k in (fx || {})) change(k, fx[k]); }
function shuffle(a){
  a = a.slice();
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function say(who, text){
  return new Promise(res => {
    $('speaker').textContent = who || ''; $('text').textContent = text; $('choices').innerHTML = '';
    const b = document.createElement('button'); b.className = 'choice'; b.textContent = 'Continue';
    b.onclick = () => res(); $('choices').appendChild(b);
  });
}
function ask(options){
  return new Promise(res => {
    $('speaker').textContent = 'Eli says:'; $('text').textContent = 'Choose a reply.';
    const box = $('choices'); box.innerHTML = '';
    shuffle(options).forEach(o => {
      const b = document.createElement('button'); b.className = 'choice'; b.textContent = o.t;
      b.onclick = () => { applyFx(o.fx); res(o); }; box.appendChild(b);
    });
  });
}
function card(html){
  return new Promise(res => {
    const c = $('card');
    c.innerHTML = '<div>' + html + '<br><br><button class="choice" id="cardok">Continue</button></div>';
    c.classList.add('show');
    $('cardok').onclick = () => { c.classList.remove('show'); res(); };
  });
}
function scene(text){ $('scene').textContent = text; }

function fmt(s){ return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function elapsed(){ return Math.floor((Date.now() - S.taskStart) / 1000); }
function startTask(no){
  S.taskNo = no; S.lifelines = 3; S.taskStart = Date.now(); drawBars();
  clearInterval(S.timerId);
  S.timerId = setInterval(() => {
    const left = 300 - elapsed();
    $('timer').textContent = left >= 0 ? fmt(left) : '-' + fmt(-left);
  }, 250);
}
function finishTask(){
  clearInterval(S.timerId);
  const t = elapsed(), used = 3 - S.lifelines, pts = Math.max(1, 10 - 2 * used);
  const F = Object.keys(S.friend), R = Object.keys(S.respect);
  if(t < 180){ F.forEach(k => change(k, 10)); R.forEach(k => change(k, 10)); }
  else if(t <= 300){ F.forEach(k => change(k, 5)); }
  else { F.forEach(k => change(k, -5)); R.forEach(k => change(k, -5)); change('mental', -10); }
  S.points += pts; S.coins += 10; drawBars();
  return { t, pts };
}
function checkFail(){
  const early = S.taskNo <= 5;
  const failed = early ? (S.mental <= 30 || S.focus <= 30) : (S.mental <= 0 || S.focus <= 0);
  if(!failed) return null;
  if(early){
    if(S.vulnerable) return 'restart-game';
    S.vulnerable = true; S.mental = 40; S.focus = 40;
  } else {
    Object.keys(S.friend).forEach(k => change(k, -5)); Object.keys(S.respect).forEach(k => change(k, -5));
    S.mental = Math.max(S.mental, 40); S.focus = Math.max(S.focus, 40);
  }
  drawBars(); startTask(S.taskNo); return 'redo';
}

function testTask(){
  return new Promise(res => {
    $('speaker').textContent = 'ENGINE TEST'; $('text').textContent = 'Press the buttons and watch the bars, timer and coins.';
    const box = $('choices'); box.innerHTML = '';
    const add = (label, fn) => { const b = document.createElement('button'); b.className = 'choice'; b.textContent = label; b.onclick = fn; box.appendChild(b); };
    const after = () => {
      const f = checkFail();
      if(f === 'restart-game'){ location.reload(); }
      else if(f === 'redo'){ $('text').textContent = 'A bar fell too low. Redo the task (bars reset to 40, you are now vulnerable).'; }
    };
    add('Wrong move (-5 concentration)', () => { change('focus', -5); after(); });
    add('Unfixed typo (-2 mental fitness)', () => { change('mental', -2); after(); });
    add('Use a lifeline', () => {
      S.lifelines--; drawBars();
      if(S.lifelines <= 0){ $('text').textContent = 'All 3 lifelines used. The task restarts.'; startTask(S.taskNo); }
    });
    add('Finish task now', () => {
      const r = finishTask();
      $('text').textContent = 'Finished in ' + r.t + 's. Task score: ' + r.pts + '. Total points: ' + S.points +
        '. Friendship ' + JSON.stringify(S.friend) + ' Respect ' + JSON.stringify(S.respect);
      box.innerHTML = ''; res();
    });
  });
}

async function testRun(){
  await card('<b>SPRING 1967</b><br>In January, the Apollo 1 crew was lost in a ground test. The programme pushes on.');
  scene('A gray hallway. A corkboard with three notices.');
  await say('Prescott', "Mr. Washington. The chairman's office doesn't usually meet juniors. I made an exception.");
  const r = await ask([
    { t: '"Yes, sir. I\'ll introduce myself to everyone."', fx: { focus: 5 }, reply: 'Good.' },
    { t: '"Thank you for the chance, sir."', fx: { mental: -5 }, reply: "Don't thank me yet." },
    { t: '"I won\'t let anyone down, sir."', fx: { dorothy: 5 }, reply: 'Hm. We will see.' }
  ]);
  await say('Prescott', r.reply);
  scene('TEST TASK: use the buttons below.');
  startTask(1);
  await testTask();
}
window.onload = () => { drawBars(); testRun(); };