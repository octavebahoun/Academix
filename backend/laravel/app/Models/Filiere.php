<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model
{
    protected $fillable = [
        'departement_id',
        'nom',
        'niveau',
        'code',
        'annee_academique',
        'description',
    ];

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function matieres(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'filiere_matieres')
                    ->withPivot('semestre');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function emploiTemps(): HasMany
    {
        return $this->hasMany(EmploiTempsFiliere::class);
    }

    public function statistiques(): HasMany
    {
        return $this->hasMany(StatistiqueFiliere::class);
    }
}
