import streamlit as st
from modules.users import login_ui, signup_ui, get_current_user, logout
from modules.posts import create_post_ui, show_feed_ui
from modules.friends import show_friends_ui, send_friend_request_ui
from modules.notifications import show_notifications_ui
from modules.chat import chat_ui
from modules.events import events_ui

# Load CSS
with open("style.css") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.set_page_config(page_title="Brood App", layout="wide")
st.title("🐣 Brood App")

# ---------------- Authentication ----------------
current_user = get_current_user()
if not current_user:
    st.subheader("Login or Signup")
    col1, col2 = st.columns(2)
    with col1:
        login_ui()
    with col2:
        signup_ui()
else:
    # ---------------- Sidebar ----------------
    st.sidebar.header(f"{current_user['username']}'s Profile")
    st.sidebar.image(current_user["avatar"])
    st.sidebar.markdown(f"**Bio:** {current_user['bio']}")
    if st.sidebar.button("Logout"):
        logout()
        st.experimental_rerun()

    # Notifications & Friends
    show_notifications_ui()
    show_friends_ui()
    send_friend_request_ui()

    # ---------------- Main Feed ----------------
    create_post_ui()
    show_feed_ui()

    # ---------------- Chat & Events ----------------
    chat_ui()
    events_ui()
