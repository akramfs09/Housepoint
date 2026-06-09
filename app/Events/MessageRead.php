<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $readerId;

    public function __construct(Message $message, $readerId)
    {
        $this->message = $message;
        $this->readerId = $readerId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->message->conversation_id);
    }

    public function broadcastAs()
    {
        return 'message.read';
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->message->id,
            'read_at' => now()->toISOString(),
            'reader_id' => $this->readerId,
        ];
    }
}