<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chefs_departement', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telephone', 20)->nullable();
            $table->string('photo')->nullable();

            // Relation avec le département (un chef appartient à un département)
            $table->foreignId('departement_id')->constrained('departements')->onDelete('cascade');

            // Relation de création : qui l'a enregistré ?
            $table->foreignId('created_by_admin')->constrained('super_admins')->onDelete('cascade');

            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login')->nullable();
            $table->timestamps();

            $table->index(['email', 'departement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chefs_departement');
    }
};
