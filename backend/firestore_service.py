from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import Dict, Any, Optional
import os

# Debug prints
# print("SERVICE ACCOUNT PATH:", os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"))
# print("FILE EXISTS:", os.path.exists(os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") or ""))

class FirestoreService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # Use service account key if available, otherwise use default credentials
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # For development, you can use default credentials
                firebase_admin.initialize_app()
        
        self.db = firestore.client()
    
    def store_conversation(self, user_id: str, tool_name: str, metadata: Dict[str, Any]) -> str:
        """
        Store conversation metadata in Firestore
        
        Args:
            user_id: Firebase Auth UID
            tool_name: Name of the tool (crop_diagnosis, market_advisory, etc.)
            metadata: Dictionary containing conversation metadata
        
        Returns:
            Document ID of the stored conversation
        """
        try:
            # Create conversation document
            conversation_data = {
                "user_id": user_id,
                "tool_name": tool_name,
                "timestamp": datetime.utcnow(),
                "metadata": metadata,
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            # Add to conversations collection
            doc_ref = self.db.collection("conversations").add(conversation_data)
            
            # Also add to user-specific collection for easier querying
            user_conversation_data = {
                "tool_name": tool_name,
                "timestamp": datetime.utcnow(),
                "metadata": metadata,
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            self.db.collection("users").document(user_id).collection("conversations").add(user_conversation_data)
            
            return doc_ref[1].id
            
        except Exception as e:
            print(f"Error storing conversation: {e}")
            raise e
    
    def get_user_conversations(self, user_id: str, limit: int = 50) -> list:
        """
        Get recent conversations for a user
        
        Args:
            user_id: Firebase Auth UID
            limit: Maximum number of conversations to return
        
        Returns:
            List of conversation documents
        """
        try:
            conversations = []
            docs = self.db.collection("users").document(user_id).collection("conversations").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
            
            for doc in docs:
                conversation = doc.to_dict()
                conversation["id"] = doc.id
                conversations.append(conversation)
            
            return conversations
            
        except Exception as e:
            print(f"Error getting user conversations: {e}")
            return []
    
    def get_conversations_by_tool(self, user_id: str, tool_name: str, limit: int = 20) -> list:
        """
        Get conversations for a specific tool
        
        Args:
            user_id: Firebase Auth UID
            tool_name: Name of the tool
            limit: Maximum number of conversations to return
        
        Returns:
            List of conversation documents
        """
        try:
            conversations = []
            docs = self.db.collection("users").document(user_id).collection("conversations").where("tool_name", "==", tool_name).order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
            
            for doc in docs:
                conversation = doc.to_dict()
                conversation["id"] = doc.id
                conversations.append(conversation)
            
            return conversations
            
        except Exception as e:
            print(f"Error getting tool conversations: {e}")
            return []

# Global instance
firestore_service = FirestoreService() 