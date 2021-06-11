import sqlite_utils
import os
import json
from random import randint, random

SONGS_TO_SIMULATE = list(range(1,6))

db = sqlite_utils.Database("myvoice.db")
songs = db["songs"].rows_where(f"id IN ({','.join([str(_id) for _id in SONGS_TO_SIMULATE])})")

for song in songs:
    if not os.path.exists(f"song_data/{song['id']}"):
        os.mkdir(f"song_data/{song['id']}")
    pitch_volume_sets = []
    note = randint(60, 65)
    volume = random()
    for i in range(song["duration"] * song["sample_rate"]):
        if randint(1, 40) == 1:
          note += randint(-3, 3)        
        volume += random() / 10 - random() / 15
        if volume < 0:
            volume = 0
        if volume > 1:
            volume = 1;
        volume = round(volume,2)
        if randint(1, 20) == 1:
            volume = 0
        pitch_volume_sets.append([note, volume])
    with open(f"song_data/{song['id']}/data.json", "w") as datafile:
        json.dump(pitch_volume_sets, datafile)