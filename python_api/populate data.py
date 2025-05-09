import mysql.connector
import pandas as pd
from datetime import datetime

# Load Excel data
file_path = r"D:\asiakas_group\luuricontacts.xlsx"

df = pd.read_excel(file_path, sheet_name="Contacts")

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="2016", 
  database = "asiakas_database"
)

mycursor = mydb.cursor()

# Step 1: Insert unique projects
project_name_to_id = {}
for project_name in df["call list"].dropna().unique():
    mycursor.execute("SELECT id FROM projects WHERE name = %s", (project_name,))
    result = mycursor.fetchone()
    if result:
        project_id = result[0]
    else:
        mycursor.execute("INSERT INTO projects (name) VALUES (%s)", (project_name,))
        project_id = mycursor.lastrowid
    project_name_to_id[project_name] = project_id

# Step 2: Insert contacts
for _, row in df.iterrows():
    project_name = row["call list"]
    project_id = project_name_to_id.get(project_name)

    mycursor.execute("""
        INSERT INTO contacts (
            first_name, last_name, organization, job_title, phone_number,
            email, web_link, summary_notes, additional_info, project_id
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        row.get("first name"),
        row.get("last name"),
        row.get("Organization"),
        row.get("Title"),
        str(int(row["phone number"])) if pd.notna(row.get("phone number")) else None,
        row.get("email"),
        row.get("aadditional info") or row.get("Link"),
        row.get("notes"),
        None,  # additional_info
        project_id
    ))

    contact_id = mycursor.lastrowid

    # Step 3: Add call event (optional)
    event_time_str = row.get("latest event")
    if pd.notna(event_time_str):
        try:
            event_time = pd.to_datetime(event_time_str, dayfirst=True)
            mycursor.execute("""
                INSERT INTO call_events (contact_id, event_type, event_time, notes)
                VALUES (%s, %s, %s, %s)
            """, (contact_id, "Last Contacted", event_time, None))
        except Exception as e:
            print(f"Error parsing event time: {event_time_str} -> {e}")



mydb.commit()
mycursor.close()
mydb.close()
print("Data import completed successfully.")