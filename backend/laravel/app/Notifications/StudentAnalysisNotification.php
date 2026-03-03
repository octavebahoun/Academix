<?php

namespace App\Notifications;

use App\Jobs\SendWebPushNotificationJob;
use App\Models\StudentAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentAnalysisNotification extends Notification implements ShouldQueue
{
    use Queueable;


    public function __construct(public StudentAnalysis $analysis)
    {
    }

    /**
     * Canaux : mail + database seulement.
     * Le push VAPID est dispatché séparément via afterCommit() pour
     * ne pas dépendre d'un canal Laravel inexistant.
     */
    public function via(object $notifiable): array
    {
        // Dispatcher le push VAPID de manière asynchrone
        $this->dispatchWebPush($notifiable);

        return ['mail', 'database'];
    }

    /**
     * Dispatch le push VAPID via un Job dédié (asynchrone, 3 tentatives).
     */
    private function dispatchWebPush(object $notifiable): void
    {
        $emoji = match ($this->analysis->niveau_alerte) {
            'danger' => '⚠️',
            'warning' => '📉',
            default => '📊',
        };

        SendWebPushNotificationJob::dispatch($notifiable->id, [
            'title' => "{$emoji} Ton bilan académique",
            'body' => $this->analysis->message_principal,
            'url' => '/dashboard',
            'tag' => 'analysis-' . $this->analysis->id,
        ]);
    }


    public function toMail(object $notifiable): MailMessage
    {
        $statusEmoji = match ($this->analysis->niveau_alerte) {
            'danger' => '⚠️',
            'warning' => '📉',
            default => '📊',
        };

        $prenom = $notifiable->prenom ?? $notifiable->nom ?? 'Étudiant';

        return (new MailMessage)
            ->subject("{$statusEmoji} Ton bilan académique personnalisé — AcademiX")
            ->greeting("Bonjour {$prenom} !")
            ->line($this->analysis->message_principal)
            ->line("**Matières à prioriser :** " . implode(', ', $this->analysis->matieres_prioritaires ?? []))
            ->line("💪 " . ($this->analysis->point_positif ?? "Continue tes efforts !"))
            ->action('Voir mon tableau de bord', url('/dashboard'))
            ->line('Ce message a été généré par notre IA pour t\'aider dans ta réussite.');
    }


    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'student_analysis',
            'analysis_id' => $this->analysis->id,
            'niveau_alerte' => $this->analysis->niveau_alerte,
            'message_principal' => $this->analysis->message_principal,
            'matieres' => $this->analysis->matieres_prioritaires,
        ];
    }
}
