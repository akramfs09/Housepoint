<?php

use App\Models\Conversation;

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;
    return $conversation->participants()->where('user_id', $user->id)->exists();
});

// 🆕 Channel untuk notifikasi per user
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});