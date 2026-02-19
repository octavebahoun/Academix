<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tache extends Model
{
    protected $fillable = [
        'user_id',
        'titre',
        'description',
        'matiere_id',
        'date_limite',
        'priorite',
        'statut',
    ];

    protected $casts = [
        'date_limite' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }
}
