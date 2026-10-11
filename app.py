import streamlit as st
import plotly.graph_objects as go

from src.risk_engine import calculate_risk_score

st.set_page_config(
    page_title="Construction Risk Analytics",
    page_icon="🏗️",
    layout="wide",
)

st.title("🏗️ Construction Safety Risk Analytics")
st.caption("Rule-based hazard assessment and safety decision support")

st.warning(
    "Demonstration tool only. Verify all findings with a qualified "
    "site safety professional. Do not use this app as the sole basis "
    "for deciding whether work is safe."
)

st.subheader("Hazard Assessment")

with st.form("risk_assessment"):
    hazard_name = st.text_input(
        "Hazard description",
        placeholder="e.g. Unprotected edge on an elevated platform",
    )

    col1, col2 = st.columns(2)

    with col1:
        severity = st.slider("Hazard severity", 1, 5, 3)
        likelihood = st.slider("Likelihood of incident", 1, 5, 3)

    with col2:
        exposure = st.slider("Worker exposure", 1, 5, 3)
        compliance = st.slider("Safety compliance", 1, 5, 3)

    submitted = st.form_submit_button(
        "Calculate Risk",
        type="primary",
        use_container_width=True,
    )

if submitted:
    if not hazard_name.strip():
        st.error("Please enter a hazard description.")
    else:
        result = calculate_risk_score(
            hazard_severity=severity,
            likelihood=likelihood,
            worker_exposure=exposure,
            safety_compliance=compliance,
        )

        score = result["risk_score"]
        level = result["risk_level"]

        st.divider()
        st.subheader(f"Assessment Result: {hazard_name}")

        metric1, metric2 = st.columns(2)
        metric1.metric("Risk Score", f"{score}/100")
        metric2.metric("Risk Level", level)

        fig = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=score,
                title={"text": "Risk Score"},
                gauge={
                    "axis": {"range": [0, 100]},
                    "steps": [
                        {"range": [0, 40], "color": "#d9ead3"},
                        {"range": [40, 60], "color": "#fff2cc"},
                        {"range": [60, 80], "color": "#fce5cd"},
                        {"range": [80, 100], "color": "#f4cccc"},
                    ],
                    "threshold": {
                        "line": {"color": "black", "width": 4},
                        "thickness": 0.75,
                        "value": score,
                    },
                },
            )
        )
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)

        st.subheader("Recommended Action")
        st.write(result["recommendation"])

        with st.expander("Assessment inputs"):
            st.write(
                {
                    "Hazard severity": severity,
                    "Likelihood": likelihood,
                    "Worker exposure": exposure,
                    "Safety compliance": compliance,
                }
            )
