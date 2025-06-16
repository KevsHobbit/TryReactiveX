// Desestruturação de objetos para importar funcionalidades específicas do RxJS
// Isso simplifica o uso, permitindo chamar 'fromEvent' diretamente em vez de 'rxjs.fromEvent'
const { fromEvent, interval, from, merge } = rxjs;
const { map, filter, take, debounceTime, switchMap } = rxjs.operators;
const { ajax } = rxjs.ajax;

// --- Inicialização do Monaco Editor ---
// Configura o carregador de módulos RequireJS para localizar o Monaco Editor
require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
    }
});

// Carrega o Monaco Editor e inicializa o ambiente
require(['vs/editor/editor.main'], function() {
    // Cria uma instância do editor no elemento 'editor'
    window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: `// Bem-vindo ao Try ReactiveX!
// Experimente estes exemplos ou escreva seu próprio código RxJS

// Exemplo 1: Intervalo simples
rxjs.interval(1000)
    .pipe(rxjs.operators.take(5))
    .subscribe(val => console.log(val));

// Exemplo 2: Do evento
// fromEvent(document, 'click')
//    .pipe(map(ev => ({ x: ev.clientX, y: ev.clientY })))
//    .subscribe(pos => console.log(pos));`,
        language: 'javascript', // Define a linguagem como JavaScript
        theme: 'vs-dark',     // Define o tema escuro para o editor
        automaticLayout: true // Garante que o editor se redimensione automaticamente
    });

    // --- Funcionalidade do botão 'Executar' ---
    // Cria um Observable a partir do evento de clique no botão 'run-btn'
    fromEvent(document.getElementById('run-btn'), 'click')
        .subscribe(() => {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = ''; // Limpa o conteúdo da div de saída

            // Sobrescreve o console.log para exibir a saída na nossa div
            const originalConsoleLog = console.log; // Salva a referência original
            console.log = function(message) {
                // Adiciona a mensagem à div de saída, com uma quebra de linha HTML
                outputDiv.innerHTML += `${message}<br>`;
                // Chama o console.log original para que a mensagem também apareça no console do navegador
                originalConsoleLog.apply(console, arguments);
            };

            try {
                // Executa o código obtido do editor
                eval(window.editor.getValue());
            } catch (error) {
                // Em caso de erro, exibe a mensagem de erro em vermelho na div de saída
                outputDiv.innerHTML = `<span style="color:red">Erro: ${error.message}</span>`;
            } finally {
                // Restaura o console.log original, garantindo que ele volte ao normal
                console.log = originalConsoleLog;
            }
        });

    // --- Carregador de Exemplos ---
    // Observa cliques em todos os botões com a classe 'example-btn'
    fromEvent(document.querySelectorAll('.example-btn'), 'click')
        .pipe(
            // Mapeia o evento de clique para o valor do atributo 'data-example' do botão
            map(ev => ev.target.dataset.example),
            // Utiliza switchMap para cancelar requisições anteriores se um novo clique ocorrer rapidamente
            // e para buscar o conteúdo do arquivo de exemplo correspondente
            switchMap(exampleName => {
                return fetch(`examples/${exampleName}.js`)
                    .then(response => response.text()); // Retorna o texto do arquivo como uma Promise
            })
        )
        .subscribe(code => {
            // Quando o código do exemplo é carregado, define-o no editor
            window.editor.setValue(code);
        });
});