import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .translator import translate

class ChatTranslateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat translation.
    Receives JSON with 'message', 'source_lang', and 'target_lang',
    translates the message, and sends the result back or to a group.
    Optimized for low latency and memory usage.
    """

    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()
        # Optionally, add to a group for broadcasting
        # await self.channel_layer.group_add("chat_group", self.channel_name)

    async def disconnect(self, close_code):
        # Optionally, remove from group
        # await self.channel_layer.group_discard("chat_group", self.channel_name)
        pass

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            message = data.get("message")
            source_lang = data.get("source_lang")
            target_lang = data.get("target_lang")
            if not all([message, source_lang, target_lang]):
                await self.send_json({
                    "error": "Missing required fields: 'message', 'source_lang', 'target_lang'."
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
                "original": message
            })
            return

        # Send translated message back to client
        await self.send_json({
            "translated": translated,
            "original": message,
            "source_lang": source_lang,
            "target_lang": target_lang
        })

    async def send_json(self, content):
        """Helper to send JSON content over WebSocket."""
        await self.send(text_data=json.dumps(content))

    # Example for broadcasting to a group (uncomment if needed):
    # async def broadcast_message(self, event):
    #     await self.send_json(event["content"])
