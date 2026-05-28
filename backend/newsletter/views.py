from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import NewsletterSubscriber
from .serializers import NewsletterSerializer

class NewsletterSubscribeView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'message': 'Subscribed successfully'}, status=status.HTTP_201_CREATED)
