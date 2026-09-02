from .attack_simulator import simulate_network
from .rewards import calculate_reward

class CyberEnvironment():

    def __init__(self):
        self.events = []
        self.current_index=0

    def reset(self):
        self.events = simulate_network()
        self.current_index=0

        event,state = self.events[0]
        return state

    def step(self,action):
        event,state = self.events[self.current_index]

        reward = calculate_reward(event,action)

        self.current_index+=1

        if self.current_index>=len(self.events):
            return None,reward,True

        next_event,next_state=self.events[self.current_index]

        return next_state,reward,False


