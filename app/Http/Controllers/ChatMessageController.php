<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    public function index(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        // Get or create conversation for this booking
        $conversation = $booking->conversation()->firstOrCreate([
            'user_id' => $booking->user_id,
            'provider_id' => $booking->provider_id,
            'is_active' => true,
        ]);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function store(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'sender_type' => 'required|in:patient,provider',
        ]);

        // Get or create conversation for this booking
        $conversation = $booking->conversation()->firstOrCreate([
            'user_id' => $booking->user_id,
            'provider_id' => $booking->provider_id,
            'is_active' => true,
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => auth()->id(),
            'sender_type' => $validated['sender_type'],
            'message' => $validated['message'],
        ]);

        $message->load('sender');

        return response()->json([
            'message' => $message,
        ], 201);
    }
}
