
from django.urls import path
from . import views

urlpatterns = [
    path('translate/', views.translate_message, name='translate_message'),
    path('messages/<int:friend_id>/', views.get_messages, name='get_messages'),
    path('friends/', views.get_friends, name='get_friends'),
    path('friends/request/', views.send_friend_request, name='send_friend_request'),
]