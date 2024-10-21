from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from rest_framework.views import APIView


class ScrapeView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        pass

