import streamlit as st
import time

def events_ui():
    st.subheader("📅 Events")
    event_name = st.text_input("Event Name", key="event_name")
    event_time = st.text_input("Event Time", key="event_time")
    if st.button("Create Event"):
        if event_name.strip():
            events = st.session_state.setdefault("events", [])
            events.append({"name": event_name, "time": event_time, "creator": st.session_state["current_user"]})
            st.success("Event created!")
    if "events" in st.session_state:
        st.markdown("**Upcoming Events:**")
        for e in st.session_state["events"]:
            st.markdown(f"- {e['name']} by {e['creator']} at {e['time']}")
