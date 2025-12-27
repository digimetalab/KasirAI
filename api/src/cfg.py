"""
KasirAI Configuration Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    
    # Midtrans
    midtrans_server_key: str = ""
    midtrans_client_key: str = ""
    midtrans_is_production: bool = False
    
    # AI
    groq_api_key: str = ""
    
    # Telegram
    telegram_bot_token: str = ""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Business defaults
    default_tax_rate: float = 11.0  # PPN 11%
    default_points_per_amount: int = 10000  # Rp 10.000 = 1 point
    default_point_value: int = 100  # 1 point = Rp 100
    
    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
