import os
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="臺灣氣象風土帖 - 日系簡約・暮らしの気象手帖", page_icon="🍃", layout="wide", initial_sidebar_state="collapsed")
st.markdown("<style>header,footer,#MainMenu{visibility:hidden!important;display:none!important;}div[data-testid='stDecoration'],div[data-testid='stToolbar']{display:none!important;}.block-container{padding:0!important;margin:0!important;max-width:100%!important;}iframe{width:100%!important;border:none!important;background:#fdfbf7;}</style>", unsafe_allow_html=True)

d = os.path.dirname(os.path.abspath(__file__))
def get(f):
    p = os.path.join(d, f)
    return open(p, "r", encoding="utf-8").read() if os.path.exists(p) else ""

html, css, js = get("index.html"), get("style.css"), get("script.js")
if css:
    html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{css}\n</style>")
if js:
    html = html.replace('<script src="script.js"></script>', f"<script>\n{js}\n</script>")

if html:
    components.html(html, height=2250, scrolling=True)
else:
    st.error("⚠️ 找不到 index.html，請確認 index.html 與 app.py 位於同一目錄。")
