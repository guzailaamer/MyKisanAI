from fastapi import HTTPException, Depends, Header
from firebase_admin import auth
from typing import Optional

async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify Firebase ID token and return user UID
    
    Args:
        authorization: Authorization header containing "Bearer <token>"
    
    Returns:
        User UID if token is valid
    
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        
        token = authorization.split("Bearer ")[1]
        
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        
        return user_id
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Dependency for protected routes
def get_current_user(user_id: str = Depends(verify_token)) -> str:
    return user_id 