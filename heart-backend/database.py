import os
import sqlite3
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient

# MongoDB Config
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://chatbuddy:gSuUH2G*4whp8P4@cluster0.92nk5.mongodb.net/MERN-CHATAPP?retryWrites=true&w=majority&appName=Cluster0')

class DatabaseLayer:
    def __init__(self):
        self.db_type = 'sqlite'  # Default fallback
        self.mongo_client = None
        self.mongo_db = None
        self.users_collection = None
        self.sqlite_path = os.path.join(os.path.dirname(__file__), 'heart_disease.db')
        
        self._initialize_db()

    def _initialize_db(self):
        # 1. Try to connect to MongoDB
        try:
            print("🔌 Attempting to connect to MongoDB...")
            self.mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            # Ping to trigger connection error if server is offline
            self.mongo_client.admin.command('ping')
            self.mongo_db = self.mongo_client['heart_disease_app']
            self.users_collection = self.mongo_db['users']
            self.db_type = 'mongodb'
            print("✅ Database connected successfully to MongoDB Atlas!")
        except Exception as e:
            print(f"⚠️ MongoDB connection failed: {e}")
            print("🔄 Falling back to zero-configuration SQLite local database...")
            self.db_type = 'sqlite'
            self._initialize_sqlite()

    def _initialize_sqlite(self):
        conn = None
        try:
            conn = sqlite3.connect(self.sqlite_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            print(f"✅ Local SQLite database initialized successfully at: {self.sqlite_path}")
        except Exception as e:
            print(f"❌ Failed to initialize SQLite database: {e}")
        finally:
            if conn:
                conn.close()

    def _get_sqlite_connection(self):
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        return conn

    def register_user(self, username, password):
        if not username or not password:
            return {"error": "Username and password are required"}, 400

        hashed_password = generate_password_hash(password)

        if self.db_type == 'mongodb':
            try:
                if self.users_collection.find_one({"username": username}):
                    return {"error": "User already exists"}, 400
                
                self.users_collection.insert_one({
                    "username": username,
                    "password": hashed_password,
                    "created_at": datetime.datetime.utcnow()
                })
                return {"message": "User registered successfully"}, 201
            except Exception as e:
                return {"error": f"Database error: {str(e)}"}, 500
        else:
            conn = None
            try:
                conn = self._get_sqlite_connection()
                cursor = conn.cursor()
                # Check if user exists
                cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                if cursor.fetchone():
                    return {"error": "User already exists"}, 400
                
                cursor.execute(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    (username, hashed_password)
                )
                conn.commit()
                return {"message": "User registered successfully"}, 201
            except Exception as e:
                return {"error": f"Database error: {str(e)}"}, 500
            finally:
                if conn:
                    conn.close()

    def verify_user(self, username, password):
        if not username or not password:
            return False

        if self.db_type == 'mongodb':
            try:
                user = self.users_collection.find_one({"username": username})
                if user and check_password_hash(user['password'], password):
                    return True
                return False
            except Exception:
                return False
        else:
            conn = None
            try:
                conn = self._get_sqlite_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
                row = cursor.fetchone()
                if row and check_password_hash(row['password'], password):
                    return True
                return False
            except Exception:
                return False
            finally:
                if conn:
                    conn.close()

db_layer = DatabaseLayer()
