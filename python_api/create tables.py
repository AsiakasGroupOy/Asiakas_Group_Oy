import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="2016", 
  database = "asiakas_database"
)

mycursor = mydb.cursor()
# Define table creation logic
# Define table creation logic
def create_projects_table():
    mycursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )
    """)

def create_contacts_table():
    mycursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            organization VARCHAR(255),
            job_title VARCHAR(100),
            phone_number VARCHAR(50) NOT NULL,
            email VARCHAR(150),
            web_link VARCHAR(255),
            summary_notes TEXT,
            additional_info TEXT,
            project_id INT,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)

def create_contact_notes_table():
   mycursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact_id INT,
            note TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(100),
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )
    """)

def create_call_events_table():
    mycursor.execute("""
        CREATE TABLE IF NOT EXISTS call_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact_id INT,
            event_type VARCHAR(100),
            event_time DATETIME,
            notes TEXT,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )
    """)


# Create all tables
create_projects_table()
create_contacts_table()
create_contact_notes_table()
create_call_events_table()

# Finalize
mydb.commit()
mycursor.close()
mydb.close()
print("All tables created")