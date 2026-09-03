from django.urls import path
from .views import simulate_attack

urlpatterns = [
    path("simulate/", simulate_attack),
]