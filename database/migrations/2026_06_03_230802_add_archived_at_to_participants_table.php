<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/xxxx_add_archived_at_to_participants_table.php
    public function up()
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('user_id');
        });
    }

    public function down()
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
