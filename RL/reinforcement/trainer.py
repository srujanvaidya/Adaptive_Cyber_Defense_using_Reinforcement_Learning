from simulation.environment import CyberEnvironment
from .q_learning import QLearningAgent

def train(episodes=1000):

    environment = CyberEnvironment()
    agent = QLearningAgent()

    for episode in range(episodes):
        state = environment.reset()
        done = False

        while not done:

            action = agent.choose_action(state)

            next_state,reward,done=environment.step(action)

            if next_state is not None:
                agent.update(state,action,reward,next_state)
                state=next_state

    return agent