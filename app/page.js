import AboutRunClub from "@/component/AboutRunClub";
import ChillZone from "@/component/ChillZone";
import HomePage from "@/component/Homepage";
import ScrollExperience from "@/component/Kamp";
import ScrollBoxes from "@/component/ScrollBoxes";
import TestimonialSection from "@/component/Testimonial";
import VideoScrollSection from "@/component/VideoScrollSection";

export default function Page(){
  return(
    <>
    <HomePage/>
    <AboutRunClub />
    <ScrollBoxes/>
    <ChillZone/>
    <ScrollExperience/>
    <VideoScrollSection/>
    <TestimonialSection/>
    </>
  )
}