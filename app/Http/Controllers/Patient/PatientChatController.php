<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientChatMessageRequest;
use App\Models\Booking;
use App\Models\ChatConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientChatController extends Controller
{
    /**
     * Display a listing of the patient's chat conversations.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = $user->chatConversations()
            ->with([
                'provider.user',
                'booking',
                'latestMessage',
            ])
            ->where('is_active', true)
            ->orderByDesc(
                ChatConversation::select('created_at')
                    ->from('chat_messages')
                    ->whereColumn('chat_messages.conversation_id', 'chat_conversations.id')
                    ->orderBy('created_at', 'desc')
                    ->limit(1)
            )
            ->get();

        return Inertia::render('patient/chat/index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Display the specified chat conversation.
     */
    public function show(Request $request, Booking $booking): Response
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to chat.');
        }

        $conversation = $booking->conversation()->with(['provider.user'])->first();

        if (! $conversation) {
            $conversation = ChatConversation::create([
                'user_id' => $user->id,
                'provider_id' => $booking->provider_id,
                'booking_id' => $booking->id,
                'is_active' => true,
            ]);
            $conversation->load(['provider.user']);
        }

        $messages = $conversation->messages()
            ->with(['sender'])
            ->orderBy('created_at', 'asc')
            ->get();

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        return Inertia::render('patient/chat/show', [
            'conversation' => $conversation,
            'booking' => $booking->load(['status', 'collectionType']),
            'messages' => $messages,
        ]);
    }

    /**
     * Store a new message in the conversation.
     */
    public function store(PatientChatMessageRequest $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to chat.');
        }

        $conversation = $booking->conversation()->first();

        if (! $conversation) {
            $conversation = ChatConversation::create([
                'user_id' => $user->id,
                'provider_id' => $booking->provider_id,
                'booking_id' => $booking->id,
                'is_active' => true,
            ]);
        }

        $message = $conversation->messages()->create([
            'sender_type' => 'patient',
            'sender_id' => $user->id,
            'message' => $request->validated()['message'],
            'is_read' => false,
        ]);

        $message->load(['sender']);

        return response()->json([
            'message' => $message,
        ], 201);
    }

    /**
     * Get new messages for polling (JSON endpoint).
     */
    public function messages(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to chat.');
        }

        $conversation = $booking->conversation()->first();

        if (! $conversation) {
            return response()->json([
                'messages' => [],
            ]);
        }

        $since = $request->input('since');
        $query = $conversation->messages()->with(['sender']);

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at', 'asc')->get();

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'messages' => $messages,
        ]);
    }
}
