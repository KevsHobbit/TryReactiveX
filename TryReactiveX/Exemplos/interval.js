// Interval Example
rxjs.interval(1000)
  .pipe(
    rxjs.operators.take(5),
    rxjs.operators.map(val => val * 2)
  )
  .subscribe({
    next: val => console.log(`Value: ${val}`),
    complete: () => console.log('Complete!')
  });