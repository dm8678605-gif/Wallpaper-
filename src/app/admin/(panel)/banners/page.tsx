"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="banners" title="Banner Manager" description="Hero and promotional banners." fields={[
 {key:"title",label:"Title",required:true},{key:"subtitle",label:"Subtitle"},
 {key:"image",label:"Image",type:"image",required:true},{key:"link",label:"Link"},{key:"linkLabel",label:"Link Label"},
 {key:"placement",label:"Placement",type:"select",options:[{value:"hero",label:"Hero"},{value:"promo",label:"Promo"},{value:"category",label:"Category"},{value:"collection",label:"Collection"},{value:"homepage-section",label:"Homepage Section"}]},
 {key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"},{key:"active",label:"Active",type:"boolean"},
 {key:"mobileImage",label:"Mobile Image",type:"image"},{key:"autoplay",label:"Autoplay",type:"boolean"},
 {key:"intervalSec",label:"Autoplay Interval (sec)",type:"number"},{key:"transition",label:"Transition",type:"select",options:[{value:"fade",label:"Fade"},{value:"slide",label:"Slide"}]},
 {key:"showArrows",label:"Show Arrows",type:"boolean"},{key:"showDots",label:"Show Dots",type:"boolean"},
 {key:"textPosition",label:"Text Position",type:"select",options:[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"}]},
 {key:"overlayOpacity",label:"Overlay Opacity (0-100)",type:"number"}
]} columns={[{key:"title",label:"Title"},{key:"placement",label:"Placement"},{key:"active",label:"Active",render:(r: Record<string, unknown>)=>r.active?"Yes":"No"},{key:"published",label:"Published",render:(r: Record<string, unknown>)=>r.published?"Yes":"No"}]}  />;
}
