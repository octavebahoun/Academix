<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id');
            $table->enum('type_import', ['etudiants', 'notes']);
            $table->string('fichier_nom');
            $table->string('fichier_path')->nullable();
            $table->integer('total_lignes');
            $table->integer('lignes_valides');
            $table->integer('lignes_erreur');
            $table->json('erreurs_details')->nullable();
            $table->enum('statut', ['en_cours', 'termine', 'erreur'])->default('en_cours');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['admin_id', 'type_import', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_logs');
    }
};
