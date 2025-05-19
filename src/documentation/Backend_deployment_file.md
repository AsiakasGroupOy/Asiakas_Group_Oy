VoIP Backend Deployment & Frontend Integration Instructions
✅ Purpose
This document outlines how to:
•	Set up and run the Flask backend for the VoIP project
•	Automatically create the database and tables
•	Help the frontend team integrate with the API
•	Export and restore existing database data using MySQL Workbench
________________________________________
🖥️ Backend Developer: Local Setup & Testing
1. Clone or navigate to the project root:
cd asiakas_backend/
2. Create and activate a virtual environment:
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
3. Install dependencies:
pip install -r requirements.txt
4. Create a .env file (in the root folder):
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
DB_NAME=voip_db
5. Create the database and tables:
python setup.py
Expected output:
✅ Database `voip_db` created or already exists.
✅ All tables created successfully.
6. Run the Flask server:
python app.py
Visit: http://localhost:5000
________________________________________
🌐 Frontend Developer: API Integration
Base API URL
http://localhost:5000/api/
Sample Endpoints
•	GET all contacts:
http://localhost:5000/api/contacts/all```
•	POST new call log:
http://localhost:5000/api/calllogs/```
•	DELETE multiple:
http://localhost:5000/api/calllogs/bulk-delete```
Headers (for POST/PUT requests):
{
  "Content-Type": "application/json"
}
Sample POST Payload
{
  "contact_id": 1,
  "status_id": 2,
  "call_timestamp": "2025-05-12 14:30:00",
  "call_notes": "Follow-up scheduled"
}
________________________________________
🧪 How to Verify Table Auto-Creation (Locally)( If needed for testing  purposes only)
1.	In MySQL CLI or GUI (like Workbench), drop the database:
DROP DATABASE voip_db;
2.	Re-run:
python setup.py
3.	Check that the database and all required tables (Contact, CallLog, etc.) are recreated automatically.
________________________________________
💾 How to Backup and Restore Data (MySQL Workbench)
🔹 Export (Backup) Existing Data
1.	Open MySQL Workbench
2.	Go to Server > Data Export
3.	Select the voip_db database
4.	Choose Export to Self-Contained File (e.g. voip_db_backup.sql)
5.	Click Start Export
🔹 Restore Data From Backup
1.	Open MySQL Workbench
2.	Go to Server > Data Import
3.	Select Import from Self-Contained File and choose your .sql backup
4.	Select or create the voip_db database
5.	Click Start Import
6.	✅ Confirm restored data by refreshing the Schemas panel and browsing tables.
