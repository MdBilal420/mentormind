from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase URL and key from environment variables
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

# Create Supabase client
supabase = create_client(supabase_url, supabase_key)

def get_supabase_client():
    """
    Returns the Supabase client instance.
    """
    return supabase 