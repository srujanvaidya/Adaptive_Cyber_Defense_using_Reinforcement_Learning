import random
from .state import get_state

def normal_traffic():
    return{
        "type":"normal",
        "requests":random.randint(10,50),
        "failed_logins":random.randint(0,3),
        "unique_ips":random.randint(5,20)
    }

def ddos_attack():
    return{
        "type":"ddos",
        "requests":random.randint(500,2000),
        "failed_logins":random.randint(0,10),
        "unique_ips":random.randint(50,500)
    }

def brute_force_attack():
    return{
        "type":"brute_force",
        "requests":random.randint(50,200),
        "failed_logins":random.randint(20,100),
        "unique_ips":random.randint(1,5)
    }

def simulate_network(steps=100):
    events=[]
    for _ in range(steps):
        r=random.random()
        if r<0.70:
            event=normal_traffic()
        elif r<0.85:
            event=ddos_attack()
        else:
            event=brute_force_attack()

        state=get_state(event)


        events.append((event,state))
        print(state)


    return events
