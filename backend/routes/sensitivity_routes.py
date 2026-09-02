from flask import Blueprint, request, jsonify
from engines.sensitivity_engine import SensitivityEngine
from data.survey_data import SURVEY_DATA

sensitivity_bp = Blueprint('sensitivity', __name__, url_prefix='/api/sensitivity')


@sensitivity_bp.route('/sweep', methods=['POST'])
def sweep():
    data = request.get_json(force=True)
    group_weights = data.get('group_weights', {})
    sub_weights = data.get('sub_weights', {})
    beliefs_data = data.get('beliefs_data', None)
    groups = data.get('groups', SURVEY_DATA)
    step = data.get('step', 0.05)
    try:
        engine = SensitivityEngine()
        result = engine.systematic_sweep(groups, group_weights, sub_weights, beliefs_data, step)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@sensitivity_bp.route('/montecarlo', methods=['POST'])
def montecarlo():
    data = request.get_json(force=True)
    group_weights = data.get('group_weights', {})
    sub_weights = data.get('sub_weights', {})
    beliefs_data = data.get('beliefs_data', None)
    groups = data.get('groups', SURVEY_DATA)
    n_iterations = data.get('iterations', 5000)
    try:
        engine = SensitivityEngine()
        result = engine.monte_carlo(groups, group_weights, sub_weights, beliefs_data, n_iterations)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
