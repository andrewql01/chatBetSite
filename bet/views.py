from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from bet.models import Event
from bet.serializers import EventSerializer

class GetEventsView(ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', None))
        if limit:
            queryset = Event.objects.all()[:limit]
            return queryset
        else:
            return Event.objects.all()