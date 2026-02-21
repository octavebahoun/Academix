<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emploi_temps_filieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filiere_id')->constrained()->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->enum('jour', ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('salle', 50)->nullable();
            $table->enum('type_cours', ['CM', 'TD', 'TP']);
            $table->string('enseignant', 100)->nullable();
            $table->enum('semestre', ['S1', 'S2']);

            $table->index(['filiere_id', 'jour']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emploi_temps_filieres');
    }
};
