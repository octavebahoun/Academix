<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatistiqueDepartement extends Model
{
    protected $fillable = [
        'departement_id',
        'annee_academique',
        'total_etudiants',
        'total_filieres',
        'moyenne_generale',
        'taux_reussite',
    ];

    protected $casts = [
        'moyenne_generale' => 'decimal:2',
        'taux_reussite' => 'decimal:2',
    ];

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }
}
