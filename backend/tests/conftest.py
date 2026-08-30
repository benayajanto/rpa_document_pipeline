import os
import tempfile

# Point the app at isolated temp storage before any backend module is imported, so API
# tests never touch the real dev database/uploads in backend/instance/.
_tmp_db_fd, _tmp_db_path = tempfile.mkstemp(suffix=".db")
os.close(_tmp_db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db_path}"
os.environ["JWT_SECRET"] = "test-secret-32-bytes-minimum-len!!"
os.environ["STAGING_DIR"] = tempfile.mkdtemp(suffix="-staging")
os.environ["HISTORY_DIR"] = tempfile.mkdtemp(suffix="-history")

# Force LLM-assisted extraction "off" for tests regardless of what's in a contributor's
# local backend/.env — otherwise whether rule-based-fallback tests pass or not would
# depend on whether an LLM key happens to be configured locally. load_dotenv() (called by
# backend.app at import time) defaults to override=False, so pre-setting these here keeps
# the .env's real values from ever being loaded into this test process.
os.environ["GEMINI_API_KEY"] = ""
os.environ["OPENAI_API_KEY"] = ""
