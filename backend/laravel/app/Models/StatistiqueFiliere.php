<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatistiqueFiliere extends Model
{
    protected $fillable = [
        'filiere_id',
        'annee_academique',
        'semestre',
        'total_etudiants',
        'moyenne_generale',
        'taux_reussite',
        'meilleure_matiere',
        'matiere_difficile',
    ];

    protected $casts = [
        'moyenne_generale' => 'decimal:2',
        'taux_reussite' => 'decimal:2',
    ];

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }
}
