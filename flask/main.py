from flask import Flask, request, render_template, jsonify
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Replace the placeholder values with your database connection details
database_url = "postgresql://username:password@localhost:5432/your_database"
engine = create_engine(database_url)

Base = declarative_base()

# Define the Position model
class Position(Base):
    __tablename__ = 'positions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String)
    left = Column(String)
    top = Column(String)

# Create the positions table in the database
Base.metadata.create_all(engine)

# Function to export positions to SQL
def exportPositionsToPython():
    positions = exportPositionsToFile()

    # Create a session to interact with the database
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Insert positions into the positions table
        for key, position in positions.items():
            new_position = Position(key=key, left=position['left'], top=position['top'])
            session.add(new_position)

        # Commit the changes to the database
        session.commit()
        print("Positions exported to SQL successfully")
    except Exception as e:
        session.rollback()
        print("Error exporting positions to SQL:", str(e))
    finally:
        session.close()

# Call the export function
exportPositionsToPython()


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
