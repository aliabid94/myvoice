from flask import Flask, render_template, send_file, request
import tables
import sqlite_utils
import utils
import os

app = Flask(__name__)
tables.create_tables()

@app.route('/')
def home():
    db = sqlite_utils.Database("myvoice.db")
    TOP_SONG_COUNT = 5
    songs = db["songs"].rows_where(order_by="time_created desc",
                                             limit=TOP_SONG_COUNT)
    return render_template("index.html", songs=songs, format_duration=utils.format_duration,
        format_note=utils.format_note)

@app.route('/song/<id>')
def song(id):
    video = request.args.get("video", "karaoke")
    db = sqlite_utils.Database("myvoice.db")
    song = db["songs"].get(id)
    return render_template("song.html", video=video, song=song, format_duration=utils.format_duration)

@app.route('/song_data/<id>')
def song_data(id):
    return send_file(os.path.join("song_data", id, "data.json"))

@app.route('/search')
def search():
    db = sqlite_utils.Database("myvoice.db")
    SONG_LIMIT = 5
    return render_template("search.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/account')
def account():
    return render_template("account.html")

@app.route('/favicon.ico')
def favicon():
    return send_file("static/img/favicon.ico")

if __name__ == '__main__':
    app.run(debug=True)