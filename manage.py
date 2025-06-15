print("✅ manage.py is running...")

from src.configuration import setup_database

if __name__ == "__main__":  # ✅ no spaces!
    print("✅ __main__ block triggered.")
    setup_database.main()
