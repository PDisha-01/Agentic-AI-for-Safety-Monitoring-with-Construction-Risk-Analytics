from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from src.risk_engine import calculate_risk_score


class SiteRiskState(TypedDict, total=False):
    hazard_severity: int
    likelihood: int
    worker_exposure: int
    safety_compliance: int
    risk_assessment: dict
    agent_report: dict


def assess_site_risk(state: SiteRiskState) -> dict:
    """Calculate the site's risk using the existing risk engine."""
    assessment = calculate_risk_score(
        hazard_severity=state["hazard_severity"],
        likelihood=state["likelihood"],
        worker_exposure=state["worker_exposure"],
        safety_compliance=state["safety_compliance"],
    )
    return {"risk_assessment": assessment}


def prepare_agent_report(state: SiteRiskState) -> dict:
    """Prepare a structured report from the risk assessment."""
    assessment = state["risk_assessment"]

    report = {
        "agent": "Site Risk Agent",
        "status": "completed",
        "risk_score": assessment["risk_score"],
        "risk_level": assessment["risk_level"],
        "recommendation": assessment["recommendation"],
        "assessment_method": "Rule-based risk scoring orchestrated by LangGraph",
    }

    return {"agent_report": report}


workflow = StateGraph(SiteRiskState)

workflow.add_node("assess_risk", assess_site_risk)
workflow.add_node("prepare_report", prepare_agent_report)

workflow.add_edge(START, "assess_risk")
workflow.add_edge("assess_risk", "prepare_report")
workflow.add_edge("prepare_report", END)

site_risk_agent = workflow.compile()


def run_site_risk_agent(
    hazard_severity: int,
    likelihood: int,
    worker_exposure: int,
    safety_compliance: int,
) -> dict:
    """Run the complete Site Risk Agent workflow."""
    result = site_risk_agent.invoke(
        {
            "hazard_severity": hazard_severity,
            "likelihood": likelihood,
            "worker_exposure": worker_exposure,
            "safety_compliance": safety_compliance,
        }
    )
    return result["agent_report"]
