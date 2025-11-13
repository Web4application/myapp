import streamlit as st
from random import choice
import time

sample_images = [
    "https://picsum.photos/400/200?random=1",
    "https://picsum.photos/400/200?random=2"
]

def create_post():
    st.subheader("📣 Create a Post")
    text = st.text_area("What's on your mind?", key="post_text")
    img_url = st.text_input("Image URL (optional)", key="post_img")
    if st.button("Post"):
        if text.strip() != "":
            post = {
                "user": st.session_state["current_user"],
                "content": text,
                "image": img_url if img_url else choice(sample_images),
                "likes": 0,
                "comments": [],
                "shares": 0,
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            st.session_state.setdefault("posts", []).insert(0, post)
            st.success("Post created!")

def show_feed():
    st.subheader("📰 News Feed")
    for idx, post in enumerate(st.session_state.get("posts", [])):
        with st.container():
            st.markdown(f"<div class='feed-card'>", unsafe_allow_html=True)
            st.markdown(f"**{post['user']}** • {post['time']}")
            st.write(post["content"])
            if post["image"]:
                st.image(post["image"])
            st.markdown(f"**Likes:** {post['likes']}  **Comments:** {len(post['comments'])}  **Shares:** {post['shares']}")
            st.markdown("</div>", unsafe_allow_html=True)
