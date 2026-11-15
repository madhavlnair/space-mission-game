const ITEMS = {
  coffee:    { name: 'Coffee',        price: 5, mental: 15 },
  chocolate: { name: 'Chocolate',     price: 3, mental: 8 },
  cake:      { name: 'Seasonal cake', price: 6, mental: 0, seasonal: true }
};

function vending(order){
  return new Promise(res => {
    scene('The vending machine hums in the corner.');
    const box = $('choices');
    function draw(msg){
      $('speaker').textContent = 'Vending machine';
      $('text').textContent = (msg || 'Choose an item.') + (order ? '  Order: ' + order.note : '');
      box.innerHTML = '';
      Object.keys(ITEMS).forEach(k => {
        const it = ITEMS[k];
        if(it.seasonal && !(order && order.need === 'cake')) return;
        const b = document.createElement('button'); b.className = 'choice';
        b.textContent = it.name + ' - ' + it.price + ' coins';
        b.onclick = () => {
          if(S.coins < it.price){ draw('Not enough coins.'); return; }
          S.coins -= it.price; drawBars();
          if(order){
            if(k === order.need){ res({ ok: true, item: k }); }
            else { draw('Wrong item. That is not what was needed.'); }
          } else {
            change('mental', it.mental);
            draw('You enjoy the ' + it.name.toLowerCase() + '.');
          }
        };
        box.appendChild(b);
      });
      const l = document.createElement('button'); l.className = 'choice'; l.textContent = 'Leave';
      l.onclick = () => res({ ok: false }); box.appendChild(l);
    }
    draw();
  });
}

async function testVending(){
  S.coins = 20; drawBars();
  await say('TEST', 'Vending test 1: free shopping. Buy a coffee and check that mental fitness goes up.');
  await vending(null);
  S.coins = 20; drawBars();
  await say('TEST', 'Vending test 2: order mode. Frank needs the seasonal cake.');
  const r = await vending({ need: 'cake', note: "Frank's birthday cake." });
  await say('TEST', r.ok ? 'Correct item! Quest would succeed.' : 'You left without the item.');
}