from flask import Flask
from flask_restful import Api
from resources import IpAddressSave
from config import POSTGRES

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True # To allow flask

api = Api(app)

@app.before_first_request
def create_tables():
    """
    This lines of code will make sure that before the first
    call to the database, the `database structure` is being
    created automatically.
    :return:
    """
    from database_initialized import db
    with app.app_context():
        db.init_app(app)
        db.create_all()

api.add_resource(IpAddressSave, '/api/saveip')

if __name__ == '__main__':
    app.run()
