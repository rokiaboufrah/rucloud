from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import ContactMessage
from .serializers import ContactSerializer
from notifications import send_contact_alert

class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        send_contact_alert(message)
        return Response({'message': 'Message sent successfully'}, status=status.HTTP_201_CREATED)
