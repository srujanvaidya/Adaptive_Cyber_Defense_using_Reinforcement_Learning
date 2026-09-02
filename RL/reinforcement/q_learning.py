import random

class QLearningAgent:

    def __init__(self):

        self.actions=[
            "allow",
            "rate_limit",
            "block"
        ]

        self.q_table={}

        self.alpha=0.1     #Learning rate
        self.gamma=0.9      #How much I care about future
        self.epsilon=0.1    #How often I try something new

    def get_q_values(self,state):

        if state not in self.q_table:
            self.q_table[state]={
                action:0.0
                for action in self.actions
            }
        return self.q_table[state]

    def choose_action(self,state):
        q_values=self.get_q_values(state)

        #Exploration
        if random.random()<self.epsilon:
            return random.choice(self.actions)
        #Exploitation
        return max(q_values,key=q_values.get)

    def update(self,state,action,reward,next_state):

        current_q=self.get_q_values(state)[action]

        next_q_values=self.get_q_values(next_state)

        max_next_q=max(next_q_values.values())

        new_q= current_q + self.alpha * (reward + self.gamma * max_next_q - current_q)

        self.q_table[state][action]=new_q