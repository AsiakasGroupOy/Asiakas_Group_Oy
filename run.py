# run.py

from src.voip_backend.app import app

if __name__ == "__main__":
  #  with app.app_context():
       # print("\n🔍 Registered Flask routes:")
       # for rule in app.url_map.iter_rules():
         #   print(f"{rule.methods} -> {rule.rule}")

    app.run(debug=True)

