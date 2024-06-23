from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_questions import get_questions

app = Flask(__name__)
CORS(app)

@app.route("/api/get-interview-questions", methods=['POST'])
def process():
    data = request.json
    job_type = data.get('job type', None)
    if job_type is None:
        return jsonify({'error': 'Argument is missing'}), 400
    
    questions = get_questions(job_type)
    return jsonify(questions)

if __name__ == '__main__':
    app.run()