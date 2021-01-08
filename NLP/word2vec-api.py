#Flask API for server
from flask import Flask, request, jsonify
from flask_restful  import Resource, Api, reqparse

#Gensim for NLP
import gensim.downloader as modelDownloader

# Import and download stopwords from NLTK.
from nltk.corpus import stopwords
from nltk import download
download('stopwords')  # Download stopwords list.
stop_words = stopwords.words('english')

import argparse
import base64
import sys



def preprocess(sentence):
    return [w for w in sentence.lower().split() if w not in stop_words]

parser = reqparse.RequestParser()

class N_Similarity(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('ws1', type=str, required=True, help="Word set 1 cannot be blank!", action='append')
        parser.add_argument('ws2', type=str, required=True, help="Word set 2 cannot be blank!", action='append')
        args = parser.parse_args()
        return model.n_similarity(filter_words(args['ws1']),filter_words(args['ws2']))


class Similarity(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('w1', type=str, required=True, help="Word 1 cannot be blank!")
        parser.add_argument('w2', type=str, required=True, help="Word 2 cannot be blank!")
        args = parser.parse_args()
        return model.similarity(args['w1'], args['w2'])

class WMDistance(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('s1', type=str, required=True, help="Sentence 1 cannot be blank!")
        parser.add_argument('s2', type=str, required=True, help="Sentence 2 cannot be blank!")
        args = parser.parse_args()
        sentence1 = preprocess(args['s1'])
        sentence2 = preprocess(args['s2'])
        return model.wmdistance(sentence1, sentence2)

class Model(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('word', type=str, required=True, help="word to query.")
        args = parser.parse_args()
        try:
            res = model[args['word']]
            res = base64.b64encode(res)
            return res
        except(Exception, e):
            print(e)
            return

app = Flask(__name__)
api = Api(app)

@app.errorhandler(404)
def pageNotFound(error):
    return "page not found"

@app.errorhandler(500)
def raiseError(error):
    return error

if __name__ == '__main__':
    global model

    #----------- Parsing Arguments ---------------
    p = argparse.ArgumentParser()
    p.add_argument("--model", help="Path to the trained model")
    p.add_argument("--binary", help="Specifies the loaded model is binary")
    p.add_argument("--host", help="Host name (default: localhost)")
    p.add_argument("--port", help="Port (default: 5000)")
    p.add_argument("--path", help="Path (default: /word2vec)")
    args = p.parse_args()

    model_path = args.model if args.model else "./model.bin.gz"
    binary = True if args.binary else False
    host = args.host if args.host else "localhost"
    path = args.path if args.path else "/word2vec"
    port = int(args.port) if args.port else 5000
    if not args.model:
        print("Usage: word2vec-apy.py --model path/to/the/model [--host host --port 1234]")
    model = modelDownloader.load("word2vec-google-news-300")
    model.init_sims(replace=True)
    api.add_resource(N_Similarity, path+'/n_similarity')
    api.add_resource(Similarity, path+'/similarity')
    api.add_resource(WMDistance, path+'/wmd')
    app.run(host=host, port=port)