from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.routes.question5 import question5_bp
    from app.routes.question4 import question4_bp

    app.register_blueprint(question5_bp, url_prefix='/api/question5')
    app.register_blueprint(question4_bp, url_prefix='/api/question4')

    @app.route('/')
    def index():
        return "Hello World"

    return app
