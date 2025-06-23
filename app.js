// Desestruturação de objetos para importar funcionalidades específicas do RxJS
// Isso simplifica o uso, permitindo chamar 'fromEvent' diretamente em vez de 'rxjs.fromEvent'
const { fromEvent, interval, from, merge, timer } = rxjs;
const { map, filter, take, debounceTime, switchMap } = rxjs.operators;
const { ajax } = rxjs.ajax;

// Armazena uma referência GLOBAL ao console.log original.
// É crucial ter isso para restaurar o console.log no início de cada nova execução.
const ORIGINAL_CONSOLE_LOG = console.log;

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

// Exemplo 1: Hello World RxJS
const { of } = rxjs;

of('Hello World!').subscribe({
  next: val => console.log(val),
  complete: () => console.log('Completo!')
});`, // Exemplo inicial para o editor
        language: 'javascript', // Define a linguagem como JavaScript
        theme: 'vs-dark',     // Define o tema escuro para o editor
        automaticLayout: true, // Garante que o editor se redimensione automaticamente
        minimap: {
            enabled: false // Define enabled como false para desativar o minimapa
        }
    });

    // Adiciona um listener para redimensionamento da janela
    window.addEventListener('resize', () => {
    if (window.editor) { // Garante que o editor existe
        window.editor.layout();
    }
    });

    // --- Funcionalidade do botão 'Executar' ---
    // Cria um Observable a partir do evento de clique no botão 'run-btn'
    // O evento é capturado pelo RxJS, sem precisar de onclick no HTML
    fromEvent(document.getElementById('run-btn'), 'click')
        .subscribe(() => {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = ''; // Limpa o conteúdo da div de saída

            // PASSO CRUCIAL 1: SEMPRE restaura o console.log ORIGINAL ANTES de sobrescrevê-lo novamente.
            console.log = ORIGINAL_CONSOLE_LOG;

            // PASSO CRUCIAL 2: Sobrescreve o console.log para exibir a saída na nossa div.
            console.log = function(message) {
                outputDiv.innerHTML += `${message}<br>`;
                ORIGINAL_CONSOLE_LOG.apply(console, arguments);
            };

            try {
                // Executa o código obtido do editor
                eval(window.editor.getValue());
            } catch (error) {
                outputDiv.innerHTML = `<span style="color:red">Erro: ${error.message}</span>`;
            }
            // PASSO CRUCIAL 3: NENHUMA RESTAURAÇÃO DO console.log AQUI!
            // Isso permite que o console.log sobrescrito permaneça ativo
            // para capturar saídas de operações assíncronas que ocorram depois.
        });

    // --- Carregador de Exemplos ---
    // Lista de exemplos de código
    const allExamples = [
        `// 1. Hello World RxJS
const { of } = rxjs;

of('Hello World!').subscribe({
  next: val => console.log(val),
  complete: () => console.log('Completo!')
});`,
        `// 2. Atraso Simples com Timer
const { timer } = rxjs;

console.log('Esperando por 2 segundos...');

// O timer emite um único valor (0) após 2000 milissegundos (2 segundos)
timer(2000).subscribe({
  next: val => console.log(\`O valor \${val} foi emitido após o atraso.\`),
  complete: () => console.log('Timer concluído!')
});

console.log('A execução síncrona continua imediatamente.');`,
        
        `// 3. Coordenadas do Clique
const { fromEvent } = rxjs;
const { map } = rxjs.operators;

fromEvent(document, 'click').pipe(
  map(ev => \`Clicado em: \${ev.clientX}, \${ev.clientY}\`)
).subscribe(console.log);`,

        `// 4. Transformação de Números (Desafio)
const { from } = rxjs;
const { map, filter } = rxjs.operators;

const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('Processando números...');

from(numeros).pipe(
  // Filtra apenas os números pares
  filter(num => num % 2 === 0),
  // Multiplica cada número par por 10
  map(par => par * 10)
).subscribe({
  next: resultado => console.log(\`Número par x 10: \${resultado}\`),
  complete: () => console.log('Processamento de números concluído!')
});

console.log('Verifique os resultados acima.');`
    ];

    // Observa cliques em todos os botões com a classe 'example-btn'
    // O evento é capturado pelo RxJS, sem precisar de onclick no HTML
    fromEvent(document.querySelectorAll('.example-btn'), 'click')
        .pipe(
            // Mapeia o evento de clique para o valor do atributo 'data-example-num' do botão
            map(ev => ev.target.dataset.exampleNum),
            // Garante que o número é válido
            filter(numStr => !isNaN(parseInt(numStr))),
            map(numStr => parseInt(numStr))
        )
        .subscribe(exampleNum => {
            // Carrega o exemplo correspondente no editor
            if (allExamples[exampleNum - 1]) {
                window.editor.setValue(allExamples[exampleNum - 1]);
            } else {
                console.error('Exemplo não encontrado para o número:', exampleNum);
            }
        });
});
