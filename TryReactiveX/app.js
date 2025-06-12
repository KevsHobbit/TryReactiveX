const { rxjs } = window;
const { fromEvent, interval, from, merge } = rxjs;
const { map, filter, take, debounceTime, switchMap } = rxjs.operators;
const { ajax } = rxjs.ajax;

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: `// Welcome to Try ReactiveX!\n// Try these examples or write your own RxJS code\n\n// Example 1: Simple interval\nrxjs.interval(1000)\n  .pipe(rxjs.operators.take(5))\n  .subscribe(val => console.log(val));\n\n// Example 2: From event\n// fromEvent(document, 'click')\n//   .pipe(map(ev => ({ x: ev.clientX, y: ev.clientY })))\n//   .subscribe(pos => console.log(pos));`,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });

    // Run button functionality
    fromEvent(document.getElementById('run-btn'), 'click')
        .subscribe(() => {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            
            // Override console.log to show in our output
            const originalConsoleLog = console.log;
            console.log = function(message) {
                outputDiv.innerHTML += `${message}<br>`;
                originalConsoleLog.apply(console, arguments);
            };
            
            try {
                // Execute the code
                eval(window.editor.getValue());
            } catch (error) {
                outputDiv.innerHTML = `<span style="color:red">Error: ${error.message}</span>`;
            } finally {
                // Restore original console.log
                console.log = originalConsoleLog;
            }
        });

    // Example loader
    fromEvent(document.querySelectorAll('.example-btn'), 'click')
        .pipe(
            map(ev => ev.target.dataset.example),
            switchMap(exampleName => {
                return fetch(`examples/${exampleName}.js`)
                    .then(response => response.text());
            })
        )
        .subscribe(code => {
            window.editor.setValue(code);
        });
});