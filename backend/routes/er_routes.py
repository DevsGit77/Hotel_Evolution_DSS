from flask import Blueprint, request, jsonify
from engines.er_engine import EREngine

er_bp = Blueprint('er', __name__, url_prefix='/api/er')


@er_bp.route('/aggregate', methods=['POST'])
def aggregate():
    data = request.get_json(force=True)
    beliefs = data.get('beliefs', [])
    weights = data.get('weights', None)
    utilities = data.get('utilities', None)
    try:
        engine = EREngine(utilities)
        result = engine.aggregate(beliefs, weights)
        return jsonify({'success': True, 'result': result})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@er_bp.route('/validate', methods=['POST'])
def validate():
    data = request.get_json(force=True)
    beliefs = data.get('beliefs', [])
    try:
        engine = EREngine()
        engine.validate_belief(beliefs)
        return jsonify({'success': True, 'valid': True})
    except ValueError as e:
        return jsonify({'success': True, 'valid': False, 'error': str(e)})
