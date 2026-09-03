graph TD
    %% Frontend
    subgraph Frontend [Dashboard UI]
        UI[User clicks simulation button]
        Display[Display Metrics, Action & Reward]
    end

    %% Django API Endpoint
    subgraph BackendAPI [Django REST API]
        API(POST /api/simulate/)
    end

    %% Simulation Environment
    subgraph Simulation [Simulation Environment]
        Simulator[Attack Simulator]
        StateExtractor[State Extractor]
        RewardCalc[Reward Calculator]
    end

    %% Reinforcement Learning
    subgraph RL [Reinforcement Learning Agent]
        QAgent[Q-Learning Agent]
        QTable[(q_table.json)]
    end

    %% Data Flow
    UI -- "1. Request (e.g. type='ddos')" --> API
    API -- "2. Trigger Event" --> Simulator
    Simulator -- "3. Network Data (reqs, IPs, logins)" --> StateExtractor
    StateExtractor -- "4. Discrete State ('high|low|high')" --> QAgent
    QTable -. "Loads trained memory" .-> QAgent
    QAgent -- "5. Best Action ('block')" --> RewardCalc
    Simulator -. "True Attack Type" .-> RewardCalc
    RewardCalc -- "6. Final Output (Data, State, Action, Reward)" --> API
    API -- "7. JSON Response" --> Display
