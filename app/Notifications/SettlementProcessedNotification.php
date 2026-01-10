<?php

namespace App\Notifications;

use App\Models\ProviderSettlement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SettlementProcessedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public ProviderSettlement $settlement
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Settlement Processed',
            'message' => "Your settlement of £{$this->settlement->net_amount} for period {$this->settlement->period_start->format('M j')} - {$this->settlement->period_end->format('M j, Y')} has been processed.",
            'settlement_id' => $this->settlement->id,
            'amount' => $this->settlement->net_amount,
            'period_start' => $this->settlement->period_start->toDateString(),
            'period_end' => $this->settlement->period_end->toDateString(),
            'action_url' => "/settlements/{$this->settlement->id}",
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
