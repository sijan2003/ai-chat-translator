import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .translator import translate
from .models import Message, UserProfile
from django.utils import timezone

User = get_user_model()

class ChatTranslateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat translation.
    Receives JSON with 'message', 'source_lang', and 'target_lang',
    translates the message, saves to database, and sends the result back.
    Optimized for low latency and memory usage.
    """

    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()
        # Optionally, add to a group for broadcasting
        # await self.channel_layer.group_add("chat_group", self.channel_name)

    async def disconnect(self, close_code):
        # Update user online status
        if hasattr(self, 'user') and self.user:
            await self.update_user_status(self.user, False)
        # Optionally, remove from group
        # await self.channel_layer.group_discard("chat_group", self.channel_name)
        pass

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Get user from JWT token."""
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def update_user_status(self, user, is_online):
        """Update user online status."""
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.is_online = is_online
        profile.last_seen = timezone.now()
        profile.save()

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content, translated_content, source_lang, target_lang):
        """Save message to database."""
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            
            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=content,
                translated_content=translated_content,
                source_language=source_lang,
                target_language=target_lang,
                is_translated=bool(translated_content)
            )
            return message
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            message = data.get("message")
            source_lang = data.get("source_lang")
            target_lang = data.get("target_lang")
            sender_id = data.get("sender_id")
            receiver_id = data.get("receiver_id")
            
            if not all([message, source_lang, target_lang, sender_id, receiver_id]):
                await self.send_json({
                    "error": "Missing required fields: 'message', 'source_lang', 'target_lang', 'sender_id', 'receiver_id'."
                })
                return
        except (json.JSONDecodeError, TypeError):
            await self.send_json({"error": "Invalid JSON format."})
            return

        # Run translation in a thread pool to avoid blocking event loop
        translated = await database_sync_to_async(translate)(message, source_lang, target_lang)
        
        if translated.startswith("[") and "unavailable" in translated:
            await self.send_json({
                "error": "Translation failed or unsupported language pair.",
                "original": message,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "timestamp": timezone.now().isoformat()
            })
            return

        # Save message to database
        saved_message = await self.save_message(
            sender_id, receiver_id, message, translated, source_lang, target_lang
        )

        # Send translated message back to client
        await self.send_json({
            "id": saved_message.id if saved_message else None,
            "translated": translated,
            "original": message,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "timestamp": timezone.now().isoformat()
        })

    async def send_json(self, content):
        """Helper to send JSON content over WebSocket."""
        await self.send(text_data=json.dumps(content))

    # Example for broadcasting to a group (uncomment if needed):
    # async def broadcast_message(self, event):
    #     await self.send_json(event["content"])
