<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load('user:id,name');
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->message->conversation_id);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    public function broadcastWith()
    {
        return [
            'id'              => $this->message->id,
            'conversation_id' => $this->message->conversation_id,  // tambahan
            'body'            => $this->message->body,
            'user_id'         => $this->message->user_id,
            'user_name'       => $this->message->user->name,
            'created_at'      => $this->message->created_at->toISOString(),
        ];
    }
}