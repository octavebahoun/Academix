<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploiTempsFiliere extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'filiere_id',
        'matiere_id',
        'jour',
        'heure_debut',
        'heure_fin',
        'salle',
        'type_cours',
        'enseignant',
        'semestre',
    ];

    protected $casts = [
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }
}
