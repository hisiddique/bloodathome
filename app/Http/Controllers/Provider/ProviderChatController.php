<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProviderChatMessageRequest;
use App\Models\Booking;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProviderChatController extends Controller
{
    public function index(): Response
    {
        $provider = auth()->user()->provider;
        $authUserId = auth()->id();

        $conversations = ChatConversation::query()
            ->where('provider_id', $provider->id)
            ->with([
                'user',
                'booking.status',
                'latestMessage',
            ])
            ->whereHas('messages')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (ChatConversation $conversation) use ($authUserId) {
                $patient = $conversation->user;
                $latestMessage = $conversation->latestMessage;

                $unreadCount = $conversation->messages()
                    ->where('sender_id', '!=', $authUserId)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => $conversation->id,
                    'booking_id' => $conversation->booking_id,
                    'patient_id' => $conversation->user_id,
                    'patient_name' => $patient?->full_name ?? 'Unknown Patient',
                    'patient_avatar' => null,
                    'last_message' => $latestMessage?->message ?? '',
                    'last_message_at' => $latestMessage
                        ? $latestMessage->created_at->toISOString()
                        : $conversation->updated_at->toISOString(),
                    'unread_count' => $unreadCount,
                ];
            });

        return Inertia::render('provider/chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Booking $booking): Response
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $conversation = ChatConversation::firstOrCreate(
            [
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'provider_id' => $provider->id,
            ],
            [
                'is_active' => true,
            ]
        );

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get();

        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        $booking->load(['user', 'status']);
        $patient = $booking->user;

        return Inertia::render('provider/chat/show', [
            'booking' => [
                'id' => $booking->id,
                'patient_id' => $booking->user_id,
                'patient_name' => $patient?->full_name ?? 'Unknown Patient',
                'patient_avatar' => null,
            ],
            'conversation' => [
                'id' => $conversation->id,
                'booking_id' => $conversation->booking_id,
            ],
            'messages' => $messages->map(fn (ChatMessage $message) => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'message' => $message->message,
                'created_at' => $message->created_at->toISOString(),
            ]),
        ]);
    }

    public function store(ProviderChatMessageRequest $request, Booking $booking): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $conversation = ChatConversation::firstOrCreate(
            [
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'provider_id' => $provider->id,
            ],
            [
                'is_active' => true,
            ]
        );

        $conversation->messages()->create([
            'sender_type' => 'provider',
            'sender_id' => auth()->id(),
            'message' => $request->validated()['message'],
            'is_read' => false,
        ]);

        $conversation->touch();

        return back()->with('success', 'Message sent successfully.');
    }

    public function messages(Booking $booking): JsonResponse
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $conversation = ChatConversation::where('booking_id', $booking->id)
            ->where('provider_id', $provider->id)
            ->first();

        if (! $conversation) {
            return response()->json([
                'messages' => [],
            ]);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'messages' => $messages,
        ]);
    }
}
