<?php

use App\Models\Batch;
use App\Http\Controllers\Api\V1\Classroom\ClassController;
use Illuminate\Http\Request;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 1;
echo "Checking Batch ID: $id\n";
$batch = Batch::find($id);

if (!$batch) {
    echo "Batch not found!\n";
    exit;
}

echo "Batch Type: " . $batch->type . "\n";

$controller = new ClassController();
try {
    // Mock authentication
    $user = \App\Models\User::where('role', 'student')->first();
    auth()->login($user);
    
    $response = $controller->show($id);
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Data: " . substr(json_encode($response->getData()), 0, 500) . "...\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
