<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = [
        'user_id',
        'matiere_id',
        'note',
        'note_max',
        'type_evaluation',
        'coefficient',
        'date_evaluation',
        'semestre',
        'annee_academique',
        'import_id',
        'created_by_admin_id',
    ];

    protected $casts = [
        'note' => 'decimal:2',
        'note_max' => 'decimal:2',
        'date_evaluation' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function importLog(): BelongsTo
    {
        return $this->belongsTo(ImportLog::class, 'import_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by_admin_id');
    }
}
