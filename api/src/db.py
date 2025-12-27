"""
Supabase Client Instance
"""
from supabase import create_client, Client
from src.cfg import get_settings

_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
    return _supabase_client
