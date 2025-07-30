from django.contrib import admin
from .models import Message, UserProfile, Friendship

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'is_translated', 'created_at')
    list_filter = ('is_translated', 'created_at', 'source_language', 'target_language')
    search_fields = ('content', 'translated_content', 'sender__username', 'receiver__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_language', 'is_online', 'last_seen')
    list_filter = ('is_online', 'preferred_language', 'last_seen')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('last_seen',)

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sender__username', 'receiver__username')
    readonly_fields = ('created_at', 'updated_at')
