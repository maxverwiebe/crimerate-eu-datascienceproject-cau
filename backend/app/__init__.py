from flask import Flask

def create_app():
    app = Flask(__name__)

    from app.routes.question5 import question5_bp

    app.register_blueprint(question5_bp, url_prefix='/api/question5')

    @app.route('/')
    def index():
        return "Hello World"

    return app
