from django.urls import path

from bet.views import GetEventsView, InitializeMultiBetView

urlpatterns = [
    path('api/bets/get-events/', GetEventsView.as_view(), name='get_events'),
    path('api/bets/init-multibet/', InitializeMultiBetView.as_view(), name='initialize_multibet'),
]