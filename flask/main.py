from flask import Flask, request, render_template, jsonify
from sqlalchemy import create_engine

server = 'localhost'
database = 'storejson'  # Replace with your database name
username = ''  
password = '' 

database_url = f"mssql+pyodbc://{username}:{password}@{server}/{database}?driver=ODBC Driver 17 for SQL Server"

try:
    engine = create_engine(database_url, echo=True)
    with engine.connect() as connection:
        print("Connected to SQL Server successfully")
except Exception as e:
    print("Error connecting to SQL Server:", str(e))

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


# @app.route('/receive_positions', methods=['POST'])
# def receive_positions():
#     try:
#         data = request.json
#         print("Received Data:", data)

#         divs = data.get('divs', [])
#         print("Received Divs:", divs)

#         if not divs:
#             return jsonify({"error": "No divs received"}), 400

#         inserted_data = []  # List to store inserted data

#         for key, div_data in divs.items():
#             json_data = div_data.get('json_data')
#             left = div_data.get('left')
#             top = div_data.get('top')
#     except:
#         print("Error")



# @app.route('/receive_positions', methods=['POST'])
# def receive_positions():
#         query = "INSERT INTO dbo.div_location (json_data, x, y) VALUES (asd, 1, 1"
#         connection.execute(query)

#     #     try:
#     #         with engine.connect() as connection:
#     #             for param_set in params:
#     #                 connection.execute(query, **param_set)




if __name__ == '__main__':
    app.run(debug=True)
