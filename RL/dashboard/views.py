from django.shortcuts import render


def index(request):
    """Render the RLShield dashboard."""
    return render(request, 'dashboard/index.html')
