<?php

namespace App\Http\Controllers\Package;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Services;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EditServicesController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, string $id)
    {
        $request->validate([
            'service_name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('services', 'public');
        }

        $lastService = Services::orderBy('services_id', 'desc')->first();
        if ($lastService) {
            $lastNumber = (int) str_replace('SRV-', '', $lastService->services_id);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        $serviceId = 'SRV-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $service = Services::create([
            'services_id' => $serviceId,
            'service_name' => $request->service_name,
            'description' => $request->description,
            'image' => $imagePath,
        ]);

        $package = Package::findOrFail($id);
        $package->services()->attach($service->services_id); 

        return redirect()->back()->with('success', 'Service added successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $service = Services::findOrFail($id);

        $request->validate([
            'service_name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $service->service_name = $request->service_name;
        $service->description = $request->description;

        if ($request->hasFile('image')) {
            if ($service->image && Storage::exists($service->image)) {
                Storage::delete($service->image);
            }

            $service->image = $request->file('image')->store('services', 'public');
        }

        $service->save();

        return redirect()->back()->with('success', 'Service updated successfully!');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $packageId, string $serviceId)
    {
        $package = Package::findOrFail($packageId);

        $service = $package->services()
            ->where('services.services_id', $serviceId)
            ->firstOrFail();

        if (! empty($service->image) && Storage::disk('public')->exists($service->image)) {
            Storage::disk('public')->delete($service->image);
        }

        $package->services()->detach($serviceId);
        $service->delete();

        return redirect()->back()->with('success', 'Service removed successfully!');
    }
}
