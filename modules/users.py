import streamlit as st
import time
from random import randint

if "users" not in st.session_state:
    st.session_state["users"] = {
        "admin": {"password":"password", "avatar":"https://i.pravatar.cc/50?img=1", "bio":"Hello! I'm admin.", "friends":["user1"], "requests":[]},
        "user1": {"password":"1234", "avatar":"https://i.pravatar.cc/50?img=2", "bio":"I am user1.", "friends":["admin"], "requests":[]}
    }

def get_current_user():
    return st.session_state.get("current_user")

def login_ui():
    username = st.text_input("Username", key="login_user")
    password = st.text_input("Password", type="password", key="login_pass")
    if st.button("Login"):
        if username in st.session_state["users"] and st.session_state["users"][username]["password"] == password:
            st.session_state["current_user"] = username
            st.success(f"Logged in as {username}")
        else:
            st.error("Invalid username or password")

def signup_ui():
    username = st.text_input("New Username", key="signup_user")
    password = st.text_input("New Password", type="password", key="signup_pass")
    if st.button("Signup"):
        if username in st.session_state["users"]:
            st.error("Username already exists")
        else:
            avatar_url = f"https://i.pravatar.cc/50?img={randint(5,70)}"
            st.session_state["users"][username] = {"password": password, "avatar": avatar_url, "bio":"New user bio", "friends":[], "requests":[]}
            st.success("Account created! Please log in.")

def logout():
    st.session_state.pop("current_user", None)
