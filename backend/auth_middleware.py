from fastapi import HTTPException, Depends, Header
from typing import Optional
import os

# Check if we're in development mode
DEVELOPMENT_MODE = os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"

async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify Firebase ID token and return user UID
    In development mode, bypasses authentication
    
    Args:
        authorization: Authorization header containing "Bearer <token>"
    
    Returns:
        User UID if token is valid
    
    Raises:
        HTTPException: If token is invalid or missing (production mode only)
    """
    
    # Development mode - skip authentication
    if DEVELOPMENT_MODE:
        print("🔧 Development mode: bypassing authentication")
        return "dev_user_123"
    
    # Production mode - require authentication
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.split("Bearer ")[1]
        
        # Verify the token with Firebase
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        
        return user_id
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Dependency for protected routes
def get_current_user(user_id: str = Depends(verify_token)) -> str:
    return user_id