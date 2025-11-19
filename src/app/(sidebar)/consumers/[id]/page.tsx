"use server"

import UpstreamDetails from "@/components/upstream-details"
import axios from "axios";
import { toast } from "sonner";

export default async function Page(context: any) {
    let details = null;
    try {

    const params = await context.params
    const { data } = await axios.get(`http://localhost:9999/upstreams/${params.id}`, {
        headers: {
            Authorization: `Bearer ${"123"}`
        }
    });

    details = data
    } catch (e) {
        toast.error("Failed to get upstream")
    }

    return <UpstreamDetails details={details}/>
}
