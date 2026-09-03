from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response

from reinforcement.q_learning import QLearningAgent
from reinforcement.model import load_q_table

from .attack_simulator import (
    normal_traffic,
    ddos_attack,
    brute_force_attack
)

from .state import get_state
from .rewards import calculate_reward


@api_view(["POST"])
def simulate_attack(request):

    attack_type = request.data.get("type", "normal")

    # Generate network event
    if attack_type == "normal":
        event = normal_traffic()

    elif attack_type == "ddos":
        event = ddos_attack()

    elif attack_type == "brute_force":
        event = brute_force_attack()

    else:
        return Response({
            "error": "Invalid attack type"
        }, status=400)

    # Create RL agent
    agent = QLearningAgent()

    # Load trained Q-table
    load_q_table(agent)

    # Convert network event into RL state
    state = get_state(event)

    # Get Q-values
    q_values = agent.get_q_values(state)

    # Choose action with highest Q-value
    action = max(q_values, key=q_values.get)

    # Calculate reward
    reward = calculate_reward(event, action)

    return Response({
        "event": {
            "requests": event["requests"],
            "failed_logins": event["failed_logins"],
            "unique_ips": event["unique_ips"]
        },

        "state": {
            "requests": state[0],
            "failed_logins": state[1],
            "unique_ips": state[2]
        },

        "q_values": q_values,

        "action": action,

        "reward": reward
    })