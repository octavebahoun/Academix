<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistiques_departements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departement_id')->constrained()->onDelete('cascade');
            $table->string('annee_academique', 20);
            $table->integer('total_etudiants')->default(0);
            $table->integer('total_filieres')->default(0);
            $table->decimal('moyenne_generale', 5, 2)->nullable();
            $table->decimal('taux_reussite', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['departement_id', 'annee_academique']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistiques_departements');
    }
};
