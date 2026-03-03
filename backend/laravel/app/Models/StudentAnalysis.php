<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnalysis extends Model
{
    protected $fillable = [
        'user_id',
        'moyenne_generale',
        'niveau_alerte',
        'message_principal',
        'conseils',
        'matieres_prioritaires',
        'point_positif',
        'contexte_raw',
        'sent_at'
    ];

    protected $casts = [
        'conseils' => 'array',
        'matieres_prioritaires' => 'array',
        'contexte_raw' => 'array',
        'sent_at' => 'datetime',
        'moyenne_generale' => 'float',
    ];

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    // ─── Relations ───────────────────────────────────────────────────────────

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
