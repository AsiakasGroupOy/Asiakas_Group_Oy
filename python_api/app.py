from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "Python API is running!"

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')

    # Mock analysis (Replace with actual analysis logic)
    result = {
        "length": len(text),
        "uppercase_count": sum(1 for c in text if c.isupper()),
        "word_count": len(text.split())
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
