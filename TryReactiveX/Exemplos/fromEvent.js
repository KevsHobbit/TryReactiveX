// From Event Example
rxjs.fromEvent(document, 'click')
  .pipe(
    rxjs.operators.map(ev => ({ x: ev.clientX, y: ev.clientY })),
    rxjs.operators.throttleTime(1000)
  )
  .subscribe(pos => {
    console.log(`Clicked at: X=${pos.x}, Y=${pos.y}`);
    document.getElementById('stream-viz').innerHTML += 
      `<div class="click-marker" style="left:${pos.x}px;top:${pos.y}px"></div>`;
  });