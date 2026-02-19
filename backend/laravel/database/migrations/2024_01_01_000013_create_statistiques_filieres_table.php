<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistiques_filieres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filiere_id')->constrained()->onDelete('cascade');
            $table->string('annee_academique', 20);
            $table->enum('semestre', ['S1', 'S2']);
            $table->integer('total_etudiants')->default(0);
            $table->decimal('moyenne_generale', 5, 2)->nullable();
            $table->decimal('taux_reussite', 5, 2)->nullable();
            $table->string('meilleure_matiere', 100)->nullable();
            $table->string('matiere_difficile', 100)->nullable();
            $table->timestamps();
            
            $table->unique(['filiere_id', 'annee_academique', 'semestre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistiques_filieres');
    }
};
