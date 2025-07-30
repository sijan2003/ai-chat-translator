from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .translator import translate
from .models import Message, UserProfile, Friendship
from django.utils import timezone
from django.db import models

User = get_user_model()

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def translate_message(request):
    """API endpoint for translating messages."""
    try:
        message = request.data.get('message')
        source_lang = request.data.get('source_lang')
        target_lang = request.data.get('target_lang')
        
        if not all([message, source_lang, target_lang]):
            return Response({
                'error': 'Missing required fields: message, source_lang, target_lang'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        translated = translate(message, source_lang, target_lang)
        
        if translated.startswith("[") and "unavailable" in translated:
            return Response({
                'error': 'Translation failed or unsupported language pair',
                'original': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'translated': translated,
            'original': message,
            'source_lang': source_lang,
            'target_lang': target_lang
        })
        
    except Exception as e:
        return Response({
            'error': f'Translation error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, friend_id):
    """Get messages between current user and a friend."""
    try:
        messages = Message.objects.filter(
            (models.Q(sender=request.user, receiver_id=friend_id) |
             models.Q(sender_id=friend_id, receiver=request.user))
        ).order_by('created_at')
        
        message_data = []
        for msg in messages:
            message_data.append({
                'id': msg.id,
                'content': msg.content,
                'translated_content': msg.translated_content,
                'sender_id': msg.sender.id,
                'receiver_id': msg.receiver.id,
                'source_language': msg.source_language,
                'target_language': msg.target_language,
                'is_translated': msg.is_translated,
                'created_at': msg.created_at.isoformat(),
            })
        
        return Response(message_data)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching messages: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    """Get user's friends list."""
    try:
        # Get accepted friendships
        friendships = Friendship.objects.filter(
            (models.Q(sender=request.user) | models.Q(receiver=request.user)),
            status='accepted'
        )
        
        friends = []
        for friendship in friendships:
            friend = friendship.receiver if friendship.sender == request.user else friendship.sender
            profile, created = UserProfile.objects.get_or_create(user=friend)
            
            friends.append({
                'id': friend.id,
                'name': friend.username,
                'email': friend.email,
                'is_online': profile.is_online,
                'last_seen': profile.last_seen.isoformat(),
                'preferred_language': profile.preferred_language,
            })
        
        return Response(friends)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching friends: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    """Send a friend request."""
    try:
        receiver_id = request.data.get('receiver_id')
        if not receiver_id:
            return Response({
                'error': 'Missing receiver_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        receiver = User.objects.get(id=receiver_id)
        
        # Check if friendship already exists
        existing = Friendship.objects.filter(
            (models.Q(sender=request.user, receiver=receiver) |
             models.Q(sender=receiver, receiver=request.user))
        ).first()
        
        if existing:
            return Response({
                'error': 'Friendship request already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        friendship = Friendship.objects.create(
            sender=request.user,
            receiver=receiver,
            status='pending'
        )
        
        return Response({
            'message': 'Friend request sent successfully',
            'friendship_id': friendship.id
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error sending friend request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
