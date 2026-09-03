from django.db import models

import json
import os


def save_q_table(agent, filename="reinforcement/q_table.json"):

    data = {}

    for state, actions in agent.q_table.items():

        # Convert tuple state into a string
        state_key = "|".join(state)

        data[state_key] = actions

    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


def load_q_table(agent, filename="reinforcement/q_table.json"):

    if not os.path.exists(filename):
        # Fallback to path relative to this file
        filename = os.path.join(os.path.dirname(__file__), "q_table.json")

    with open(filename, "r") as file:
        data = json.load(file)

    agent.q_table = {}

    for state, actions in data.items():

        # Convert string back into tuple
        state_tuple = tuple(state.split("|"))

        agent.q_table[state_tuple] = actions

    return agent