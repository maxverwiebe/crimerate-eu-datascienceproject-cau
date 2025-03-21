from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.routes.question5 import question5_bp
    from app.routes.question4 import question4_bp
    from app.routes.question1 import question1_bp
    from app.routes.question7 import question7_bp
    from app.routes.question2 import question2_bp
    from app.routes.question3 import question3_bp
    from app.routes.question6 import question6_bp

    app.register_blueprint(question1_bp, url_prefix='/api/question1')
    app.register_blueprint(question5_bp, url_prefix='/api/question5')
    app.register_blueprint(question4_bp, url_prefix='/api/question4')
    app.register_blueprint(question7_bp, url_prefix='/api/question7')
    app.register_blueprint(question2_bp, url_prefix='/api/question2')
    app.register_blueprint(question3_bp, url_prefix='/api/question3')
    app.register_blueprint(question6_bp, url_prefix='/api/question6')
<<<<<<< HEAD
    
=======
>>>>>>> b7147e2746e74fcc9b11a2374eaa2ff43c8747c0

    @app.route('/')
    def index():
        return "Hello World"

    return app
