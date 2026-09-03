// ═══════════════════════════════════════════════════════
// RLShield Dashboard — Script
// Connects to Django REST API at /api/simulate/
// ═══════════════════════════════════════════════════════

(function () {
    'use strict';

    // ═══ State ═══
    let recentDecisions = [];
    let isLoading = false;

    // ═══ CSRF Token ═══
    function getCSRFToken() {
        // Try hidden input first (set by {% csrf_token %})
        const input = document.querySelector('[name=csrfmiddlewaretoken]');
        if (input) return input.value;

        // Fallback: read from cookie
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
    }

    // ═══ DOM References ═══
    const $ = (id) => document.getElementById(id);

    const dom = {
        systemStatus:  $('systemStatus'),
        statusText:    $('statusText'),
        loadingBar:    $('loadingBar'),
        errorBar:      $('errorBar'),
        errorText:     $('errorText'),
        welcome:       $('welcome'),
        dashboard:     $('dashboard'),
        decisionsBody: $('decisionsBody'),
        decisionAction: $('decisionAction'),
        rewardValue:   $('rewardValue'),
        btns: {
            normal: $('btn-normal'),
            ddos:   $('btn-ddos'),
            brute:  $('btn-brute'),
        },
        stats: {
            requests: $('stat-requests'),
            logins:   $('stat-logins'),
            ips:      $('stat-ips'),
        },
        state: {
            requests: $('state-requests'),
            logins:   $('state-logins'),
            ips:      $('state-ips'),
        },
        pipe: {
            traffic:  $('pipe-traffic'),
            state:    $('pipe-state'),
            qtable:   $('pipe-qtable'),
            decision: $('pipe-decision'),
        },
        qv: {
            allow:      { item: $('qv-allow'),      bar: $('qbar-allow'),      num: $('qnum-allow') },
            rate_limit: { item: $('qv-rate_limit'),  bar: $('qbar-rate_limit'), num: $('qnum-rate_limit') },
            block:      { item: $('qv-block'),       bar: $('qbar-block'),      num: $('qnum-block') },
        },
    };

    // ═══ Main API Call ═══
    window.simulate = async function simulate(type) {
        if (isLoading) return;

        setLoading(true);
        clearError();
        animatePipeline();

        try {
            const response = await fetch('/api/simulate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ type: type }),
            });

            if (!response.ok) {
                throw new Error('Server returned ' + response.status);
            }

            const data = await response.json();

            setBackendStatus(true);
            completePipeline();
            updateDashboard(data);
            addRecentDecision(data);

        } catch (err) {
            setBackendStatus(false);
            resetPipeline();
            showError('Unable to connect to RLShield backend. Please ensure the Django server is running.');
            console.error('RLShield API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ═══ Loading ═══
    function setLoading(loading) {
        isLoading = loading;
        dom.loadingBar.classList.toggle('active', loading);

        Object.values(dom.btns).forEach(function (btn) {
            btn.disabled = loading;
        });
    }

    // ═══ Backend Status ═══
    function setBackendStatus(connected) {
        dom.systemStatus.className = 'system-status ' + (connected ? 'connected' : 'disconnected');
        dom.statusText.textContent = connected ? 'Backend: Connected' : 'Backend: Disconnected';
    }

    // ═══ Error ═══
    function showError(message) {
        dom.errorText.textContent = message;
        dom.errorBar.classList.add('active');
    }

    function clearError() {
        dom.errorBar.classList.remove('active');
    }

    // ═══ Dashboard Update ═══
    function updateDashboard(data) {
        // Show dashboard, hide welcome
        dom.welcome.style.display = 'none';
        dom.dashboard.classList.add('active');

        // Network Statistics
        animateValue(dom.stats.requests, data.event.requests);
        animateValue(dom.stats.logins, data.event.failed_logins);
        animateValue(dom.stats.ips, data.event.unique_ips);

        // RL State badges
        setBadge(dom.state.requests, data.state.requests);
        setBadge(dom.state.logins, data.state.failed_logins);
        setBadge(dom.state.ips, data.state.unique_ips);

        // AI Defense Decision
        updateDecision(data.action);

        // Q-Values
        updateQValues(data.q_values, data.action);

        // Reward
        updateReward(data.reward);
    }

    function animateValue(el, value) {
        el.textContent = value.toLocaleString();
        el.style.animation = 'none';
        void el.offsetHeight; // reflow
        el.style.animation = 'popIn 0.35s ease';
    }

    function setBadge(el, level) {
        el.textContent = level.toUpperCase();
        el.className = 'state-badge ' + level;
    }

    function updateDecision(action) {
        var label = action === 'rate_limit' ? 'RATE LIMIT' : action.toUpperCase();
        dom.decisionAction.textContent = label;
        dom.decisionAction.className = 'decision-action ' + action;

        // Pop animation
        dom.decisionAction.style.animation = 'none';
        void dom.decisionAction.offsetHeight;
        dom.decisionAction.style.animation = 'popIn 0.4s ease';
    }

    function updateQValues(qValues, selectedAction) {
        var maxQ = Math.max.apply(null, Object.values(qValues).map(function (v) { return Math.max(0, v); }));

        for (var action in qValues) {
            if (!qValues.hasOwnProperty(action)) continue;
            var refs = dom.qv[action];
            if (!refs) continue;

            var value = qValues[action];
            var isSelected = action === selectedAction;

            // Highlight selected
            refs.item.classList.toggle('selected', isSelected);

            // Bar width (percentage of max, at least 2% for visibility when non-zero)
            var pct = maxQ > 0 ? (Math.max(0, value) / maxQ) * 100 : 0;
            if (value > 0 && pct < 2) pct = 2;
            refs.bar.style.width = pct.toFixed(1) + '%';

            // Number
            refs.num.textContent = value.toFixed(2);
        }
    }

    function updateReward(reward) {
        var prefix = reward > 0 ? '+' : '';
        dom.rewardValue.textContent = prefix + reward;

        if (reward > 0) {
            dom.rewardValue.className = 'reward-value positive';
        } else if (reward < 0) {
            dom.rewardValue.className = 'reward-value negative';
        } else {
            dom.rewardValue.className = 'reward-value zero';
        }

        dom.rewardValue.style.animation = 'none';
        void dom.rewardValue.offsetHeight;
        dom.rewardValue.style.animation = 'popIn 0.4s ease';
    }

    // ═══ Recent Decisions ═══
    function addRecentDecision(data) {
        var now = new Date();
        var time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        recentDecisions.unshift({
            time: time,
            requests: data.event.requests,
            failed_logins: data.event.failed_logins,
            unique_ips: data.event.unique_ips,
            state: data.state.requests + '|' + data.state.failed_logins + '|' + data.state.unique_ips,
            action: data.action,
            reward: data.reward,
        });

        // Keep last 10
        if (recentDecisions.length > 10) {
            recentDecisions.pop();
        }

        renderTable();
    }

    function renderTable() {
        if (recentDecisions.length === 0) {
            dom.decisionsBody.innerHTML =
                '<tr><td colspan="7" class="empty-table">No simulations yet. Click a button above to start.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < recentDecisions.length; i++) {
            var d = recentDecisions[i];
            var actionLabel = d.action === 'rate_limit'
                ? 'Rate Limit'
                : d.action.charAt(0).toUpperCase() + d.action.slice(1);
            var rewardPrefix = d.reward > 0 ? '+' : '';
            var rewardClass = d.reward > 0 ? 'td-reward-pos' : d.reward < 0 ? 'td-reward-neg' : 'td-reward-zero';
            var rowClass = i === 0 ? ' class="new-row"' : '';

            html +=
                '<tr' + rowClass + '>' +
                '<td>' + d.time + '</td>' +
                '<td>' + d.requests.toLocaleString() + '</td>' +
                '<td>' + d.failed_logins + '</td>' +
                '<td>' + d.unique_ips + '</td>' +
                '<td class="td-state">' + d.state + '</td>' +
                '<td><span class="table-badge ' + d.action + '">' + actionLabel + '</span></td>' +
                '<td class="' + rewardClass + '">' + rewardPrefix + d.reward + '</td>' +
                '</tr>';
        }

        dom.decisionsBody.innerHTML = html;
    }

    // ═══ Pipeline Animation ═══
    var pipelineSteps = ['traffic', 'state', 'qtable', 'decision'];
    var pipelineTimers = [];

    function animatePipeline() {
        resetPipeline();
        for (var i = 0; i < pipelineSteps.length; i++) {
            (function (idx) {
                var timer = setTimeout(function () {
                    var el = dom.pipe[pipelineSteps[idx]];
                    if (el) el.classList.add('active');
                }, idx * 180);
                pipelineTimers.push(timer);
            })(i);
        }
    }

    function completePipeline() {
        pipelineTimers.forEach(clearTimeout);
        pipelineTimers = [];
        pipelineSteps.forEach(function (key) {
            var el = dom.pipe[key];
            if (el) el.classList.add('active');
        });
    }

    function resetPipeline() {
        pipelineTimers.forEach(clearTimeout);
        pipelineTimers = [];
        pipelineSteps.forEach(function (key) {
            var el = dom.pipe[key];
            if (el) el.classList.remove('active');
        });
    }

})();
