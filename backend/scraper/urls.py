from django.urls import path

from scraper.views import ScrapeView

urlpatterns = [
    path('api/scraper/scrape', ScrapeView.as_view(), name='scrape'),
]