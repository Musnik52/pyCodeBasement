from flask import Flask, render_template, Response, request, jsonify, make_response, session, url_for, request, redirect
from flask_session import Session
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from db_repo import DbRepo
from db_config import local_session
from tables.users import Users
from tables.customers import Customers
import flask
import jwt
import json
import uuid

repo = DbRepo(local_session)
app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['SECRET_KEY'] = 'boris is king'
Session(app)

def convert_to_json(_list): #cleaning & jsoning data recieved from SQLACLCHEMY
    json_list = []
    for i in _list:
        _dict = i.__dict__
        _dict.pop('_sa_instance_state', None)
        json_list.append(_dict)
    return json_list

# localhost:5000/
@app.route("/")
def home():
    if session['remember'] == 'on': return flask.redirect(url_for('login_success'))
    return flask.redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html', try_again=False, registered_success=False)

@app.route('/my_app', methods=['GET'])
def login_success():
    return render_template('my_app.html')

@app.route('/login_process', methods=['POST'])
def hanle_login():
    form_data = request.form
    username = form_data.get('uname')
    password = form_data.get('psw')
    print(request)
    print(form_data)
    user = repo.get_by_column_value(Users, Users.username, username)
    if username == user[0].username and check_password_hash(user[0].password, password): 
        session['remember'] = request.form.get('remember')
        token = jwt.encode({'public_id': user[0].public_id, 'exp': datetime.utcnow() + timedelta(minutes=30)}, app.config['SECRET_KEY'])
        if session['remember'] == 'on': 
            session['jwt'] = token
            session['uname'] = username
            session['pwd'] = password
        return flask.redirect(url_for('login_success'))
    return render_template('login.html', try_again=True)

@app.route('/signup', methods=['GET'])
def signup_page():
    return render_template('signup.html', bad_repeat=False, user_exists=False, email_exists=False, short_password=False)

@app.route('/signup_process', methods=['POST'])
def handle_signup():
    if request.form['psw'] != request.form['psw-repeat']: return render_template('signup.html', bad_repeat=True)
    form_data = request.form
    # gets username, email and password
    username = form_data.get('uname')
    password = form_data.get('psw')
    email = form_data.get('email')
    # check if user exists
    user_username = repo.get_by_column_value(Users, Users.username, username)
    user_email = repo.get_by_column_value(Users, Users.email, email)
    if user_username: return render_template('signup.html', bad_repeat=False, user_exists=True, email_exists=False, short_password=False, status=202, mimetype='application/json')
    elif user_email: return render_template('signup.html', bad_repeat=False, user_exists=False, email_exists=True, short_password=False, status=202, mimetype='application/json')
    elif len(password) < 6: return render_template('signup.html', bad_repeat=False, user_exists=False, email_exists=False, short_password=True, status=202, mimetype='application/json')
    else:
        repo.add(Users(username=username, password=generate_password_hash(password), email=email, public_id=str(uuid.uuid4()), user_role=3 ))
        return render_template('login.html', try_again=False, registered_success=True, status=201, mimetype='application/json')

@app.route('/logout', methods=['GET'])
def logging_out():
    session['jwt'], session['remember'], session['uname'], session['pwd'] = None, None, None, None
    return flask.redirect(url_for('login'))

app.run(debug=True, port=5002)