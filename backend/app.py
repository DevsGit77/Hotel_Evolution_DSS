import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS

from config import FRONTEND_DIR, PORT, DEBUG
from routes.er_routes import er_bp
from routes.brb_routes import brb_bp
from routes.combined_routes import combined_bp
from routes.ranking_routes import ranking_bp
from routes.sensitivity_routes import sensitivity_bp
from routes.data_routes import data_bp
from routes.export_routes import export_bp

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

app.register_blueprint(er_bp)
app.register_blueprint(brb_bp)
app.register_blueprint(combined_bp)
app.register_blueprint(ranking_bp)
app.register_blueprint(sensitivity_bp)
app.register_blueprint(data_bp)
app.register_blueprint(export_bp)


@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.errorhandler(404)
def not_found(e):
    return {'error': 'Not found'}, 404


@app.errorhandler(500)
def server_error(e):
    return {'error': 'Internal server error'}, 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
