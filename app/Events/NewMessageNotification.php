<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Support\Str;

class NewMessageNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $receiverId;

    /**
     * Create a new event instance.
     *
     * @param  Message  $message
     * @param  int      $receiverId  User ID penerima notifikasi
     */
    public function __construct(Message $message, int $receiverId)
    {
        $this->message = $message->load('user:id,name');
        $this->receiverId = $receiverId;
    }

    /**
     * Get the channel the event should broadcast on.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('user.' . $this->receiverId);
    }

    /**
     * Custom event name for frontend listener.
     */
    public function broadcastAs(): string
    {
        return 'new.message';
    }

    /**
     * Data yang dikirim ke frontend.
     */
    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'sender_name'     => $this->message->user->name,
            'body'            => Str::limit($this->message->body, 50),
            'sent_at'         => $this->message->created_at->toISOString(),
        ];
    }
}