from flask import Flask, render_template, request, redirect, url_for
import base64

app = Flask(__name__)

@app.route('/')
def index():
    html = request.args.get('html', '')
    css = request.args.get('css', '')
    js = request.args.get('js', '')

    try:
        if html:
            html = base64.b64decode(html).decode('utf-8')
        else:
            html = '''
<h1 class="revertable">Hello, World!</h1>
<button onClick="button()">press me </button>
'''
    except (base64.binascii.Error, UnicodeDecodeError):
        html = '''
<h1 class="revertable">Hello, World!</h1>
<button onClick="button()">press me </button>
'''

    try:
        if css:
            css = base64.b64decode(css).decode('utf-8')
        else:
            css = 'h1 { color: blue; }'
    except (base64.binascii.Error, UnicodeDecodeError):
        css = 'h1 { color: blue; }'

    try:
        if js:
            js = base64.b64decode(js).decode('utf-8')
        else:
            js = '''
function button() {
    const element = document.querySelector('h1.revertable');
    if (element) {
    const text = element.textContent;
    element.textContent = text.split('').reverse().join('');
    }
    console.log("reverted!");
}
'''
    except (base64.binascii.Error, UnicodeDecodeError):
        js = '''
function button() {
    const element = document.querySelector('h1.revertable');
    if (element) {
    const text = element.textContent;
    element.textContent = text.split('').reverse().join('');
    }
    console.log("reverted!");
}
'''

    return render_template('index.html', html=html, css=css, js=js)

if __name__ == '__main__':
    app.run(debug=True)