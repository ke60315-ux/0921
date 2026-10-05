import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="臺灣氣象風土帖 - 日系簡約・暮らしの気象手帖",
    page_icon="🍃",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 隱藏 Streamlit 預設介面，讓 GitHub Pages 版本完整呈現。
st.markdown(
    """
    <style>
      header, footer, #MainMenu { visibility: hidden !important; display: none !important; }
      div[data-testid="stDecoration"], div[data-testid="stToolbar"] { display: none !important; }
      .block-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
      iframe { width: 100% !important; border: 0 !important; background: #fdfbf7; }
    </style>
    """,
    unsafe_allow_html=True,
)

# 直接嵌入已驗證正常的 GitHub Pages 正式版。
# 這樣 GIS、相對路徑、樣式與首頁功能會與 GitHub Pages 完全一致。
components.iframe(
    "https://ke60315-ux.github.io/0921/",
    height=2800,
    scrolling=True,
)
