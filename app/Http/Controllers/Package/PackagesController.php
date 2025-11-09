<?php

namespace App\Http\Controllers\Package;
use App\Http\Controllers\Controller;
use App\Http\Requests\Package\StorePackageRequest;
use App\Http\Requests\Package\UpdatePackageRequest;
use App\Http\Requests\Package\UpdateStatusRequest;
use App\Models\Bookings;
use App\Models\Package;
use App\Models\Services;
use App\Notifications\PromoAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PackagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Package::latest();

        if ($request->has('search') && $request->search != null) { //search function
            $query->where(function ($q) use ($request) {
                $q->where('package_name', 'like', '%' . $request->search . '%')
                    ->orWhere('package_id', 'like', '%' . $request->search . '%')
                    ->orWhere('package_price', 'like', '%' . $request->search . '%')
                    ->orWhere('status', 'like', '%' . $request->search . '%')
                    ->orWhere('package_promo', 'like', '%' . $request->search . '%');
            });
        }

        $packages = $query->get();

        return Inertia::render('Package/show', [
            'packages' => $packages,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/Step1', [
            'form' => session('package', []), // Pass the form data from the session
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageRequest $request)
    {
        session()->put('package', $request->validated());

        return redirect()->route('service.create');
    }

    /**
     * Save the specified resource.
     */
    public function save()
    {
        $packageData = session('package'); 
        $servicesData = session('services', []);
        $servicesCount = count($servicesData);

        if (empty($packageData)) {
            return redirect()->route('package.create')
                ->with('error', 'Package details are missing. Please complete Step 1.');
        }

        if (empty($servicesData)) {
            return redirect()->route('service.create')
                ->with('error', 'Services are not added in this package. Please complete Step 2.');
        }

        // Generate Package ID
        $packageId = 'PKG-' . str_pad(Package::count() + 1, 3, '0', STR_PAD_LEFT);

        $package = Package::create([
            'package_id' => $packageId,
            'package_name' => $packageData['packageName'],
            'package_description' => $packageData['packageDescription'],
            'status' => $packageData['packageStatus'],
            'package_price' => $packageData['packagePrice'],
            'package_promo' => $packageData['packagePromo'],
            'discounted_price' => $packageData['discountedPrice'],
            'services_count' => $servicesCount,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Loop through all services in session
        foreach ($servicesData as $index => $serviceData) {
            $lastService = Services::orderBy('services_id', 'desc')->first(); // Get the last service

            if ($lastService) {
                // Extract the numeric part from SRV-XXX
                $lastNumber = (int) str_replace('SRV-', '', $lastService->services_id); // Get the last service number
                $nextNumber = $lastNumber + 1; // Increment the service number
            } else {
                $nextNumber = 1; // First record
            }

            $serviceId = 'SRV-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT); // Generate service ID

            // Handle Base64 image from session
            $relativePath = null;
            if (! empty($serviceData['image']) && str_starts_with($serviceData['image'], 'data:image')) {
                // Extract MIME type and base64 data
                preg_match('/^data:image\/(\w+);base64,/', $serviceData['image'], $matches);
                $extension = $matches[1] ?? 'png'; // default to png
                $imageData = substr($serviceData['image'], strpos($serviceData['image'], ',') + 1);
                $imageData = base64_decode($imageData);

                // Save to storage
                $fileName = time() . "_{$index}." . $extension;
                $relativePath = 'services/' . $fileName;
                Storage::disk('public')->put($relativePath, $imageData);
            } elseif (! empty($serviceData['image']) && is_string($serviceData['image'])) {
                // Already stored file path
                $relativePath = $serviceData['image'];
            }

            $service = Services::create([ // Create service
                'services_id' => $serviceId,
                'service_name' => $serviceData['serviceName'],
                'description' => $serviceData['serviceDescription'],
                'image' => $relativePath,  // handle actual image saving in store step
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $package->services()->attach($service->services_id);

            session()->forget(['package', 'services']);
        }

        if (! empty($packageData['announceEmail'])) {
            $emails = Bookings::whereNotNull('contact_email')
                ->pluck('contact_email')
                ->filter()
                ->unique()
                ->toArray();

            if (! empty($emails)) {
                Notification::route('mail', $emails)->notifyNow(new PromoAnnouncement($package));
                $sentCount = count($emails);
            } else {
                $sentCount = 0;
            }
        } else {
            $sentCount = 0;
        }

        session()->forget(['package', 'services']);

        $message = 'Package and services saved successfully!';
        if (! empty($sentCount)) {
            $message .= " Promo announcement sent to {$sentCount} recipients.";
        }

        return redirect()->route('package.index')
            ->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $package = Package::findOrFail($id);

        return Inertia::render('Package/ViewPackage', [
            'package' => $package,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function showServices(string $id)
    {
        $package = Package::with('services')->where('package_id', $id)->firstOrFail();

        return Inertia::render('Package/Package_Services', [
            'package' => $package,
            'services' => $package->services,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $package = Package::with('services')->where('package_id', $id)->firstOrFail();

        return Inertia::render('EditPackage/package', [
            'package' => $package,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePackageRequest $request, string $id)
    {
        $package = Package::where('package_id', $id)->firstOrFail();
        $validated = $request->validated();

        $package->update([
            'package_name' => $validated['packageName'],
            'package_description' => $validated['packageDescription'],
            'status' => $validated['packageStatus'],
            'package_price' => $validated['packagePrice'],
            'package_promo' => $validated['packagePromo'],
            'discounted_price' => $validated['discountedPrice'],
        ]);

        return redirect()
            ->route('package.index')
            ->with('success', 'Package updated successfully.');
    }

    public function updateStatus(UpdateStatusRequest $request, string $id)
    {
        $package = Package::where('package_id', $id)->firstOrFail();
        $package->update(['status' => $request->validated()['status']]);
        $package->save();

        return redirect()
            ->route('package.index')
            ->with('success', 'Status Updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $package = Package::where('package_id', $id)->firstOrFail();

        $services = $package->services; 

        foreach ($services as $service) {
            if (! empty($service->image) && Storage::disk('public')->exists($service->image)) {
                Storage::disk('public')->delete($service->image);
            }

            $service->delete();
        }

        $package->services()->detach();

        $package->delete();

        return redirect()->route('package.index')->with('success', 'Package and its related services deleted successfully!');
    }
}
