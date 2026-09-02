from flask import Blueprint, request, jsonify
from engines.combined_engine import CombinedEngine
from data.survey_data import SURVEY_DATA

combined_bp = Blueprint('combined', __name__, url_prefix='/api/combined')


@combined_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(force=True)
    group_weights = data.get('group_weights', {})
    sub_weights = data.get('sub_weights', {})
    beliefs_data = data.get('beliefs_data', None)
    groups = data.get('groups', SURVEY_DATA)
    brb_rules = data.get('brb_rules', None)
    final_method = data.get('final_method', 'er')
    try:
        engine = CombinedEngine()
        result = engine.analyze(groups, group_weights, sub_weights, beliefs_data,
                                brb_rules, final_method)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
