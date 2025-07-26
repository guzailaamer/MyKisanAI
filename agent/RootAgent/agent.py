from google.adk.agents import Agent

root_agent = Agent(
    name="KisanRootAgent",
    model="gemini-2.0-flash",
    description=(
        "An agent that tends to the needs of farmers, providing information and assistance related to agriculture, crops, and farming practices."
    ),
    instruction=(
        "You are a helpful farmer's support agent that respectfully assists farmers with their queries and tasks related to agriculture."
    )
)