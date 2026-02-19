<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    protected $fillable = [
        'admin_id',
        'type_import',
        'fichier_nom',
        'fichier_path',
        'total_lignes',
        'lignes_valides',
        'lignes_erreur',
        'erreurs_details',
        'statut',
        'completed_at',
    ];

    protected $casts = [
        'erreurs_details' => 'array',
        'completed_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
