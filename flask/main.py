from flask import Flask, request, render_template, jsonify


app = Flask(__name__)

@app.route('/')
def main():
    return render_template("upload.html")

@app.route('/success', methods=['POST'])
def success():
    if request.method == 'POST':
        files = request.files.getlist('files[]')

        for file in files:
            file.save(file.filename)

        return "Files uploaded successfully"

# @app.route('/receive_positions', methods=['POST'])
# def receive_positions():
#     data = request.json
#     print("Received Positions:", data)
#     # Add your processing logic here
#     return jsonify({"message": "Data received successfully"})

if __name__ == '__main__':
    app.run(debug=True)
