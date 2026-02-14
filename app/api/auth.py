from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models import UserCreate, UserResponse, Token
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user
)
from app.config import settings
from app.database import db
import duckdb

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    conn = db.connect()
    
    # Check if username exists
    existing_user = conn.execute(
        "SELECT id FROM users WHERE username = ?",
        [user_data.username]
    ).fetchone()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        [user_data.email]
    ).fetchone()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    
    # DuckDB doesn't support RETURNING, so we need to insert then select
    conn.execute(
        """
        INSERT INTO users (username, email, hashed_password)
        VALUES (?, ?, ?)
        """,
        [user_data.username, user_data.email, hashed_password]
    )
    
    conn.commit()
    
    # Get the created user
    result = conn.execute(
        "SELECT id, username, email, created_at FROM users WHERE username = ?",
        [user_data.username]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return {
        "id": result[0],
        "username": result[1],
        "email": result[2],
        "created_at": result[3] if result[3] else None
    }


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    conn = db.connect()
    result = conn.execute(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        [current_user["id"]]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": result[0],
        "username": result[1],
        "email": result[2],
        "created_at": result[3] if result[3] else None
    }

