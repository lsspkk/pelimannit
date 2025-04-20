from flask import Flask
from modules.routes import bp as routes_bp

app = Flask(__name__)

# Register the blueprint without a prefix since Apache handles /fileserver
app.register_blueprint(routes_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
