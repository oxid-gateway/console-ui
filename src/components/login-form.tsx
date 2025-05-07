import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Login with a OAuth Provider
                </p>
            </div>
            <div className="grid gap-6">
                <Button type="submit" className="w-full">
                    Login
                </Button>
            </div>
        </form>
    )
}
