import { Trash } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { useAuthenticators } from "~/app/very-secure-page/@authenticators/_context/authenticators-context";
import Button from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/client";

export type Props = {
    credentialId: string;
};

function RemoveAuthenticationMethod({ credentialId }: Props) {
    const { authenticators, refetchAuthenticators } = useAuthenticators();

    const { mutate, isPending } = api.authenticators.removeAuthenticator.useMutation({
        onSuccess: ({ success }) => {
            if (success) {
                toast.success("Authenticator verwijderd");
                refetchAuthenticators();
            } else {
                toast.error("Er liep iets mis, probeer het later opnieuw");
            }
        },
        onError: (err) => {
            console.error(err);
            toast.error("Er liep iets mis, probeer het later opnieuw");
        },
    });

    const removeAuthenticator = useCallback(() => {
        mutate(credentialId);
    }, [mutate, credentialId]);

    // Prevent removing final authenticator
    if (authenticators.length === 1) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                    <Trash className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verwijder authenticator</DialogTitle>
                </DialogHeader>
                <p>
                    Ben je zeker dat je deze authenticator wil verwijderen? Deze oepratie kan niet ongedaan gemaakt
                    worden!
                </p>
                <DialogFooter>
                    <LoadingButton
                        variant="destructive"
                        type="button"
                        isLoading={isPending}
                        onClick={removeAuthenticator}
                        className="text-white"
                    >
                        Ja, verwijder
                    </LoadingButton>
                    <DialogClose asChild>
                        <Button type="button" disabled={isPending}>
                            Annuleren
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default memo(RemoveAuthenticationMethod);
