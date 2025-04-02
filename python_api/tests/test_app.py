import unittest
from app import app

class TestAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_index(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode(), "Python API is running!")

    def test_analyze(self):
        response = self.app.post('/analyze', json={'text': 'Hello World'})
        data = response.get_json()
        self.assertEqual(data['length'], 11)
        self.assertEqual(data['uppercase_count'], 2)
        self.assertEqual(data['word_count'], 2)

if __name__ == '__main__':
    unittest.main()
