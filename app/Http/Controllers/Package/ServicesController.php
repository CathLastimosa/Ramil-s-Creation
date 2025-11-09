<?php

namespace App\Http\Controllers\Package;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\StoreServiceRequest;
use App\Http\Requests\Services\UpdateServiceRequest;
use App\Models\Services;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $services = Services::latest()->paginate(10)->toArray();

        return Inertia::render('Package/Step2', [
            'services' => $services,
        ]);
    }

    public function editPackageServices(string $id)
    {
        $package = Package::with('services')->findOrFail($id);

        return Inertia::render('EditPackage/services', [
            'package' => $package,
            'services' => $package->services,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/Step2', [
            'form' => [
                'serviceName' => '',
                'serviceDescription' => '',
                'image' => '',
            ],
            'services' => session('services', []),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $contents = file_get_contents($file->getRealPath());
            $mime = $file->getClientMimeType(); // e.g. image/png
            $validated['image'] = 'data:'.$mime.';base64,'.base64_encode($contents);
        }

        $services = session()->get('services', []);
        $services[] = $validated;
        session()->put('services', $services);

        return redirect()->route('service.create');
    }

    /**
     * Remove a service from the session
     */
    public function remove(Request $request)
    {
        $index = $request->input('index');
        $services = session()->get('services', []);

        if (isset($services[$index])) {
            unset($services[$index]);
            $services = array_values($services);
            session()->put('services', $services);
        }

        return redirect()->route('service.create');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $service = Services::all()->where('services_id', $id)->firstOrFail();

        return Inertia::render('EditPackage/services', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequest $request, string $id)
    {
        $validated = $request->validated();
        $service = Services::where('services_id', $id)->firstOrFail();

        $service->update([
            'service_name' => $validated['serviceName'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
        ]);

        return redirect()
            ->route('package.index')
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = Services::findOrFail($id);
        $packageId = $service->packages()->pluck('packages.package_id')->first();
        $service->packages()->detach();
        $service->delete();

        return redirect()->route('package.showServices', ['id' => $packageId])->with('success', 'Service deleted successfully!');
    }
}
