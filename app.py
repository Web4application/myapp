import streamlit as st
from modules.users import login, signup, get_current_user
from modules.posts import show_feed, create_post
from modules.friends import show_friends, send_friend_request
from modules.notifications import show_notifications

# Load CSS
with open("style.css") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Page config
st.set_page_config(page_title="Brood App", layout="wide")
st.title("🐣 Brood App")

# ------------------- Authentication -------------------
current_user = get_current_user()
if not current_user:
    st.subheader("Login or Signup")
    col1, col2 = st.columns(2)
    with col1:
        login()
    with col2:
        signup()
else:
    # ------------------- Sidebar -------------------
    st.sidebar.header(f"{current_user['username']}'s Profile")
    st.sidebar.image(current_user["avatar"])
    st.sidebar.markdown(f"**Bio:** {current_user['bio']}")

    if st.sidebar.button("Logout"):
        st.session_state.pop("current_user")
        st.experimental_rerun()

    show_notifications()
    show_friends()

    # ------------------- Main Feed -------------------
    create_post()
    show_feed()
