import streamlit as st

def chat_ui():
    st.subheader("💬 Chat")
    user = st.session_state["current_user"]
    friends = st.session_state["users"][user]["friends"]
    if friends:
        friend = st.selectbox("Chat with", [""] + friends)
        msg = st.text_input("Message")
        if st.button("Send Message") and msg.strip():
            chat_log = st.session_state.setdefault("chat_log", {})
            chat_log.setdefault(friend, []).append(f"{user}: {msg}")
            st.success("Message sent!")
        if friend in st.session_state.get("chat_log", {}):
            st.markdown("**Chat History:**")
            for m in st.session_state["chat_log"][friend]:
                st.markdown(f"- {m}")
