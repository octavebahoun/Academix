<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('import_logs', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['created_by_admin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('import_logs', function (Blueprint $table) {
            $table->foreign('admin_id')->references('id')->on('super_admins')->onDelete('cascade');
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->foreign('created_by_admin_id')->references('id')->on('super_admins')->onDelete('set null');
        });
    }
};
