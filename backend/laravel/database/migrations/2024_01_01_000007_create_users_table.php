<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('matricule', 20)->unique();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email')->unique()->nullable();
            $table->string('password');
            $table->string('telephone', 20)->nullable();
            $table->string('photo')->nullable();
            $table->foreignId('filiere_id')->constrained()->onDelete('restrict');
            $table->string('annee_admission', 10)->nullable();
            $table->decimal('objectif_moyenne', 4, 2)->default(12.00);
            $table->enum('style_apprentissage', ['visuel', 'auditif', 'kinesthesique'])->default('visuel');
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index(['matricule', 'email', 'filiere_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
