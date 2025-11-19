"use server"

import RouteDetails from "@/components/route-details";
import axios from "axios";
import { toast } from "sonner";

export default async function Page(context: any) {
    let details = null;
    try {

    const params = await context.params
    const { data } = await axios.get(`http://localhost:9999/routes/${params.id}`, {
        headers: {
            Authorization: `Bearer ${"123"}`
        }
    });

    details = data
    } catch (e) {
        toast.error("Failed to get upstream")
    }

    return <RouteDetails details={details}/>
}
