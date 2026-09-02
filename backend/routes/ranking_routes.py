from flask import Blueprint, request, jsonify
from engines.ranking_engine import RankingEngine
from data.survey_data import SURVEY_DATA

ranking_bp = Blueprint('ranking', __name__, url_prefix='/api/ranking')


@ranking_bp.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json(force=True)
    hotels = data.get('hotels', [])
    rules = data.get('rules', [])
    group_weights = data.get('group_weights', {'w1': 0.4, 'w2': 0.35, 'w3': 0.25})
    sub_weights = data.get('sub_weights', {})
    survey_data = data.get('survey_data', SURVEY_DATA)
    try:
        engine = RankingEngine()
        result = engine.rank_hotels(survey_data, hotels, group_weights, sub_weights, rules)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
