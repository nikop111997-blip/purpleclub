import AboutRunClub from "@/component/AboutRunClub";
import ChillZone from "@/component/ChillZone";
import FaqSection from "@/component/FAQ";
import Home from "@/component/Gallery";
import HomePage from "@/component/Homepage";
import ScrollExperience from "@/component/Kamp";
import OneSundaySection from "@/component/Onesundaysection";
import ScrollBoxes from "@/component/ScrollBoxes";
import ScrollSlider from "@/component/Scrollslider";
import TestimonialSection from "@/component/Testimonial";
import VideoScrollSection from "@/component/VideoScrollSection";
import { auth } from "@/lib/auth";

export default async function Page(){
  const session =  await auth()
  return(
    <>
    <HomePage session={session}/>
    
    <AboutRunClub />
    <ScrollBoxes session={session}/>
    <OneSundaySection/>
    <Home/>
    
    <FaqSection session={session}/>
    </>
  )
}