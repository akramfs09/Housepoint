<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\MessageRead;
use App\Events\NewMessageNotification;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Participant;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Notifications\ChatMessageNotification;

class ChatController extends Controller
{
    use AuthorizesRequests;

    public function start(Request $request)
    {
        $request->validate(['property_id' => 'required|exists:properties,id']);

        $property = Property::findOrFail($request->property_id);
        $seller = $property->sellerProfile->user;
        $buyer = Auth::user();

        if ($buyer->id === $seller->id) {
            return response()->json(['message' => 'Anda tidak bisa chat dengan diri sendiri.'], 400);
        }

        $conversation = Conversation::where('property_id', $property->id)
            ->whereHas('participants', fn($q) => $q->where('user_id', $buyer->id))
            ->whereHas('participants', fn($q) => $q->where('user_id', $seller->id))
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create(['property_id' => $property->id]);
            $conversation->participants()->createMany([
                ['user_id' => $buyer->id],
                ['user_id' => $seller->id],
            ]);
        } else {
            // Jika sudah ada tapi user pengirim pernah mengarsipkan, aktifkan kembali
            $participant = $conversation->participants()->where('user_id', $buyer->id)->first();
            if ($participant && $participant->archived_at) {
                $participant->update(['archived_at' => null]);
            }
        }

        return response()->json(['conversation_id' => $conversation->id]);
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $archived = $request->boolean('archived');

        $query = Conversation::whereHas('participants', function ($q) use ($user, $archived) {
            $q->where('user_id', $user->id);
            if ($archived) {
                $q->whereNotNull('archived_at');
            } else {
                $q->whereNull('archived_at');
            }
        });

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('property', fn($p) => $p->where('title', 'like', "%{$search}%"))
                  ->orWhereHas('participants.user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $conversations = $query
            ->with(['participants.user:id,name,email', 'property:id,title,slug', 'latestMessage'])
            ->orderByDesc(Message::select('created_at')->whereColumn('conversation_id', 'conversations.id')->latest()->take(1))
            ->get()
            ->map(function ($conv) use ($user) {
                $other = $conv->participants->firstWhere('user_id', '!=', $user->id)?->user;
                $unreadCount = $conv->messages()
                    ->where('user_id', '!=', $user->id)
                    ->whereNull('read_at')
                    ->count();
                $conv->other_user = $other ? ['id' => $other->id, 'name' => $other->name, 'email' => $other->email] : null;
                $conv->unread_count = $unreadCount;
                $conv->is_archived = $conv->participants->firstWhere('user_id', $user->id)->archived_at !== null;
                return $conv;
            });

        $total = Conversation::whereHas('participants', fn($q) => $q->where('user_id', $user->id)->whereNull('archived_at'))->count();
        $archivedCount = Conversation::whereHas('participants', fn($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))->count();
        $unreadTotal = Message::whereIn('conversation_id', 
                Conversation::whereHas('participants', fn($q) => $q->where('user_id', $user->id)->whereNull('archived_at'))->pluck('id')
            )
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'conversations' => $conversations,
            'stats' => [
                'total' => $total,
                'unread' => $unreadTotal,
                'archived' => $archivedCount,
            ],
        ]);
    }

    public function messages(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $messages = $conversation->messages()
            ->with('user:id,name')
            ->orderBy('created_at')
            ->paginate(30);

        return response()->json($messages);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $request->validate(['body' => 'required|string|max:2000']);

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        // Broadcast pesan ke peserta percakapan (kecuali pengirim)
        broadcast(new MessageSent($message))->toOthers();

        // 🔔 Kirim notifikasi ke semua peserta LAINNYA di percakapan
        $otherParticipants = $conversation->participants()
            ->where('user_id', '!=', Auth::id())
            ->get();

        foreach ($otherParticipants as $participant) {
            // Notifikasi database + broadcast
            $participant->user->notify(new ChatMessageNotification($message));
        }

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'user_id' => $message->user_id,
            'user_name' => Auth::user()->name,
            'created_at' => $message->created_at->toISOString(),
            'read_at' => null,
        ], 201);
    }

    public function markRead(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $user = Auth::user();
        
        $unreadMessages = $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->get();

        if ($unreadMessages->isNotEmpty()) {
            Message::whereIn('id', $unreadMessages->pluck('id'))->update(['read_at' => now()]);
            // Broadcast read receipt
            foreach ($unreadMessages as $msg) {
                broadcast(new MessageRead($msg, $user->id))->toOthers();
            }
        }

        return response()->json(['success' => true]);
    }

    public function archive(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', Auth::id())->firstOrFail();
        $participant->update(['archived_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function unarchive(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', Auth::id())->firstOrFail();
        $participant->update(['archived_at' => null]);

        return response()->json(['success' => true]);
    }
}