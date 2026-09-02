def get_state(event):

    requests = event["requests"]
    failed_logins = event["failed_logins"]
    unique_ips = event["unique_ips"]

#Requests

    if requests <=100:
        request_level = "low"
    elif requests <=500:
        request_level="medium"
    elif requests <=1500:
        request_level="high"
    else:
        request_level="critical"

#Failed logins
    if failed_logins <=10:
        login_level="low"
    elif failed_logins <=50:
        login_level="medium"
    else:
        login_level="high"

#Unique IPs
    if unique_ips <=20:
        ip_level="low"
    elif unique_ips <=100:
        ip_level="medium"
    else:
        ip_level="high"

    return(
        event["type"],
        request_level,
        login_level,
        ip_level
    )
