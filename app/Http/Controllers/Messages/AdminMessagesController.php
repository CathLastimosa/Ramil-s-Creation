<?php

namespace App\Http\Controllers\Messages;

use App\Http\Controllers\Controller;
use App\Models\Bookings;
use App\Models\Messages;
use App\Models\Staff;
use App\Models\User;
use App\Notifications\MessageSendingNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Jobs\SendMessageNotification;
use App\Models\EmailNotification;
use App\Events\MessageCreated;
class AdminMessagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Messages::with(['sender', 'receiver']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receiver_email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->latest()->get();

        $mappedMessages = $messages->map(function ($message) {
            $senderData = null;
            if ($message->sender_type === Bookings::class) {
                $booking = Bookings::find($message->sender_id);
                $senderData = $booking ? [
                    'name' => $booking->contact_name ?? null,
                    'email' => $booking->contact_email ?? null,
                    'event_name' => $booking->event_name ?? null,
                ] : null;
            } else {
                $senderData = $message->sender ? [
                    'name' => $message->sender->name ?? null,
                    'email' => $message->sender->email ?? null,
                ] : null;
            }

            $receiverData = null;
            if ($message->receiver_type === Bookings::class) {
                $receiverData = [
                    'type' => 'App\\Models\\Bookings',
                    'booking_id' => $message->receiver->booking_id ?? null,
                    'contact_name' => $message->receiver->contact_name ?? null,
                    'event_name' => $message->receiver->event_name ?? 'No Event',
                    'contact_email' => $message->receiver->contact_email ?? null,
                ];
            } elseif ($message->receiver_type === Staff::class) {
                $receiverData = [
                    'type' => 'App\\Models\\Staff',
                    'staff_id' => $message->receiver->staff_id ?? null,
                    'staff_name' => $message->receiver->staff_name ?? null,
                    'email' => $message->receiver->email ?? null,
                ];
            } else {
                $receiverData = [
                    'type' => 'unknown',
                    'name' => $message->receiver_email,
                    'email' => $message->receiver_email,
                ];
            }

            return [
                'message_id' => $message->message_id,
                'receiver_id' => $message->receiver_id,
                'sender_id' => $message->sender_id,
                'receiver_email' => $message->receiver_email,
                'subject' => $message->subject,
                'message' => $message->message,
                'attachment' => $message->attachment,
                'created_at' => $message->created_at->toDateTimeString(),
                'is_read' => $message->is_read,
                'sender_type' => $message->sender_type,
                'sender' => $senderData,
                'receiver' => $receiverData,
            ];
        });

        return Inertia::render('Messages', [
            'messages' => $mappedMessages,
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $contacts = Bookings::select('contact_name', 'contact_email', 'booking_id')->get();
        $staff = Staff::select('staff_name', 'email', 'staff_id')->get();

        return Inertia::render('CreateMessage', [
            'contacts' => $contacts,
            'staff' => $staff,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (! Auth::check()) {
            return back()->withErrors(['error' => 'You must be logged in to send messages.']);
        }

        $validated = $request->validate([
            'receiver_type' => 'required|in:customer,staff',
            'receiver_email' => 'required|email',
            'booking_id' => 'nullable|required_if:receiver_type,customer|integer|exists:event_bookings,booking_id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $receiver = null;
        $receiverType = null;
        $receiverId = null;

        if ($validated['receiver_type'] === 'customer') {
            $receiver = Bookings::where('booking_id', $validated['booking_id'])
                ->where('contact_email', $validated['receiver_email'])
                ->first();
            if (! $receiver) {
                Log::error('Customer receiver not found', ['booking_id' => $validated['booking_id'], 'email' => $validated['receiver_email']]);

                return back()->withErrors(['receiver_email' => 'Customer not found with this booking ID and email.']);
            }
            $receiverType = Bookings::class;
            $receiverId = $receiver->booking_id;
            Log::info('Customer receiver found', ['receiver_id' => $receiverId]);
        } else {
            $receiver = Staff::where('email', $validated['receiver_email'])->first();
            if (! $receiver) {
                Log::error('Staff receiver not found', ['email' => $validated['receiver_email']]);

                return back()->withErrors(['receiver_email' => 'Staff not found with this email.']);
            }
            $receiverType = Staff::class;
            $receiverId = $receiver->staff_id;
            Log::info('Staff receiver found', ['receiver_id' => $receiverId]);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments', 'public');
            Log::info('Attachment stored', ['path' => $attachmentPath]);
        }

        try {
            $message = Messages::create([
                'sender_id' => Auth::id(),
                'sender_type' => User::class,
                'receiver_id' => $receiverId,
                'receiver_type' => $receiverType,
                'receiver_email' => $validated['receiver_email'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'attachment' => $attachmentPath,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create message', ['error' => $e->getMessage()]);

            return back()->withErrors(['error' => 'Failed to save message: ' . $e->getMessage()]);
        }

        $notificationData = [
            'receiver_email' => $validated['receiver_email'],
            'booking_id' => $validated['receiver_type'] === 'customer' ? ($validated['booking_id'] ?? null) : null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'attachment' => $attachmentPath,
        ];

        $notification = EmailNotification::create([
            'subject' => $validated['subject'],
            'recipient_type' => $receiverType,
            'recipient_id' => $receiverId,
            'recipient_email' => $validated['receiver_email'],
            'type' => 'message',
            'status' => 'pending',
        ]);

        SendMessageNotification::dispatch($receiver, $notificationData, $notification->id);

        return redirect()->route('messages.index')->with('success', 'Message sent successfully.');
    }

    /**
     * Public store method for unauthenticated message creation from tracking page.
     */
    public function publicStore(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|integer|exists:event_bookings,booking_id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $booking = Bookings::findOrFail($validated['booking_id']);

        $admin = User::first();
        if (! $admin) {
            return response()->json(['error' => 'Admin not found'], 500);
        }

        $message = Messages::create([
            'sender_id' => $booking->booking_id,
            'sender_type' => Bookings::class,
            'receiver_id' => $admin->id,
            'receiver_type' => User::class,
            'receiver_email' => $admin->email,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);


        EmailNotification::create([
            'subject' => $validated['subject'],
            'recipient_type' => User::class,
            'recipient_id' => $admin->id,
            'recipient_email' => $admin->email,
            'sender_id' => $booking->booking_id,
            'type' => 'message',
            'status' => 'sent',
        ]);

        event(new MessageCreated($message));
        return redirect()->route('booking.track')->with('success', 'Message sent successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $message = Messages::findOrFail($id);

        if ($message->attachment) {
            Storage::disk('public')->delete($message->attachment);
            Log::info('Attachment deleted', ['path' => $message->attachment]);
        }

        $message->delete();

        return redirect()->route('messages.index')->with('success', 'Message deleted successfully.');
    }
}
