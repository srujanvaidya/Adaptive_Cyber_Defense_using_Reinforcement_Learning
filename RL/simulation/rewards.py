def calculate_reward(event,action):

    attack_type = event["type"]

    if attack_type =="normal":

        if action == "allow":
            return 10
        elif action == "rate_limit":
            return -3
        elif action == "block":
            return -10

    if attack_type =="ddos":

        if action == "allow":
            return -10
        elif action =="rate_limit":
            return 7
        elif action =="block":
            return 10

    if attack_type == "brute_force":

        if action =="allow":
            return -10
        elif action == "rate_limit":
            return 7
        elif action =="block":
            return 10

    return 0
