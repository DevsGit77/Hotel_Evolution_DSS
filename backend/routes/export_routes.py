import csv
import io
from flask import Blueprint, request, jsonify, make_response

export_bp = Blueprint('export', __name__, url_prefix='/api/export')


@export_bp.route('/csv', methods=['POST'])
def export_csv():
    data = request.get_json(force=True)
    rows = data.get('rows', [])
    filename = data.get('filename', 'export.csv')
    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    resp = make_response(output.getvalue())
    resp.headers['Content-Type'] = 'text/csv'
    resp.headers['Content-Disposition'] = f'attachment; filename={filename}'
    return resp
