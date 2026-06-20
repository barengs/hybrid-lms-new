
$user = App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'instructor'))->first();
if (!$user) {
    echo "No instructor found\n";
    exit;
}
echo "User ID: " . $user->id . "\n";
$request = new Illuminate\Http\Request();
$request->setUserResolver(fn() => $user);
$controller = new App\Http\Controllers\Api\V1\Instructor\DashboardController();
$response = $controller->index($request);
echo json_encode($response->getData());
