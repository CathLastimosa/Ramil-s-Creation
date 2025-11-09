import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CircleCheckIcon } from "lucide-react"

export default function Confirmation({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <CircleCheckIcon className="text-emerald-500 mb-2" size={32} />
          <DialogTitle>Thank you for booking!</DialogTitle>
          <DialogDescription>
            Your booking has been set successfully.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={() => router.visit("/")}>Proceed to Home</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
