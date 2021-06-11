def format_duration(duration):
    minutes = str(int(duration / 60))
    seconds = str(duration % 60)
    if len(seconds) == 1:
        seconds = "0" + seconds
    return minutes + ":" + seconds

def format_note(value):
    notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    octave = int(value / 12) - 1
    note = notes[value % 12]
    return  str(note) + str(octave)