import json
from resume_creator import Resume_Creator

def generate_timestamped_filename(prefix="file"):
    return f"public/{prefix}"

filename = generate_timestamped_filename("CV_Vikram")
with open('src/data/data.json') as json_file:
    data = json.load(json_file)
resume = Resume_Creator(filename, data)
resume.save_resume()
