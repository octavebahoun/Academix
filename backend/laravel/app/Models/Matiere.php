<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Matiere extends Model
{
    protected $fillable = [
        'nom',
        'code',
        'coefficient',
        'description',
        'enseignant',
    ];

    public function filieres(): BelongsToMany
    {
        return $this->belongsToMany(Filiere::class, 'filiere_matieres')
                    ->withPivot('semestre');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function emploiTemps(): HasMany
    {
        return $this->hasMany(EmploiTempsFiliere::class);
    }

    public function taches(): HasMany
    {
        return $this->hasMany(Tache::class);
    }
}
