import random

from simulation.attack_simulator import (
    normal_traffic,
    ddos_attack,
    brute_force_attack
)

from simulation.state import get_state
from simulation.rewards import calculate_reward


def evaluate(agent, tests=1000):

    total_reward = 0

    normal_total = 0
    normal_allowed = 0
    normal_blocked = 0

    attack_total = 0
    attacks_blocked = 0
    attacks_rate_limited = 0
    attacks_allowed = 0

    for _ in range(tests):

        r = random.random()

        if r < 0.70:
            event = normal_traffic()

        elif r < 0.85:
            event = ddos_attack()

        else:
            event = brute_force_attack()

        state = get_state(event)

        q_values = agent.get_q_values(state)

        action = max(q_values, key=q_values.get)

        reward = calculate_reward(event, action)

        total_reward += reward

        # Normal traffic
        if event["type"] == "normal":

            normal_total += 1

            if action == "allow":
                normal_allowed += 1

            elif action == "block":
                normal_blocked += 1

        # Attack traffic
        else:

            attack_total += 1

            if action == "block":
                attacks_blocked += 1

            elif action == "rate_limit":
                attacks_rate_limited += 1

            elif action == "allow":
                attacks_allowed += 1

    normal_allow_rate = (
        normal_allowed / normal_total * 100
    )

    attack_block_rate = (
        attacks_blocked / attack_total * 100
    )

    attack_rate_limit_rate = (
        attacks_rate_limited / attack_total * 100
    )

    attack_allow_rate = (
        attacks_allowed / attack_total * 100
    )

    average_reward = total_reward / tests

    print("\n========== EVALUATION ==========\n")

    print("Total tests:", tests)

    print(
        "Normal traffic allowed:",
        f"{normal_allow_rate:.2f}%"
    )

    print(
        "Normal traffic blocked:",
        f"{normal_blocked / normal_total * 100:.2f}%"
    )

    print(
        "Attacks blocked:",
        f"{attack_block_rate:.2f}%"
    )

    print(
        "Attacks rate-limited:",
        f"{attack_rate_limit_rate:.2f}%"
    )

    print(
        "Attacks allowed:",
        f"{attack_allow_rate:.2f}%"
    )

    print(
        "Average reward:",
        f"{average_reward:.2f}"
    )

    print("\n================================\n")