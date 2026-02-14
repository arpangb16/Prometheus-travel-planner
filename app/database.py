import duckdb
from typing import Optional
from app.config import settings


class Database:
    _instance: Optional['Database'] = None
    _connection: Optional[duckdb.DuckDBPyConnection] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self) -> duckdb.DuckDBPyConnection:
        if self._connection is None:
            self._connection = duckdb.connect(settings.database_path)
            self._initialize_schema()
        return self._connection
    
    def _initialize_schema(self):
        """Initialize database schema"""
        conn = self.connect()
        
        # Users table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Trips table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Airfare searches table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS airfare_searches (
                id INTEGER PRIMARY KEY,
                trip_id INTEGER,
                user_id INTEGER NOT NULL,
                search_type VARCHAR(50) NOT NULL, -- 'one-way', 'return', 'multi-city'
                origin VARCHAR(10) NOT NULL,
                destination VARCHAR(10) NOT NULL,
                departure_date DATE NOT NULL,
                return_date DATE,
                passengers INTEGER DEFAULT 1,
                search_results JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Multi-city segments table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS multi_city_segments (
                id INTEGER PRIMARY KEY,
                airfare_search_id INTEGER NOT NULL,
                segment_order INTEGER NOT NULL,
                origin VARCHAR(10) NOT NULL,
                destination VARCHAR(10) NOT NULL,
                departure_date DATE NOT NULL,
                FOREIGN KEY (airfare_search_id) REFERENCES airfare_searches(id)
            )
        """)
        
        conn.commit()
    
    def close(self):
        if self._connection:
            self._connection.close()
            self._connection = None


# Global database instance
db = Database()

