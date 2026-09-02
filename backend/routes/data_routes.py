from flask import Blueprint, jsonify
from data.survey_data import SURVEY_DATA, GRADES, GRADE_KEYS
from data.hotels_data import RANGAMATI_HOTELS

data_bp = Blueprint('data', __name__, url_prefix='/api/data')


@data_bp.route('/survey', methods=['GET'])
def get_survey():
    return jsonify({
        'success': True,
        'data': SURVEY_DATA,
        'grades': GRADES,
        'grade_keys': GRADE_KEYS
    })


@data_bp.route('/hotels', methods=['GET'])
def get_hotels():
    return jsonify({
        'success': True,
        'hotels': RANGAMATI_HOTELS,
        'location': 'Rangamati Sadar, Rangamati Hill District, Bangladesh'
    })
