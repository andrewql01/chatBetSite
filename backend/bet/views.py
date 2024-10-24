from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from bet.models import Event, MultiBet
from bet.serializers import EventSerializer, MultiBetSerializer


class GetEventsView(ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', None))
        if limit:
            queryset = Event.objects.all()[:limit]
            return queryset
        else:
            return Event.objects.all()

class InitializeMultiBetView(CreateAPIView):
    serializer_class = MultiBetSerializer

    def get_serializer_context(self):
        return {'request': self.request}

