from flask import Blueprint, request, jsonify
from engines.brb_engine import BRBEngine

brb_bp = Blueprint('brb', __name__, url_prefix='/api/brb')


@brb_bp.route('/infer', methods=['POST'])
def infer():
    data = request.get_json(force=True)
    observations = data.get('observations', [])
    rules = data.get('rules', [])
    utilities = data.get('utilities', None)
    method = data.get('method', 'analytical_er')
    try:
        engine = BRBEngine(utilities)
        result = engine.infer(observations, rules, method)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
