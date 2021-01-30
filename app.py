#
# Copyright (c) 2021 Seth Pendergrass. See LICENSE.
#
from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

offer = None
answer = None

@app.route('/so', methods=['POST'])
def send_offer():
    global offer, answer
    offer = request.data
    answer = None
    return 'OK'

@app.route('/go', methods=['POST'])
def recv_offer():
    global offer
    if offer is not None:
        return offer
    return 'No offer available', 202

@app.route('/sa', methods=['POST'])
def send_answer():
    global offer, answer
    offer = None
    answer = request.data
    return 'OK'

@app.route('/ga', methods=['POST'])
def recv_answer():
    global answer
    if answer is not None:
        return answer
    return 'No answer available', 202

@app.route('/<path:filename>')
def get_file(filename):
    return send_file(filename)