document.addEventListener('DOMContentLoaded', function () {
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
        mode: 'xml',
        lineNumbers: true,
        tabMode: 'indent',
        lineWrapping: true
    });

    const cssEditor = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
        mode: 'css',
        lineNumbers: true,
        tabMode: 'indent',
        lineWrapping: true
    });

    const jsEditor = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
        mode: 'javascript',
        lineNumbers: true,
        tabMode: 'indent',
        lineWrapping: true
    });

    function updatePreview() {
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        const encodedHtml = btoa(html);
        const encodedCss = btoa(css);
        const encodedJs = btoa(js);

        const newUrl = `${window.location.pathname}?html=${encodedHtml}&css=${encodedCss}&js=${encodedJs}`;
        window.history.replaceState(null, '', newUrl);

        const previewFrame = document.getElementById('preview');
        const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
        preview.open();
        preview.write(`
        <style>${css}</style>
        ${html}
        <script>
            (function() {
                const console = (function(oldCons){
                    return {
                        log: function(text){
                            oldCons.log(text);
                            const consoleDiv = parent.document.getElementById('console');
                            consoleDiv.innerHTML += '<div>' + text + '</div>';
                        },
                        info: function(text){
                            oldCons.info(text);
                            const consoleDiv = parent.document.getElementById('console');
                            consoleDiv.innerHTML += '<div>' + text + '</div>';
                        },
                        warn: function(text){
                            oldCons.warn(text);
                            const consoleDiv = parent.document.getElementById('console');
                            consoleDiv.innerHTML += '<div>' + text + '</div>';
                        },
                        error: function(text){
                            oldCons.error(text);
                            const consoleDiv = parent.document.getElementById('console');
                            consoleDiv.innerHTML += '<div style="color: red;">' + text + '</div>';
                        }
                    };
                }(window.console));
                window.console = console;

                window.onerror = function(message, source, lineno, colno, error) {
                    const consoleDiv = parent.document.getElementById('console');
                    consoleDiv.innerHTML += '<div style="color: red;">Error: ' + message + ' at line ' + lineno + '</div>';
                };

                try {
                    ${js}
                } catch (e) {
                    console.error(e);
                }

                // Attach functions to the global scope
                const script = document.createElement('script');
                script.textContent = \`${js}\`;
                document.body.appendChild(script);
            })();
        <\/script>
    `);
        preview.close();
    }

    function updateConsole(message) {
        const consoleDiv = document.getElementById('console');
        consoleDiv.innerHTML += `<div>${message}</div>`;
    }

    function saveFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    function loadFile(editor, filenameElement) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.css,.js';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    editor.setValue(e.target.result);
                    filenameElement.textContent = `(${file.name})`;
                    updatePreview();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function saveAllFiles() {
        if (htmlEditor.getValue().trim()) {
            saveFile(htmlEditor.getValue(), 'index.html');
        }
        if (cssEditor.getValue().trim()) {
            saveFile(cssEditor.getValue(), 'styles.css');
        }
        if (jsEditor.getValue().trim()) {
            saveFile(jsEditor.getValue(), 'script.js');
        }
    }

    function clearAllFields() {
        htmlEditor.setValue('');
        cssEditor.setValue('');
        jsEditor.setValue('');
        updatePreview();
    }

    function closeEditor() {
        document.body.innerHTML = '<div style="background: black; width: 100%; height: 100%;"></div>';
    }

    document.getElementById('html-save').addEventListener('click', function () {
        saveFile(htmlEditor.getValue(), 'index.html');
    });

    document.getElementById('html-load').addEventListener('click', function () {
        loadFile(htmlEditor, document.getElementById('html-filename'));
    });

    document.getElementById('css-save').addEventListener('click', function () {
        saveFile(cssEditor.getValue(), 'styles.css');
    });

    document.getElementById('css-load').addEventListener('click', function () {
        loadFile(cssEditor, document.getElementById('css-filename'));
    });

    document.getElementById('js-save').addEventListener('click', function () {
        saveFile(jsEditor.getValue(), 'script.js');
    });

    document.getElementById('js-load').addEventListener('click', function () {
        loadFile(jsEditor, document.getElementById('js-filename'));
    });

    document.getElementById('save-all').addEventListener('click', saveAllFiles);
    document.getElementById('load-file').addEventListener('click', function () {
        loadFile(htmlEditor, document.getElementById('html-filename'));
    });
    document.getElementById('clear-all').addEventListener('click', clearAllFields);
    document.getElementById('close-editor').addEventListener('click', closeEditor);

    htmlEditor.on('change', updatePreview);
    cssEditor.on('change', updatePreview);
    jsEditor.on('change', updatePreview);

    updatePreview();

    window.onerror = function (message, source, lineno, colno, error) {
        updateConsole(`Error: ${message} at ${source}:${lineno}:${colno}`);
    };

    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'S') {
            event.preventDefault();
            saveAllFiles();
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (htmlEditor.hasFocus()) {
                saveFile(htmlEditor.getValue(), 'index.html');
            } else if (cssEditor.hasFocus()) {
                saveFile(cssEditor.getValue(), 'styles.css');
            } else if (jsEditor.hasFocus()) {
                saveFile(jsEditor.getValue(), 'script.js');
            }
        } else if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            clearAllFields();
        } else if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            closeEditor();
        } else if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            if (htmlEditor.hasFocus()) {
                loadFile(htmlEditor, document.getElementById('html-filename'));
            } else if (cssEditor.hasFocus()) {
                loadFile(cssEditor, document.getElementById('css-filename'));
            } else if (jsEditor.hasFocus()) {
                loadFile(jsEditor, document.getElementById('js-filename'));
            } else {
                loadFile(htmlEditor, document.getElementById('html-filename'));
            }
        }
    });
});