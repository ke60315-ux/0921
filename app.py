import os
import streamlit as st
import streamlit.components.v1 as components

# 1. 頁面配置 (日系和風標題)
st.set_page_config(
    page_title="臺灣氣象風土帖 - 日系簡約・暮らしの気象手帖",
    page_icon="🍃",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. 移除 Streamlit 預設邊框與白邊，達成純淨全螢幕效果
st.markdown("""
<style>
    #MainMenu, header, footer, .stDeployButton {visibility: hidden !important; display: none !important;}
    div[data-testid="stDecoration"], div[data-testid="stToolbar"] {display: none !important;}
    div[data-testid="stSidebarCollapseButton"] {display: none !important;}
    .block-container {padding: 0 !important; margin: 0 !important; max-width: 100% !important;}
    iframe {width: 100% !important; border: none !important; background: #fdfbf7;}
</style>
""", unsafe_allow_html=True)

# 3. 讀取日系前端靜態資源
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_file(*paths):
    p = os.path.join(BASE_DIR, *paths)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            return f.read()
    return ""

html_code = read_file("index.html")
css_code = read_file("style.css")
js_code = read_file("script.js")
cache_code = read_file("data", "weather_cache.json")

# 4. 讀取 Streamlit Secrets 金鑰 (選填)
worker_url = ""
cwa_key = ""
try:
    if hasattr(st, "secrets"):
        worker_url = st.secrets.get("CLOUDFLARE_WORKER_URL", "")
        cwa_key = st.secrets.get("CWA_API_KEY", "")
except Exception:
    pass

# 5. 打包內嵌 HTML
if css_code:
    html_code = html_code.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css_code}\n</style>')

injected_js = []
if cache_code.strip():
    injected_js.append(f"const EMBEDDED_WEATHER_CACHE = {cache_code.strip()};")
if worker_url:
    injected_js.append(f'const INJECTED_WORKER_URL = "{worker_url.strip().rstrip("/")}";')
if cwa_key:
    injected_js.append(f'const INJECTED_CWA_KEY = "{cwa_key.strip()}";')
if js_code:
    injected_js.append(js_code)

if injected_js:
    js_bundle = "<script>\n" + "\n".join(injected_js) + "\n</script>"
    if '<script src="script.js"></script>' in html_code:
        html_code = html_code.replace('<script src="script.js"></script>', js_bundle)
    else:
        html_code = html_code.replace('</body>', f"{js_bundle}\n</body>")

# 6. 渲染日系和風氣象儀表板
if html_code:
    components.html(html_code, height=2250, scrolling=True)
else:
    st.error("⚠️ 未找到 index.html，請確認已將 index.html、style.css、script.js 上傳至 GitHub 倉庫根目錄。")
