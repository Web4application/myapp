import streamlit as st

def show_friends_ui():
    user = st.session_state["users"][st.session_state["current_user"]]
    st.sidebar.subheader("Friends")
    for f in user["friends"]:
        st.sidebar.markdown(f"- {f}")

def send_friend_request_ui():
    user = st.session_state["users"][st.session_state["current_user"]]
    potential_friends = [u for u in st.session_state["users"] if u not in user["friends"] and u != st.session_state["current_user"] and u not in user["requests"]]
    if potential_friends:
        selected = st.sidebar.selectbox("Send Friend Request", [""] + potential_friends)
        if st.sidebar.button("Send Request") and selected:
            st.session_state["users"][selected]["requests"].append(st.session_state["current_user"])
            st.sidebar.success(f"Friend request sent to {selected}")
