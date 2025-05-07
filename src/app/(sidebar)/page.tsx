import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";

export default function Home() {
    return (
        <>
            <SiteHeader title="Home" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                    <CardDescription>Console UI</CardDescription>
                                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                        1.0.0
                                    </CardTitle>
                                    <div className="absolute right-4 top-4">
                                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                            <TrendingUpIcon className="size-3" />
                                            Running
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                    <div className="line-clamp-1 flex gap-2 font-medium">
                                        Uptime
                                    </div>
                                    <div className="text-muted-foreground">
                                        1 hour
                                    </div>
                                </CardFooter>
                            </Card>
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                    <CardDescription>Console UI</CardDescription>
                                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                        1.0.0
                                    </CardTitle>
                                    <div className="absolute right-4 top-4">
                                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                            <TrendingUpIcon className="size-3" />
                                            Running
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                    <div className="line-clamp-1 flex gap-2 font-medium">
                                        Uptime
                                    </div>
                                    <div className="text-muted-foreground">
                                        1 hour
                                    </div>
                                </CardFooter>
                            </Card>
                            <Card className="@container/card">
                                <CardHeader className="relative">
                                    <CardDescription>Console UI</CardDescription>
                                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                        1.0.0
                                    </CardTitle>
                                    <div className="absolute right-4 top-4">
                                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                            <TrendingUpIcon className="size-3" />
                                            Running
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex-col items-start gap-1 text-sm">
                                    <div className="line-clamp-1 flex gap-2 font-medium">
                                        Uptime
                                    </div>
                                    <div className="text-muted-foreground">
                                        1 hour
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
                        // <DataTable data={data} />
