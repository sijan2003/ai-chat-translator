from django.urls import re_path
from .consumers import ChatTranslateConsumer

# Django Channels routing for WebSocket connections
# This should be included in your project's root asgi.py via ProtocolTypeRouter

websocket_urlpatterns = [
    # Route WebSocket connections at ws/chat/ to the chat translation consumer
    re_path(r"^ws/chat/$", ChatTranslateConsumer.as_asgi()),
]
