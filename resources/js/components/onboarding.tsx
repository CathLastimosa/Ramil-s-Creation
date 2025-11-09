'use client';

import { Button } from '@/components/ui/button-shad';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon, ArrowRightIcon, Info, Minimize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    const stepContent = [
        {
            title: 'Important Reminder',
            description: 'You should book your event at least one month before the event date to ensure availability and smooth preparation.',
        },
        {
            title: 'No Cancellation of bookings',
            description: 'Once your booking has been confirmed, cancellations are not allowed. Please be sure of your schedule before finalizing.',
        },
        {
            title: 'Downpayment Required',
            description: 'A downpayment is required for approval of your booking. Payments can be made via Gcash or Cash on Hand.',
        },
        {
            title: 'Terms and Conditions',
            description: 'By proceeding with your booking, you agree to our terms and conditions regarding scheduling, payments, and policies.',
        },
    ];

    const totalSteps = stepContent.length;

    const handleContinue = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setShowBanner(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        handleClose();
                    } else {
                        setStep(1);
                        setOpen(true);
                    }
                }}
            >
                <DialogContent className="gap-0 p-0 [&>button:last-child]:text-white">
                    <div className="p-2">
                        <img className="w-full rounded-md" src="/images/wedding.webp" width={382} height={216} alt="wedding" />
                    </div>
                    <div className="space-y-6 px-6 pt-3 pb-6">
                        <DialogHeader>
                            <DialogTitle>{stepContent[step - 1].title}</DialogTitle>
                            <DialogDescription>{stepContent[step - 1].description}</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex justify-center space-x-1.5 max-sm:order-1">
                                {[...Array(totalSteps)].map((_, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'size-1.5 rounded-full bg-accent2 transition-opacity',
                                            index + 1 === step ? 'opacity-100' : 'opacity-30',
                                        )}
                                    />
                                ))}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        Skip
                                    </Button>
                                </DialogClose>
                                {step > 1 && (
                                    <Button variant="secondary" type="button" onClick={handleBack}>
                                        <ArrowLeftIcon className="me-1 opacity-60" size={16} />
                                        Back
                                    </Button>
                                )}
                                {step < totalSteps ? (
                                    <Button className="group" type="button" variant="brand" onClick={handleContinue}>
                                        Next
                                        <ArrowRightIcon className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5" size={16} />
                                    </Button>
                                ) : (
                                    <DialogClose asChild>
                                        <Button type="button">Okay</Button>
                                    </DialogClose>
                                )}
                            </DialogFooter>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ✅ Banner Notification */}
            {showBanner && (
                <>
                    {!minimized ? (
                        <div className="fixed bottom-20 left-4 z-50 max-w-[400px] rounded-md border bg-background p-4 shadow-lg">
                            <div className="flex gap-2">
                                <div
                                    className="flex grow cursor-pointer gap-3"
                                    onClick={() => {
                                        setOpen(true);
                                        setShowBanner(false);
                                    }}
                                >
                                    <Info className="mt-0.5 shrink-0 text-amber-500" size={16} />
                                    <div className="flex grow flex-col gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Booking Reminder</p>
                                            <p className="text-sm text-muted-foreground">Click here to reopen the reminder.</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                                    aria-label="Minimize notification"
                                    onClick={() => setMinimized(true)}
                                >
                                    <Minimize2 size={16} className="opacity-60 transition-opacity group-hover:opacity-100" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="fixed bottom-20 left-4 z-50">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setMinimized(false)}
                                            className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-lg"
                                        >
                                            <Info className="text-amber-500" size={20} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="text-sm">
                                        <p>Reopen booking reminder</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
