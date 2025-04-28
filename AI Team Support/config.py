"""
Configuration settings for the Task Manager application.
"""
import os

# API Keys - Use environment variables for better security
OPENAI_API_KEY = "" #need to change the key
NOTION_TOKEN = ""

# Database IDs
NOTION_DATABASE_ID = ""
NOTION_FEEDBACK_DB_ID = ""

# Configuration settings
SIMILARITY_THRESHOLD = 0.85  # Threshold for task similarity
ENABLE_TASK_VALIDATION = True  # Set to False to bypass validation
MIN_TASK_LENGTH = 5  # Minimum length for a valid task
DAYS_THRESHOLD = 2  # Days before a task is considered stale
DEBUG_MODE = True  # Enable debug prints

# File paths
EMBEDDING_CACHE_PATH = "embedding_cache.db"  # Changed from .json to .db

# Embedding cache settings
MAX_CACHE_ENTRIES = 10000  # Maximum number of entries to keep in cache

# OpenAI model configuration
EMBEDDING_MODEL = "text-embedding-ada-002"
CHAT_MODEL = "gpt-4"
