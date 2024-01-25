from flask import Flask, request, render_template, jsonify


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # assuming your HTML file is in the templates folder

@app.route('/receive_positions', methods=['POST'])
def receive_positions():
    data = request.json
    print("Received Positions:", data)
    # Add your processing logic here
    return jsonify({"message": "Data received successfully"})

if __name__ == '__main__':
    app.run(debug=True)
