from flask import Blueprint, jsonify, request
from .token_manager import token_manager

# Create Blueprint
bp = Blueprint('routes', __name__)


@bp.route('/')
def index():
    return "Fileserver is UP"


@bp.route('/token/create', methods=['GET'])
def create_token():
    token = token_manager.get_or_create_token()
    return jsonify({"token": token})


@bp.route('/token/verify/<token>', methods=['GET'])
def verify(token):
    if not token:
        return jsonify({'valid': False}), 401
    if token_manager.verify_token(token):
        return jsonify({'valid': True}), 200
    return jsonify({'valid': False}), 401


def verify_token(token):
    """Verify if a token is valid."""
    if not token:
        return False
    return token_manager.verify_token(token)
